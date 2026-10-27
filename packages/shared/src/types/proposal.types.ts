// ═══════════════════════════════════════════════════════════
// VERTEX Prospect — Proposal & Solution Mapping Types
// ═══════════════════════════════════════════════════════════

export interface ProposalServiceItem {
  serviceId: string;
  serviceCode: string;
  serviceName: string;
  rationale: string;
  matchedFindingIds: string[];
  deliverables: string[];
  exclusions: string[];
  dependencies: string[];
  priceFormatted: string; // e.g. "$1.800.000 COP" or "Por cotizar"
  estimatedDuration: string; // e.g. "14 días hábiles"
}

export interface CommercialProposalDto {
  id: string;
  leadId: string;
  businessName: string;
  version: number;
  title: string;
  executiveSummary: string;
  auditedScopeSummary: string;
  verifiedFindings: Array<{
    id: string;
    title: string;
    observation: string;
    commercialImpact: string;
  }>;
  recommendedServices: ProposalServiceItem[];
  totalEstimateFormatted: string; // e.g. "$3.200.000 COP" or "Por cotizar según alcance"
  nextStepText: string;
  vertexContact: {
    name: string;
    role: string;
    email: string;
    phone: string;
    website: string;
  };
  createdAt: string;
  status: 'DRAFT' | 'REVIEWED' | 'SENT';
}
