"use client";

import React from "react";
import type { Lead } from "@vertex/shared";
import { LeadStatus } from "@vertex/shared";
import { OpportunityBadge } from "@/components/shared/opportunity-badge";
import { Globe, Sparkles, Phone, Star, Mail } from "lucide-react";
import { cn } from "@/lib/utils";

interface LeadKanbanProps {
  leads: Lead[];
  onSelectLead: (lead: Lead) => void;
  onStatusChange?: (leadId: string, newStatus: string) => void;
}

export function LeadKanban({ leads, onSelectLead }: LeadKanbanProps) {
  const columns: { status: LeadStatus; title: string; color: string }[] = [
    { status: LeadStatus.DISCOVERED, title: "Descubiertos", color: "border-blue-500/30" },
    { status: LeadStatus.QUALIFIED, title: "Calificados / Auditados", color: "border-purple-500/30" },
    { status: LeadStatus.PROPOSAL_GENERATED, title: "Propuesta Lista", color: "border-amber-500/30" },
    { status: LeadStatus.CONTACTED, title: "Contactados", color: "border-emerald-500/30" },
    { status: LeadStatus.CONVERTED, title: "Cerrados / Clientes", color: "border-pink-500/30" },
  ];

  return (
    <div className="flex gap-4 overflow-x-auto pb-6 pt-2">
      {columns.map((col) => {
        const colLeads = leads.filter((l) => l.status === col.status);

        return (
          <div
            key={col.status}
            className="flex-1 min-w-[290px] max-w-[340px] bg-[#0c0c14]/80 backdrop-blur-md rounded-2xl border border-white/5 flex flex-col h-[calc(100vh-250px)]"
          >
            {/* Column Header */}
            <div className={cn("p-4 border-b border-white/5 flex items-center justify-between border-t-2 rounded-t-2xl", col.color)}>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-sm text-white">{col.title}</span>
                <span className="text-xs font-bold text-gray-400 bg-white/5 px-2 py-0.5 rounded-full">
                  {colLeads.length}
                </span>
              </div>
            </div>

            {/* Column Cards */}
            <div className="p-3 space-y-3 overflow-y-auto flex-1">
              {colLeads.map((lead) => (
                <div
                  key={lead.id}
                  onClick={() => onSelectLead(lead)}
                  className="p-4 rounded-xl bg-[#14141f] border border-white/5 hover:border-indigo-500/40 transition-all duration-200 cursor-pointer shadow-sm hover:shadow-indigo-500/10 group relative"
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h4 className="font-bold text-sm text-white group-hover:text-indigo-300 transition-colors line-clamp-1">
                      {lead.businessName}
                    </h4>
                  </div>

                  <p className="text-xs text-gray-400 truncate mb-3">
                    {lead.formattedAddress || "Ubicación detectada"}
                  </p>

                  <div className="mb-3">
                    <OpportunityBadge
                      tier={lead.opportunityTier}
                      score={lead.opportunityScore}
                    />
                  </div>

                  <div className="flex items-center justify-between text-xs text-gray-400 pt-2 border-t border-white/5">
                    <div className="flex items-center gap-1.5">
                      <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                      <span className="font-medium text-gray-300">
                        {lead.googleRating?.toFixed(1) || "-"}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {lead.hasWebsite ? (
                        <span className="text-emerald-400 font-medium text-[11px] flex items-center gap-0.5">
                          <Globe className="w-3 h-3" /> Web
                        </span>
                      ) : (
                        <span className="text-red-400 font-medium text-[11px]">
                          Sin Web
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {colLeads.length === 0 && (
                <div className="h-32 flex items-center justify-center border border-dashed border-white/5 rounded-xl text-xs text-gray-400">
                  Sin prospectos en esta etapa
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
