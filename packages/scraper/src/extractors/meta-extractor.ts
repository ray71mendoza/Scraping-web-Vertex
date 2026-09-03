// ═══════════════════════════════════════════════════════════
// VERTEX Prospect — Meta Tag Extractor
// ═══════════════════════════════════════════════════════════
// Extracts meta tags, OpenGraph data, viewport (responsive),
// and PWA manifest presence from HTML content.

export interface MetaExtractionResult {
  title: string | null;
  description: string | null;
  hasOpenGraph: boolean;
  openGraph: {
    title: string | null;
    description: string | null;
    image: string | null;
    type: string | null;
  };
  hasViewport: boolean;
  viewportContent: string | null;
  hasPwaManifest: boolean;
  isResponsive: boolean;
  favicon: string | null;
  canonicalUrl: string | null;
  language: string | null;
}

/**
 * Extracts meta tags, OpenGraph data, and responsiveness indicators from HTML.
 */
export function extractMetaTags(html: string): MetaExtractionResult {
  const getMetaContent = (name: string): string | null => {
    const regex = new RegExp(
      `<meta[^>]*(?:name|property)=["']${name}["'][^>]*content=["']([^"']*)["']|<meta[^>]*content=["']([^"']*)["'][^>]*(?:name|property)=["']${name}["']`,
      'i',
    );
    const match = html.match(regex);
    return match ? (match[1] || match[2] || null) : null;
  };

  // Title
  const titleMatch = html.match(/<title[^>]*>([^<]*)<\/title>/i);
  const title = titleMatch ? titleMatch[1].trim() : null;

  // Description
  const description = getMetaContent('description');

  // OpenGraph
  const ogTitle = getMetaContent('og:title');
  const ogDescription = getMetaContent('og:description');
  const ogImage = getMetaContent('og:image');
  const ogType = getMetaContent('og:type');
  const hasOpenGraph = !!(ogTitle || ogDescription || ogImage);

  // Viewport (responsive indicator)
  const viewportMatch = html.match(
    /<meta[^>]*name=["']viewport["'][^>]*content=["']([^"']*)["']/i,
  );
  const hasViewport = !!viewportMatch;
  const viewportContent = viewportMatch ? viewportMatch[1] : null;

  // PWA Manifest
  const hasPwaManifest = /<link[^>]*rel=["']manifest["']/i.test(html);

  // Responsive check: has viewport with width=device-width
  const isResponsive =
    hasViewport &&
    (viewportContent?.includes('width=device-width') || false) ||
    hasPwaManifest;

  // Favicon
  const faviconMatch = html.match(
    /<link[^>]*rel=["'](?:shortcut )?icon["'][^>]*href=["']([^"']*)["']/i,
  );
  const favicon = faviconMatch ? faviconMatch[1] : null;

  // Canonical URL
  const canonicalMatch = html.match(
    /<link[^>]*rel=["']canonical["'][^>]*href=["']([^"']*)["']/i,
  );
  const canonicalUrl = canonicalMatch ? canonicalMatch[1] : null;

  // Language
  const langMatch = html.match(/<html[^>]*lang=["']([^"']*)["']/i);
  const language = langMatch ? langMatch[1] : null;

  return {
    title,
    description,
    hasOpenGraph,
    openGraph: {
      title: ogTitle,
      description: ogDescription,
      image: ogImage,
      type: ogType,
    },
    hasViewport,
    viewportContent,
    hasPwaManifest,
    isResponsive,
    favicon,
    canonicalUrl,
    language,
  };
}
