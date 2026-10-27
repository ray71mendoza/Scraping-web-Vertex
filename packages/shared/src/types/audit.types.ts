// ═══════════════════════════════════════════════════════════
// VERTEX Prospect — Canonical Audit & Findings Types
// ═══════════════════════════════════════════════════════════

import type { CheckOutcome, CheckSeverity } from './scoring.types';

export type AuditCategory =
  | 'AVAILABILITY'
  | 'PERFORMANCE'
  | 'ON_PAGE_SEO'
  | 'ACCESSIBILITY'
  | 'MOBILE'
  | 'COMMERCIAL';

export interface CanonicalCheckResult {
  checkKey: string;
  checkVersion: string;
  category: AuditCategory;
  outcome: CheckOutcome;
  severity: CheckSeverity;
  label: string;
  normalizedMessage: string;
  commercialImpact?: string;
  sourceUrl?: string;
  finalUrl?: string;
  confidenceBasis?: string;
  rawObservation?: Record<string, any>;
  errorClassification?: 'TIMEOUT' | 'TLS_FAILURE' | 'DNS_FAILURE' | 'HTTP_4XX' | 'HTTP_5XX' | 'ANTI_BOT_BLOCKED' | 'NONE';
  observedAt: string;
}

export interface CanonicalFinding {
  id: string;
  code: string;
  category: AuditCategory;
  title: string;
  description: string;
  severity: CheckSeverity;
  commercialImpact: string;
  targetServiceCode?: string;
  evidenceExcerpts?: string[];
  checkReferences?: string[];
}

export interface AuditRunSummary {
  id: string;
  leadId: string;
  auditMode: 'QUICK' | 'DETAILED';
  status: 'COMPLETED' | 'PARTIAL' | 'FAILED' | 'RUNNING';
  coveragePct: number;
  pagesInspected: string[];
  checksCount: number;
  findingsCount: number;
  startedAt: string;
  completedAt?: string;
  limitationsNote: string;
}

export interface BoundedAuditReport {
  run: AuditRunSummary;
  checks: CanonicalCheckResult[];
  findings: CanonicalFinding[];
}
