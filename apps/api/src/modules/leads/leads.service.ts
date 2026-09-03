import { Injectable, NotFoundException } from '@nestjs/common';
import { prisma, Prisma } from '@vertex/database';

@Injectable()
export class LeadsService {
  async findAll(filters: {
    campaignId?: string;
    organizationId?: string;
    status?: string;
    opportunityTier?: string;
    search?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    page?: number;
    limit?: number;
  }) {
    const {
      campaignId,
      organizationId,
      status,
      opportunityTier,
      search,
      sortBy = 'opportunityScore',
      sortOrder = 'desc',
      page = 1,
      limit = 20,
    } = filters;

    const where: Prisma.LeadWhereInput = {};
    if (campaignId) where.campaignId = campaignId;
    if (organizationId) where.organizationId = organizationId;
    if (status) where.status = status as any;
    if (opportunityTier) where.opportunityTier = opportunityTier as any;
    if (search) {
      where.businessName = { contains: search, mode: 'insensitive' };
    }

    const orderBy: Prisma.LeadOrderByWithRelationInput = {};
    const validSortFields = ['opportunityScore', 'digitalScore', 'businessName', 'createdAt', 'googleRating'];
    if (validSortFields.includes(sortBy)) {
      (orderBy as any)[sortBy] = sortOrder;
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
    const lead = await prisma.lead.findUnique({ where: { id } });
    if (!lead) throw new NotFoundException('Lead not found');
    return lead;
  }

  async updateStatus(id: string, status: string) {
    return prisma.lead.update({
      where: { id },
      data: { status: status as any },
    });
  }

  async update(id: string, data: Partial<{
    status: string;
    aiDiagnosis: any;
    notes: string;
  }>) {
    const updateData: any = {};
    if (data.status) updateData.status = data.status;
    if (data.aiDiagnosis) updateData.aiDiagnosis = data.aiDiagnosis;

    return prisma.lead.update({
      where: { id },
      data: updateData,
    });
  }

  async getCountsByStatus(campaignId: string) {
    const leads = await prisma.lead.groupBy({
      by: ['status'],
      where: { campaignId },
      _count: true,
    });

    return leads.reduce(
      (acc, item) => {
        acc[item.status] = item._count;
        return acc;
      },
      {} as Record<string, number>,
    );
  }
}
