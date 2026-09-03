// ═══════════════════════════════════════════════════════════
// VERTEX Prospect — Deterministic Scoring Engine
// ═══════════════════════════════════════════════════════════
// Pure TypeScript scoring function. No side effects.
// digital_score: 0-100 (maturity detected)
// opportunity_score = 100 - digital_score (VERTEX opportunity)

import { Injectable } from '@nestjs/common';
import { SCORING_WEIGHTS, type OpportunityLevel } from '@vertex/shared';
import type { ScoringInput, ScoringResult, ScoringBreakdown } from '@vertex/shared';

@Injectable()
export class ScoringService {
  /**
   * Calculates the digital maturity score for a lead.
   * Higher score = more digitally mature business.
   * Lower score = higher opportunity for VERTEX.
   */
  calculateDigitalScore(input: ScoringInput): ScoringResult {
    const breakdown = this.buildBreakdown(input);

    const digitalScore = breakdown.total;
    const opportunityScore = 100 - digitalScore;
    const opportunityTier = this.getTier(opportunityScore);

    return {
      digitalScore,
      opportunityScore,
      opportunityTier,
      breakdown,
    };
  }

  /**
   * Builds a detailed breakdown of the scoring by category.
   */
  private buildBreakdown(input: ScoringInput): ScoringBreakdown {
    // Web Presence (40 pts max)
    const hasWebsite = input.hasWebsite ? SCORING_WEIGHTS.WEB_PRESENCE.HAS_WEBSITE : 0;
    const hasSsl = input.hasValidSsl ? SCORING_WEIGHTS.WEB_PRESENCE.HAS_SSL : 0;
    const hasCustomDomain = input.hasCustomDomain ? SCORING_WEIGHTS.WEB_PRESENCE.HAS_CUSTOM_DOMAIN : 0;
    const isResponsive = input.isResponsive ? SCORING_WEIGHTS.WEB_PRESENCE.IS_RESPONSIVE_PWA : 0;
    const hasMetaOg = input.hasMetaOg ? SCORING_WEIGHTS.WEB_PRESENCE.HAS_META_OG : 0;
    const webSubtotal = hasWebsite + hasSsl + hasCustomDomain + isResponsive + hasMetaOg;

    // Social Channels (30 pts max)
    const hasSocialMedia =
      input.hasFacebook || input.hasInstagram
        ? SCORING_WEIGHTS.SOCIAL_CHANNELS.HAS_SOCIAL_MEDIA
        : 0;
    const hasWhatsapp = input.hasWhatsapp ? SCORING_WEIGHTS.SOCIAL_CHANNELS.HAS_WHATSAPP : 0;
    const socialSubtotal = hasSocialMedia + hasWhatsapp;

    // Reputation (30 pts max)
    const reviewsAbove20 =
      input.googleUserRatingsTotal && input.googleUserRatingsTotal > 20
        ? SCORING_WEIGHTS.REPUTATION.REVIEWS_ABOVE_20
        : 0;
    const ratingAbove4 =
      input.googleRating && input.googleRating > 4.0
        ? SCORING_WEIGHTS.REPUTATION.RATING_ABOVE_4
        : 0;
    const completeProfile = input.hasCompleteProfile
      ? SCORING_WEIGHTS.REPUTATION.COMPLETE_PROFILE
      : 0;
    const reputationSubtotal = reviewsAbove20 + ratingAbove4 + completeProfile;

    return {
      webPresence: {
        hasWebsite,
        hasSsl,
        hasCustomDomain,
        isResponsive,
        hasMetaOg,
        subtotal: webSubtotal,
      },
      socialChannels: {
        hasSocialMedia,
        hasWhatsapp,
        subtotal: socialSubtotal,
      },
      reputation: {
        reviewsAbove20,
        ratingAbove4,
        completeProfile,
        subtotal: reputationSubtotal,
      },
      total: webSubtotal + socialSubtotal + reputationSubtotal,
    };
  }

  /**
   * Determines the opportunity tier based on the opportunity score.
   */
  private getTier(opportunityScore: number): OpportunityLevel {
    if (opportunityScore >= 80) return 'VERY_HIGH' as OpportunityLevel;
    if (opportunityScore >= 60) return 'HIGH' as OpportunityLevel;
    if (opportunityScore >= 40) return 'MEDIUM' as OpportunityLevel;
    return 'LOW' as OpportunityLevel;
  }
}
