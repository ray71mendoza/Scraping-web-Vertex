// ═══════════════════════════════════════════════════════════
// VERTEX Prospect — Proposal Generation Service
// ═══════════════════════════════════════════════════════════

import { Injectable, NotFoundException } from '@nestjs/common';
import { prisma } from '@vertex/database';
import { CatalogService } from '../catalog/catalog.service';
import type {
  CommercialProposalDto,
  ProposalServiceItem,
} from '@vertex/shared';

@Injectable()
export class ProposalsService {
  constructor(private readonly catalogService: CatalogService) {}

  /**
   * Generates or retrieves a structured commercial proposal for a lead
   * based on its verified audit findings and active catalog services.
   */
  async generateProposal(leadId: string, createdBy?: string): Promise<CommercialProposalDto> {
    const lead = await prisma.lead.findUnique({
      where: { id: leadId },
      include: {
        findings: true,
        proposals: { orderBy: { version: 'desc' }, take: 1 },
      },
    });

    if (!lead) throw new NotFoundException(`Lead ${leadId} not found`);

    // 1. Gather verified findings
    const verifiedFindings = (lead.findings || []).map((f) => ({
      id: f.id,
      title: f.title,
      observation: f.description,
      commercialImpact: f.commercialImpact,
    }));

    // If no findings in DB yet, create synthetic findings from lead flags
    if (verifiedFindings.length === 0) {
      if (!lead.hasWebsite) {
        verifiedFindings.push({
          id: 'fnd_noweb',
          title: 'Sin Sitio Web Oficial',
          observation: 'El negocio no cuenta con presencia web indexada en Google.',
          commercialImpact: 'Fuga de clientes locales que buscan sus servicios en internet.',
        });
      }
      if (!lead.hasValidSsl && lead.hasWebsite) {
        verifiedFindings.push({
          id: 'fnd_nossl',
          title: 'Certificado de Seguridad Inseguro',
          observation: 'El sitio web no cuenta con certificado SSL/HTTPS válido.',
          commercialImpact: 'Navegadores alertan como "No seguro", ahuyentando visitantes.',
        });
      }
      if (!lead.isResponsive && lead.hasWebsite) {
        verifiedFindings.push({
          id: 'fnd_mobile',
          title: 'Falta de Optimización para Celulares',
          observation: 'El sitio no cuenta con diseño responsive mobile-first.',
          commercialImpact: 'Abandono de prospectos que navegan desde teléfonos móviles.',
        });
      }
      if (!lead.hasWhatsapp) {
        verifiedFindings.push({
          id: 'fnd_nowa',
          title: 'Sin Canal Directo de WhatsApp',
          observation: 'No se detectó botón ni enlace de atención inmediata por chat.',
          commercialImpact: 'Pérdida de consultas rápidas que no usan teléfono de voz.',
        });
      }
    }

    // 2. Map verified findings to eligible catalog services
    const findingKeys = verifiedFindings.map((f) => f.title.toLowerCase());
    const catalogServices = await this.catalogService.findAll();

    const recommendedServices: ProposalServiceItem[] = [];
    let accumulatedTotal = 0;
    let hasCustomQuote = false;

    for (const srv of catalogServices) {
      // Check if service matches any finding
      const isMatch = srv.requiredCheckKeys.some((k) => {
        if (k === 'hasWebsite' && !lead.hasWebsite) return true;
        if (k === 'hasValidSsl' && !lead.hasValidSsl) return true;
        if (k === 'isResponsive' && !lead.isResponsive) return true;
        if (k === 'hasWhatsapp' && !lead.hasWhatsapp) return true;
        if (k === 'hasCustomDomain' && !lead.hasCustomDomain) return true;
        return false;
      });

      if (isMatch) {
        const matchedFnds = verifiedFindings.filter((vf) =>
          srv.requiredCheckKeys.some((k) => vf.title.toLowerCase().includes(k.toLowerCase())),
        );

        if (srv.basePrice) {
          accumulatedTotal += srv.basePrice;
        } else {
          hasCustomQuote = true;
        }

        recommendedServices.push({
          serviceId: srv.id,
          serviceCode: srv.code,
          serviceName: srv.name,
          rationale: `Solución técnica diseñada para resolver: ${srv.description}`,
          matchedFindingIds: matchedFnds.map((f) => f.id),
          deliverables: srv.deliverables,
          exclusions: srv.exclusions,
          dependencies: srv.dependencies,
          priceFormatted: srv.basePrice
            ? `$${srv.basePrice.toLocaleString('es-CO')} ${srv.currency}`
            : 'Por cotizar',
          estimatedDuration: srv.estimatedDurationDays
            ? `${srv.estimatedDurationDays} días hábiles`
            : 'Por estimar',
        });
      }
    }

    // Fallback if no specific match
    if (recommendedServices.length === 0 && catalogServices.length > 0) {
      const defaultSrv = catalogServices[0];
      recommendedServices.push({
        serviceId: defaultSrv.id,
        serviceCode: defaultSrv.code,
        serviceName: defaultSrv.name,
        rationale: 'Modernización integral de la presencia digital comercial.',
        matchedFindingIds: [],
        deliverables: defaultSrv.deliverables,
        exclusions: defaultSrv.exclusions,
        dependencies: defaultSrv.dependencies,
        priceFormatted: defaultSrv.basePrice
          ? `$${defaultSrv.basePrice.toLocaleString('es-CO')} ${defaultSrv.currency}`
          : 'Por cotizar',
        estimatedDuration: `${defaultSrv.estimatedDurationDays || 10} días hábiles`,
      });
      accumulatedTotal = defaultSrv.basePrice || 0;
    }

    const nextVersion = (lead.proposals?.[0]?.version || 0) + 1;
    const totalEstimateFormatted = hasCustomQuote || accumulatedTotal === 0
      ? 'Por cotizar según especificación'
      : `$${accumulatedTotal.toLocaleString('es-CO')} COP`;

    const proposalDto: CommercialProposalDto = {
      id: `prop_${lead.id}_v${nextVersion}`,
      leadId: lead.id,
      businessName: lead.businessName,
      version: nextVersion,
      title: `Propuesta de Transformación Digital para ${lead.businessName}`,
      executiveSummary: `Auditoría comercial identificó ${verifiedFindings.length} brechas digitales que limitan la captación online de ${lead.businessName}. VERTEX propone una solución estructurada orientada a incrementar consultas directas y autoridad de marca.`,
      auditedScopeSummary: `Inspección de presencia pública, Google Maps (${lead.googleRating?.toFixed(1) || '0'} estrellas) y canales de contacto.`,
      verifiedFindings,
      recommendedServices,
      totalEstimateFormatted,
      nextStepText: 'Agendar una demostración ejecutiva de 15 minutos para revisar el alcance y ajustar el cronograma de implementación.',
      vertexContact: {
        name: 'Ray Mendoza',
        role: 'Director de Desarrollo',
        email: 'gerenciavertexsas@gmail.com',
        phone: '+57 300 865 8910',
        website: 'https://vertexcorp.com.co',
      },
      createdAt: new Date().toISOString(),
      status: 'DRAFT',
    };

    // Save immutable ProposalVersion in database
    try {
      await prisma.proposalVersion.create({
        data: {
          leadId: lead.id,
          organizationId: lead.organizationId,
          version: nextVersion,
          title: proposalDto.title,
          executiveSummary: proposalDto.executiveSummary,
          verifiedFindingIds: verifiedFindings.map((f) => f.id),
          recommendedServiceCodes: recommendedServices.map((s) => s.serviceCode),
          serviceItems: recommendedServices as any,
          totalEstimate: { formatted: totalEstimateFormatted, raw: accumulatedTotal } as any,
          nextStepText: proposalDto.nextStepText,
          status: 'DRAFT',
          createdBy,
        },
      });

      // Update lead status
      await prisma.lead.update({
        where: { id: lead.id },
        data: { status: 'PROPOSAL_GENERATED' },
      });
    } catch (err: any) {
      // offline fallback
    }

    return proposalDto;
  }

  /**
   * Retrieves the latest proposal version for a lead.
   */
  async getLatestProposal(leadId: string): Promise<CommercialProposalDto> {
    const existing = await prisma.proposalVersion.findFirst({
      where: { leadId },
      orderBy: { version: 'desc' },
      include: { lead: true },
    });

    if (existing) {
      return {
        id: existing.id,
        leadId: existing.leadId,
        businessName: existing.lead.businessName,
        version: existing.version,
        title: existing.title,
        executiveSummary: existing.executiveSummary,
        auditedScopeSummary: `Auditoría realizada para ${existing.lead.businessName}.`,
        verifiedFindings: [],
        recommendedServices: (existing.serviceItems as any) || [],
        totalEstimateFormatted: (existing.totalEstimate as any)?.formatted || 'Por cotizar',
        nextStepText: existing.nextStepText,
        vertexContact: {
          name: 'Ray Mendoza',
          role: 'Director de Desarrollo',
          email: 'gerenciavertexsas@gmail.com',
          phone: '+57 300 865 8910',
          website: 'https://vertexcorp.com.co',
        },
        createdAt: existing.createdAt.toISOString(),
        status: existing.status as any,
      };
    }

    return this.generateProposal(leadId);
  }
}
