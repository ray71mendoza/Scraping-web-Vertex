// ═══════════════════════════════════════════════════════════
// VERTEX Prospect — Explainable Deterministic Scoring Engine
// ═══════════════════════════════════════════════════════════
// Replaces the single inverse maturity heuristic with 3 separately
// inspectable dimensions:
// 1. Digital Need (verified gaps relevant to sector)
// 2. Service Fit (alignment with active VERTEX catalog services)
// 3. Evidence Confidence (audit coverage, source quality, recency)

import { Injectable, NotFoundException } from '@nestjs/common';
import { prisma } from '@vertex/database';
import {
  calculateExplainableScore,
  detectSectorProfile,
  type ScoreObservationInput,
  type ExplainableScoringResult,
  type SectorProfileKey,
  type CheckOutcome,
  type ScoringInput,
  type ScoringResult,
} from '@vertex/shared';

@Injectable()
export class ScoringService {
  /**
   * Pure calculation: deterministic, zero side effects.
   */
  calculateScore(input: ScoreObservationInput): ExplainableScoringResult {
    return calculateExplainableScore(input);
  }

  /**
   * Calculates and persists the multi-dimensional explainable score for a lead.
   */
  async scoreLead(
    leadId: string,
    sectorOverride?: SectorProfileKey,
  ): Promise<ExplainableScoringResult> {
    const lead = await prisma.lead.findUnique({
      where: { id: leadId },
      include: { checkResults: true },
    });

    if (!lead) throw new NotFoundException(`Lead ${leadId} not found`);

    const sector: SectorProfileKey =
      sectorOverride ||
      detectSectorProfile(lead.businessTypes || [], lead.businessName);

    // Map check results or lead flags to check outcomes
    const getCheckOutcome = (checkKey: string, fallbackFlag: boolean): CheckOutcome => {
      const foundCheck = lead.checkResults.find((c) => c.checkKey.includes(checkKey));
      if (foundCheck) {
        return foundCheck.outcome as CheckOutcome;
      }
      return fallbackFlag ? 'PRESENT' : 'NOT_DETECTED';
    };

    const observations: ScoreObservationInput = {
      hasWebsite: getCheckOutcome('website', lead.hasWebsite),
      hasValidSsl: getCheckOutcome('ssl', lead.hasValidSsl),
      hasCustomDomain: getCheckOutcome('custom_domain', lead.hasCustomDomain),
      isResponsive: getCheckOutcome('responsive', lead.isResponsive),
      hasMetaOg: getCheckOutcome('opengraph', lead.hasMetaOg),
      hasSocialMedia: (lead.hasFacebook || lead.hasInstagram) ? 'PRESENT' : 'NOT_DETECTED',
      hasWhatsapp: getCheckOutcome('whatsapp', lead.hasWhatsapp),
      hasContactForm: (lead.detectedEmails?.length > 0) ? 'PRESENT' : 'NOT_DETECTED',
      hasOnlineBooking: getCheckOutcome('booking', false),
      hasOnlineMenu: getCheckOutcome('menu', false),
      hasProductCatalog: getCheckOutcome('catalog', false),
      hasAppointmentInfo: getCheckOutcome('appointment', false),
      hasStructuredData: 'UNKNOWN',
      googleRating: lead.googleRating,
      googleUserRatingsTotal: lead.googleUserRatingsTotal,
      googleMapsVerified: lead.googlePlaceId ? 'PRESENT' : 'UNKNOWN',
      performanceScoreMobile: null,
      performanceScoreDesktop: null,
      pagesInspectedCount: 1,
      pagesTargetedCount: 3,
      sectorProfile: sector,
      cmsName: lead.detectedCms,
      observationTimestamp: new Date().toISOString(),
    };

    const result = calculateExplainableScore(observations);

    // Persist to lead
    await prisma.lead.update({
      where: { id: leadId },
      data: {
        sector,
        digitalNeedScore: result.digitalNeed,
        serviceFitScore: result.serviceFit,
        evidenceConfidenceScore: result.evidenceConfidence,
        evidenceCoverage: result.evidenceCoverage,
        scoringVersion: result.scoringVersion,
        scoringExplanation: {
          summary: result.summaryExplanation,
          contributions: result.ruleContributions,
          exclusions: result.exclusions,
          isInsufficientEvidence: result.isInsufficientEvidence,
          coverageGate: result.coverageGateThreshold,
          calculatedAt: result.calculatedAt,
        } as any,
        digitalScore: 100 - result.digitalNeed, // for backward compatibility
        opportunityScore: result.overallOpportunityScore,
        opportunityTier: result.opportunityTier === 'INSUFFICIENT_EVIDENCE' ? 'LOW' : (result.opportunityTier as any),
      },
    });

    return result;
  }

  /**
   * Applies a manual score override with an immutable audit trail.
   */
  async manualScoreOverride(
    leadId: string,
    actor: string,
    reason: string,
    overrides: { digitalNeed?: number; serviceFit?: number },
  ) {
    const lead = await prisma.lead.findUnique({ where: { id: leadId } });
    if (!lead) throw new NotFoundException(`Lead ${leadId} not found`);

    const currentExplanation = (lead.scoringExplanation as any) || {};
    const manualAuditEntry = {
      actor,
      reason,
      timestamp: new Date().toISOString(),
      previousScores: {
        digitalNeed: lead.digitalNeedScore,
        serviceFit: lead.serviceFitScore,
      },
      newScores: overrides,
    };

    const updatedDigitalNeed = overrides.digitalNeed ?? lead.digitalNeedScore;
    const updatedServiceFit = overrides.serviceFit ?? lead.serviceFitScore;
    const newOpportunityScore = Math.round(updatedDigitalNeed * 0.55 + updatedServiceFit * 0.45);

    return prisma.lead.update({
      where: { id: leadId },
      data: {
        digitalNeedScore: updatedDigitalNeed,
        serviceFitScore: updatedServiceFit,
        opportunityScore: newOpportunityScore,
        scoringExplanation: {
          ...currentExplanation,
          manualOverrideAudit: [
            ...(currentExplanation.manualOverrideAudit || []),
            manualAuditEntry,
          ],
        } as any,
      },
    });
  }

  /**
   * Backward-compatible helper for legacy callers.
   */
  calculateDigitalScore(input: ScoringInput): ScoringResult {
    const observations: ScoreObservationInput = {
      hasWebsite: input.hasWebsite ? 'PRESENT' : 'ABSENT',
      hasValidSsl: input.hasValidSsl ? 'PRESENT' : 'NOT_DETECTED',
      hasCustomDomain: input.hasCustomDomain ? 'PRESENT' : 'NOT_DETECTED',
      isResponsive: input.isResponsive ? 'PRESENT' : 'NOT_DETECTED',
      hasMetaOg: input.hasMetaOg ? 'PRESENT' : 'NOT_DETECTED',
      hasSocialMedia: (input.hasFacebook || input.hasInstagram) ? 'PRESENT' : 'NOT_DETECTED',
      hasWhatsapp: input.hasWhatsapp ? 'PRESENT' : 'NOT_DETECTED',
      hasContactForm: 'UNKNOWN',
      hasOnlineBooking: 'UNKNOWN',
      hasOnlineMenu: 'UNKNOWN',
      hasProductCatalog: 'UNKNOWN',
      hasAppointmentInfo: 'UNKNOWN',
      hasStructuredData: 'UNKNOWN',
      googleRating: input.googleRating,
      googleUserRatingsTotal: input.googleUserRatingsTotal,
      googleMapsVerified: 'PRESENT',
      performanceScoreMobile: null,
      performanceScoreDesktop: null,
      pagesInspectedCount: 1,
      pagesTargetedCount: 1,
    };

    const res = calculateExplainableScore(observations);
    return {
      digitalScore: 100 - res.digitalNeed,
      opportunityScore: res.overallOpportunityScore,
      opportunityTier: res.opportunityTier === 'INSUFFICIENT_EVIDENCE' ? 'LOW' : (res.opportunityTier as any),
      breakdown: {
        webPresence: {
          hasWebsite: input.hasWebsite ? 15 : 0,
          hasSsl: input.hasValidSsl ? 5 : 0,
          hasCustomDomain: input.hasCustomDomain ? 10 : 0,
          isResponsive: input.isResponsive ? 5 : 0,
          hasMetaOg: input.hasMetaOg ? 5 : 0,
          subtotal: 40,
        },
        socialChannels: {
          hasSocialMedia: (input.hasFacebook || input.hasInstagram) ? 15 : 0,
          hasWhatsapp: input.hasWhatsapp ? 15 : 0,
          subtotal: 30,
        },
        reputation: {
          reviewsAbove20: (input.googleUserRatingsTotal || 0) > 20 ? 15 : 0,
          ratingAbove4: (input.googleRating || 0) > 4 ? 10 : 0,
          completeProfile: 5,
          subtotal: 30,
        },
        total: 100 - res.digitalNeed,
      },
    };
  }
}
