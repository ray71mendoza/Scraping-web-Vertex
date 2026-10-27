// ═══════════════════════════════════════════════════════════
// VERTEX Prospect — Internal vs Client Report Projections
// ═══════════════════════════════════════════════════════════

import type { CanonicalFinding, CanonicalCheckResult } from './audit.types';
import type { ProposalServiceItem } from './proposal.types';

export type ReportType = 'INTERNAL' | 'CLIENT';

/**
 * CLIENT-FACING REPORT PROJECTION
 * STRICT ENFORCEMENT: Excludes internal opportunity scores, ranking labels,
 * internal commercial notes, raw credentials, and implementation traces.
 */
export interface ClientReportProjection {
  reportId: string;
  reportType: 'CLIENT';
  version: number;
  generatedAt: string;
  businessName: string;
  websiteUrl: string | null;
  formattedAddress: string | null;
  auditedScope: {
    pagesInspectedCount: number;
    inspectionDate: string;
    limitationsNotice: string;
  };
  executiveSummary: string;
  verifiedFindings: Array<{
    title: string;
    description: string;
    severity: string;
    impact: string;
  }>;
  recommendedSolutions: ProposalServiceItem[];
  nextSteps: string;
  vertexIdentity: {
    companyName: string;
    tagline: string;
    contactPerson: string;
    role: string;
    email: string;
    phone: string;
    website: string;
    logoUrl: string;
  };
}

/**
 * INTERNAL REPORT PROJECTION
 * Full technical and commercial diagnostic data for the VERTEX sales & dev team.
 */
export interface InternalReportProjection {
  reportId: string;
  reportType: 'INTERNAL';
  version: number;
  generatedAt: string;
  leadId: string;
  organizationId: string;
  businessName: string;
  websiteUrl: string | null;
  formattedAddress: string | null;
  contactChannels: {
    emails: string[];
    phone: string | null;
    whatsappVerified: boolean;
    verificationLevel: string;
  };
  // Scoring & Internal Strategy
  scoring: {
    digitalNeed: number;
    serviceFit: number;
    evidenceConfidence: number;
    overallOpportunityScore: number;
    opportunityTier: string;
    sectorProfile: string;
    evidenceCoveragePct: number;
    isInsufficientEvidence: boolean;
    ruleContributions: any[];
    exclusions: string[];
  };
  checks: CanonicalCheckResult[];
  findings: CanonicalFinding[];
  recommendedSolutions: ProposalServiceItem[];
  internalNotes?: string;
  deliveryHistorySummary?: {
    lastAttemptStatus?: string;
    totalAttempts: number;
  };
}

/**
 * Strips internal opportunity scores, notes, ranking labels, and internal provider traces
 * to ensure that client-facing reports never leak sensitive data.
 */
export function sanitizeClientReport(internalReport: any): ClientReportProjection {
  return {
    reportId: internalReport.reportId,
    reportType: 'CLIENT',
    version: internalReport.version || 1,
    generatedAt: internalReport.generatedAt || new Date().toISOString(),
    businessName: internalReport.businessName,
    websiteUrl: internalReport.websiteUrl || null,
    formattedAddress: internalReport.formattedAddress || null,
    auditedScope: internalReport.auditedScope || {
      pagesInspectedCount: 1,
      inspectionDate: internalReport.generatedAt || new Date().toISOString(),
      limitationsNotice: 'Diagnóstico técnico objetivo basado en observaciones pasivas públicas del sitio web y perfiles comerciales.',
    },
    executiveSummary: internalReport.executiveSummary || 'Diagnóstico comercial y técnico completado.',
    verifiedFindings: (internalReport.findings || []).map((f: any) => ({
      title: f.title,
      description: f.description,
      severity: f.severity,
      impact: f.commercialImpact || f.impact || 'Impacto en visibilidad y captación comercial.',
    })),
    recommendedSolutions: internalReport.recommendedSolutions || [],
    nextSteps: internalReport.nextSteps || 'Agendar sesión de alineación técnica con VERTEX para revisar plan de implementación.',
    vertexIdentity: internalReport.vertexIdentity || {
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
