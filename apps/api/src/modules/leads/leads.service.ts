// ═══════════════════════════════════════════════════════════
// VERTEX Prospect — Leads Service with Advanced Filters
// ═══════════════════════════════════════════════════════════

import { Injectable, NotFoundException } from '@nestjs/common';
import { prisma } from '@vertex/database';
import { normalizePhoneToE164 } from '@vertex/shared';

export interface LeadAdvancedFilterDto {
  campaignId?: string;
  organizationId?: string;
  sector?: string;
  status?: string;
  opportunityTier?: string;
  search?: string;
  hasWebsite?: string; // 'true' | 'false' | 'all'
  hasValidSsl?: string; // 'true' | 'false'
  isResponsive?: string;
  hasWhatsapp?: string;
  contactChannel?: string; // 'EMAIL', 'WHATSAPP', 'BOTH', 'NEITHER'
  deliveryStatus?: string; // 'NOT_SENT', 'ACCEPTED', 'SENT', 'DELIVERED', 'FAILED'
  minOpportunityScore?: number;
  maxOpportunityScore?: number;
  minDigitalNeed?: number;
  minServiceFit?: number;
  isInsufficientEvidence?: string; // 'true' | 'false'
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

@Injectable()
export class LeadsService {
  async findAll(filters: LeadAdvancedFilterDto) {
    const {
      campaignId,
      organizationId,
      sector,
      status,
      opportunityTier,
      search,
      hasWebsite,
      hasValidSsl,
      isResponsive,
      hasWhatsapp,
      contactChannel,
      deliveryStatus,
      minOpportunityScore,
      maxOpportunityScore,
      minDigitalNeed,
      minServiceFit,
      sortBy = 'opportunityScore',
      sortOrder = 'desc',
      page = 1,
      limit = 25,
    } = filters;

    const where: any = {};

    if (campaignId && campaignId !== 'ALL') where.campaignId = campaignId;
    if (organizationId) where.organizationId = organizationId;
    if (sector && sector !== 'ALL') where.sector = sector;
    if (status && status !== 'ALL') where.status = status as any;
    if (opportunityTier && opportunityTier !== 'ALL') where.opportunityTier = opportunityTier as any;

    if (search) {
      where.OR = [
        { businessName: { contains: search, mode: 'insensitive' } },
        { formattedAddress: { contains: search, mode: 'insensitive' } },
        { websiteUrl: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Digital flags
    if (hasWebsite === 'true') where.hasWebsite = true;
    else if (hasWebsite === 'false') where.hasWebsite = false;

    if (hasValidSsl === 'true') where.hasValidSsl = true;
    else if (hasValidSsl === 'false') where.hasValidSsl = false;

    if (isResponsive === 'true') where.isResponsive = true;
    else if (isResponsive === 'false') where.isResponsive = false;

    if (hasWhatsapp === 'true') where.hasWhatsapp = true;
    else if (hasWhatsapp === 'false') where.hasWhatsapp = false;

    // Delivery state
    if (deliveryStatus && deliveryStatus !== 'ALL') {
      where.deliveryStatus = deliveryStatus;
    }

    // Scoring numeric ranges
    if (minOpportunityScore !== undefined || maxOpportunityScore !== undefined) {
      where.opportunityScore = {};
      if (minOpportunityScore !== undefined) where.opportunityScore.gte = Number(minOpportunityScore);
      if (maxOpportunityScore !== undefined) where.opportunityScore.lte = Number(maxOpportunityScore);
    }

    if (minDigitalNeed !== undefined) {
      where.digitalNeedScore = { gte: Number(minDigitalNeed) };
    }
    if (minServiceFit !== undefined) {
      where.serviceFitScore = { gte: Number(minServiceFit) };
    }

    // Contact availability filter
    if (contactChannel === 'EMAIL') {
      where.detectedEmails = { isEmpty: false };
    } else if (contactChannel === 'WHATSAPP') {
      where.internationalPhone = { not: null };
    } else if (contactChannel === 'BOTH') {
      where.detectedEmails = { isEmpty: false };
      where.internationalPhone = { not: null };
    } else if (contactChannel === 'NEITHER') {
      where.detectedEmails = { isEmpty: true };
      where.internationalPhone = null;
    }

    const orderBy: any = {};
    const validSortFields = [
      'opportunityScore',
      'digitalScore',
      'digitalNeedScore',
      'serviceFitScore',
      'evidenceConfidenceScore',
      'businessName',
      'createdAt',
      'googleRating',
    ];
    if (validSortFields.includes(sortBy)) {
      orderBy[sortBy] = sortOrder;
    } else {
      orderBy.opportunityScore = 'desc';
    }

    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      prisma.lead.findMany({
        where,
        orderBy,
        skip,
        take: limit,
      }),
      prisma.lead.count({ where }),
    ]);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findById(id: string) {
    const lead = await prisma.lead.findUnique({
      where: { id },
      include: {
        checkResults: true,
        findings: true,
        proposals: { orderBy: { version: 'desc' }, take: 1 },
        deliveryIntents: { orderBy: { createdAt: 'desc' }, take: 5 },
      },
    });
    if (!lead) throw new NotFoundException('Lead not found');
    return lead;
  }

  async updateStatus(id: string, status: string) {
    return prisma.lead.update({
      where: { id },
      data: { status: status as any },
    });
  }

  /**
   * Location-aware deduplication check:
   * When discovering a business, checks if canonical place ID already exists.
   * If exists, links to campaign without duplicating the canonical business or delivery history.
   */
  async deduplicateOrRegisterLead(placeData: {
    campaignId: string;
    organizationId: string;
    placeId: string;
    businessName: string;
    formattedAddress?: string | null;
    phone?: string | null;
    websiteUri?: string | null;
    rating?: number | null;
    userRatingCount?: number | null;
    types?: string[];
  }) {
    const existing = await prisma.lead.findUnique({
      where: { googlePlaceId: placeData.placeId },
    });

    const phoneNorm = normalizePhoneToE164(placeData.phone, 'CO');

    if (existing) {
      // Preserve history, branch location, and previous outreach
      return {
        lead: existing,
        isNew: false,
        message: 'Lugar canónico existente reutilizado sin duplicar entregas.',
      };
    }

    // Create new canonical prospect
    const newLead = await prisma.lead.create({
      data: {
        campaignId: placeData.campaignId,
        organizationId: placeData.organizationId,
        googlePlaceId: placeData.placeId,
        canonicalPlaceId: placeData.placeId,
        businessName: placeData.businessName,
        formattedAddress: placeData.formattedAddress,
        internationalPhone: phoneNorm.e164 || placeData.phone,
        websiteUrl: placeData.websiteUri,
        googleRating: placeData.rating,
        googleUserRatingsTotal: placeData.userRatingCount,
        businessTypes: placeData.types || [],
        hasWebsite: Boolean(placeData.websiteUri),
        status: 'DISCOVERED',
        deliveryStatus: 'NOT_SENT',
      },
    });

    return {
      lead: newLead,
      isNew: true,
      message: 'Nuevo prospecto canónico registrado.',
    };
  }

  async getCountsByStatus(campaignId: string) {
    const leads = await prisma.lead.groupBy({
      by: ['status'],
      where: { campaignId },
      _count: true,
    });
    return leads;
  }
}
