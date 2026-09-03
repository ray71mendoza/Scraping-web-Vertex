// ═══════════════════════════════════════════════════════════
// VERTEX Prospect — AI Engine Service
// ═══════════════════════════════════════════════════════════
// Generates commercial proposals using OpenAI GPT-4o.
// Falls back to mock data when no API key is configured.

import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import { prisma } from '@vertex/database';
import type { AIDiagnosis } from '@vertex/shared';
import { buildProposalPrompt } from './prompts/proposal-generator.prompt';

@Injectable()
export class AiEngineService {
  private readonly logger = new Logger(AiEngineService.name);
  private openai: OpenAI | null = null;
  private model: string;

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>('OPENAI_API_KEY', '');
    this.model = this.configService.get<string>('OPENAI_MODEL', 'gpt-4o');

    if (apiKey && apiKey !== 'your_openai_api_key_here') {
      this.openai = new OpenAI({ apiKey });
    } else {
      this.logger.warn('OpenAI API key not configured — using mock proposals');
    }
  }

  /**
   * Generates a commercial proposal for a specific lead using AI.
   * Updates the lead record with the generated diagnosis.
   */
  async generateProposal(leadId: string): Promise<AIDiagnosis> {
    const lead = await prisma.lead.findUnique({ where: { id: leadId } });
    if (!lead) throw new NotFoundException('Lead not found');

    // Build channels list from detected flags
    const channels: string[] = [];
    if (lead.hasFacebook) channels.push('Facebook');
    if (lead.hasInstagram) channels.push('Instagram');
    if (lead.hasWhatsapp) channels.push('WhatsApp');
    if (lead.hasTiktok) channels.push('TikTok');

    const promptData = {
      businessName: lead.businessName,
      category: lead.businessTypes?.[0] || 'Negocio Local',
      location: lead.formattedAddress || 'Colombia',
      hasWebsite: lead.hasWebsite,
      websiteUrl: lead.websiteUrl,
      googleRating: lead.googleRating,
      googleUserRatingsTotal: lead.googleUserRatingsTotal,
      channels,
      opportunityScore: lead.opportunityScore,
    };

    let diagnosis: AIDiagnosis;

    if (this.openai) {
      diagnosis = await this.callOpenAI(promptData);
    } else {
      diagnosis = this.generateMockProposal(promptData);
    }

    // Update lead with AI diagnosis
    await prisma.lead.update({
      where: { id: leadId },
      data: {
        aiDiagnosis: diagnosis as any,
        status: 'PROPOSAL_GENERATED',
      },
    });

    this.logger.log(`Proposal generated for "${lead.businessName}"`);
    return diagnosis;
  }

  /**
   * Calls OpenAI API to generate the proposal.
   */
  private async callOpenAI(promptData: Parameters<typeof buildProposalPrompt>[0]): Promise<AIDiagnosis> {
    const prompt = buildProposalPrompt(promptData);

    const completion = await this.openai!.chat.completions.create({
      model: this.model,
      messages: [
        { role: 'system', content: prompt },
        { role: 'user', content: 'Genera el análisis y la propuesta comercial.' },
      ],
      temperature: 0.7,
      max_tokens: 1500,
      response_format: { type: 'json_object' },
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) throw new Error('Empty response from OpenAI');

    try {
      const parsed = JSON.parse(content);
      return {
        digitalGapAnalysis: parsed.digital_gap_analysis,
        highImpactServices: parsed.high_impact_services,
        outreachEmail: {
          subject: parsed.outreach_email.subject,
          body: parsed.outreach_email.body,
        },
        whatsappHook: parsed.whatsapp_hook,
      };
    } catch {
      this.logger.error('Failed to parse OpenAI response as JSON');
      throw new Error('Invalid AI response format');
    }
  }

  /**
   * Generates a mock proposal for development/testing.
   */
  private generateMockProposal(data: { businessName: string; opportunityScore: number }): AIDiagnosis {
    return {
      digitalGapAnalysis: `${data.businessName} presenta una brecha digital significativa con un score de oportunidad de ${data.opportunityScore}/100. La ausencia de canales digitales optimizados limita su capacidad de captar nuevos clientes en búsquedas online.`,
      highImpactServices: [
        'Sitio Web Profesional con SEO Local',
        'Sistema de Agendamiento Online',
        'Presencia en Redes Sociales Optimizada',
      ],
      outreachEmail: {
        subject: `${data.businessName}: ¿Sabías que podrías estar perdiendo clientes cada día?`,
        body: `Estimado equipo de ${data.businessName},\n\nRealizamos un análisis digital de su negocio y encontramos oportunidades importantes para incrementar su visibilidad y ventas online.\n\nActualmente, su presencia digital tiene un score de ${100 - data.opportunityScore}/100, lo que significa que hay un amplio margen para captar más clientes a través de canales digitales.\n\nEn VERTEX, nos especializamos en transformación digital para negocios como el suyo. ¿Le gustaría agendar una consulta gratuita de 15 minutos?\n\nSaludos cordiales,\nEquipo VERTEX`,
      },
      whatsappHook: `¡Hola ${data.businessName}! 👋\nSomos VERTEX, agencia de transformación digital. Hicimos un análisis gratuito de su negocio y encontramos oportunidades para atraer más clientes online.\n¿Le interesaría ver los resultados? Solo toma 5 minutos 📊`,
    };
  }
}
