// ═══════════════════════════════════════════════════════════
// @vertex/scraper — Barrel Export
// ═══════════════════════════════════════════════════════════

// Scrapers
export { scrapeWithCheerio, type ScrapingResult } from './cheerio-scraper';
export { scrapeWithPlaywright, closeBrowser } from './playwright-scraper';

// Extractors
export { extractEmails, extractMailtoEmails } from './extractors/email.extractor';
export { extractSocialLinks, hasWhatsAppPresence, type SocialLinksResult } from './extractors/social-links.extractor';
export { checkSsl, type SslCheckResult } from './extractors/ssl-checker';
export { detectCms, isFreeHostingCms, type CmsDetectionResult } from './extractors/cms-detector';
export { extractMetaTags, type MetaExtractionResult } from './extractors/meta-extractor';

// Audit Engine & SSRF Guard
export { executeBoundedAudit, type AuditExecutionOptions } from './audit-engine';
export { validateTargetUrl, type SsrfValidationResult } from './utils/ssrf-guard';

