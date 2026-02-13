import type { CareRecipient, CareTypeValue, UrgencyValue } from "./types";

// ============================================================
// Recipient Options
// ============================================================

export const RECIPIENT_OPTIONS: { label: string; value: CareRecipient }[] = [
  { label: "Myself", value: "self" },
  { label: "My parent", value: "parent" },
  { label: "My spouse", value: "spouse" },
  { label: "Someone else", value: "other" },
];

export const RECIPIENT_LABELS: Record<CareRecipient, string> = {
  self: "Myself",
  parent: "My parent",
  spouse: "My spouse",
  other: "Someone else",
};

// ============================================================
// Care Type Options
// ============================================================

export const CARE_TYPE_LABELS: Record<CareTypeValue, string> = {
  assisted_living: "Assisted Living",
  home_care: "Home Care",
  memory_care: "Memory Care",
  home_health: "Home Health",
};

export function mapProviderCareTypes(): CareTypeValue[] {
  // Always show all 4 standard options
  return ["assisted_living", "home_care", "memory_care", "home_health"];
}

// ============================================================
// Urgency Options
// ============================================================

export const URGENCY_OPTIONS: { label: string; value: UrgencyValue }[] = [
  { label: "Immediately", value: "asap" },
  { label: "Within a month", value: "within_month" },
  { label: "In a few months", value: "few_months" },
  { label: "Just researching", value: "researching" },
];

export const URGENCY_LABELS: Record<UrgencyValue, string> = {
  asap: "Immediately",
  within_month: "Within a month",
  few_months: "In a few months",
  researching: "Just researching",
};
