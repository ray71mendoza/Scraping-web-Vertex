// ═══════════════════════════════════════════════════════════
// VERTEX Prospect — Service Catalog Controller
// ═══════════════════════════════════════════════════════════

import { Controller, Get, Patch, Post, Param, Body } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { CatalogService } from './catalog.service';

@ApiTags('Service Catalog')
@Controller('catalog')
export class CatalogController {
  constructor(private readonly catalogService: CatalogService) {}

  @Get()
  @ApiOperation({ summary: 'List all active VERTEX service catalog offerings' })
  async findAll() {
    return this.catalogService.findAll();
  }

  @Post('seed')
  @ApiOperation({ summary: 'Seed default catalog services' })
  async seed() {
    await this.catalogService.seedDefaultsIfNeeded();
    return { success: true, message: 'Catálogo de servicios VERTEX inicializado.' };
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update catalog service price, duration or deliverables' })
  async update(@Param('id') id: string, @Body() body: any) {
    return this.catalogService.update(id, body);
  }
}
