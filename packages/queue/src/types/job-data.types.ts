// ═══════════════════════════════════════════════════════════
// VERTEX Prospect — Job Data Types
// ═══════════════════════════════════════════════════════════

import type { GooglePlaceResult } from '@vertex/shared';

/** Data payload for a Discovery Queue job. */
export interface DiscoveryJobData {
  campaignId: string;
  organizationId: string;
  places: GooglePlaceResult[];
}

/** Data payload for an Enrichment Queue job. */
export interface EnrichmentJobData {
  leadId: string;
  websiteUrl: string;
  businessName: string;
}

/** Data payload for an AI Proposal Generation job. */
export interface ProposalJobData {
  leadId: string;
}

/** Names of all queues in the system. */
export const QUEUE_NAMES = {
  DISCOVERY: 'vertex:discovery',
  ENRICHMENT: 'vertex:enrichment',
  PROPOSAL: 'vertex:proposal',
} as const;
