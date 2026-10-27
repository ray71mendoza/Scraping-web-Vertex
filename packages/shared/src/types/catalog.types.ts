// ═══════════════════════════════════════════════════════════
// VERTEX Prospect — Service Catalog & Pricing Types
// ═══════════════════════════════════════════════════════════

export type ServiceCategory =
  | 'WEB_DEV'
  | 'PERFORMANCE'
  | 'SEO'
  | 'ECOMMERCE'
  | 'BOOKING'
  | 'AUTOMATION'
  | 'SECURITY';

export type PricingModel = 'FIXED' | 'MONTHLY' | 'CUSTOM_QUOTE';

export interface ServiceCatalogItemDto {
  id: string;
  code: string;
  name: string;
  category: ServiceCategory;
  description: string;
  applicableSectors: string[];
  requiredCheckKeys: string[];
  deliverables: string[];
  exclusions: string[];
  dependencies: string[];
  pricingModel: PricingModel;
  basePrice: number | null; // null represents "Por cotizar"
  currency: 'COP' | 'USD';
  estimatedDurationDays: number | null;
  isActive: boolean;
  version: number;
}

/**
 * Standard default active catalog services for VERTEX Innovation & Consulting.
 */
export const DEFAULT_VERTEX_SERVICE_CATALOG: ServiceCatalogItemDto[] = [
  {
    id: 'srv_web_corp_01',
    code: 'WEB_DEV_CORP',
    name: 'Desarrollo de Sitio Web Corporativo de Alta Conversión',
    category: 'WEB_DEV',
    description: 'Arquitectura web moderna, ultra rápida, optimizada para captar clientes locales desde Google.',
    applicableSectors: ['HOTELS_TOURISM', 'RESTAURANTS', 'CLINICS', 'RETAIL', 'GENERAL'],
    requiredCheckKeys: ['hasWebsite', 'hasCustomDomain'],
    deliverables: [
      'Diseño UX/UI exclusivo adaptado a la identidad de marca',
      'Desarrollo responsivo 100% optimizado para móviles y tablets',
      'Integración de dominio corporativo y correos institucionales',
      'Configuración de botón directo a WhatsApp y formulario seguro',
    ],
    exclusions: ['Pasarela de pagos personalizada compleja', 'Redacción de más de 20 páginas'],
    dependencies: ['Suministro de logotipo y material fotográfico'],
    pricingModel: 'FIXED',
    basePrice: 1800000,
    currency: 'COP',
    estimatedDurationDays: 14,
    isActive: true,
    version: 1,
  },
  {
    id: 'srv_web_redesign_02',
    code: 'WEB_DEV_REDESIGN',
    name: 'Rediseño Web UX & Optimización Mobile First',
    category: 'WEB_DEV',
    description: 'Modernización de sitios existentes con problemas de visualización móvil, lentitud o tecnologías obsoletas.',
    applicableSectors: ['HOTELS_TOURISM', 'RESTAURANTS', 'CLINICS', 'RETAIL', 'GENERAL'],
    requiredCheckKeys: ['isResponsive', 'hasWebsite'],
    deliverables: [
      'Eliminación de desbordes horizontales y elementos ilegibles',
      'Migración a stack web moderno con carga instantánea',
      'Barra fija de llamada y WhatsApp en dispositivos móviles',
    ],
    exclusions: ['Reescritura total de lógica backend previa'],
    dependencies: ['Acceso de administrador o hosting del sitio anterior'],
    pricingModel: 'FIXED',
    basePrice: 1400000,
    currency: 'COP',
    estimatedDurationDays: 10,
    isActive: true,
    version: 1,
  },
  {
    id: 'srv_booking_03',
    code: 'BOOKING_RESERVATIONS',
    name: 'Sistema de Agendamiento de Citas & Reservas Online',
    category: 'BOOKING',
    description: 'Motor automatizado de reservas directas para consultorios, clínicas, hoteles y centros estéticos.',
    applicableSectors: ['HOTELS_TOURISM', 'RESTAURANTS', 'CLINICS'],
    requiredCheckKeys: ['hasOnlineBooking', 'hasAppointmentInfo'],
    deliverables: [
      'Calendario interactivo con sincronización a Google Calendar',
      'Confirmación y recordatorio automático vía WhatsApp / Email',
      'Panel de control de turnos y especialidades para recepción',
    ],
    exclusions: ['Integración con software hospitalario propietario sin API'],
    dependencies: ['Definición de horarios y disponibilidad del personal'],
    pricingModel: 'FIXED',
    basePrice: 1950000,
    currency: 'COP',
    estimatedDurationDays: 12,
    isActive: true,
    version: 1,
  },
  {
    id: 'srv_catalog_04',
    code: 'ECOMMERCE_CATALOG',
    name: 'Catálogo Digital Interactivo con Pedidos a WhatsApp',
    category: 'ECOMMERCE',
    description: 'Muestra de productos o menú gastronómico interactivo con cotizador y envío directo de carrito a WhatsApp.',
    applicableSectors: ['RETAIL', 'RESTAURANTS'],
    requiredCheckKeys: ['hasProductCatalog', 'hasOnlineMenu'],
    deliverables: [
      'Catálogo visual categorizado con fotos, precios y variantes',
      'Buscador instantáneo y filtros por categoría',
      'Generador de pedido formateado directamente al chat de ventas',
    ],
    exclusions: ['Integración con facturación electrónica DIAN (adicional)'],
    dependencies: ['Listado de productos o menú con precios y fotos'],
    pricingModel: 'FIXED',
    basePrice: 1600000,
    currency: 'COP',
    estimatedDurationDays: 10,
    isActive: true,
    version: 1,
  },
  {
    id: 'srv_seo_05',
    code: 'SEO_LOCAL_TECH',
    name: 'Auditoría SEO Técnico & Posicionamiento Local en Google Maps',
    category: 'SEO',
    description: 'Optimización de metatags, schema JSON-LD y ficha de Google Business Profile para superar competidores locales.',
    applicableSectors: ['HOTELS_TOURISM', 'RESTAURANTS', 'CLINICS', 'RETAIL', 'GENERAL'],
    requiredCheckKeys: ['hasMetaOg', 'googleMapsVerified'],
    deliverables: [
      'Optimización de títulos, descripciones y microformatos locales',
      'Corrección de sitemap XML y directivas robots',
      'Estrategia y plantilla para recopilación de reseñas de clientes',
    ],
    exclusions: ['Campañas de pago por clic en Google Ads'],
    dependencies: ['Acceso de propietario o administrador a Google Business'],
    pricingModel: 'MONTHLY',
    basePrice: 750000,
    currency: 'COP',
    estimatedDurationDays: 30,
    isActive: true,
    version: 1,
  },
  {
    id: 'srv_whatsapp_crm_06',
    code: 'AUTOMATION_WHATSAPP_CRM',
    name: 'Canal Oficial de WhatsApp Business & Automatización CRM',
    category: 'AUTOMATION',
    description: 'Implementación del canal oficial con bot de bienvenida, respuestas automáticas a preguntas frecuentes y captura de prospectos.',
    applicableSectors: ['HOTELS_TOURISM', 'RESTAURANTS', 'CLINICS', 'RETAIL', 'GENERAL'],
    requiredCheckKeys: ['hasWhatsapp'],
    deliverables: [
      'Configuración de API oficial de WhatsApp Business Cloud',
      'Flujo de bienvenida y clasificación automática de consultas',
      'Enrutamiento de prospectos a asesores comerciales',
    ],
    exclusions: ['Costos de conversación de Meta (pago directo al proveedor)'],
    dependencies: ['Línea telefónica disponible y cuenta comercial de Meta'],
    pricingModel: 'FIXED',
    basePrice: 1200000,
    currency: 'COP',
    estimatedDurationDays: 7,
    isActive: true,
    version: 1,
  },
  {
    id: 'srv_ssl_sec_07',
    code: 'SEC_SSL_INFRA',
    name: 'Certificación de Seguridad SSL/HTTPS & Blindaje Web',
    category: 'SECURITY',
    description: 'Remediación inmediata de alertas de "Sitio no seguro" en navegadores, cifrado TLS y redirección canónica.',
    applicableSectors: ['HOTELS_TOURISM', 'RESTAURANTS', 'CLINICS', 'RETAIL', 'GENERAL'],
    requiredCheckKeys: ['hasValidSsl'],
    deliverables: [
      'Instalación y renovación automática de certificado SSL TLS 1.3',
      'Eliminación de contenido mixto (Mixed Content HTTP/HTTPS)',
      'Configuración de cabeceras de seguridad HSTS',
    ],
    exclusions: ['Remediación de malware preexistente en el servidor'],
    dependencies: ['Acceso a la zona DNS del dominio o cPanel'],
    pricingModel: 'FIXED',
    basePrice: 450000,
    currency: 'COP',
    estimatedDurationDays: 2,
    isActive: true,
    version: 1,
  },
];
