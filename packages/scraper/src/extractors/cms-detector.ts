// ═══════════════════════════════════════════════════════════
// VERTEX Prospect — CMS Detector
// ═══════════════════════════════════════════════════════════
// Detects the CMS/platform powering a website by analyzing
// HTML content, meta tags, and URL patterns.

export interface CmsDetectionResult {
  cms: string | null;
  confidence: 'high' | 'medium' | 'low';
  indicators: string[];
}

interface CmsPattern {
  name: string;
  patterns: RegExp[];
  confidence: 'high' | 'medium' | 'low';
}

const CMS_PATTERNS: CmsPattern[] = [
  {
    name: 'WordPress',
    patterns: [
      /wp-content\//i,
      /wp-includes\//i,
      /wp-json\//i,
      /<meta[^>]*name="generator"[^>]*content="WordPress[^"]*"/i,
      /class="[^"]*wp-block[^"]*"/i,
    ],
    confidence: 'high',
  },
  {
    name: 'Wix',
    patterns: [
      /wix\.com/i,
      /wixsite\.com/i,
      /_wix_browser_sess/i,
      /X-Wix-/i,
      /wixpress\.com/i,
    ],
    confidence: 'high',
  },
  {
    name: 'Squarespace',
    patterns: [
      /squarespace\.com/i,
      /sqsp\.net/i,
      /<meta[^>]*name="generator"[^>]*content="Squarespace"/i,
      /class="[^"]*sqsrte[^"]*"/i,
    ],
    confidence: 'high',
  },
  {
    name: 'Shopify',
    patterns: [
      /cdn\.shopify\.com/i,
      /myshopify\.com/i,
      /<meta[^>]*name="shopify/i,
      /Shopify\.theme/i,
    ],
    confidence: 'high',
  },
  {
    name: 'Webflow',
    patterns: [
      /webflow\.com/i,
      /class="[^"]*w-[^"]*"/i,
      /<meta[^>]*name="generator"[^>]*content="Webflow"/i,
    ],
    confidence: 'medium',
  },
  {
    name: 'Joomla',
    patterns: [
      /<meta[^>]*name="generator"[^>]*content="Joomla/i,
      /\/components\/com_/i,
      /\/modules\/mod_/i,
    ],
    confidence: 'high',
  },
  {
    name: 'Drupal',
    patterns: [
      /<meta[^>]*name="generator"[^>]*content="Drupal/i,
      /\/sites\/default\/files/i,
      /Drupal\.settings/i,
    ],
    confidence: 'high',
  },
  {
    name: 'Weebly',
    patterns: [
      /weebly\.com/i,
      /class="[^"]*weebly[^"]*"/i,
    ],
    confidence: 'high',
  },
  {
    name: 'GoDaddy Website Builder',
    patterns: [
      /godaddysites\.com/i,
      /img\.godaddy\.com/i,
    ],
    confidence: 'high',
  },
  {
    name: 'PrestaShop',
    patterns: [
      /<meta[^>]*name="generator"[^>]*content="PrestaShop"/i,
      /prestashop/i,
    ],
    confidence: 'medium',
  },
];

/**
 * Detects the CMS powering a website from its HTML content.
 * Returns the most likely CMS with confidence level.
 */
export function detectCms(html: string): CmsDetectionResult {
  for (const cms of CMS_PATTERNS) {
    const matchedIndicators: string[] = [];

    for (const pattern of cms.patterns) {
      if (pattern.test(html)) {
        matchedIndicators.push(pattern.source);
      }
    }

    if (matchedIndicators.length > 0) {
      return {
        cms: cms.name,
        confidence: matchedIndicators.length >= 2 ? 'high' : cms.confidence,
        indicators: matchedIndicators,
      };
    }
  }

  return {
    cms: null,
    confidence: 'low',
    indicators: [],
  };
}

/**
 * Checks if the detected CMS indicates a free/subdomain-based website
 * (not a custom domain, reducing the digital_score).
 */
export function isFreeHostingCms(cms: string | null): boolean {
  const freePlatforms = ['Wix', 'Weebly', 'GoDaddy Website Builder'];
  return cms !== null && freePlatforms.includes(cms);
}
