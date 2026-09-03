// ═══════════════════════════════════════════════════════════
// VERTEX Prospect — Cheerio Scraper (Static / Fast)
// ═══════════════════════════════════════════════════════════
// Ultra-fast static HTML scraping using axios + cheerio.
// Used as the primary scraper for most sites and as a fallback
// when Playwright times out or fails.

import axios from 'axios';
import * as cheerio from 'cheerio';
import { getRandomUserAgent } from './utils/user-agents';
import { extractEmails, extractMailtoEmails } from './extractors/email.extractor';
import { extractSocialLinks, hasWhatsAppPresence } from './extractors/social-links.extractor';
import { extractMetaTags } from './extractors/meta-extractor';
import { detectCms } from './extractors/cms-detector';
import { FREE_HOSTING_DOMAINS } from '@vertex/shared';

export interface ScrapingResult {
  success: boolean;
  url: string;
  html: string | null;
  error: string | null;
  data: {
    emails: string[];
    socialLinks: ReturnType<typeof extractSocialLinks>;
    meta: ReturnType<typeof extractMetaTags>;
    cms: ReturnType<typeof detectCms>;
    hasWhatsApp: boolean;
    hasCustomDomain: boolean;
    isResponsive: boolean;
    hasValidSsl: boolean;
    hasMetaOg: boolean;
  } | null;
  scrapedAt: string;
  method: 'cheerio' | 'playwright';
}

/**
 * Checks if a URL uses a custom domain (not a free hosting subdomain).
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
 * Performs a static scrape of a URL using axios + cheerio.
 * Extracts all digital maturity indicators in a single pass.
 */
export async function scrapeWithCheerio(
  url: string,
  timeoutMs = 8000,
): Promise<ScrapingResult> {
  try {
    const response = await axios.get(url, {
      timeout: timeoutMs,
      headers: {
        'User-Agent': getRandomUserAgent(),
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'es-CO,es;q=0.9,en;q=0.8',
        'Accept-Encoding': 'gzip, deflate',
        'Connection': 'keep-alive',
      },
      maxRedirects: 3,
      validateStatus: (status) => status < 400,
    });

    const html = typeof response.data === 'string' ? response.data : String(response.data);
    const $ = cheerio.load(html);

    // Extract all data
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
      method: 'cheerio',
    };
  } catch (err) {
    return {
      success: false,
      url,
      html: null,
      error: err instanceof Error ? err.message : 'Unknown error during Cheerio scrape',
      data: null,
      scrapedAt: new Date().toISOString(),
      method: 'cheerio',
    };
  }
}
