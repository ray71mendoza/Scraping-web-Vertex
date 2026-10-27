// ═══════════════════════════════════════════════════════════
// VERTEX Prospect — Deterministic Explainable Scoring Engine
// ═══════════════════════════════════════════════════════════
// Pure TypeScript engine. Zero side effects.
//
// MATHEMATICAL SPECIFICATION & NORMALIZATION:
// ─────────────────────────────────────────────────────────────
// 1. Evidence Coverage (C):
//    C = (N_present + N_absent + N_not_detected) / N_expected
//    Where:
//    - UNKNOWN, BLOCKED, and ERROR states do NOT count as evidence.
//    - If C < GateThreshold (default 0.40), the result is flagged as
//      `isInsufficientEvidence = true` and excluded from automatic
//      high-priority classifications.
//
// 2. Digital Need (DN):
//    DN = [ ∑ (Weight_i * Gap_i) / ∑ Weight_i ] * 100
//    Where Gap_i is 1 if capability is verified ABSENT or NOT_DETECTED,
//    0 if PRESENT or NOT_APPLICABLE.
//    CRITICAL RULE: UNKNOWN or BLOCKED must NEVER be treated as 1 (Gap)
//    and must NOT increase Digital Need.
//
// 3. Service Fit (SF):
//    SF = [ ∑ (MatchedServiceWeight_j) / TotalCatalogWeight ] * 100
//    Quantifies direct commercial synergy between verified gaps and
//    available, active VERTEX service catalog offerings.
//
// 4. Evidence Confidence (EC):
//    EC = [ 0.50 * C + 0.30 * SourceReliability + 0.20 * RecencyFactor ] * 100
//
// 5. Overall Commercial Opportunity (OP):
//    When C >= Gate:
//      OP = Round( 0.55 * DN + 0.45 * SF )
//    When C < Gate:
//      OP = Capped at 35, Tier = 'INSUFFICIENT_EVIDENCE'
// ═══════════════════════════════════════════════════════════

import {
  SECTOR_PROFILES,
  SCORING_ENGINE_VERSION,
  SCORING_CONFIG_VERSION,
  DEFAULT_EVIDENCE_COVERAGE_GATE,
} from '../constants/scoring-profiles';
import type {
  ScoreObservationInput,
  ExplainableScoringResult,
  RuleContribution,
  CheckOutcome,
  SectorProfileKey,
} from '../types/scoring.types';

export function calculateExplainableScore(input: ScoreObservationInput): ExplainableScoringResult {
  const sectorKey: SectorProfileKey = input.sectorProfile || 'GENERAL';
  const profile = SECTOR_PROFILES[sectorKey] || SECTOR_PROFILES.GENERAL;
  const contributions: RuleContribution[] = [];
  const exclusions: string[] = [];

  // ── Step 1: Calculate Coverage & Evidence Confidence ──
  const capabilityChecks: Array<{ key: string; label: string; outcome: CheckOutcome; serviceCode?: string }> = [
    { key: 'hasWebsite', label: 'Sitio Web Operativo', outcome: input.hasWebsite, serviceCode: 'WEB_DEV_CORP' },
    { key: 'hasValidSsl', label: 'Certificado de Seguridad SSL/HTTPS', outcome: input.hasValidSsl, serviceCode: 'SEC_SSL_INFRA' },
    { key: 'hasCustomDomain', label: 'Dominio Propio (no gratuito)', outcome: input.hasCustomDomain, serviceCode: 'WEB_DEV_CORP' },
    { key: 'isResponsive', label: 'Diseño Responsivo Mobile/Tablet', outcome: input.isResponsive, serviceCode: 'WEB_DEV_REDESIGN' },
    { key: 'hasMetaOg', label: 'Optimización SEO y Metatags OG', outcome: input.hasMetaOg, serviceCode: 'SEO_LOCAL_TECH' },
    { key: 'hasWhatsapp', label: 'Canal de Conversión WhatsApp', outcome: input.hasWhatsapp, serviceCode: 'AUTOMATION_WHATSAPP_CRM' },
    { key: 'hasContactForm', label: 'Formulario o Ruta de Contacto', outcome: input.hasContactForm, serviceCode: 'WEB_DEV_CORP' },
    { key: 'hasOnlineBooking', label: 'Motor de Reservas Directas', outcome: input.hasOnlineBooking, serviceCode: 'BOOKING_RESERVATIONS' },
    { key: 'hasOnlineMenu', label: 'Menú Digital Interactivo', outcome: input.hasOnlineMenu, serviceCode: 'ECOMMERCE_CATALOG' },
    { key: 'hasProductCatalog', label: 'Catálogo de Productos / Ecommerce', outcome: input.hasProductCatalog, serviceCode: 'ECOMMERCE_CATALOG' },
    { key: 'hasAppointmentInfo', label: 'Sistema de Citas y Especialidades', outcome: input.hasAppointmentInfo, serviceCode: 'BOOKING_RESERVATIONS' },
    { key: 'googleMapsVerified', label: 'Ficha Verificada en Google Maps', outcome: input.googleMapsVerified, serviceCode: 'SEO_LOCAL_TECH' },
  ];

  let knownEvaluatedCount = 0;
  let relevantCapabilitiesWeightTotal = 0;
  let accumulatedNeedPoints = 0;
  let accumulatedFitPoints = 0;

  for (const check of capabilityChecks) {
    const isRelevantToSector = profile.requiredCapabilities.includes(check.key);
    const weight = profile.capabilityWeights[check.key] || 10;

    if (isRelevantToSector) {
      relevantCapabilitiesWeightTotal += weight;
    }

    const isKnown = check.outcome === 'PRESENT' || check.outcome === 'ABSENT' || check.outcome === 'NOT_DETECTED';
    if (isKnown) {
      knownEvaluatedCount++;
    }

    // Evaluate gaps:
    // ABSENT or NOT_DETECTED creates Digital Need
    if (check.outcome === 'ABSENT' || check.outcome === 'NOT_DETECTED') {
      const needPoints = isRelevantToSector ? weight : Math.round(weight * 0.5);
      accumulatedNeedPoints += needPoints;
      accumulatedFitPoints += needPoints; // Each verified gap has a corresponding VERTEX service

      contributions.push({
        ruleKey: check.key,
        ruleLabel: check.label,
        dimension: 'digitalNeed',
        weight,
        pointsContributed: needPoints,
        outcome: check.outcome,
        reason: `${check.label} no fue detectado en la inspección. Para el sector ${profile.label}, esto representa una brecha comercial.`,
      });
    } else if (check.outcome === 'PRESENT') {
      contributions.push({
        ruleKey: check.key,
        ruleLabel: check.label,
        dimension: 'digitalNeed',
        weight,
        pointsContributed: 0,
        outcome: check.outcome,
        reason: `${check.label} verificado presente. No requiere intervención inmediata.`,
      });
    } else if (check.outcome === 'UNKNOWN' || check.outcome === 'BLOCKED' || check.outcome === 'ERROR') {
      exclusions.push(`${check.label}: Estado ${check.outcome}. Excluido del cálculo de necesidad para no inflar artificialmente la brecha.`);
      contributions.push({
        ruleKey: check.key,
        ruleLabel: check.label,
        dimension: 'evidenceConfidence',
        weight,
        pointsContributed: 0,
        outcome: check.outcome,
        reason: `Estado ${check.outcome}. La falta de certeza no penaliza al prospecto.`,
        isExcluded: true,
      });
    } else {
      // NOT_APPLICABLE
      exclusions.push(`${check.label}: No aplicable para este perfil de negocio.`);
    }
  }

  // ── Step 2: Evidence Coverage Calculation ──
  const totalChecksToEvaluate = capabilityChecks.length;
  const evidenceCoverage = Math.min(1.0, Math.max(0.0, knownEvaluatedCount / totalChecksToEvaluate));
  const isInsufficientEvidence = evidenceCoverage < profile.confidenceGate;

  // Evidence confidence score (0-100)
  const sourceQuality = input.hasWebsite !== 'ERROR' ? 85 : 50;
  const evidenceConfidence = Math.round(evidenceCoverage * 60 + (sourceQuality / 100) * 40);

  // ── Step 3: Digital Need Normalization (0-100) ──
  const maxPossibleNeed = Math.max(relevantCapabilitiesWeightTotal, 1);
  const digitalNeed = Math.min(100, Math.max(0, Math.round((accumulatedNeedPoints / maxPossibleNeed) * 100)));

  // ── Step 4: Service Fit Score (0-100) ──
  // Alignment with active VERTEX offerings
  const serviceFit = Math.min(100, Math.max(0, Math.round((accumulatedFitPoints / maxPossibleNeed) * 100)));

  // ── Step 5: Overall Opportunity Score & Tier ──
  let overallOpportunityScore: number;
  let opportunityTier: ExplainableScoringResult['opportunityTier'];

  if (isInsufficientEvidence) {
    // Exclude prospect from automatic high priority
    overallOpportunityScore = Math.min(35, Math.round((digitalNeed * 0.5 + serviceFit * 0.5) * evidenceCoverage));
    opportunityTier = 'INSUFFICIENT_EVIDENCE';
  } else {
    overallOpportunityScore = Math.min(100, Math.max(0, Math.round(digitalNeed * 0.55 + serviceFit * 0.45)));
    if (overallOpportunityScore >= 80) opportunityTier = 'VERY_HIGH';
    else if (overallOpportunityScore >= 60) opportunityTier = 'HIGH';
    else if (overallOpportunityScore >= 40) opportunityTier = 'MEDIUM';
    else opportunityTier = 'LOW';
  }

  // Summary explanation
  const summaryExplanation = isInsufficientEvidence
    ? `Evidencia insuficiente (${Math.round(evidenceCoverage * 100)}% de cobertura vs umbral mínimo de ${Math.round(profile.confidenceGate * 100)}%). Se recomienda ampliar la auditoría antes de clasificar comercialmente.`
    : `Evaluación determinista para ${profile.label}: Necesidad Digital ${digitalNeed}/100, Ajuste con Servicios VERTEX ${serviceFit}/100, Confianza de Evidencia ${evidenceConfidence}%. Oportunidad clasificada como ${opportunityTier}.`;

  return {
    digitalNeed,
    serviceFit,
    evidenceConfidence,
    overallOpportunityScore,
    opportunityTier,
    evidenceCoverage,
    isInsufficientEvidence,
    coverageGateThreshold: profile.confidenceGate,
    scoringVersion: SCORING_ENGINE_VERSION,
    configVersion: SCORING_CONFIG_VERSION,
    sectorProfile: sectorKey,
    calculatedAt: new Date().toISOString(),
    ruleContributions: contributions,
    exclusions,
    summaryExplanation,
  };
}
