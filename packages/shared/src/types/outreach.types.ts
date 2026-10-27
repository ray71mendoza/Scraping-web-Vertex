// ═══════════════════════════════════════════════════════════
// VERTEX Prospect — Direct Outreach & Delivery Types
// ═══════════════════════════════════════════════════════════

export type OutreachChannel = 'EMAIL' | 'WHATSAPP';

export type ContactAvailabilityType =
  | 'EMAIL_ONLY'
  | 'WHATSAPP_ONLY'
  | 'BOTH'
  | 'NEITHER';

export type ContactVerificationLevel =
  | 'UNVERIFIED_PHONE'
  | 'VERIFIED_WHATSAPP_LINK'
  | 'EXTRACTED_EMAIL'
  | 'OPERATOR_CONFIRMED';

export type ChannelReadinessStatus =
  | 'READY'
  | 'SIMULATED'
  | 'MISSING_DESTINATION'
  | 'UNCONFIGURED_PROVIDER'
  | 'PENDING_TEMPLATE_APPROVAL';

export interface ChannelStatusInfo {
  channel: OutreachChannel;
  destination: string | null;
  isAvailable: boolean;
  readiness: ChannelReadinessStatus;
  verificationLevel: ContactVerificationLevel;
  readinessMessage: string;
}

export interface CompanyContactChannels {
  availability: ContactAvailabilityType;
  email: ChannelStatusInfo;
  whatsapp: ChannelStatusInfo;
}

export interface OutreachDraftDto {
  id?: string;
  leadId: string;
  channel: OutreachChannel;
  version: number;
  subject?: string; // For Email
  body: string;
  templateId?: string; // For WhatsApp
  templateParams?: Record<string, string>;
  findingIds: string[];
  serviceCodes: string[];
  isReviewed: boolean;
  updatedAt: string;
}

export interface SendOutreachRequest {
  leadId: string;
  channel: OutreachChannel;
  destination: string;
  subject?: string;
  body: string;
  templateId?: string;
  attachClientReport?: boolean;
  idempotencyKey: string;
}

export interface SendOutreachResponse {
  success: boolean;
  intentId: string;
  channel: OutreachChannel;
  destination: string;
  status: 'PENDING' | 'ACCEPTED' | 'SENT' | 'DELIVERED' | 'FAILED';
  providerName: 'resend' | 'whatsapp_cloud' | 'simulation';
  providerMessageId?: string | null;
  message: string;
  timestamp: string;
}

export interface DeliveryHistoryItem {
  id: string;
  channel: OutreachChannel;
  destination: string;
  subject?: string | null;
  bodySnippet: string;
  status: string;
  providerName: string;
  providerMessageId?: string | null;
  errorDetails?: string | null;
  createdAt: string;
  dispatchedAt?: string | null;
}
