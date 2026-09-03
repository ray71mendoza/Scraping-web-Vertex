// ═══════════════════════════════════════════════════════════
// VERTEX Prospect — Shared Validators
// ═══════════════════════════════════════════════════════════

/**
 * Validates that a URL is well-formed and uses HTTP/HTTPS.
 */
export function isValidUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return ['http:', 'https:'].includes(parsed.protocol);
  } catch {
    return false;
  }
}

/**
 * Validates an email address format.
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email);
}

/**
 * Validates a Google Place ID format.
 */
export function isValidPlaceId(placeId: string): boolean {
  return /^ChIJ[a-zA-Z0-9_-]+$/.test(placeId) || placeId.startsWith('places/');
}

/**
 * Cleans and normalizes a phone number for WhatsApp deep linking.
 * Removes spaces, dashes, and parentheses. Keeps the + prefix.
 */
export function normalizePhoneForWhatsApp(phone: string): string {
  return phone.replace(/[\s\-()]/g, '').replace(/^\+/, '');
}

/**
 * Generates a WhatsApp deep link URL.
 */
export function generateWhatsAppLink(phone: string, message?: string): string {
  const normalized = normalizePhoneForWhatsApp(phone);
  const base = `https://wa.me/${normalized}`;
  if (message) {
    return `${base}?text=${encodeURIComponent(message)}`;
  }
  return base;
}

/**
 * Truncates text to a maximum length, adding ellipsis if needed.
 */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 3) + '...';
}
