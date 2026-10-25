// ═══════════════════════════════════════════════════════════
// VERTEX Prospect — Scoring Weights (Deterministic Engine)
// ═══════════════════════════════════════════════════════════
// Total máximo posible: 100 puntos
// A MENOR digital_score → MAYOR opportunity_score para VERTEX

export const SCORING_WEIGHTS = {
  /** Presencia Web — 40 puntos máximo */
  WEB_PRESENCE: {
    /** Tiene sitio web funcional */
    HAS_WEBSITE: 15,
    /** Certificado SSL válido (HTTPS) */
    HAS_SSL: 5,
    /** Dominio propio (no .wixsite.com, .wordpress.com, etc.) */
    HAS_CUSTOM_DOMAIN: 10,
    /** Sitio responsivo o PWA detectado */
    IS_RESPONSIVE_PWA: 5,
    /** Metatags OpenGraph presentes */
    HAS_META_OG: 5,
  },

  /** Redes Sociales y Canales Directos — 30 puntos máximo */
  SOCIAL_CHANNELS: {
    /** Enlace a Instagram o Facebook detectado y activo */
    HAS_SOCIAL_MEDIA: 15,
    /** Enlace o botón directo a WhatsApp empresarial */
    HAS_WHATSAPP: 15,
  },

  /** Reputación y Google Business Profile — 30 puntos máximo */
  REPUTATION: {
    /** Más de 20 reseñas en Google Maps */
    REVIEWS_ABOVE_20: 15,
    /** Calificación mayor a 4.0 estrellas */
    RATING_ABOVE_4: 10,
    /** Información completa (horarios, teléfono verificado) */
    COMPLETE_PROFILE: 5,
  },
} as const;

/** Máximo score posible (sum of all weights) */
export const MAX_DIGITAL_SCORE = 100;

/** Subdominios de servicios de sitios web gratuitos que no cuentan como dominio propio */
export const FREE_HOSTING_DOMAINS = [
  'wixsite.com',
  'wordpress.com',
  'blogspot.com',
  'weebly.com',
  'squarespace.com',
  'godaddysites.com',
  'jimdosite.com',
  'webnode.com',
  'strikingly.com',
  'carrd.co',
  'sites.google.com',
  'myshopify.com',
  'netlify.app',
  'vercel.app',
  'herokuapp.com',
  'firebaseapp.com',
  'web.app',
] as const;

/** Categorías de búsqueda predefinidas para el Discovery Panel */
export const SEARCH_CATEGORIES = [
  { label: 'Hoteles & Turismo', value: 'hoteles y hospedajes', icon: '🏨' },
  { label: 'Restaurantes', value: 'restaurantes y gastronomia', icon: '🍽️' },
  { label: 'Colegios & Educación', value: 'colegios e instituciones educativas', icon: '🎓' },
  { label: 'Clínicas & Hospitales', value: 'clinicas y centros medicos', icon: '🏥' },
  { label: 'Veterinarias', value: 'veterinarias', icon: '🐾' },
  { label: 'Empresas B2B / Corporativas', value: 'empresas corporativas y servicios b2b', icon: '🏢' },
  { label: 'Odontología', value: 'clinicas odontologicas', icon: '🦷' },
  { label: 'Inmobiliarias & Constructoras', value: 'inmobiliarias y constructoras', icon: '🏠' },
  { label: 'Logística & Transporte', value: 'empresas de logistica y transporte', icon: '🚚' },
  { label: 'Gimnasios & Fitness', value: 'gimnasios y centros fitness', icon: '💪' },
  { label: 'Salones de Belleza & Spas', value: 'salones de belleza y spas', icon: '💇' },
  { label: 'Talleres Automotrices', value: 'talleres automotrices y concesionarios', icon: '🔧' },
  { label: 'Firmas de Abogados', value: 'firmas de abogados y consultoria legal', icon: '⚖️' },
  { label: 'Contabilidad & Auditoría', value: 'firmas de contadores y auditoria', icon: '📊' },
  { label: 'Comercio & Retail', value: 'tiendas y retail', icon: '🛍️' },
] as const;

