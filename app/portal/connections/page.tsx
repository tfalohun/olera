"use client";

import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import { canEngage } from "@/lib/membership";
import type { Connection, Profile } from "@/lib/types";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import EmptyState from "@/components/ui/EmptyState";
import UpgradePrompt from "@/components/providers/UpgradePrompt";

interface ConnectionWithProfile extends Connection {
  fromProfile: Profile | null;
  toProfile: Profile | null;
}

export default function ConnectionsPage() {
  const { activeProfile, membership } = useAuth();
  const [connections, setConnections] = useState<ConnectionWithProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [responding, setResponding] = useState<string | null>(null);
  const [error, setError] = useState("");

  const isProvider =
    activeProfile?.type === "organization" ||
    activeProfile?.type === "caregiver";
  const isFamily = activeProfile?.type === "family";

  const hasFullAccess = canEngage(
    activeProfile?.type,
    membership,
    "view_inquiry_details"
  );

  const fetchConnections = useCallback(async () => {
    if (!activeProfile || !isSupabaseConfigured()) {
      setLoading(false);
      return;
    }

    try {
      const supabase = createClient();

      // Providers see inbound inquiries (to_profile_id = their profile)
      // Families see outbound inquiries (from_profile_id = their profile)
      const column = isProvider ? "to_profile_id" : "from_profile_id";
      const { data, error: fetchError } = await supabase
        .from("connections")
        .select("*")
        .eq(column, activeProfile.id)
        .eq("type", "inquiry")
        .order("created_at", { ascending: false });

      if (fetchError) throw new Error(fetchError.message);

      // Fetch associated profiles
      const connectionData = (data || []) as Connection[];
      const profileIds = new Set<string>();
      connectionData.forEach((c) => {
        profileIds.add(c.from_profile_id);
        profileIds.add(c.to_profile_id);
      });

      let profiles: Profile[] = [];
      if (profileIds.size > 0) {
        const { data: profileData } = await supabase
          .from("profiles")
          .select("*")
          .in("id", Array.from(profileIds));
        profiles = (profileData as Profile[]) || [];
      }

      const profileMap = new Map(profiles.map((p) => [p.id, p]));
      const enriched: ConnectionWithProfile[] = connectionData.map((c) => ({
        ...c,
        fromProfile: profileMap.get(c.from_profile_id) || null,
        toProfile: profileMap.get(c.to_profile_id) || null,
      }));

      setConnections(enriched);
    } catch (err: unknown) {
      const msg =
        err && typeof err === "object" && "message" in err
          ? (err as { message: string }).message
          : String(err);
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [activeProfile, isProvider]);

  useEffect(() => {
    fetchConnections();
  }, [fetchConnections]);

  const handleStatusUpdate = async (
    connectionId: string,
    newStatus: "accepted" | "declined" | "archived"
  ) => {
    if (!isSupabaseConfigured()) return;

    setResponding(connectionId);
    try {
      const supabase = createClient();
      const { error: updateError } = await supabase
        .from("connections")
        .update({ status: newStatus })
        .eq("id", connectionId);

      if (updateError) throw new Error(updateError.message);

      // Update local state
      setConnections((prev) =>
        prev.map((c) =>
          c.id === connectionId ? { ...c, status: newStatus } : c
        )
      );
    } catch (err: unknown) {
      const msg =
        err && typeof err === "object" && "message" in err
          ? (err as { message: string }).message
          : String(err);
      setError(msg);
    } finally {
      setResponding(null);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-16">
        <div className="animate-spin w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full mx-auto" />
        <p className="mt-4 text-gray-500">Loading connections...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Connections</h1>
        <p className="text-lg text-gray-600 mt-1">
          {isProvider
            ? "Inquiries from families looking for care."
            : "Your inquiries to care providers."}
        </p>
      </div>

      {error && (
        <div
          className="mb-6 bg-red-50 text-red-700 px-4 py-3 rounded-lg text-base"
          role="alert"
        >
          {error}
        </div>
      )}

      {connections.length === 0 ? (
        <EmptyState
          title={isProvider ? "No inquiries yet" : "No inquiries sent"}
          description={
            isProvider
              ? "When families reach out about your services, their inquiries will appear here."
              : "Browse providers and request a consultation to get started."
          }
        />
      ) : (
        <div className="space-y-4">
          {connections.map((connection) => (
            <ConnectionCard
              key={connection.id}
              connection={connection}
              isProvider={!!isProvider}
              hasFullAccess={hasFullAccess}
              responding={responding === connection.id}
              onStatusUpdate={handleStatusUpdate}
            />
          ))}
        </div>
      )}

      {/* Upgrade prompt for expired trial providers */}
      {isProvider && !hasFullAccess && connections.length > 0 && (
        <div className="mt-8">
          <UpgradePrompt context="view full inquiry details and respond to families" />
        </div>
      )}
    </div>
  );
}

function ConnectionCard({
  connection,
  isProvider,
  hasFullAccess,
  responding,
  onStatusUpdate,
}: {
  connection: ConnectionWithProfile;
  isProvider: boolean;
  hasFullAccess: boolean;
  responding: boolean;
  onStatusUpdate: (id: string, status: "accepted" | "declined" | "archived") => void;
}) {
  // Provider sees the family (from), Family sees the provider (to)
  const otherProfile = isProvider
    ? connection.fromProfile
    : connection.toProfile;
  const otherName = otherProfile?.display_name || "Unknown";
  const otherLocation = [otherProfile?.city, otherProfile?.state]
    .filter(Boolean)
    .join(", ");

  const statusBadge: Record<string, { variant: "default" | "pending" | "verified" | "trial"; label: string }> = {
    pending: { variant: "pending", label: "Pending" },
    accepted: { variant: "verified", label: "Accepted" },
    declined: { variant: "default", label: "Declined" },
    archived: { variant: "default", label: "Archived" },
  };

  const badge = statusBadge[connection.status] || statusBadge.pending;
  const createdAt = new Date(connection.created_at).toLocaleDateString(
    "en-US",
    { month: "short", day: "numeric", year: "numeric" }
  );

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-3 flex-wrap mb-1">
            <h3 className="text-lg font-semibold text-gray-900">
              {isProvider && !hasFullAccess ? blurName(otherName) : otherName}
            </h3>
            <Badge variant={badge.variant}>{badge.label}</Badge>
          </div>

          {otherLocation && (
            <p className="text-base text-gray-500 mb-2">
              {isProvider && !hasFullAccess ? "***" : otherLocation}
            </p>
          )}

          {/* Inquiry message */}
          {connection.message && (
            <div className="mt-3 bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-500 mb-1">Message:</p>
              <p className="text-base text-gray-700">
                {isProvider && !hasFullAccess
                  ? blurText(connection.message)
                  : connection.message}
              </p>
            </div>
          )}

          {/* Blurred overlay for non-paying providers */}
          {isProvider && !hasFullAccess && (
            <p className="mt-3 text-sm text-warm-600 font-medium">
              Upgrade to Pro to see full details and respond.
            </p>
          )}

          <p className="text-sm text-gray-400 mt-3">{createdAt}</p>
        </div>
      </div>

      {/* Action buttons for providers with access */}
      {isProvider && hasFullAccess && connection.status === "pending" && (
        <div className="mt-4 flex gap-3">
          <Button
            size="sm"
            onClick={() => onStatusUpdate(connection.id, "accepted")}
            loading={responding}
          >
            Accept
          </Button>
          <Button
            size="sm"
            variant="secondary"
            onClick={() => onStatusUpdate(connection.id, "declined")}
            loading={responding}
          >
            Decline
          </Button>
        </div>
      )}

      {/* Family: show status of their inquiry */}
      {!isProvider && connection.status === "accepted" && (
        <div className="mt-4 bg-primary-50 rounded-lg p-4">
          <p className="text-base text-primary-800 font-medium">
            {otherName} has accepted your inquiry!
          </p>
          {otherProfile?.phone && (
            <p className="text-base text-primary-700 mt-1">
              Phone: {otherProfile.phone}
            </p>
          )}
          {otherProfile?.email && (
            <p className="text-base text-primary-700 mt-1">
              Email: {otherProfile.email}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

/** Blur a name for non-paying providers: show first letter + asterisks */
function blurName(name: string): string {
  if (!name) return "***";
  const parts = name.split(" ");
  return parts.map((p) => p.charAt(0) + "***").join(" ");
}

/** Blur text for non-paying providers */
function blurText(text: string): string {
  if (!text) return "";
  // Show first 20 chars, blur the rest
  if (text.length <= 20) return "*".repeat(text.length);
  return text.substring(0, 20) + "...";
}
