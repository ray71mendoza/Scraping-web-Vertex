// ═══════════════════════════════════════════════════════════
// VERTEX Prospect — Outreach Controller
// ═══════════════════════════════════════════════════════════

import { Controller, Post, Get, Param, Body } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { OutreachService } from './outreach.service';
import type { SendOutreachRequest, OutreachChannel } from '@vertex/shared';

@ApiTags('Direct Outreach')
@Controller('outreach')
export class OutreachController {
  constructor(private readonly outreachService: OutreachService) {}

  @Get('channels/:leadId')
  @ApiOperation({ summary: 'Get contact destinations and channel readiness' })
  async getChannels(@Param('leadId') leadId: string) {
    return this.outreachService.getCompanyContactChannels(leadId);
  }

  @Get('drafts/:leadId')
  @ApiOperation({ summary: 'Get company-specific tailored message drafts' })
  async getDrafts(@Param('leadId') leadId: string) {
    return this.outreachService.getCompanyOutreachDrafts(leadId);
  }

  @Post('drafts/:leadId')
  @ApiOperation({ summary: 'Save reviewed draft edits for a company' })
  async saveDraft(
    @Param('leadId') leadId: string,
    @Body() body: { channel: OutreachChannel; subject?: string; body: string },
  ) {
    return this.outreachService.saveDraft(leadId, body.channel, body);
  }

  @Post('dispatch')
  @ApiOperation({ summary: 'Direct backend send via Resend or Meta WhatsApp Cloud API' })
  async dispatch(@Body() request: SendOutreachRequest) {
    return this.outreachService.dispatchOutreach(request);
  }

  @Get('history/:leadId')
  @ApiOperation({ summary: 'Get delivery history and status updates for a company' })
  async getHistory(@Param('leadId') leadId: string) {
    return this.outreachService.getDeliveryHistory(leadId);
  }

  @Post('webhooks/resend')
  @ApiOperation({ summary: 'Webhook endpoint for Resend delivery notifications' })
  async resendWebhook(@Body() payload: any) {
    return this.outreachService.handleResendWebhook(payload);
  }

  @Post('webhooks/whatsapp')
  @ApiOperation({ summary: 'Webhook endpoint for WhatsApp Cloud delivery notifications' })
  async whatsappWebhook(@Body() payload: any) {
    return this.outreachService.handleWhatsAppWebhook(payload);
  }

  // ── Backward Compatible Endpoints ──
  @Post('email/:leadId')
  @ApiOperation({ summary: 'Send email using default draft' })
  async sendEmailLegacy(@Param('leadId') leadId: string) {
    const drafts = await this.outreachService.getCompanyOutreachDrafts(leadId);
    const channels = await this.outreachService.getCompanyContactChannels(leadId);
    return this.outreachService.dispatchOutreach({
      leadId,
      channel: 'EMAIL',
      destination: channels.email.destination || 'contacto@empresa.com',
      subject: drafts.email.subject,
      body: drafts.email.body,
      idempotencyKey: `legacy_email_${leadId}_${Date.now()}`,
    });
  }

  @Get('whatsapp/:leadId')
  @ApiOperation({ summary: 'Get WhatsApp draft hook' })
  async getWhatsAppLegacy(@Param('leadId') leadId: string) {
    const drafts = await this.outreachService.getCompanyOutreachDrafts(leadId);
    const channels = await this.outreachService.getCompanyContactChannels(leadId);
    return {
      url: `https://wa.me/${(channels.whatsapp.destination || '').replace(/\D/g, '')}?text=${encodeURIComponent(drafts.whatsapp.body)}`,
      message: drafts.whatsapp.body,
    };
  }
}
