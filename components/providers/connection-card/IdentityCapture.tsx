"use client";

import Pill from "./Pill";
import { CONTACT_OPTIONS, CARE_TYPE_LABELS, URGENCY_LABELS, RECIPIENT_LABELS } from "./constants";
import type { IntentData, IdentityData, ContactPreference } from "./types";

interface IdentityCaptureProps {
  providerName: string;
  intentData: IntentData;
  identityData: IdentityData;
  submitting: boolean;
  error: string;
  onEditIntent: () => void;
  onSetContactPref: (val: ContactPreference) => void;
  onSetPhone: (val: string) => void;
  onSubmit: () => void;
  onBack: () => void;
}

export default function IdentityCapture({
  providerName,
  intentData,
  identityData,
  submitting,
  error,
  onEditIntent,
  onSetContactPref,
  onSetPhone,
  onSubmit,
  onBack,
}: IdentityCaptureProps) {
  const { email, firstName, lastName, contactPreference, phone } = identityData;

  const needsPhone = contactPreference === "call" || contactPreference === "text";

  const canSubmit =
    contactPreference !== null &&
    (!needsPhone || phone.trim() !== "");

  // Build compact intent summary
  const intentSummary = [
    intentData.careType ? CARE_TYPE_LABELS[intentData.careType] : null,
    intentData.careRecipient ? RECIPIENT_LABELS[intentData.careRecipient] : null,
    intentData.urgency ? URGENCY_LABELS[intentData.urgency] : null,
  ]
    .filter(Boolean)
    .join(" \u00B7 ");

  const displayName = [firstName, lastName].filter(Boolean).join(" ");

  return (
    <>
      {/* Intent summary (collapsed) */}
      <div className="px-3 py-3 bg-gray-50 rounded-lg border border-gray-100 mb-4">
        <p className="text-base text-gray-700 leading-relaxed">
          {intentSummary}
        </p>
        {/* Show user identity from auth */}
        {(displayName || email) && (
          <p className="text-sm text-gray-500 mt-1">
            {displayName && <span className="font-medium text-gray-600">{displayName}</span>}
            {displayName && email && " · "}
            {email}
          </p>
        )}
        <button
          onClick={onEditIntent}
          className="text-sm text-primary-600 font-medium mt-2 underline decoration-primary-600/25 underline-offset-2 hover:decoration-primary-600/50 transition-colors bg-transparent border-none cursor-pointer p-0"
        >
          Edit
        </button>
      </div>

      {/* Contact preference */}
      <div className="mb-3">
        <label className="block text-base font-semibold text-gray-700 mb-1.5">
          How should {providerName} contact you?
        </label>
        <div className="flex gap-1.5">
          {CONTACT_OPTIONS.map((opt) => (
            <Pill
              key={opt.value}
              label={opt.label}
              selected={contactPreference === opt.value}
              onClick={() => onSetContactPref(opt.value)}
              small
            />
          ))}
        </div>
      </div>

      {/* Conditional phone field */}
      {needsPhone && (
        <div className="mb-4">
          <label className="block text-base font-semibold text-gray-700 mb-1">
            Phone number
          </label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => onSetPhone(e.target.value)}
            placeholder="(___) ___-____"
            className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-base text-gray-700 outline-none focus:border-primary-600 transition-colors box-border"
          />
        </div>
      )}

      {/* Error message */}
      {error && (
        <div className="bg-red-50 text-red-700 px-3 py-2.5 rounded-lg text-sm mb-3">
          {error}
        </div>
      )}

      {/* Action row */}
      <div className="flex items-center justify-between mt-1">
        <button
          onClick={onBack}
          className="text-base text-gray-500 cursor-pointer bg-transparent border-none hover:text-gray-700 transition-colors font-medium"
        >
          &larr; Back
        </button>
        <button
          onClick={onSubmit}
          disabled={!canSubmit || submitting}
          className={`px-8 py-2.5 border-none rounded-[10px] text-base font-semibold cursor-pointer transition-all duration-200 ${
            canSubmit && !submitting
              ? "bg-primary-600 text-white hover:bg-primary-500"
              : "bg-gray-200 text-gray-400 cursor-default"
          }`}
        >
          {submitting ? "Sending..." : "Send Request"}
        </button>
      </div>
    </>
  );
}
