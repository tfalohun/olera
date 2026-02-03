"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useAuth } from "@/components/auth/AuthProvider";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import type { Connection, Profile } from "@/lib/types";
import Badge from "@/components/ui/Badge";
import EmptyState from "@/components/ui/EmptyState";

interface Appointment {
  connection: Connection;
  otherProfile: Profile | null;
  isInbound: boolean;
}

export default function CalendarPage() {
  const { activeProfile } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAppointments = useCallback(async () => {
    if (!activeProfile || !isSupabaseConfigured()) {
      setLoading(false);
      return;
    }

    const supabase = createClient();

    // Fetch accepted connections — these are your "appointments"
    const { data: connections } = await supabase
      .from("connections")
      .select("*")
      .or(
        `to_profile_id.eq.${activeProfile.id},from_profile_id.eq.${activeProfile.id}`
      )
      .eq("status", "accepted")
      .neq("type", "save")
      .order("updated_at", { ascending: false });

    if (!connections || connections.length === 0) {
      setAppointments([]);
      setLoading(false);
      return;
    }

    // Fetch all related profiles
    const profileIds = new Set<string>();
    connections.forEach((c: Connection) => {
      profileIds.add(c.from_profile_id);
      profileIds.add(c.to_profile_id);
    });

    const { data: profiles } = await supabase
      .from("profiles")
      .select("*")
      .in("id", Array.from(profileIds));

    const profileMap = new Map(
      ((profiles as Profile[]) || []).map((p) => [p.id, p])
    );

    const enriched: Appointment[] = (connections as Connection[]).map((c) => ({
      connection: c,
      otherProfile:
        c.from_profile_id === activeProfile.id
          ? profileMap.get(c.to_profile_id) || null
          : profileMap.get(c.from_profile_id) || null,
      isInbound: c.to_profile_id === activeProfile.id,
    }));

    setAppointments(enriched);
    setLoading(false);
  }, [activeProfile]);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  if (loading) {
    return (
      <div className="text-center py-16">
        <div className="animate-spin w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full mx-auto" />
        <p className="mt-4 text-gray-500">Loading appointments...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Appointments</h1>
        <p className="text-lg text-gray-600 mt-1">
          Track meetings and next steps with your connections.
        </p>
      </div>

      {appointments.length === 0 ? (
        <EmptyState
          title="No appointments yet"
          description="When you accept a connection, it will appear here so you can schedule a meeting or follow up."
        />
      ) : (
        <div className="space-y-4">
          {appointments.map((apt) => (
            <AppointmentCard key={apt.connection.id} appointment={apt} />
          ))}
        </div>
      )}
    </div>
  );
}

function AppointmentCard({ appointment }: { appointment: Appointment }) {
  const { connection, otherProfile, isInbound } = appointment;

  const typeLabel =
    connection.type === "inquiry"
      ? "Inquiry"
      : connection.type === "invitation"
      ? "Invitation"
      : connection.type === "application"
      ? "Application"
      : connection.type;

  const acceptedDate = new Date(connection.updated_at).toLocaleDateString(
    "en-US",
    { month: "short", day: "numeric", year: "numeric" }
  );

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-sm transition-shadow">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-3 flex-wrap mb-2">
            <div className="w-10 h-10 bg-primary-100 text-primary-700 rounded-full flex items-center justify-center text-sm font-bold shrink-0">
              {otherProfile?.display_name?.charAt(0).toUpperCase() || "?"}
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                {otherProfile?.display_name || "Unknown"}
              </h3>
              <p className="text-sm text-gray-500">
                {typeLabel} &middot; Accepted {acceptedDate}
              </p>
            </div>
          </div>

          {/* Quick contact actions */}
          <div className="flex flex-wrap gap-2 mt-4">
            {otherProfile?.phone && (
              <a
                href={`tel:${otherProfile.phone}`}
                className="inline-flex items-center gap-1.5 bg-primary-50 text-primary-700 text-sm font-medium px-3 py-2 rounded-lg hover:bg-primary-100 transition-colors"
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
                    d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                  />
                </svg>
                Call
              </a>
            )}
            {otherProfile?.email && (
              <a
                href={`mailto:${otherProfile.email}`}
                className="inline-flex items-center gap-1.5 bg-primary-50 text-primary-700 text-sm font-medium px-3 py-2 rounded-lg hover:bg-primary-100 transition-colors"
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
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
                Email
              </a>
            )}
            <Link
              href={`/portal/connections/${connection.id}`}
              className="inline-flex items-center gap-1.5 bg-gray-100 text-gray-700 text-sm font-medium px-3 py-2 rounded-lg hover:bg-gray-200 transition-colors"
            >
              View details
            </Link>
          </div>
        </div>

        <Badge variant="verified">Connected</Badge>
      </div>
    </div>
  );
}
