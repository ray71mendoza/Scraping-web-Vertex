// ═══════════════════════════════════════════════════════════
// VERTEX Prospect — Proxy Rotator
// ═══════════════════════════════════════════════════════════
// Configurable proxy rotation interface. By default, operates
// in direct mode (no proxy). Enable by setting PROXY_LIST env.

export interface ProxyConfig {
  host: string;
  port: number;
  protocol: 'http' | 'https' | 'socks5';
  auth?: {
    username: string;
    password: string;
  };
}

let proxyPool: ProxyConfig[] = [];
let proxyIndex = 0;

/**
 * Initializes the proxy pool from a comma-separated list of proxy URLs.
 * Format: protocol://user:pass@host:port or protocol://host:port
 */
export function initProxyPool(proxyListStr?: string): void {
  const list = proxyListStr || process.env.PROXY_LIST || '';

  if (!list.trim()) {
    proxyPool = [];
    return;
  }

  proxyPool = list
    .split(',')
    .map((proxyUrl) => proxyUrl.trim())
    .filter(Boolean)
    .map((proxyUrl): ProxyConfig | null => {
      try {
        const parsed = new URL(proxyUrl);
        return {
          host: parsed.hostname,
          port: parseInt(parsed.port, 10) || 8080,
          protocol: (parsed.protocol.replace(':', '') as ProxyConfig['protocol']) || 'http',
          auth: parsed.username
            ? {
                username: decodeURIComponent(parsed.username),
                password: decodeURIComponent(parsed.password || ''),
              }
            : undefined,
        };
      } catch {
        console.warn(`[ProxyRotator] Invalid proxy URL skipped: ${proxyUrl}`);
        return null;
      }
    })
    .filter((p): p is ProxyConfig => p !== null);

  console.log(`[ProxyRotator] Initialized with ${proxyPool.length} proxies`);
}

/**
 * Returns the next proxy in round-robin order.
 * Returns null if no proxies are configured (direct mode).
 */
export function getNextProxy(): ProxyConfig | null {
  if (proxyPool.length === 0) return null;
  const proxy = proxyPool[proxyIndex % proxyPool.length];
  proxyIndex++;
  return proxy;
}

/**
 * Returns a random proxy from the pool.
 * Returns null if no proxies are configured.
 */
export function getRandomProxy(): ProxyConfig | null {
  if (proxyPool.length === 0) return null;
  return proxyPool[Math.floor(Math.random() * proxyPool.length)];
}

/**
 * Returns true if proxies are configured and available.
 */
export function hasProxies(): boolean {
  return proxyPool.length > 0;
}

/**
 * Converts a ProxyConfig to a URL string for use with HTTP clients.
 */
export function proxyToUrl(proxy: ProxyConfig): string {
  const auth = proxy.auth ? `${proxy.auth.username}:${proxy.auth.password}@` : '';
  return `${proxy.protocol}://${auth}${proxy.host}:${proxy.port}`;
}
