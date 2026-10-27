// ═══════════════════════════════════════════════════════════
// VERTEX Prospect — Proposals Controller
// ═══════════════════════════════════════════════════════════

import { Controller, Get, Post, Param } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { ProposalsService } from './proposals.service';

@ApiTags('Proposals')
@Controller('proposals')
export class ProposalsController {
  constructor(private readonly proposalsService: ProposalsService) {}

  @Get(':leadId')
  @ApiOperation({ summary: 'Get current commercial proposal for a lead' })
  async getProposal(@Param('leadId') leadId: string) {
    return this.proposalsService.getLatestProposal(leadId);
  }

  @Post('generate/:leadId')
  @ApiOperation({ summary: 'Generate a new version of commercial proposal from findings' })
  async generate(@Param('leadId') leadId: string) {
    return this.proposalsService.generateProposal(leadId);
  }
}
