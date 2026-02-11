import { useMemo } from "react";
import type { BusinessProfile, FamilyMetadata } from "@/lib/types";

interface CompletenessResult {
  percentage: number;
  firstIncompleteStep: number;
}

const FIELD_CHECKS: {
  weight: number;
  step: number;
  check: (p: BusinessProfile, email?: string) => boolean;
}[] = [
  // Step 0: Contact
  { weight: 10, step: 0, check: (_p, email) => !!email },
  { weight: 10, step: 0, check: (p) => !!p.phone },
  { weight: 5, step: 0, check: (p) => !!(p.metadata as FamilyMetadata)?.contact_preference },
  // Profile header
  { weight: 15, step: -1, check: (p) => !!p.image_url },
  { weight: 5, step: -1, check: (p) => !!p.display_name },
  // Step 1: Care preferences
  { weight: 5, step: 1, check: (p) => !!(p.metadata as FamilyMetadata)?.relationship_to_recipient },
  { weight: 5, step: 1, check: (p) => (p.care_types?.length ?? 0) > 0 },
  { weight: 5, step: 1, check: (p) => !!(p.metadata as FamilyMetadata)?.timeline },
  { weight: 5, step: 1, check: (p) => !!p.description },
  // Step 2: Payment
  { weight: 10, step: 2, check: (p) => ((p.metadata as FamilyMetadata)?.payment_methods?.length ?? 0) > 0 },
  // Step 3: Living situation
  { weight: 5, step: 3, check: (p) => !!(p.metadata as FamilyMetadata)?.living_situation },
  // Step 4: Schedule & location
  { weight: 5, step: 4, check: (p) => !!(p.metadata as FamilyMetadata)?.schedule_preference },
  { weight: 5, step: 4, check: (p) => !!(p.metadata as FamilyMetadata)?.care_location },
  // Step 5: Language & about
  { weight: 5, step: 5, check: (p) => !!(p.metadata as FamilyMetadata)?.language_preference },
  { weight: 5, step: 5, check: (p) => !!(p.metadata as FamilyMetadata)?.about_situation },
];

export function useProfileCompleteness(
  profile: BusinessProfile | null,
  userEmail?: string
): CompletenessResult {
  return useMemo(() => {
    if (!profile) return { percentage: 0, firstIncompleteStep: 0 };

    let earned = 0;
    let firstIncomplete = 6; // past the last step means all complete

    for (const field of FIELD_CHECKS) {
      if (field.check(profile, userEmail)) {
        earned += field.weight;
      } else if (field.step >= 0 && field.step < firstIncomplete) {
        firstIncomplete = field.step;
      }
    }

    return {
      percentage: Math.min(earned, 100),
      firstIncompleteStep: firstIncomplete >= 6 ? 0 : firstIncomplete,
    };
  }, [profile, userEmail]);
}
