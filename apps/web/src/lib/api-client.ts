import axios from "axios";
import type {
  Lead,
  SearchCampaign,
  CreateCampaignDto,
  CampaignStats,
  AIDiagnosis,
  LeadListFilters,
  LeadListResponse,
} from "@vertex/shared";
import { mockStore } from "./mock-store";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api/v1";

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 3000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Response interceptor to unwrap data
apiClient.interceptors.response.use(
  (response) => response.data?.data ?? response.data,
  (error) => {
    return Promise.reject(error?.response?.data || error);
  }
);

export const api = {
  // Campaigns
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
      return mockStore.createCampaign(data);
    }
  },

  // Leads
  getLeads: async (filters: LeadListFilters): Promise<LeadListResponse> => {
    try {
      return await apiClient.get(`/leads`, { params: filters });
    } catch {
      return mockStore.getLeads(filters);
    }
  },

  getLeadById: async (id: string): Promise<Lead> => {
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

  // AI & Outreach
  generateProposal: async (leadId: string): Promise<AIDiagnosis> => {
    try {
      return await apiClient.post(`/ai/generate-proposal/${leadId}`);
    } catch {
      return mockStore.generateProposal(leadId);
    }
  },

  getWhatsAppLink: async (leadId: string): Promise<{ url: string; message: string }> => {
    try {
      return await apiClient.get(`/outreach/whatsapp/${leadId}`);
    } catch {
      const lead = mockStore.getLeadById(leadId);
      const diagnosis = lead.aiDiagnosis as AIDiagnosis | null;
      const message = diagnosis?.whatsappHook || `Hola ${lead.businessName}, somos VERTEX.`;
      const cleanPhone = (lead.internationalPhone || "").replace(/[^0-9]/g, "");
      return {
        url: `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`,
        message,
      };
    }
  },

  sendEmail: async (leadId: string): Promise<{ sent: boolean; to: string | null }> => {
    try {
      return await apiClient.post(`/outreach/email/${leadId}`);
    } catch {
      const lead = mockStore.getLeadById(leadId);
      lead.status = "CONTACTED" as any;
      return {
        sent: true,
        to: lead.detectedEmails?.[0] || "contacto@empresa.com",
      };
    }
  },

  // Organization / Quota
  getQuota: async (organizationId = "00000000-0000-0000-0000-000000000001"): Promise<{ limit: number; used: number; remaining: number }> => {
    try {
      return await apiClient.get(`/organizations/${organizationId}/quota`);
    } catch {
      return mockStore.getQuota();
    }
  },
};
