import { Injectable, NotFoundException } from '@nestjs/common';
import { prisma } from '@vertex/database';
import { GooglePlacesService } from '../google-places/google-places.service';
import { addDiscoveryJob } from '@vertex/queue';

@Injectable()
export class CampaignsService {
  constructor(private readonly googlePlaces: GooglePlacesService) {}

  async create(data: {
    organizationId: string;
    queryTerm: string;
    location: string;
    radiusMeters: number;
  }) {
    // Create campaign record
    const campaign = await prisma.searchCampaign.create({
      data: {
        organizationId: data.organizationId,
        queryTerm: data.queryTerm,
        location: data.location,
        radiusMeters: data.radiusMeters,
        status: 'RUNNING',
      },
    });

    // Search Google Places
    try {
      const places = await this.googlePlaces.textSearch(
        `${data.queryTerm} en ${data.location}`,
        data.radiusMeters,
        50,
      );

      // Enqueue discovery job to process places into leads
      if (places.length > 0) {
        await addDiscoveryJob({
          campaignId: campaign.id,
          organizationId: data.organizationId,
          places,
        });
      } else {
        await prisma.searchCampaign.update({
          where: { id: campaign.id },
          data: { status: 'COMPLETED', totalFound: 0 },
        });
      }

      return { ...campaign, placesFound: places.length };
    } catch (error) {
      await prisma.searchCampaign.update({
        where: { id: campaign.id },
        data: { status: 'FAILED' },
      });
      throw error;
    }
  }

  async findAll(organizationId: string) {
    return prisma.searchCampaign.findMany({
      where: { organizationId },
      orderBy: { createdAt: 'desc' },
      include: {
        _count: { select: { leads: true } },
      },
    });
  }

  async findById(id: string) {
    const campaign = await prisma.searchCampaign.findUnique({
      where: { id },
      include: {
        _count: { select: { leads: true } },
      },
    });

    if (!campaign) throw new NotFoundException('Campaign not found');
    return campaign;
  }

  async getStats(campaignId: string) {
    const leads = await prisma.lead.findMany({
      where: { campaignId },
      select: {
        opportunityTier: true,
        opportunityScore: true,
        status: true,
      },
    });

    const byTier = { VERY_HIGH: 0, HIGH: 0, MEDIUM: 0, LOW: 0 };
    const byStatus: Record<string, number> = {};
    let totalScore = 0;

    for (const lead of leads) {
      byTier[lead.opportunityTier]++;
      byStatus[lead.status] = (byStatus[lead.status] || 0) + 1;
      totalScore += lead.opportunityScore;
    }

    return {
      totalLeads: leads.length,
      byTier,
      byStatus,
      avgOpportunityScore: leads.length > 0 ? Math.round(totalScore / leads.length) : 0,
    };
  }
}
