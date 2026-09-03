import { Injectable } from '@nestjs/common';
import { prisma } from '@vertex/database';

@Injectable()
export class OrganizationsService {
  async findById(id: string) {
    return prisma.organization.findUnique({ where: { id } });
  }

  async update(id: string, data: { name?: string; apiQuotaLimit?: number }) {
    return prisma.organization.update({ where: { id }, data });
  }

  async getQuotaUsage(id: string) {
    const org = await prisma.organization.findUnique({ where: { id } });
    if (!org) return null;
    return {
      limit: org.apiQuotaLimit,
      used: org.apiQuotaUsed,
      remaining: org.apiQuotaLimit - org.apiQuotaUsed,
    };
  }

  async incrementQuotaUsed(id: string, amount = 1) {
    return prisma.organization.update({
      where: { id },
      data: { apiQuotaUsed: { increment: amount } },
    });
  }
}
