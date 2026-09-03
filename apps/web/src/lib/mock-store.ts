// ═══════════════════════════════════════════════════════════
// VERTEX Prospect — In-Memory & LocalStorage Mock Database
// ═══════════════════════════════════════════════════════════
// Provides 100% interactive functionality even when the backend
// server or database is not running, ensuring zero downtime in dev.

import {
  LeadStatus,
  OpportunityLevel,
  type Lead,
  type SearchCampaign,
  type CreateCampaignDto,
  type CampaignStats,
  type AIDiagnosis,
  type LeadListFilters,
  type LeadListResponse,
} from "@vertex/shared";

const INITIAL_CAMPAIGNS: SearchCampaign[] = [
  {
    id: "00000000-0000-0000-0000-000000000010",
    organizationId: "00000000-0000-0000-0000-000000000001",
    queryTerm: "Veterinarias",
    location: "Bogotá, Colombia",
    radiusMeters: 15000,
    totalFound: 4,
    status: "COMPLETED",
    createdAt: new Date("2026-09-01T10:00:00Z"),
  },
  {
    id: "00000000-0000-0000-0000-000000000011",
    organizationId: "00000000-0000-0000-0000-000000000001",
    queryTerm: "Clínicas Odontológicas",
    location: "Medellín, Colombia",
    radiusMeters: 10000,
    totalFound: 3,
    status: "COMPLETED",
    createdAt: new Date("2026-09-02T14:30:00Z"),
  },
];

const INITIAL_LEADS: Lead[] = [
  {
    id: "00000000-0000-0000-0000-000000000100",
    campaignId: "00000000-0000-0000-0000-000000000010",
    organizationId: "00000000-0000-0000-0000-000000000001",
    googlePlaceId: "ChIJdemo_lead_001",
    businessName: "Clínica Veterinaria Happy Pets",
    formattedAddress: "Cra 15 #85-10, Bogotá, Colombia",
    internationalPhone: "+573001234567",
    websiteUrl: null,
    googleRating: 4.2,
    googleUserRatingsTotal: 45,
    hasWebsite: false,
    hasValidSsl: false,
    hasCustomDomain: false,
    hasFacebook: false,
    hasInstagram: false,
    hasWhatsapp: true,
    hasTiktok: false,
    detectedEmails: ["contacto@happypets.com.co"],
    detectedCms: null,
    digitalScore: 25,
    opportunityScore: 75,
    opportunityTier: OpportunityLevel.HIGH,
    status: LeadStatus.DISCOVERED,
    aiDiagnosis: null,
    createdAt: new Date("2026-09-01T10:05:00Z"),
    updatedAt: new Date("2026-09-01T10:05:00Z"),
  },
  {
    id: "00000000-0000-0000-0000-000000000101",
    campaignId: "00000000-0000-0000-0000-000000000010",
    organizationId: "00000000-0000-0000-0000-000000000001",
    googlePlaceId: "ChIJdemo_lead_002",
    businessName: "Veterinaria El Refugio Animal",
    formattedAddress: "Cl 100 #20-30, Bogotá, Colombia",
    internationalPhone: "+573009876543",
    websiteUrl: "https://refugioanimal.wixsite.com/vet",
    googleRating: 3.8,
    googleUserRatingsTotal: 12,
    hasWebsite: true,
    hasValidSsl: true,
    hasCustomDomain: false,
    hasFacebook: true,
    hasInstagram: false,
    hasWhatsapp: false,
    hasTiktok: false,
    detectedEmails: ["info@elrefugio.com"],
    detectedCms: "Wix",
    digitalScore: 35,
    opportunityScore: 65,
    opportunityTier: OpportunityLevel.HIGH,
    status: LeadStatus.QUALIFIED,
    aiDiagnosis: null,
    createdAt: new Date("2026-09-01T10:06:00Z"),
    updatedAt: new Date("2026-09-01T10:06:00Z"),
  },
  {
    id: "00000000-0000-0000-0000-000000000102",
    campaignId: "00000000-0000-0000-0000-000000000010",
    organizationId: "00000000-0000-0000-0000-000000000001",
    googlePlaceId: "ChIJdemo_lead_003",
    businessName: "Hospital Veterinario San Martín",
    formattedAddress: "Av 68 #45-12, Bogotá, Colombia",
    internationalPhone: "+573005551234",
    websiteUrl: "http://veterinariasanmartin.com",
    googleRating: 4.8,
    googleUserRatingsTotal: 160,
    hasWebsite: true,
    hasValidSsl: false,
    hasCustomDomain: true,
    hasFacebook: true,
    hasInstagram: true,
    hasWhatsapp: true,
    hasTiktok: false,
    detectedEmails: ["dr.martin@sanmartin.vet"],
    detectedCms: "WordPress",
    digitalScore: 60,
    opportunityScore: 40,
    opportunityTier: OpportunityLevel.MEDIUM,
    status: LeadStatus.PROPOSAL_GENERATED,
    aiDiagnosis: {
      digitalGapAnalysis:
        "Hospital con excelente reputación en Google (4.8 ★ con 160 reseñas), pero su sitio web carece de certificado SSL seguro (HTTPS) y no cuenta con agendador de citas online.",
      highImpactServices: [
        "Migración a Web Segura (SSL HTTPS)",
        "Sistema Automatizado de Citas 24/7",
        "Chatbot Inteligente para WhatsApp",
      ],
      outreachEmail: {
        subject: "Hospital San Martín: Proteja sus 160 reseñas y active citas online 24/7",
        body: "Estimado Dr. Martín y equipo,\n\nRevisamos la presencia de su clínica en Bogotá y destacamos su excelente calificación de 4.8 estrellas en Google Maps.\n\nSin embargo, notamos que su sitio web actual figura como 'No seguro' en navegadores y sus pacientes no pueden reservar turnos de emergencia fuera del horario de atención.\n\nEn VERTEX modernizamos clínicas veterinarias implementando agendamiento automático y web segura. ¿Podemos agendar una breve demostración de 10 minutos esta semana?\n\nSaludos cordiales,\nEquipo VERTEX Transformación Digital",
      },
      whatsappHook:
        "¡Hola Hospital San Martín! 👋 Vimos su excelente reputación de 4.8★ en Google Maps. Diseñamos un agendador de citas para que sus clientes reserven consultas 24/7 desde WhatsApp. ¿Les gustaría ver una demo de 3 minutos? 🐾",
    },
    createdAt: new Date("2026-09-01T10:07:00Z"),
    updatedAt: new Date("2026-09-01T10:07:00Z"),
  },
  {
    id: "00000000-0000-0000-0000-000000000103",
    campaignId: "00000000-0000-0000-0000-000000000010",
    organizationId: "00000000-0000-0000-0000-000000000001",
    googlePlaceId: "ChIJdemo_lead_004",
    businessName: "Mundo Canino Guardería & Spa",
    formattedAddress: "Calle 127 #18-40, Bogotá, Colombia",
    internationalPhone: "+573108889900",
    websiteUrl: null,
    googleRating: 4.5,
    googleUserRatingsTotal: 34,
    hasWebsite: false,
    hasValidSsl: false,
    hasCustomDomain: false,
    hasFacebook: true,
    hasInstagram: true,
    hasWhatsapp: false,
    hasTiktok: false,
    detectedEmails: [],
    detectedCms: null,
    digitalScore: 15,
    opportunityScore: 85,
    opportunityTier: OpportunityLevel.VERY_HIGH,
    status: LeadStatus.DISCOVERED,
    aiDiagnosis: null,
    createdAt: new Date("2026-09-01T10:08:00Z"),
    updatedAt: new Date("2026-09-01T10:08:00Z"),
  },
];

class MockStore {
  private campaigns: SearchCampaign[] = [];
  private leads: Lead[] = [];
  private quota = { limit: 1000, used: 25, remaining: 975 };

  constructor() {
    this.load();
  }

  private load() {
    if (typeof window === "undefined") return;
    try {
      const savedC = localStorage.getItem("vertex_mock_campaigns");
      const savedL = localStorage.getItem("vertex_mock_leads");
      this.campaigns = savedC ? JSON.parse(savedC) : INITIAL_CAMPAIGNS;
      this.leads = savedL ? JSON.parse(savedL) : INITIAL_LEADS;
    } catch {
      this.campaigns = INITIAL_CAMPAIGNS;
      this.leads = INITIAL_LEADS;
    }
  }

  private save() {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem("vertex_mock_campaigns", JSON.stringify(this.campaigns));
      localStorage.setItem("vertex_mock_leads", JSON.stringify(this.leads));
    } catch (e) {
      console.warn("Storage error", e);
    }
  }

  getCampaigns(): SearchCampaign[] {
    return this.campaigns;
  }

  getCampaignById(id: string): SearchCampaign {
    const found = this.campaigns.find((c) => c.id === id);
    if (!found) {
      return {
        id,
        organizationId: "00000000-0000-0000-0000-000000000001",
        queryTerm: "Prospección Local",
        location: "Colombia",
        radiusMeters: 10000,
        totalFound: 5,
        status: "COMPLETED",
        createdAt: new Date(),
      };
    }
    return found;
  }

  createCampaign(dto: CreateCampaignDto): SearchCampaign & { placesFound: number } {
    const newId = "camp_" + Date.now().toString(36);
    const newCampaign: SearchCampaign = {
      id: newId,
      organizationId: "00000000-0000-0000-0000-000000000001",
      queryTerm: dto.queryTerm,
      location: dto.location,
      radiusMeters: dto.radiusMeters,
      totalFound: 4,
      status: "COMPLETED",
      createdAt: new Date(),
    };

    this.campaigns.unshift(newCampaign);

    // Generate 4 realistic discovered leads for this campaign
    const mockNames = [
      `${dto.queryTerm} Express & Premium`,
      `Centro Especializado ${dto.queryTerm}`,
      `${dto.queryTerm} del Norte`,
      `Alianza Comercial & Servicios`,
    ];

    const generatedLeads: Lead[] = mockNames.map((name, idx) => {
      const hasWeb = idx % 2 === 0;
      const digitalScore = hasWeb ? 30 + idx * 15 : 15 + idx * 5;
      const oppScore = 100 - digitalScore;
      const oppTier =
        oppScore >= 80
          ? OpportunityLevel.VERY_HIGH
          : oppScore >= 60
          ? OpportunityLevel.HIGH
          : oppScore >= 40
          ? OpportunityLevel.MEDIUM
          : OpportunityLevel.LOW;

      return {
        id: `lead_${Date.now()}_${idx}`,
        campaignId: newId,
        organizationId: "00000000-0000-0000-0000-000000000001",
        googlePlaceId: `ChIJ_${newId}_${idx}`,
        businessName: name,
        formattedAddress: `Av. Principal #${10 + idx * 15}-20, ${dto.location}`,
        internationalPhone: `+57300${1000000 + idx * 123456}`,
        websiteUrl: hasWeb ? `https://${name.toLowerCase().replace(/[^a-z]/g, "")}.com` : null,
        googleRating: 3.9 + (idx % 3) * 0.4,
        googleUserRatingsTotal: 18 + idx * 24,
        hasWebsite: hasWeb,
        hasValidSsl: hasWeb && idx > 0,
        hasCustomDomain: hasWeb,
        hasFacebook: true,
        hasInstagram: idx % 2 === 1,
        hasWhatsapp: idx % 2 === 0,
        hasTiktok: false,
        detectedEmails: [`contacto@${name.toLowerCase().replace(/[^a-z]/g, "")}.com`],
        detectedCms: hasWeb ? (idx % 2 === 0 ? "WordPress" : "Shopify") : null,
        digitalScore,
        opportunityScore: oppScore,
        opportunityTier: oppTier,
        status: LeadStatus.DISCOVERED,
        aiDiagnosis: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    });

    this.leads.unshift(...generatedLeads);
    this.quota.used += 5;
    this.quota.remaining -= 5;
    this.save();

    return { ...newCampaign, placesFound: 4 };
  }

  getLeads(filters: LeadListFilters): LeadListResponse {
    let list = this.leads;
    if (filters.campaignId) {
      list = list.filter((l) => l.campaignId === filters.campaignId);
    }
    if (filters.opportunityTier) {
      list = list.filter((l) => l.opportunityTier === filters.opportunityTier);
    }
    if (filters.status) {
      list = list.filter((l) => l.status === filters.status);
    }
    if (filters.search) {
      const q = filters.search.toLowerCase();
      list = list.filter((l) => l.businessName.toLowerCase().includes(q));
    }

    if (filters.sortBy) {
      const field = filters.sortBy;
      const isAsc = filters.sortOrder === "asc";
      list = [...list].sort((a: any, b: any) => {
        if (a[field] < b[field]) return isAsc ? -1 : 1;
        if (a[field] > b[field]) return isAsc ? 1 : -1;
        return 0;
      });
    }

    return {
      data: list,
      meta: {
        total: list.length,
        page: filters.page || 1,
        limit: filters.limit || 50,
        totalPages: 1,
      },
    };
  }

  getLeadById(id: string): Lead {
    const found = this.leads.find((l) => l.id === id);
    if (found) return found;
    return this.leads[0] || INITIAL_LEADS[0];
  }

  updateLeadStatus(id: string, status: string): Lead {
    const lead = this.getLeadById(id);
    lead.status = status as LeadStatus;
    this.save();
    return lead;
  }

  generateProposal(leadId: string): AIDiagnosis {
    const lead = this.getLeadById(leadId);
    const diagnosis: AIDiagnosis = {
      digitalGapAnalysis: `${lead.businessName} cuenta con una oportunidad comercial de ${lead.opportunityScore}/100. Su presencia digital actual puede optimizarse rápidamente mediante un sitio web responsivo de alta conversión y captura automatizada de leads.`,
      highImpactServices: [
        "Sitio Web Moderno con Agendador Online",
        "Optimización de Ficha de Google Maps & SEO Local",
        "Integración de Botón y Flujos de WhatsApp Comercial",
      ],
      outreachEmail: {
        subject: `${lead.businessName}: Oportunidad de captación de clientes en ${lead.formattedAddress?.split(",")[0] || "su zona"}`,
        body: `Hola equipo de ${lead.businessName},\n\nRealizamos una auditoría digital pública de su negocio y encontramos que están perdiendo potenciales clientes que buscan sus servicios en Google y dispositivos móviles.\n\nCon un score de oportunidad de ${lead.opportunityScore}/100, la implementación de un canal de reservas directo permitiría duplicar el contacto de prospectos sin gastar de más en publicidad.\n\nEn VERTEX ayudamos a PYMES a digitalizar sus ventas en menos de 7 días. ¿Tienen 10 minutos esta semana para una llamada exploratoria?\n\nUn cordial saludo,\nEquipo VERTEX Prospect`,
      },
      whatsappHook: `¡Hola ${lead.businessName}! 👋 Analizamos su perfil comercial en Google y diseñamos una solución para que sus clientes agenden citas y pidan presupuestos 24/7. ¿Les interesaría ver una demo gratuita de 2 minutos? 🚀`,
    };

    lead.aiDiagnosis = diagnosis;
    lead.status = LeadStatus.PROPOSAL_GENERATED;
    this.save();
    return diagnosis;
  }

  getStats(campaignId: string): CampaignStats {
    const campaignLeads = this.leads.filter((l) => l.campaignId === campaignId);
    const byTier = { VERY_HIGH: 0, HIGH: 0, MEDIUM: 0, LOW: 0 };
    const byStatus: Record<string, number> = {};
    let totalScore = 0;

    for (const lead of campaignLeads) {
      byTier[lead.opportunityTier]++;
      byStatus[lead.status] = (byStatus[lead.status] || 0) + 1;
      totalScore += lead.opportunityScore;
    }

    return {
      totalLeads: campaignLeads.length,
      byTier,
      byStatus,
      avgOpportunityScore: campaignLeads.length > 0 ? Math.round(totalScore / campaignLeads.length) : 0,
    };
  }

  getQuota() {
    return this.quota;
  }
}

export const mockStore = new MockStore();
