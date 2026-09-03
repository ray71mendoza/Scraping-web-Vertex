// ═══════════════════════════════════════════════════════════
// VERTEX Prospect — robots.txt Parser
// ═══════════════════════════════════════════════════════════
// Parses and respects robots.txt directives for ethical scraping.

import axios from 'axios';

interface RobotsRule {
  userAgent: string;
  disallow: string[];
  allow: string[];
  crawlDelay: number | null;
}

/**
 * Fetches and parses the robots.txt file for a given domain.
 */
export async function fetchRobotsTxt(baseUrl: string): Promise<RobotsRule[]> {
  try {
    const url = new URL('/robots.txt', baseUrl).toString();
    const response = await axios.get(url, {
      timeout: 5000,
      headers: { 'User-Agent': 'VertexProspectBot/1.0' },
      validateStatus: (status) => status < 500,
    });

    if (response.status !== 200) {
      return []; // No robots.txt means everything is allowed
    }

    return parseRobotsTxt(response.data);
  } catch {
    return []; // On error, assume allowed
  }
}

/**
 * Parses robots.txt content into structured rules.
 */
export function parseRobotsTxt(content: string): RobotsRule[] {
  const rules: RobotsRule[] = [];
  let currentRule: RobotsRule | null = null;

  const lines = content.split('\n');

  for (const rawLine of lines) {
    const line = rawLine.trim();

    // Skip comments and empty lines
    if (!line || line.startsWith('#')) continue;

    const colonIdx = line.indexOf(':');
    if (colonIdx === -1) continue;

    const directive = line.substring(0, colonIdx).trim().toLowerCase();
    const value = line.substring(colonIdx + 1).trim();

    if (directive === 'user-agent') {
      currentRule = {
        userAgent: value,
        disallow: [],
        allow: [],
        crawlDelay: null,
      };
      rules.push(currentRule);
    } else if (currentRule) {
      switch (directive) {
        case 'disallow':
          if (value) currentRule.disallow.push(value);
          break;
        case 'allow':
          if (value) currentRule.allow.push(value);
          break;
        case 'crawl-delay':
          currentRule.crawlDelay = parseInt(value, 10) || null;
          break;
      }
    }
  }

  return rules;
}

/**
 * Checks if a given path is allowed for scraping based on robots.txt rules.
 * Respects the most specific matching rule.
 */
export function isPathAllowed(
  rules: RobotsRule[],
  path: string,
  userAgent = '*',
): boolean {
  // Find matching rules (specific user-agent first, then wildcard)
  const matchingRules = rules.filter(
    (r) => r.userAgent === userAgent || r.userAgent === '*',
  );

  if (matchingRules.length === 0) return true;

  for (const rule of matchingRules) {
    // Check allow rules first (more specific)
    for (const allowPath of rule.allow) {
      if (path.startsWith(allowPath)) return true;
    }

    // Check disallow rules
    for (const disallowPath of rule.disallow) {
      if (disallowPath === '/' || path.startsWith(disallowPath)) return false;
    }
  }

  return true;
}
