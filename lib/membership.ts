import type { Membership, Profile } from "@/lib/types";

/**
 * Check whether the given account has active engagement access.
 *
 * Rules:
 * - Families always have full access (they never pay).
 * - Saves are always free for everyone.
 * - Receiving/viewing inquiry existence is always free.
 * - Everything else (viewing full inquiry details, responding) requires
 *   an active trial or pro membership.
 */
export type EngageAction =
  | "save"
  | "receive_inquiry"
  | "view_inquiry_metadata"
  | "view_inquiry_details"
  | "respond_to_inquiry"
  | "initiate_contact";

export function canEngage(
  profileType: Profile["type"] | undefined,
  membership: Membership | null,
  action: EngageAction
): boolean {
  // Families always can
  if (profileType === "family") return true;

  // Saves are always free
  if (action === "save") return true;

  // Receiving/viewing inquiry existence is always free
  if (action === "receive_inquiry" || action === "view_inquiry_metadata")
    return true;

  // Everything else requires active trial or pro
  if (!membership) return false;

  if (membership.status === "active") return true;
  if (membership.status === "trialing" && membership.trial_ends_at) {
    return new Date(membership.trial_ends_at) > new Date();
  }
  if (membership.status === "past_due") return true; // grace period

  return false;
}

/**
 * Returns the number of trial days remaining, or null if not on trial.
 */
export function getTrialDaysRemaining(
  trialEndsAt: string | null | undefined
): number | null {
  if (!trialEndsAt) return null;
  const diff = new Date(trialEndsAt).getTime() - Date.now();
  if (diff <= 0) return 0;
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}
