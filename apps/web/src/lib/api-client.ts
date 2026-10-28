// ═══════════════════════════════════════════════════════════
// VERTEX Prospect — Frontend API Client
// ═══════════════════════════════════════════════════════════

import axios from "axios";
import type {
  Lead,
  SearchCampaign,
  CreateCampaignDto,
  CampaignStats,
  AIDiagnosis,
  LeadListFilters,
  LeadListResponse,
  ExplainableScoringResult,
  CommercialProposalDto,
  ClientReportProjection,
  InternalReportProjection,
  CompanyContactChannels,
  OutreachDraftDto,
  SendOutreachRequest,
  SendOutreachResponse,
  DeliveryHistoryItem,
  ServiceCatalogItemDto,
  SectorProfileKey,
} from "@vertex/shared";
import { mockStore, type ExtendedLead } from "./mock-store";

const API_BASE_URL =
  typeof window !== "undefined"
    ? "/api"
    : (process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api");

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 4000,
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.response.use(
  (response) => response.data?.data ?? response.data,
  (error) => Promise.reject(error?.response?.data || error)
);

export const api = {
  // ── Campaigns ──
  getCampaigns: async (organizationId = "00000000-0000-0000-0000-000000000001"): Promise<SearchCampaign[]> => {
    try {
      return await apiClient.get(`/campaigns`, { params: { organizationId } });
    } catch {
      return mockStore.getCampaigns();
    }
  },

  getCampaignById: async (id: string): Promise<SearchCampaign> => {
    try {
      return await apiClient.get(`/campaigns/${id}`);
    } catch {
      return mockStore.getCampaignById(id);
    }
  },

  getCampaignStats: async (campaignId: string): Promise<CampaignStats> => {
    try {
      return await apiClient.get(`/campaigns/${campaignId}/stats`);
    } catch {
      return mockStore.getStats(campaignId);
    }
  },

  createCampaign: async (data: CreateCampaignDto & { organizationId?: string }): Promise<SearchCampaign & { placesFound: number }> => {
    try {
      return await apiClient.post(`/campaigns`, {
        organizationId: data.organizationId || "00000000-0000-0000-0000-000000000001",
        ...data,
      });
    } catch {
      return await mockStore.createCampaign(data);
    }
  },

  // ── Leads & Advanced Filters ──
  getLeads: async (filters: LeadListFilters & { sector?: string; contactChannel?: string; deliveryStatus?: string }): Promise<LeadListResponse> => {
    try {
      return await apiClient.get(`/leads`, { params: filters });
    } catch {
      return mockStore.getLeads(filters);
    }
  },

  getLeadById: async (id: string): Promise<ExtendedLead> => {
    try {
      return await apiClient.get(`/leads/${id}`);
    } catch {
      return mockStore.getLeadById(id);
    }
  },

  updateLeadStatus: async (id: string, status: string): Promise<Lead> => {
    try {
      return await apiClient.patch(`/leads/${id}/status`, { status });
    } catch {
      return mockStore.updateLeadStatus(id, status);
    }
  },

  // ── 1. Explainable Scoring Engine ──
  recalculateScore: async (leadId: string, sector?: SectorProfileKey): Promise<ExplainableScoringResult> => {
    try {
      return await apiClient.post(`/scoring/recalculate/${leadId}`, {}, { params: { sector } });
    } catch {
      return mockStore.recalculateScore(leadId, sector);
    }
  },

  manualScoreOverride: async (leadId: string, data: { actor: string; reason: string; digitalNeed?: number; serviceFit?: number }) => {
    try {
      return await apiClient.post(`/scoring/override/${leadId}`, data);
    } catch {
      return mockStore.manualScoreOverride(leadId, data);
    }
  },

  // ── 5. Service Catalog & Proposals ──
  getServiceCatalog: async (): Promise<ServiceCatalogItemDto[]> => {
    try {
      return await apiClient.get(`/catalog`);
    } catch {
      return mockStore.getServiceCatalog();
    }
  },

  getLatestProposal: async (leadId: string): Promise<CommercialProposalDto> => {
    try {
      return await apiClient.get(`/proposals/${leadId}`);
    } catch {
      return mockStore.getCommercialProposal(leadId);
    }
  },

  generateProposal: async (leadId: string): Promise<AIDiagnosis> => {
    try {
      return await apiClient.post(`/ai/generate-proposal/${leadId}`);
    } catch {
      return mockStore.generateProposal(leadId);
    }
  },

  // ── 6. Reports (Internal & Client) ──
  getClientReport: async (leadId: string): Promise<ClientReportProjection> => {
    try {
      return await apiClient.get(`/reports/client/${leadId}`);
    } catch {
      return mockStore.getClientReport(leadId);
    }
  },

  getInternalReport: async (leadId: string): Promise<InternalReportProjection> => {
    try {
      return await apiClient.get(`/reports/internal/${leadId}`);
    } catch {
      return mockStore.getInternalReport(leadId);
    }
  },

  createShareLink: async (leadId: string): Promise<{ token: string; expiresAt: string; shareUrl: string }> => {
    try {
      return await apiClient.post(`/reports/share/${leadId}`);
    } catch {
      return mockStore.createShareToken(leadId);
    }
  },

  // ── 7. Direct In-App Outreach (Email & WhatsApp) ──
  getCompanyContactChannels: async (leadId: string): Promise<CompanyContactChannels> => {
    try {
      return await apiClient.get(`/outreach/channels/${leadId}`);
    } catch {
      return mockStore.getCompanyContactChannels(leadId);
    }
  },

  getCompanyOutreachDrafts: async (leadId: string): Promise<{ email: OutreachDraftDto; whatsapp: OutreachDraftDto }> => {
    try {
      return await apiClient.get(`/outreach/drafts/${leadId}`);
    } catch {
      return mockStore.getCompanyOutreachDrafts(leadId);
    }
  },

  saveOutreachDraft: async (leadId: string, channel: "EMAIL" | "WHATSAPP", data: { subject?: string; body: string }) => {
    try {
      return await apiClient.post(`/outreach/drafts/${leadId}`, { channel, ...data });
    } catch {
      return mockStore.saveOutreachDraft(leadId, channel, data);
    }
  },

  dispatchOutreach: async (request: SendOutreachRequest): Promise<SendOutreachResponse> => {
    try {
      return await apiClient.post(`/outreach/dispatch`, request);
    } catch {
      return mockStore.dispatchOutreach(request);
    }
  },

  getDeliveryHistory: async (leadId: string): Promise<DeliveryHistoryItem[]> => {
    try {
      return await apiClient.get(`/outreach/history/${leadId}`);
    } catch {
      return mockStore.getDeliveryHistory(leadId);
    }
  },

  // Backward-compatible fallback
  sendEmail: async (leadId: string): Promise<{ sent: boolean; to: string | null }> => {
    const drafts = await api.getCompanyOutreachDrafts(leadId);
    const channels = await api.getCompanyContactChannels(leadId);
    const res = await api.dispatchOutreach({
      leadId,
      channel: "EMAIL",
      destination: channels.email.destination || "contacto@empresa.com",
      subject: drafts.email.subject,
      body: drafts.email.body,
      idempotencyKey: `legacy_email_${leadId}_${Date.now()}`,
    });
    return { sent: res.success, to: res.destination };
  },

  getWhatsAppLink: async (leadId: string): Promise<{ url: string; message: string }> => {
    const drafts = await api.getCompanyOutreachDrafts(leadId);
    const channels = await api.getCompanyContactChannels(leadId);
    const cleanPhone = (channels.whatsapp.destination || "").replace(/[^0-9]/g, "");
    return {
      url: `https://wa.me/${cleanPhone}?text=${encodeURIComponent(drafts.whatsapp.body)}`,
      message: drafts.whatsapp.body,
    };
  },

  // Organization / Quota
  getQuota: async (organizationId = "00000000-0000-0000-0000-000000000001"): Promise<{ limit: number; used: number; remaining: number }> => {
    try {
      return await apiClient.get(`/organizations/${organizationId}/quota`);
    } catch {
      return mockStore.getQuota();
    }
  },

  // Database Management
  clearAllData: async (): Promise<{ success: boolean; message: string }> => {
    try {
      await apiClient.post(`/campaigns/clear`);
    } catch {
      // offline fallback
    }
    mockStore.clearAllData();
    return { success: true, message: "Base de datos y búsquedas limpiadas con éxito." };
  },
};
