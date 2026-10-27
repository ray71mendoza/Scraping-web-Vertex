// ═══════════════════════════════════════════════════════════
// VERTEX Prospect — Sector Profiles & Scoring Configuration
// ═══════════════════════════════════════════════════════════

import type { SectorProfileKey, SectorProfileConfig } from '../types/scoring.types';

export const SCORING_ENGINE_VERSION = 'v2.1-multi-dim';
export const SCORING_CONFIG_VERSION = '2026.1';
export const DEFAULT_EVIDENCE_COVERAGE_GATE = 0.40; // 40% minimum coverage required

/**
 * Sector profiles with specific digital capability requirements.
 * Avoids assuming every business needs every capability.
 */
export const SECTOR_PROFILES: Record<SectorProfileKey, SectorProfileConfig> = {
  HOTELS_TOURISM: {
    key: 'HOTELS_TOURISM',
    label: 'Hoteles, Hospedaje & Turismo',
    icon: '🏨',
    description: 'Prioriza motor de reservas directas, velocidad móvil, soporte WhatsApp y reputación en mapas.',
    requiredCapabilities: [
      'hasWebsite',
      'hasValidSsl',
      'hasOnlineBooking',
      'isResponsive',
      'hasWhatsapp',
      'googleMapsVerified',
    ],
    capabilityWeights: {
      hasWebsite: 25,
      hasValidSsl: 10,
      hasOnlineBooking: 30, // Direct reservations is highest gap
      isResponsive: 15,
      hasWhatsapp: 10,
      googleMapsVerified: 10,
    },
    confidenceGate: DEFAULT_EVIDENCE_COVERAGE_GATE,
  },
  RESTAURANTS: {
    key: 'RESTAURANTS',
    label: 'Restaurantes & Gastronomía',
    icon: '🍽️',
    description: 'Prioriza menú digital accesible, reservas por WhatsApp, ubicación exacta y reseñas recientes.',
    requiredCapabilities: [
      'hasWebsite',
      'hasOnlineMenu',
      'hasWhatsapp',
      'isResponsive',
      'googleMapsVerified',
    ],
    capabilityWeights: {
      hasWebsite: 20,
      hasOnlineMenu: 35, // Clear digital menu
      hasWhatsapp: 25,   // Table reservation / orders
      isResponsive: 10,
      googleMapsVerified: 10,
    },
    confidenceGate: DEFAULT_EVIDENCE_COVERAGE_GATE,
  },
  CLINICS: {
    key: 'CLINICS',
    label: 'Clínicas & Centros de Salud',
    icon: '🏥',
    description: 'Prioriza catálogo de especialidades, agendamiento de citas, seguridad SSL y canales de atención rápida.',
    requiredCapabilities: [
      'hasWebsite',
      'hasValidSsl',
      'hasAppointmentInfo',
      'isResponsive',
      'hasWhatsapp',
      'hasContactForm',
    ],
    capabilityWeights: {
      hasWebsite: 20,
      hasValidSsl: 15,         // Patient trust & privacy
      hasAppointmentInfo: 30,  // Clear appointment flow
      isResponsive: 15,
      hasWhatsapp: 10,
      hasContactForm: 10,
    },
    confidenceGate: DEFAULT_EVIDENCE_COVERAGE_GATE,
  },
  RETAIL: {
    key: 'RETAIL',
    label: 'Comercio & Retail Local',
    icon: '🛍️',
    description: 'Prioriza catálogo de productos o ecommerce, canal de venta por WhatsApp y navegación móvil.',
    requiredCapabilities: [
      'hasWebsite',
      'hasProductCatalog',
      'isResponsive',
      'hasWhatsapp',
      'hasValidSsl',
    ],
    capabilityWeights: {
      hasWebsite: 20,
      hasProductCatalog: 35, // Products visible online
      hasWhatsapp: 20,       // Conversational commerce
      isResponsive: 15,
      hasValidSsl: 10,
    },
    confidenceGate: DEFAULT_EVIDENCE_COVERAGE_GATE,
  },
  GENERAL: {
    key: 'GENERAL',
    label: 'Empresas & Servicios Generales',
    icon: '🏢',
    description: 'Evaluación estándar para empresas de servicios B2B, consultoría y corporativos.',
    requiredCapabilities: [
      'hasWebsite',
      'hasValidSsl',
      'hasCustomDomain',
      'isResponsive',
      'hasWhatsapp',
      'hasContactForm',
    ],
    capabilityWeights: {
      hasWebsite: 25,
      hasValidSsl: 15,
      hasCustomDomain: 15,
      isResponsive: 15,
      hasWhatsapp: 15,
      hasContactForm: 15,
    },
    confidenceGate: DEFAULT_EVIDENCE_COVERAGE_GATE,
  },
};

/**
 * Detects the most appropriate sector profile from business types/categories.
 */
export function detectSectorProfile(types: string[] = [], businessName = ''): SectorProfileKey {
  const haystack = [...types, businessName].join(' ').toLowerCase();

  if (
    haystack.includes('hotel') ||
    haystack.includes('hostel') ||
    haystack.includes('lodging') ||
    haystack.includes('resort') ||
    haystack.includes('turismo') ||
    haystack.includes('hospedaje')
  ) {
    return 'HOTELS_TOURISM';
  }

  if (
    haystack.includes('restaurant') ||
    haystack.includes('cafe') ||
    haystack.includes('bar') ||
    haystack.includes('bakery') ||
    haystack.includes('gastronom') ||
    haystack.includes('comida') ||
    haystack.includes('pizzeria')
  ) {
    return 'RESTAURANTS';
  }

  if (
    haystack.includes('doctor') ||
    haystack.includes('hospital') ||
    haystack.includes('clinic') ||
    haystack.includes('dentist') ||
    haystack.includes('health') ||
    haystack.includes('salud') ||
    haystack.includes('odontolog') ||
    haystack.includes('medico') ||
    haystack.includes('veterinar')
  ) {
    return 'CLINICS';
  }

  if (
    haystack.includes('store') ||
    haystack.includes('clothing') ||
    haystack.includes('retail') ||
    haystack.includes('tienda') ||
    haystack.includes('calzado') ||
    haystack.includes('joyeria') ||
    haystack.includes('muebles') ||
    haystack.includes('supermercado')
  ) {
    return 'RETAIL';
  }

  return 'GENERAL';
}
