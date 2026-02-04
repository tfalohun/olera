import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import type { Profile, OrganizationMetadata, CaregiverMetadata } from "@/lib/types";
import { getProviderBySlug, mockProviderToProfile } from "@/lib/mock-providers";
import Badge from "@/components/ui/Badge";
import InquiryButton from "@/components/providers/InquiryButton";
import ImageGallery from "@/components/providers/ImageGallery";

// Extended metadata type that includes mock-specific fields
interface ExtendedMetadata extends OrganizationMetadata, CaregiverMetadata {
  rating?: number;
  review_count?: number;
  images?: string[];
  staff?: { name: string; position: string; bio: string; image: string };
  badge?: string;
  accepted_payments?: string[];
}

export default async function ProviderPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  let profile: Profile | null = null;
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("slug", slug)
      .in("type", ["organization", "caregiver"])
      .single<Profile>();
    profile = data;
  } catch {
    // Supabase not configured — fall through to mock lookup
  }

  // Mock data fallback for development
  if (!profile) {
    const mockProvider = getProviderBySlug(slug);
    if (mockProvider) {
      profile = mockProviderToProfile(mockProvider);
    }
  }

  if (!profile) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <h1 className="text-2xl font-bold text-gray-900">Provider not found</h1>
        <p className="mt-2 text-gray-600">
          The provider you&apos;re looking for doesn&apos;t exist.
        </p>
        <Link
          href="/"
          className="mt-4 inline-block text-primary-600 hover:underline"
        >
          Back to home
        </Link>
      </div>
    );
  }

  const meta = profile.metadata as ExtendedMetadata;
  const amenities = meta?.amenities || [];
  const priceRange =
    meta?.price_range ||
    (meta?.hourly_rate_min && meta?.hourly_rate_max
      ? `$${meta.hourly_rate_min}-${meta.hourly_rate_max}/hr`
      : null);
  const locationStr = [profile.address, profile.city, profile.state]
    .filter(Boolean)
    .join(", ");

  // Mock-enriched fields
  const rating = meta?.rating;
  const reviewCount = meta?.review_count;
  const images = meta?.images || (profile.image_url ? [profile.image_url] : []);
  const staff = meta?.staff;
  const badge = meta?.badge;
  const acceptedPayments = meta?.accepted_payments || [];

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Hero Section with Image Gallery */}
      <div className="relative h-72 md:h-96 bg-gray-300">
        {images.length > 1 ? (
          <ImageGallery images={images} alt={profile.display_name} />
        ) : profile.image_url ? (
          <img
            src={profile.image_url}
            alt={profile.display_name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-primary-200 to-primary-400" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-wrap items-center gap-2 mb-3">
              {badge && (
                <span className="bg-warm-500 text-white text-xs font-semibold px-3 py-1 rounded-full shadow-sm">
                  {badge}
                </span>
              )}
              {profile.claim_state === "claimed" &&
                profile.verification_state === "verified" && (
                  <Badge variant="verified">Verified Provider</Badge>
                )}
              {profile.claim_state === "claimed" &&
                profile.verification_state !== "verified" && (
                  <Badge variant="verified">Claimed</Badge>
                )}
              {profile.claim_state === "unclaimed" && (
                <Badge variant="unclaimed">Unclaimed Listing</Badge>
              )}
              {profile.claim_state === "pending" && (
                <Badge variant="pending">Claim Pending</Badge>
              )}
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-white">
              {profile.display_name}
            </h1>
            {/* Rating inline with name */}
            {rating && (
              <div className="flex items-center gap-2 mt-2">
                <div className="flex items-center gap-1">
                  <svg className="w-5 h-5 text-warning-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  <span className="text-white font-semibold">{rating.toFixed(1)}</span>
                </div>
                {reviewCount && (
                  <span className="text-white/70 text-sm">({reviewCount} reviews)</span>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Unclaimed banner */}
      {profile.claim_state === "unclaimed" && (
        <div className="bg-warm-50 border-b border-warm-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <p className="font-medium text-warm-800">
                  This profile hasn&apos;t been claimed yet
                </p>
                <p className="text-sm text-warm-600">
                  Information may be outdated. Is this your organization?
                </p>
              </div>
              <Link
                href={`/for-providers/claim/${profile.slug}`}
                className="shrink-0 bg-primary-600 hover:bg-primary-700 text-white font-medium px-5 py-2.5 rounded-lg transition-colors text-base"
              >
                Claim This Profile
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Main Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Quick Info */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="flex flex-wrap gap-4 items-center text-sm">
                {locationStr && (
                  <span className="text-gray-600 flex items-center gap-1.5">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    {locationStr}
                  </span>
                )}
              </div>
              {profile.care_types && profile.care_types.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-4">
                  {profile.care_types.map((type) => (
                    <span
                      key={type}
                      className="bg-primary-50 text-primary-700 text-sm px-3 py-1 rounded-full"
                    >
                      {type}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* About */}
            {profile.description && (
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  About
                </h2>
                <p className="text-gray-600 leading-relaxed">
                  {profile.description}
                </p>
              </div>
            )}

            {/* Staff Spotlight */}
            {staff && (
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Meet Our Team
                </h2>
                <div className="flex items-start gap-4">
                  <img
                    src={staff.image}
                    alt={staff.name}
                    className="w-16 h-16 rounded-full object-cover flex-shrink-0"
                  />
                  <div>
                    <h3 className="font-semibold text-gray-900">{staff.name}</h3>
                    <p className="text-primary-600 text-sm font-medium">{staff.position}</p>
                    <p className="text-gray-600 text-sm mt-2 leading-relaxed">{staff.bio}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Amenities */}
            {amenities.length > 0 && (
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Amenities &amp; Services
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {amenities.map((amenity) => (
                    <div
                      key={amenity}
                      className="flex items-center gap-2 text-gray-600"
                    >
                      <svg
                        className="w-5 h-5 text-primary-500"
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
                      <span className="text-sm">{amenity}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Details */}
            {(meta?.year_founded || meta?.bed_count || meta?.years_experience || meta?.accepts_medicaid !== undefined || meta?.accepts_medicare !== undefined) && (
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Details
                </h2>
                <dl className="grid grid-cols-2 gap-4">
                  {meta?.year_founded && (
                    <div>
                      <dt className="text-sm text-gray-500">Year Founded</dt>
                      <dd className="text-gray-900 font-medium">{meta.year_founded}</dd>
                    </div>
                  )}
                  {meta?.bed_count && (
                    <div>
                      <dt className="text-sm text-gray-500">Capacity</dt>
                      <dd className="text-gray-900 font-medium">{meta.bed_count} beds</dd>
                    </div>
                  )}
                  {meta?.years_experience && (
                    <div>
                      <dt className="text-sm text-gray-500">Experience</dt>
                      <dd className="text-gray-900 font-medium">{meta.years_experience} years</dd>
                    </div>
                  )}
                  {meta?.accepts_medicaid !== undefined && (
                    <div>
                      <dt className="text-sm text-gray-500">Medicaid</dt>
                      <dd className="text-gray-900 font-medium">
                        {meta.accepts_medicaid ? "Accepted" : "Not accepted"}
                      </dd>
                    </div>
                  )}
                  {meta?.accepts_medicare !== undefined && (
                    <div>
                      <dt className="text-sm text-gray-500">Medicare</dt>
                      <dd className="text-gray-900 font-medium">
                        {meta.accepts_medicare ? "Accepted" : "Not accepted"}
                      </dd>
                    </div>
                  )}
                </dl>
              </div>
            )}
          </div>

          {/* Right Column - Contact Card */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl p-6 shadow-sm sticky top-24 space-y-6">
              {/* Price + Rating Summary */}
              <div className="text-center">
                {priceRange && (
                  <div className="mb-2">
                    <p className="text-gray-500 text-sm">Starting from</p>
                    <p className="text-2xl font-bold text-gray-900">{priceRange}</p>
                  </div>
                )}
                {rating && (
                  <div className="flex items-center justify-center gap-1.5">
                    <svg className="w-5 h-5 text-warning-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    <span className="font-semibold text-gray-900">{rating.toFixed(1)}</span>
                    {reviewCount && (
                      <span className="text-gray-500 text-sm">({reviewCount} reviews)</span>
                    )}
                  </div>
                )}
              </div>

              {/* Accepted Payments */}
              {acceptedPayments.length > 0 && (
                <div className="border-t border-gray-100 pt-4">
                  <p className="text-sm text-gray-500 mb-2">Accepted payments</p>
                  <div className="flex flex-wrap gap-1.5">
                    {acceptedPayments.map((payment) => (
                      <span
                        key={payment}
                        className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700"
                      >
                        {payment}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="space-y-3">
                <InquiryButton
                  providerProfileId={profile.id}
                  providerName={profile.display_name}
                  providerSlug={profile.slug}
                />
                {profile.phone && (
                  <a
                    href={`tel:${profile.phone}`}
                    className="w-full border border-primary-600 text-primary-600 hover:bg-primary-50 font-semibold py-3 rounded-lg transition-colors flex items-center justify-center gap-2 min-h-[44px]"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    {profile.phone}
                  </a>
                )}
                {profile.website && (
                  <a
                    href={profile.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full border border-gray-200 text-gray-700 hover:bg-gray-50 font-medium py-3 rounded-lg transition-colors flex items-center justify-center gap-2 min-h-[44px]"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                    Visit Website
                  </a>
                )}
              </div>

              {meta?.hours && (
                <div className="border-t border-gray-100 pt-4">
                  <p className="text-sm text-gray-500 text-center">{meta.hours}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Back Link */}
        <div className="mt-8">
          <Link
            href="/"
            className="text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to home
          </Link>
        </div>
      </div>
    </div>
  );
}
