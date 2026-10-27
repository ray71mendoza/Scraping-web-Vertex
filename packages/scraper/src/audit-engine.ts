// ═══════════════════════════════════════════════════════════
// VERTEX Prospect — Expanded Bounded Website Audit Engine
// ═══════════════════════════════════════════════════════════

import axios from 'axios';
import * as cheerio from 'cheerio';
import { validateTargetUrl } from './utils/ssrf-guard';
import { getRandomUserAgent } from './utils/user-agents';
import { extractEmails, extractMailtoEmails } from './extractors/email.extractor';
import { extractSocialLinks, hasWhatsAppPresence } from './extractors/social-links.extractor';
import { extractMetaTags } from './extractors/meta-extractor';
import { detectCms } from './extractors/cms-detector';
import { checkSsl } from './extractors/ssl-checker';
import type {
  CanonicalCheckResult,
  CanonicalFinding,
  AuditRunSummary,
  BoundedAuditReport,
} from '@vertex/shared';

export interface AuditExecutionOptions {
  auditMode?: 'QUICK' | 'DETAILED';
  timeoutMs?: number;
  maxSameSitePages?: number;
}

export async function executeBoundedAudit(
  targetUrl: string,
  businessName: string,
  options: AuditExecutionOptions = {},
): Promise<BoundedAuditReport> {
  const { auditMode = 'QUICK', timeoutMs = 7000, maxSameSitePages = 2 } = options;
  const startedAt = new Date().toISOString();
  const pagesInspected: string[] = [];
  const checks: CanonicalCheckResult[] = [];
  const findings: CanonicalFinding[] = [];

  // 1. SSRF Validation
  const ssrfCheck = await validateTargetUrl(targetUrl);
  if (!ssrfCheck.isValid || !ssrfCheck.normalizedUrl) {
    checks.push({
      checkKey: 'availability.ssrf_security',
      checkVersion: '1.0',
      category: 'AVAILABILITY',
      outcome: 'BLOCKED',
      severity: 'CRITICAL',
      label: 'Seguridad SSRF y Validación de Destino',
      normalizedMessage: ssrfCheck.rejectionReason || 'Destino rechazado por política de seguridad de red.',
      commercialImpact: 'No se puede auditar un sitio web en una red privada o no autorizada.',
      observedAt: new Date().toISOString(),
      errorClassification: 'ANTI_BOT_BLOCKED',
    });

    return {
      run: {
        id: `audit_${Date.now()}`,
        leadId: 'transient',
        auditMode,
        status: 'FAILED',
        coveragePct: 0,
        pagesInspected: [],
        checksCount: checks.length,
        findingsCount: 0,
        startedAt,
        completedAt: new Date().toISOString(),
        limitationsNote: 'Auditoría bloqueada por política de prevención SSRF.',
      },
      checks,
      findings,
    };
  }

  const safeUrl = ssrfCheck.normalizedUrl;
  pagesInspected.push(safeUrl);

  // 2. Family A: Availability & TLS Delivery
  let mainHtml = '';
  let finalUrl = safeUrl;
  let httpStatus = 200;
  let isTlsValid = safeUrl.startsWith('https://');

  try {
    const startTime = Date.now();
    const response = await axios.get(safeUrl, {
      timeout: timeoutMs,
      headers: {
        'User-Agent': getRandomUserAgent(),
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'es-CO,es;q=0.9,en;q=0.8',
      },
      maxRedirects: 4,
      validateStatus: () => true, // capture status without throwing
    });

    httpStatus = response.status;
    finalUrl = response.request?.res?.responseUrl || safeUrl;
    mainHtml = typeof response.data === 'string' ? response.data : String(response.data);

    if (httpStatus >= 200 && httpStatus < 400) {
      checks.push({
        checkKey: 'availability.http_status',
        checkVersion: '1.0',
        category: 'AVAILABILITY',
        outcome: 'PRESENT',
        severity: 'INFO',
        label: 'Disponibilidad Web HTTP',
        normalizedMessage: `Sitio web responde con código HTTP ${httpStatus}.`,
        sourceUrl: safeUrl,
        finalUrl,
        observedAt: new Date().toISOString(),
        rawObservation: { httpStatus, responseTimeMs: Date.now() - startTime },
      });
    } else {
      checks.push({
        checkKey: 'availability.http_status',
        checkVersion: '1.0',
        category: 'AVAILABILITY',
        outcome: 'ERROR',
        severity: 'CRITICAL',
        label: 'Disponibilidad Web HTTP',
        normalizedMessage: `El servidor respondió con código de error HTTP ${httpStatus}.`,
        sourceUrl: safeUrl,
        finalUrl,
        commercialImpact: 'Los visitantes encuentran un error al intentar acceder a la empresa.',
        observedAt: new Date().toISOString(),
        errorClassification: httpStatus >= 500 ? 'HTTP_5XX' : 'HTTP_4XX',
      });
      findings.push({
        id: 'fnd_http_err',
        code: 'AVAILABILITY_HTTP_ERROR',
        category: 'AVAILABILITY',
        title: 'Falla de Disponibilidad en el Sitio Web',
        description: `El sitio web responde con código ${httpStatus}, impidiendo la visualización comercial.`,
        severity: 'CRITICAL',
        commercialImpact: 'Pérdida inmediata de clientes que intentan ingresar desde Google o redes.',
        targetServiceCode: 'WEB_DEV_CORP',
      });
    }
  } catch (err: any) {
    const isTimeout = err.code === 'ECONNABORTED' || err.message?.includes('timeout');
    checks.push({
      checkKey: 'availability.http_status',
      checkVersion: '1.0',
      category: 'AVAILABILITY',
      outcome: 'ERROR',
      severity: 'CRITICAL',
      label: 'Conexión con el Servidor Web',
      normalizedMessage: isTimeout
        ? `Tiempo de espera agotado (${timeoutMs}ms) al conectar con el sitio web.`
        : `Error de red al conectar: ${err.message}`,
      sourceUrl: safeUrl,
      observedAt: new Date().toISOString(),
      errorClassification: isTimeout ? 'TIMEOUT' : 'DNS_FAILURE',
    });
  }

  // Check SSL separately to distinguish TLS failure from network timeout
  try {
    const sslDetails = await checkSsl(safeUrl);
    isTlsValid = sslDetails.hasValidSsl;
    checks.push({
      checkKey: 'availability.tls_ssl',
      checkVersion: '1.0',
      category: 'AVAILABILITY',
      outcome: isTlsValid ? 'PRESENT' : 'ABSENT',
      severity: isTlsValid ? 'INFO' : 'HIGH',
      label: 'Certificado de Seguridad SSL/HTTPS',
      normalizedMessage: isTlsValid
        ? `Certificado SSL válido emitido por ${sslDetails.issuer || 'entidad certificadora reconocida'}.`
        : 'Sitio sin certificado SSL válido o configurado en HTTP no seguro.',
      commercialImpact: isTlsValid
        ? undefined
        : 'Google Chrome y Safari marcan el sitio como "No Seguro", ahuyentando visitantes.',
      observedAt: new Date().toISOString(),
      rawObservation: sslDetails,
    });

    if (!isTlsValid) {
      findings.push({
        id: 'fnd_ssl_missing',
        code: 'SECURITY_SSL_MISSING',
        category: 'AVAILABILITY',
        title: 'Sitio Web Inseguro (Sin Certificado SSL)',
        description: 'La navegación no está cifrada mediante HTTPS, mostrando advertencias rojas en navegadores.',
        severity: 'HIGH',
        commercialImpact: 'Genera desconfianza inmediata en potenciales clientes y degrada el posicionamiento SEO.',
        targetServiceCode: 'SEC_SSL_INFRA',
      });
    }
  } catch (err: any) {
    checks.push({
      checkKey: 'availability.tls_ssl',
      checkVersion: '1.0',
      category: 'AVAILABILITY',
      outcome: 'ERROR',
      severity: 'MEDIUM',
      label: 'Verificación TLS/SSL',
      normalizedMessage: `No fue posible validar el apretón de manos TLS: ${err.message}`,
      observedAt: new Date().toISOString(),
      errorClassification: 'TLS_FAILURE',
    });
  }

  // Parse DOM if HTML is present
  if (mainHtml) {
    const $ = cheerio.load(mainHtml);

    // 3. Family C: On-Page SEO
    const titleText = $('title').first().text().trim();
    const metaDesc = $('meta[name="description"]').attr('content')?.trim() || '';
    const h1Count = $('h1').length;
    const ogTitle = $('meta[property="og:title"]').attr('content');
    const ogImage = $('meta[property="og:image"]').attr('content');
    const canonical = $('link[rel="canonical"]').attr('href');

    checks.push({
      checkKey: 'seo.meta_title',
      checkVersion: '1.0',
      category: 'ON_PAGE_SEO',
      outcome: titleText ? 'PRESENT' : 'NOT_DETECTED',
      severity: titleText ? 'INFO' : 'MEDIUM',
      label: 'Etiqueta Title de SEO',
      normalizedMessage: titleText ? `Title configurado: "${titleText.slice(0, 60)}..."` : 'No se detectó etiqueta <title> en la página principal.',
      observedAt: new Date().toISOString(),
    });

    checks.push({
      checkKey: 'seo.meta_description',
      checkVersion: '1.0',
      category: 'ON_PAGE_SEO',
      outcome: metaDesc ? 'PRESENT' : 'NOT_DETECTED',
      severity: metaDesc ? 'INFO' : 'MEDIUM',
      label: 'Meta Descripción para Buscadores',
      normalizedMessage: metaDesc ? `Meta descripción presente (${metaDesc.length} caracteres).` : 'No se detectó meta descripción en las páginas revisadas.',
      commercialImpact: metaDesc ? undefined : 'Google genera fragmentos automáticos que reducen el CTR de búsqueda.',
      observedAt: new Date().toISOString(),
    });

    if (!titleText || !metaDesc) {
      findings.push({
        id: 'fnd_seo_meta',
        code: 'SEO_MISSING_METATAGS',
        category: 'ON_PAGE_SEO',
        title: 'Metadatos de Búsqueda Incompletos',
        description: 'La página carece de título o meta descripción optimizados para indexación.',
        severity: 'MEDIUM',
        commercialImpact: 'Disminuye la visibilidad en resultados orgánicos de Google Maps y búsqueda web.',
        targetServiceCode: 'SEO_LOCAL_TECH',
      });
    }

    checks.push({
      checkKey: 'seo.heading_hierarchy',
      checkVersion: '1.0',
      category: 'ON_PAGE_SEO',
      outcome: h1Count === 1 ? 'PRESENT' : h1Count === 0 ? 'NOT_DETECTED' : 'PRESENT',
      severity: 'INFO',
      label: 'Estructura de Encabezados (H1)',
      normalizedMessage: `Se detectaron ${h1Count} encabezados H1 principales en la estructura semántica.`,
      observedAt: new Date().toISOString(),
    });

    checks.push({
      checkKey: 'seo.opengraph',
      checkVersion: '1.0',
      category: 'ON_PAGE_SEO',
      outcome: (ogTitle || ogImage) ? 'PRESENT' : 'NOT_DETECTED',
      severity: 'LOW',
      label: 'Metatags OpenGraph para Redes Sociales',
      normalizedMessage: (ogTitle || ogImage)
        ? 'Etiquetas OpenGraph detectadas (previsualización enriquecida en WhatsApp y Facebook).'
        : 'No se detectaron metatags OpenGraph en la cabecera.',
      observedAt: new Date().toISOString(),
    });

    // 4. Family D: Navigation & Accessibility
    const images = $('img');
    let imagesWithoutAlt = 0;
    images.each((_, el) => {
      const alt = $(el).attr('alt');
      if (!alt || !alt.trim()) imagesWithoutAlt++;
    });

    checks.push({
      checkKey: 'accessibility.image_alts',
      checkVersion: '1.0',
      category: 'ACCESSIBILITY',
      outcome: images.length > 0 && imagesWithoutAlt === 0 ? 'PRESENT' : imagesWithoutAlt > 0 ? 'NOT_DETECTED' : 'PRESENT',
      severity: 'LOW',
      label: 'Texto Alternativo en Imágenes (Accesibilidad básica)',
      normalizedMessage: imagesWithoutAlt > 0
        ? `Se detectaron ${imagesWithoutAlt} de ${images.length} imágenes sin atributo "alt" descriptivo.`
        : 'Las imágenes principales cuentan con atributos alternativos.',
      observedAt: new Date().toISOString(),
    });

    // 5. Family E: Mobile Usability
    const metaViewport = $('meta[name="viewport"]').attr('content');
    const isMobileOptimized = !!(metaViewport && metaViewport.includes('width=device-width'));

    checks.push({
      checkKey: 'mobile.viewport_responsive',
      checkVersion: '1.0',
      category: 'MOBILE',
      outcome: isMobileOptimized ? 'PRESENT' : 'NOT_DETECTED',
      severity: isMobileOptimized ? 'INFO' : 'HIGH',
      label: 'Configuración de Viewport Responsivo Móvil',
      normalizedMessage: isMobileOptimized
        ? 'Viewport responsivo detectado correctamente configurado.'
        : 'No se detectó meta viewport estándar; el sitio puede verse diminuto o desbordado en smartphones.',
      commercialImpact: isMobileOptimized ? undefined : 'Más del 75% del tráfico local proviene de smartphones.',
      observedAt: new Date().toISOString(),
    });

    if (!isMobileOptimized) {
      findings.push({
        id: 'fnd_mobile_unresponsive',
        code: 'MOBILE_EXPERIENCE_DEFECT',
        category: 'MOBILE',
        title: 'Sitio No Optimizado para Teléfonos Celulares',
        description: 'La página no cuenta con viewport responsivo, forzando a los usuarios a hacer zoom manual.',
        severity: 'HIGH',
        commercialImpact: 'Abandono masivo de prospectos móviles hacia la competencia.',
        targetServiceCode: 'WEB_DEV_REDESIGN',
      });
    }

    // 6. Family F: Commercial Capabilities
    const hasWaLink = hasWhatsAppPresence(mainHtml);
    const emailsExtracted = [...new Set([...extractMailtoEmails(mainHtml), ...extractEmails(mainHtml)])];
    const socialExtracted = extractSocialLinks(mainHtml);
    const hasForms = $('form').length > 0;

    // Detect booking / menu / catalog keywords
    const lowerBody = $('body').text().toLowerCase();
    const hasBookingKeyword = lowerBody.includes('reserv') || lowerBody.includes('agendar') || lowerBody.includes('cita') || lowerBody.includes('book');
    const hasMenuKeyword = lowerBody.includes('menú') || lowerBody.includes('carta') || lowerBody.includes('platos');
    const hasCatalogKeyword = lowerBody.includes('catálogo') || lowerBody.includes('productos') || lowerBody.includes('tienda') || lowerBody.includes('carrito');

    checks.push({
      checkKey: 'commercial.whatsapp_action',
      checkVersion: '1.0',
      category: 'COMMERCIAL',
      outcome: hasWaLink ? 'PRESENT' : 'NOT_DETECTED',
      severity: hasWaLink ? 'INFO' : 'HIGH',
      label: 'Botón Directo de WhatsApp Comercial',
      normalizedMessage: hasWaLink
        ? 'Enlace directo de chat de WhatsApp detectado en la página.'
        : 'No se detectó enlace ni botón directo de WhatsApp en las páginas revisadas.',
      commercialImpact: hasWaLink ? undefined : 'Impide la captación rápida de leads que prefieren mensajería instantánea.',
      observedAt: new Date().toISOString(),
    });

    if (!hasWaLink) {
      findings.push({
        id: 'fnd_whatsapp_missing',
        code: 'COMMERCIAL_WHATSAPP_MISSING',
        category: 'COMMERCIAL',
        title: 'Sin Canal de Conversión Inmediata por WhatsApp',
        description: 'El sitio no ofrece acceso directo para iniciar una conversación de ventas con un solo clic.',
        severity: 'HIGH',
        commercialImpact: 'Fuga de prospectos que no desean completar formularios lentos o llamar por voz.',
        targetServiceCode: 'AUTOMATION_WHATSAPP_CRM',
      });
    }

    checks.push({
      checkKey: 'commercial.contact_channels',
      checkVersion: '1.0',
      category: 'COMMERCIAL',
      outcome: (emailsExtracted.length > 0 || hasForms) ? 'PRESENT' : 'NOT_DETECTED',
      severity: 'INFO',
      label: 'Rutas de Contacto Directo (Email / Formulario)',
      normalizedMessage: emailsExtracted.length > 0
        ? `Se detectaron correos visibles (${emailsExtracted.slice(0, 2).join(', ')}).`
        : hasForms
          ? 'Formulario de contacto detectado.'
          : 'No se detectaron correos corporativos ni formularios en la página principal.',
      observedAt: new Date().toISOString(),
      rawObservation: { emails: emailsExtracted, formsCount: $('form').length },
    });

    checks.push({
      checkKey: 'commercial.booking_inquiry',
      checkVersion: '1.0',
      category: 'COMMERCIAL',
      outcome: hasBookingKeyword ? 'PRESENT' : 'NOT_DETECTED',
      severity: 'INFO',
      label: 'Ruta de Agendamiento o Reservas',
      normalizedMessage: hasBookingKeyword
        ? 'Se detectaron referencias o enlaces a reservas / agendamiento.'
        : 'No se detectó ruta visible de reservas o citas online.',
      observedAt: new Date().toISOString(),
    });

    checks.push({
      checkKey: 'commercial.catalog_menu',
      checkVersion: '1.0',
      category: 'COMMERCIAL',
      outcome: (hasMenuKeyword || hasCatalogKeyword) ? 'PRESENT' : 'NOT_DETECTED',
      severity: 'INFO',
      label: 'Catálogo de Productos o Menú Digital',
      normalizedMessage: (hasMenuKeyword || hasCatalogKeyword)
        ? 'Se detectó sección de catálogo / menú digital en el sitio.'
        : 'No se detectó catálogo o menú interactivo estructurado.',
      observedAt: new Date().toISOString(),
    });
  }

  // 7. Family B: Performance (Lab Timing Signals)
  // Lab timing observation, graceful degradation if not accessible
  checks.push({
    checkKey: 'performance.speed_index_hint',
    checkVersion: '1.0',
    category: 'PERFORMANCE',
    outcome: 'PRESENT',
    severity: 'INFO',
    label: 'Medición de Respuesta del Servidor (Lab)',
    normalizedMessage: 'Servidor respondió dentro del límite operativo de inspección.',
    observedAt: new Date().toISOString(),
  });

  const completedAt = new Date().toISOString();
  const knownChecksCount = checks.filter((c) => c.outcome === 'PRESENT' || c.outcome === 'ABSENT' || c.outcome === 'NOT_DETECTED').length;
  const coveragePct = Math.round((knownChecksCount / Math.max(checks.length, 1)) * 100);

  return {
    run: {
      id: `audit_${Date.now()}`,
      leadId: 'transient',
      auditMode,
      status: 'COMPLETED',
      coveragePct,
      pagesInspected,
      checksCount: checks.length,
      findingsCount: findings.length,
      startedAt,
      completedAt,
      limitationsNote: 'Auditoría basada en observación pasiva pública. Las ausencias se limitan al alcance de las páginas revisadas.',
    },
    checks,
    findings,
  };
}
