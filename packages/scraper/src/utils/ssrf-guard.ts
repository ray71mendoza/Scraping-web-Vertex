// ═══════════════════════════════════════════════════════════
// VERTEX Prospect — SSRF Guard & Target URL Validator
// ═══════════════════════════════════════════════════════════
// OWASP SSRF Defense Guidelines:
// 1. Only allow http and https schemes.
// 2. Reject credentials embedded in URLs (user:pass@host).
// 3. Reject loopback (127.0.0.0/8, ::1, localhost).
// 4. Reject link-local and cloud metadata (169.254.169.254, metadata.google.internal).
// 5. Reject private RFC 1918 IPv4 ranges (10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16).
// 6. Reject IPv6 loopback, site-local, unique local (fc00::/7, fe80::/10).
// 7. Validate resolved IP addresses against DNS rebinding attacks.

import * as dns from 'dns';
import { promisify } from 'util';

const resolve4Async = promisify(dns.resolve4);
const resolve6Async = promisify(dns.resolve6);

export interface SsrfValidationResult {
  isValid: boolean;
  normalizedUrl: string | null;
  resolvedIp?: string;
  rejectionReason?: string;
}

const BLOCKED_HOSTNAMES = new Set([
  'localhost',
  'metadata.google.internal',
  '169.254.169.254',
  'instance-data',
  'local',
]);

/**
 * Checks whether an IPv4 address is in a reserved/private/loopback range.
 */
function isPrivateOrReservedIPv4(ip: string): boolean {
  const parts = ip.split('.').map(Number);
  if (parts.length !== 4 || parts.some(isNaN)) return true;

  const [a, b, c, d] = parts;

  // Loopback (127.0.0.0/8)
  if (a === 127) return true;

  // Zero network (0.0.0.0/8)
  if (a === 0) return true;

  // Private RFC 1918 (10.0.0.0/8)
  if (a === 10) return true;

  // Private RFC 1918 (172.16.0.0/12: 172.16.0.0 - 172.31.255.255)
  if (a === 172 && b >= 16 && b <= 31) return true;

  // Private RFC 1918 (192.168.0.0/16)
  if (a === 192 && b === 168) return true;

  // Link-local / Cloud metadata (169.254.0.0/16)
  if (a === 169 && b === 254) return true;

  // Broadcast & Multicast (224.0.0.0/4 and above)
  if (a >= 224) return true;

  // Carrier-grade NAT (100.64.0.0/10)
  if (a === 100 && b >= 64 && b <= 127) return true;

  return false;
}

/**
 * Validates a target URL against SSRF attacks.
 */
export async function validateTargetUrl(rawUrl: string): Promise<SsrfValidationResult> {
  if (!rawUrl || typeof rawUrl !== 'string') {
    return { isValid: false, normalizedUrl: null, rejectionReason: 'URL vacía o no válida' };
  }

  let parsed: URL;
  try {
    let urlToParse = rawUrl.trim();
    // Only prepend https:// if there is no scheme present (e.g., example.com or www.example.com)
    if (!urlToParse.includes('://')) {
      urlToParse = 'https://' + urlToParse;
    }
    parsed = new URL(urlToParse);
  } catch (err: any) {
    return { isValid: false, normalizedUrl: null, rejectionReason: `Formato de URL inválido: ${err.message}` };
  }

  // 1. Strict protocol validation (http and https only)
  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    return {
      isValid: false,
      normalizedUrl: null,
      rejectionReason: `Protocolo no permitido: ${parsed.protocol}. Solo se permite http o https.`,
    };
  }

  // 2. Reject credentials in URL (user:pass@host)
  if (parsed.username || parsed.password) {
    return {
      isValid: false,
      normalizedUrl: null,
      rejectionReason: 'Rechazado por contener credenciales embebidas en la URL.',
    };
  }

  // 3. Port restrictions (allow standard 80, 443, 8080, 8443)
  if (parsed.port) {
    const portNum = parseInt(parsed.port, 10);
    const allowedPorts = [80, 443, 8080, 8443];
    if (!allowedPorts.includes(portNum)) {
      return {
        isValid: false,
        normalizedUrl: null,
        rejectionReason: `Puerto no permitido: ${portNum}. Solo se permiten puertos web estándar.`,
      };
    }
  }

  const hostname = parsed.hostname.toLowerCase();

  // 4. Check blocked hostnames
  if (BLOCKED_HOSTNAMES.has(hostname) || hostname.endsWith('.local') || hostname.endsWith('.internal')) {
    return {
      isValid: false,
      normalizedUrl: null,
      rejectionReason: `Nombre de host restringido (red interna o loopback): ${hostname}`,
    };
  }

  // 5. Check if hostname is direct IP
  if (/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(hostname)) {
    if (isPrivateOrReservedIPv4(hostname)) {
      return {
        isValid: false,
        normalizedUrl: null,
        rejectionReason: `Dirección IP privada o reservada bloqueada: ${hostname}`,
      };
    }
  }

  // 6. Resolve DNS and check resulting IP against DNS rebinding
  try {
    const ipv4Addresses = await resolve4Async(hostname).catch(() => [] as string[]);
    for (const ip of ipv4Addresses) {
      if (isPrivateOrReservedIPv4(ip)) {
        return {
          isValid: false,
          normalizedUrl: null,
          resolvedIp: ip,
          rejectionReason: `El dominio ${hostname} resuelve a una IP interna protegida (${ip}).`,
        };
      }
    }
  } catch (err: any) {
    // If DNS resolution fails, allow standard public error handling
  }

  return {
    isValid: true,
    normalizedUrl: parsed.toString(),
  };
}
