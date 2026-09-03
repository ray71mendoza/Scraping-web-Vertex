// ═══════════════════════════════════════════════════════════
// VERTEX Prospect — Social Links Extractor
// ═══════════════════════════════════════════════════════════
// Detects social media and messaging platform links in HTML.

export interface SocialLinksResult {
  facebook: string | null;
  instagram: string | null;
  tiktok: string | null;
  whatsapp: string | null;
  youtube: string | null;
  twitter: string | null;
  linkedin: string | null;
}

const SOCIAL_PATTERNS: Record<keyof SocialLinksResult, RegExp> = {
  facebook: /https?:\/\/(?:www\.)?facebook\.com\/[a-zA-Z0-9._\-/]+/i,
  instagram: /https?:\/\/(?:www\.)?instagram\.com\/[a-zA-Z0-9._\-/]+/i,
  tiktok: /https?:\/\/(?:www\.)?tiktok\.com\/@[a-zA-Z0-9._\-/]+/i,
  whatsapp: /https?:\/\/(?:wa\.me|api\.whatsapp\.com|chat\.whatsapp\.com)\/[a-zA-Z0-9._\-/?=&+]+/i,
  youtube: /https?:\/\/(?:www\.)?(?:youtube\.com|youtu\.be)\/[a-zA-Z0-9._\-/?=&+]+/i,
  twitter: /https?:\/\/(?:www\.)?(?:twitter\.com|x\.com)\/[a-zA-Z0-9._\-/]+/i,
  linkedin: /https?:\/\/(?:www\.)?linkedin\.com\/(?:company|in)\/[a-zA-Z0-9._\-/]+/i,
};

/**
 * Extracts social media links from HTML content.
 * Returns the first match found for each platform.
 */
export function extractSocialLinks(html: string): SocialLinksResult {
  const result: SocialLinksResult = {
    facebook: null,
    instagram: null,
    tiktok: null,
    whatsapp: null,
    youtube: null,
    twitter: null,
    linkedin: null,
  };

  for (const [platform, regex] of Object.entries(SOCIAL_PATTERNS)) {
    const match = html.match(regex);
    if (match) {
      result[platform as keyof SocialLinksResult] = match[0];
    }
  }

  return result;
}

/**
 * Detects if the page has a WhatsApp click-to-chat button or link.
 * Checks for wa.me links, WhatsApp widgets, and phone-based patterns.
 */
export function hasWhatsAppPresence(html: string): boolean {
  const whatsappPatterns = [
    /wa\.me\//i,
    /api\.whatsapp\.com/i,
    /chat\.whatsapp\.com/i,
    /whatsapp/i,
    /class="[^"]*whatsapp[^"]*"/i,
    /id="[^"]*whatsapp[^"]*"/i,
  ];

  return whatsappPatterns.some((pattern) => pattern.test(html));
}
