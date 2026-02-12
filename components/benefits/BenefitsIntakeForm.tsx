"use client";

import { useState } from "react";
import StepIndicator from "@/components/providers/connection-card/StepIndicator";
import Pill from "@/components/providers/connection-card/Pill";
import {
  INTAKE_STEPS,
  TOTAL_INTAKE_STEPS,
  CARE_PREFERENCES,
  PRIMARY_NEEDS,
  INCOME_RANGES,
  MEDICAID_STATUSES,
  createEmptyIntakeAnswers,
} from "@/lib/types/benefits";
import type {
  BenefitsIntakeAnswers,
  CarePreference,
  PrimaryNeed,
  IncomeRange,
  MedicaidStatus,
  IntakeStep,
} from "@/lib/types/benefits";
import { zipToState, isValidZip } from "@/lib/benefits/zip-lookup";

interface BenefitsIntakeFormProps {
  onSubmit: (answers: BenefitsIntakeAnswers) => void;
}

export default function BenefitsIntakeForm({
  onSubmit,
}: BenefitsIntakeFormProps) {
  const [step, setStep] = useState<IntakeStep>(0);
  const [answers, setAnswers] = useState<BenefitsIntakeAnswers>(
    createEmptyIntakeAnswers()
  );
  const [zipInput, setZipInput] = useState("");
  const [ageInput, setAgeInput] = useState("");
  const [zipError, setZipError] = useState<string | null>(null);

  const stepInfo = INTAKE_STEPS[step];

  // ─── Validation ──────────────────────────────────────────────────────

  function canProceed(): boolean {
    switch (step) {
      case 0:
        return isValidZip(zipInput);
      case 1: {
        const age = parseInt(ageInput, 10);
        return !isNaN(age) && age >= 18 && age <= 120;
      }
      case 2:
        return answers.carePreference !== null;
      case 3:
        return answers.primaryNeeds.length > 0;
      case 4:
        return answers.incomeRange !== null;
      case 5:
        return answers.medicaidStatus !== null;
      default:
        return false;
    }
  }

  // ─── Navigation ──────────────────────────────────────────────────────

  function handleNext() {
    if (!canProceed()) return;

    // Finalize step-specific data before advancing
    if (step === 0) {
      const state = zipToState(zipInput);
      if (!state) {
        setZipError("We couldn't recognize that ZIP code. Please try again.");
        return;
      }
      setZipError(null);
      setAnswers((prev) => ({ ...prev, zipCode: zipInput.trim(), stateCode: state }));
    }

    if (step === 1) {
      setAnswers((prev) => ({ ...prev, age: parseInt(ageInput, 10) }));
    }

    if (step < 5) {
      setStep((step + 1) as IntakeStep);
    } else {
      // Final step — submit
      const final: BenefitsIntakeAnswers = {
        ...answers,
        zipCode: zipInput.trim(),
        stateCode: answers.stateCode || zipToState(zipInput) || null,
        age: parseInt(ageInput, 10),
      };
      onSubmit(final);
    }
  }

  function handleBack() {
    if (step > 0) setStep((step - 1) as IntakeStep);
  }

  // ─── Render Helpers ──────────────────────────────────────────────────

  function toggleNeed(need: PrimaryNeed) {
    setAnswers((prev) => {
      const has = prev.primaryNeeds.includes(need);
      return {
        ...prev,
        primaryNeeds: has
          ? prev.primaryNeeds.filter((n) => n !== need)
          : [...prev.primaryNeeds, need],
      };
    });
  }

  return (
    <div className="w-full">
      <StepIndicator current={step} total={TOTAL_INTAKE_STEPS} />

      <p className="text-lg font-semibold text-gray-800 mb-1 mt-4">
        {stepInfo.title}
      </p>
      <p className="text-base text-gray-600 mb-5">{stepInfo.question}</p>

      {/* Step 0: ZIP code */}
      {step === 0 && (
        <div className="mb-4">
          <input
            type="text"
            inputMode="numeric"
            maxLength={5}
            value={zipInput}
            onChange={(e) => {
              const val = e.target.value.replace(/\D/g, "");
              setZipInput(val);
              setZipError(null);
            }}
            placeholder="e.g. 78701"
            className="w-full px-4 py-3 rounded-xl border border-gray-200 text-lg text-gray-700 outline-none focus:border-primary-600 transition-colors"
          />
          {zipError && (
            <p className="text-sm text-red-500 mt-1.5">{zipError}</p>
          )}
        </div>
      )}

      {/* Step 1: Age */}
      {step === 1 && (
        <div className="mb-4">
          <input
            type="text"
            inputMode="numeric"
            maxLength={3}
            value={ageInput}
            onChange={(e) => setAgeInput(e.target.value.replace(/\D/g, ""))}
            placeholder="e.g. 72"
            className="w-full px-4 py-3 rounded-xl border border-gray-200 text-lg text-gray-700 outline-none focus:border-primary-600 transition-colors"
          />
        </div>
      )}

      {/* Step 2: Care preference */}
      {step === 2 && (
        <div className="flex flex-col gap-2 mb-4">
          {(Object.entries(CARE_PREFERENCES) as [CarePreference, { displayTitle: string; icon: string }][]).map(
            ([key, val]) => (
              <Pill
                key={key}
                label={`${val.icon} ${val.displayTitle}`}
                selected={answers.carePreference === key}
                onClick={() =>
                  setAnswers((prev) => ({ ...prev, carePreference: key }))
                }
              />
            )
          )}
        </div>
      )}

      {/* Step 3: Primary needs (multi-select) */}
      {step === 3 && (
        <>
          <p className="text-sm text-gray-500 mb-2">Select all that apply</p>
          <div className="flex flex-wrap gap-2 mb-4">
            {(Object.entries(PRIMARY_NEEDS) as [PrimaryNeed, { displayTitle: string; icon: string }][]).map(
              ([key, val]) => (
                <Pill
                  key={key}
                  label={`${val.icon} ${val.displayTitle}`}
                  selected={answers.primaryNeeds.includes(key)}
                  onClick={() => toggleNeed(key)}
                />
              )
            )}
          </div>
        </>
      )}

      {/* Step 4: Income range */}
      {step === 4 && (
        <div className="flex flex-col gap-2 mb-4">
          {(Object.entries(INCOME_RANGES) as [IncomeRange, { displayTitle: string }][]).map(
            ([key, val]) => (
              <Pill
                key={key}
                label={val.displayTitle}
                selected={answers.incomeRange === key}
                onClick={() =>
                  setAnswers((prev) => ({ ...prev, incomeRange: key }))
                }
              />
            )
          )}
        </div>
      )}

      {/* Step 5: Medicaid status */}
      {step === 5 && (
        <div className="flex flex-col gap-2 mb-4">
          {(Object.entries(MEDICAID_STATUSES) as [MedicaidStatus, { displayTitle: string }][]).map(
            ([key, val]) => (
              <Pill
                key={key}
                label={val.displayTitle}
                selected={answers.medicaidStatus === key}
                onClick={() =>
                  setAnswers((prev) => ({ ...prev, medicaidStatus: key }))
                }
              />
            )
          )}
        </div>
      )}

      {/* Navigation */}
      <div className="flex items-center justify-between mt-2">
        {step > 0 ? (
          <button
            onClick={handleBack}
            className="text-base text-gray-500 cursor-pointer bg-transparent border-none hover:text-gray-700 transition-colors font-medium"
          >
            &larr; Back
          </button>
        ) : (
          <div />
        )}
        <button
          onClick={handleNext}
          disabled={!canProceed()}
          className={`px-8 py-2.5 border-none rounded-[10px] text-base font-semibold cursor-pointer transition-all duration-200 ${
            canProceed()
              ? "bg-primary-600 text-white hover:bg-primary-500"
              : "bg-gray-200 text-gray-400 cursor-default"
          }`}
        >
          {step === 5 ? "Find Benefits" : "Next"}
        </button>
      </div>
    </div>
  );
}
