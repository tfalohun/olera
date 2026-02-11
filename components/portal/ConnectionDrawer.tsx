"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import { canEngage } from "@/lib/membership";
import { useAuth } from "@/components/auth/AuthProvider";
import type { Connection, ConnectionStatus, Profile } from "@/lib/types";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import UpgradePrompt from "@/components/providers/UpgradePrompt";

interface ConnectionDetail extends Connection {
  fromProfile: Profile | null;
  toProfile: Profile | null;
}

interface ConnectionDrawerProps {
  connectionId: string | null;
  isOpen: boolean;
  onClose: () => void;
  onStatusChange?: (connectionId: string, newStatus: ConnectionStatus) => void;
}

/** Parse the connection message JSON for display */
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

export default function ConnectionDrawer({
  connectionId,
  isOpen,
  onClose,
  onStatusChange,
}: ConnectionDrawerProps) {
  const { activeProfile, membership } = useAuth();
  const panelRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);
  const [connection, setConnection] = useState<ConnectionDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [responding, setResponding] = useState(false);
  const [error, setError] = useState("");

  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  const isProvider =
    activeProfile?.type === "organization" ||
    activeProfile?.type === "caregiver";

  const hasFullAccess = canEngage(
    activeProfile?.type,
    membership,
    "view_inquiry_details"
  );

  useEffect(() => {
    setMounted(true);
  }, []);

  // Fetch connection data when opened
  useEffect(() => {
    if (!isOpen || !connectionId || !activeProfile || !isSupabaseConfigured()) {
      return;
    }

    setLoading(true);
    setError("");
    setConnection(null);

    const fetchConnection = async () => {
      const supabase = createClient();

      const { data, error: fetchError } = await supabase
        .from("connections")
        .select(
          "id, type, status, from_profile_id, to_profile_id, message, created_at, updated_at"
        )
        .eq("id", connectionId)
        .single();

      if (fetchError || !data) {
        setError("Connection not found.");
        setLoading(false);
        return;
      }

      const conn = data as Connection;

      if (
        conn.from_profile_id !== activeProfile.id &&
        conn.to_profile_id !== activeProfile.id
      ) {
        setError("Connection not found.");
        setLoading(false);
        return;
      }

      const profileIds = [conn.from_profile_id, conn.to_profile_id];
      const { data: profiles } = await supabase
        .from("business_profiles")
        .select(
          "id, display_name, description, image_url, city, state, type, email, phone, website, slug, care_types"
        )
        .in("id", profileIds);

      const profileMap = new Map(
        ((profiles as Profile[]) || []).map((p) => [p.id, p])
      );

      setConnection({
        ...conn,
        fromProfile: profileMap.get(conn.from_profile_id) || null,
        toProfile: profileMap.get(conn.to_profile_id) || null,
      });
      setLoading(false);
    };

    fetchConnection();
  }, [isOpen, connectionId, activeProfile]);

  // Keyboard & scroll lock
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === "Escape") onCloseRef.current();
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen, handleKeyDown]);

  // Scroll to top when connection changes
  useEffect(() => {
    if (isOpen && panelRef.current) {
      panelRef.current.scrollTop = 0;
    }
  }, [isOpen, connectionId]);

  const handleStatusUpdate = async (
    newStatus: "accepted" | "declined" | "archived"
  ) => {
    if (!isSupabaseConfigured() || !activeProfile || !connection) return;

    setResponding(true);
    try {
      const supabase = createClient();
      const { error: updateError } = await supabase
        .from("connections")
        .update({ status: newStatus })
        .eq("id", connection.id);

      if (updateError) throw new Error(updateError.message);
      setConnection((prev) =>
        prev ? { ...prev, status: newStatus } : null
      );
      onStatusChange?.(connection.id, newStatus);
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

  if (!mounted) return null;

  const isInbound = connection
    ? connection.to_profile_id === activeProfile?.id
    : false;
  const otherProfile = connection
    ? isInbound
      ? connection.fromProfile
      : connection.toProfile
    : null;
  const shouldBlur = isProvider && !hasFullAccess && isInbound;

  const statusBadge: Record<
    string,
    { variant: "default" | "pending" | "verified" | "trial"; label: string }
  > = {
    pending: { variant: "pending", label: "Pending" },
    accepted: { variant: "verified", label: "Accepted" },
    declined: { variant: "default", label: "Declined" },
    archived: { variant: "default", label: "Archived" },
  };

  const badge = connection
    ? statusBadge[connection.status] || statusBadge.pending
    : statusBadge.pending;

  const otherName = otherProfile?.display_name || "Unknown";
  const otherLocation = otherProfile
    ? [otherProfile.city, otherProfile.state].filter(Boolean).join(", ")
    : "";
  const imageUrl = otherProfile?.image_url;
  const initial = otherName.charAt(0).toUpperCase();
  const parsedMsg = connection ? parseMessage(connection.message) : null;

  const profileHref = otherProfile
    ? (otherProfile.type === "organization" || otherProfile.type === "caregiver") && otherProfile.slug
      ? `/provider/${otherProfile.slug}`
      : `/profile/${otherProfile.id}`
    : "#";

  const drawerContent = (
    <div
      className={`fixed inset-0 z-[60] transition-opacity duration-300 ${
        isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
      }`}
      role="dialog"
      aria-modal="true"
      aria-label="Connection details"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/20 backdrop-blur-[2px]"
        onClick={() => onCloseRef.current()}
      />

      {/* Slide-out drawer */}
      <div
        ref={panelRef}
        className={`absolute right-0 top-0 h-full w-full max-w-lg bg-white shadow-2xl overflow-y-auto transition-transform duration-300 ease-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white/95 backdrop-blur-sm border-b border-gray-100 px-6 py-4 flex items-center justify-between z-10">
          <h2 className="text-lg font-semibold text-gray-900">
            Connection Details
          </h2>
          <button
            onClick={() => onCloseRef.current()}
            className="w-9 h-9 flex items-center justify-center rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
            aria-label="Close"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-6">
          {loading && (
            <div className="text-center py-12">
              <div className="animate-spin w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full mx-auto" />
            </div>
          )}

          {error && (
            <div className="bg-red-50 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          {connection && !loading && (
            <>
              {/* Provider header */}
              <div className="flex items-start gap-4 mb-5">
                {imageUrl && !shouldBlur ? (
                  <img
                    src={imageUrl}
                    alt={otherName}
                    className="w-14 h-14 rounded-full object-cover shrink-0"
                  />
                ) : (
                  <div className="w-14 h-14 bg-primary-100 text-primary-700 rounded-full flex items-center justify-center text-xl font-bold shrink-0">
                    {shouldBlur ? "?" : initial}
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <h3 className="text-xl font-bold text-gray-900">
                      {shouldBlur ? blurName(otherName) : otherName}
                    </h3>
                    <Badge variant={badge.variant}>{badge.label}</Badge>
                  </div>
                  {otherLocation && !shouldBlur && (
                    <p className="text-sm text-gray-500">{otherLocation}</p>
                  )}
                  {otherProfile && (
                    <p className="text-xs text-gray-400 mt-0.5">
                      {otherProfile.type === "organization"
                        ? "Organization"
                        : otherProfile.type === "caregiver"
                        ? "Caregiver"
                        : "Family"}
                    </p>
                  )}
                </div>
              </div>

              {/* Status + date */}
              <div className="flex items-center gap-2 text-sm text-gray-500 mb-5">
                <span>
                  {connection.type === "inquiry"
                    ? "Inquiry"
                    : connection.type === "invitation"
                    ? "Invitation"
                    : "Application"}{" "}
                  {isInbound ? "received" : "sent"}
                </span>
                <span className="text-gray-300">&middot;</span>
                <span>
                  {new Date(connection.created_at).toLocaleDateString("en-US", {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                </span>
              </div>

              {/* Your request details */}
              {parsedMsg && !shouldBlur && (
                <div className="bg-gray-50 rounded-xl p-4 mb-5">
                  <p className="text-sm font-medium text-gray-700 mb-3">
                    {isInbound ? "Their request" : "Your request"}
                  </p>
                  <div className="space-y-2">
                    {parsedMsg.careRecipient && (
                      <div className="flex items-center gap-2 text-sm">
                        <span className="text-gray-400 w-24 shrink-0">
                          Who
                        </span>
                        <span className="text-gray-700">
                          {parsedMsg.careRecipient}
                        </span>
                      </div>
                    )}
                    {parsedMsg.careType && (
                      <div className="flex items-center gap-2 text-sm">
                        <span className="text-gray-400 w-24 shrink-0">
                          Care type
                        </span>
                        <span className="text-gray-700">
                          {parsedMsg.careType}
                        </span>
                      </div>
                    )}
                    {parsedMsg.urgency && (
                      <div className="flex items-center gap-2 text-sm">
                        <span className="text-gray-400 w-24 shrink-0">
                          Timeline
                        </span>
                        <span className="text-gray-700">
                          {parsedMsg.urgency}
                        </span>
                      </div>
                    )}
                    {parsedMsg.notes && (
                      <div className="flex items-start gap-2 text-sm pt-1">
                        <span className="text-gray-400 w-24 shrink-0">
                          Notes
                        </span>
                        <span className="text-gray-700">
                          {parsedMsg.notes}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Care types */}
              {otherProfile &&
                !shouldBlur &&
                otherProfile.care_types.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-5">
                    {otherProfile.care_types.map((type) => (
                      <span
                        key={type}
                        className="bg-primary-50 text-primary-700 text-xs px-3 py-1 rounded-full"
                      >
                        {type}
                      </span>
                    ))}
                  </div>
                )}

              {/* Action buttons */}
              {isInbound &&
                hasFullAccess &&
                connection.status === "pending" && (
                  <div className="flex gap-3 mb-5">
                    <Button
                      onClick={() => handleStatusUpdate("accepted")}
                      loading={responding}
                    >
                      Accept
                    </Button>
                    <Button
                      variant="secondary"
                      onClick={() => handleStatusUpdate("declined")}
                      loading={responding}
                    >
                      Decline
                    </Button>
                  </div>
                )}

              {/* Next steps for accepted */}
              {connection.status === "accepted" &&
                otherProfile &&
                !shouldBlur && (
                  <div className="bg-primary-50 rounded-xl p-5 mb-5">
                    <h3 className="text-sm font-semibold text-primary-900 mb-3">
                      Next Steps
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {otherProfile.email && (
                        <a
                          href={`mailto:${otherProfile.email}?subject=${encodeURIComponent(`Schedule a meeting — ${otherProfile.display_name}`)}`}
                          className="inline-flex items-center gap-1.5 bg-primary-600 text-white text-sm font-medium px-3 py-2 rounded-lg hover:bg-primary-700 transition-colors"
                        >
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                            />
                          </svg>
                          Schedule
                        </a>
                      )}
                      {otherProfile.phone && (
                        <a
                          href={`tel:${otherProfile.phone}`}
                          className="inline-flex items-center gap-1.5 text-primary-700 text-sm font-medium px-3 py-2 rounded-lg border border-primary-200 hover:bg-primary-100 transition-colors"
                        >
                          Call
                        </a>
                      )}
                      {otherProfile.email && (
                        <a
                          href={`mailto:${otherProfile.email}`}
                          className="inline-flex items-center gap-1.5 text-primary-700 text-sm font-medium px-3 py-2 rounded-lg border border-primary-200 hover:bg-primary-100 transition-colors"
                        >
                          Email
                        </a>
                      )}
                    </div>
                  </div>
                )}

              {shouldBlur && (
                <div className="mb-5">
                  <UpgradePrompt context="view full details and respond" />
                </div>
              )}

              {/* View profile link */}
              {otherProfile && !shouldBlur && (
                <Link
                  href={profileHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-primary-600 hover:text-primary-500 text-sm font-medium transition-colors"
                >
                  View full profile
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                    />
                  </svg>
                </Link>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );

  return createPortal(drawerContent, document.body);
}

function blurName(name: string): string {
  if (!name) return "***";
  return name
    .split(" ")
    .map((p) => p.charAt(0) + "***")
    .join(" ");
}
