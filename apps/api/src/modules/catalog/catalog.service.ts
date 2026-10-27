// ═══════════════════════════════════════════════════════════
// VERTEX Prospect — Service Catalog Service
// ═══════════════════════════════════════════════════════════

import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { prisma } from '@vertex/database';
import { DEFAULT_VERTEX_SERVICE_CATALOG, type ServiceCatalogItemDto } from '@vertex/shared';

@Injectable()
export class CatalogService implements OnModuleInit {
  private readonly logger = new Logger(CatalogService.name);

  async onModuleInit() {
    await this.seedDefaultsIfNeeded();
  }

  /**
   * Seeds default VERTEX service offerings if table is empty.
   */
  async seedDefaultsIfNeeded(orgId = '00000000-0000-0000-0000-000000000001') {
    try {
      const count = await prisma.serviceCatalogItem.count();
      if (count === 0) {
        this.logger.log('Seeding initial VERTEX service catalog...');
        for (const item of DEFAULT_VERTEX_SERVICE_CATALOG) {
          await prisma.serviceCatalogItem.create({
            data: {
              organizationId: orgId,
              code: item.code,
              name: item.name,
              category: item.category,
              description: item.description,
              applicableSectors: item.applicableSectors,
              requiredCheckKeys: item.requiredCheckKeys,
              deliverables: item.deliverables,
              exclusions: item.exclusions,
              dependencies: item.dependencies,
              pricingModel: item.pricingModel,
              basePrice: item.basePrice,
              currency: item.currency,
              estimatedDurationDays: item.estimatedDurationDays,
              isActive: item.isActive,
              version: item.version,
            },
          });
        }
        this.logger.log(`Seeded ${DEFAULT_VERTEX_SERVICE_CATALOG.length} catalog items`);
      }
    } catch (err: any) {
      this.logger.warn(`Could not seed catalog items (db might not be connected): ${err.message}`);
    }
  }

  /**
   * Returns all active catalog items.
   */
  async findAll() {
    try {
      const items = await prisma.serviceCatalogItem.findMany({
        where: { isActive: true },
        orderBy: { code: 'asc' },
      });
      if (items.length > 0) return items;
    } catch {
      // fallback to in-memory defaults
    }
    return DEFAULT_VERTEX_SERVICE_CATALOG;
  }

  /**
   * Returns eligible services for a given list of missing/failed check keys and sector.
   */
  async findEligibleServices(checkKeys: string[], sector?: string) {
    const all = await this.findAll();
    return all.filter((item) => {
      // Sector match (if item specifies applicable sectors)
      if (sector && item.applicableSectors.length > 0 && !item.applicableSectors.includes(sector)) {
        return false;
      }
      // Check if any required check key matches
      if (item.requiredCheckKeys.length === 0) return true;
      return item.requiredCheckKeys.some((reqKey) =>
        checkKeys.some((k) => k.toLowerCase().includes(reqKey.toLowerCase())),
      );
    });
  }

  /**
   * Updates pricing or details for a catalog item.
   */
  async update(id: string, data: Partial<ServiceCatalogItemDto>) {
    return prisma.serviceCatalogItem.update({
      where: { id },
      data: {
        name: data.name,
        description: data.description,
        basePrice: data.basePrice,
        currency: data.currency,
        estimatedDurationDays: data.estimatedDurationDays,
        isActive: data.isActive,
        deliverables: data.deliverables,
        exclusions: data.exclusions,
        dependencies: data.dependencies,
        version: { increment: 1 },
      },
    });
  }
}
