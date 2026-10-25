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
    if (found) return found;
    if (this.campaigns.length > 0) return this.campaigns[0];
    return {
      id: id || "camp_default",
      organizationId: "00000000-0000-0000-0000-000000000001",
      queryTerm: "Prospección Comercial VERTEX",
      location: "Cartagena, Colombia",
      radiusMeters: 10000,
      totalFound: 50,
      status: "COMPLETED",
      createdAt: new Date(),
    };
  }

  createCampaign(dto: CreateCampaignDto): SearchCampaign & { placesFound: number } {
    // Automatically wipe previous searches so database stays clean and uncluttered
    this.clearAllData();

    const newId = "camp_" + Date.now().toString(36);
    const count = 50;
    const newCampaign: SearchCampaign = {
      id: newId,
      organizationId: "00000000-0000-0000-0000-000000000001",
      queryTerm: dto.queryTerm,
      location: dto.location,
      radiusMeters: dto.radiusMeters,
      totalFound: count,
      status: "COMPLETED",
      createdAt: new Date(),
    };

    this.campaigns = [newCampaign];

    const suffixes = [
      "Central", "Express", "Del Norte", "San José", "El Refugio", "Elite", "Sol & Luna",
      "Plaza Real", "Caribe", "La Casona", "Premium", "Santa María", "Metropolitano", "Colonial",
      "Marítimo", "Bocagrande", "Manga", "Castillogrande", "Getsemaní", "Pie de la Popa",
      "San Diego", "El Cabrero", "Crespo", "Marbella", "Américas", "Provincia", "Alborada",
      "Horizonte", "San Pedro", "Nueva Era", "Especialistas", "Integral", "Vanguardia",
      "Internacional", "La Bahía", "Los Alpes", "Costa Azul", "San Francisco", "El Prado",
      "Alameda", "Diamante", "Portales", "Mirador", "Andina", "Austral", "San Luis",
      "Conquistadores", "Bicentenario", "Península", "Las Palmeras"
    ];

    const generatedLeads: Lead[] = [];

    for (let idx = 0; idx < count; idx++) {
      const suffix = suffixes[idx % suffixes.length] + (idx >= suffixes.length ? ` ${Math.floor(idx / suffixes.length) + 1}` : "");
      const name = `${dto.queryTerm} ${suffix}`;
      const hasWeb = idx % 5 !== 0 && idx % 5 !== 2;
      const hasSsl = hasWeb && idx % 3 !== 0;
      const hasWa = idx % 2 === 0;
      const hasIg = idx % 3 === 0;
      const hasFb = idx % 2 === 1;
      const cleanSlug = name.toLowerCase().replace(/[^a-z0-9]/g, "");

      const digitalScore = (hasWeb ? 35 : 0) + (hasSsl ? 20 : 0) + (hasWa ? 15 : 0) + (hasFb || hasIg ? 15 : 0) + 10;
      const oppScore = 100 - digitalScore;
      const oppTier =
        oppScore >= 80
          ? OpportunityLevel.VERY_HIGH
          : oppScore >= 60
          ? OpportunityLevel.HIGH
          : oppScore >= 40
          ? OpportunityLevel.MEDIUM
          : OpportunityLevel.LOW;

      const falencias: string[] = [];
      const soluciones: string[] = [];

      if (!hasWeb) {
        falencias.push("Sin página web corporativa activa ni catálogo digital indexado en Google");
        soluciones.push("Desarrollo de Software Web a la Medida + Arquitectura Cloud de Alta Conversión");
      } else if (!hasSsl) {
        falencias.push("Sitio web vulnerable (marcado como 'No Seguro' por falta de certificado SSL HTTPS)");
        soluciones.push("Auditoría de Ciberseguridad, Migración a SSL HTTPS y Rediseño Web");
      }

      if (!hasWa) {
        falencias.push("Sin canal de respuesta inmediata 24/7 por WhatsApp para capturar prospectos");
        soluciones.push("Automatización de Ventas y Agendamiento 24/7 por WhatsApp con Inteligencia Artificial");
      }

      if (!hasIg && !hasFb) {
        falencias.push("Presencia nula en redes sociales clave (Instagram y Facebook)");
        soluciones.push("Posicionamiento de Marca, Contenido Estratégico y Producción Audiovisual");
      }

      if (falencias.length === 0) {
        falencias.push("Falta de sistema centralizado de CRM y automatización de embudos comerciales");
        soluciones.push("Implementación de VERTEX CRM PRO para control y aceleración de ventas");
      }

      if (soluciones.length < 3) {
        soluciones.push("Desarrollo de Aplicativo Móvil/Web a la Medida para Fidelización de Clientes");
        soluciones.push("Estrategia de Posicionamiento SEO Local en Google Maps para Superar a la Competencia");
      }

      const diagnosis: AIDiagnosis = {
        digitalGapAnalysis: `${name} en ${dto.location} cuenta con un puntaje de oportunidad comercial de ${oppScore}/100. Brechas detectadas: ${falencias.join(". ")}. La implementación de tecnología VERTEX permitirá captar clientes de inmediato y superar la competencia local.`,
        highImpactServices: soluciones.slice(0, 3),
        outreachEmail: {
          subject: `${name}: Propuesta de Modernización y Crecimiento Digital en ${dto.location} — VERTEX SAS`,
          body: `Estimado equipo directivo de ${name},\n\nLe saluda el equipo de VERTEX SAS (https://vertexcorp.com.co/es), empresa de tecnología, desarrollo de software a la medida e inteligencia artificial en Colombia (Bogotá y Cartagena).\n\nCon motivo de nuestro programa de fortalecimiento para empresas del sector ${dto.queryTerm} en ${dto.location}, realizamos una auditoría pública de su infraestructura y visibilidad digital actual:\n\n1. Hallazgos del Diagnóstico:\n• ${falencias.join("\n• ")}\n\n2. Soluciones Tecnológicas VERTEX para su negocio:\n• ${soluciones.slice(0, 3).join("\n• ")}\n• Implementación de VERTEX CRM PRO para acelerar el ciclo de ventas comercial y capturar prospectos 24/7.\n\nNos encantaría coordinar una breve sesión de 10 minutos esta semana para presentarles una maqueta interactiva adaptada a las necesidades de ${name} sin ningún costo.\n\n¿Qué día de esta semana le resultaría más conveniente?\n\nAtentamente,\n\nGerencia Comercial & Nuevos Negocios\nVERTEX SAS — Soluciones que Transforman Organizaciones\nWeb: https://vertexcorp.com.co/es\nCorreo: gerenciavertexsas@gmail.com\nLíneas de atención: +57 300 865 8910 / +57 312 491 6281\nBogotá & Cartagena, Colombia`,
        },
        whatsappHook: `*VERTEX INNOVATION & SOFTWARE* 🚀\n_Transformación Digital & Soluciones Tecnológicas_\n\nEstimado equipo de *${name}*, cordial saludo.\n\nRevisamos su presencia comercial en *${dto.location}* y realizamos una auditoría técnica de su infraestructura digital:\n\n🔍 *Diagnóstico Rápido:*\n• ${falencias.join("\n• ")}\n\n💡 *Soluciones VERTEX para su negocio:*\n• ${soluciones.slice(0, 2).join("\n• ")}\n• *Automatización Comercial:* Agendamiento y captura de clientes 24/7 por WhatsApp integrados con *VERTEX CRM PRO*.\n\n¿Les gustaría coordinar una videollamada demostrativa de 10 minutos para mostrarles el prototipo sin costo? 📲\n\nQuedamos a su entera disposición,\n\n*Equipo de Crecimiento & Software | VERTEX SAS*\n🌐 https://vertexcorp.com.co/es\n✉️ gerenciavertexsas@gmail.com\n📲 +57 300 865 8910 • +57 312 491 6281\n📍 Bogotá & Cartagena, Colombia`,
      };

      generatedLeads.push({
        id: `lead_${Date.now()}_${idx}`,
        campaignId: newId,
        organizationId: "00000000-0000-0000-0000-000000000001",
        googlePlaceId: `ChIJ_${newId}_${idx}`,
        businessName: name,
        formattedAddress: `Cra ${2 + (idx % 25)} #${10 + (idx * 3) % 80}-${15 + (idx % 40)}, ${dto.location}`,
        internationalPhone: `+57300${1000000 + (idx * 179243) % 8999999}`,
        websiteUrl: hasWeb ? (hasSsl ? `https://www.${cleanSlug}.com.co` : `http://${cleanSlug}.com`) : null,
        googleRating: Number((3.6 + (idx % 14) * 0.1).toFixed(1)),
        googleUserRatingsTotal: 8 + (idx * 11) % 150,
        hasWebsite: hasWeb,
        hasValidSsl: hasSsl,
        hasCustomDomain: hasWeb,
        hasFacebook: hasFb,
        hasInstagram: hasIg,
        hasWhatsapp: hasWa,
        hasTiktok: false,
        detectedEmails: [`contacto@${cleanSlug}.com`, `gerencia@${cleanSlug}.com`],
        detectedCms: hasWeb ? (idx % 2 === 0 ? "WordPress" : "Custom React/Node") : null,
        digitalScore,
        opportunityScore: oppScore,
        opportunityTier: oppTier,
        status: LeadStatus.PROPOSAL_GENERATED,
        aiDiagnosis: diagnosis,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }

    this.leads.unshift(...generatedLeads);
    this.save();

    return { ...newCampaign, placesFound: count };
  }

  clearAllData(): void {
    this.campaigns = [];
    this.leads = [];
    if (typeof window !== "undefined") {
      try {
        localStorage.removeItem("vertex_mock_campaigns");
        localStorage.removeItem("vertex_mock_leads");
      } catch (e) {
        console.warn("Storage error", e);
      }
    }
  }

  getLeads(filters: LeadListFilters): LeadListResponse {
    let list = this.leads;
    if (filters.campaignId && filters.campaignId !== "ALL") {
      const filtered = list.filter((l) => l.campaignId === filters.campaignId);
      if (filtered.length > 0) {
        list = filtered;
      } else if (this.campaigns.length > 0) {
        const fallbackId = this.campaigns[0].id;
        const fallbackLeads = list.filter((l) => l.campaignId === fallbackId);
        if (fallbackLeads.length > 0) {
          list = fallbackLeads;
        }
      }
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
