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
  { label: 'Restaurantes', value: 'restaurantes', icon: '🍽️' },
  { label: 'Veterinarias', value: 'veterinarias', icon: '🐾' },
  { label: 'Clínicas Médicas', value: 'clinicas medicas', icon: '🏥' },
  { label: 'Odontología', value: 'clinicas odontologicas', icon: '🦷' },
  { label: 'Gimnasios', value: 'gimnasios', icon: '💪' },
  { label: 'Salones de Belleza', value: 'salones de belleza', icon: '💇' },
  { label: 'Talleres Mecánicos', value: 'talleres mecanicos', icon: '🔧' },
  { label: 'Inmobiliarias', value: 'inmobiliarias', icon: '🏠' },
  { label: 'Hoteles', value: 'hoteles', icon: '🏨' },
  { label: 'Abogados', value: 'abogados', icon: '⚖️' },
  { label: 'Contadores', value: 'contadores', icon: '📊' },
  { label: 'Tiendas de Ropa', value: 'tiendas de ropa', icon: '👗' },
  { label: 'Ferreterías', value: 'ferreterias', icon: '🔨' },
  { label: 'Panaderías', value: 'panaderias', icon: '🍞' },
  { label: 'Floristerías', value: 'floristerias', icon: '🌸' },
  { label: 'Ópticas', value: 'opticas', icon: '👓' },
  { label: 'Farmacias', value: 'farmacias', icon: '💊' },
  { label: 'Lavanderías', value: 'lavanderias', icon: '🧺' },
] as const;
