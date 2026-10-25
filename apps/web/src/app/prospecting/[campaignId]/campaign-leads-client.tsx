"use client";

import React, { useState } from "react";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import { Header } from "@/components/shared/header";
import { LeadTable } from "@/components/leads/lead-table";
import { LeadKanban } from "@/components/leads/lead-kanban";
import { LeadDetailModal } from "@/components/leads/lead-detail-modal";
import type { Lead, OpportunityLevel } from "@vertex/shared";
import {
  Table as TableIcon,
  Kanban as KanbanIcon,
  Search,
  Filter,
  Flame,
  ArrowUpDown,
  Compass,
  Sparkles,
  RefreshCw,
  Download,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { exportLeadsToCsv } from "@/lib/export-csv";

export default function CampaignLeadsClient() {
  const params = useParams();
  const campaignId = (params?.campaignId as string) || "default";

  const [viewMode, setViewMode] = useState<"table" | "kanban">("table");
  const [selectedTier, setSelectedTier] = useState<string>("ALL");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [sortBy, setSortBy] = useState<"opportunityScore" | "businessName" | "googleRating">("opportunityScore");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [activeLead, setActiveLead] = useState<Lead | null>(null);

  // Fetch campaign info
  const { data: campaign } = useQuery({
    queryKey: ["campaign", campaignId],
    queryFn: () => api.getCampaignById(campaignId),
  });

  // Fetch campaign stats
  const { data: stats } = useQuery({
    queryKey: ["campaign-stats", campaignId],
    queryFn: () => api.getCampaignStats(campaignId),
  });

  // Fetch leads
  const {
    data: leadsResponse,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["leads", campaignId, selectedTier, searchTerm, sortBy, sortOrder],
    queryFn: () =>
      api.getLeads({
        campaignId,
        opportunityTier: selectedTier !== "ALL" ? (selectedTier as OpportunityLevel) : undefined,
        search: searchTerm || undefined,
        sortBy,
        sortOrder,
        limit: 100,
      }),
  });

  const leads = leadsResponse?.data || [];

  const handleSort = (field: "opportunityScore" | "businessName" | "googleRating") => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("desc");
    }
  };

  return (
    <div className="flex-1 flex flex-col min-h-screen">
      <Header
        title={campaign?.queryTerm || "Dashboard de Leads"}
        subtitle={`${campaign?.location || "Cargando..."} • ${(Number(campaign?.radiusMeters || 10000) / 1000).toFixed(0)} km de radio`}
      />

      <main className="p-8 max-w-7xl w-full mx-auto space-y-6">
        {/* KPI Banner Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-1">
            <span className="text-[11px] font-bold text-gray-400 uppercase">Total Leads</span>
            <div className="text-xl font-black text-white font-mono">
              {stats?.totalLeads ?? leads.length}
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-red-500/5 border border-red-500/20 space-y-1">
            <span className="text-[11px] font-bold text-red-400 uppercase">Oportunidad Crítica</span>
            <div className="text-xl font-black text-red-400 font-mono">
              {stats?.byTier?.VERY_HIGH ?? 0}
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-orange-500/5 border border-orange-500/20 space-y-1">
            <span className="text-[11px] font-bold text-orange-400 uppercase">Oportunidad Alta</span>
            <div className="text-xl font-black text-orange-400 font-mono">
              {stats?.byTier?.HIGH ?? 0}
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-indigo-500/5 border border-indigo-500/20 space-y-1">
            <span className="text-[11px] font-bold text-indigo-400 uppercase">Score Oportunidad Promedio</span>
            <div className="text-xl font-black text-indigo-300 font-mono">
              {stats?.avgOpportunityScore ?? 0}/100
            </div>
          </div>
        </div>

        {/* Controls Toolbar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-2xl bg-[#0e0e17]/80 border border-white/5 backdrop-blur-xl">
          {/* Left: Search & Filter Tabs */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Search Input */}
            <div className="relative min-w-[220px]">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar negocio..."
                className="w-full bg-[#08080d] border border-white/10 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder:text-gray-400 focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>

            {/* Severity Filter Pills */}
            <div className="flex items-center gap-1 bg-[#08080d] p-1 rounded-xl border border-white/5">
              {[
                { id: "ALL", label: "Todos" },
                { id: "VERY_HIGH", label: "Crítica" },
                { id: "HIGH", label: "Alta" },
                { id: "MEDIUM", label: "Media" },
                { id: "LOW", label: "Baja" },
              ].map((tier) => (
                <button
                  key={tier.id}
                  onClick={() => setSelectedTier(tier.id)}
                  className={cn(
                    "px-2.5 py-1 rounded-lg text-xs font-semibold transition-all",
                    selectedTier === tier.id
                      ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                      : "text-gray-400 hover:text-gray-200"
                  )}
                >
                  {tier.label}
                </button>
              ))}
            </div>
          </div>

          {/* Right: View Switcher (Table / Kanban) */}
          <div className="flex items-center gap-2">
            <div className="flex items-center bg-[#08080d] p-1 rounded-xl border border-white/5">
              <button
                onClick={() => setViewMode("table")}
                className={cn(
                  "p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all",
                  viewMode === "table"
                    ? "bg-white/10 text-white"
                    : "text-gray-400 hover:text-white"
                )}
                title="Vista Tabla"
              >
                <TableIcon className="w-4 h-4" />
                <span className="hidden sm:inline">Tabla</span>
              </button>
              <button
                onClick={() => setViewMode("kanban")}
                className={cn(
                  "p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all",
                  viewMode === "kanban"
                    ? "bg-white/10 text-white"
                    : "text-gray-400 hover:text-white"
                )}
                title="Vista Kanban"
              >
                <KanbanIcon className="w-4 h-4" />
                <span className="hidden sm:inline">Kanban</span>
              </button>
            </div>

            <button
              onClick={() =>
                exportLeadsToCsv(
                  leads,
                  `leads_${campaign?.queryTerm || "vertex"}_${new Date().toISOString().slice(0, 10)}.csv`
                )
              }
              className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white transition-colors border border-white/5 text-xs font-semibold flex items-center gap-1.5"
              title="Exportar prospectos filtrados a CSV"
            >
              <Download className="w-3.5 h-3.5 text-indigo-400" />
              <span className="hidden sm:inline">Exportar CSV</span>
            </button>

            <button
              onClick={() => refetch()}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors border border-white/5"
              title="Refrescar leads"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content View: Table vs Kanban */}
        {isLoading ? (
          <div className="h-64 flex flex-col items-center justify-center space-y-3">
            <RefreshCw className="w-6 h-6 text-indigo-400 animate-spin" />
            <span className="text-xs text-gray-400 font-medium">Cargando prospectos auditados...</span>
          </div>
        ) : leads.length === 0 ? (
          <div className="p-12 text-center border border-dashed border-white/10 rounded-2xl space-y-3">
            <Flame className="w-8 h-8 text-indigo-400 mx-auto" />
            <p className="text-sm text-gray-300 font-semibold">
              No se encontraron prospectos con los filtros actuales
            </p>
            <p className="text-xs text-gray-400">
              Intenta cambiar los filtros de oportunidad o el término de búsqueda.
            </p>
          </div>
        ) : viewMode === "table" ? (
          <LeadTable
            leads={leads}
            onSelectLead={(lead) => setActiveLead(lead)}
            onSort={handleSort}
            sortField={sortBy}
            sortOrder={sortOrder}
          />
        ) : (
          <LeadKanban
            leads={leads}
            onSelectLead={(lead) => setActiveLead(lead)}
          />
        )}
      </main>

      {/* Prospect Detail & AI Outreach Modal */}
      <LeadDetailModal
        lead={activeLead}
        onClose={() => setActiveLead(null)}
        onLeadUpdated={() => refetch()}
      />
    </div>
  );
}
