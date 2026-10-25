// ═══════════════════════════════════════════════════════════
// VERTEX Prospect — Enrichment Worker
// ═══════════════════════════════════════════════════════════
// Scrapes websites, extracts digital maturity indicators,
// calculates scores, and updates leads in PostgreSQL.

import { Worker, type Job } from 'bullmq';
import IORedis from 'ioredis';
import { prisma } from '@vertex/database';
import { SCORING_WEIGHTS, OpportunityLevel } from '@vertex/shared';
import { scrapeWithCheerio, checkSsl } from '@vertex/scraper';
import { QUEUE_NAMES, type EnrichmentJobData } from '../types/job-data.types';

/**
 * Calculates the digital maturity score based on scraped data.
 * Returns 0-100 where higher = more digitally mature.
 */
function calculateDigitalScore(data: {
  hasWebsite: boolean;
  hasValidSsl: boolean;
  hasCustomDomain: boolean;
  isResponsive: boolean;
  hasMetaOg: boolean;
  hasSocialMedia: boolean;
  hasWhatsApp: boolean;
  googleRating: number | null;
  googleUserRatingsTotal: number | null;
  hasCompleteProfile: boolean;
}): { digitalScore: number; opportunityScore: number; opportunityTier: OpportunityLevel } {
  let score = 0;

  // Web Presence (40 pts)
  if (data.hasWebsite) score += SCORING_WEIGHTS.WEB_PRESENCE.HAS_WEBSITE;
  if (data.hasValidSsl) score += SCORING_WEIGHTS.WEB_PRESENCE.HAS_SSL;
  if (data.hasCustomDomain) score += SCORING_WEIGHTS.WEB_PRESENCE.HAS_CUSTOM_DOMAIN;
  if (data.isResponsive) score += SCORING_WEIGHTS.WEB_PRESENCE.IS_RESPONSIVE_PWA;
  if (data.hasMetaOg) score += SCORING_WEIGHTS.WEB_PRESENCE.HAS_META_OG;

  // Social Channels (30 pts)
  if (data.hasSocialMedia) score += SCORING_WEIGHTS.SOCIAL_CHANNELS.HAS_SOCIAL_MEDIA;
  if (data.hasWhatsApp) score += SCORING_WEIGHTS.SOCIAL_CHANNELS.HAS_WHATSAPP;

  // Reputation (30 pts)
  if (data.googleUserRatingsTotal && data.googleUserRatingsTotal > 20) {
    score += SCORING_WEIGHTS.REPUTATION.REVIEWS_ABOVE_20;
  }
  if (data.googleRating && data.googleRating > 4.0) {
    score += SCORING_WEIGHTS.REPUTATION.RATING_ABOVE_4;
  }
  if (data.hasCompleteProfile) score += SCORING_WEIGHTS.REPUTATION.COMPLETE_PROFILE;

  const opportunityScore = 100 - score;
  let opportunityTier: OpportunityLevel;
  if (opportunityScore >= 80) opportunityTier = OpportunityLevel.VERY_HIGH;
  else if (opportunityScore >= 60) opportunityTier = OpportunityLevel.HIGH;
  else if (opportunityScore >= 40) opportunityTier = OpportunityLevel.MEDIUM;
  else opportunityTier = OpportunityLevel.LOW;

  return { digitalScore: score, opportunityScore, opportunityTier };
}

/**
 * Creates and starts the Enrichment Worker.
 * Scrapes each lead's website and calculates digital maturity scores.
 */
export function createEnrichmentWorker(redisUrl?: string): Worker<EnrichmentJobData> {
  const connection = new IORedis(redisUrl || process.env.REDIS_URL || 'redis://localhost:6379', {
    maxRetriesPerRequest: null,
  });

  const concurrency = parseInt(process.env.ENRICHMENT_QUEUE_CONCURRENCY || '3', 10);
  const timeoutMs = parseInt(process.env.SCRAPER_TIMEOUT_MS || '8000', 10);

  const worker = new Worker<EnrichmentJobData>(
    QUEUE_NAMES.ENRICHMENT,
    async (job: Job<EnrichmentJobData>) => {
      const { leadId, websiteUrl, businessName } = job.data;

      console.log(`[EnrichmentWorker] Scraping ${businessName}: ${websiteUrl}`);

      // Fetch current lead data for Google reputation fields
      const lead = await prisma.lead.findUnique({ where: { id: leadId } });
      if (!lead) {
        throw new Error(`Lead ${leadId} not found`);
      }

      // Step 1: Scrape the website (Cheerio first — faster, Playwright as upgrade path)
      const scrapeResult = await scrapeWithCheerio(websiteUrl, timeoutMs);

      await job.updateProgress(40);

      if (!scrapeResult.success || !scrapeResult.data) {
        console.warn(
          `[EnrichmentWorker] Scrape failed for ${websiteUrl}: ${scrapeResult.error}`,
        );

        // Even on failure, update with what we know
        const scores = calculateDigitalScore({
          hasWebsite: true,
          hasValidSsl: websiteUrl.startsWith('https://'),
          hasCustomDomain: true,
          isResponsive: false,
          hasMetaOg: false,
          hasSocialMedia: false,
          hasWhatsApp: false,
          googleRating: lead.googleRating,
          googleUserRatingsTotal: lead.googleUserRatingsTotal,
          hasCompleteProfile: !!(lead.internationalPhone),
        });

        await prisma.lead.update({
          where: { id: leadId },
          data: {
            ...scores,
            status: 'QUALIFIED',
            enrichedAt: new Date(),
          },
        });

        return { status: 'partial', leadId };
      }

      // Step 2: Check SSL certificate
      const sslResult = await checkSsl(websiteUrl);
      await job.updateProgress(60);

      // Step 3: Calculate scoring
      const scrapedData = scrapeResult.data;
      const hasSocialMedia = !!(scrapedData.socialLinks.facebook || scrapedData.socialLinks.instagram);

      const scores = calculateDigitalScore({
        hasWebsite: true,
        hasValidSsl: sslResult.hasValidSsl,
        hasCustomDomain: scrapedData.hasCustomDomain,
        isResponsive: scrapedData.isResponsive,
        hasMetaOg: scrapedData.hasMetaOg,
        hasSocialMedia,
        hasWhatsApp: scrapedData.hasWhatsApp,
        googleRating: lead.googleRating,
        googleUserRatingsTotal: lead.googleUserRatingsTotal,
        hasCompleteProfile: !!(lead.internationalPhone),
      });

      await job.updateProgress(80);

      // Step 4: Update lead in database
      await prisma.lead.update({
        where: { id: leadId },
        data: {
          // Digital flags
          hasWebsite: true,
          hasValidSsl: sslResult.hasValidSsl,
          hasCustomDomain: scrapedData.hasCustomDomain,
          isResponsive: scrapedData.isResponsive,
          hasMetaOg: scrapedData.hasMetaOg,
          hasFacebook: !!scrapedData.socialLinks.facebook,
          hasInstagram: !!scrapedData.socialLinks.instagram,
          hasWhatsapp: scrapedData.hasWhatsApp,
          hasTiktok: !!scrapedData.socialLinks.tiktok,
          detectedEmails: scrapedData.emails,
          detectedCms: scrapedData.cms.cms,

          // Scores
          ...scores,

          // Status
          status: 'PROPOSAL_GENERATED',
          enrichedAt: new Date(),

          // Tailored proposal based on detected digital gaps
          aiDiagnosis: {
            digitalGapAnalysis: `${businessName} presenta las siguientes falencias detectadas en su presencia web: ${
              [
                !sslResult.hasValidSsl ? 'Sitio web inseguro (sin SSL HTTPS)' : null,
                !scrapedData.isResponsive ? 'Web no optimizada para celulares' : null,
                !scrapedData.hasWhatsApp ? 'Sin canal directo de WhatsApp' : null,
                !scrapedData.socialLinks.facebook && !scrapedData.socialLinks.instagram ? 'Presencia nula en redes sociales' : null,
                scrapedData.emails.length === 0 ? 'Sin correos de contacto corporativos visibles' : null,
              ]
                .filter(Boolean)
                .join(', ') || 'Falta de automatizaciones comerciales y embudo de conversión digital'
            }.`,
            highImpactServices: [
              !sslResult.hasValidSsl ? 'Seguridad Web SSL HTTPS y Optimización' : 'Rediseño Web UX de Alta Conversión',
              !scrapedData.hasWhatsApp ? 'Integración de WhatsApp Comercial y Agendador' : 'Estrategia de Captación Digital',
              'Posicionamiento SEO Local en Google Maps',
            ],
            outreachEmail: {
              subject: `${businessName}: Oportunidad de optimización web y captación de clientes`,
              body: `Estimado equipo de ${businessName},\n\nRealizamos una auditoría técnica de su presencia digital (${websiteUrl}) y encontramos áreas críticas de oportunidad para incrementar sus ventas y consultas.\n\nEn VERTEX modernizamos plataformas digitales y automatizamos canales de atención comercial.\n\n¿Tendrían disponibilidad de 10 minutos esta semana para una breve llamada demostrativa?\n\nSaludos cordiales,\nEquipo VERTEX`,
            },
            whatsappHook: `¡Hola ${businessName}! 👋 Analizamos su sitio web (${websiteUrl}) y vimos oportunidades clave para captar más clientes y optimizar su conversión online. ¿Le interesaría revisar el informe gratuito en 2 minutos? 📊`,
          } as any,

          // Raw data (JSONB for now, MongoDB in Phase 2)
          rawScrapedData: {
            meta: scrapedData.meta,
            socialLinks: scrapedData.socialLinks,
            cms: scrapedData.cms,
            ssl: sslResult,
            emails: scrapedData.emails,
            scrapedAt: scrapeResult.scrapedAt,
            method: scrapeResult.method,
          } as any,
        },
      });

      await job.updateProgress(100);

      console.log(
        `[EnrichmentWorker] Done: ${businessName} → Digital Score: ${scores.digitalScore}, Opportunity: ${scores.opportunityScore} (${scores.opportunityTier})`,
      );

      return { status: 'complete', leadId, scores };
    },
    {
      connection,
      concurrency,
      limiter: {
        max: 10,
        duration: 60000, // Max 10 jobs per minute to be respectful
      },
    },
  );

  worker.on('completed', (job) => {
    console.log(`[EnrichmentWorker] Job ${job.id} completed`);
  });

  worker.on('failed', (job, err) => {
    console.error(`[EnrichmentWorker] Job ${job?.id} failed:`, err.message);
  });

  return worker;
}
