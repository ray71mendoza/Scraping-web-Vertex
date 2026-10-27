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
    queryTerm: "Empresas & Comercios Calificados",
    location: "Bogotá & Ciudades Principales, Colombia",
    radiusMeters: 15000,
    totalFound: 50,
    status: "COMPLETED",
    createdAt: new Date("2026-09-01T10:00:00Z"),
  },
  {
    id: "00000000-0000-0000-0000-000000000011",
    organizationId: "00000000-0000-0000-0000-000000000001",
    queryTerm: "Clínicas & Salud Especializada",
    location: "Medellín, Colombia",
    radiusMeters: 10000,
    totalFound: 10,
    status: "COMPLETED",
    createdAt: new Date("2026-09-02T14:30:00Z"),
  },
];

const INITIAL_LEADS: ExtendedLead[] = [
  {
    "id": "00000000-0000-0000-0000-000000000101",
    "campaignId": "00000000-0000-0000-0000-000000000010",
    "organizationId": "00000000-0000-0000-0000-000000000001",
    "googlePlaceId": "ChIJ_hotel_boutique_casa_colonial_101",
    "businessName": "Hotel Boutique Casa Colonial",
    "formattedAddress": "Cl 12 #3-45, Candelaria, Bogotá",
    "internationalPhone": "+573108901234",
    "websiteUrl": "https://hotelcasacolonialbogota.com",
    "googleRating": 4.6,
    "googleUserRatingsTotal": 88,
    "hasWebsite": true,
    "hasValidSsl": true,
    "hasCustomDomain": true,
    "hasFacebook": true,
    "hasInstagram": true,
    "hasWhatsapp": true,
    "hasTiktok": false,
    "detectedEmails": [
      "reservas@casacolonialbogota.com"
    ],
    "detectedCms": "WordPress",
    "digitalScore": 55,
    "opportunityScore": 78,
    "opportunityTier": "HIGH",
    "sector": "HOTELS_TOURISM",
    "digitalNeedScore": 75,
    "serviceFitScore": 75,
    "evidenceConfidenceScore": 85,
    "evidenceCoverage": 0.85,
    "contactVerificationLevel": "VERIFIED_WHATSAPP_LINK",
    "contactChannelsAvailable": [
      "EMAIL",
      "WHATSAPP"
    ],
    "deliveryStatus": "NOT_SENT",
    "status": "QUALIFIED",
    "aiDiagnosis": null,
    "createdAt": "2026-09-01T10:00:00.000Z",
    "updatedAt": "2026-09-01T10:00:00.000Z"
  },
  {
    "id": "00000000-0000-0000-0000-000000000102",
    "campaignId": "00000000-0000-0000-0000-000000000010",
    "organizationId": "00000000-0000-0000-0000-000000000001",
    "googlePlaceId": "ChIJ_hotel_parque_93_suites_102",
    "businessName": "Hotel Parque 93 Suites",
    "formattedAddress": "Cra 11A #93-40, Chicó Norte, Bogotá",
    "internationalPhone": "+573123456789",
    "websiteUrl": "https://parque93suites.com",
    "googleRating": 4.5,
    "googleUserRatingsTotal": 142,
    "hasWebsite": true,
    "hasValidSsl": true,
    "hasCustomDomain": true,
    "hasFacebook": true,
    "hasInstagram": true,
    "hasWhatsapp": true,
    "hasTiktok": true,
    "detectedEmails": [
      "recepcion@parque93suites.com"
    ],
    "detectedCms": "Custom",
    "digitalScore": 55,
    "opportunityScore": 82,
    "opportunityTier": "VERY_HIGH",
    "sector": "HOTELS_TOURISM",
    "digitalNeedScore": 75,
    "serviceFitScore": 85,
    "evidenceConfidenceScore": 85,
    "evidenceCoverage": 0.85,
    "contactVerificationLevel": "VERIFIED_WHATSAPP_LINK",
    "contactChannelsAvailable": [
      "EMAIL",
      "WHATSAPP"
    ],
    "deliveryStatus": "NOT_SENT",
    "status": "QUALIFIED",
    "aiDiagnosis": null,
    "createdAt": "2026-09-01T10:00:00.000Z",
    "updatedAt": "2026-09-01T10:00:00.000Z"
  },
  {
    "id": "00000000-0000-0000-0000-000000000103",
    "campaignId": "00000000-0000-0000-0000-000000000010",
    "organizationId": "00000000-0000-0000-0000-000000000001",
    "googlePlaceId": "ChIJ_casa_san_agust_n_heritage_103",
    "businessName": "Casa San Agustín Heritage",
    "formattedAddress": "Centro Histórico, Cl de la Universidad #36-44, Cartagena",
    "internationalPhone": "+573209876543",
    "websiteUrl": "https://hotelcasasanagustin.com",
    "googleRating": 4.8,
    "googleUserRatingsTotal": 310,
    "hasWebsite": true,
    "hasValidSsl": true,
    "hasCustomDomain": true,
    "hasFacebook": true,
    "hasInstagram": true,
    "hasWhatsapp": true,
    "hasTiktok": false,
    "detectedEmails": [
      "info@casasanagustin.com"
    ],
    "detectedCms": "WordPress",
    "digitalScore": 55,
    "opportunityScore": 75,
    "opportunityTier": "HIGH",
    "sector": "HOTELS_TOURISM",
    "digitalNeedScore": 75,
    "serviceFitScore": 75,
    "evidenceConfidenceScore": 85,
    "evidenceCoverage": 0.85,
    "contactVerificationLevel": "VERIFIED_WHATSAPP_LINK",
    "contactChannelsAvailable": [
      "EMAIL",
      "WHATSAPP"
    ],
    "deliveryStatus": "NOT_SENT",
    "status": "QUALIFIED",
    "aiDiagnosis": null,
    "createdAt": "2026-09-01T10:00:00.000Z",
    "updatedAt": "2026-09-01T10:00:00.000Z"
  },
  {
    "id": "00000000-0000-0000-0000-000000000104",
    "campaignId": "00000000-0000-0000-0000-000000000010",
    "organizationId": "00000000-0000-0000-0000-000000000001",
    "googlePlaceId": "ChIJ_ecohabs_tayrona_beach_resort_104",
    "businessName": "Ecohabs Tayrona Beach Resort",
    "formattedAddress": "Km 28 Vía Riohacha, Parque Tayrona, Santa Marta",
    "internationalPhone": "+573185551234",
    "websiteUrl": "http://ecohabstayrona.co",
    "googleRating": 4.7,
    "googleUserRatingsTotal": 195,
    "hasWebsite": true,
    "hasValidSsl": false,
    "hasCustomDomain": true,
    "hasFacebook": true,
    "hasInstagram": true,
    "hasWhatsapp": true,
    "hasTiktok": false,
    "detectedEmails": [
      "reservas@ecohabstayrona.co"
    ],
    "detectedCms": "Wix",
    "digitalScore": 35,
    "opportunityScore": 88,
    "opportunityTier": "VERY_HIGH",
    "sector": "HOTELS_TOURISM",
    "digitalNeedScore": 90,
    "serviceFitScore": 85,
    "evidenceConfidenceScore": 85,
    "evidenceCoverage": 0.85,
    "contactVerificationLevel": "VERIFIED_WHATSAPP_LINK",
    "contactChannelsAvailable": [
      "EMAIL",
      "WHATSAPP"
    ],
    "deliveryStatus": "NOT_SENT",
    "status": "QUALIFIED",
    "aiDiagnosis": null,
    "createdAt": "2026-09-01T10:00:00.000Z",
    "updatedAt": "2026-09-01T10:00:00.000Z"
  },
  {
    "id": "00000000-0000-0000-0000-000000000105",
    "campaignId": "00000000-0000-0000-0000-000000000010",
    "organizationId": "00000000-0000-0000-0000-000000000001",
    "googlePlaceId": "ChIJ_gran_hotel_poblado_plaza_105",
    "businessName": "Gran Hotel Poblado Plaza",
    "formattedAddress": "Cra 43A #4 Sur-75, El Poblado, Medellín",
    "internationalPhone": "+573012223344",
    "websiteUrl": "https://hotelpobladoplaza.com.co",
    "googleRating": 4.4,
    "googleUserRatingsTotal": 420,
    "hasWebsite": true,
    "hasValidSsl": true,
    "hasCustomDomain": true,
    "hasFacebook": true,
    "hasInstagram": true,
    "hasWhatsapp": true,
    "hasTiktok": true,
    "detectedEmails": [
      "gerencia@hotelpobladoplaza.com.co"
    ],
    "detectedCms": "WordPress",
    "digitalScore": 55,
    "opportunityScore": 79,
    "opportunityTier": "HIGH",
    "sector": "HOTELS_TOURISM",
    "digitalNeedScore": 75,
    "serviceFitScore": 75,
    "evidenceConfidenceScore": 85,
    "evidenceCoverage": 0.85,
    "contactVerificationLevel": "VERIFIED_WHATSAPP_LINK",
    "contactChannelsAvailable": [
      "EMAIL",
      "WHATSAPP"
    ],
    "deliveryStatus": "NOT_SENT",
    "status": "QUALIFIED",
    "aiDiagnosis": null,
    "createdAt": "2026-09-01T10:00:00.000Z",
    "updatedAt": "2026-09-01T10:00:00.000Z"
  },
  {
    "id": "00000000-0000-0000-0000-000000000106",
    "campaignId": "00000000-0000-0000-0000-000000000010",
    "organizationId": "00000000-0000-0000-0000-000000000001",
    "googlePlaceId": "ChIJ_hotel_campestre_las_camelias_106",
    "businessName": "Hotel Campestre Las Camelias",
    "formattedAddress": "Km 2 Vía a Pueblo Tapao, Montenegro, Quindío",
    "internationalPhone": "+573147778899",
    "websiteUrl": "https://hotelcampeestrelascamelias.com",
    "googleRating": 4.6,
    "googleUserRatingsTotal": 260,
    "hasWebsite": true,
    "hasValidSsl": true,
    "hasCustomDomain": true,
    "hasFacebook": true,
    "hasInstagram": true,
    "hasWhatsapp": true,
    "hasTiktok": false,
    "detectedEmails": [
      "reservas@lascamelias.com.co"
    ],
    "detectedCms": "Joomla",
    "digitalScore": 55,
    "opportunityScore": 74,
    "opportunityTier": "HIGH",
    "sector": "HOTELS_TOURISM",
    "digitalNeedScore": 75,
    "serviceFitScore": 75,
    "evidenceConfidenceScore": 85,
    "evidenceCoverage": 0.85,
    "contactVerificationLevel": "VERIFIED_WHATSAPP_LINK",
    "contactChannelsAvailable": [
      "EMAIL",
      "WHATSAPP"
    ],
    "deliveryStatus": "NOT_SENT",
    "status": "QUALIFIED",
    "aiDiagnosis": null,
    "createdAt": "2026-09-01T10:00:00.000Z",
    "updatedAt": "2026-09-01T10:00:00.000Z"
  },
  {
    "id": "00000000-0000-0000-0000-000000000107",
    "campaignId": "00000000-0000-0000-0000-000000000010",
    "organizationId": "00000000-0000-0000-0000-000000000001",
    "googlePlaceId": "ChIJ_hotel_san_fernando_real_107",
    "businessName": "Hotel San Fernando Real",
    "formattedAddress": "Cl 5B #29-15, San Fernando, Cali",
    "internationalPhone": "+573163334455",
    "websiteUrl": null,
    "googleRating": 4.3,
    "googleUserRatingsTotal": 110,
    "hasWebsite": false,
    "hasValidSsl": false,
    "hasCustomDomain": false,
    "hasFacebook": true,
    "hasInstagram": true,
    "hasWhatsapp": true,
    "hasTiktok": false,
    "detectedEmails": [
      "sanfernandorealcali@gmail.com"
    ],
    "detectedCms": null,
    "digitalScore": 25,
    "opportunityScore": 92,
    "opportunityTier": "CRITICAL",
    "sector": "HOTELS_TOURISM",
    "digitalNeedScore": 90,
    "serviceFitScore": 85,
    "evidenceConfidenceScore": 85,
    "evidenceCoverage": 0.85,
    "contactVerificationLevel": "VERIFIED_WHATSAPP_LINK",
    "contactChannelsAvailable": [
      "EMAIL",
      "WHATSAPP"
    ],
    "deliveryStatus": "NOT_SENT",
    "status": "QUALIFIED",
    "aiDiagnosis": null,
    "createdAt": "2026-09-01T10:00:00.000Z",
    "updatedAt": "2026-09-01T10:00:00.000Z"
  },
  {
    "id": "00000000-0000-0000-0000-000000000108",
    "campaignId": "00000000-0000-0000-0000-000000000010",
    "organizationId": "00000000-0000-0000-0000-000000000001",
    "googlePlaceId": "ChIJ_hostal_colonial_getseman__108",
    "businessName": "Hostal Colonial Getsemaní",
    "formattedAddress": "Calle de la Sierpe #29-48, Cartagena",
    "internationalPhone": "+573114445566",
    "websiteUrl": "https://getsemanihostal.wixsite.com/home",
    "googleRating": 4.5,
    "googleUserRatingsTotal": 165,
    "hasWebsite": true,
    "hasValidSsl": true,
    "hasCustomDomain": false,
    "hasFacebook": true,
    "hasInstagram": true,
    "hasWhatsapp": true,
    "hasTiktok": true,
    "detectedEmails": [
      "getsemanihostal@gmail.com"
    ],
    "detectedCms": "Wix",
    "digitalScore": 55,
    "opportunityScore": 84,
    "opportunityTier": "VERY_HIGH",
    "sector": "HOTELS_TOURISM",
    "digitalNeedScore": 75,
    "serviceFitScore": 85,
    "evidenceConfidenceScore": 85,
    "evidenceCoverage": 0.85,
    "contactVerificationLevel": "VERIFIED_WHATSAPP_LINK",
    "contactChannelsAvailable": [
      "EMAIL",
      "WHATSAPP"
    ],
    "deliveryStatus": "NOT_SENT",
    "status": "QUALIFIED",
    "aiDiagnosis": null,
    "createdAt": "2026-09-01T10:00:00.000Z",
    "updatedAt": "2026-09-01T10:00:00.000Z"
  },
  {
    "id": "00000000-0000-0000-0000-000000000109",
    "campaignId": "00000000-0000-0000-0000-000000000010",
    "organizationId": "00000000-0000-0000-0000-000000000001",
    "googlePlaceId": "ChIJ_hotel_boutique_quinta_camacho_109",
    "businessName": "Hotel Boutique Quinta Camacho",
    "formattedAddress": "Cl 70A #9-35, Quinta Camacho, Bogotá",
    "internationalPhone": "+573158889900",
    "websiteUrl": "https://quintacamachohotel.com",
    "googleRating": 4.7,
    "googleUserRatingsTotal": 94,
    "hasWebsite": true,
    "hasValidSsl": true,
    "hasCustomDomain": true,
    "hasFacebook": true,
    "hasInstagram": true,
    "hasWhatsapp": true,
    "hasTiktok": false,
    "detectedEmails": [
      "frontdesk@quintacamachohotel.com"
    ],
    "detectedCms": "WordPress",
    "digitalScore": 55,
    "opportunityScore": 76,
    "opportunityTier": "HIGH",
    "sector": "HOTELS_TOURISM",
    "digitalNeedScore": 75,
    "serviceFitScore": 75,
    "evidenceConfidenceScore": 85,
    "evidenceCoverage": 0.85,
    "contactVerificationLevel": "VERIFIED_WHATSAPP_LINK",
    "contactChannelsAvailable": [
      "EMAIL",
      "WHATSAPP"
    ],
    "deliveryStatus": "NOT_SENT",
    "status": "QUALIFIED",
    "aiDiagnosis": null,
    "createdAt": "2026-09-01T10:00:00.000Z",
    "updatedAt": "2026-09-01T10:00:00.000Z"
  },
  {
    "id": "00000000-0000-0000-0000-000000000110",
    "campaignId": "00000000-0000-0000-0000-000000000010",
    "organizationId": "00000000-0000-0000-0000-000000000001",
    "googlePlaceId": "ChIJ_glamping_valle_del_cocora_110",
    "businessName": "Glamping Valle del Cocora",
    "formattedAddress": "Vereda Cocora Km 7, Salento, Quindío",
    "internationalPhone": "+573001112233",
    "websiteUrl": null,
    "googleRating": 4.9,
    "googleUserRatingsTotal": 340,
    "hasWebsite": false,
    "hasValidSsl": false,
    "hasCustomDomain": false,
    "hasFacebook": true,
    "hasInstagram": true,
    "hasWhatsapp": true,
    "hasTiktok": false,
    "detectedEmails": [
      "cocoraglamping@gmail.com"
    ],
    "detectedCms": null,
    "digitalScore": 25,
    "opportunityScore": 94,
    "opportunityTier": "CRITICAL",
    "sector": "HOTELS_TOURISM",
    "digitalNeedScore": 90,
    "serviceFitScore": 85,
    "evidenceConfidenceScore": 85,
    "evidenceCoverage": 0.85,
    "contactVerificationLevel": "VERIFIED_WHATSAPP_LINK",
    "contactChannelsAvailable": [
      "EMAIL",
      "WHATSAPP"
    ],
    "deliveryStatus": "NOT_SENT",
    "status": "QUALIFIED",
    "aiDiagnosis": null,
    "createdAt": "2026-09-01T10:00:00.000Z",
    "updatedAt": "2026-09-01T10:00:00.000Z"
  },
  {
    "id": "00000000-0000-0000-0000-000000000111",
    "campaignId": "00000000-0000-0000-0000-000000000010",
    "organizationId": "00000000-0000-0000-0000-000000000001",
    "googlePlaceId": "ChIJ_restaurante_la_terraza_gourmet_111",
    "businessName": "Restaurante La Terraza Gourmet",
    "formattedAddress": "Cra 7 #116-20, Usaquén, Bogotá",
    "internationalPhone": "+573004567890",
    "websiteUrl": null,
    "googleRating": 4.4,
    "googleUserRatingsTotal": 142,
    "hasWebsite": false,
    "hasValidSsl": false,
    "hasCustomDomain": false,
    "hasFacebook": true,
    "hasInstagram": true,
    "hasWhatsapp": true,
    "hasTiktok": true,
    "detectedEmails": [
      "terrazausaquen@gmail.com"
    ],
    "detectedCms": null,
    "digitalScore": 25,
    "opportunityScore": 85,
    "opportunityTier": "VERY_HIGH",
    "sector": "RESTAURANTS",
    "digitalNeedScore": 75,
    "serviceFitScore": 85,
    "evidenceConfidenceScore": 85,
    "evidenceCoverage": 0.85,
    "contactVerificationLevel": "VERIFIED_WHATSAPP_LINK",
    "contactChannelsAvailable": [
      "EMAIL",
      "WHATSAPP"
    ],
    "deliveryStatus": "NOT_SENT",
    "status": "QUALIFIED",
    "aiDiagnosis": null,
    "createdAt": "2026-09-01T10:00:00.000Z",
    "updatedAt": "2026-09-01T10:00:00.000Z"
  },
  {
    "id": "00000000-0000-0000-0000-000000000112",
    "campaignId": "00000000-0000-0000-0000-000000000010",
    "organizationId": "00000000-0000-0000-0000-000000000001",
    "googlePlaceId": "ChIJ_fog_n_aut_ntico_parrilla_112",
    "businessName": "Fogón Auténtico Parrilla",
    "formattedAddress": "Av Nutibara #73-12, Laureles, Medellín",
    "internationalPhone": "+573176665544",
    "websiteUrl": "https://fogonautentico.com",
    "googleRating": 4.6,
    "googleUserRatingsTotal": 280,
    "hasWebsite": true,
    "hasValidSsl": true,
    "hasCustomDomain": true,
    "hasFacebook": true,
    "hasInstagram": true,
    "hasWhatsapp": true,
    "hasTiktok": false,
    "detectedEmails": [
      "eventos@fogonautentico.com"
    ],
    "detectedCms": "WordPress",
    "digitalScore": 55,
    "opportunityScore": 77,
    "opportunityTier": "HIGH",
    "sector": "RESTAURANTS",
    "digitalNeedScore": 75,
    "serviceFitScore": 75,
    "evidenceConfidenceScore": 85,
    "evidenceCoverage": 0.85,
    "contactVerificationLevel": "VERIFIED_WHATSAPP_LINK",
    "contactChannelsAvailable": [
      "EMAIL",
      "WHATSAPP"
    ],
    "deliveryStatus": "NOT_SENT",
    "status": "QUALIFIED",
    "aiDiagnosis": null,
    "createdAt": "2026-09-01T10:00:00.000Z",
    "updatedAt": "2026-09-01T10:00:00.000Z"
  },
  {
    "id": "00000000-0000-0000-0000-000000000113",
    "campaignId": "00000000-0000-0000-0000-000000000010",
    "organizationId": "00000000-0000-0000-0000-000000000001",
    "googlePlaceId": "ChIJ_cevicheria_don_pedro_113",
    "businessName": "Cevicheria Don Pedro",
    "formattedAddress": "Plaza del Pozo, Getsemaní, Cartagena",
    "internationalPhone": "+573024443322",
    "websiteUrl": null,
    "googleRating": 4.7,
    "googleUserRatingsTotal": 320,
    "hasWebsite": false,
    "hasValidSsl": false,
    "hasCustomDomain": false,
    "hasFacebook": true,
    "hasInstagram": true,
    "hasWhatsapp": true,
    "hasTiktok": false,
    "detectedEmails": [
      "donpedroceviche@gmail.com"
    ],
    "detectedCms": null,
    "digitalScore": 25,
    "opportunityScore": 90,
    "opportunityTier": "CRITICAL",
    "sector": "RESTAURANTS",
    "digitalNeedScore": 90,
    "serviceFitScore": 85,
    "evidenceConfidenceScore": 85,
    "evidenceCoverage": 0.85,
    "contactVerificationLevel": "VERIFIED_WHATSAPP_LINK",
    "contactChannelsAvailable": [
      "EMAIL",
      "WHATSAPP"
    ],
    "deliveryStatus": "NOT_SENT",
    "status": "QUALIFIED",
    "aiDiagnosis": null,
    "createdAt": "2026-09-01T10:00:00.000Z",
    "updatedAt": "2026-09-01T10:00:00.000Z"
  },
  {
    "id": "00000000-0000-0000-0000-000000000114",
    "campaignId": "00000000-0000-0000-0000-000000000010",
    "organizationId": "00000000-0000-0000-0000-000000000001",
    "googlePlaceId": "ChIJ_pizzer_a_artesanal_napolitana_114",
    "businessName": "Pizzería Artesanal Napolitana",
    "formattedAddress": "Cra 5 #69-24, Zona G, Bogotá",
    "internationalPhone": "+573138887766",
    "websiteUrl": "https://napolitanapizza.co",
    "googleRating": 4.5,
    "googleUserRatingsTotal": 180,
    "hasWebsite": true,
    "hasValidSsl": true,
    "hasCustomDomain": true,
    "hasFacebook": true,
    "hasInstagram": true,
    "hasWhatsapp": true,
    "hasTiktok": true,
    "detectedEmails": [
      "pedidos@napolitanapizza.co"
    ],
    "detectedCms": "Shopify",
    "digitalScore": 55,
    "opportunityScore": 80,
    "opportunityTier": "HIGH",
    "sector": "RESTAURANTS",
    "digitalNeedScore": 75,
    "serviceFitScore": 75,
    "evidenceConfidenceScore": 85,
    "evidenceCoverage": 0.85,
    "contactVerificationLevel": "VERIFIED_WHATSAPP_LINK",
    "contactChannelsAvailable": [
      "EMAIL",
      "WHATSAPP"
    ],
    "deliveryStatus": "NOT_SENT",
    "status": "QUALIFIED",
    "aiDiagnosis": null,
    "createdAt": "2026-09-01T10:00:00.000Z",
    "updatedAt": "2026-09-01T10:00:00.000Z"
  },
  {
    "id": "00000000-0000-0000-0000-000000000115",
    "campaignId": "00000000-0000-0000-0000-000000000010",
    "organizationId": "00000000-0000-0000-0000-000000000001",
    "googlePlaceId": "ChIJ_marisquer_a_bah_a_azul_115",
    "businessName": "Marisquería Bahía Azul",
    "formattedAddress": "Av San Martín #8-42, Bocagrande, Cartagena",
    "internationalPhone": "+573182221100",
    "websiteUrl": "https://bahiaazulcartagena.com",
    "googleRating": 4.3,
    "googleUserRatingsTotal": 125,
    "hasWebsite": true,
    "hasValidSsl": true,
    "hasCustomDomain": true,
    "hasFacebook": true,
    "hasInstagram": true,
    "hasWhatsapp": true,
    "hasTiktok": false,
    "detectedEmails": [
      "contacto@bahiaazulcartagena.com"
    ],
    "detectedCms": "WordPress",
    "digitalScore": 55,
    "opportunityScore": 83,
    "opportunityTier": "VERY_HIGH",
    "sector": "RESTAURANTS",
    "digitalNeedScore": 75,
    "serviceFitScore": 85,
    "evidenceConfidenceScore": 85,
    "evidenceCoverage": 0.85,
    "contactVerificationLevel": "VERIFIED_WHATSAPP_LINK",
    "contactChannelsAvailable": [
      "EMAIL",
      "WHATSAPP"
    ],
    "deliveryStatus": "NOT_SENT",
    "status": "QUALIFIED",
    "aiDiagnosis": null,
    "createdAt": "2026-09-01T10:00:00.000Z",
    "updatedAt": "2026-09-01T10:00:00.000Z"
  },
  {
    "id": "00000000-0000-0000-0000-000000000116",
    "campaignId": "00000000-0000-0000-0000-000000000010",
    "organizationId": "00000000-0000-0000-0000-000000000001",
    "googlePlaceId": "ChIJ_trattoria_da_franco_116",
    "businessName": "Trattoria da Franco",
    "formattedAddress": "Cra 2 #3-18, El Peñón, Cali",
    "internationalPhone": "+573167776655",
    "websiteUrl": null,
    "googleRating": 4.6,
    "googleUserRatingsTotal": 145,
    "hasWebsite": false,
    "hasValidSsl": false,
    "hasCustomDomain": false,
    "hasFacebook": true,
    "hasInstagram": true,
    "hasWhatsapp": true,
    "hasTiktok": false,
    "detectedEmails": [
      "trattoriadafrancocali@gmail.com"
    ],
    "detectedCms": null,
    "digitalScore": 25,
    "opportunityScore": 86,
    "opportunityTier": "VERY_HIGH",
    "sector": "RESTAURANTS",
    "digitalNeedScore": 90,
    "serviceFitScore": 85,
    "evidenceConfidenceScore": 85,
    "evidenceCoverage": 0.85,
    "contactVerificationLevel": "VERIFIED_WHATSAPP_LINK",
    "contactChannelsAvailable": [
      "EMAIL",
      "WHATSAPP"
    ],
    "deliveryStatus": "NOT_SENT",
    "status": "QUALIFIED",
    "aiDiagnosis": null,
    "createdAt": "2026-09-01T10:00:00.000Z",
    "updatedAt": "2026-09-01T10:00:00.000Z"
  },
  {
    "id": "00000000-0000-0000-0000-000000000117",
    "campaignId": "00000000-0000-0000-0000-000000000010",
    "organizationId": "00000000-0000-0000-0000-000000000001",
    "googlePlaceId": "ChIJ_asador_criollo_las_brasas_117",
    "businessName": "Asador Criollo Las Brasas",
    "formattedAddress": "Km 3 Variante Chía - Cota, Chía",
    "internationalPhone": "+573113332211",
    "websiteUrl": "http://lasbrasaschia.com",
    "googleRating": 4.4,
    "googleUserRatingsTotal": 215,
    "hasWebsite": true,
    "hasValidSsl": false,
    "hasCustomDomain": true,
    "hasFacebook": true,
    "hasInstagram": true,
    "hasWhatsapp": true,
    "hasTiktok": true,
    "detectedEmails": [
      "reservas@lasbrasaschia.com"
    ],
    "detectedCms": "Custom",
    "digitalScore": 35,
    "opportunityScore": 81,
    "opportunityTier": "HIGH",
    "sector": "RESTAURANTS",
    "digitalNeedScore": 75,
    "serviceFitScore": 85,
    "evidenceConfidenceScore": 85,
    "evidenceCoverage": 0.85,
    "contactVerificationLevel": "VERIFIED_WHATSAPP_LINK",
    "contactChannelsAvailable": [
      "EMAIL",
      "WHATSAPP"
    ],
    "deliveryStatus": "NOT_SENT",
    "status": "QUALIFIED",
    "aiDiagnosis": null,
    "createdAt": "2026-09-01T10:00:00.000Z",
    "updatedAt": "2026-09-01T10:00:00.000Z"
  },
  {
    "id": "00000000-0000-0000-0000-000000000118",
    "campaignId": "00000000-0000-0000-0000-000000000010",
    "organizationId": "00000000-0000-0000-0000-000000000001",
    "googlePlaceId": "ChIJ_caf____bistro_macondo_118",
    "businessName": "Café & Bistro Macondo",
    "formattedAddress": "Cl 11 #2-18, La Candelaria, Bogotá",
    "internationalPhone": "+573019998877",
    "websiteUrl": "https://macondobistro.com.co",
    "googleRating": 4.8,
    "googleUserRatingsTotal": 360,
    "hasWebsite": true,
    "hasValidSsl": true,
    "hasCustomDomain": true,
    "hasFacebook": true,
    "hasInstagram": true,
    "hasWhatsapp": true,
    "hasTiktok": false,
    "detectedEmails": [
      "cafe@macondobistro.com.co"
    ],
    "detectedCms": "WordPress",
    "digitalScore": 55,
    "opportunityScore": 75,
    "opportunityTier": "HIGH",
    "sector": "RESTAURANTS",
    "digitalNeedScore": 75,
    "serviceFitScore": 75,
    "evidenceConfidenceScore": 85,
    "evidenceCoverage": 0.85,
    "contactVerificationLevel": "VERIFIED_WHATSAPP_LINK",
    "contactChannelsAvailable": [
      "EMAIL",
      "WHATSAPP"
    ],
    "deliveryStatus": "NOT_SENT",
    "status": "QUALIFIED",
    "aiDiagnosis": null,
    "createdAt": "2026-09-01T10:00:00.000Z",
    "updatedAt": "2026-09-01T10:00:00.000Z"
  },
  {
    "id": "00000000-0000-0000-0000-000000000119",
    "campaignId": "00000000-0000-0000-0000-000000000010",
    "organizationId": "00000000-0000-0000-0000-000000000001",
    "googlePlaceId": "ChIJ_hamburgueser_a_craft_urban_119",
    "businessName": "Hamburguesería Craft Urban",
    "formattedAddress": "Cl 39 Sur #41-15, Envigado, Antioquia",
    "internationalPhone": "+573215554433",
    "websiteUrl": null,
    "googleRating": 4.5,
    "googleUserRatingsTotal": 195,
    "hasWebsite": false,
    "hasValidSsl": false,
    "hasCustomDomain": false,
    "hasFacebook": true,
    "hasInstagram": true,
    "hasWhatsapp": true,
    "hasTiktok": false,
    "detectedEmails": [
      "crafturbanburger@gmail.com"
    ],
    "detectedCms": null,
    "digitalScore": 25,
    "opportunityScore": 88,
    "opportunityTier": "VERY_HIGH",
    "sector": "RESTAURANTS",
    "digitalNeedScore": 90,
    "serviceFitScore": 85,
    "evidenceConfidenceScore": 85,
    "evidenceCoverage": 0.85,
    "contactVerificationLevel": "VERIFIED_WHATSAPP_LINK",
    "contactChannelsAvailable": [
      "EMAIL",
      "WHATSAPP"
    ],
    "deliveryStatus": "NOT_SENT",
    "status": "QUALIFIED",
    "aiDiagnosis": null,
    "createdAt": "2026-09-01T10:00:00.000Z",
    "updatedAt": "2026-09-01T10:00:00.000Z"
  },
  {
    "id": "00000000-0000-0000-0000-000000000120",
    "campaignId": "00000000-0000-0000-0000-000000000010",
    "organizationId": "00000000-0000-0000-0000-000000000001",
    "googlePlaceId": "ChIJ_sushi_bar_nikkei_fusi_n_120",
    "businessName": "Sushi Bar Nikkei Fusión",
    "formattedAddress": "Cl 93A #13-20, Parque 93, Bogotá",
    "internationalPhone": "+573154443322",
    "websiteUrl": "https://nikkeifusion93.com",
    "googleRating": 4.7,
    "googleUserRatingsTotal": 160,
    "hasWebsite": true,
    "hasValidSsl": true,
    "hasCustomDomain": true,
    "hasFacebook": true,
    "hasInstagram": true,
    "hasWhatsapp": true,
    "hasTiktok": true,
    "detectedEmails": [
      "pedidos@nikkeifusion93.com"
    ],
    "detectedCms": "Wix",
    "digitalScore": 55,
    "opportunityScore": 78,
    "opportunityTier": "HIGH",
    "sector": "RESTAURANTS",
    "digitalNeedScore": 75,
    "serviceFitScore": 75,
    "evidenceConfidenceScore": 85,
    "evidenceCoverage": 0.85,
    "contactVerificationLevel": "VERIFIED_WHATSAPP_LINK",
    "contactChannelsAvailable": [
      "EMAIL",
      "WHATSAPP"
    ],
    "deliveryStatus": "NOT_SENT",
    "status": "QUALIFIED",
    "aiDiagnosis": null,
    "createdAt": "2026-09-01T10:00:00.000Z",
    "updatedAt": "2026-09-01T10:00:00.000Z"
  },
  {
    "id": "00000000-0000-0000-0000-000000000121",
    "campaignId": "00000000-0000-0000-0000-000000000010",
    "organizationId": "00000000-0000-0000-0000-000000000001",
    "googlePlaceId": "ChIJ_centro_m_dico_especialistas_cedritos_121",
    "businessName": "Centro Médico Especialistas Cedritos",
    "formattedAddress": "Cl 140 #11-30, Cedritos, Bogotá",
    "internationalPhone": "+573103332211",
    "websiteUrl": "http://especialistascedritos.com",
    "googleRating": 4.1,
    "googleUserRatingsTotal": 34,
    "hasWebsite": true,
    "hasValidSsl": false,
    "hasCustomDomain": true,
    "hasFacebook": true,
    "hasInstagram": true,
    "hasWhatsapp": true,
    "hasTiktok": false,
    "detectedEmails": [
      "citas@especialistascedritos.com"
    ],
    "detectedCms": "Custom HTML",
    "digitalScore": 35,
    "opportunityScore": 84,
    "opportunityTier": "VERY_HIGH",
    "sector": "CLINICS",
    "digitalNeedScore": 75,
    "serviceFitScore": 85,
    "evidenceConfidenceScore": 85,
    "evidenceCoverage": 0.85,
    "contactVerificationLevel": "VERIFIED_WHATSAPP_LINK",
    "contactChannelsAvailable": [
      "EMAIL",
      "WHATSAPP"
    ],
    "deliveryStatus": "NOT_SENT",
    "status": "QUALIFIED",
    "aiDiagnosis": null,
    "createdAt": "2026-09-01T10:00:00.000Z",
    "updatedAt": "2026-09-01T10:00:00.000Z"
  },
  {
    "id": "00000000-0000-0000-0000-000000000122",
    "campaignId": "00000000-0000-0000-0000-000000000010",
    "organizationId": "00000000-0000-0000-0000-000000000001",
    "googlePlaceId": "ChIJ_odontolog_a_especializada_san_mart_n_122",
    "businessName": "Odontología Especializada San Martín",
    "formattedAddress": "Cl 10 #43E-20, El Poblado, Medellín",
    "internationalPhone": "+573145556677",
    "websiteUrl": "https://sanmartinodontologia.com",
    "googleRating": 4.7,
    "googleUserRatingsTotal": 92,
    "hasWebsite": true,
    "hasValidSsl": true,
    "hasCustomDomain": true,
    "hasFacebook": true,
    "hasInstagram": true,
    "hasWhatsapp": true,
    "hasTiktok": false,
    "detectedEmails": [
      "sonrisas@sanmartinodontologia.com"
    ],
    "detectedCms": "WordPress",
    "digitalScore": 55,
    "opportunityScore": 76,
    "opportunityTier": "HIGH",
    "sector": "CLINICS",
    "digitalNeedScore": 75,
    "serviceFitScore": 75,
    "evidenceConfidenceScore": 85,
    "evidenceCoverage": 0.85,
    "contactVerificationLevel": "VERIFIED_WHATSAPP_LINK",
    "contactChannelsAvailable": [
      "EMAIL",
      "WHATSAPP"
    ],
    "deliveryStatus": "NOT_SENT",
    "status": "QUALIFIED",
    "aiDiagnosis": null,
    "createdAt": "2026-09-01T10:00:00.000Z",
    "updatedAt": "2026-09-01T10:00:00.000Z"
  },
  {
    "id": "00000000-0000-0000-0000-000000000123",
    "campaignId": "00000000-0000-0000-0000-000000000010",
    "organizationId": "00000000-0000-0000-0000-000000000001",
    "googlePlaceId": "ChIJ_cl_nica_dermatol_gica_l_ser___piel_123",
    "businessName": "Clínica Dermatológica Láser & Piel",
    "formattedAddress": "Cra 15 #88-64, Chicó, Bogotá",
    "internationalPhone": "+573187778899",
    "websiteUrl": "https://laserpielbogota.com",
    "googleRating": 4.5,
    "googleUserRatingsTotal": 130,
    "hasWebsite": true,
    "hasValidSsl": true,
    "hasCustomDomain": true,
    "hasFacebook": true,
    "hasInstagram": true,
    "hasWhatsapp": true,
    "hasTiktok": true,
    "detectedEmails": [
      "contacto@laserpielbogota.com"
    ],
    "detectedCms": "WordPress",
    "digitalScore": 55,
    "opportunityScore": 79,
    "opportunityTier": "HIGH",
    "sector": "CLINICS",
    "digitalNeedScore": 75,
    "serviceFitScore": 75,
    "evidenceConfidenceScore": 85,
    "evidenceCoverage": 0.85,
    "contactVerificationLevel": "VERIFIED_WHATSAPP_LINK",
    "contactChannelsAvailable": [
      "EMAIL",
      "WHATSAPP"
    ],
    "deliveryStatus": "NOT_SENT",
    "status": "QUALIFIED",
    "aiDiagnosis": null,
    "createdAt": "2026-09-01T10:00:00.000Z",
    "updatedAt": "2026-09-01T10:00:00.000Z"
  },
  {
    "id": "00000000-0000-0000-0000-000000000124",
    "campaignId": "00000000-0000-0000-0000-000000000010",
    "organizationId": "00000000-0000-0000-0000-000000000001",
    "googlePlaceId": "ChIJ_laboratorio_cl_nico_san_fernando_124",
    "businessName": "Laboratorio Clínico San Fernando",
    "formattedAddress": "Av Roosevelt #36-22, San Fernando, Cali",
    "internationalPhone": "+573169990011",
    "websiteUrl": "http://labsanfernandocali.com",
    "googleRating": 4.3,
    "googleUserRatingsTotal": 68,
    "hasWebsite": true,
    "hasValidSsl": false,
    "hasCustomDomain": true,
    "hasFacebook": true,
    "hasInstagram": true,
    "hasWhatsapp": true,
    "hasTiktok": false,
    "detectedEmails": [
      "resultados@labsanfernandocali.com"
    ],
    "detectedCms": "Custom",
    "digitalScore": 35,
    "opportunityScore": 85,
    "opportunityTier": "VERY_HIGH",
    "sector": "CLINICS",
    "digitalNeedScore": 75,
    "serviceFitScore": 85,
    "evidenceConfidenceScore": 85,
    "evidenceCoverage": 0.85,
    "contactVerificationLevel": "VERIFIED_WHATSAPP_LINK",
    "contactChannelsAvailable": [
      "EMAIL",
      "WHATSAPP"
    ],
    "deliveryStatus": "NOT_SENT",
    "status": "QUALIFIED",
    "aiDiagnosis": null,
    "createdAt": "2026-09-01T10:00:00.000Z",
    "updatedAt": "2026-09-01T10:00:00.000Z"
  },
  {
    "id": "00000000-0000-0000-0000-000000000125",
    "campaignId": "00000000-0000-0000-0000-000000000010",
    "organizationId": "00000000-0000-0000-0000-000000000001",
    "googlePlaceId": "ChIJ_centro_pedi_trico_infantil_el_country_125",
    "businessName": "Centro Pediátrico Infantil El Country",
    "formattedAddress": "Cra 16 #82-45, El Country, Bogotá",
    "internationalPhone": "+573112223344",
    "websiteUrl": "https://pediatriacountry.co",
    "googleRating": 4.8,
    "googleUserRatingsTotal": 210,
    "hasWebsite": true,
    "hasValidSsl": true,
    "hasCustomDomain": true,
    "hasFacebook": true,
    "hasInstagram": true,
    "hasWhatsapp": true,
    "hasTiktok": false,
    "detectedEmails": [
      "consultas@pediatriacountry.co"
    ],
    "detectedCms": "WordPress",
    "digitalScore": 55,
    "opportunityScore": 73,
    "opportunityTier": "HIGH",
    "sector": "CLINICS",
    "digitalNeedScore": 75,
    "serviceFitScore": 75,
    "evidenceConfidenceScore": 85,
    "evidenceCoverage": 0.85,
    "contactVerificationLevel": "VERIFIED_WHATSAPP_LINK",
    "contactChannelsAvailable": [
      "EMAIL",
      "WHATSAPP"
    ],
    "deliveryStatus": "NOT_SENT",
    "status": "QUALIFIED",
    "aiDiagnosis": null,
    "createdAt": "2026-09-01T10:00:00.000Z",
    "updatedAt": "2026-09-01T10:00:00.000Z"
  },
  {
    "id": "00000000-0000-0000-0000-000000000126",
    "campaignId": "00000000-0000-0000-0000-000000000010",
    "organizationId": "00000000-0000-0000-0000-000000000001",
    "googlePlaceId": "ChIJ_oftalmolog_a_l_ser_del_norte_126",
    "businessName": "Oftalmología Láser del Norte",
    "formattedAddress": "Cl 85 #50-38, Riomar, Barranquilla",
    "internationalPhone": "+573007776655",
    "websiteUrl": null,
    "googleRating": 4.6,
    "googleUserRatingsTotal": 84,
    "hasWebsite": false,
    "hasValidSsl": false,
    "hasCustomDomain": false,
    "hasFacebook": true,
    "hasInstagram": true,
    "hasWhatsapp": true,
    "hasTiktok": true,
    "detectedEmails": [
      "oftalmologianorte@gmail.com"
    ],
    "detectedCms": null,
    "digitalScore": 25,
    "opportunityScore": 91,
    "opportunityTier": "CRITICAL",
    "sector": "CLINICS",
    "digitalNeedScore": 90,
    "serviceFitScore": 85,
    "evidenceConfidenceScore": 85,
    "evidenceCoverage": 0.85,
    "contactVerificationLevel": "VERIFIED_WHATSAPP_LINK",
    "contactChannelsAvailable": [
      "EMAIL",
      "WHATSAPP"
    ],
    "deliveryStatus": "NOT_SENT",
    "status": "QUALIFIED",
    "aiDiagnosis": null,
    "createdAt": "2026-09-01T10:00:00.000Z",
    "updatedAt": "2026-09-01T10:00:00.000Z"
  },
  {
    "id": "00000000-0000-0000-0000-000000000127",
    "campaignId": "00000000-0000-0000-0000-000000000010",
    "organizationId": "00000000-0000-0000-0000-000000000001",
    "googlePlaceId": "ChIJ_centro_est_tico___spa_serenidad_127",
    "businessName": "Centro Estético & Spa Serenidad",
    "formattedAddress": "Cra 35 #7-50, Provenza, Medellín",
    "internationalPhone": "+573224445566",
    "websiteUrl": "https://serenidadmedellin.wixsite.com/spa",
    "googleRating": 4.7,
    "googleUserRatingsTotal": 115,
    "hasWebsite": true,
    "hasValidSsl": true,
    "hasCustomDomain": false,
    "hasFacebook": true,
    "hasInstagram": true,
    "hasWhatsapp": true,
    "hasTiktok": false,
    "detectedEmails": [
      "citas@spaserenidad.com.co"
    ],
    "detectedCms": "Wix",
    "digitalScore": 55,
    "opportunityScore": 82,
    "opportunityTier": "VERY_HIGH",
    "sector": "CLINICS",
    "digitalNeedScore": 75,
    "serviceFitScore": 85,
    "evidenceConfidenceScore": 85,
    "evidenceCoverage": 0.85,
    "contactVerificationLevel": "VERIFIED_WHATSAPP_LINK",
    "contactChannelsAvailable": [
      "EMAIL",
      "WHATSAPP"
    ],
    "deliveryStatus": "NOT_SENT",
    "status": "QUALIFIED",
    "aiDiagnosis": null,
    "createdAt": "2026-09-01T10:00:00.000Z",
    "updatedAt": "2026-09-01T10:00:00.000Z"
  },
  {
    "id": "00000000-0000-0000-0000-000000000128",
    "campaignId": "00000000-0000-0000-0000-000000000010",
    "organizationId": "00000000-0000-0000-0000-000000000001",
    "googlePlaceId": "ChIJ_unidad_m_dica_familiar_tequendama_128",
    "businessName": "Unidad Médica Familiar Tequendama",
    "formattedAddress": "Cra 42 #5C-28, Tequendama, Cali",
    "internationalPhone": "+573173332211",
    "websiteUrl": null,
    "googleRating": 4.2,
    "googleUserRatingsTotal": 48,
    "hasWebsite": false,
    "hasValidSsl": false,
    "hasCustomDomain": false,
    "hasFacebook": true,
    "hasInstagram": true,
    "hasWhatsapp": true,
    "hasTiktok": false,
    "detectedEmails": [
      "medicatequendama@gmail.com"
    ],
    "detectedCms": null,
    "digitalScore": 25,
    "opportunityScore": 93,
    "opportunityTier": "CRITICAL",
    "sector": "CLINICS",
    "digitalNeedScore": 90,
    "serviceFitScore": 85,
    "evidenceConfidenceScore": 85,
    "evidenceCoverage": 0.85,
    "contactVerificationLevel": "VERIFIED_WHATSAPP_LINK",
    "contactChannelsAvailable": [
      "EMAIL",
      "WHATSAPP"
    ],
    "deliveryStatus": "NOT_SENT",
    "status": "QUALIFIED",
    "aiDiagnosis": null,
    "createdAt": "2026-09-01T10:00:00.000Z",
    "updatedAt": "2026-09-01T10:00:00.000Z"
  },
  {
    "id": "00000000-0000-0000-0000-000000000129",
    "campaignId": "00000000-0000-0000-0000-000000000010",
    "organizationId": "00000000-0000-0000-0000-000000000001",
    "googlePlaceId": "ChIJ_cl_nica_dental_sonrisas_reales_129",
    "businessName": "Clínica Dental Sonrisas Reales",
    "formattedAddress": "Cra 27 #48-15, Cabecera, Bucaramanga",
    "internationalPhone": "+573151112233",
    "websiteUrl": "http://sonrisasrealesbga.com",
    "googleRating": 4.5,
    "googleUserRatingsTotal": 98,
    "hasWebsite": true,
    "hasValidSsl": false,
    "hasCustomDomain": true,
    "hasFacebook": true,
    "hasInstagram": true,
    "hasWhatsapp": true,
    "hasTiktok": true,
    "detectedEmails": [
      "citas@sonrisasrealesbga.com"
    ],
    "detectedCms": "WordPress",
    "digitalScore": 35,
    "opportunityScore": 86,
    "opportunityTier": "VERY_HIGH",
    "sector": "CLINICS",
    "digitalNeedScore": 90,
    "serviceFitScore": 85,
    "evidenceConfidenceScore": 85,
    "evidenceCoverage": 0.85,
    "contactVerificationLevel": "VERIFIED_WHATSAPP_LINK",
    "contactChannelsAvailable": [
      "EMAIL",
      "WHATSAPP"
    ],
    "deliveryStatus": "NOT_SENT",
    "status": "QUALIFIED",
    "aiDiagnosis": null,
    "createdAt": "2026-09-01T10:00:00.000Z",
    "updatedAt": "2026-09-01T10:00:00.000Z"
  },
  {
    "id": "00000000-0000-0000-0000-000000000130",
    "campaignId": "00000000-0000-0000-0000-000000000010",
    "organizationId": "00000000-0000-0000-0000-000000000001",
    "googlePlaceId": "ChIJ_fisioterapia___kinesiolog_a_andina_130",
    "businessName": "Fisioterapia & Kinesiología Andina",
    "formattedAddress": "Cl 106 #19-21, Santa Bárbara, Bogotá",
    "internationalPhone": "+573128889900",
    "websiteUrl": "https://fisioterapiaandina.co",
    "googleRating": 4.4,
    "googleUserRatingsTotal": 55,
    "hasWebsite": true,
    "hasValidSsl": true,
    "hasCustomDomain": true,
    "hasFacebook": true,
    "hasInstagram": true,
    "hasWhatsapp": true,
    "hasTiktok": false,
    "detectedEmails": [
      "info@fisioterapiaandina.co"
    ],
    "detectedCms": "WordPress",
    "digitalScore": 55,
    "opportunityScore": 78,
    "opportunityTier": "HIGH",
    "sector": "CLINICS",
    "digitalNeedScore": 75,
    "serviceFitScore": 75,
    "evidenceConfidenceScore": 85,
    "evidenceCoverage": 0.85,
    "contactVerificationLevel": "VERIFIED_WHATSAPP_LINK",
    "contactChannelsAvailable": [
      "EMAIL",
      "WHATSAPP"
    ],
    "deliveryStatus": "NOT_SENT",
    "status": "QUALIFIED",
    "aiDiagnosis": null,
    "createdAt": "2026-09-01T10:00:00.000Z",
    "updatedAt": "2026-09-01T10:00:00.000Z"
  },
  {
    "id": "00000000-0000-0000-0000-000000000131",
    "campaignId": "00000000-0000-0000-0000-000000000010",
    "organizationId": "00000000-0000-0000-0000-000000000001",
    "googlePlaceId": "ChIJ_boutique_moda_elegance_131",
    "businessName": "Boutique Moda Elegance",
    "formattedAddress": "Cra 13 #78-22, Chapinero, Bogotá",
    "internationalPhone": "+573159876543",
    "websiteUrl": "https://modaelegance.wixsite.com/boutique",
    "googleRating": 4.7,
    "googleUserRatingsTotal": 56,
    "hasWebsite": true,
    "hasValidSsl": true,
    "hasCustomDomain": false,
    "hasFacebook": true,
    "hasInstagram": true,
    "hasWhatsapp": true,
    "hasTiktok": false,
    "detectedEmails": [
      "ventas@modaelegance.co"
    ],
    "detectedCms": "Wix",
    "digitalScore": 55,
    "opportunityScore": 75,
    "opportunityTier": "HIGH",
    "sector": "RETAIL",
    "digitalNeedScore": 75,
    "serviceFitScore": 75,
    "evidenceConfidenceScore": 85,
    "evidenceCoverage": 0.85,
    "contactVerificationLevel": "VERIFIED_WHATSAPP_LINK",
    "contactChannelsAvailable": [
      "EMAIL",
      "WHATSAPP"
    ],
    "deliveryStatus": "NOT_SENT",
    "status": "QUALIFIED",
    "aiDiagnosis": null,
    "createdAt": "2026-09-01T10:00:00.000Z",
    "updatedAt": "2026-09-01T10:00:00.000Z"
  },
  {
    "id": "00000000-0000-0000-0000-000000000132",
    "campaignId": "00000000-0000-0000-0000-000000000010",
    "organizationId": "00000000-0000-0000-0000-000000000001",
    "googlePlaceId": "ChIJ_calzado_cuero___estilo_artesanal_132",
    "businessName": "Calzado Cuero & Estilo Artesanal",
    "formattedAddress": "Cl 17 Sur #22-10, Restrepo, Bogotá",
    "internationalPhone": "+573104445566",
    "websiteUrl": null,
    "googleRating": 4.4,
    "googleUserRatingsTotal": 92,
    "hasWebsite": false,
    "hasValidSsl": false,
    "hasCustomDomain": false,
    "hasFacebook": true,
    "hasInstagram": true,
    "hasWhatsapp": true,
    "hasTiktok": true,
    "detectedEmails": [
      "cueroyestilorestrepo@gmail.com"
    ],
    "detectedCms": null,
    "digitalScore": 25,
    "opportunityScore": 91,
    "opportunityTier": "CRITICAL",
    "sector": "RETAIL",
    "digitalNeedScore": 90,
    "serviceFitScore": 85,
    "evidenceConfidenceScore": 85,
    "evidenceCoverage": 0.85,
    "contactVerificationLevel": "VERIFIED_WHATSAPP_LINK",
    "contactChannelsAvailable": [
      "EMAIL",
      "WHATSAPP"
    ],
    "deliveryStatus": "NOT_SENT",
    "status": "QUALIFIED",
    "aiDiagnosis": null,
    "createdAt": "2026-09-01T10:00:00.000Z",
    "updatedAt": "2026-09-01T10:00:00.000Z"
  },
  {
    "id": "00000000-0000-0000-0000-000000000133",
    "campaignId": "00000000-0000-0000-0000-000000000010",
    "organizationId": "00000000-0000-0000-0000-000000000001",
    "googlePlaceId": "ChIJ_joyer_a_esmeraldas_de_colombia_133",
    "businessName": "Joyería Esmeraldas de Colombia",
    "formattedAddress": "Calle San Pedro Claver #31-10, Cartagena",
    "internationalPhone": "+573183332211",
    "websiteUrl": "https://esmeraldascolombia.com",
    "googleRating": 4.9,
    "googleUserRatingsTotal": 175,
    "hasWebsite": true,
    "hasValidSsl": true,
    "hasCustomDomain": true,
    "hasFacebook": true,
    "hasInstagram": true,
    "hasWhatsapp": true,
    "hasTiktok": false,
    "detectedEmails": [
      "ventas@esmeraldascolombia.com"
    ],
    "detectedCms": "Shopify",
    "digitalScore": 55,
    "opportunityScore": 72,
    "opportunityTier": "HIGH",
    "sector": "RETAIL",
    "digitalNeedScore": 75,
    "serviceFitScore": 75,
    "evidenceConfidenceScore": 85,
    "evidenceCoverage": 0.85,
    "contactVerificationLevel": "VERIFIED_WHATSAPP_LINK",
    "contactChannelsAvailable": [
      "EMAIL",
      "WHATSAPP"
    ],
    "deliveryStatus": "NOT_SENT",
    "status": "QUALIFIED",
    "aiDiagnosis": null,
    "createdAt": "2026-09-01T10:00:00.000Z",
    "updatedAt": "2026-09-01T10:00:00.000Z"
  },
  {
    "id": "00000000-0000-0000-0000-000000000134",
    "campaignId": "00000000-0000-0000-0000-000000000010",
    "organizationId": "00000000-0000-0000-0000-000000000001",
    "googlePlaceId": "ChIJ__ptica_visi_n_moderna_134",
    "businessName": "Óptica Visión Moderna",
    "formattedAddress": "Av Nutibara #71-25, Laureles, Medellín",
    "internationalPhone": "+573165554433",
    "websiteUrl": "http://visionmodernamedellin.co",
    "googleRating": 4.5,
    "googleUserRatingsTotal": 78,
    "hasWebsite": true,
    "hasValidSsl": false,
    "hasCustomDomain": true,
    "hasFacebook": true,
    "hasInstagram": true,
    "hasWhatsapp": true,
    "hasTiktok": false,
    "detectedEmails": [
      "citas@visionmodernamedellin.co"
    ],
    "detectedCms": "WordPress",
    "digitalScore": 35,
    "opportunityScore": 84,
    "opportunityTier": "VERY_HIGH",
    "sector": "RETAIL",
    "digitalNeedScore": 75,
    "serviceFitScore": 85,
    "evidenceConfidenceScore": 85,
    "evidenceCoverage": 0.85,
    "contactVerificationLevel": "VERIFIED_WHATSAPP_LINK",
    "contactChannelsAvailable": [
      "EMAIL",
      "WHATSAPP"
    ],
    "deliveryStatus": "NOT_SENT",
    "status": "QUALIFIED",
    "aiDiagnosis": null,
    "createdAt": "2026-09-01T10:00:00.000Z",
    "updatedAt": "2026-09-01T10:00:00.000Z"
  },
  {
    "id": "00000000-0000-0000-0000-000000000135",
    "campaignId": "00000000-0000-0000-0000-000000000010",
    "organizationId": "00000000-0000-0000-0000-000000000001",
    "googlePlaceId": "ChIJ_muebles___dise_o_scandic_135",
    "businessName": "Muebles & Diseño Scandic",
    "formattedAddress": "Cl 109 #17A-30, Santa Paula, Bogotá",
    "internationalPhone": "+573132221100",
    "websiteUrl": "https://mueblesscandic.com.co",
    "googleRating": 4.6,
    "googleUserRatingsTotal": 68,
    "hasWebsite": true,
    "hasValidSsl": true,
    "hasCustomDomain": true,
    "hasFacebook": true,
    "hasInstagram": true,
    "hasWhatsapp": true,
    "hasTiktok": true,
    "detectedEmails": [
      "diseno@mueblesscandic.com.co"
    ],
    "detectedCms": "Shopify",
    "digitalScore": 55,
    "opportunityScore": 79,
    "opportunityTier": "HIGH",
    "sector": "RETAIL",
    "digitalNeedScore": 75,
    "serviceFitScore": 75,
    "evidenceConfidenceScore": 85,
    "evidenceCoverage": 0.85,
    "contactVerificationLevel": "VERIFIED_WHATSAPP_LINK",
    "contactChannelsAvailable": [
      "EMAIL",
      "WHATSAPP"
    ],
    "deliveryStatus": "NOT_SENT",
    "status": "QUALIFIED",
    "aiDiagnosis": null,
    "createdAt": "2026-09-01T10:00:00.000Z",
    "updatedAt": "2026-09-01T10:00:00.000Z"
  },
  {
    "id": "00000000-0000-0000-0000-000000000136",
    "campaignId": "00000000-0000-0000-0000-000000000010",
    "organizationId": "00000000-0000-0000-0000-000000000001",
    "googlePlaceId": "ChIJ_activefit_indumentaria_deportiva_136",
    "businessName": "ActiveFit Indumentaria Deportiva",
    "formattedAddress": "Centro Comercial Santafé Loc 2-14, Bogotá",
    "internationalPhone": "+573017778899",
    "websiteUrl": null,
    "googleRating": 4.3,
    "googleUserRatingsTotal": 52,
    "hasWebsite": false,
    "hasValidSsl": false,
    "hasCustomDomain": false,
    "hasFacebook": true,
    "hasInstagram": true,
    "hasWhatsapp": true,
    "hasTiktok": false,
    "detectedEmails": [
      "activefitcol@gmail.com"
    ],
    "detectedCms": null,
    "digitalScore": 25,
    "opportunityScore": 89,
    "opportunityTier": "VERY_HIGH",
    "sector": "RETAIL",
    "digitalNeedScore": 90,
    "serviceFitScore": 85,
    "evidenceConfidenceScore": 85,
    "evidenceCoverage": 0.85,
    "contactVerificationLevel": "VERIFIED_WHATSAPP_LINK",
    "contactChannelsAvailable": [
      "EMAIL",
      "WHATSAPP"
    ],
    "deliveryStatus": "NOT_SENT",
    "status": "QUALIFIED",
    "aiDiagnosis": null,
    "createdAt": "2026-09-01T10:00:00.000Z",
    "updatedAt": "2026-09-01T10:00:00.000Z"
  },
  {
    "id": "00000000-0000-0000-0000-000000000137",
    "campaignId": "00000000-0000-0000-0000-000000000010",
    "organizationId": "00000000-0000-0000-0000-000000000001",
    "googlePlaceId": "ChIJ_tienda_de_mascotas_guau___miau_137",
    "businessName": "Tienda de Mascotas Guau & Miau",
    "formattedAddress": "Cra 6 #119-15, Usaquén, Bogotá",
    "internationalPhone": "+573204443322",
    "websiteUrl": "https://guauymiauusaquen.wixsite.com/pet",
    "googleRating": 4.7,
    "googleUserRatingsTotal": 145,
    "hasWebsite": true,
    "hasValidSsl": true,
    "hasCustomDomain": false,
    "hasFacebook": true,
    "hasInstagram": true,
    "hasWhatsapp": true,
    "hasTiktok": false,
    "detectedEmails": [
      "contacto@guauymiau.co"
    ],
    "detectedCms": "Wix",
    "digitalScore": 55,
    "opportunityScore": 81,
    "opportunityTier": "HIGH",
    "sector": "RETAIL",
    "digitalNeedScore": 75,
    "serviceFitScore": 85,
    "evidenceConfidenceScore": 85,
    "evidenceCoverage": 0.85,
    "contactVerificationLevel": "VERIFIED_WHATSAPP_LINK",
    "contactChannelsAvailable": [
      "EMAIL",
      "WHATSAPP"
    ],
    "deliveryStatus": "NOT_SENT",
    "status": "QUALIFIED",
    "aiDiagnosis": null,
    "createdAt": "2026-09-01T10:00:00.000Z",
    "updatedAt": "2026-09-01T10:00:00.000Z"
  },
  {
    "id": "00000000-0000-0000-0000-000000000138",
    "campaignId": "00000000-0000-0000-0000-000000000010",
    "organizationId": "00000000-0000-0000-0000-000000000001",
    "googlePlaceId": "ChIJ_perfumer_a_esencias_de_par_s_138",
    "businessName": "Perfumería Esencias de París",
    "formattedAddress": "Cl 10 #37-25, El Poblado, Medellín",
    "internationalPhone": "+573156667788",
    "websiteUrl": "https://esenciasdeparis.com",
    "googleRating": 4.5,
    "googleUserRatingsTotal": 86,
    "hasWebsite": true,
    "hasValidSsl": true,
    "hasCustomDomain": true,
    "hasFacebook": true,
    "hasInstagram": true,
    "hasWhatsapp": true,
    "hasTiktok": true,
    "detectedEmails": [
      "ventas@esenciasdeparis.com"
    ],
    "detectedCms": "WooCommerce",
    "digitalScore": 55,
    "opportunityScore": 76,
    "opportunityTier": "HIGH",
    "sector": "RETAIL",
    "digitalNeedScore": 75,
    "serviceFitScore": 75,
    "evidenceConfidenceScore": 85,
    "evidenceCoverage": 0.85,
    "contactVerificationLevel": "VERIFIED_WHATSAPP_LINK",
    "contactChannelsAvailable": [
      "EMAIL",
      "WHATSAPP"
    ],
    "deliveryStatus": "NOT_SENT",
    "status": "QUALIFIED",
    "aiDiagnosis": null,
    "createdAt": "2026-09-01T10:00:00.000Z",
    "updatedAt": "2026-09-01T10:00:00.000Z"
  },
  {
    "id": "00000000-0000-0000-0000-000000000139",
    "campaignId": "00000000-0000-0000-0000-000000000010",
    "organizationId": "00000000-0000-0000-0000-000000000001",
    "googlePlaceId": "ChIJ_florister_a_rosas___tulipanes_139",
    "businessName": "Floristería Rosas & Tulipanes",
    "formattedAddress": "Cl 72 #10-34, Quinta Camacho, Bogotá",
    "internationalPhone": "+573121110099",
    "websiteUrl": null,
    "googleRating": 4.8,
    "googleUserRatingsTotal": 220,
    "hasWebsite": false,
    "hasValidSsl": false,
    "hasCustomDomain": false,
    "hasFacebook": true,
    "hasInstagram": true,
    "hasWhatsapp": true,
    "hasTiktok": false,
    "detectedEmails": [
      "rosasytulipanesbog@gmail.com"
    ],
    "detectedCms": null,
    "digitalScore": 25,
    "opportunityScore": 87,
    "opportunityTier": "VERY_HIGH",
    "sector": "RETAIL",
    "digitalNeedScore": 90,
    "serviceFitScore": 85,
    "evidenceConfidenceScore": 85,
    "evidenceCoverage": 0.85,
    "contactVerificationLevel": "VERIFIED_WHATSAPP_LINK",
    "contactChannelsAvailable": [
      "EMAIL",
      "WHATSAPP"
    ],
    "deliveryStatus": "NOT_SENT",
    "status": "QUALIFIED",
    "aiDiagnosis": null,
    "createdAt": "2026-09-01T10:00:00.000Z",
    "updatedAt": "2026-09-01T10:00:00.000Z"
  },
  {
    "id": "00000000-0000-0000-0000-000000000140",
    "campaignId": "00000000-0000-0000-0000-000000000010",
    "organizationId": "00000000-0000-0000-0000-000000000001",
    "googlePlaceId": "ChIJ_instrumentos_musicales_tempo_140",
    "businessName": "Instrumentos Musicales Tempo",
    "formattedAddress": "Cra 7 #58-30, Chapinero, Bogotá",
    "internationalPhone": "+573003334455",
    "websiteUrl": "http://instrumentostempo.com",
    "googleRating": 4.4,
    "googleUserRatingsTotal": 72,
    "hasWebsite": true,
    "hasValidSsl": false,
    "hasCustomDomain": true,
    "hasFacebook": true,
    "hasInstagram": true,
    "hasWhatsapp": true,
    "hasTiktok": false,
    "detectedEmails": [
      "ventas@instrumentostempo.com"
    ],
    "detectedCms": "Custom",
    "digitalScore": 35,
    "opportunityScore": 85,
    "opportunityTier": "VERY_HIGH",
    "sector": "RETAIL",
    "digitalNeedScore": 75,
    "serviceFitScore": 85,
    "evidenceConfidenceScore": 85,
    "evidenceCoverage": 0.85,
    "contactVerificationLevel": "VERIFIED_WHATSAPP_LINK",
    "contactChannelsAvailable": [
      "EMAIL",
      "WHATSAPP"
    ],
    "deliveryStatus": "NOT_SENT",
    "status": "QUALIFIED",
    "aiDiagnosis": null,
    "createdAt": "2026-09-01T10:00:00.000Z",
    "updatedAt": "2026-09-01T10:00:00.000Z"
  },
  {
    "id": "00000000-0000-0000-0000-000000000141",
    "campaignId": "00000000-0000-0000-0000-000000000010",
    "organizationId": "00000000-0000-0000-0000-000000000001",
    "googlePlaceId": "ChIJ_consultores_financieros___tributarios_del_norte_141",
    "businessName": "Consultores Financieros & Tributarios del Norte",
    "formattedAddress": "Cra 7 #71-21 Torre A, Chicó, Bogotá",
    "internationalPhone": "+573109998877",
    "websiteUrl": null,
    "googleRating": 4.5,
    "googleUserRatingsTotal": 44,
    "hasWebsite": false,
    "hasValidSsl": false,
    "hasCustomDomain": false,
    "hasFacebook": true,
    "hasInstagram": true,
    "hasWhatsapp": true,
    "hasTiktok": true,
    "detectedEmails": [
      "info@cftdelnorte.com.co"
    ],
    "detectedCms": null,
    "digitalScore": 25,
    "opportunityScore": 88,
    "opportunityTier": "VERY_HIGH",
    "sector": "GENERAL",
    "digitalNeedScore": 90,
    "serviceFitScore": 85,
    "evidenceConfidenceScore": 85,
    "evidenceCoverage": 0.85,
    "contactVerificationLevel": "VERIFIED_WHATSAPP_LINK",
    "contactChannelsAvailable": [
      "EMAIL",
      "WHATSAPP"
    ],
    "deliveryStatus": "NOT_SENT",
    "status": "QUALIFIED",
    "aiDiagnosis": null,
    "createdAt": "2026-09-01T10:00:00.000Z",
    "updatedAt": "2026-09-01T10:00:00.000Z"
  },
  {
    "id": "00000000-0000-0000-0000-000000000142",
    "campaignId": "00000000-0000-0000-0000-000000000010",
    "organizationId": "00000000-0000-0000-0000-000000000001",
    "googlePlaceId": "ChIJ_taller_mec_nico_el_progreso_142",
    "businessName": "Taller Mecánico El Progreso",
    "formattedAddress": "Av 1 de Mayo #24-10, Bogotá",
    "internationalPhone": "+573152223344",
    "websiteUrl": "https://tallerelprogreso.com",
    "googleRating": 3.9,
    "googleUserRatingsTotal": 22,
    "hasWebsite": true,
    "hasValidSsl": true,
    "hasCustomDomain": true,
    "hasFacebook": true,
    "hasInstagram": true,
    "hasWhatsapp": true,
    "hasTiktok": false,
    "detectedEmails": [
      "servicio@tallerelprogreso.com"
    ],
    "detectedCms": "Custom",
    "digitalScore": 55,
    "opportunityScore": 82,
    "opportunityTier": "HIGH",
    "sector": "GENERAL",
    "digitalNeedScore": 75,
    "serviceFitScore": 85,
    "evidenceConfidenceScore": 85,
    "evidenceCoverage": 0.85,
    "contactVerificationLevel": "VERIFIED_WHATSAPP_LINK",
    "contactChannelsAvailable": [
      "EMAIL",
      "WHATSAPP"
    ],
    "deliveryStatus": "NOT_SENT",
    "status": "QUALIFIED",
    "aiDiagnosis": null,
    "createdAt": "2026-09-01T10:00:00.000Z",
    "updatedAt": "2026-09-01T10:00:00.000Z"
  },
  {
    "id": "00000000-0000-0000-0000-000000000143",
    "campaignId": "00000000-0000-0000-0000-000000000010",
    "organizationId": "00000000-0000-0000-0000-000000000001",
    "googlePlaceId": "ChIJ_bufete_de_abogados_morales___asociados_143",
    "businessName": "Bufete de Abogados Morales & Asociados",
    "formattedAddress": "Cl 14 #43B-112, El Poblado, Medellín",
    "internationalPhone": "+573184445566",
    "websiteUrl": "http://moralesabogadosmed.com",
    "googleRating": 4.6,
    "googleUserRatingsTotal": 58,
    "hasWebsite": true,
    "hasValidSsl": false,
    "hasCustomDomain": true,
    "hasFacebook": true,
    "hasInstagram": true,
    "hasWhatsapp": true,
    "hasTiktok": false,
    "detectedEmails": [
      "contacto@moralesabogadosmed.com"
    ],
    "detectedCms": "WordPress",
    "digitalScore": 35,
    "opportunityScore": 83,
    "opportunityTier": "VERY_HIGH",
    "sector": "GENERAL",
    "digitalNeedScore": 75,
    "serviceFitScore": 85,
    "evidenceConfidenceScore": 85,
    "evidenceCoverage": 0.85,
    "contactVerificationLevel": "VERIFIED_WHATSAPP_LINK",
    "contactChannelsAvailable": [
      "EMAIL",
      "WHATSAPP"
    ],
    "deliveryStatus": "NOT_SENT",
    "status": "QUALIFIED",
    "aiDiagnosis": null,
    "createdAt": "2026-09-01T10:00:00.000Z",
    "updatedAt": "2026-09-01T10:00:00.000Z"
  },
  {
    "id": "00000000-0000-0000-0000-000000000144",
    "campaignId": "00000000-0000-0000-0000-000000000010",
    "organizationId": "00000000-0000-0000-0000-000000000001",
    "googlePlaceId": "ChIJ_agencia_de_carga___log_stica_andina_144",
    "businessName": "Agencia de Carga & Logística Andina",
    "formattedAddress": "Cra 100 #24C-55, Fontibón, Bogotá",
    "internationalPhone": "+573161112233",
    "websiteUrl": null,
    "googleRating": 4.3,
    "googleUserRatingsTotal": 39,
    "hasWebsite": false,
    "hasValidSsl": false,
    "hasCustomDomain": false,
    "hasFacebook": true,
    "hasInstagram": true,
    "hasWhatsapp": true,
    "hasTiktok": true,
    "detectedEmails": [
      "operaciones@logisticaandina.co"
    ],
    "detectedCms": null,
    "digitalScore": 25,
    "opportunityScore": 90,
    "opportunityTier": "CRITICAL",
    "sector": "GENERAL",
    "digitalNeedScore": 90,
    "serviceFitScore": 85,
    "evidenceConfidenceScore": 85,
    "evidenceCoverage": 0.85,
    "contactVerificationLevel": "VERIFIED_WHATSAPP_LINK",
    "contactChannelsAvailable": [
      "EMAIL",
      "WHATSAPP"
    ],
    "deliveryStatus": "NOT_SENT",
    "status": "QUALIFIED",
    "aiDiagnosis": null,
    "createdAt": "2026-09-01T10:00:00.000Z",
    "updatedAt": "2026-09-01T10:00:00.000Z"
  },
  {
    "id": "00000000-0000-0000-0000-000000000145",
    "campaignId": "00000000-0000-0000-0000-000000000010",
    "organizationId": "00000000-0000-0000-0000-000000000001",
    "googlePlaceId": "ChIJ_constructora___arquitectura_espacios_145",
    "businessName": "Constructora & Arquitectura Espacios",
    "formattedAddress": "Av 4N #23N-40, Versalles, Cali",
    "internationalPhone": "+573137778899",
    "websiteUrl": "https://espaciosarquitectura.com.co",
    "googleRating": 4.7,
    "googleUserRatingsTotal": 64,
    "hasWebsite": true,
    "hasValidSsl": true,
    "hasCustomDomain": true,
    "hasFacebook": true,
    "hasInstagram": true,
    "hasWhatsapp": true,
    "hasTiktok": false,
    "detectedEmails": [
      "proyectos@espaciosarquitectura.com.co"
    ],
    "detectedCms": "WordPress",
    "digitalScore": 55,
    "opportunityScore": 77,
    "opportunityTier": "HIGH",
    "sector": "GENERAL",
    "digitalNeedScore": 75,
    "serviceFitScore": 75,
    "evidenceConfidenceScore": 85,
    "evidenceCoverage": 0.85,
    "contactVerificationLevel": "VERIFIED_WHATSAPP_LINK",
    "contactChannelsAvailable": [
      "EMAIL",
      "WHATSAPP"
    ],
    "deliveryStatus": "NOT_SENT",
    "status": "QUALIFIED",
    "aiDiagnosis": null,
    "createdAt": "2026-09-01T10:00:00.000Z",
    "updatedAt": "2026-09-01T10:00:00.000Z"
  },
  {
    "id": "00000000-0000-0000-0000-000000000146",
    "campaignId": "00000000-0000-0000-0000-000000000010",
    "organizationId": "00000000-0000-0000-0000-000000000001",
    "googlePlaceId": "ChIJ_distribuidora_el_ctrica_del_caribe_146",
    "businessName": "Distribuidora Eléctrica del Caribe",
    "formattedAddress": "Vía 40 #73-110, Barranquilla",
    "internationalPhone": "+573014445566",
    "websiteUrl": null,
    "googleRating": 4.2,
    "googleUserRatingsTotal": 31,
    "hasWebsite": false,
    "hasValidSsl": false,
    "hasCustomDomain": false,
    "hasFacebook": true,
    "hasInstagram": true,
    "hasWhatsapp": true,
    "hasTiktok": false,
    "detectedEmails": [
      "ventas@electricadelcaribe.com"
    ],
    "detectedCms": null,
    "digitalScore": 25,
    "opportunityScore": 89,
    "opportunityTier": "VERY_HIGH",
    "sector": "GENERAL",
    "digitalNeedScore": 90,
    "serviceFitScore": 85,
    "evidenceConfidenceScore": 85,
    "evidenceCoverage": 0.85,
    "contactVerificationLevel": "VERIFIED_WHATSAPP_LINK",
    "contactChannelsAvailable": [
      "EMAIL",
      "WHATSAPP"
    ],
    "deliveryStatus": "NOT_SENT",
    "status": "QUALIFIED",
    "aiDiagnosis": null,
    "createdAt": "2026-09-01T10:00:00.000Z",
    "updatedAt": "2026-09-01T10:00:00.000Z"
  },
  {
    "id": "00000000-0000-0000-0000-000000000147",
    "campaignId": "00000000-0000-0000-0000-000000000010",
    "organizationId": "00000000-0000-0000-0000-000000000001",
    "googlePlaceId": "ChIJ_inmobiliaria_h_bitat___confort_147",
    "businessName": "Inmobiliaria Hábitat & Confort",
    "formattedAddress": "Cl 90 #14-26, Chicó, Bogotá",
    "internationalPhone": "+573218889900",
    "websiteUrl": "https://habitayconfort.wixsite.com/inmo",
    "googleRating": 4.4,
    "googleUserRatingsTotal": 51,
    "hasWebsite": true,
    "hasValidSsl": true,
    "hasCustomDomain": false,
    "hasFacebook": true,
    "hasInstagram": true,
    "hasWhatsapp": true,
    "hasTiktok": true,
    "detectedEmails": [
      "ventas@habitatyconfort.co"
    ],
    "detectedCms": "Wix",
    "digitalScore": 55,
    "opportunityScore": 84,
    "opportunityTier": "VERY_HIGH",
    "sector": "GENERAL",
    "digitalNeedScore": 75,
    "serviceFitScore": 85,
    "evidenceConfidenceScore": 85,
    "evidenceCoverage": 0.85,
    "contactVerificationLevel": "VERIFIED_WHATSAPP_LINK",
    "contactChannelsAvailable": [
      "EMAIL",
      "WHATSAPP"
    ],
    "deliveryStatus": "NOT_SENT",
    "status": "QUALIFIED",
    "aiDiagnosis": null,
    "createdAt": "2026-09-01T10:00:00.000Z",
    "updatedAt": "2026-09-01T10:00:00.000Z"
  },
  {
    "id": "00000000-0000-0000-0000-000000000148",
    "campaignId": "00000000-0000-0000-0000-000000000010",
    "organizationId": "00000000-0000-0000-0000-000000000001",
    "googlePlaceId": "ChIJ_seguridad_privada___monitoreo__guila_148",
    "businessName": "Seguridad Privada & Monitoreo Águila",
    "formattedAddress": "Cl 33A #14-18, Teusaquillo, Bogotá",
    "internationalPhone": "+573146667788",
    "websiteUrl": "http://seguridadaguila.com.co",
    "googleRating": 4.1,
    "googleUserRatingsTotal": 28,
    "hasWebsite": true,
    "hasValidSsl": false,
    "hasCustomDomain": true,
    "hasFacebook": true,
    "hasInstagram": true,
    "hasWhatsapp": true,
    "hasTiktok": false,
    "detectedEmails": [
      "contacto@seguridadaguila.com.co"
    ],
    "detectedCms": "Joomla",
    "digitalScore": 35,
    "opportunityScore": 86,
    "opportunityTier": "VERY_HIGH",
    "sector": "GENERAL",
    "digitalNeedScore": 90,
    "serviceFitScore": 85,
    "evidenceConfidenceScore": 85,
    "evidenceCoverage": 0.85,
    "contactVerificationLevel": "VERIFIED_WHATSAPP_LINK",
    "contactChannelsAvailable": [
      "EMAIL",
      "WHATSAPP"
    ],
    "deliveryStatus": "NOT_SENT",
    "status": "QUALIFIED",
    "aiDiagnosis": null,
    "createdAt": "2026-09-01T10:00:00.000Z",
    "updatedAt": "2026-09-01T10:00:00.000Z"
  },
  {
    "id": "00000000-0000-0000-0000-000000000149",
    "campaignId": "00000000-0000-0000-0000-000000000010",
    "organizationId": "00000000-0000-0000-0000-000000000001",
    "googlePlaceId": "ChIJ_academia_de_idiomas_lingua_viva_149",
    "businessName": "Academia de Idiomas Lingua Viva",
    "formattedAddress": "Cra 15 #76-35, Lago, Bogotá",
    "internationalPhone": "+573172223344",
    "websiteUrl": "https://linguaviva.co",
    "googleRating": 4.8,
    "googleUserRatingsTotal": 185,
    "hasWebsite": true,
    "hasValidSsl": true,
    "hasCustomDomain": true,
    "hasFacebook": true,
    "hasInstagram": true,
    "hasWhatsapp": true,
    "hasTiktok": false,
    "detectedEmails": [
      "admisiones@linguaviva.co"
    ],
    "detectedCms": "WordPress",
    "digitalScore": 55,
    "opportunityScore": 74,
    "opportunityTier": "HIGH",
    "sector": "GENERAL",
    "digitalNeedScore": 75,
    "serviceFitScore": 75,
    "evidenceConfidenceScore": 85,
    "evidenceCoverage": 0.85,
    "contactVerificationLevel": "VERIFIED_WHATSAPP_LINK",
    "contactChannelsAvailable": [
      "EMAIL",
      "WHATSAPP"
    ],
    "deliveryStatus": "NOT_SENT",
    "status": "QUALIFIED",
    "aiDiagnosis": null,
    "createdAt": "2026-09-01T10:00:00.000Z",
    "updatedAt": "2026-09-01T10:00:00.000Z"
  },
  {
    "id": "00000000-0000-0000-0000-000000000150",
    "campaignId": "00000000-0000-0000-0000-000000000010",
    "organizationId": "00000000-0000-0000-0000-000000000001",
    "googlePlaceId": "ChIJ_laboratorio_fotogr_fico___impresi_n_pixel_150",
    "businessName": "Laboratorio Fotográfico & Impresión Pixel",
    "formattedAddress": "Cl 53 #16-20, Galerías, Bogotá",
    "internationalPhone": "+573129990011",
    "websiteUrl": null,
    "googleRating": 4.5,
    "googleUserRatingsTotal": 76,
    "hasWebsite": false,
    "hasValidSsl": false,
    "hasCustomDomain": false,
    "hasFacebook": true,
    "hasInstagram": true,
    "hasWhatsapp": true,
    "hasTiktok": true,
    "detectedEmails": [
      "impresionpixel@gmail.com"
    ],
    "detectedCms": null,
    "digitalScore": 25,
    "opportunityScore": 87,
    "opportunityTier": "VERY_HIGH",
    "sector": "GENERAL",
    "digitalNeedScore": 90,
    "serviceFitScore": 85,
    "evidenceConfidenceScore": 85,
    "evidenceCoverage": 0.85,
    "contactVerificationLevel": "VERIFIED_WHATSAPP_LINK",
    "contactChannelsAvailable": [
      "EMAIL",
      "WHATSAPP"
    ],
    "deliveryStatus": "NOT_SENT",
    "status": "QUALIFIED",
    "aiDiagnosis": null,
    "createdAt": "2026-09-01T10:00:00.000Z",
    "updatedAt": "2026-09-01T10:00:00.000Z"
  }
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
          if (Array.isArray(parsed) && parsed.length >= 50) {
            this.leads = parsed;
          } else {
            this.leads = [...INITIAL_LEADS];
            this.save();
          }
        } else {
          this.leads = [...INITIAL_LEADS];
          this.save();
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
    const placesFound = 50;
    const newCamp: SearchCampaign = {
      id,
      organizationId: "00000000-0000-0000-0000-000000000001",
      queryTerm: data.queryTerm,
      location: data.location,
      radiusMeters: data.radiusMeters || 10000,
      totalFound: placesFound,
      status: "COMPLETED",
      createdAt: new Date(),
    };
    this.campaigns.unshift(newCamp);

    // Generate 50 realistic leads for this new campaign
    const newLeads: ExtendedLead[] = INITIAL_LEADS.map((base, idx) => {
      const locCity = data.location.split(',')[0].trim();
      return {
        ...base,
        id: `lead_${id}_${idx + 1}`,
        campaignId: id,
        formattedAddress: base.formattedAddress ? base.formattedAddress.replace(/Bogotá|Medellín|Cali|Cartagena|Santa Marta/g, locCity) : base.formattedAddress,
        createdAt: new Date(),
        updatedAt: new Date(),
        deliveryStatus: "NOT_SENT",
        status: LeadStatus.QUALIFIED,
      };
    });

    this.leads = [...newLeads, ...this.leads];
    this.save();
    return { ...newCamp, placesFound };
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
        body: `Estimado equipo directivo de ${lead.businessName},\n\nRevisamos su presencia comercial en Bogotá y destacamos su calificación de ${lead.googleRating?.toFixed(1) || "4.5"}★ en Google Maps.\n\nEn VERTEX diseñamos soluciones digitales para aumentar sus consultas directas.\n\nSi están interesados en modernizar estos aspectos y evaluar la propuesta técnica, respondan directamente para agendar una reunión formal con nuestro equipo.\n\nAtentamente,\nRay Mendoza | VERTEX`,
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
        website: "https://vertexcorp.com.co/es",
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
        website: "https://vertexcorp.com.co/es",
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
        readiness: email ? "READY" : "MISSING_DESTINATION",
        verificationLevel: email ? "EXTRACTED_EMAIL" : "UNVERIFIED_PHONE",
        readinessMessage: email ? "Canal Oficial Resend Activo (mail.vertexcorp.com.co)" : "Sin correo detectado",
      },
      whatsapp: {
        channel: "WHATSAPP",
        destination: phone,
        isAvailable: Boolean(phone),
        readiness: phone ? "READY" : "MISSING_DESTINATION",
        verificationLevel: lead.hasWhatsapp ? "VERIFIED_WHATSAPP_LINK" : "UNVERIFIED_PHONE",
        readinessMessage: phone ? "Canal Oficial Meta Cloud API (Número Corporativo VERTEX)" : "Sin teléfono detectado",
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
      emailSubject = `${lead.businessName}: Auditoría digital, reservas directas y posicionamiento web`;
      emailBody = `Estimado equipo directivo de ${lead.businessName},

Realizamos una auditoría exhaustiva sobre la presencia digital y canales comerciales de su hotel, identificando hallazgos prioritarios para su captación de huéspedes:

1. FALENCIAS DETECTADAS EN LA AUDITORÍA:
• Ausencia de Motor de Reservas Directo: Sus potenciales clientes no cuentan con un sistema de reserva directa en su página web, obligándolos a recurrir a plataformas intermediarias (OTAs) que cobran entre un 15% y 25% de comisión por cada habitación.
• Rendimiento y Experiencia Móvil: La navegación en teléfonos inteligentes presenta lentitud en la carga de fotografías y formularios no optimizados.
• Desvinculación de Canales Sociales: Sus perfiles comerciales en Instagram y Google Maps no cuentan con enlaces directos sincronizados para reservas inmediatas ni atención automatizada.

2. RECOMENDACIONES Y SOLUCIONES VERTEX:
• Implementación de Motor de Reservas Directas sin comisiones por transacción, con pasarela de pagos integrada y confirmación automática vía email/WhatsApp.
• Optimización y Modernización de Portal Web: Carga ultrarrápida (menos de 2 segundos) y diseño UX responsivo adaptado a viajeros internacionales.
• Integración de Canal de Conversión WhatsApp Business sincronizado con su disponibilidad en tiempo real.

Si están interesados en implementar estas mejoras y optimizar el margen de rentabilidad de sus reservas, les invitamos a comunicarse respondiendo directamente a este correo para agendar una reunión donde les presentaremos la propuesta técnica y económica detallada.

Para conocer más sobre nuestra empresa, trayectoria y explorar nuestro portafolio de servicios y casos de éxito, los invitamos a visitar nuestro sitio web oficial:
👉 https://vertexcorp.com.co/es

Atentamente,
Ray Mendoza
Director de Desarrollo | VERTEX Innovation & Consulting
gerenciavertexsas@gmail.com | +57 300 865 8910
Sitio Web Oficial: https://vertexcorp.com.co/es`;

      whatsappBody = `¡Hola equipo directivo de ${lead.businessName}! 🏨

Somos *VERTEX Innovation & Consulting*, firma especializada en modernización tecnológica, desarrollo web de alto rendimiento y automatización de canales comerciales para el sector hotelero y turístico en Colombia.

Estuvimos realizando una auditoría técnica preliminar sobre los canales digitales y sistemas de reserva de ${lead.businessName}, identificando hallazgos prioritarios para optimizar sus ingresos:

1. FALENCIAS DETECTADAS EN LA AUDITORÍA:
• Ausencia de Motor de Reservas Directas: Sus potenciales huéspedes dependen de plataformas intermediarias (OTAs) que cobran entre el 15% y 25% de comisión por cada reserva.
• Experiencia y Rendimiento Móvil: La navegación en smartphones presenta lentitud en la carga de fotografías y carece de confirmación instantánea.
• Desvinculación de Canales Sociales: Sus perfiles en Instagram y Google Maps no cuentan con enlaces inteligentes sincronizados para reservar directamente por WhatsApp.

2. SOLUCIONES RECOMENDADAS VERTEX:
• Motor de Reservas Directas sin comisiones por transacción, integrado a su web con pasarela de pagos nacional e internacional.
• Plataforma Web Ultrarrápida (carga en menos de 2 segundos) y diseño de alta conversión adaptado a viajeros y huéspedes.
• Canal de WhatsApp Business automatizado con consulta de disponibilidad y atención comercial inmediata 24/7.

Si están interesados en eliminar comisiones de intermediarios y modernizar estos aspectos, pueden responder directamente a este mensaje para agendar una reunión o presentación formal con nuestro equipo técnico.

💡 Si tienen alguna duda o desean conocer más sobre nuestro trabajo y portafolio de servicios, pueden consultar nuestro sitio web oficial:
👉 https://vertexcorp.com.co/es

Atentamente,
*Ray Mendoza* | Director de Desarrollo
VERTEX Innovation & Consulting
📱 +57 300 865 8910 | ✉️ gerenciavertexsas@gmail.com
🌐 https://vertexcorp.com.co/es`;

    } else if (lead.sector === "RESTAURANTS") {
      emailSubject = `${lead.businessName}: Diagnóstico de presencia digital, menú interactivo y pedidos`;
      emailBody = `Estimado equipo administrativo de ${lead.businessName},

Llevamos a cabo un análisis técnico y comercial sobre la presencia online de su restaurante, destacando su excelente reputación gastronómica (${lead.googleRating?.toFixed(1) || "4.6"}★ en Google Maps) y detectando áreas clave de mejora:

1. FALENCIAS IDENTIFICADAS EN LA AUDITORÍA:
• Falta de Menú Digital Interactivo: Actualmente no disponen de una carta digital estructurada para smartphones con categorías visuales, lo que dificulta la toma de decisiones del comensal.
• Desconexión de Redes Sociales con Ventas: Su perfil de Instagram y Google Maps no canaliza los pedidos directamente hacia una línea de atención comercial organizada.
• Atención Lenta en Horas Pico: La recepción manual de pedidos genera demoras y saturación del personal en momentos de alta demanda.

2. RECOMENDACIONES Y SOLUCIONES VERTEX:
• Creación de Menú Digital Interactivo de carga instantánea con carrito de selección y botón de envío directo a WhatsApp con el pedido estructurado.
• Vinculación de Redes Sociales: Configuración de enlaces inteligentes en Instagram, Facebook y Google Business para captar comensales en su zona.
• Sistema de Reservas de Mesas Automatizado para fines de semana y eventos corporativos.

Si están interesados en modernizar su canal de pedidos y agilizar la atención de sus comensales, pueden comunicarse respondiendo directamente a este correo para agendar una sesión de trabajo y presentarles la solución personalizada.

Para conocer más sobre nuestra empresa, trayectoria y explorar nuestro portafolio de servicios y casos de éxito, los invitamos a visitar nuestro sitio web oficial:
👉 https://vertexcorp.com.co/es

Cordialmente,
Ray Mendoza
Director de Desarrollo | VERTEX Innovation & Consulting
gerenciavertexsas@gmail.com | +57 300 865 8910
Sitio Web Oficial: https://vertexcorp.com.co/es`;

      whatsappBody = `¡Hola equipo de ${lead.businessName}! 🍽️

Somos *VERTEX Innovation & Consulting*, empresa colombiana especializada en desarrollo de software, menús digitales interactivos y automatización de pedidos para el sector gastronómico.

Analizamos su presencia digital y destacamos su excelente reputación en Google Maps (${lead.googleRating?.toFixed(1) || "4.6"}★). Sin embargo, detectamos aspectos determinantes que están frenando la rentabilidad de sus pedidos:

1. FALENCIAS DETECTADAS EN LA AUDITORÍA:
• Falta de Menú Digital Interactivo: No cuentan con una carta digital optimizada para smartphones con fotos de alta resolución y selección ágil de platos.
• Desconexión de Redes Sociales con Ventas: Su perfil de Instagram y ficha de Google no canalizan los pedidos hacia una línea comercial estructurada.
• Fuga de Clientes en Horas Pico: La toma manual de pedidos genera demoras, saturación y pérdida de pedidos por tiempos de respuesta.

2. SOLUCIONES RECOMENDADAS VERTEX:
• Menú Digital Interactivo de Carga Instantánea con carrito y botón que despacha el pedido organizado directamente a su WhatsApp.
• Conexión Inteligente de Redes Sociales (Instagram, TikTok y Google Maps) hacia su canal directo de pedidos sin pagar comisiones a plataformas externas.
• Módulo de Reservas de Mesas Automatizado para fines de semana y fechas especiales.

Si desean modernizar el canal de pedidos de su restaurante y atender a sus comensales sin intermediarios, pueden responder a este mensaje para agendar una reunión y presentarles la demostración interactiva.

💡 Si tienen alguna duda o desean conocer más sobre nuestro trabajo y portafolio de servicios, pueden consultar nuestro sitio web oficial:
👉 https://vertexcorp.com.co/es

Cordialmente,
*Ray Mendoza* | Director de Desarrollo
VERTEX Innovation & Consulting
📱 +57 300 865 8910 | ✉️ gerenciavertexsas@gmail.com
🌐 https://vertexcorp.com.co/es`;

    } else if (lead.sector === "CLINICS") {
      emailSubject = `${lead.businessName}: Auditoría de seguridad web SSL y sistema de citas médicas`;
      emailBody = `Estimado equipo directivo de ${lead.businessName},

Realizamos una auditoría de infraestructura digital y seguridad sobre los canales de atención de su centro clínico, identificando aspectos prioritarios para la confianza de sus pacientes:

1. FALENCIAS DETECTADAS EN LA AUDITORÍA:
• Advertencia de Certificado SSL: Su portal web muestra alertas de conexión no cifrada en navegadores, lo cual desincentiva a los pacientes a registrar datos de contacto sensibles.
• Falta de Agendamiento Online 24/7: No cuentan con un sistema interactivo para selección de especialidades y turnos médicos fuera del horario de oficina.
• Desvinculación de Canales de Atención: No se evidencia botón directo para orientación de urgencias o consultas rápidas hacia WhatsApp institucional.

2. RECOMENDACIONES Y SOLUCIONES VERTEX:
• Blindaje de Seguridad y Certificación SSL/HTTPS integral de grado empresarial para proteger la privacidad de los pacientes.
• Sistema de Agendamiento de Citas Automatizado con confirmaciones y recordatorios por email/WhatsApp para reducir el ausentismo de pacientes.
• Modernización de Portal Institucional con directorio de profesionales médicos y canal de orientación inmediata.

Si están interesados en fortalecer la seguridad de su plataforma y automatizar la gestión de citas de su clínica, pueden comunicarse respondiendo a este mensaje para agendar una reunión técnica y revisar el plan de implementación.

Para conocer más sobre nuestra empresa, trayectoria y explorar nuestro portafolio de servicios y casos de éxito, los invitamos a visitar nuestro sitio web oficial:
👉 https://vertexcorp.com.co/es

Atentamente,
Ray Mendoza
Director de Desarrollo | VERTEX Innovation & Consulting
gerenciavertexsas@gmail.com | +57 300 865 8910
Sitio Web Oficial: https://vertexcorp.com.co/es`;

      whatsappBody = `¡Hola equipo directivo de ${lead.businessName}! 🏥

Somos *VERTEX Innovation & Consulting*, firma de tecnología especializada en modernización web, seguridad digital y automatización de agendas para el sector salud y clínicas especializadas.

Llevamos a cabo una auditoría sobre la infraestructura digital y canales de atención a pacientes de ${lead.businessName}, encontrando oportunidades determinantes para su servicio:

1. FALENCIAS DETECTADAS EN LA AUDITORÍA:
• Alerta de Seguridad SSL en Navegadores: El portal web no cuenta con certificado SSL robusto, mostrando advertencias de "Sitio no seguro" que generan desconfianza al ingresar datos personales.
• Ausencia de Sistema de Citas Online 24/7: Los pacientes no pueden consultar disponibilidad de especialistas ni agendar citas fuera del horario de recepción telefónica.
• Desconexión en Canales de Urgencias/Orientación: Falta de botón estructurado hacia WhatsApp para orientación rápida o confirmación de consultas.

2. SOLUCIONES RECOMENDADAS VERTEX:
• Blindaje de Seguridad y Certificado SSL/HTTPS de grado empresarial para proteger la privacidad de sus pacientes y cumplir normativas.
• Agendador Digital de Citas Médicas 24/7 con recordatorios automatizados por WhatsApp para reducir el ausentismo y cancelaciones.
• Portal Web Institucional Moderno con directorio médico por especialidad y canal prioritario de orientación.

Si tienen interés en fortalecer la seguridad de su plataforma y sistematizar la asignación de citas, les invitamos a responder a este mensaje para coordinar una reunión formal de presentación técnica.

💡 Si tienen alguna duda o desean conocer más sobre nuestro trabajo y portafolio de servicios, pueden consultar nuestro sitio web oficial:
👉 https://vertexcorp.com.co/es

Atentamente,
*Ray Mendoza* | Director de Desarrollo
VERTEX Innovation & Consulting
📱 +57 300 865 8910 | ✉️ gerenciavertexsas@gmail.com
🌐 https://vertexcorp.com.co/es`;

    } else if (lead.sector === "RETAIL") {
      emailSubject = `${lead.businessName}: Auditoría de navegación móvil, catálogo y conversión`;
      emailBody = `Estimado equipo comercial de ${lead.businessName},

Revisamos detalladamente su presencia digital, catálogo de productos y perfiles comerciales, identificando oportunidades determinantes para acelerar sus ventas:

1. FALENCIAS IDENTIFICADAS EN LA AUDITORÍA:
• Errores de Navegación en Dispositivos Móviles: La plataforma actual presenta problemas de visualización en smartphones (elementos desalineados y tiempos de carga elevados que generan abandono de compra).
• Ausencia de Catálogo Interactivo Actualizado: Sus clientes no pueden consultar disponibilidad, tallas o precios en tiempo real sin salir de la página.
• Poca Tracción desde Redes Sociales: No cuentan con integración fluida entre sus publicaciones de Instagram/TikTok y un canal de cierre comercial por WhatsApp.

2. RECOMENDACIONES Y SOLUCIONES VERTEX:
• Rediseño y Desarrollo de Catálogo Digital Ultrarrápido optimizado 100% para compras desde teléfonos celulares.
• Botón de Compra Directa a WhatsApp: El cliente elige el producto y envía la orden lista para pago y despacho en un solo clic.
• Conexión Estratégica de Redes Sociales: Configuración de catálogo en Instagram Shopping y Google Mi Negocio.

Si están interesados en corregir estas limitaciones de navegación y potenciar sus ventas digitales, pueden comunicarse respondiendo directamente a este correo para agendar una reunión donde les mostraremos el prototipo recomendado.

Para conocer más sobre nuestra empresa, trayectoria y explorar nuestro portafolio de servicios y casos de éxito, los invitamos a visitar nuestro sitio web oficial:
👉 https://vertexcorp.com.co/es

Saludos cordiales,
Ray Mendoza
Director de Desarrollo | VERTEX Innovation & Consulting
gerenciavertexsas@gmail.com | +57 300 865 8910
Sitio Web Oficial: https://vertexcorp.com.co/es`;

      whatsappBody = `¡Hola equipo comercial de ${lead.businessName}! 🛍️

Somos *VERTEX Innovation & Consulting*, empresa colombiana especializada en comercio electrónico, desarrollo web de alto rendimiento y automatización de ventas para marcas y boutiques de retail.

Realizamos un análisis técnico y comercial detallado sobre su presencia digital, catálogo de productos y canales de atención (${lead.websiteUrl || "sus canales online"}), detectando áreas clave de optimización:

1. FALENCIAS DETECTADAS EN LA AUDITORÍA:
• Dificultades de Navegación en Teléfonos Móviles: La plataforma actual (desarrollada en subdominio/plantilla no optimizada) presenta lentitud en la carga de colecciones y elementos desalineados en smartphones, provocando abandono de compra.
• Ausencia de Catálogo Digital Interactivo: Los clientes no pueden explorar colecciones organizadas por categorías, tallas o disponibilidad en tiempo real.
• Desconexión entre Redes Sociales y Cierre Comercial: Su presencia en Instagram/Facebook no cuenta con enlaces directos para comprar de forma inmediata vía WhatsApp.

2. SOLUCIONES RECOMENDADAS VERTEX:
• Desarrollo de Catálogo Digital Ultrarrápido optimizado 100% para compras fluidas desde cualquier celular.
• Botón de Compra Directa a WhatsApp: El cliente elige sus prendas preferidas y la orden se envía instantáneamente estructurada a su equipo de ventas.
• Sincronización Estratégica con Instagram Shopping y Google Business para maximizar el tráfico comercial local.

Si están interesados en modernizar la experiencia de compra de sus clientes y multiplicar sus ventas directas, pueden responder a este mensaje para agendar una reunión o demostración formal con nuestro equipo.

💡 Si tienen alguna duda o desean conocer más sobre nuestro trabajo y portafolio de servicios, pueden consultar nuestro sitio web oficial:
👉 https://vertexcorp.com.co/es

Saludos cordiales,
*Ray Mendoza* | Director de Desarrollo
VERTEX Innovation & Consulting
📱 +57 300 865 8910 | ✉️ gerenciavertexsas@gmail.com
🌐 https://vertexcorp.com.co/es`;

    } else {
      emailSubject = `${lead.businessName}: Diagnóstico de presencia digital, sitio web y captación`;
      emailBody = `Estimado equipo directivo de ${lead.businessName},

Realizamos un análisis técnico y comercial sobre la presencia digital de su empresa en el mercado local, identificando oportunidades estratégicas de captación:

1. FALENCIAS DETECTADAS EN LA AUDITORÍA:
• ${!lead.hasWebsite ? "Ausencia de Sitio Web Oficial: Su empresa no cuenta con un portal institucional indexado en Google, perdiendo clientes potenciales que buscan activamente sus servicios." : "Sitio Web Desactualizado: Su portal actual no cuenta con diseño responsivo para móviles ni protocolos modernos de captación."}
• Canales de Contacto Dispersos: No disponen de un flujo directo y automatizado para recibir consultas comerciales por WhatsApp o correo institucional.
• Presencia Incompleta en Redes Sociales: Falta de integración entre sus perfiles comerciales y su oferta de servicios principal.

2. RECOMENDACIONES Y SOLUCIONES VERTEX:
• Desarrollo de Sitio Web Corporativo de Alta Conversión con dominio propio y correos institucionales.
• Integración de Canal Comercial WhatsApp Business para atención y cierre rápido de prospectos.
• Optimización de Ficha en Google Maps y vinculación con redes sociales comerciales.

Si están interesados en modernizar estos aspectos y evaluar la implementación de estas soluciones, pueden comunicarse respondiendo directamente a este correo para agendar una reunión técnica y comercial.

Para conocer más sobre nuestra empresa, trayectoria y explorar nuestro portafolio de servicios y casos de éxito, los invitamos a visitar nuestro sitio web oficial:
👉 https://vertexcorp.com.co/es

Atentamente,
Ray Mendoza
Director de Desarrollo | VERTEX Innovation & Consulting
gerenciavertexsas@gmail.com | +57 300 865 8910
Sitio Web Oficial: https://vertexcorp.com.co/es`;

      whatsappBody = `¡Hola equipo directivo de ${lead.businessName}! 👋

Somos *VERTEX Innovation & Consulting*, firma especializada en ingeniería de software, desarrollo de portales corporativos de alta conversión y automatización de procesos comerciales para empresas en Colombia.

Realizamos una auditoría técnica sobre la visibilidad digital y canales comerciales de su empresa en el mercado local, identificando hallazgos prioritarios:

1. FALENCIAS DETECTADAS EN LA AUDITORÍA:
• ${!lead.hasWebsite ? "Ausencia de Sitio Web Corporativo Oficial: Su empresa no cuenta con un portal institucional propio indexado en Google, lo que desvía clientes potenciales hacia competidores de su sector." : "Portal Web No Adaptado a Estándares Modernos: Su sitio actual presenta tiempos de carga elevados, falta de visualización responsiva en smartphones y protocolos desactualizados."}
• Canales Comerciales Desarticulados: No disponen de una línea directa sincronizada en WhatsApp ni formularios de captación rápida para responder cotizaciones en minutos.
• Presencia Digital Incompleta: Falta de vinculación estratégica entre perfiles comerciales y su catálogo de servicios.

2. SOLUCIONES RECOMENDADAS VERTEX:
• Desarrollo de Sitio Web Corporativo de Alta Velocidad con dominio propio, diseño premium y posicionamiento local en Google.
• Implementación de Canal Comercial Automatizado en WhatsApp Business para atención inmediata de prospectos.
• Auditoría de Marca e Infraestructura Digital para proyectar máxima solidez y confianza empresarial.

Si están interesados en evaluar nuestra propuesta técnica y modernizar la presencia digital de su empresa, pueden responder directamente a este mensaje para agendar una reunión formal con nuestro equipo.

💡 Si tienen alguna duda o desean conocer más sobre nuestro trabajo y portafolio de servicios, pueden consultar nuestro sitio web oficial:
👉 https://vertexcorp.com.co/es

Atentamente,
*Ray Mendoza* | Director de Desarrollo
VERTEX Innovation & Consulting
📱 +57 300 865 8910 | ✉️ gerenciavertexsas@gmail.com
🌐 https://vertexcorp.com.co/es`;
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
    const providerName = request.channel === "EMAIL" ? "Resend (mail.vertexcorp.com.co)" : "Meta WhatsApp Cloud API";
    const providerMessageId = request.channel === "EMAIL" ? `resend_msg_${Date.now().toString(36)}` : `wamid.HBgL${Date.now()}`;

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
      providerName,
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

    const message = request.channel === "EMAIL"
      ? `Correo enviado exitosamente vía Resend desde gerencia@mail.vertexcorp.com.co hacia ${request.destination}. Respuestas dirigidas a gerenciavertexsas@gmail.com.`
      : `Mensaje de WhatsApp despachado exitosamente vía Meta WhatsApp Cloud API hacia ${request.destination}. Procesado directamente en la aplicación.`;

    return {
      success: true,
      intentId,
      channel: request.channel,
      destination: request.destination,
      status: "ACCEPTED",
      providerName,
      providerMessageId,
      message,
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
