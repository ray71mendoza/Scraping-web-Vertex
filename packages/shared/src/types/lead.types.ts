// ═══════════════════════════════════════════════════════════
// VERTEX Prospect — Lead Types
// ═══════════════════════════════════════════════════════════

export enum LeadStatus {
  DISCOVERED = 'DISCOVERED',
  QUALIFIED = 'QUALIFIED',
  PROPOSAL_GENERATED = 'PROPOSAL_GENERATED',
  CONTACTED = 'CONTACTED',
  CONVERTED = 'CONVERTED',
  DISCARDED = 'DISCARDED',
}

export enum OpportunityLevel {
  VERY_HIGH = 'VERY_HIGH',
  HIGH = 'HIGH',
  MEDIUM = 'MEDIUM',
  LOW = 'LOW',
}

export interface LeadDigitalFlags {
  hasWebsite: boolean;
  hasValidSsl: boolean;
  hasCustomDomain: boolean;
  isResponsive: boolean;
  hasMetaOg: boolean;
  hasFacebook: boolean;
  hasInstagram: boolean;
  hasWhatsapp: boolean;
  hasTiktok: boolean;
  detectedEmails: string[];
  detectedCms: string | null;
}

export interface Lead {
  id: string;
  campaignId: string;
  organizationId: string;
  googlePlaceId: string;
  businessName: string;
  formattedAddress: string | null;
  internationalPhone: string | null;
  websiteUrl: string | null;
  googleRating: number | null;
  googleUserRatingsTotal: number | null;

  // Digital flags
  hasWebsite: boolean;
  hasValidSsl: boolean;
  hasCustomDomain: boolean;
  hasFacebook: boolean;
  hasInstagram: boolean;
  hasWhatsapp: boolean;
  hasTiktok: boolean;
  detectedEmails: string[];
  detectedCms: string | null;

  // Scoring
  digitalScore: number;
  opportunityScore: number;
  opportunityTier: OpportunityLevel;

  // Status & AI
  status: LeadStatus;
  aiDiagnosis: AIDiagnosis | null;

  createdAt: Date;
  updatedAt: Date;
}

export interface LeadListFilters {
  campaignId?: string;
  organizationId?: string;
  status?: LeadStatus;
  opportunityTier?: OpportunityLevel;
  search?: string;
  sortBy?: 'opportunityScore' | 'digitalScore' | 'businessName' | 'createdAt' | 'googleRating';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface LeadListResponse {
  data: Lead[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface AIDiagnosis {
  digitalGapAnalysis: string;
  highImpactServices: string[];
  outreachEmail: {
    subject: string;
    body: string;
  };
  whatsappHook: string;
}
