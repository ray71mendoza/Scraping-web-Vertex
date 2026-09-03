// ═══════════════════════════════════════════════════════════
// VERTEX Prospect — Scoring Types
// ═══════════════════════════════════════════════════════════

import { OpportunityLevel } from './lead.types';

export interface ScoringInput {
  hasWebsite: boolean;
  hasValidSsl: boolean;
  hasCustomDomain: boolean;
  isResponsive: boolean;
  hasMetaOg: boolean;
  hasFacebook: boolean;
  hasInstagram: boolean;
  hasWhatsapp: boolean;
  googleRating: number | null;
  googleUserRatingsTotal: number | null;
  hasCompleteProfile: boolean;
}

export interface ScoringResult {
  digitalScore: number;
  opportunityScore: number;
  opportunityTier: OpportunityLevel;
  breakdown: ScoringBreakdown;
}

export interface ScoringBreakdown {
  webPresence: {
    hasWebsite: number;
    hasSsl: number;
    hasCustomDomain: number;
    isResponsive: number;
    hasMetaOg: number;
    subtotal: number;
  };
  socialChannels: {
    hasSocialMedia: number;
    hasWhatsapp: number;
    subtotal: number;
  };
  reputation: {
    reviewsAbove20: number;
    ratingAbove4: number;
    completeProfile: number;
    subtotal: number;
  };
  total: number;
}

export interface GooglePlaceResult {
  placeId: string;
  displayName: string;
  formattedAddress: string;
  nationalPhoneNumber: string | null;
  internationalPhoneNumber: string | null;
  websiteUri: string | null;
  rating: number | null;
  userRatingCount: number | null;
  googleMapsUri: string | null;
  businessStatus: string | null;
  types: string[];
  location: {
    latitude: number;
    longitude: number;
  } | null;
}

export interface GooglePlacesSearchParams {
  textQuery: string;
  locationBias?: {
    circle: {
      center: { latitude: number; longitude: number };
      radius: number;
    };
  };
  maxResultCount?: number;
}
