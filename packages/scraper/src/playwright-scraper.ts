// ═══════════════════════════════════════════════════════════
// VERTEX Prospect — Playwright Scraper (Dynamic / Full)
// ═══════════════════════════════════════════════════════════
// Headless Chromium scraping for JavaScript-heavy sites.
// Falls back to Cheerio on timeout or failure.

import { chromium, type Browser, type Page } from 'playwright';
import { getRandomUserAgent } from './utils/user-agents';
import { extractEmails, extractMailtoEmails } from './extractors/email.extractor';
import { extractSocialLinks, hasWhatsAppPresence } from './extractors/social-links.extractor';
import { extractMetaTags } from './extractors/meta-extractor';
import { detectCms } from './extractors/cms-detector';
import { FREE_HOSTING_DOMAINS } from '@vertex/shared';
import { scrapeWithCheerio, type ScrapingResult } from './cheerio-scraper';

let browserInstance: Browser | null = null;

/**
 * Gets or creates a shared browser instance.
 * Reuses the browser across multiple scrape calls for efficiency.
 */
async function getBrowser(): Promise<Browser> {
  if (browserInstance && browserInstance.isConnected()) {
    return browserInstance;
  }

  browserInstance = await chromium.launch({
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-gpu',
      '--disable-extensions',
      '--disable-background-networking',
      '--disable-default-apps',
      '--disable-sync',
      '--disable-translate',
      '--no-first-run',
      '--single-process',
    ],
  });

  return browserInstance;
}

/**
 * Checks if a URL uses a custom domain.
 */
function checkCustomDomain(url: string): boolean {
  try {
    const hostname = new URL(url).hostname.toLowerCase();
    return !FREE_HOSTING_DOMAINS.some((domain) => hostname.includes(domain));
  } catch {
    return false;
  }
}

/**
 * Performs a full dynamic scrape using Playwright (headless Chromium).
 * Waits for JavaScript to execute before extracting content.
 * Automatically falls back to Cheerio on timeout or crash.
 */
export async function scrapeWithPlaywright(
  url: string,
  timeoutMs = 8000,
): Promise<ScrapingResult> {
  let page: Page | null = null;

  try {
    const browser = await getBrowser();
    const context = await browser.newContext({
      userAgent: getRandomUserAgent(),
      viewport: { width: 1280, height: 720 },
      locale: 'es-CO',
      timezoneId: 'America/Bogota',
      ignoreHTTPSErrors: true,
    });

    page = await context.newPage();

    // Block unnecessary resources for speed
    await page.route('**/*', (route) => {
      const resourceType = route.request().resourceType();
      if (['image', 'media', 'font', 'stylesheet'].includes(resourceType)) {
        route.abort();
      } else {
        route.continue();
      }
    });

    // Navigate with timeout
    await page.goto(url, {
      waitUntil: 'domcontentloaded',
      timeout: timeoutMs,
    });

    // Wait a bit for dynamic content
    await page.waitForTimeout(1500);

    // Get the full rendered HTML
    const html = await page.content();

    // Extract all data from the rendered HTML
    const regexEmails = extractEmails(html);
    const mailtoEmails = extractMailtoEmails(html);
    const emails = [...new Set([...mailtoEmails, ...regexEmails])];

    const socialLinks = extractSocialLinks(html);
    const meta = extractMetaTags(html);
    const cms = detectCms(html);
    const hasWhatsApp = hasWhatsAppPresence(html);
    const hasCustomDomain = checkCustomDomain(url);
    const isResponsive = meta.isResponsive;
    const hasValidSsl = url.startsWith('https://');
    const hasMetaOg = meta.hasOpenGraph;

    await context.close();

    return {
      success: true,
      url,
      html,
      error: null,
      data: {
        emails,
        socialLinks,
        meta,
        cms,
        hasWhatsApp,
        hasCustomDomain,
        isResponsive,
        hasValidSsl,
        hasMetaOg,
      },
      scrapedAt: new Date().toISOString(),
      method: 'playwright',
    };
  } catch (err) {
    // Close the page on error
    if (page) {
      try {
        await page.context().close();
      } catch { /* ignore cleanup errors */ }
    }

    console.warn(
      `[PlaywrightScraper] Failed for ${url}: ${err instanceof Error ? err.message : 'Unknown error'}. Falling back to Cheerio.`,
    );

    // Fallback to Cheerio
    return scrapeWithCheerio(url, timeoutMs);
  }
}

/**
 * Gracefully closes the shared browser instance.
 * Should be called on worker shutdown.
 */
export async function closeBrowser(): Promise<void> {
  if (browserInstance) {
    await browserInstance.close();
    browserInstance = null;
  }
}
