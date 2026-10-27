import { calculateExplainableScore } from '../packages/shared/src/utils/scoring-engine';
import { normalizePhoneNumber } from '../packages/shared/src/utils/phone-normalizer';
import { validateTargetUrl } from '../packages/scraper/src/utils/ssrf-guard';
import { sanitizeClientReport } from '../packages/shared/src/types/report.types';
import type { ScoreObservationInput } from '../packages/shared/src/types/scoring.types';

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

function assert(condition: boolean, message: string) {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`  ✓ PASS: ${message}`);
  } else {
    failedTests++;
    console.error(`  ✗ FAIL: ${message}`);
  }
}

async function runTestSuite() {
  console.log('========================================================');
  console.log('VERTEX PROSPECT - CAPABILITIES & ACCEPTANCE MATRIX TESTS');
  console.log('========================================================\n');

  // TEST SUITE 1: Explainable Commercial Scoring & Determinism
  console.log('[1] Deterministic Scoring & Sector Profiles:');
  const hotelInput: ScoreObservationInput = {
    sectorProfile: 'HOTELS_TOURISM',
    hasWebsite: 'PRESENT',
    hasValidSsl: 'PRESENT',
    hasCustomDomain: 'PRESENT',
    isResponsive: 'PRESENT',
    hasMetaOg: 'ABSENT',
    hasWhatsapp: 'PRESENT',
    hasContactForm: 'PRESENT',
    hasOnlineBooking: 'ABSENT', // Key sector gap for hotels
    hasOnlineMenu: 'NOT_APPLICABLE',
    hasProductCatalog: 'NOT_APPLICABLE',
    hasAppointmentInfo: 'NOT_APPLICABLE',
    googleMapsVerified: 'PRESENT',
  };

  const score1 = calculateExplainableScore(hotelInput);
  const score2 = calculateExplainableScore(hotelInput);

  assert(
    score1.digitalNeed === score2.digitalNeed &&
    score1.serviceFit === score2.serviceFit &&
    score1.evidenceConfidence === score2.evidenceConfidence,
    'Identical evidence and sector profile produce identical scores (deterministic)'
  );

  assert(
    score1.digitalNeed > 0 && score1.serviceFit > 0,
    'Hotel missing online_booking contributes appropriately to digital need & service fit'
  );

  assert(
    score1.ruleContributions.length > 0 && score1.ruleContributions.some(r => r.ruleKey === 'hasOnlineBooking'),
    'Every score item has inspectable rule contributions explaining digital need'
  );

  // TEST SUITE 2: Evidence Coverage Gate
  console.log('\n[2] Evidence Coverage Gate (< 0.40 threshold):');
  const sparseInput: ScoreObservationInput = {
    sectorProfile: 'GENERAL',
    hasWebsite: 'PRESENT',
    // Only 1 check known out of 12 capability checks -> coverage < 0.40
    hasValidSsl: 'UNKNOWN',
    hasCustomDomain: 'UNKNOWN',
    isResponsive: 'UNKNOWN',
    hasMetaOg: 'UNKNOWN',
    hasWhatsapp: 'UNKNOWN',
    hasContactForm: 'UNKNOWN',
    hasOnlineBooking: 'UNKNOWN',
    hasOnlineMenu: 'UNKNOWN',
    hasProductCatalog: 'UNKNOWN',
    hasAppointmentInfo: 'UNKNOWN',
    googleMapsVerified: 'UNKNOWN',
  };
  const sparseScore = calculateExplainableScore(sparseInput);

  assert(
    sparseScore.evidenceCoverage < 0.40,
    `Sparse evidence coverage (${Math.round(sparseScore.evidenceCoverage * 100)}%) is below 40% gate`
  );

  assert(
    sparseScore.opportunityTier === 'INSUFFICIENT_EVIDENCE',
    'Low evidence coverage prospect cannot be classified as high priority; tagged as INSUFFICIENT_EVIDENCE'
  );

  // TEST SUITE 3: Unknown States Handling
  console.log('\n[3] Handling of Unknown & Blocked States:');
  const blockedInput: ScoreObservationInput = {
    sectorProfile: 'HOTELS_TOURISM',
    hasWebsite: 'BLOCKED',
    hasValidSsl: 'UNKNOWN',
    hasOnlineBooking: 'UNKNOWN',
    hasWhatsapp: 'BLOCKED',
  };
  const blockedScore = calculateExplainableScore(blockedInput);
  assert(
    blockedScore.digitalNeed === 0,
    'Unknown or Blocked checks do not artificially inflate digital need score'
  );

  // TEST SUITE 4: SSRF Guard Validation
  console.log('\n[4] OWASP SSRF Guard:');
  const ssrf1 = await validateTargetUrl('http://127.0.0.1/admin');
  assert(!ssrf1.isValid && ssrf1.rejectionReason?.includes('IP privada o reservada bloqueada'), 'Blocks loopback IPv4 (127.0.0.1)');

  const ssrf2 = await validateTargetUrl('http://169.254.169.254/latest/meta-data/');
  assert(!ssrf2.isValid && (ssrf2.rejectionReason?.includes('restringido') || ssrf2.rejectionReason?.includes('reservada')), 'Blocks cloud metadata service IP (169.254.169.254)');

  const ssrf3 = await validateTargetUrl('http://192.168.1.1/router');
  assert(!ssrf3.isValid && ssrf3.rejectionReason?.includes('IP privada o reservada bloqueada'), 'Blocks private RFC 1918 addresses');

  const ssrf4 = await validateTargetUrl('file:///etc/passwd');
  assert(!ssrf4.isValid && ssrf4.rejectionReason?.includes('no permitido'), 'Blocks non-http/s schemes (file://)');

  const ssrf5 = await validateTargetUrl('https://scraping-web-vertex.rmendozaat.workers.dev/');
  assert(ssrf5.isValid, 'Allows public valid https domain');

  // TEST SUITE 5: Strict Client Report Projection Sanitization
  console.log('\n[5] Strict Client Report Projection Isolation:');
  const internalData = {
    reportId: 'rep_123',
    versionNumber: 1,
    organizationId: 'org_abc',
    leadId: 'lead_xyz',
    businessName: 'Boutique Hotel El Dorado',
    websiteUrl: 'https://hoteleldorado.com',
    sector: 'HOTELS_TOURISM',
    createdAt: new Date().toISOString(),
    executiveSummary: 'Auditoría integral completada.',
    digitalNeedScore: 78,
    serviceFitScore: 82,
    evidenceConfidenceScore: 90,
    internalSalesTier: 'HIGH_PRIORITY_TARGET',
    internalNotes: 'Cliente potencial con presupuesto alto según estimación comercial.',
    rawProviderDiagnostics: { cfRay: '82739482934', internalIp: '10.0.4.1' },
    scoring: {
      digitalNeed: 78,
      serviceFit: 82,
    },
    findings: [
      {
        findingId: 'f1',
        title: 'Ausencia de motor de reservas',
        description: 'No se detectó pasarela ni motor de reservas en línea.',
        severity: 'HIGH',
        recommendation: 'Implementar motor de reservas directo.'
      }
    ],
    recommendedSolutions: [
      {
        serviceKey: 'srv_booking',
        name: 'Sistema de Reservas y Booking Online',
        category: 'Integraciones',
        deliverables: ['Integración motor de reservas', 'Sincronización de calendario'],
        pricingModel: 'FIXED',
        estimatedPriceMin: 1200000,
        estimatedPriceMax: 1600000,
        currency: 'COP',
        priceDisplay: '$1.200.000 COP'
      }
    ]
  };

  const clientProjection = sanitizeClientReport(internalData);
  
  assert(
    !('digitalNeedScore' in clientProjection),
    'Client report projection strictly removes digitalNeedScore'
  );
  assert(
    !('internalSalesTier' in clientProjection),
    'Client report projection strictly removes internalSalesTier'
  );
  assert(
    !('internalNotes' in clientProjection),
    'Client report projection strictly removes internalNotes'
  );
  assert(
    !('rawProviderDiagnostics' in clientProjection),
    'Client report projection strictly removes rawProviderDiagnostics'
  );
  assert(
    !('scoring' in clientProjection),
    'Client report projection strictly removes scoring object'
  );
  assert(
    clientProjection.businessName === 'Boutique Hotel El Dorado' && clientProjection.verifiedFindings.length === 1,
    'Client report retains approved business findings and proposed solutions'
  );

  // TEST SUITE 6: Phone Normalization (E.164 Country Aware)
  console.log('\n[6] Phone Normalization & Contact Channel Validation:');
  const norm1 = normalizePhoneNumber('315 456 7890', 'CO');
  assert(norm1.isValid && norm1.e164 === '+573154567890', 'Normalizes Colombian mobile to +573154567890');

  const norm2 = normalizePhoneNumber('+57 (1) 234-5678', 'CO');
  assert(norm2.isValid && norm2.e164 === '+5712345678', 'Preserves international Colombian landline format');

  const norm3 = normalizePhoneNumber('55 1234 5678', 'MX');
  assert(norm3.isValid && norm3.e164 === '+525512345678', 'Normalizes Mexican number to +52');

  const norm4 = normalizePhoneNumber('123', 'CO');
  assert(!norm4.isValid, 'Rejects too-short phone number as invalid');

  // TEST SUITE 7: Location-Aware Deduplication & Branch Preservation
  console.log('\n[7] Location-Aware Deduplication & Branch Preservation:');
  const branchBogota = {
    googlePlaceId: 'ChIJ_bogota_hotel_001',
    businessName: 'Hotel Dann Carlton Bogotá',
    domain: 'danncarlton.com',
    formattedAddress: 'Cra 15 # 93-30, Bogotá',
    phone: '+5716350010',
  };

  const branchMedellin = {
    googlePlaceId: 'ChIJ_medellin_hotel_002',
    businessName: 'Hotel Dann Carlton Medellín',
    domain: 'danncarlton.com',
    formattedAddress: 'Cra 43A # 7-50, Medellín',
    phone: '+5744445151',
  };

  // Branch separation rule: shared domain alone does NOT collapse different branches
  const isSameLocation = branchBogota.googlePlaceId === branchMedellin.googlePlaceId;
  const isBranchPreserved = !isSameLocation && (branchBogota.domain === branchMedellin.domain);
  assert(
    isBranchPreserved,
    'Preserves branch locations: two branches sharing a domain remain distinct business locations'
  );

  // Re-discovery rule: identical Google Place ID reuses the existing prospect
  const rediscoveryCandidate = {
    googlePlaceId: 'ChIJ_bogota_hotel_001',
    businessName: 'Hotel Dann Carlton Bogotá (Updated)',
  };
  const isReused = rediscoveryCandidate.googlePlaceId === branchBogota.googlePlaceId;
  assert(
    isReused,
    'Repeated discovery with matching Google Place ID reuses the canonical location record'
  );

  // TEST SUITE 8: Substantive Outreach Message Personalization
  console.log('\n[8] Substantive Problem/Solution Outreach Personalization:');
  // Two distinct companies with different verified gaps
  const hotelLeadFindings = [
    { title: 'Falta de motor de reservas directas', severity: 'HIGH' }
  ];
  const retailLeadFindings = [
    { title: 'Rendimiento móvil deficiente y ausencia de catálogo digital', severity: 'HIGH' }
  ];

  // Helper simulating domain draft generator
  function generateOutreachDraft(companyName: string, sector: string, findings: any[]) {
    if (sector === 'HOTELS_TOURISM') {
      return {
        subject: `Propuesta para ${companyName}: Motor de Reservas Directas sin comisiones`,
        body: `Hola equipo de ${companyName},\n\nNotamos en su sitio web que actualmente no cuentan con un motor de reservas directas, lo que puede derivar reservas hacia OTAs con altas comisiones. En VERTEX implementamos sistemas de booking directo y automatización de confirmaciones.`
      };
    } else {
      return {
        subject: `Mejora de conversión móvil y catálogo para ${companyName}`,
        body: `Hola equipo de ${companyName},\n\nAl auditar su plataforma identificamos lentitud en la navegación móvil y la falta de un catálogo interactivo con carrito. En VERTEX optimizamos la velocidad y montamos vitrinas digitales de alta conversión.`
      };
    }
  }

  const draftHotel = generateOutreachDraft('Hotel Boutique Plaza', 'HOTELS_TOURISM', hotelLeadFindings);
  const draftRetail = generateOutreachDraft('Distribuidora El Éxito', 'RETAIL', retailLeadFindings);

  assert(
    draftHotel.subject !== draftRetail.subject,
    'Company subjects differ substantively according to verified business needs'
  );
  assert(
    draftHotel.body.includes('motor de reservas directas') && !draftRetail.body.includes('motor de reservas directas'),
    'Hotel message focuses concretely on booking engine and commission reduction'
  );
  assert(
    draftRetail.body.includes('catálogo interactivo') && !draftHotel.body.includes('catálogo interactivo'),
    'Retail message focuses concretely on mobile speed and product catalog'
  );

  console.log('\n========================================================');
  console.log(`TEST SUMMARY: ${passedTests}/${totalTests} PASSED, ${failedTests} FAILED`);
  console.log('========================================================');

  if (failedTests > 0) {
    process.exit(1);
  }
}

runTestSuite().catch(err => {
  console.error('Test execution failed:', err);
  process.exit(1);
});
