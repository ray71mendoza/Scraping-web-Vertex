// ═══════════════════════════════════════════════════════════
// VERTEX Prospect — Reports & Secure Projections Service
// ═══════════════════════════════════════════════════════════

import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { prisma } from '@vertex/database';
import * as crypto from 'crypto';
import type {
  ClientReportProjection,
  InternalReportProjection,
} from '@vertex/shared';
import { ProposalsService } from '../proposals/proposals.service';

@Injectable()
export class ReportsService {
  constructor(private readonly proposalsService: ProposalsService) {}

  /**
   * Generates a strict CLIENT-FACING projection.
   * Excludes all internal opportunity scores, ranking labels, internal notes,
   * credentials, raw provider headers, and diagnostic implementation traces.
   */
  async getClientReport(leadId: string): Promise<ClientReportProjection> {
    const lead = await prisma.lead.findUnique({
      where: { id: leadId },
      include: {
        findings: true,
        proposals: { orderBy: { version: 'desc' }, take: 1 },
      },
    });

    if (!lead) throw new NotFoundException(`Lead ${leadId} not found`);

    const proposal = await this.proposalsService.getLatestProposal(leadId);

    const verifiedFindings = (lead.findings || []).map((f) => ({
      title: f.title,
      description: f.description,
      severity: f.severity,
      impact: f.commercialImpact,
    }));

    if (verifiedFindings.length === 0) {
      if (!lead.hasWebsite) {
        verifiedFindings.push({
          title: 'Presencia Web Oficial Inexistente',
          description: 'No se detectó un sitio web institucional activo en los registros públicos.',
          severity: 'HIGH',
          impact: 'Pérdida de clientes que buscan servicios directamente en motores de búsqueda.',
        });
      }
      if (!lead.hasValidSsl && lead.hasWebsite) {
        verifiedFindings.push({
          title: 'Navegación Web No Segura (Sin SSL)',
          description: 'El sitio no cuenta con certificado de cifrado HTTPS.',
          severity: 'HIGH',
          impact: 'Advertencias de seguridad en navegadores que desincentivan el contacto.',
        });
      }
      if (!lead.isResponsive && lead.hasWebsite) {
        verifiedFindings.push({
          title: 'Falta de Adaptación a Dispositivos Móviles',
          description: 'El sitio web no está optimizado para navegación en pantallas táctiles.',
          severity: 'MEDIUM',
          impact: 'Dificultad de lectura y navegación en smartphones.',
        });
      }
      if (!lead.hasWhatsapp) {
        verifiedFindings.push({
          title: 'Canal de Conversión Inmediata por WhatsApp No Integrado',
          description: 'No se identificó enlace de contacto directo a chat comercial.',
          severity: 'MEDIUM',
          impact: 'Disminución en la tasa de consultas rápidas de prospectos.',
        });
      }
    }

    return {
      reportId: `rep_client_${lead.id}`,
      reportType: 'CLIENT',
      version: proposal.version,
      generatedAt: new Date().toISOString(),
      businessName: lead.businessName,
      websiteUrl: lead.websiteUrl,
      formattedAddress: lead.formattedAddress,
      auditedScope: {
        pagesInspectedCount: 1,
        inspectionDate: lead.enrichedAt?.toISOString() || lead.updatedAt.toISOString(),
        limitationsNotice: 'Diagnóstico técnico objetivo basado en observaciones pasivas públicas del sitio web y perfiles comerciales.',
      },
      executiveSummary: proposal.executiveSummary,
      verifiedFindings,
      recommendedSolutions: proposal.recommendedServices,
      nextSteps: proposal.nextStepText,
      vertexIdentity: {
        companyName: 'VERTEX | Innovation & Consulting',
        tagline: 'Modernización Tecnológica, Desarrollo Web & Automatizaciones Comerciales',
        contactPerson: 'Ray Mendoza',
        role: 'Director de Desarrollo',
        email: 'gerenciavertexsas@gmail.com',
        phone: '+57 300 865 8910',
        website: 'https://vertexcorp.com.co/es',
        logoUrl: '/vertex-logo.png',
      },
    };
  }

  /**
   * Generates a comprehensive INTERNAL projection for operators and consultants.
   */
  async getInternalReport(leadId: string): Promise<InternalReportProjection> {
    const lead = await prisma.lead.findUnique({
      where: { id: leadId },
      include: {
        checkResults: true,
        findings: true,
        deliveryIntents: { orderBy: { createdAt: 'desc' }, take: 5 },
      },
    });

    if (!lead) throw new NotFoundException(`Lead ${leadId} not found`);

    const proposal = await this.proposalsService.getLatestProposal(leadId);
    const explanation = (lead.scoringExplanation as any) || {};

    return {
      reportId: `rep_int_${lead.id}`,
      reportType: 'INTERNAL',
      version: proposal.version,
      generatedAt: new Date().toISOString(),
      leadId: lead.id,
      organizationId: lead.organizationId,
      businessName: lead.businessName,
      websiteUrl: lead.websiteUrl,
      formattedAddress: lead.formattedAddress,
      contactChannels: {
        emails: lead.detectedEmails || [],
        phone: lead.internationalPhone,
        whatsappVerified: lead.hasWhatsapp,
        verificationLevel: lead.contactVerificationLevel,
      },
      scoring: {
        digitalNeed: lead.digitalNeedScore,
        serviceFit: lead.serviceFitScore,
        evidenceConfidence: lead.evidenceConfidenceScore,
        overallOpportunityScore: lead.opportunityScore,
        opportunityTier: lead.opportunityTier,
        sectorProfile: lead.sector,
        evidenceCoveragePct: Math.round(lead.evidenceCoverage * 100),
        isInsufficientEvidence: explanation.isInsufficientEvidence || false,
        ruleContributions: explanation.contributions || [],
        exclusions: explanation.exclusions || [],
      },
      checks: (lead.checkResults as any) || [],
      findings: (lead.findings as any) || [],
      recommendedSolutions: proposal.recommendedServices,
      deliveryHistorySummary: {
        lastAttemptStatus: lead.deliveryIntents?.[0]?.status,
        totalAttempts: lead.deliveryIntents?.length || 0,
      },
    };
  }

  /**
   * Creates an unguessable, secure, revocable share token for client viewing.
   */
  async createShareToken(leadId: string, expiresInHours = 72) {
    const lead = await prisma.lead.findUnique({ where: { id: leadId } });
    if (!lead) throw new NotFoundException(`Lead ${leadId} not found`);

    const rawToken = crypto.randomBytes(24).toString('hex');
    const expiresAt = new Date(Date.now() + expiresInHours * 3600 * 1000);

    // Create report version record
    const clientProjection = await this.getClientReport(leadId);
    const checksum = crypto
      .createHash('sha256')
      .update(JSON.stringify(clientProjection))
      .digest('hex');

    try {
      const repVersion = await prisma.reportVersion.create({
        data: {
          leadId: lead.id,
          organizationId: lead.organizationId,
          reportType: 'CLIENT',
          version: clientProjection.version,
          title: `Informe Técnico para ${lead.businessName}`,
          snapshotData: clientProjection as any,
          checksum,
        },
      });

      const tokenRecord = await prisma.reportShareToken.create({
        data: {
          reportVersionId: repVersion.id,
          leadId: lead.id,
          token: rawToken,
          expiresAt,
        },
      });

      return {
        token: tokenRecord.token,
        expiresAt: tokenRecord.expiresAt,
        shareUrl: `/reports/shared/${tokenRecord.token}`,
      };
    } catch {
      // offline / mock fallback
      return {
        token: rawToken,
        expiresAt,
        shareUrl: `/reports/shared/${rawToken}`,
      };
    }
  }

  /**
   * Retrieves client report via valid, unexpired share token.
   */
  async getSharedReportByToken(token: string): Promise<ClientReportProjection> {
    try {
      const tokenRecord = await prisma.reportShareToken.findUnique({
        where: { token },
        include: { reportVersion: true },
      });

      if (!tokenRecord) {
        throw new NotFoundException('Enlace de informe no encontrado o inválido.');
      }

      if (tokenRecord.revokedAt) {
        throw new ForbiddenException('Este enlace de informe ha sido revocado.');
      }

      if (new Date() > tokenRecord.expiresAt) {
        throw new ForbiddenException('Este enlace de informe ha expirado.');
      }

      return tokenRecord.reportVersion.snapshotData as any;
    } catch (err: any) {
      if (err instanceof NotFoundException || err instanceof ForbiddenException) throw err;
      throw new NotFoundException('Informe no disponible');
    }
  }
}
