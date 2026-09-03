// ═══════════════════════════════════════════════════════════
// VERTEX Prospect — Email Extractor
// ═══════════════════════════════════════════════════════════
// Extracts corporate email addresses from HTML content using
// regex patterns and mailto: link detection.

/**
 * Extracts unique email addresses from raw HTML content.
 * Filters out common false positives (image extensions, example domains).
 */
export function extractEmails(html: string): string[] {
  const emailRegex = /[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/g;
  const matches = html.match(emailRegex) || [];

  // Filter out false positives
  const blacklistDomains = [
    'example.com',
    'sentry.io',
    'wixpress.com',
    'w3.org',
    'schema.org',
    'googleusercontent.com',
    'gstatic.com',
  ];

  const blacklistExtensions = ['.png', '.jpg', '.jpeg', '.gif', '.svg', '.webp', '.css', '.js'];

  const uniqueEmails = [...new Set(matches)]
    .map((email) => email.toLowerCase().trim())
    .filter((email) => {
      // Skip blacklisted domains
      if (blacklistDomains.some((domain) => email.endsWith(`@${domain}`))) {
        return false;
      }
      // Skip file extensions disguised as emails
      if (blacklistExtensions.some((ext) => email.endsWith(ext))) {
        return false;
      }
      // Must have a valid TLD
      const tld = email.split('.').pop();
      if (!tld || tld.length < 2 || tld.length > 10) {
        return false;
      }
      return true;
    });

  return uniqueEmails;
}

/**
 * Extracts emails specifically from mailto: links in HTML.
 * These are higher confidence than regex-scraped emails.
 */
export function extractMailtoEmails(html: string): string[] {
  const mailtoRegex = /mailto:([a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,})/gi;
  const matches: string[] = [];
  let match: RegExpExecArray | null;

  while ((match = mailtoRegex.exec(html)) !== null) {
    matches.push(match[1].toLowerCase().trim());
  }

  return [...new Set(matches)];
}
