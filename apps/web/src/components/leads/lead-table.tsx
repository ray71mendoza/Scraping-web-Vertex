"use client";

import React from "react";
import {
  ExternalLink,
  Globe,
  Phone,
  Star,
  Sparkles,
  ArrowUpDown,
  CheckCircle2,
  XCircle,
  MessageSquare,
  Mail,
} from "lucide-react";
import type { Lead } from "@vertex/shared";
import { OpportunityBadge } from "@/components/shared/opportunity-badge";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface LeadTableProps {
  leads: Lead[];
  onSelectLead: (lead: Lead) => void;
  onSort: (field: "opportunityScore" | "businessName" | "googleRating") => void;
  sortField?: string;
  sortOrder?: "asc" | "desc";
}

export function LeadTable({
  leads,
  onSelectLead,
  onSort,
  sortField = "opportunityScore",
  sortOrder = "desc",
}: LeadTableProps) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-white/5 bg-[#0e0e17]/60 backdrop-blur-xl">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-white/5 bg-white/[0.02] text-[11px] font-bold text-gray-400 uppercase tracking-wider">
            <th className="py-3.5 px-4">
              <button
                onClick={() => onSort("businessName")}
                className="flex items-center gap-1 hover:text-white transition-colors"
              >
                <span>Negocio / Empresa</span>
                <ArrowUpDown className="w-3 h-3" />
              </button>
            </th>
            <th className="py-3.5 px-4">
              <button
                onClick={() => onSort("opportunityScore")}
                className="flex items-center gap-1 hover:text-white transition-colors"
              >
                <span>Score Oportunidad</span>
                <ArrowUpDown className="w-3 h-3" />
              </button>
            </th>
            <th className="py-3.5 px-4">Auditoría Digital</th>
            <th className="py-3.5 px-4">
              <button
                onClick={() => onSort("googleRating")}
                className="flex items-center gap-1 hover:text-white transition-colors"
              >
                <span>Google Reputación</span>
                <ArrowUpDown className="w-3 h-3" />
              </button>
            </th>
            <th className="py-3.5 px-4">Estado CRM</th>
            <th className="py-3.5 px-4 text-right">Acciones</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/5 text-sm">
          {leads.map((lead) => (
            <tr
              key={lead.id}
              className="hover:bg-white/[0.02] transition-colors group cursor-pointer"
              onClick={() => onSelectLead(lead)}
            >
              {/* Business Name & Address */}
              <td className="py-4 px-4">
                <div className="font-semibold text-white group-hover:text-indigo-300 transition-colors flex items-center gap-2">
                  <span>{lead.businessName}</span>
                  {lead.websiteUrl && (
                    <a
                      href={lead.websiteUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="text-gray-400 hover:text-indigo-400 transition-colors"
                    >
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
                <div className="text-xs text-gray-400 truncate max-w-xs mt-0.5">
                  {lead.formattedAddress || "Ubicación detectada"}
                </div>
              </td>

              {/* Opportunity Score & Badge */}
              <td className="py-4 px-4">
                <OpportunityBadge
                  tier={lead.opportunityTier}
                  score={lead.opportunityScore}
                />
              </td>

              {/* Digital Maturity Checklist */}
              <td className="py-4 px-4">
                <div className="flex items-center gap-2 text-xs">
                  {/* Website */}
                  <span
                    title={lead.hasWebsite ? "Tiene Sitio Web" : "Sin Sitio Web (Oportunidad)"}
                    className={cn(
                      "flex items-center gap-1 px-2 py-0.5 rounded-md border font-medium text-[11px]",
                      lead.hasWebsite
                        ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                        : "bg-red-500/10 text-red-400 border-red-500/20"
                    )}
                  >
                    <Globe className="w-3 h-3" />
                    {lead.hasWebsite ? "Web" : "No Web"}
                  </span>

                  {/* SSL */}
                  <span
                    title={lead.hasValidSsl ? "SSL Activo" : "Sin SSL / Inseguro"}
                    className={cn(
                      "px-1.5 py-0.5 rounded text-[10px] font-bold uppercase",
                      lead.hasValidSsl
                        ? "bg-emerald-500/10 text-emerald-400"
                        : "bg-gray-500/10 text-gray-400"
                    )}
                  >
                    SSL
                  </span>

                  {/* WhatsApp */}
                  {lead.hasWhatsapp && (
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400">
                      WA
                    </span>
                  )}
                </div>
              </td>

              {/* Google Reviews & Stars */}
              <td className="py-4 px-4">
                <div className="flex items-center gap-1 text-amber-400 font-semibold text-xs">
                  <Star className="w-3.5 h-3.5 fill-amber-400" />
                  <span>{lead.googleRating?.toFixed(1) || "N/A"}</span>
                  <span className="text-gray-400 font-normal">
                    ({lead.googleUserRatingsTotal || 0})
                  </span>
                </div>
              </td>

              {/* Status */}
              <td className="py-4 px-4">
                <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-white/[0.05] text-gray-300 border border-white/10">
                  {lead.status}
                </span>
              </td>

              {/* Actions */}
              <td className="py-4 px-4 text-right">
                <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
                  {lead.internationalPhone && (
                    <a
                      href={`https://wa.me/${lead.internationalPhone.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(
                        (lead.aiDiagnosis as any)?.whatsappHook ||
                          `¡Hola ${lead.businessName}! 👋 Somos VERTEX, realizamos una auditoría de su presencia digital y encontramos oportunidades para aumentar sus clientes. ¿Le gustaría ver el informe?`
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      title="Enviar Propuesta por WhatsApp"
                      className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/20 transition-all hover:scale-105"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                    </a>
                  )}

                  {lead.detectedEmails && lead.detectedEmails.length > 0 && (
                    <a
                      href={`https://mail.google.com/mail/?view=cm&fs=1&to=${lead.detectedEmails[0]}&su=${encodeURIComponent(
                        (lead.aiDiagnosis as any)?.outreachEmail?.subject ||
                          `${lead.businessName}: Propuesta de Crecimiento Digital — VERTEX SAS`
                      )}&body=${encodeURIComponent(
                        (lead.aiDiagnosis as any)?.outreachEmail?.body ||
                          `Estimado equipo directivo de ${lead.businessName},\n\nLe saluda Ray Mendoza de VERTEX SAS (https://vertexcorp.com.co/es).\n\nLos invitamos a conocer algunos de los proyectos que hemos desarrollado recientemente en la sección Projects de nuestro sitio web:\nhttps://vertexcorp.com.co/es/proyectos\n\nSi consideran que esta oportunidad puede ser relevante para ${lead.businessName}, nos gustaría coordinar una breve conversación para conocer mejor sus necesidades y evaluar cómo podríamos desarrollar una solución adaptada a su negocio.\n\nCordialmente,\n\nRay Mendoza\nDirector de Desarrollo\nVERTEX | Innovation & Consulting\nE  gerenciavertexsas@gmail.com\nT  +57 300 865 8910\nW  vertexcorp.com.co`
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      title="Enviar Propuesta por Gmail (gerenciavertexsas@gmail.com)"
                      className="p-1.5 rounded-lg bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 border border-blue-500/20 transition-all hover:scale-105"
                    >
                      <Mail className="w-3.5 h-3.5" />
                    </a>
                  )}

                  <button
                    onClick={() => onSelectLead(lead)}
                    className="btn-accent text-xs px-2.5 py-1.5 font-medium inline-flex items-center gap-1.5"
                    title="Ver Detalle y Propuesta Completa"
                  >
                    <Sparkles className="w-3 h-3" />
                    <span className="hidden sm:inline">Propuesta</span>
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
