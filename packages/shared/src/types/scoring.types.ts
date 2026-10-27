import { OpportunityLevel } from './lead.types';

export type SectorProfileKey =
  | 'HOTELS_TOURISM'
  | 'RESTAURANTS'
  | 'CLINICS'
  | 'RETAIL'
  | 'GENERAL';

// Legacy Backward-Compatible Scoring Interfaces
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

export interface ScoringResult {
  digitalScore: number;
  opportunityScore: number;
  opportunityTier: OpportunityLevel;
  breakdown: ScoringBreakdown;
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


export type CheckOutcome =
  | 'PRESENT'
  | 'ABSENT'
  | 'NOT_DETECTED'
  | 'UNKNOWN'
  | 'BLOCKED'
  | 'ERROR'
  | 'NOT_APPLICABLE';

export type CheckSeverity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'INFO';

export interface SectorProfileConfig {
  key: SectorProfileKey;
  label: string;
  icon: string;
  description: string;
  requiredCapabilities: string[];
  capabilityWeights: Record<string, number>;
  confidenceGate: number; // e.g. 0.40 (40%) minimum coverage
}

export interface RuleContribution {
  ruleKey: string;
  ruleLabel: string;
  dimension: 'digitalNeed' | 'serviceFit' | 'evidenceConfidence';
  weight: number;
  pointsContributed: number;
  outcome: CheckOutcome;
  evidenceRef?: string;
  reason: string;
  isExcluded?: boolean;
}

export interface ScoreObservationInput {
  hasWebsite: CheckOutcome;
  hasValidSsl: CheckOutcome;
  hasCustomDomain: CheckOutcome;
  isResponsive: CheckOutcome;
  hasMetaOg: CheckOutcome;
  hasSocialMedia: CheckOutcome;
  hasWhatsapp: CheckOutcome;
  hasContactForm: CheckOutcome;
  hasOnlineBooking: CheckOutcome;
  hasOnlineMenu: CheckOutcome;
  hasProductCatalog: CheckOutcome;
  hasAppointmentInfo: CheckOutcome;
  hasStructuredData: CheckOutcome;
  googleRating: number | null;
  googleUserRatingsTotal: number | null;
  googleMapsVerified: CheckOutcome;
  performanceScoreMobile: number | null;
  performanceScoreDesktop: number | null;
  pagesInspectedCount: number;
  pagesTargetedCount: number;
  sectorProfile?: SectorProfileKey;
  cmsName?: string | null;
  observationTimestamp?: string;
}

export interface ExplainableScoringResult {
  // ── 3 Primary Inspectable Dimensions (0-100) ──
  /** Digital Need: verified gaps relevant to the specific business sector */
  digitalNeed: number;
  /** Service Fit: alignment between verified gaps and active VERTEX catalog services */
  serviceFit: number;
  /** Evidence Confidence: audit coverage, source verification, recency */
  evidenceConfidence: number;

  /** Overall Opportunity Score: balanced combination of need and fit weighted by confidence */
  overallOpportunityScore: number;
  opportunityTier: 'VERY_HIGH' | 'HIGH' | 'MEDIUM' | 'LOW' | 'INSUFFICIENT_EVIDENCE';

  /** Coverage metrics */
  evidenceCoverage: number; // 0.0 - 1.0
  isInsufficientEvidence: boolean;
  coverageGateThreshold: number;

  /** Metadata for auditability & immutability */
  scoringVersion: string;
  configVersion: string;
  sectorProfile: SectorProfileKey;
  calculatedAt: string;

  /** Full rule-by-rule contributions and explanations */
  ruleContributions: RuleContribution[];
  exclusions: string[];
  summaryExplanation: string;
}

export interface ManualScoreOverride {
  actor: string;
  reason: string;
  timestamp: string;
  originalDigitalNeed: number;
  overriddenDigitalNeed: number;
  originalServiceFit: number;
  overriddenServiceFit: number;
  preservedObservations: ScoreObservationInput;
}
