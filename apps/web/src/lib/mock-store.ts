// ═══════════════════════════════════════════════════════════
// VERTEX Prospect — Interactive In-Memory & LocalStorage Store
// ═══════════════════════════════════════════════════════════
// Provides 100% full interactive capabilities for all 7 capabilities:
// explainable scoring, evidence findings, proposals, client/internal reports,
// and direct in-app outreach (Email + WhatsApp) with simulation feedback.

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
  type ExplainableScoringResult,
  type CommercialProposalDto,
  type ClientReportProjection,
  type InternalReportProjection,
  type CompanyContactChannels,
  type OutreachDraftDto,
  type SendOutreachRequest,
  type SendOutreachResponse,
  type DeliveryHistoryItem,
  type ServiceCatalogItemDto,
  DEFAULT_VERTEX_SERVICE_CATALOG,
  calculateExplainableScore,
} from "@vertex/shared";

export interface ExtendedLead extends Lead {
  sector?: string;
  digitalNeedScore?: number;
  serviceFitScore?: number;
  evidenceConfidenceScore?: number;
  evidenceCoverage?: number;
  scoringVersion?: string;
  scoringExplanation?: any;
  contactVerificationLevel?: string;
  contactChannelsAvailable?: string[];
  deliveryStatus?: string;
  lastDeliveryAt?: Date | null;
}

const INITIAL_CAMPAIGNS: SearchCampaign[] = [
  {
    id: "00000000-0000-0000-0000-000000000010",
    organizationId: "00000000-0000-0000-0000-000000000001",
    queryTerm: "Hoteles & Restaurantes",
    location: "Bogotá, Colombia",
    radiusMeters: 15000,
    totalFound: 5,
    status: "COMPLETED",
    createdAt: new Date("2026-09-01T10:00:00Z"),
  },
  {
    id: "00000000-0000-0000-0000-000000000011",
    organizationId: "00000000-0000-0000-0000-000000000001",
    queryTerm: "Clínicas & Centros Médicos",
    location: "Medellín, Colombia",
    radiusMeters: 10000,
    totalFound: 3,
    status: "COMPLETED",
    createdAt: new Date("2026-09-02T14:30:00Z"),
  },
];

const INITIAL_LEADS: ExtendedLead[] = [
  // 1. Hotel Sector: Lacks online booking engine
  {
    id: "00000000-0000-0000-0000-000000000100",
    campaignId: "00000000-0000-0000-0000-000000000010",
    organizationId: "00000000-0000-0000-0000-000000000001",
    googlePlaceId: "ChIJ_hotel_colonial_001",
    businessName: "Hotel Boutique Casa Colonial",
    formattedAddress: "Cl 12 #3-45, Candelaria, Bogotá",
    internationalPhone: "+573108901234",
    websiteUrl: "https://hotelcasacolonialbogota.com",
    googleRating: 4.6,
    googleUserRatingsTotal: 88,
    hasWebsite: true,
    hasValidSsl: true,
    hasCustomDomain: true,
    hasFacebook: true,
    hasInstagram: true,
    hasWhatsapp: true,
    hasTiktok: false,
    detectedEmails: ["reservas@casacolonialbogota.com"],
    detectedCms: "WordPress",
    digitalScore: 65,
    opportunityScore: 78,
    opportunityTier: OpportunityLevel.HIGH,
    sector: "HOTELS_TOURISM",
    digitalNeedScore: 75,
    serviceFitScore: 85,
    evidenceConfidenceScore: 90,
    evidenceCoverage: 0.9,
    contactVerificationLevel: "VERIFIED_WHATSAPP_LINK",
    contactChannelsAvailable: ["EMAIL", "WHATSAPP"],
    deliveryStatus: "NOT_SENT",
    status: LeadStatus.QUALIFIED,
    aiDiagnosis: null,
    createdAt: new Date("2026-09-01T10:05:00Z"),
    updatedAt: new Date("2026-09-01T10:05:00Z"),
  },
  // 2. Restaurant Sector: WhatsApp only, lacks online menu & table reservation
  {
    id: "00000000-0000-0000-0000-000000000101",
    campaignId: "00000000-0000-0000-0000-000000000010",
    organizationId: "00000000-0000-0000-0000-000000000001",
    googlePlaceId: "ChIJ_rest_terraza_002",
    businessName: "Restaurante La Terraza Gourmet",
    formattedAddress: "Cra 7 #116-20, Usaquén, Bogotá",
    internationalPhone: "+573004567890",
    websiteUrl: null,
    googleRating: 4.4,
    googleUserRatingsTotal: 142,
    hasWebsite: false,
    hasValidSsl: false,
    hasCustomDomain: false,
    hasFacebook: true,
    hasInstagram: true,
    hasWhatsapp: true,
    hasTiktok: true,
    detectedEmails: [],
    detectedCms: null,
    digitalScore: 30,
    opportunityScore: 84,
    opportunityTier: OpportunityLevel.VERY_HIGH,
    sector: "RESTAURANTS",
    digitalNeedScore: 85,
    serviceFitScore: 90,
    evidenceConfidenceScore: 75,
    evidenceCoverage: 0.8,
    contactVerificationLevel: "VERIFIED_WHATSAPP_LINK",
    contactChannelsAvailable: ["WHATSAPP"],
    deliveryStatus: "NOT_SENT",
    status: LeadStatus.DISCOVERED,
    aiDiagnosis: null,
    createdAt: new Date("2026-09-01T10:06:00Z"),
    updatedAt: new Date("2026-09-01T10:06:00Z"),
  },
  // 3. Clinic Sector: Email only, SSL certificate invalid
  {
    id: "00000000-0000-0000-0000-000000000102",
    campaignId: "00000000-0000-0000-0000-000000000011",
    organizationId: "00000000-0000-0000-0000-000000000001",
    googlePlaceId: "ChIJ_clinic_cedritos_003",
    businessName: "Centro Médico Especialistas Cedritos",
    formattedAddress: "Cl 140 #11-30, Cedritos, Bogotá",
    internationalPhone: null,
    websiteUrl: "http://especialistascedritos.com",
    googleRating: 4.1,
    googleUserRatingsTotal: 34,
    hasWebsite: true,
    hasValidSsl: false,
    hasCustomDomain: true,
    hasFacebook: false,
    hasInstagram: false,
    hasWhatsapp: false,
    hasTiktok: false,
    detectedEmails: ["citas@especialistascedritos.com"],
    detectedCms: "Custom HTML",
    digitalScore: 35,
    opportunityScore: 72,
    opportunityTier: OpportunityLevel.HIGH,
    sector: "CLINICS",
    digitalNeedScore: 80,
    serviceFitScore: 75,
    evidenceConfidenceScore: 80,
    evidenceCoverage: 0.85,
    contactVerificationLevel: "EXTRACTED_EMAIL",
    contactChannelsAvailable: ["EMAIL"],
    deliveryStatus: "NOT_SENT",
    status: LeadStatus.QUALIFIED,
    aiDiagnosis: null,
    createdAt: new Date("2026-09-02T14:35:00Z"),
    updatedAt: new Date("2026-09-02T14:35:00Z"),
  },
  // 4. Retail Sector: Both channels, mobile responsiveness issue
  {
    id: "00000000-0000-0000-0000-000000000103",
    campaignId: "00000000-0000-0000-0000-000000000010",
    organizationId: "00000000-0000-0000-0000-000000000001",
    googlePlaceId: "ChIJ_retail_moda_004",
    businessName: "Boutique Moda Elegance",
    formattedAddress: "Cra 13 #78-22, Chapinero, Bogotá",
    internationalPhone: "+573159876543",
    websiteUrl: "https://modaelegance.wixsite.com/boutique",
    googleRating: 4.7,
    googleUserRatingsTotal: 56,
    hasWebsite: true,
    hasValidSsl: true,
    hasCustomDomain: false,
    hasFacebook: true,
    hasInstagram: true,
    hasWhatsapp: true,
    hasTiktok: true,
    detectedEmails: ["ventas@modaelegance.co"],
    detectedCms: "Wix",
    digitalScore: 50,
    opportunityScore: 68,
    opportunityTier: OpportunityLevel.HIGH,
    sector: "RETAIL",
    digitalNeedScore: 70,
    serviceFitScore: 80,
    evidenceConfidenceScore: 85,
    evidenceCoverage: 0.88,
    contactVerificationLevel: "VERIFIED_WHATSAPP_LINK",
    contactChannelsAvailable: ["EMAIL", "WHATSAPP"],
    deliveryStatus: "NOT_SENT",
    status: LeadStatus.QUALIFIED,
    aiDiagnosis: null,
    createdAt: new Date("2026-09-01T10:08:00Z"),
    updatedAt: new Date("2026-09-01T10:08:00Z"),
  },
  // 5. Neither Channel available ("Sin datos de contacto")
  {
    id: "00000000-0000-0000-0000-000000000104",
    campaignId: "00000000-0000-0000-0000-000000000010",
    organizationId: "00000000-0000-0000-0000-000000000001",
    googlePlaceId: "ChIJ_taller_progreso_005",
    businessName: "Taller Mecánico El Progreso",
    formattedAddress: "Av 1 de Mayo #24-10, Bogotá",
    internationalPhone: null,
    websiteUrl: "https://tallerelprogreso.com",
    googleRating: 3.9,
    googleUserRatingsTotal: 18,
    hasWebsite: true,
    hasValidSsl: true,
    hasCustomDomain: true,
    hasFacebook: false,
    hasInstagram: false,
    hasWhatsapp: false,
    hasTiktok: false,
    detectedEmails: [],
    detectedCms: null,
    digitalScore: 40,
    opportunityScore: 60,
    opportunityTier: OpportunityLevel.HIGH,
    sector: "GENERAL",
    digitalNeedScore: 65,
    serviceFitScore: 60,
    evidenceConfidenceScore: 60,
    evidenceCoverage: 0.65,
    contactVerificationLevel: "UNVERIFIED_PHONE",
    contactChannelsAvailable: [],
    deliveryStatus: "NOT_SENT",
    status: LeadStatus.DISCOVERED,
    aiDiagnosis: null,
    createdAt: new Date("2026-09-01T10:09:00Z"),
    updatedAt: new Date("2026-09-01T10:09:00Z"),
  },
];

class MockStore {
  private campaigns: SearchCampaign[] = INITIAL_CAMPAIGNS;
  private leads: ExtendedLead[] = INITIAL_LEADS;
  private deliveryHistory: Record<string, DeliveryHistoryItem[]> = {};
  private customDrafts: Record<string, { email?: OutreachDraftDto; whatsapp?: OutreachDraftDto }> = {};
  private quota = { limit: 5000, used: 14, remaining: 4986 };

  constructor() {
    this.load();
  }

  private save() {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("vertex_prospect_campaigns", JSON.stringify(this.campaigns));
        localStorage.setItem("vertex_prospect_leads", JSON.stringify(this.leads));
        localStorage.setItem("vertex_prospect_history", JSON.stringify(this.deliveryHistory));
      } catch (e) {
        console.warn("Could not save to localStorage", e);
      }
    }
  }

  private load() {
    if (typeof window !== "undefined") {
      try {
        const storedLeads = localStorage.getItem("vertex_prospect_leads");
        if (storedLeads) {
          const parsed = JSON.parse(storedLeads);
          if (Array.isArray(parsed) && parsed.length > 0) {
            this.leads = parsed;
          } else {
            this.leads = [...INITIAL_LEADS];
          }
        } else {
          this.leads = [...INITIAL_LEADS];
        }

        const storedHistory = localStorage.getItem("vertex_prospect_history");
        if (storedHistory) this.deliveryHistory = JSON.parse(storedHistory);
      } catch (e) {
        console.warn("Could not load from localStorage", e);
        this.leads = [...INITIAL_LEADS];
      }
    }
  }

  clearAllData() {
    this.campaigns = [...INITIAL_CAMPAIGNS];
    this.leads = [...INITIAL_LEADS];
    this.deliveryHistory = {};
    if (typeof window !== "undefined") {
      localStorage.removeItem("vertex_prospect_campaigns");
      localStorage.removeItem("vertex_prospect_leads");
      localStorage.removeItem("vertex_prospect_history");
    }
  }

  getCampaigns(): SearchCampaign[] {
    return this.campaigns;
  }

  getCampaignById(id: string): SearchCampaign {
    return this.campaigns.find((c) => c.id === id) || INITIAL_CAMPAIGNS[0];
  }

  getStats(campaignId?: string): CampaignStats {
    let list = this.leads.length > 0 ? this.leads : INITIAL_LEADS;
    if (campaignId && campaignId !== "ALL" && campaignId !== "default") {
      const matched = list.filter((l) => l.campaignId === campaignId);
      if (matched.length > 0) list = matched;
    }
    const total = list.length;
    const critical = list.filter((l) => l.opportunityTier === OpportunityLevel.CRITICAL).length;
    const high = list.filter((l) => l.opportunityTier === OpportunityLevel.HIGH).length;
    const medium = list.filter((l) => l.opportunityTier === OpportunityLevel.MEDIUM).length;
    const low = list.filter((l) => l.opportunityTier === OpportunityLevel.LOW).length;
    const avgScore = total > 0 ? Math.round(list.reduce((acc, l) => acc + (l.opportunityScore || 0), 0) / total) : 74;
    return {
      totalLeads: total,
      criticalOpportunity: critical,
      highOpportunity: high,
      mediumOpportunity: medium,
      lowOpportunity: low,
      averageScore: avgScore,
      enrichedLeads: total,
    };
  }

  createCampaign(data: CreateCampaignDto): SearchCampaign & { placesFound: number } {
    const id = `cmp_${Date.now()}`;
    const newCamp: SearchCampaign = {
      id,
      organizationId: "00000000-0000-0000-0000-000000000001",
      queryTerm: data.queryTerm,
      location: data.location,
      radiusMeters: data.radiusMeters || 10000,
      totalFound: 4,
      status: "COMPLETED",
      createdAt: new Date(),
    };
    this.campaigns.unshift(newCamp);
    this.save();
    return { ...newCamp, placesFound: 4 };
  }

  getLeads(filters: LeadListFilters & { sector?: string; contactChannel?: string; deliveryStatus?: string }): LeadListResponse {
    if (!this.leads || this.leads.length === 0) {
      this.leads = [...INITIAL_LEADS];
    }
    let list = [...this.leads];

    if (filters.campaignId && filters.campaignId !== "ALL" && filters.campaignId !== "default") {
      const matched = list.filter((l) => l.campaignId === filters.campaignId);
      if (matched.length > 0) {
        list = matched;
      }
    }
    if (filters.opportunityTier && filters.opportunityTier !== ("ALL" as any)) {
      list = list.filter((l) => l.opportunityTier === filters.opportunityTier);
    }
    if (filters.sector && filters.sector !== "ALL") {
      list = list.filter((l) => l.sector === filters.sector);
    }
    if (filters.contactChannel && filters.contactChannel !== "ALL") {
      if (filters.contactChannel === "EMAIL") list = list.filter((l) => l.detectedEmails?.length > 0);
      else if (filters.contactChannel === "WHATSAPP") list = list.filter((l) => Boolean(l.internationalPhone));
      else if (filters.contactChannel === "BOTH") list = list.filter((l) => l.detectedEmails?.length > 0 && Boolean(l.internationalPhone));
      else if (filters.contactChannel === "NEITHER") list = list.filter((l) => (!l.detectedEmails || l.detectedEmails.length === 0) && !l.internationalPhone);
    }
    if (filters.deliveryStatus && filters.deliveryStatus !== "ALL") {
      list = list.filter((l) => l.deliveryStatus === filters.deliveryStatus);
    }
    if (filters.search) {
      const q = filters.search.toLowerCase();
      list = list.filter(
        (l) =>
          l.businessName.toLowerCase().includes(q) ||
          (l.formattedAddress && l.formattedAddress.toLowerCase().includes(q))
      );
    }

    if (filters.sortBy === "businessName") {
      list.sort((a, b) => (filters.sortOrder === "asc" ? a.businessName.localeCompare(b.businessName) : b.businessName.localeCompare(a.businessName)));
    } else {
      list.sort((a, b) => (filters.sortOrder === "asc" ? a.opportunityScore - b.opportunityScore : b.opportunityScore - a.opportunityScore));
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

  getLeadById(id: string): ExtendedLead {
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

  // ── Capability 1: Explainable Scoring ──
  recalculateScore(leadId: string, sectorOverride?: string): ExplainableScoringResult {
    const lead = this.getLeadById(leadId);
    const sector = (sectorOverride || lead.sector || "GENERAL") as any;

    const res = calculateExplainableScore({
      hasWebsite: lead.hasWebsite ? "PRESENT" : "ABSENT",
      hasValidSsl: lead.hasValidSsl ? "PRESENT" : "NOT_DETECTED",
      hasCustomDomain: lead.hasCustomDomain ? "PRESENT" : "NOT_DETECTED",
      isResponsive: lead.isResponsive ? "PRESENT" : "NOT_DETECTED",
      hasMetaOg: lead.hasMetaOg ? "PRESENT" : "NOT_DETECTED",
      hasSocialMedia: (lead.hasFacebook || lead.hasInstagram) ? "PRESENT" : "NOT_DETECTED",
      hasWhatsapp: lead.hasWhatsapp ? "PRESENT" : "NOT_DETECTED",
      hasContactForm: lead.detectedEmails?.length > 0 ? "PRESENT" : "NOT_DETECTED",
      hasOnlineBooking: lead.sector === "HOTELS_TOURISM" ? "NOT_DETECTED" : "PRESENT",
      hasOnlineMenu: lead.sector === "RESTAURANTS" ? "NOT_DETECTED" : "PRESENT",
      hasProductCatalog: lead.sector === "RETAIL" ? "NOT_DETECTED" : "PRESENT",
      hasAppointmentInfo: lead.sector === "CLINICS" ? "NOT_DETECTED" : "PRESENT",
      hasStructuredData: "UNKNOWN",
      googleRating: lead.googleRating,
      googleUserRatingsTotal: lead.googleUserRatingsTotal,
      googleMapsVerified: "PRESENT",
      performanceScoreMobile: null,
      performanceScoreDesktop: null,
      pagesInspectedCount: 1,
      pagesTargetedCount: 3,
      sectorProfile: sector,
    });

    lead.sector = sector;
    lead.digitalNeedScore = res.digitalNeed;
    lead.serviceFitScore = res.serviceFit;
    lead.evidenceConfidenceScore = res.evidenceConfidence;
    lead.evidenceCoverage = res.evidenceCoverage;
    lead.opportunityScore = res.overallOpportunityScore;
    lead.opportunityTier = res.opportunityTier === "INSUFFICIENT_EVIDENCE" ? OpportunityLevel.LOW : (res.opportunityTier as any);
    lead.scoringExplanation = res;
    this.save();
    return res;
  }

  manualScoreOverride(leadId: string, data: { actor: string; reason: string; digitalNeed?: number; serviceFit?: number }) {
    const lead = this.getLeadById(leadId);
    if (data.digitalNeed !== undefined) lead.digitalNeedScore = data.digitalNeed;
    if (data.serviceFit !== undefined) lead.serviceFitScore = data.serviceFit;
    lead.opportunityScore = Math.round((lead.digitalNeedScore || 70) * 0.55 + (lead.serviceFitScore || 70) * 0.45);
    this.save();
    return lead;
  }

  // ── Capability 5: Service Catalog & Proposals ──
  getServiceCatalog(): ServiceCatalogItemDto[] {
    return DEFAULT_VERTEX_SERVICE_CATALOG;
  }

  generateProposal(leadId: string): AIDiagnosis {
    const lead = this.getLeadById(leadId);
    const diagnosis: AIDiagnosis = {
      digitalGapAnalysis: `Auditoría para ${lead.businessName} identificó brechas críticas en su presencia online para el sector ${lead.sector || "General"}.`,
      highImpactServices: [
        "Desarrollo Web Corporativo de Alta Conversión",
        "Canal Oficial de WhatsApp & Automatización CRM",
        "Auditoría SEO Local en Google Maps",
      ],
      outreachEmail: {
        subject: `${lead.businessName}: Diagnóstico de visibilidad digital y captación web`,
        body: `Estimado equipo directivo de ${lead.businessName},\n\nRevisamos su presencia comercial en Bogotá y destacamos su calificación de ${lead.googleRating?.toFixed(1) || "4.5"}★ en Google Maps.\n\nEn VERTEX diseñamos soluciones digitales para aumentar sus consultas directas.\n\n¿Tendrían 10 minutos para una llamada exploratoria?\n\nAtentamente,\nRay Mendoza | VERTEX`,
      },
      whatsappHook: `¡Hola equipo de ${lead.businessName}! 👋 Notamos oportunidades clave en su presencia digital para captar más clientes. ¿Les gustaría ver una demo de 2 minutos? 📲`,
    };
    lead.aiDiagnosis = diagnosis;
    lead.status = LeadStatus.PROPOSAL_GENERATED;
    this.save();
    return diagnosis;
  }

  getCommercialProposal(leadId: string): CommercialProposalDto {
    const lead = this.getLeadById(leadId);
    return {
      id: `prop_${lead.id}_v1`,
      leadId: lead.id,
      businessName: lead.businessName,
      version: 1,
      title: `Propuesta de Transformación Digital para ${lead.businessName}`,
      executiveSummary: `Auditoría comercial identificó brechas prioritarias en ${lead.businessName}. Se proponen soluciones directas del catálogo VERTEX.`,
      auditedScopeSummary: `Inspección pública de Google Maps y sitio web (${lead.websiteUrl || "sin sitio"}).`,
      verifiedFindings: [
        {
          id: "f1",
          title: !lead.hasWebsite ? "Sin Sitio Web Oficial" : "Optimización de Conversión Requerida",
          observation: !lead.hasWebsite ? "No dispone de sitio web para canalizar búsquedas en Google." : "La experiencia actual carece de botón de WhatsApp directo.",
          commercialImpact: "Fuga de prospectos locales hacia la competencia.",
        },
      ],
      recommendedServices: [
        {
          serviceId: "srv_web_corp_01",
          serviceCode: "WEB_DEV_CORP",
          serviceName: "Desarrollo de Sitio Web Corporativo de Alta Conversión",
          rationale: "Solución de captura directa y presencia institucional indexada.",
          matchedFindingIds: ["f1"],
          deliverables: [
            "Diseño UX/UI exclusivo adaptado a la identidad de marca",
            "Desarrollo responsivo 100% optimizado para móviles y tablets",
            "Integración de dominio corporativo y correos institucionales",
          ],
          exclusions: ["Pasarela de pagos personalizada compleja"],
          dependencies: ["Logotipo e información corporativa"],
          priceFormatted: "$1.800.000 COP",
          estimatedDuration: "14 días hábiles",
        },
      ],
      totalEstimateFormatted: "$1.800.000 COP",
      nextStepText: "Agendar una demostración de 15 minutos para revisar el prototipo inicial.",
      vertexContact: {
        name: "Ray Mendoza",
        role: "Director de Desarrollo",
        email: "gerenciavertexsas@gmail.com",
        phone: "+57 300 865 8910",
        website: "https://vertexcorp.com.co",
      },
      createdAt: new Date().toISOString(),
      status: "DRAFT",
    };
  }

  // ── Capability 6: Client & Internal Reports ──
  getClientReport(leadId: string): ClientReportProjection {
    const lead = this.getLeadById(leadId);
    return {
      reportId: `rep_client_${lead.id}`,
      reportType: "CLIENT",
      version: 1,
      generatedAt: new Date().toISOString(),
      businessName: lead.businessName,
      websiteUrl: lead.websiteUrl,
      formattedAddress: lead.formattedAddress,
      auditedScope: {
        pagesInspectedCount: 1,
        inspectionDate: new Date().toISOString(),
        limitationsNotice: "Diagnóstico técnico basado en observación pública pasiva. Enfoque en mejoras de captación comercial.",
      },
      executiveSummary: `Informe técnico y comercial para ${lead.businessName}. Se detallan oportunidades de modernización web y atención al cliente.`,
      verifiedFindings: [
        {
          title: !lead.hasWebsite ? "Presencia Web Oficial Inexistente" : "Certificación SSL y Optimización Móvil",
          description: !lead.hasWebsite ? "El negocio no dispone de portal oficial indexado en Google." : "Se identificaron mejoras prioritarias en seguridad y velocidad.",
          severity: "HIGH",
          impact: "Pérdida de potenciales clientes que realizan búsquedas desde smartphones.",
        },
      ],
      recommendedSolutions: [
        {
          serviceId: "srv_web_corp_01",
          serviceCode: "WEB_DEV_CORP",
          serviceName: "Desarrollo de Sitio Web Corporativo de Alta Conversión",
          rationale: "Solución integral para captar clientes en Google.",
          matchedFindingIds: [],
          deliverables: ["Página web responsiva", "Integración de WhatsApp", "SEO local"],
          exclusions: [],
          dependencies: [],
          priceFormatted: "$1.800.000 COP",
          estimatedDuration: "14 días hábiles",
        },
      ],
      nextSteps: "Reunión técnica de 15 minutos para coordinar la puesta en marcha.",
      vertexIdentity: {
        companyName: "VERTEX | Innovation & Consulting",
        tagline: "Desarrollo Web & Soluciones Digitales",
        contactPerson: "Ray Mendoza",
        role: "Director de Desarrollo",
        email: "gerenciavertexsas@gmail.com",
        phone: "+57 300 865 8910",
        website: "https://vertexcorp.com.co",
        logoUrl: "/vertex-logo.png",
      },
    };
  }

  getInternalReport(leadId: string): InternalReportProjection {
    const lead = this.getLeadById(leadId);
    return {
      reportId: `rep_int_${lead.id}`,
      reportType: "INTERNAL",
      version: 1,
      generatedAt: new Date().toISOString(),
      leadId: lead.id,
      organizationId: lead.organizationId,
      businessName: lead.businessName,
      websiteUrl: lead.websiteUrl,
      formattedAddress: lead.formattedAddress,
      contactChannels: {
        emails: lead.detectedEmails || [],
        phone: lead.internationalPhone,
        whatsappVerified: lead.hasWhatsapp,
        verificationLevel: lead.contactVerificationLevel || "UNVERIFIED",
      },
      scoring: {
        digitalNeed: lead.digitalNeedScore || 70,
        serviceFit: lead.serviceFitScore || 80,
        evidenceConfidence: lead.evidenceConfidenceScore || 85,
        overallOpportunityScore: lead.opportunityScore,
        opportunityTier: lead.opportunityTier,
        sectorProfile: lead.sector || "GENERAL",
        evidenceCoveragePct: Math.round((lead.evidenceCoverage || 0.8) * 100),
        isInsufficientEvidence: false,
        ruleContributions: [],
        exclusions: [],
      },
      checks: [],
      findings: [],
      recommendedSolutions: [],
    };
  }

  createShareToken(leadId: string) {
    const token = `vtx_${leadId.slice(0, 8)}_${Date.now().toString(36)}`;
    return {
      token,
      expiresAt: new Date(Date.now() + 72 * 3600 * 1000).toISOString(),
      shareUrl: `/reports/shared/${token}`,
    };
  }

  // ── Capability 7: Direct In-App Outreach (Email & WhatsApp) ──
  getCompanyContactChannels(leadId: string): CompanyContactChannels {
    const lead = this.getLeadById(leadId);
    const email = lead.detectedEmails?.[0] || null;
    const phone = lead.internationalPhone || null;

    let availability: CompanyContactChannels["availability"] = "NEITHER";
    if (email && phone) availability = "BOTH";
    else if (email) availability = "EMAIL_ONLY";
    else if (phone) availability = "WHATSAPP_ONLY";

    return {
      availability,
      email: {
        channel: "EMAIL",
        destination: email,
        isAvailable: Boolean(email),
        readiness: email ? "SIMULATED" : "MISSING_DESTINATION",
        verificationLevel: email ? "EXTRACTED_EMAIL" : "UNVERIFIED_PHONE",
        readinessMessage: email ? "Modo Simulación activo (backend directo)" : "Sin correo detectado",
      },
      whatsapp: {
        channel: "WHATSAPP",
        destination: phone,
        isAvailable: Boolean(phone),
        readiness: phone ? "SIMULATED" : "MISSING_DESTINATION",
        verificationLevel: lead.hasWhatsapp ? "VERIFIED_WHATSAPP_LINK" : "UNVERIFIED_PHONE",
        readinessMessage: phone ? "Modo Simulación activo (backend directo)" : "Sin teléfono detectado",
      },
    };
  }

  getCompanyOutreachDrafts(leadId: string): { email: OutreachDraftDto; whatsapp: OutreachDraftDto } {
    const lead = this.getLeadById(leadId);

    if (this.customDrafts[leadId]) {
      const email = this.customDrafts[leadId].email;
      const whatsapp = this.customDrafts[leadId].whatsapp;
      if (email && whatsapp) return { email, whatsapp };
    }

    // Materially different substantive copy according to business sector & verified problems:
    let emailSubject = "";
    let emailBody = "";
    let whatsappBody = "";

    if (lead.sector === "HOTELS_TOURISM") {
      emailSubject = `${lead.businessName}: Reserva directa online y captación de huéspedes`;
      emailBody = `Estimado equipo directivo de ${lead.businessName},\n\nRevisamos su presencia comercial en Google Maps y destacamos su calificación de ${lead.googleRating?.toFixed(1) || "4.6"}★. Observamos que sus potenciales huéspedes no disponen de un motor de reservas directas en su portal web, lo que incrementa la dependencia de comisiones de OTAs (Booking/Expedia).\n\nEn VERTEX implementamos motores de reserva directa y canales de atención por WhatsApp que incrementan el margen por habitación.\n\n¿Tendrían 10 minutos esta semana para una llamada demostrativa?\n\nAtentamente,\nRay Mendoza | VERTEX\ngerenciavertexsas@gmail.com | +57 300 865 8910`;
      whatsappBody = `¡Hola equipo de ${lead.businessName}! 👋 Vimos su hotel en Google Maps (${lead.googleRating?.toFixed(1) || "4.6"}★). Diseñamos motores de reserva directa para que sus huéspedes reserven sin intermediarios ni comisiones de OTAs. ¿Les interesaría ver una demo de 2 minutos? 🏨`;
    } else if (lead.sector === "RESTAURANTS") {
      emailSubject = `${lead.businessName}: Menú digital interactivo y pedidos por WhatsApp`;
      emailBody = `Estimado equipo de ${lead.businessName},\n\nNotamos que su restaurante cuenta con excelentes reseñas de comensales pero actualmente no dispone de menú digital estructurado ni sistema de reservas rápidas por chat.\n\nEn VERTEX diseñamos menús interactivos que envían el pedido organizado directamente a su WhatsApp de atención comercial.\n\n¿Podemos coordinar una breve llamada de 10 minutos para mostrarles cómo funciona?\n\nSaludos cordiales,\nRay Mendoza | VERTEX`;
      whatsappBody = `¡Hola ${lead.businessName}! 🍽️ Notamos su excelente reputación gastronómica. En VERTEX creamos menús digitales interactivos con pedidos directos al chat de ventas para agilizar su atención en horas pico. ¿Les gustaría ver una muestra sin costo? 📲`;
    } else if (lead.sector === "CLINICS") {
      emailSubject = `${lead.businessName}: Seguridad web SSL y agendador de citas médicas`;
      emailBody = `Estimado equipo médico de ${lead.businessName},\n\nRealizamos una auditoría de seguridad y encontramos que su portal web presenta advertencias de certificado SSL no seguro, afectando la privacidad de sus pacientes y el agendamiento de turnos.\n\nEn VERTEX blindamos portales clínicos e integramos agendamiento automático 24/7.\n\n¿Tendrían disponibilidad para conversar 10 minutos sobre la remediación técnica?\n\nAtentamente,\nRay Mendoza | VERTEX`;
      whatsappBody = `¡Hola ${lead.businessName}! 🏥 Analizamos su portal web y vimos oportunidades urgentes de remediación en seguridad SSL y agendamiento online de turnos para pacientes. ¿Podemos compartirles el informe técnico gratuito? 📊`;
    } else if (lead.sector === "RETAIL") {
      emailSubject = `${lead.businessName}: Optimización móvil y catálogo digital de ventas`;
      emailBody = `Estimado equipo de ${lead.businessName},\n\nRevisamos su tienda y detectamos problemas de visualización en smartphones que reducen la conversión de clientes móviles.\n\nEn VERTEX desarrollamos catálogos digitales interactivos y experiencias móviles ultrarrápidas.\n\n¿Les gustaría revisar el diagnóstico en una breve demostración?\n\nSaludos cordiales,\nRay Mendoza | VERTEX`;
      whatsappBody = `¡Hola ${lead.businessName}! 🛍️ Vimos su tienda online y encontramos cómo resolver los errores de navegación en celulares para multiplicar sus ventas por WhatsApp. ¿Les gustaría ver una demo de 2 minutos? 📲`;
    } else {
      emailSubject = `${lead.businessName}: Oportunidad de modernización web y captación digital`;
      emailBody = `Estimado equipo de ${lead.businessName},\n\nRevisamos su presencia comercial en Bogotá y encontramos oportunidades clave para incrementar sus consultas de clientes mediante un sitio web corporativo de alta conversión y canal de WhatsApp.\n\n¿Tendrían 10 minutos esta semana para una llamada demostrativa?\n\nAtentamente,\nRay Mendoza | VERTEX`;
      whatsappBody = `¡Hola ${lead.businessName}! 👋 Analizamos su perfil en Google y diseñamos una solución para automatizar la captación de clientes locales. ¿Les interesaría ver una demo rápida? 🚀`;
    }

    const email: OutreachDraftDto = {
      leadId,
      channel: "EMAIL",
      version: 1,
      subject: emailSubject,
      body: emailBody,
      findingIds: [],
      serviceCodes: [],
      isReviewed: false,
      updatedAt: new Date().toISOString(),
    };

    const whatsapp: OutreachDraftDto = {
      leadId,
      channel: "WHATSAPP",
      version: 1,
      body: whatsappBody,
      findingIds: [],
      serviceCodes: [],
      isReviewed: false,
      updatedAt: new Date().toISOString(),
    };

    return { email, whatsapp };
  }

  saveOutreachDraft(leadId: string, channel: "EMAIL" | "WHATSAPP", data: { subject?: string; body: string }) {
    if (!this.customDrafts[leadId]) this.customDrafts[leadId] = {};
    const existing = this.customDrafts[leadId][channel === "EMAIL" ? "email" : "whatsapp"];

    const draft: OutreachDraftDto = {
      leadId,
      channel,
      version: (existing?.version || 0) + 1,
      subject: data.subject,
      body: data.body,
      findingIds: [],
      serviceCodes: [],
      isReviewed: true,
      updatedAt: new Date().toISOString(),
    };

    if (channel === "EMAIL") this.customDrafts[leadId].email = draft;
    else this.customDrafts[leadId].whatsapp = draft;

    return draft;
  }

  dispatchOutreach(request: SendOutreachRequest): SendOutreachResponse {
    const lead = this.getLeadById(request.leadId);
    const intentId = `intent_${Date.now()}`;
    const providerMessageId = request.channel === "EMAIL" ? `sim_resend_${Date.now()}` : `sim_wamid_${Date.now()}`;

    // Add to delivery history
    if (!this.deliveryHistory[request.leadId]) {
      this.deliveryHistory[request.leadId] = [];
    }

    const historyItem: DeliveryHistoryItem = {
      id: intentId,
      channel: request.channel,
      destination: request.destination,
      subject: request.subject,
      bodySnippet: request.body.slice(0, 100),
      status: "ACCEPTED",
      providerName: "simulation",
      providerMessageId,
      createdAt: new Date().toISOString(),
      dispatchedAt: new Date().toISOString(),
    };

    this.deliveryHistory[request.leadId].unshift(historyItem);

    // Update lead status
    lead.status = LeadStatus.CONTACTED;
    lead.deliveryStatus = "ACCEPTED";
    lead.lastDeliveryAt = new Date();
    this.save();

    return {
      success: true,
      intentId,
      channel: request.channel,
      destination: request.destination,
      status: "ACCEPTED",
      providerName: "simulation",
      providerMessageId,
      message: `Aceptado por el backend en Modo Simulación (${request.channel === "EMAIL" ? "Resend" : "Meta WhatsApp API"}). El mensaje no requirió salir de la aplicación.`,
      timestamp: new Date().toISOString(),
    };
  }

  getDeliveryHistory(leadId: string): DeliveryHistoryItem[] {
    return this.deliveryHistory[leadId] || [];
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
