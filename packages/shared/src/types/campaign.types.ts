// ═══════════════════════════════════════════════════════════
// VERTEX Prospect — Campaign Types
// ═══════════════════════════════════════════════════════════

export interface SearchCampaign {
  id: string;
  organizationId: string;
  queryTerm: string;
  location: string;
  radiusMeters: number;
  totalFound: number;
  status: string;
  createdAt: Date;
}

export interface CreateCampaignDto {
  queryTerm: string;
  location: string;
  radiusMeters: number;
}

export interface CampaignStats {
  totalLeads: number;
  byTier: {
    VERY_HIGH: number;
    HIGH: number;
    MEDIUM: number;
    LOW: number;
  };
  byStatus: Record<string, number>;
  avgOpportunityScore: number;
}
