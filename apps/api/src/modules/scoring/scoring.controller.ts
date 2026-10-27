// ═══════════════════════════════════════════════════════════
// VERTEX Prospect — Scoring Controller
// ═══════════════════════════════════════════════════════════

import { Controller, Post, Get, Param, Body, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { ScoringService } from './scoring.service';
import type { SectorProfileKey } from '@vertex/shared';

@ApiTags('Scoring Engine')
@Controller('scoring')
export class ScoringController {
  constructor(private readonly scoringService: ScoringService) {}

  @Post('recalculate/:leadId')
  @ApiOperation({ summary: 'Recalculate explainable score for a lead with sector profile' })
  @ApiQuery({ name: 'sector', required: false })
  async recalculateLead(
    @Param('leadId') leadId: string,
    @Query('sector') sector?: SectorProfileKey,
  ) {
    return this.scoringService.scoreLead(leadId, sector);
  }

  @Post('override/:leadId')
  @ApiOperation({ summary: 'Manual operator score correction with audit trail' })
  async manualOverride(
    @Param('leadId') leadId: string,
    @Body() body: { actor: string; reason: string; digitalNeed?: number; serviceFit?: number },
  ) {
    return this.scoringService.manualScoreOverride(leadId, body.actor, body.reason, {
      digitalNeed: body.digitalNeed,
      serviceFit: body.serviceFit,
    });
  }
}
