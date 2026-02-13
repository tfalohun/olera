"use client";

import Link from "next/link";
import PhoneButton from "./PhoneButton";

interface PastConnectionStateProps {
  providerName: string;
  phone: string | null;
  requestDate: string | null;
  onConnect: () => void;
}

export default function PastConnectionState({
  providerName,
  phone,
  requestDate,
  onConnect,
}: PastConnectionStateProps) {
  const dateStr = requestDate
    ? new Date(requestDate).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      })
    : "previously";

  return (
    <>
      {/* Previous connection info */}
      <div className="px-4 py-4 bg-gray-50 rounded-[10px] text-center mb-4 border border-gray-100">
        <p className="text-sm text-gray-500">
          Previously connected with{" "}
          <span className="font-semibold text-gray-700">{providerName}</span>
        </p>
        <p className="text-[13px] text-gray-400 mt-0.5">on {dateStr}</p>
      </div>

      {/* Reconnect CTA */}
      <button
        type="button"
        onClick={onConnect}
        className="w-full py-3.5 bg-primary-600 hover:bg-primary-500 text-white rounded-[10px] text-[15px] font-semibold cursor-pointer border-none transition-colors"
      >
        Connect
      </button>

      {/* Phone — fully revealed */}
      <div className="mt-2.5">
        <PhoneButton phone={phone} revealed onReveal={() => {}} />
      </div>

      {/* View connections */}
      <Link
        href="/portal/connections"
        className="block w-full mt-2 py-3 border border-gray-200 rounded-[10px] text-sm font-medium text-primary-600 text-center hover:bg-gray-50 transition-colors"
      >
        View Your Connections
      </Link>
    </>
  );
}
