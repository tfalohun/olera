"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import ProviderCard, { Provider } from "@/components/providers/ProviderCard";

// Hook to detect when element is in view
function useInView(threshold: number = 0.3) {
  const [isInView, setIsInView] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
        }
      },
      { threshold }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [threshold]);

  return { isInView, ref };
}

// Hook to animate multiple counters together
function useAnimatedCounters(
  targets: { end: number; duration?: number }[],
  shouldStart: boolean
) {
  const [counts, setCounts] = useState<number[]>(targets.map(() => 0));
  const hasAnimatedRef = useRef(false);

  useEffect(() => {
    if (!shouldStart || hasAnimatedRef.current) return;

    hasAnimatedRef.current = true;
    let startTime: number | null = null;
    let animationFrame: number;

    const animate = (currentTime: number) => {
      if (startTime === null) startTime = currentTime;

      const newCounts = targets.map((target) => {
        const duration = target.duration || 2000;
        const progress = Math.min((currentTime - startTime!) / duration, 1);
        const easeOut = 1 - Math.pow(1 - progress, 3);
        return Math.floor(easeOut * target.end);
      });

      setCounts(newCounts);

      // Continue if any animation isn't complete
      const allComplete = targets.every((target, i) => {
        const duration = target.duration || 2000;
        const progress = (currentTime - startTime!) / duration;
        return progress >= 1;
      });

      if (!allComplete) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [shouldStart, targets]);

  return counts;
}

// Dummy provider data
const topProviders: Provider[] = [
  {
    id: "1",
    slug: "sunrise-senior-living",
    name: "Sunrise Senior Living",
    image: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800",
    images: [
      "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800",
      "https://images.unsplash.com/photo-1586105251261-72a756497a11?w=800",
      "https://images.unsplash.com/photo-1559526324-593bc073d938?w=800",
      "https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?w=800",
    ],
    address: "1234 Oak Street, Austin, TX 78701",
    rating: 4.8,
    reviewCount: 47,
    priceRange: "$3,500/mo",
    primaryCategory: "Assisted Living",
    careTypes: ["Memory Care", "Respite Care"],
    highlights: ["24/7 Nursing Staff", "Pet Friendly", "Private Rooms"],
    acceptedPayments: ["Medicare", "Medicaid", "Private Pay"],
    verified: true,
    badge: "Top Rated",
    description: "Award-winning senior living community with personalized care plans",
    staffImage: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=200",
    staff: {
      name: "Dr. Sarah Mitchell",
      position: "Director of Care",
      bio: "Board-certified geriatrician with 15+ years experience in senior care. Passionate about creating personalized care plans that prioritize dignity and quality of life.",
      image: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=200",
    },
  },
  {
    id: "2",
    slug: "harmony-care-home",
    name: "Harmony Care Home",
    image: "https://images.unsplash.com/photo-1586105251261-72a756497a11?w=800",
    images: [
      "https://images.unsplash.com/photo-1586105251261-72a756497a11?w=800",
      "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800",
      "https://images.unsplash.com/photo-1559526324-593bc073d938?w=800",
    ],
    address: "5678 Maple Avenue, Austin, TX 78702",
    rating: 4.6,
    reviewCount: 21,
    priceRange: "$4,200/mo",
    primaryCategory: "Memory Care",
    careTypes: ["Hospice", "Skilled Nursing"],
    highlights: ["Dementia Specialists", "Secured Facility", "Family Support"],
    acceptedPayments: ["Medicaid", "Long-term Insurance"],
    verified: true,
    description: "Specialized memory care with 24/7 nursing support",
  },
  {
    id: "3",
    slug: "golden-years-residence",
    name: "Golden Years Residence",
    image: "https://images.unsplash.com/photo-1559526324-593bc073d938?w=800",
    images: [
      "https://images.unsplash.com/photo-1559526324-593bc073d938?w=800",
      "https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?w=800",
      "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800",
      "https://images.unsplash.com/photo-1586105251261-72a756497a11?w=800",
      "https://images.unsplash.com/photo-1559526324-593bc073d938?w=800",
    ],
    address: "910 Pine Road, Austin, TX 78703",
    rating: 4.5,
    reviewCount: 12,
    priceRange: "$2,800/mo",
    primaryCategory: "Independent Living",
    careTypes: ["Assisted Living"],
    highlights: ["Active Lifestyle", "On-site Fitness", "Social Events"],
    acceptedPayments: ["Private Pay", "Veterans Benefits"],
    verified: true,
    badge: "New",
    description: "Modern community designed for active, independent seniors",
    staffImage: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=200",
    staff: {
      name: "Michael Chen",
      position: "Activities Director",
      bio: "Certified recreation therapist dedicated to keeping seniors active and engaged. Organizes daily fitness classes, social events, and community outings.",
      image: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=200",
    },
  },
  {
    id: "4",
    slug: "caring-hearts-home-care",
    name: "Caring Hearts Home Care",
    image: "https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?w=800",
    images: [
      "https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?w=800",
      "https://images.unsplash.com/photo-1559526324-593bc073d938?w=800",
    ],
    address: "Serving Greater Austin Area",
    rating: 4.9,
    reviewCount: 83,
    priceRange: "$25/hr",
    primaryCategory: "Home Care",
    careTypes: ["Respite Care", "Companion Care"],
    highlights: ["Flexible Scheduling", "Background Checked", "Bilingual Staff"],
    acceptedPayments: ["Medicare", "Private Pay"],
    verified: true,
    description: "Compassionate in-home care tailored to your loved one's needs",
  },
  {
    id: "5",
    slug: "oak-meadows-retirement",
    name: "Oak Meadows Retirement",
    image: "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800",
    images: [
      "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800",
      "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800",
    ],
    address: "2345 Elm Street, Austin, TX 78704",
    rating: 4.7,
    reviewCount: 38,
    priceRange: "$3,200/mo",
    primaryCategory: "Independent Living",
    careTypes: ["Assisted Living"],
    highlights: ["Golf Course Access", "Fine Dining", "Spa Services"],
    acceptedPayments: ["Private Pay", "Long-term Insurance"],
    verified: true,
    badge: "Featured",
    description: "Luxury retirement living with resort-style amenities",
  },
  {
    id: "6",
    slug: "peaceful-pines-hospice",
    name: "Peaceful Pines Hospice",
    image: "https://images.unsplash.com/photo-1559526324-593bc073d938?w=800",
    images: [
      "https://images.unsplash.com/photo-1559526324-593bc073d938?w=800",
      "https://images.unsplash.com/photo-1586105251261-72a756497a11?w=800",
    ],
    address: "789 Willow Lane, Austin, TX 78705",
    rating: 4.9,
    reviewCount: 56,
    priceRange: "$4,800/mo",
    primaryCategory: "Hospice",
    careTypes: ["Skilled Nursing", "Memory Care"],
    highlights: ["Palliative Care", "Family Counseling", "24/7 Support"],
    acceptedPayments: ["Medicare", "Medicaid", "Private Pay"],
    verified: true,
    description: "Compassionate end-of-life care with dignity",
    staffImage: "https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=200",
    staff: {
      name: "Dr. Emily Watson",
      position: "Medical Director",
      bio: "Hospice and palliative medicine specialist dedicated to ensuring comfort and quality of life for patients and their families.",
      image: "https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=200",
    },
  },
];

// Care categories for the browse section
const careCategories = [
  {
    id: "home-care",
    name: "Home Care",
    iconPath: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6",
  },
  {
    id: "home-health",
    name: "Home Health",
    iconPath: "M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z",
  },
  {
    id: "assisted-living",
    name: "Assisted Living",
    iconPath: "M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4",
  },
  {
    id: "memory-care",
    name: "Memory Care",
    iconPath: "M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z",
  },
  {
    id: "independent-living",
    name: "Independent Living",
    iconPath: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z",
  },
  {
    id: "nursing-home",
    name: "Nursing Home",
    iconPath: "M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10",
  },
];

// Sample providers by category (in real app, this would come from API)
const providersByCategory: Record<string, Provider[]> = {
  "home-care": [
    { ...topProviders[3], primaryCategory: "Home Care" },
    { ...topProviders[0], id: "hc-2", primaryCategory: "Home Care", name: "Comfort Keepers" },
    { ...topProviders[1], id: "hc-3", primaryCategory: "Home Care", name: "Home Instead" },
    { ...topProviders[2], id: "hc-4", primaryCategory: "Home Care", name: "Visiting Angels" },
    { ...topProviders[4], id: "hc-5", primaryCategory: "Home Care", name: "Right at Home" },
    { ...topProviders[5], id: "hc-6", primaryCategory: "Home Care", name: "BrightStar Care" },
    { ...topProviders[0], id: "hc-7", primaryCategory: "Home Care", name: "Seniors Helping Seniors" },
    { ...topProviders[1], id: "hc-8", primaryCategory: "Home Care", name: "Griswold Home Care" },
  ],
  "home-health": [
    { ...topProviders[5], primaryCategory: "Home Health" },
    { ...topProviders[0], id: "hh-2", primaryCategory: "Home Health", name: "Amedisys" },
    { ...topProviders[1], id: "hh-3", primaryCategory: "Home Health", name: "LHC Group" },
    { ...topProviders[2], id: "hh-4", primaryCategory: "Home Health", name: "Kindred at Home" },
    { ...topProviders[3], id: "hh-5", primaryCategory: "Home Health", name: "AccordantHealth" },
    { ...topProviders[4], id: "hh-6", primaryCategory: "Home Health", name: "Enhabit Home Health" },
    { ...topProviders[5], id: "hh-7", primaryCategory: "Home Health", name: "Elara Caring" },
    { ...topProviders[0], id: "hh-8", primaryCategory: "Home Health", name: "Bayada Home Health" },
  ],
  "assisted-living": [
    { ...topProviders[0], primaryCategory: "Assisted Living" },
    { ...topProviders[1], id: "al-2", primaryCategory: "Assisted Living", name: "Brookdale Senior Living" },
    { ...topProviders[2], id: "al-3", primaryCategory: "Assisted Living", name: "Five Star Senior Living" },
    { ...topProviders[3], id: "al-4", primaryCategory: "Assisted Living", name: "Atria Senior Living" },
    { ...topProviders[4], id: "al-5", primaryCategory: "Assisted Living", name: "Senior Lifestyle" },
    { ...topProviders[5], id: "al-6", primaryCategory: "Assisted Living", name: "Silverado" },
    { ...topProviders[0], id: "al-7", primaryCategory: "Assisted Living", name: "Belmont Village" },
    { ...topProviders[1], id: "al-8", primaryCategory: "Assisted Living", name: "Merrill Gardens" },
  ],
  "memory-care": [
    { ...topProviders[1], primaryCategory: "Memory Care" },
    { ...topProviders[0], id: "mc-2", primaryCategory: "Memory Care", name: "Silverado Memory Care" },
    { ...topProviders[2], id: "mc-3", primaryCategory: "Memory Care", name: "Arden Courts" },
    { ...topProviders[3], id: "mc-4", primaryCategory: "Memory Care", name: "Sunrise Memory Care" },
    { ...topProviders[4], id: "mc-5", primaryCategory: "Memory Care", name: "Artis Senior Living" },
    { ...topProviders[5], id: "mc-6", primaryCategory: "Memory Care", name: "Autumn Leaves" },
    { ...topProviders[0], id: "mc-7", primaryCategory: "Memory Care", name: "The Kensington" },
    { ...topProviders[1], id: "mc-8", primaryCategory: "Memory Care", name: "Bridges by EPOCH" },
  ],
  "independent-living": [
    { ...topProviders[2], primaryCategory: "Independent Living" },
    { ...topProviders[0], id: "il-2", primaryCategory: "Independent Living", name: "Vi Living" },
    { ...topProviders[1], id: "il-3", primaryCategory: "Independent Living", name: "Holiday Retirement" },
    { ...topProviders[3], id: "il-4", primaryCategory: "Independent Living", name: "Erickson Living" },
    { ...topProviders[4], id: "il-5", primaryCategory: "Independent Living", name: "Leisure Care" },
    { ...topProviders[5], id: "il-6", primaryCategory: "Independent Living", name: "Watermark Retirement" },
    { ...topProviders[0], id: "il-7", primaryCategory: "Independent Living", name: "Aegis Living" },
    { ...topProviders[1], id: "il-8", primaryCategory: "Independent Living", name: "Kisco Senior Living" },
  ],
  "nursing-home": [
    { ...topProviders[5], primaryCategory: "Nursing Home" },
    { ...topProviders[0], id: "nh-2", primaryCategory: "Nursing Home", name: "Genesis HealthCare" },
    { ...topProviders[1], id: "nh-3", primaryCategory: "Nursing Home", name: "PruittHealth" },
    { ...topProviders[2], id: "nh-4", primaryCategory: "Nursing Home", name: "Ensign Group" },
    { ...topProviders[3], id: "nh-5", primaryCategory: "Nursing Home", name: "Sabra Health Care" },
    { ...topProviders[4], id: "nh-6", primaryCategory: "Nursing Home", name: "ProMedica Senior Care" },
    { ...topProviders[5], id: "nh-7", primaryCategory: "Nursing Home", name: "Life Care Centers" },
    { ...topProviders[0], id: "nh-8", primaryCategory: "Nursing Home", name: "Consulate Health Care" },
  ],
};

// Care type options for search dropdown
const careTypeOptions = [
  { value: "", label: "Type of care" },
  { value: "assisted-living", label: "Assisted Living" },
  { value: "home-care", label: "Home Care" },
  { value: "memory-care", label: "Memory Care" },
  { value: "independent-living", label: "Independent Living" },
  { value: "skilled-nursing", label: "Skilled Nursing" },
  { value: "respite-care", label: "Respite Care" },
];

// Scrolling tags data
const scrollingTags = {
  row1: [
    "Memory Care Specialists",
    "24/7 Nursing Staff",
    "Pet-Friendly Communities",
    "Veteran Discounts",
    "Dementia Support",
    "Spanish-Speaking Staff",
    "Physical Therapy On-Site",
    "Chef-Prepared Meals",
  ],
  row2: [
    "In-Home Care",
    "Art & Music Therapy",
    "Transportation Services",
    "Medication Management",
    "Garden & Outdoor Spaces",
    "24/7 Family Support",
    "Assisted Bathing",
    "Personalized Care Plans",
  ],
};

// Counter targets - defined outside component to avoid re-creating on every render
const counterTargets = [
  { end: 48000, duration: 2000 },
  { end: 12000, duration: 2000 },
  { end: 500, duration: 1500 },
];

// Social Proof Section Component
function SocialProofSection() {
  // Single ref to trigger all counters when section is in view
  const { isInView, ref } = useInView(0.3);

  // All counters animate together
  const [providersCount, familiesCount, citiesCount] = useAnimatedCounters(
    counterTargets,
    isInView
  );

  return (
    <section className="py-16 md:py-24 relative overflow-hidden">
      {/* Section Header */}
      <div className="text-center mb-6 relative">
        <p className="text-primary-600 font-semibold text-sm uppercase tracking-wider mb-2">Trusted nationwide</p>
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
          Helping families find care
        </h2>
      </div>

      {/* ========== Enhanced Connected Journey — Premium Stats Section ========== */}
      <div ref={ref} className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Flowing connection line with enhanced animation */}
          <svg className="absolute top-1/2 left-0 w-full h-32 -translate-y-1/2 hidden md:block" preserveAspectRatio="none" viewBox="0 0 800 100">
            <defs>
              {/* Gradient for the main line */}
              <linearGradient id="lineGradientEnhanced" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="rgb(25, 144, 135)" stopOpacity="0.6" />
                <stop offset="50%" stopColor="rgb(194, 120, 86)" stopOpacity="0.8" />
                <stop offset="100%" stopColor="rgb(25, 144, 135)" stopOpacity="0.6" />
              </linearGradient>
              {/* Glow filter */}
              <filter id="glow">
                <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                <feMerge>
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
              {/* Animated gradient for traveling dot */}
              <radialGradient id="dotGradient">
                <stop offset="0%" stopColor="rgb(25, 144, 135)" stopOpacity="1" />
                <stop offset="100%" stopColor="rgb(25, 144, 135)" stopOpacity="0" />
              </radialGradient>
            </defs>

            {/* Shadow/glow line underneath */}
            <path
              d="M 60 50 Q 200 15, 400 50 T 740 50"
              stroke="url(#lineGradientEnhanced)"
              strokeWidth="8"
              fill="none"
              strokeLinecap="round"
              opacity="0.3"
              filter="url(#glow)"
            />

            {/* Main flowing line */}
            <path
              d="M 60 50 Q 200 15, 400 50 T 740 50"
              stroke="url(#lineGradientEnhanced)"
              strokeWidth="3"
              fill="none"
              strokeLinecap="round"
              strokeDasharray="8 4"
              className="animate-pulse"
            />

            {/* Multiple animated dots traveling along the path */}
            <circle r="6" fill="rgb(25, 144, 135)" filter="url(#glow)">
              <animateMotion dur="3s" repeatCount="indefinite" path="M 60 50 Q 200 15, 400 50 T 740 50" />
            </circle>
            <circle r="4" fill="rgb(194, 120, 86)" filter="url(#glow)">
              <animateMotion dur="3s" repeatCount="indefinite" begin="1s" path="M 60 50 Q 200 15, 400 50 T 740 50" />
            </circle>
            <circle r="5" fill="rgb(25, 144, 135)" filter="url(#glow)">
              <animateMotion dur="3s" repeatCount="indefinite" begin="2s" path="M 60 50 Q 200 15, 400 50 T 740 50" />
            </circle>
          </svg>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 relative z-10">
            {/* Stat 1 — Providers */}
            <div className="group text-center">
              <div className="relative inline-block mb-6">
                {/* Outer pulsing ring */}
                <div className="absolute inset-0 w-36 h-36 -m-4 rounded-full bg-gradient-to-br from-primary-400/20 to-transparent animate-ping opacity-20" style={{ animationDuration: '3s' }} />

                {/* Main circle container */}
                <div className="relative w-28 h-28 rounded-full bg-gradient-to-br from-primary-100 to-white flex items-center justify-center shadow-xl shadow-primary-500/20 group-hover:shadow-2xl group-hover:shadow-primary-500/30 transition-all duration-700 group-hover:scale-110">
                  {/* Inner decorative ring */}
                  <div className="absolute inset-2 rounded-full border-2 border-dashed border-primary-200/50 animate-spin" style={{ animationDuration: '20s' }} />

                  {/* Icon container */}
                  <div className="relative w-16 h-16 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center shadow-lg transform group-hover:rotate-12 transition-transform duration-500">
                    <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                </div>

                {/* Step badge */}
                <div className="absolute -bottom-2 -right-2 w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 text-white text-sm font-bold flex items-center justify-center shadow-lg shadow-primary-500/40 border-4 border-white">
                  1
                </div>
              </div>

              <p className="text-4xl md:text-5xl font-bold text-gray-900 tracking-tight tabular-nums mb-2 group-hover:text-primary-700 transition-colors duration-300">
                {providersCount.toLocaleString()}+
              </p>
              <p className="text-gray-700 font-semibold text-lg">Providers Listed</p>
            </div>

            {/* Stat 2 — Families (Center, emphasized) */}
            <div className="group text-center md:mt-6">
              <div className="relative inline-block mb-6">
                {/* Outer pulsing ring */}
                <div className="absolute inset-0 w-44 h-44 -m-5 rounded-full bg-gradient-to-br from-warm-400/25 to-transparent animate-ping opacity-25" style={{ animationDuration: '2.5s' }} />

                {/* Secondary glow ring */}
                <div className="absolute inset-0 w-40 h-40 -m-3 rounded-full border-2 border-warm-300/30 animate-pulse" />

                {/* Main circle container - larger for emphasis */}
                <div className="relative w-34 h-34 rounded-full bg-gradient-to-br from-warm-100 via-white to-warm-50 flex items-center justify-center shadow-2xl shadow-warm-500/25 group-hover:shadow-3xl group-hover:shadow-warm-500/40 transition-all duration-700 group-hover:scale-110" style={{ width: '136px', height: '136px' }}>
                  {/* Inner decorative ring */}
                  <div className="absolute inset-3 rounded-full border-2 border-dashed border-warm-200/50 animate-spin" style={{ animationDuration: '15s', animationDirection: 'reverse' }} />

                  {/* Floating hearts decoration */}
                  <div className="absolute -top-1 -left-1 w-4 h-4 text-warm-400 animate-bounce" style={{ animationDuration: '2s' }}>
                    <svg fill="currentColor" viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
                  </div>
                  <div className="absolute -top-2 right-2 w-3 h-3 text-warm-300 animate-bounce" style={{ animationDuration: '2.5s', animationDelay: '0.5s' }}>
                    <svg fill="currentColor" viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
                  </div>

                  {/* Icon container */}
                  <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-warm-400 via-warm-500 to-warm-600 flex items-center justify-center shadow-xl transform group-hover:rotate-6 group-hover:scale-105 transition-all duration-500">
                    <svg className="w-9 h-9 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                  </div>
                </div>

                {/* Step badge */}
                <div className="absolute -bottom-2 -right-2 w-10 h-10 rounded-full bg-gradient-to-br from-warm-500 to-warm-700 text-white text-sm font-bold flex items-center justify-center shadow-lg shadow-warm-500/40 border-4 border-white">
                  2
                </div>
              </div>

              <p className="text-5xl md:text-6xl font-bold text-gray-900 tracking-tight tabular-nums mb-2 group-hover:text-warm-600 transition-colors duration-300">
                {familiesCount.toLocaleString()}+
              </p>
              <p className="text-gray-700 font-semibold text-xl">Families Connected</p>
            </div>

            {/* Stat 3 — Cities */}
            <div className="group text-center">
              <div className="relative inline-block mb-6">
                {/* Outer pulsing ring */}
                <div className="absolute inset-0 w-36 h-36 -m-4 rounded-full bg-gradient-to-br from-primary-500/20 to-transparent animate-ping opacity-20" style={{ animationDuration: '3.5s' }} />

                {/* Main circle container */}
                <div className="relative w-28 h-28 rounded-full bg-gradient-to-br from-primary-100 to-white flex items-center justify-center shadow-xl shadow-primary-600/20 group-hover:shadow-2xl group-hover:shadow-primary-600/30 transition-all duration-700 group-hover:scale-110">
                  {/* Inner decorative ring */}
                  <div className="absolute inset-2 rounded-full border-2 border-dashed border-primary-200/50 animate-spin" style={{ animationDuration: '25s' }} />

                  {/* Decorative dots representing cities */}
                  <div className="absolute top-0 left-1/2 w-2 h-2 bg-primary-400 rounded-full -translate-x-1/2 -translate-y-1" />
                  <div className="absolute bottom-1 right-2 w-1.5 h-1.5 bg-primary-300 rounded-full" />
                  <div className="absolute top-4 left-1 w-1.5 h-1.5 bg-primary-300 rounded-full" />

                  {/* Icon container */}
                  <div className="relative w-16 h-16 rounded-full bg-gradient-to-br from-primary-600 to-primary-700 flex items-center justify-center shadow-lg transform group-hover:-rotate-12 transition-transform duration-500">
                    <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                </div>

                {/* Step badge */}
                <div className="absolute -bottom-2 -right-2 w-10 h-10 rounded-full bg-gradient-to-br from-primary-600 to-primary-800 text-white text-sm font-bold flex items-center justify-center shadow-lg shadow-primary-600/40 border-4 border-white">
                  3
                </div>
              </div>

              <p className="text-4xl md:text-5xl font-bold text-primary-600 tracking-tight tabular-nums mb-2 group-hover:text-primary-700 transition-colors duration-300">
                {citiesCount.toLocaleString()}+
              </p>
              <p className="text-gray-700 font-semibold text-lg">Cities Covered</p>
            </div>
          </div>
        </div>

      {/* Video Card */}
      <div className="mt-6 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="relative bg-gradient-to-br from-warm-50 to-warm-100/50 rounded-3xl overflow-hidden border border-warm-200/50">
          <div className="relative flex items-center justify-center p-8 md:p-12 lg:p-16">
            <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-12 w-full max-w-6xl">
              {/* Left side - Text content */}
              <div className="flex flex-col lg:w-[40%]">
                {/* Chapter badge */}
                <div className="flex items-center gap-3 mb-6">
                  <span className="inline-flex items-center gap-1.5 bg-primary-500/10 border border-primary-500/20 text-primary-600 text-xs font-semibold px-3 py-1.5 rounded-full">
                    <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                    </svg>
                    Chapter 1
                  </span>
                  <span className="text-warm-600 text-sm">Documentary Series</span>
                </div>

                <h3 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 leading-tight mb-4">
                  Aging in America
                </h3>

                <p className="text-gray-600 text-base mb-8 max-w-sm leading-relaxed">
                  Explore the realities of senior care in America and discover how families navigate finding the right care.
                </p>

                <div className="flex flex-col sm:flex-row sm:items-center items-start gap-4">
                  <Link
                    href="/browse"
                    className="group inline-flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white font-semibold px-6 py-3.5 rounded-xl transition-all duration-300"
                  >
                    Start Your Search
                    <svg className="w-5 h-5 transition-transform group-hover:translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                  <Link
                    href="https://youtube.com/@olera"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 text-sm font-medium transition-colors"
                  >
                    Watch more chapters
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </Link>
                </div>
              </div>

              {/* Right side - YouTube Video */}
              <div className="lg:w-[60%]">
                <div className="relative w-full">
                  {/* Video container */}
                  <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-black">
                    <iframe
                      src="https://www.youtube.com/embed/TiVrqkrYhEc"
                      title="Aging in America - Chapter 1"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="w-full h-full"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// Bento Grid Data - Senior care focused images (2 rows, 4 columns)
const bentoCards = [
  {
    id: 1,
    title: "Memory Care",
    image: "https://images.unsplash.com/photo-1442458370899-ae20e367c5d8?w=800&q=80", // grandmother with family
    href: "/browse?type=memory-care",
    className: "col-span-1 row-span-2", // tall left
  },
  {
    id: 2,
    title: "Home Care",
    image: "https://images.unsplash.com/photo-1586105251261-72a756497a11?w=800&q=80", // caregiver and senior
    href: "/browse?type=home-care",
    className: "col-span-2 row-span-1", // wide top middle
  },
  {
    id: 3,
    title: "Assisted Living",
    image: "https://images.unsplash.com/photo-1505455184862-554165e5f6ba?w=800&q=80", // happy seniors
    href: "/browse?type=assisted-living",
    className: "col-span-1 row-span-2", // tall right
  },
  {
    id: 4,
    title: "Skilled Nursing",
    image: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&q=80", // nurse caring
    href: "/browse?type=skilled-nursing",
    className: "col-span-1 row-span-1", // square bottom left-middle
  },
  {
    id: 5,
    title: "Hospice Care",
    image: "https://images.unsplash.com/photo-1559234938-b60fff04894d?w=800&q=80", // caring hands
    href: "/browse?type=hospice",
    className: "col-span-1 row-span-1", // square bottom right-middle
  },
];

// Bento Grid Section Component
function BentoGridSection() {
  return (
    <section className="py-16 md:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
            Explore Care Options
          </h2>
        </div>

        {/* Bento Grid - 2 rows, 4 columns */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-5 auto-rows-[180px] md:auto-rows-[200px]">
          {bentoCards.map((card, index) => (
            <Link
              key={card.id}
              href={card.href}
              className={`relative overflow-hidden rounded-3xl group cursor-pointer ${card.className}`}
              style={{
                boxShadow: '0 4px 20px -2px rgba(0,0,0,0.1), 0 2px 8px -2px rgba(0,0,0,0.06)',
              }}
            >
              {/* Image layer */}
              <div className="absolute inset-0">
                <Image
                  src={card.image}
                  alt={card.title}
                  fill
                  className="object-cover transition-all duration-700 ease-out group-hover:scale-110"
                />
              </div>

              {/* Gradient overlays - creates depth */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-black/5 transition-opacity duration-500" />
              <div className="absolute inset-0 bg-gradient-to-br from-primary-600/0 via-transparent to-warm-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

              {/* Shine effect on hover */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700">
                <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
              </div>

              {/* Top badge - category indicator */}
              <div className="absolute top-4 left-4 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
                <span className="inline-flex items-center gap-2 bg-white text-gray-900 text-xs font-semibold px-3 py-2 rounded-full shadow-lg">
                  <span className="w-2 h-2 bg-primary-500 rounded-full animate-pulse" />
                  Browse {card.title}
                </span>
              </div>

              {/* Bottom content */}
              <div className="absolute bottom-0 left-0 right-0 p-5 md:p-6">
                <div className="flex items-end justify-between gap-3">
                  {/* Title with animated underline */}
                  <div className="flex-1">
                    <h3 className="text-white font-bold text-lg md:text-xl lg:text-2xl leading-tight tracking-tight">
                      {card.title}
                    </h3>
                    <div className="h-0.5 bg-primary-400 mt-2 w-0 group-hover:w-full transition-all duration-500 ease-out rounded-full" />
                  </div>

                  {/* Arrow button */}
                  <div className="flex-shrink-0 w-10 h-10 md:w-12 md:h-12 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center group-hover:bg-primary-500 group-hover:border-primary-500 transition-all duration-300 group-hover:scale-110">
                    <svg
                      className="w-5 h-5 md:w-6 md:h-6 text-white transition-transform duration-300 group-hover:translate-x-0.5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Corner accent */}
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-primary-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

              {/* Ring on hover */}
              <div className="absolute inset-0 rounded-3xl ring-2 ring-white/0 group-hover:ring-white/30 transition-all duration-300" />
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

// Browse by Care Type Section Component
function BrowseByCareTypeSection() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>("home-care");
  const [isAnimating, setIsAnimating] = useState(false);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const updateScrollState = useCallback(() => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  }, []);

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (container) {
      // Reset scroll to start when category changes
      container.scrollTo({ left: 0, behavior: "instant" });
      // Small delay to let DOM update before checking scroll state
      setTimeout(() => {
        updateScrollState();
      }, 50);
      container.addEventListener("scroll", updateScrollState);
      window.addEventListener("resize", updateScrollState);
      return () => {
        container.removeEventListener("scroll", updateScrollState);
        window.removeEventListener("resize", updateScrollState);
      };
    }
  }, [updateScrollState, selectedCategory]);

  const scrollLeft = () => {
    const container = scrollContainerRef.current;
    if (container) {
      const newScrollLeft = Math.max(0, container.scrollLeft - 400);
      container.scrollTo({ left: newScrollLeft, behavior: "smooth" });
    }
  };

  const scrollRight = () => {
    const container = scrollContainerRef.current;
    if (container) {
      const maxScroll = container.scrollWidth - container.clientWidth;
      const newScrollLeft = Math.min(maxScroll, container.scrollLeft + 400);
      container.scrollTo({ left: newScrollLeft, behavior: "smooth" });
    }
  };

  const handleCategoryClick = (categoryId: string) => {
    if (selectedCategory === categoryId) {
      // Don't deselect - always keep one selected
      return;
    } else {
      // Select new category
      setIsAnimating(true);
      // Reset scroll position when changing category
      if (scrollContainerRef.current) {
        scrollContainerRef.current.scrollTo({ left: 0, behavior: "instant" });
      }
      setTimeout(() => {
        setSelectedCategory(categoryId);
        setIsAnimating(false);
      }, 200);
    }
  };

  const selectedProviders = selectedCategory ? providersByCategory[selectedCategory] || [] : [];

  return (
    <section className="pt-16 md:pt-24 pb-6 md:pb-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="mb-6">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
            Browse by care type
          </h2>
        </div>

        {/* Category Tabs - Equal width grid layout */}
        <div className="grid grid-cols-3 md:grid-cols-6 gap-2 md:gap-3">
          {careCategories.map((category) => {
            const isSelected = selectedCategory === category.id;
            return (
              <button
                key={category.id}
                onClick={() => handleCategoryClick(category.id)}
                className={`rounded-xl border transition-all duration-200 px-3 py-3 flex items-center justify-center gap-2 ${
                  isSelected
                    ? "border-primary-500 bg-primary-50 shadow-sm"
                    : "border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50"
                }`}
              >
                {/* Icon */}
                <div
                  className={`w-8 h-8 rounded-lg flex-shrink-0 flex items-center justify-center transition-colors duration-200 ${
                    isSelected
                      ? "bg-primary-100"
                      : "bg-primary-50"
                  }`}
                >
                  <svg className="w-4 h-4 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={category.iconPath} />
                  </svg>
                </div>
                {/* Category Name */}
                <span className={`font-medium text-sm transition-colors duration-200 ${
                  isSelected
                    ? "text-primary-700"
                    : "text-gray-700"
                }`}>
                  {category.name}
                </span>
              </button>
            );
          })}
        </div>

        {/* Provider Cards - Horizontal Scroll */}
        <div
          className={`overflow-hidden transition-all duration-300 ease-out ${
            selectedCategory && !isAnimating
              ? "max-h-[700px] opacity-100"
              : "max-h-0 opacity-0"
          }`}
        >
          <div className={`pt-8 transition-all duration-300 ${isAnimating ? "opacity-0 translate-y-4" : "opacity-100 translate-y-0"}`}>
            {/* Horizontal Scroll Container with Arrows */}
            <div className="relative overflow-visible">
              {/* Left Arrow */}
              <button
                onClick={scrollLeft}
                disabled={!canScrollLeft}
                className={`hidden md:flex absolute -left-6 top-1/2 -translate-y-1/2 z-10 w-12 h-12 rounded-full bg-white shadow-xl border border-gray-200 items-center justify-center transition-all ${
                  canScrollLeft
                    ? "hover:bg-gray-50 hover:shadow-2xl hover:scale-105 cursor-pointer"
                    : "opacity-50 cursor-not-allowed"
                }`}
                aria-label="Scroll left"
              >
                <svg className={`w-6 h-6 ${canScrollLeft ? "text-gray-700" : "text-gray-400"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                </svg>
              </button>

              {/* Right Arrow */}
              <button
                onClick={scrollRight}
                disabled={!canScrollRight}
                className={`hidden md:flex absolute -right-6 top-1/2 -translate-y-1/2 z-10 w-12 h-12 rounded-full bg-white shadow-xl border border-gray-200 items-center justify-center transition-all ${
                  canScrollRight
                    ? "hover:bg-gray-50 hover:shadow-2xl hover:scale-105 cursor-pointer"
                    : "opacity-50 cursor-not-allowed"
                }`}
                aria-label="Scroll right"
              >
                <svg className={`w-6 h-6 ${canScrollRight ? "text-gray-700" : "text-gray-400"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                </svg>
              </button>

              {/* Scrollable Container */}
              <div
                ref={scrollContainerRef}
                className="flex gap-5 overflow-x-scroll pb-4 scrollbar-hide"
              >
                {selectedProviders.slice(0, 6).map((provider) => (
                  <div key={provider.id} className="flex-shrink-0 w-[370px] h-[512px]">
                    <ProviderCard provider={provider} />
                  </div>
                ))}
              </div>
            </div>

            {/* View All Link */}
            <div className="mt-4 text-center">
              <Link
                href={`/browse?type=${selectedCategory}`}
                className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700 font-medium"
              >
                View all {careCategories.find(c => c.id === selectedCategory)?.name} providers
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function HomePage() {
  const [location, setLocation] = useState("");
  const [careType, setCareType] = useState("");
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const router = useRouter();
  const scrollContainerRef = React.useRef<HTMLDivElement>(null);

  const updateScrollState = useCallback(() => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10); // 10px threshold
    }
  }, []);

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (container) {
      updateScrollState();
      container.addEventListener("scroll", updateScrollState);
      window.addEventListener("resize", updateScrollState);
      return () => {
        container.removeEventListener("scroll", updateScrollState);
        window.removeEventListener("resize", updateScrollState);
      };
    }
  }, [updateScrollState]);

  const scrollLeft_handler = () => {
    const container = scrollContainerRef.current;
    if (container) {
      const newScrollLeft = Math.max(0, container.scrollLeft - 400);
      container.scrollTo({ left: newScrollLeft, behavior: "smooth" });
    }
  };

  const scrollRight_handler = () => {
    const container = scrollContainerRef.current;
    if (container) {
      const maxScroll = container.scrollWidth - container.clientWidth;
      const newScrollLeft = Math.min(maxScroll, container.scrollLeft + 400);
      container.scrollTo({ left: newScrollLeft, behavior: "smooth" });
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (location.trim()) {
      params.set("location", location.trim());
    }
    if (careType) {
      params.set("type", careType);
    }
    router.push(`/browse?${params.toString()}`);
  };

  return (
    <div className="bg-[#FFFEF8]">
      {/* Hero Section - Full Image Background */}
      <section className="pt-4 pb-8">
        <div className="mx-4 sm:mx-6 lg:mx-8">
          <div className="relative rounded-[2rem] min-h-[75vh] flex items-center px-8 md:px-16 lg:px-20 py-16 md:py-20 overflow-hidden">
            {/* Background Image */}
            <img
              src="/hero.png"
              alt=""
              className="absolute inset-0 w-full h-full object-cover"
            />
            {/* Warm gradient overlay for readability */}
            <div className="absolute inset-0 bg-gradient-to-r from-warm-950/85 via-warm-900/70 to-warm-900/40" />
            <div className="absolute inset-0 bg-gradient-to-t from-warm-950/50 via-transparent to-warm-900/20" />

            {/* Content */}
            <div className="relative z-10 max-w-7xl mx-auto w-full flex flex-col items-center text-center">
              {/* Social Proof Pill */}
              <div className="inline-flex items-center gap-2.5 bg-white/15 backdrop-blur-sm border border-white/20 px-4 py-2 rounded-full text-sm font-medium text-white mb-6">
                <span className="flex items-center justify-center w-5 h-5 bg-primary-500 rounded-full">
                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                  </svg>
                </span>
                <span>48,000+ care providers</span>
              </div>

              <h1 className="text-4xl md:text-5xl lg:text-[80px] font-bold leading-tight text-white">
                Find the right care
                <br />
                <span className="text-primary-200">for your loved one</span>
              </h1>

              {/* Search Bar */}
              <div className="mt-8 w-full max-w-3xl">
                <form onSubmit={handleSearch}>
                  <div className="bg-white/95 backdrop-blur-sm shadow-2xl p-3 flex flex-col sm:flex-row sm:items-center gap-3 rounded-2xl">
                    {/* Location Input */}
                    <div className="flex-1 flex items-center px-4 py-3 bg-gray-50 rounded-xl border border-gray-200 hover:border-gray-300 transition-colors">
                      <svg
                        className="w-5 h-5 text-gray-400 flex-shrink-0"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                      <input
                        type="text"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        placeholder="City or ZIP code"
                        className="w-full ml-3 bg-transparent border-none text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-0 text-base"
                      />
                    </div>

                    {/* Care Type Dropdown */}
                    <div className="flex-1 flex items-center px-4 py-3 bg-gray-50 rounded-xl border border-gray-200 hover:border-gray-300 transition-colors">
                      <svg
                        className="w-5 h-5 text-gray-400 flex-shrink-0"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                        />
                      </svg>
                      <select
                        value={careType}
                        onChange={(e) => setCareType(e.target.value)}
                        className="w-full ml-3 bg-transparent border-none text-gray-900 focus:outline-none focus:ring-0 text-base cursor-pointer appearance-none"
                      >
                        {careTypeOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                      <svg
                        className="w-4 h-4 text-gray-400 flex-shrink-0"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>

                    {/* Search Button */}
                    <button
                      type="submit"
                      className="bg-primary-600 hover:bg-primary-700 text-white font-semibold text-base px-6 py-3 rounded-xl shadow-lg shadow-primary-600/25 transition-all duration-200 whitespace-nowrap flex items-center justify-center gap-2"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                      <span>Search</span>
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Top Providers Section */}
      <section className="pt-8 md:pt-12 pb-16 md:pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header with title and View All button */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
              Top providers near you
            </h2>
            <Link
              href="/browse"
              className="hidden sm:inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-colors"
            >
              View all providers
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>

          {/* Provider Cards - Horizontal Scroll with Side Arrows */}
          <div className="relative overflow-visible">
            {/* Left Arrow */}
            <button
              onClick={scrollLeft_handler}
              disabled={!canScrollLeft}
              className={`hidden md:flex absolute -left-6 top-1/2 -translate-y-1/2 z-10 w-12 h-12 rounded-full bg-white shadow-xl border border-gray-200 items-center justify-center transition-all ${
                canScrollLeft
                  ? "hover:bg-gray-50 hover:shadow-2xl hover:scale-105 cursor-pointer"
                  : "opacity-50 cursor-not-allowed"
              }`}
              aria-label="Scroll left"
            >
              <svg className={`w-6 h-6 ${canScrollLeft ? "text-gray-700" : "text-gray-400"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            {/* Right Arrow */}
            <button
              onClick={scrollRight_handler}
              disabled={!canScrollRight}
              className={`hidden md:flex absolute -right-6 top-1/2 -translate-y-1/2 z-10 w-12 h-12 rounded-full bg-white shadow-xl border border-gray-200 items-center justify-center transition-all ${
                canScrollRight
                  ? "hover:bg-gray-50 hover:shadow-2xl hover:scale-105 cursor-pointer"
                  : "opacity-50 cursor-not-allowed"
              }`}
              aria-label="Scroll right"
            >
              <svg className={`w-6 h-6 ${canScrollRight ? "text-gray-700" : "text-gray-400"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
              </svg>
            </button>

            {/* Scrollable Container */}
            <div
              ref={scrollContainerRef}
              className="flex gap-5 overflow-x-scroll pb-4 scrollbar-hide"
            >
              {topProviders.map((provider) => (
                <div key={provider.id} className="flex-shrink-0 w-[370px] h-[512px]">
                  <ProviderCard provider={provider} />
                </div>
              ))}
            </div>
          </div>

          {/* Mobile View All button */}
          <div className="mt-6 text-center sm:hidden">
            <Link
              href="/browse"
              className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              View all providers
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* Bento Grid - Explore Care Options */}
      <BentoGridSection />

      {/* Social Proof Stats Section */}
      <SocialProofSection />

      {/* Browse by Care Type Section */}
      <BrowseByCareTypeSection />

      {/* How It Works Section */}
      <section className="py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
              How Olera Works
            </h2>
            <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
              Finding care shouldn&apos;t be overwhelming. We make it simple.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: "1",
                title: "Search Your Area",
                description:
                  "Enter your location to see care providers near you. Filter by care type, amenities, and more.",
              },
              {
                step: "2",
                title: "Compare Options",
                description:
                  "Browse detailed profiles, read about services, and save your favorites to compare.",
              },
              {
                step: "3",
                title: "Connect Directly",
                description:
                  "Request a consultation with providers you're interested in. No middleman, no pressure.",
              },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-primary-700 font-bold text-lg">
                    {item.step}
                  </span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900">
                  {item.title}
                </h3>
                <p className="mt-2 text-gray-600">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
            Ready to Start Your Search?
          </h2>
          <p className="mt-4 text-lg text-gray-600">
            Join thousands of families who have found the right care through
            Olera.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/browse" className="btn-primary">
              Browse Care Options
            </Link>
            <Link href="/auth/signup" className="btn-secondary">
              Create Free Account
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
