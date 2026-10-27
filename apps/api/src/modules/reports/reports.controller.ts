// ═══════════════════════════════════════════════════════════
// VERTEX Prospect — Reports Controller
// ═══════════════════════════════════════════════════════════

import { Controller, Get, Post, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { ReportsService } from './reports.service';

@ApiTags('Reports')
@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('client/:leadId')
  @ApiOperation({ summary: 'Get strictly sanitized client-facing report' })
  async getClientReport(@Param('leadId') leadId: string) {
    return this.reportsService.getClientReport(leadId);
  }

  @Get('internal/:leadId')
  @ApiOperation({ summary: 'Get full technical internal diagnostic report' })
  async getInternalReport(@Param('leadId') leadId: string) {
    return this.reportsService.getInternalReport(leadId);
  }

  @Post('share/:leadId')
  @ApiOperation({ summary: 'Generate secure, expiring client share link' })
  async createShareLink(
    @Param('leadId') leadId: string,
    @Query('expiresInHours') expiresInHours?: number,
  ) {
    return this.reportsService.createShareToken(leadId, expiresInHours ? Number(expiresInHours) : 72);
  }

  @Get('shared/:token')
  @ApiOperation({ summary: 'Access client report via secure unguessable token' })
  async getSharedReport(@Param('token') token: string) {
    return this.reportsService.getSharedReportByToken(token);
  }
}
