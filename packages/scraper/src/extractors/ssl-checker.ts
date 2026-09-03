// ═══════════════════════════════════════════════════════════
// VERTEX Prospect — SSL Checker
// ═══════════════════════════════════════════════════════════
// Validates SSL/TLS certificates for target websites.

import https from 'https';

export interface SslCheckResult {
  hasValidSsl: boolean;
  issuer: string | null;
  validFrom: string | null;
  validTo: string | null;
  error: string | null;
}

/**
 * Checks if a URL has a valid SSL certificate.
 * Uses a lightweight HTTPS HEAD request with a strict timeout.
 */
export async function checkSsl(url: string, timeoutMs = 5000): Promise<SslCheckResult> {
  return new Promise((resolve) => {
    try {
      const parsedUrl = new URL(url);

      if (parsedUrl.protocol !== 'https:') {
        resolve({
          hasValidSsl: false,
          issuer: null,
          validFrom: null,
          validTo: null,
          error: 'URL does not use HTTPS',
        });
        return;
      }

      const req = https.request(
        {
          hostname: parsedUrl.hostname,
          port: 443,
          path: '/',
          method: 'HEAD',
          timeout: timeoutMs,
          rejectUnauthorized: true,
        },
        (res) => {
          const socket = res.socket as any;
          const cert = socket?.getPeerCertificate?.();

          if (cert && Object.keys(cert).length > 0) {
            resolve({
              hasValidSsl: true,
              issuer: cert.issuer?.O || cert.issuer?.CN || null,
              validFrom: cert.valid_from || null,
              validTo: cert.valid_to || null,
              error: null,
            });
          } else {
            resolve({
              hasValidSsl: true,
              issuer: null,
              validFrom: null,
              validTo: null,
              error: null,
            });
          }
        },
      );

      req.on('error', (err) => {
        resolve({
          hasValidSsl: false,
          issuer: null,
          validFrom: null,
          validTo: null,
          error: err.message,
        });
      });

      req.on('timeout', () => {
        req.destroy();
        resolve({
          hasValidSsl: false,
          issuer: null,
          validFrom: null,
          validTo: null,
          error: 'SSL check timed out',
        });
      });

      req.end();
    } catch (err) {
      resolve({
        hasValidSsl: false,
        issuer: null,
        validFrom: null,
        validTo: null,
        error: err instanceof Error ? err.message : 'Unknown error',
      });
    }
  });
}
