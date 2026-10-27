// ═══════════════════════════════════════════════════════════
// VERTEX Prospect — Country-Aware Phone Normalizer (E.164)
// ═══════════════════════════════════════════════════════════

export interface CountryPhoneConfig {
  code: string; // ISO 2-letter
  dialCode: string; // e.g. "+57"
  name: string;
  nationalPrefix?: string;
  expectedLength: number; // typical national length without country code
}

export const SUPPORTED_COUNTRIES: CountryPhoneConfig[] = [
  { code: 'CO', dialCode: '+57', name: 'Colombia', expectedLength: 10 },
  { code: 'MX', dialCode: '+52', name: 'México', expectedLength: 10 },
  { code: 'US', dialCode: '+1', name: 'Estados Unidos', expectedLength: 10 },
  { code: 'ES', dialCode: '+34', name: 'España', expectedLength: 9 },
  { code: 'PE', dialCode: '+51', name: 'Perú', expectedLength: 9 },
  { code: 'CL', dialCode: '+56', name: 'Chile', expectedLength: 9 },
  { code: 'AR', dialCode: '+54', name: 'Argentina', expectedLength: 10 },
];

/**
 * Normalizes a raw phone number into strict E.164 format (+[countryCode][number]).
 * Never silently assumes all numbers are Colombian unless explicitly specified or defaulting.
 */
export function normalizePhoneToE164(
  rawPhone: string | null | undefined,
  defaultCountryCode = 'CO',
): {
  isValid: boolean;
  e164: string | null;
  displayFormatted: string | null;
  countryCode: string;
  error?: string;
} {
  if (!rawPhone || !rawPhone.trim()) {
    return {
      isValid: false,
      e164: null,
      displayFormatted: null,
      countryCode: defaultCountryCode,
      error: 'Número de teléfono vacío',
    };
  }

  // Strip spaces, dashes, parentheses, dots
  let cleaned = rawPhone.replace(/[^\d+]/g, '');

  const country =
    SUPPORTED_COUNTRIES.find((c) => c.code === defaultCountryCode) ||
    SUPPORTED_COUNTRIES[0]; // fallback CO

  // If already starts with '+', verify country dial code
  if (cleaned.startsWith('+')) {
    const digitsOnly = cleaned.substring(1);
    // Find matching country
    const matchedCountry = SUPPORTED_COUNTRIES.find((c) =>
      digitsOnly.startsWith(c.dialCode.replace('+', '')),
    );

    if (digitsOnly.length >= 8 && digitsOnly.length <= 15) {
      return {
        isValid: true,
        e164: `+${digitsOnly}`,
        displayFormatted: `+${digitsOnly}`,
        countryCode: matchedCountry?.code || defaultCountryCode,
      };
    }
  }

  // If starts with 00 (international prefix), replace with +
  if (cleaned.startsWith('00')) {
    cleaned = '+' + cleaned.substring(2);
    return normalizePhoneToE164(cleaned, defaultCountryCode);
  }

  // Local/national format:
  // For Colombia: 10 digits starting with 3 (mobile) or 60 (landline)
  const digitsOnly = cleaned.replace(/\D/g, '');

  if (country.code === 'CO') {
    if (digitsOnly.length === 10 && digitsOnly.startsWith('3')) {
      const e164 = `+57${digitsOnly}`;
      return {
        isValid: true,
        e164,
        displayFormatted: `+57 ${digitsOnly.slice(0, 3)} ${digitsOnly.slice(3, 6)} ${digitsOnly.slice(6)}`,
        countryCode: 'CO',
      };
    }
    if (digitsOnly.length === 10 && digitsOnly.startsWith('60')) {
      const e164 = `+57${digitsOnly}`;
      return {
        isValid: true,
        e164,
        displayFormatted: `+57 ${digitsOnly.slice(0, 3)} ${digitsOnly.slice(3, 6)} ${digitsOnly.slice(6)}`,
        countryCode: 'CO',
      };
    }
    // Already includes 57 prefix without +
    if (digitsOnly.length === 12 && digitsOnly.startsWith('57')) {
      const e164 = `+${digitsOnly}`;
      return {
        isValid: true,
        e164,
        displayFormatted: `+57 ${digitsOnly.slice(2, 5)} ${digitsOnly.slice(5, 8)} ${digitsOnly.slice(8)}`,
        countryCode: 'CO',
      };
    }
  }

  // Generic country formatting with expected length
  if (digitsOnly.length === country.expectedLength) {
    const e164 = `${country.dialCode}${digitsOnly}`;
    return {
      isValid: true,
      e164,
      displayFormatted: `${country.dialCode} ${digitsOnly}`,
      countryCode: country.code,
    };
  }

  // If length is reasonable, format with default country
  if (digitsOnly.length >= 7 && digitsOnly.length <= 12) {
    const e164 = `${country.dialCode}${digitsOnly}`;
    return {
      isValid: true,
      e164,
      displayFormatted: `${country.dialCode} ${digitsOnly}`,
      countryCode: country.code,
    };
  }

  return {
    isValid: false,
    e164: null,
    displayFormatted: rawPhone,
    countryCode: country.code,
    error: `Longitud de número no estándar (${digitsOnly.length} dígitos)`,
  };
}

export const normalizePhoneNumber = normalizePhoneToE164;
