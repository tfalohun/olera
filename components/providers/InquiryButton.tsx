"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import { useAuth } from "@/components/auth/AuthProvider";
import { getDeferredAction, clearDeferredAction } from "@/lib/deferred-action";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import Input from "@/components/ui/Input";

interface InquiryButtonProps {
  providerProfileId: string;
  providerName: string;
  providerSlug: string;
}

export default function InquiryButton({
  providerProfileId,
  providerName,
  providerSlug,
}: InquiryButtonProps) {
  const { user, account, activeProfile, openAuthModal } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [alreadySent, setAlreadySent] = useState(false);
  const autoInquiryTriggered = useRef(false);

  // Check if inquiry already exists
  useEffect(() => {
    if (!user || !activeProfile || !isSupabaseConfigured()) return;

    const checkExisting = async () => {
      const supabase = createClient();
      const { data } = await supabase
        .from("connections")
        .select("id")
        .eq("from_profile_id", activeProfile.id)
        .eq("to_profile_id", providerProfileId)
        .eq("type", "inquiry")
        .single();

      if (data) setAlreadySent(true);
    };

    checkExisting();
  }, [user, activeProfile, providerProfileId]);

  const submitInquiry = useCallback(
    async (inquiryMessage: string) => {
      if (!account || !activeProfile) return;
      if (!isSupabaseConfigured()) return;

      setSubmitting(true);
      setError("");

      try {
        const supabase = createClient();

        const { error: insertError } = await supabase
          .from("connections")
          .insert({
            from_profile_id: activeProfile.id,
            to_profile_id: providerProfileId,
            type: "inquiry",
            status: "pending",
            message: inquiryMessage.trim() || null,
          });

        if (insertError) {
          if (insertError.message.includes("duplicate") || insertError.message.includes("unique")) {
            setAlreadySent(true);
            setShowModal(false);
            return;
          }
          throw new Error(insertError.message);
        }

        setSuccess(true);
        setAlreadySent(true);
        setTimeout(() => {
          setShowModal(false);
          setSuccess(false);
          setMessage("");
        }, 2000);
      } catch (err: unknown) {
        const msg =
          err && typeof err === "object" && "message" in err
            ? (err as { message: string }).message
            : String(err);
        setError(msg);
      } finally {
        setSubmitting(false);
      }
    },
    [account, activeProfile, providerProfileId]
  );

  // Auto-trigger inquiry after returning from auth
  useEffect(() => {
    if (autoInquiryTriggered.current) return;
    if (!user || !account || !activeProfile) return;

    const deferred = getDeferredAction();
    if (
      deferred?.action === "inquiry" &&
      deferred?.targetProfileId === providerProfileId
    ) {
      autoInquiryTriggered.current = true;
      clearDeferredAction();
      // Show the modal so they can write a message
      setShowModal(true);
    }
  }, [user, account, activeProfile, providerProfileId]);

  const handleClick = () => {
    if (!user) {
      openAuthModal(
        {
          action: "inquiry",
          targetProfileId: providerProfileId,
          returnUrl: `/provider/${providerSlug}`,
        },
        "sign-up"
      );
      return;
    }

    if (alreadySent) return;
    setShowModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitInquiry(message);
  };

  return (
    <>
      <Button
        fullWidth
        size="lg"
        onClick={handleClick}
        disabled={alreadySent}
      >
        {alreadySent
          ? "Inquiry Sent"
          : user
          ? "Request Consultation"
          : "Sign Up to Request Consultation"}
      </Button>

      <Modal
        isOpen={showModal}
        onClose={() => {
          if (!submitting) {
            setShowModal(false);
            setError("");
          }
        }}
        title={success ? "Inquiry Sent" : `Contact ${providerName}`}
        size="md"
      >
        {success ? (
          <div className="text-center py-4">
            <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-primary-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <p className="text-lg text-gray-900 mb-1">
              Your inquiry has been sent!
            </p>
            <p className="text-base text-gray-600">
              {providerName} will be notified and can respond to your inquiry.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <p className="text-base text-gray-600">
              Send a message to {providerName} to start a conversation about
              care options.
            </p>

            <Input
              as="textarea"
              label="Your message (optional)"
              name="message"
              value={message}
              onChange={(e) =>
                setMessage((e.target as HTMLTextAreaElement).value)
              }
              placeholder="Tell them about your care needs, timeline, or any questions you have..."
              rows={4}
            />

            {error && (
              <div
                className="bg-red-50 text-red-700 px-4 py-3 rounded-lg text-base"
                role="alert"
              >
                {error}
              </div>
            )}

            <Button type="submit" fullWidth loading={submitting}>
              Send Inquiry
            </Button>
          </form>
        )}
      </Modal>
    </>
  );
}
