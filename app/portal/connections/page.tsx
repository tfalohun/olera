"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useAuth } from "@/components/auth/AuthProvider";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import { canEngage } from "@/lib/membership";
import type { Connection, ConnectionStatus, Profile } from "@/lib/types";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import EmptyState from "@/components/ui/EmptyState";
import UpgradePrompt from "@/components/providers/UpgradePrompt";

interface ConnectionWithProfile extends Connection {
  fromProfile: Profile | null;
  toProfile: Profile | null;
}

// ── Parse connection.message JSON ──
function parseMessage(message: string | null): {
  careRecipient?: string;
  careType?: string;
  urgency?: string;
  notes?: string;
} | null {
  if (!message) return null;
  try {
    const p = JSON.parse(message);
    return {
      careRecipient: p.care_recipient
        ? String(p.care_recipient).replace(/_/g, " ").replace(/\b\w/g, (c: string) => c.toUpperCase())
        : undefined,
      careType: p.care_type
        ? String(p.care_type).replace(/_/g, " ").replace(/\b\w/g, (c: string) => c.toUpperCase())
        : undefined,
      urgency: p.urgency
        ? String(p.urgency).replace(/_/g, " ").replace(/\b\w/g, (c: string) => c.toUpperCase())
        : undefined,
      notes: p.additional_notes || undefined,
    };
  } catch {
    return null;
  }
}

// ── Deterministic gradient for fallback avatars ──
function avatarGradient(name: string): string {
  const gradients = [
    "linear-gradient(135deg, #0ea5e9, #6366f1)",
    "linear-gradient(135deg, #14b8a6, #0ea5e9)",
    "linear-gradient(135deg, #8b5cf6, #ec4899)",
    "linear-gradient(135deg, #f59e0b, #ef4444)",
    "linear-gradient(135deg, #10b981, #14b8a6)",
    "linear-gradient(135deg, #6366f1, #a855f7)",
    "linear-gradient(135deg, #ec4899, #f43f5e)",
    "linear-gradient(135deg, #0891b2, #2dd4bf)",
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return gradients[Math.abs(hash) % gradients.length];
}

function blurName(name: string): string {
  if (!name) return "***";
  return name.split(" ").map((p) => p.charAt(0) + "***").join(" ");
}

export default function ConnectionsPage() {
  const { activeProfile, membership } = useAuth();
  const [connections, setConnections] = useState<ConnectionWithProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [responding, setResponding] = useState(false);

  const isProvider =
    activeProfile?.type === "organization" ||
    activeProfile?.type === "caregiver";

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
      const cols =
        "id, type, status, from_profile_id, to_profile_id, message, created_at, updated_at";

      const [inboundRes, outboundRes] = await Promise.all([
        supabase
          .from("connections")
          .select(cols)
          .eq("to_profile_id", activeProfile.id)
          .neq("type", "save")
          .order("created_at", { ascending: false }),
        supabase
          .from("connections")
          .select(cols)
          .eq("from_profile_id", activeProfile.id)
          .neq("type", "save")
          .order("created_at", { ascending: false }),
      ]);

      if (inboundRes.error) throw new Error(inboundRes.error.message);
      if (outboundRes.error) throw new Error(outboundRes.error.message);

      const seen = new Set<string>();
      const connectionData: Connection[] = [];
      for (const c of [
        ...(inboundRes.data || []),
        ...(outboundRes.data || []),
      ] as Connection[]) {
        if (!seen.has(c.id)) {
          seen.add(c.id);
          connectionData.push(c);
        }
      }
      connectionData.sort((a, b) => b.created_at.localeCompare(a.created_at));

      const profileIds = new Set<string>();
      connectionData.forEach((c) => {
        profileIds.add(c.from_profile_id);
        profileIds.add(c.to_profile_id);
      });

      let profiles: Profile[] = [];
      if (profileIds.size > 0) {
        const { data: profileData } = await supabase
          .from("business_profiles")
          .select(
            "id, display_name, description, image_url, city, state, type, email, phone, website, slug, care_types, category, source_provider_id"
          )
          .in("id", Array.from(profileIds));
        profiles = (profileData as Profile[]) || [];

        const missingImageIds = profiles
          .filter((p) => !p.image_url && p.source_provider_id)
          .map((p) => p.source_provider_id as string);

        if (missingImageIds.length > 0) {
          const { data: iosProviders } = await supabase
            .from("olera-providers")
            .select("provider_id, provider_logo, provider_images")
            .in("provider_id", missingImageIds);

          if (iosProviders?.length) {
            const iosMap = new Map(
              iosProviders.map((p: { provider_id: string; provider_logo: string | null; provider_images: string | null }) => [
                p.provider_id,
                p.provider_logo || (p.provider_images?.split(" | ")[0]) || null,
              ])
            );
            profiles = profiles.map((p) => {
              if (!p.image_url && p.source_provider_id && iosMap.has(p.source_provider_id)) {
                return { ...p, image_url: iosMap.get(p.source_provider_id) || null };
              }
              return p;
            });
          }
        }
      }

      const profileMap = new Map(profiles.map((p) => [p.id, p]));
      const enriched: ConnectionWithProfile[] = connectionData.map((c) => ({
        ...c,
        fromProfile: profileMap.get(c.from_profile_id) || null,
        toProfile: profileMap.get(c.to_profile_id) || null,
      }));

      setConnections(enriched);
    } catch (err: unknown) {
      console.error("[olera] fetchConnections failed:", err);
      const msg =
        err && typeof err === "object" && "message" in err
          ? (err as { message: string }).message
          : String(err);
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [activeProfile]);

  useEffect(() => {
    fetchConnections();
  }, [fetchConnections]);

  // ── Group connections ──
  const grouped = groupConnections(connections, activeProfile?.id || "", isProvider);

  const handleStatusUpdate = async (
    connectionId: string,
    newStatus: "accepted" | "declined" | "archived"
  ) => {
    if (!isSupabaseConfigured() || !activeProfile) return;
    setResponding(true);
    try {
      const supabase = createClient();
      const { error: updateError } = await supabase
        .from("connections")
        .update({ status: newStatus })
        .eq("id", connectionId);
      if (updateError) throw new Error(updateError.message);
      setConnections((prev) =>
        prev.map((c) => (c.id === connectionId ? { ...c, status: newStatus } : c))
      );
    } catch (err: unknown) {
      const msg =
        err && typeof err === "object" && "message" in err
          ? (err as { message: string }).message
          : String(err);
      setError(msg);
    } finally {
      setResponding(false);
    }
  };

  const selectedConnection = connections.find((c) => c.id === selectedId) || null;

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
      <div className="mb-6">
        <p className="text-lg text-gray-600">
          {isProvider
            ? "Manage inquiries, invitations, and applications."
            : "Your connections with care providers."}
        </p>
      </div>

      {error && (
        <div
          className="mb-6 bg-red-50 text-red-700 px-4 py-3 rounded-lg text-base flex items-center justify-between"
          role="alert"
        >
          <span>{error}</span>
          <button
            type="button"
            onClick={() => { setError(""); setLoading(true); fetchConnections(); }}
            className="text-sm font-medium text-red-700 hover:text-red-800 underline ml-4"
          >
            Retry
          </button>
        </div>
      )}

      {connections.length === 0 ? (
        <EmptyState
          title="No connections yet"
          description={
            isProvider
              ? "When families or caregivers reach out, their connections will appear here."
              : "Browse providers and connect to get started."
          }
          action={
            !isProvider ? (
              <Link href="/browse">
                <Button>Browse Providers</Button>
              </Link>
            ) : undefined
          }
        />
      ) : (
        <div className="flex gap-0 lg:gap-0">
          {/* ── Left: Connection List ── */}
          <div
            className={`w-full lg:w-[360px] lg:shrink-0 ${
              selectedId ? "hidden lg:block" : ""
            }`}
          >
            {grouped.needsAttention.length > 0 && (
              <ConnectionGroup
                title="Needs Attention"
                icon={
                  <svg className="w-4 h-4 text-amber-500" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6z" />
                    <path d="M10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
                  </svg>
                }
                connections={grouped.needsAttention}
                activeProfileId={activeProfile?.id || ""}
                isProvider={isProvider}
                hasFullAccess={hasFullAccess}
                selectedId={selectedId}
                onSelect={setSelectedId}
                variant="attention"
              />
            )}

            {grouped.active.length > 0 && (
              <ConnectionGroup
                title="Active"
                connections={grouped.active}
                activeProfileId={activeProfile?.id || ""}
                isProvider={isProvider}
                hasFullAccess={hasFullAccess}
                selectedId={selectedId}
                onSelect={setSelectedId}
              />
            )}

            {grouped.past.length > 0 && (
              <ConnectionGroup
                title="Past"
                connections={grouped.past}
                activeProfileId={activeProfile?.id || ""}
                isProvider={isProvider}
                hasFullAccess={hasFullAccess}
                selectedId={selectedId}
                onSelect={setSelectedId}
                variant="muted"
              />
            )}

            {isProvider && !hasFullAccess && connections.length > 0 && (
              <div className="mt-6">
                <UpgradePrompt context="view full details and respond to connections" />
              </div>
            )}
          </div>

          {/* ── Right: Detail Panel ── */}
          <div
            className={`flex-1 min-w-0 ${
              selectedId
                ? "block"
                : "hidden lg:flex lg:items-center lg:justify-center"
            } lg:border-l lg:border-gray-200 lg:ml-6 lg:pl-6`}
          >
            {selectedConnection ? (
              <DetailPanel
                connection={selectedConnection}
                activeProfileId={activeProfile?.id || ""}
                isProvider={isProvider}
                hasFullAccess={hasFullAccess}
                responding={responding}
                onStatusUpdate={handleStatusUpdate}
                onBack={() => setSelectedId(null)}
              />
            ) : (
              <div className="text-center py-16 text-gray-400">
                <svg className="w-12 h-12 mx-auto mb-3 text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                <p className="text-sm font-medium">Select a connection to view details</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Grouping Logic ──

function groupConnections(
  connections: ConnectionWithProfile[],
  activeProfileId: string,
  isProvider: boolean
): {
  needsAttention: ConnectionWithProfile[];
  active: ConnectionWithProfile[];
  past: ConnectionWithProfile[];
} {
  const needsAttention: ConnectionWithProfile[] = [];
  const active: ConnectionWithProfile[] = [];
  const past: ConnectionWithProfile[] = [];

  for (const c of connections) {
    if (c.status === "declined" || c.status === "archived") {
      past.push(c);
    } else if (isProvider) {
      // Provider: new pending inbound = needs attention, accepted = active
      const isInbound = c.to_profile_id === activeProfileId;
      if (c.status === "pending" && isInbound) {
        needsAttention.push(c);
      } else {
        active.push(c);
      }
    } else {
      // Care seeker: accepted (provider responded) = needs attention, pending = active
      if (c.status === "accepted") {
        needsAttention.push(c);
      } else {
        active.push(c);
      }
    }
  }

  return { needsAttention, active, past };
}

// ── Connection Group ──

function ConnectionGroup({
  title,
  icon,
  connections,
  activeProfileId,
  isProvider,
  hasFullAccess,
  selectedId,
  onSelect,
  variant = "normal",
}: {
  title: string;
  icon?: React.ReactNode;
  connections: ConnectionWithProfile[];
  activeProfileId: string;
  isProvider: boolean;
  hasFullAccess: boolean;
  selectedId: string | null;
  onSelect: (id: string) => void;
  variant?: "normal" | "attention" | "muted";
}) {
  return (
    <div className="mb-5">
      <div className="flex items-center gap-2 mb-2 px-1">
        {icon}
        <h3 className={`text-xs font-semibold uppercase tracking-wider ${
          variant === "muted" ? "text-gray-400" : "text-gray-500"
        }`}>
          {title}
        </h3>
        <span className="text-xs text-gray-400">({connections.length})</span>
      </div>
      <div className="space-y-1">
        {connections.map((connection) => (
          <ConnectionCard
            key={connection.id}
            connection={connection}
            activeProfileId={activeProfileId}
            isProvider={isProvider}
            hasFullAccess={hasFullAccess}
            isSelected={selectedId === connection.id}
            onSelect={onSelect}
            variant={variant}
          />
        ))}
      </div>
    </div>
  );
}

// ── Connection Card ──

function ConnectionCard({
  connection,
  activeProfileId,
  isProvider,
  hasFullAccess,
  isSelected,
  onSelect,
  variant,
}: {
  connection: ConnectionWithProfile;
  activeProfileId: string;
  isProvider: boolean;
  hasFullAccess: boolean;
  isSelected: boolean;
  onSelect: (id: string) => void;
  variant: "normal" | "attention" | "muted";
}) {
  const isInbound = connection.to_profile_id === activeProfileId;
  const otherProfile = isInbound ? connection.fromProfile : connection.toProfile;
  const otherName = otherProfile?.display_name || "Unknown";
  const otherLocation = [otherProfile?.city, otherProfile?.state]
    .filter(Boolean)
    .join(", ");

  const parsedMsg = parseMessage(connection.message);
  const careTypeLabel = parsedMsg?.careType || connection.type.replace(/_/g, " ").replace(/\b\w/g, (c: string) => c.toUpperCase());

  const statusBadge: Record<string, { variant: "default" | "pending" | "verified" | "trial"; label: string }> = {
    pending: { variant: "pending", label: "Pending" },
    accepted: { variant: "verified", label: "Responded" },
    declined: { variant: "default", label: "Declined" },
    archived: { variant: "default", label: "Archived" },
  };
  const badge = statusBadge[connection.status] || statusBadge.pending;

  const createdAt = new Date(connection.created_at).toLocaleDateString(
    "en-US",
    { month: "short", day: "numeric" }
  );

  const shouldBlur = isProvider && !hasFullAccess && isInbound;
  const imageUrl = otherProfile?.image_url;
  const initial = otherName.charAt(0).toUpperCase();

  return (
    <div
      className={`rounded-lg border transition-colors group ${
        isSelected
          ? "border-primary-200 bg-primary-50/40"
          : variant === "attention"
          ? "border-amber-100 bg-amber-50/30 hover:bg-amber-50/60"
          : variant === "muted"
          ? "border-gray-100 bg-gray-50/50 hover:bg-gray-50"
          : "border-gray-100 bg-white hover:bg-gray-50"
      }`}
    >
      <button
        type="button"
        onClick={() => onSelect(connection.id)}
        className="block w-full text-left px-3.5 py-2.5 cursor-pointer bg-transparent border-none"
      >
        <div className="flex items-center gap-3">
          {/* Avatar */}
          <div className="shrink-0">
            {imageUrl && !shouldBlur ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={imageUrl}
                alt={otherName}
                className="w-9 h-9 rounded-lg object-cover"
              />
            ) : (
              <div
                className="w-9 h-9 rounded-lg flex items-center justify-center text-sm font-bold text-white"
                style={{ background: shouldBlur ? "#9ca3af" : avatarGradient(otherName) }}
              >
                {shouldBlur ? "?" : initial}
              </div>
            )}
          </div>

          {/* Content */}
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 min-w-0">
                {variant === "attention" && (
                  <svg className="w-3.5 h-3.5 text-amber-500 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6z" />
                  </svg>
                )}
                <h3 className="text-sm font-semibold text-gray-900 truncate leading-snug">
                  {shouldBlur ? blurName(otherName) : otherName}
                </h3>
              </div>
              <Badge variant={badge.variant} className="!text-xs !px-2 !py-0.5 shrink-0">
                {badge.label}
              </Badge>
            </div>
            <p className="text-xs text-gray-400 truncate mt-0.5">
              {careTypeLabel} &middot; {createdAt}
              {!shouldBlur && otherLocation ? ` \u00b7 ${otherLocation}` : ""}
            </p>
          </div>

          {/* Chevron */}
          <svg className="w-4 h-4 text-gray-300 shrink-0 group-hover:text-gray-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </button>
    </div>
  );
}

// ── Detail Panel ──

function DetailPanel({
  connection,
  activeProfileId,
  isProvider,
  hasFullAccess,
  responding,
  onStatusUpdate,
  onBack,
}: {
  connection: ConnectionWithProfile;
  activeProfileId: string;
  isProvider: boolean;
  hasFullAccess: boolean;
  responding: boolean;
  onStatusUpdate: (id: string, status: "accepted" | "declined" | "archived") => void;
  onBack: () => void;
}) {
  const isInbound = connection.to_profile_id === activeProfileId;
  const otherProfile = isInbound ? connection.fromProfile : connection.toProfile;
  const shouldBlur = isProvider && !hasFullAccess && isInbound;

  const otherName = otherProfile?.display_name || "Unknown";
  const otherLocation = otherProfile
    ? [otherProfile.city, otherProfile.state].filter(Boolean).join(", ")
    : "";
  const imageUrl = otherProfile?.image_url;
  const initial = otherName.charAt(0).toUpperCase();
  const parsedMsg = parseMessage(connection.message);

  const categoryLabel = otherProfile?.category
    ? otherProfile.category.replace(/_/g, " ").replace(/\b\w/g, (c: string) => c.toUpperCase())
    : otherProfile?.type === "organization"
    ? "Organization"
    : otherProfile?.type === "caregiver"
    ? "Caregiver"
    : "Family";

  const profileHref = otherProfile
    ? (otherProfile.type === "organization" || otherProfile.type === "caregiver") && otherProfile.slug
      ? `/provider/${otherProfile.slug}`
      : `/profile/${otherProfile.id}`
    : "#";

  const createdDate = new Date(connection.created_at).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
  const shortDate = new Date(connection.created_at).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });

  const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; dot: string }> = {
    pending: { label: "Pending", color: "text-amber-700", bg: "bg-amber-50", dot: "bg-amber-400" },
    accepted: { label: "Connected", color: "text-emerald-700", bg: "bg-emerald-50", dot: "bg-emerald-400" },
    declined: { label: "Declined", color: "text-gray-500", bg: "bg-gray-100", dot: "bg-gray-400" },
    archived: { label: "Archived", color: "text-gray-500", bg: "bg-gray-100", dot: "bg-gray-400" },
  };
  const status = STATUS_CONFIG[connection.status] || STATUS_CONFIG.pending;

  // Build natural language summary for chat bubble
  const buildSummary = () => {
    if (!parsedMsg) return null;
    const parts: string[] = [];
    if (parsedMsg.careType) {
      parts.push(`I'm looking for ${parsedMsg.careType.toLowerCase()}`);
    }
    if (parsedMsg.careRecipient) {
      parts.push(`for ${parsedMsg.careRecipient.toLowerCase()}`);
    }
    if (parsedMsg.urgency) {
      parts.push(`needed ${parsedMsg.urgency.toLowerCase()}`);
    }
    return parts.length > 0
      ? `Hi, ${parts.join(" ")}.`
      : null;
  };

  const summary = buildSummary();

  return (
    <div className="w-full">
      {/* Mobile back button */}
      <button
        type="button"
        onClick={onBack}
        className="lg:hidden flex items-center gap-1.5 text-sm font-medium text-gray-600 hover:text-gray-900 mb-4 transition-colors"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to connections
      </button>

      {/* ── Provider Info ── */}
      <div className="flex items-start gap-4 mb-5">
        <div className="shrink-0">
          {imageUrl && !shouldBlur ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={imageUrl}
              alt={otherName}
              className="w-14 h-14 rounded-xl object-cover"
            />
          ) : (
            <div
              className="w-14 h-14 rounded-xl flex items-center justify-center text-lg font-bold text-white"
              style={{ background: shouldBlur ? "#9ca3af" : avatarGradient(otherName) }}
            >
              {shouldBlur ? "?" : initial}
            </div>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="text-lg font-bold text-gray-900 leading-snug">
            {shouldBlur ? blurName(otherName) : otherName}
          </h2>
          {!shouldBlur && otherLocation && (
            <p className="text-sm text-gray-500 mt-0.5">{otherLocation}</p>
          )}
          {!shouldBlur && (
            <p className="text-xs text-gray-400 mt-0.5">{categoryLabel}</p>
          )}
          {otherProfile && !shouldBlur && (
            <Link
              href={profileHref}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-sm font-medium text-primary-600 hover:text-primary-700 transition-colors mt-1"
            >
              View provider profile
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </Link>
          )}
        </div>
      </div>

      {/* Status badge */}
      <div className="mb-5">
        <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full ${status.bg} ${status.color}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
          {status.label}
        </span>
      </div>

      {/* ── Conversation Thread ── */}
      <div className="border-t border-gray-100 pt-5">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">
          Conversation
        </p>

        <div className="space-y-4">
          {/* Connection request bubble (care seeker's message) */}
          {!shouldBlur && (
            <div className={`flex ${isInbound ? "justify-start" : "justify-end"}`}>
              <div className={`max-w-[85%] ${isInbound ? "" : ""}`}>
                <div className={`rounded-2xl px-4 py-3 ${
                  isInbound
                    ? "bg-gray-100 text-gray-800 rounded-tl-sm"
                    : "bg-primary-600 text-white rounded-tr-sm"
                }`}>
                  <p className={`text-[10px] font-semibold uppercase tracking-wider mb-1.5 ${
                    isInbound ? "text-gray-400" : "text-primary-100"
                  }`}>
                    Connection request
                  </p>
                  {summary && (
                    <p className="text-sm leading-relaxed">{summary}</p>
                  )}
                  {parsedMsg?.notes && (
                    <p className={`text-sm italic mt-1.5 ${
                      isInbound ? "text-gray-600" : "text-primary-100"
                    }`}>
                      &ldquo;{parsedMsg.notes}&rdquo;
                    </p>
                  )}
                </div>
                <p className={`text-[10px] mt-1 ${
                  isInbound ? "text-left" : "text-right"
                } text-gray-400`}>
                  {shortDate}
                </p>
              </div>
            </div>
          )}

          {/* System notes based on status */}
          <SystemNote
            connection={connection}
            otherName={shouldBlur ? blurName(otherName) : otherName}
            createdDate={createdDate}
            shouldBlur={shouldBlur}
          />

          {/* Provider responded message (if accepted) */}
          {connection.status === "accepted" && !shouldBlur && otherProfile && isInbound && (
            <div className="flex justify-start">
              <div className="max-w-[85%]">
                <div className="bg-gray-100 text-gray-800 rounded-2xl rounded-tl-sm px-4 py-3">
                  <p className="text-sm leading-relaxed">
                    {otherName} has accepted your connection request. You can now get in touch directly.
                  </p>
                </div>
              </div>
            </div>
          )}
          {connection.status === "accepted" && !shouldBlur && otherProfile && !isInbound && (
            <div className="flex justify-end">
              <div className="max-w-[85%]">
                <div className="bg-primary-600 text-white rounded-2xl rounded-tr-sm px-4 py-3">
                  <p className="text-sm leading-relaxed">
                    You accepted this connection. Reach out to start the conversation.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Message Input (placeholder) ── */}
      {(connection.status === "pending" || connection.status === "accepted") && !shouldBlur && (
        <div className="mt-5 pt-4 border-t border-gray-100">
          <div className="flex gap-2">
            <div className="flex-1 bg-gray-100 rounded-xl px-4 py-3 text-sm text-gray-400 cursor-not-allowed">
              {connection.status === "accepted"
                ? "Reply to provider..."
                : "Add a message..."}
            </div>
            <button
              type="button"
              disabled
              className="px-4 py-3 rounded-xl bg-gray-100 text-gray-300 text-sm font-medium cursor-not-allowed"
            >
              Send
            </button>
          </div>
          <p className="text-[10px] text-gray-400 mt-1.5 text-center">
            Messaging coming soon
          </p>
        </div>
      )}

      {/* ── Upgrade Prompt (blurred) ── */}
      {shouldBlur && (
        <div className="mt-5">
          <UpgradePrompt context="view full details and respond" />
        </div>
      )}

      {/* ── Provider Actions: Pending Inbound ── */}
      {isInbound && hasFullAccess && connection.status === "pending" && (
        <div className="mt-5 pt-4 border-t border-gray-100 flex gap-3">
          <Button
            onClick={() => onStatusUpdate(connection.id, "accepted")}
            loading={responding}
            className="flex-1"
          >
            Accept
          </Button>
          <Button
            variant="secondary"
            onClick={() => onStatusUpdate(connection.id, "declined")}
            loading={responding}
            className="flex-1"
          >
            Decline
          </Button>
        </div>
      )}

      {/* ── Get in Touch: Accepted ── */}
      {connection.status === "accepted" && otherProfile && !shouldBlur && (
        <div className="mt-5 pt-4 border-t border-gray-100">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
            Get in touch
          </p>
          <div className="flex flex-wrap gap-2">
            {otherProfile.phone && (
              <a
                href={`tel:${otherProfile.phone}`}
                className="inline-flex items-center gap-1.5 bg-primary-600 text-white text-sm font-medium px-4 py-2.5 rounded-xl hover:bg-primary-700 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                {otherProfile.phone}
              </a>
            )}
            {otherProfile.email && (
              <a
                href={`mailto:${otherProfile.email}?subject=${encodeURIComponent(`Scheduling a visit \u2014 ${otherProfile.display_name}`)}`}
                className="inline-flex items-center gap-1.5 text-gray-700 text-sm font-medium px-4 py-2.5 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                Email
              </a>
            )}
          </div>
        </div>
      )}

      {/* ── Declined Action ── */}
      {connection.status === "declined" && !shouldBlur && (
        <div className="mt-5 pt-4 border-t border-gray-100">
          <Link
            href="/browse"
            className="text-sm font-medium text-primary-600 hover:text-primary-700 transition-colors"
          >
            Browse similar providers &rarr;
          </Link>
        </div>
      )}
    </div>
  );
}

// ── System Notes ──

function SystemNote({
  connection,
  otherName,
  createdDate,
  shouldBlur,
}: {
  connection: ConnectionWithProfile;
  otherName: string;
  createdDate: string;
  shouldBlur: boolean;
}) {
  let text: string | null = null;
  let color = "text-gray-500 bg-gray-100";

  switch (connection.status) {
    case "pending":
      text = "Sent \u00b7 Providers typically respond within a few hours";
      break;
    case "accepted":
      text = shouldBlur ? "Provider responded" : `\u2713 ${otherName} responded`;
      color = "text-emerald-700 bg-emerald-50";
      break;
    case "declined":
      text = shouldBlur ? "Provider isn't taking new clients" : `${otherName} isn't taking new clients`;
      color = "text-gray-500 bg-gray-100";
      break;
    case "archived":
      text = `Connection archived on ${createdDate}`;
      break;
  }

  if (!text) return null;

  return (
    <div className="flex justify-center">
      <span className={`text-xs font-medium px-3 py-1.5 rounded-full ${color}`}>
        {text}
      </span>
    </div>
  );
}
