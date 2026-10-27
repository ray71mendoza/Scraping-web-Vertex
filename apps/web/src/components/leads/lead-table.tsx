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
  MessageCircle,
  Mail,
  Send,
  Building,
} from "lucide-react";
import type { Lead } from "@vertex/shared";
import { OpportunityBadge } from "@/components/shared/opportunity-badge";
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
  const getSectorLabel = (sector?: string) => {
    switch (sector) {
      case "HOTELS_TOURISM":
        return { label: "Hotel / Turismo", color: "text-amber-400 bg-amber-500/10 border-amber-500/20" };
      case "RESTAURANTS":
        return { label: "Restaurante", color: "text-orange-400 bg-orange-500/10 border-orange-500/20" };
      case "CLINICS":
        return { label: "Clínica / Salud", color: "text-rose-400 bg-rose-500/10 border-rose-500/20" };
      case "RETAIL":
        return { label: "Retail / Comercio", color: "text-purple-400 bg-purple-500/10 border-purple-500/20" };
      default:
        return { label: "General B2B", color: "text-indigo-400 bg-indigo-500/10 border-indigo-500/20" };
    }
  };

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
            <th className="py-3.5 px-4">Canales de Contacto</th>
            <th className="py-3.5 px-4">
              <button
                onClick={() => onSort("googleRating")}
                className="flex items-center gap-1 hover:text-white transition-colors"
              >
                <span>Google Reputación</span>
                <ArrowUpDown className="w-3 h-3" />
              </button>
            </th>
            <th className="py-3.5 px-4">Estado Envío</th>
            <th className="py-3.5 px-4 text-right">Acción</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/5 text-sm">
          {leads.map((lead) => {
            const extended = lead as any;
            const sectorMeta = getSectorLabel(extended.sector);
            const hasEmail = Boolean(lead.detectedEmails?.length > 0);
            const hasPhone = Boolean(lead.internationalPhone);
            const deliveryStatus = extended.deliveryStatus || "NOT_SENT";

            return (
              <tr
                key={lead.id}
                className="hover:bg-white/[0.02] transition-colors group cursor-pointer"
                onClick={() => onSelectLead(lead)}
              >
                {/* Business Name & Address */}
                <td className="py-4 px-4">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-white group-hover:text-indigo-300 transition-colors">
                      {lead.businessName}
                    </span>
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
                  <div className="flex items-center gap-2 mt-1">
                    <span className={cn("px-1.5 py-0.5 rounded text-[10px] font-bold border", sectorMeta.color)}>
                      {sectorMeta.label}
                    </span>
                    <span className="text-xs text-gray-400 truncate max-w-xs">
                      {lead.formattedAddress || "Ubicación detectada"}
                    </span>
                  </div>
                </td>

                {/* Opportunity Score & Badge */}
                <td className="py-4 px-4">
                  <OpportunityBadge
                    tier={lead.opportunityTier}
                    score={lead.opportunityScore}
                  />
                  {extended.digitalNeedScore !== undefined && (
                    <div className="text-[10px] text-gray-500 font-mono mt-0.5">
                      Necesidad: {extended.digitalNeedScore}/100
                    </div>
                  )}
                </td>

                {/* Contact Channels Available */}
                <td className="py-4 px-4">
                  <div className="flex items-center gap-1.5 text-xs">
                    {hasEmail && (
                      <span
                        title={`Correo disponible: ${lead.detectedEmails[0]}`}
                        className="p-1.5 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20"
                      >
                        <Mail className="w-3.5 h-3.5" />
                      </span>
                    )}
                    {hasPhone && (
                      <span
                        title={`WhatsApp/Teléfono disponible: ${lead.internationalPhone}`}
                        className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                      </span>
                    )}
                    {!hasEmail && !hasPhone && (
                      <span className="text-[11px] text-gray-500 italic">
                        Sin datos de contacto
                      </span>
                    )}
                  </div>
                </td>

                {/* Google Maps Reputation */}
                <td className="py-4 px-4">
                  <div className="flex items-center gap-1.5">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    <span className="font-bold text-white text-xs">
                      {lead.googleRating?.toFixed(1) || "N/A"}
                    </span>
                    <span className="text-gray-500 text-xs font-mono">
                      ({lead.googleUserRatingsTotal || 0})
                    </span>
                  </div>
                </td>

                {/* Outreach Delivery Status */}
                <td className="py-4 px-4">
                  {deliveryStatus === "ACCEPTED" || deliveryStatus === "DELIVERED" ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      <CheckCircle2 className="w-3 h-3" />
                      Aceptado
                    </span>
                  ) : deliveryStatus === "FAILED" ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-red-500/10 text-red-400 border border-red-500/20">
                      <XCircle className="w-3 h-3" />
                      Fallido
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium bg-white/[0.03] text-gray-400 border border-white/5">
                      No enviado
                    </span>
                  )}
                </td>

                {/* Actions */}
                <td className="py-4 px-4 text-right">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectLead(lead);
                    }}
                    className="btn-ghost text-xs font-semibold py-1.5 px-3 rounded-xl border border-white/10 hover:border-indigo-500 hover:text-indigo-300 flex items-center gap-1.5 ml-auto transition-all"
                  >
                    <Send className="w-3 h-3 text-indigo-400" />
                    <span>Contactar</span>
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
