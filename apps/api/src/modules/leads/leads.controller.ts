// ═══════════════════════════════════════════════════════════
// VERTEX Prospect — Leads Controller
// ═══════════════════════════════════════════════════════════

import { Controller, Get, Patch, Param, Query, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { LeadsService } from './leads.service';

@ApiTags('Leads')
@Controller('leads')
export class LeadsController {
  constructor(private readonly leadsService: LeadsService) {}

  @Get()
  @ApiOperation({ summary: 'List leads with advanced composable filters, sorting and pagination' })
  @ApiQuery({ name: 'campaignId', required: false })
  @ApiQuery({ name: 'organizationId', required: false })
  @ApiQuery({ name: 'sector', required: false })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'opportunityTier', required: false })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'hasWebsite', required: false })
  @ApiQuery({ name: 'hasValidSsl', required: false })
  @ApiQuery({ name: 'isResponsive', required: false })
  @ApiQuery({ name: 'hasWhatsapp', required: false })
  @ApiQuery({ name: 'contactChannel', required: false, enum: ['EMAIL', 'WHATSAPP', 'BOTH', 'NEITHER'] })
  @ApiQuery({ name: 'deliveryStatus', required: false })
  @ApiQuery({ name: 'minOpportunityScore', required: false })
  @ApiQuery({ name: 'maxOpportunityScore', required: false })
  @ApiQuery({ name: 'minDigitalNeed', required: false })
  @ApiQuery({ name: 'minServiceFit', required: false })
  @ApiQuery({ name: 'sortBy', required: false })
  @ApiQuery({ name: 'sortOrder', required: false, enum: ['asc', 'desc'] })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  async findAll(@Query() query: any) {
    return this.leadsService.findAll({
      campaignId: query.campaignId,
      organizationId: query.organizationId,
      sector: query.sector,
      status: query.status,
      opportunityTier: query.opportunityTier,
      search: query.search,
      hasWebsite: query.hasWebsite,
      hasValidSsl: query.hasValidSsl,
      isResponsive: query.isResponsive,
      hasWhatsapp: query.hasWhatsapp,
      contactChannel: query.contactChannel,
      deliveryStatus: query.deliveryStatus,
      minOpportunityScore: query.minOpportunityScore ? Number(query.minOpportunityScore) : undefined,
      maxOpportunityScore: query.maxOpportunityScore ? Number(query.maxOpportunityScore) : undefined,
      minDigitalNeed: query.minDigitalNeed ? Number(query.minDigitalNeed) : undefined,
      minServiceFit: query.minServiceFit ? Number(query.minServiceFit) : undefined,
      sortBy: query.sortBy,
      sortOrder: query.sortOrder,
      page: query.page ? Number(query.page) : undefined,
      limit: query.limit ? Number(query.limit) : undefined,
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get lead by ID with full details, audit findings and proposals' })
  async findOne(@Param('id') id: string) {
    return this.leadsService.findById(id);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Update lead status' })
  async updateStatus(
    @Param('id') id: string,
    @Body() body: { status: string },
  ) {
    return this.leadsService.updateStatus(id, body.status);
  }
}
