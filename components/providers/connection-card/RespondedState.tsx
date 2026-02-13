"use client";

import Link from "next/link";
import PhoneButton from "./PhoneButton";

interface RespondedStateProps {
  providerName: string;
  phone: string | null;
  requestDate: string | null;
}

export default function RespondedState({
  providerName,
  phone,
  requestDate,
}: RespondedStateProps) {
  const dateStr = requestDate
    ? new Date(requestDate).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      })
    : "recently";

  return (
    <>
      {/* Celebratory banner */}
      <div className="px-4 py-5 bg-emerald-50 rounded-[10px] text-center mb-4 border border-emerald-100">
        <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-3">
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-emerald-600"
          >
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
        <p className="text-sm font-semibold text-gray-900 mb-1">
          {providerName} responded
        </p>
        <p className="text-[13px] text-gray-500">
          on {dateStr} &middot; Check your connections to view their response.
        </p>
      </div>

      {/* Phone — fully revealed */}
      <PhoneButton phone={phone} revealed onReveal={() => {}} />

      {/* View connections */}
      <Link
        href="/portal/connections"
        className="block w-full mt-2 py-3 bg-primary-600 hover:bg-primary-500 rounded-[10px] text-sm font-semibold text-white text-center transition-colors"
      >
        View Your Connections
      </Link>
    </>
  );
}
