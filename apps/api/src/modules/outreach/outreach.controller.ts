import { Controller, Post, Get, Param } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { OutreachService } from './outreach.service';

@ApiTags('Outreach')
@Controller('outreach')
export class OutreachController {
  constructor(private readonly outreachService: OutreachService) {}

  @Get('whatsapp/:leadId')
  @ApiOperation({ summary: 'Get WhatsApp deep link with AI-generated message' })
  async getWhatsAppLink(@Param('leadId') leadId: string) {
    return this.outreachService.getWhatsAppLink(leadId);
  }

  @Post('email/:leadId')
  @ApiOperation({ summary: 'Send outreach email to lead' })
  async sendEmail(@Param('leadId') leadId: string) {
    return this.outreachService.sendEmail(leadId);
  }
}
