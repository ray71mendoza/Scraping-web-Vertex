// ═══════════════════════════════════════════════════════════
// VERTEX Prospect — Outreach Service
// ═══════════════════════════════════════════════════════════

import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { prisma } from '@vertex/database';
import { generateWhatsAppLink } from '@vertex/shared';
import type { AIDiagnosis } from '@vertex/shared';
import { generateProposalEmailHtml } from './email-template.util';
import axios from 'axios';

@Injectable()
export class OutreachService {
  private readonly logger = new Logger(OutreachService.name);
  private resendApiKey: string;
  private emailFrom: string;

  constructor(private configService: ConfigService) {
    this.resendApiKey = this.configService.get<string>('RESEND_API_KEY', '');
    this.emailFrom = this.configService.get<string>('EMAIL_FROM', 'prospects@vertex.com');
  }

  /**
   * Generates a WhatsApp deep link for a lead with the AI-generated message.
   */
  async getWhatsAppLink(leadId: string): Promise<{ url: string; message: string }> {
    const lead = await prisma.lead.findUnique({ where: { id: leadId } });
    if (!lead) throw new NotFoundException('Lead not found');

    if (!lead.internationalPhone) {
      throw new NotFoundException('Lead does not have a phone number');
    }

    const diagnosis = lead.aiDiagnosis as AIDiagnosis | null;
    const message = diagnosis?.whatsappHook || `Hola ${lead.businessName}, somos VERTEX.`;

    return {
      url: generateWhatsAppLink(lead.internationalPhone, message),
      message,
    };
  }

  /**
   * Sends an email to the lead using the AI-generated proposal.
   * If RESEND_API_KEY is configured, sends via Resend REST API; otherwise logs.
   */
  async sendEmail(leadId: string): Promise<{ sent: boolean; to: string | null; method: string }> {
    const lead = await prisma.lead.findUnique({ where: { id: leadId } });
    if (!lead) throw new NotFoundException('Lead not found');

    const diagnosis = lead.aiDiagnosis as AIDiagnosis | null;
    if (!diagnosis?.outreachEmail) {
      throw new NotFoundException('No AI proposal generated for this lead');
    }

    const targetEmail = lead.detectedEmails?.[0] || null;

    if (!targetEmail) {
      this.logger.warn(`No email found for lead ${lead.businessName}`);
      return { sent: false, to: null, method: 'none' };
    }

    const htmlContent = generateProposalEmailHtml({
      businessName: lead.businessName,
      subject: diagnosis.outreachEmail.subject,
      body: diagnosis.outreachEmail.body,
      opportunityScore: lead.opportunityScore,
      highImpactServices: diagnosis.highImpactServices || [],
    });

    let method = 'simulated';

    if (this.resendApiKey && this.resendApiKey !== 'your_resend_api_key_here') {
      try {
        await axios.post(
          'https://api.resend.com/emails',
          {
            from: this.emailFrom,
            to: targetEmail,
            subject: diagnosis.outreachEmail.subject,
            html: htmlContent,
          },
          {
            headers: {
              Authorization: `Bearer ${this.resendApiKey}`,
              'Content-Type': 'application/json',
            },
          },
        );
        method = 'resend';
      } catch (err: any) {
        this.logger.error(`Resend dispatch failed: ${err.response?.data?.message || err.message}`);
      }
    } else {
      this.logger.log(
        `[SIMULATION] Email sent to ${targetEmail} | Subject: "${diagnosis.outreachEmail.subject}"`,
      );
    }

    // Update lead status
    await prisma.lead.update({
      where: { id: leadId },
      data: { status: 'CONTACTED' },
    });

    return { sent: true, to: targetEmail, method };
  }
}
