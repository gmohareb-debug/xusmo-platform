// =============================================================================
// Track & Tier Limits — Centralized limit definitions for Website / E-Commerce
// Usage: import { TRACK_LIMITS, getLimitsForTrack } from "@/lib/billing/limits";
// =============================================================================

import type { SiteTrack, SiteTier } from "@prisma/client";

export interface TrackTierLimits {
  pageLimit: number; // 0 = unlimited
  productLimit: number; // 0 = unlimited
}

export const TRACK_LIMITS: Record<SiteTrack, Record<SiteTier, TrackTierLimits>> = {
  WEBSITE: {
    FREE: { pageLimit: 5, productLimit: 0 },
    BASIC: { pageLimit: 10, productLimit: 0 },
    PRO: { pageLimit: 25, productLimit: 0 },
    AGENCY: { pageLimit: 0, productLimit: 0 },
  },
  ECOMMERCE: {
    FREE: { pageLimit: 5, productLimit: 10 },
    BASIC: { pageLimit: 10, productLimit: 50 },
    PRO: { pageLimit: 25, productLimit: 200 },
    AGENCY: { pageLimit: 0, productLimit: 0 },
  },
};

export function getLimitsForTrack(
  track: SiteTrack,
  tier: SiteTier
): TrackTierLimits {
  return TRACK_LIMITS[track]?.[tier] ?? TRACK_LIMITS.WEBSITE.FREE;
}
