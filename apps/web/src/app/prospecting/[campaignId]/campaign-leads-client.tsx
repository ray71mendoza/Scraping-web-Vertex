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
  Trash2,
  Plus,
  Building,
  Mail,
  MessageCircle,
  RotateCcw,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { exportLeadsToCsv } from "@/lib/export-csv";
import Link from "next/link";

export default function CampaignLeadsClient() {
  const params = useParams();
  const rawParam = (params?.campaignId as string) || "default";
  const [campaignId, setCampaignId] = useState<string>(rawParam);

  React.useEffect(() => {
    if (typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search);
      const queryId = urlParams.get("id");
      if (queryId) {
        setCampaignId(queryId);
        return;
      }
      const parts = window.location.pathname.split("/").filter(Boolean);
      const last = parts[parts.length - 1];
      if (last && last !== "prospecting" && last !== "default") {
        setCampaignId(last);
      } else if (rawParam && rawParam !== "default") {
        setCampaignId(rawParam);
      }
    }
  }, [rawParam]);

  const [viewMode, setViewMode] = useState<"table" | "kanban">("table");
  const [selectedTier, setSelectedTier] = useState<string>("ALL");
  const [selectedSector, setSelectedSector] = useState<string>("ALL");
  const [selectedContactChannel, setSelectedContactChannel] = useState<string>("ALL");
  const [selectedDeliveryStatus, setSelectedDeliveryStatus] = useState<string>("ALL");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [sortBy, setSortBy] = useState<"opportunityScore" | "businessName" | "googleRating">("opportunityScore");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [activeLead, setActiveLead] = useState<Lead | null>(null);

  const handleClearDatabase = async () => {
    const confirmClear = window.confirm(
      "¿Deseas limpiar todas las búsquedas anteriores para comenzar una prospección completamente limpia?"
    );
    if (!confirmClear) return;
    await api.clearAllData();
    window.location.href = "/prospecting/new";
  };

  const handleResetFilters = () => {
    setSelectedTier("ALL");
    setSelectedSector("ALL");
    setSelectedContactChannel("ALL");
    setSelectedDeliveryStatus("ALL");
    setSearchTerm("");
  };

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

  // Fetch leads with composable filters
  const {
    data: leadsResponse,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: [
      "leads",
      campaignId,
      selectedTier,
      selectedSector,
      selectedContactChannel,
      selectedDeliveryStatus,
      searchTerm,
      sortBy,
      sortOrder,
    ],
    queryFn: () =>
      api.getLeads({
        campaignId,
        opportunityTier: selectedTier !== "ALL" ? (selectedTier as OpportunityLevel) : undefined,
        sector: selectedSector !== "ALL" ? selectedSector : undefined,
        contactChannel: selectedContactChannel !== "ALL" ? selectedContactChannel : undefined,
        deliveryStatus: selectedDeliveryStatus !== "ALL" ? selectedDeliveryStatus : undefined,
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
            <span className="text-[11px] font-bold text-indigo-400 uppercase">Score Promedio</span>
            <div className="text-xl font-black text-indigo-300 font-mono">
              {stats?.avgOpportunityScore ?? 0}/100
            </div>
          </div>
        </div>

        {/* Controls Toolbar: Search & Primary Filters */}
        <div className="flex flex-col space-y-4 p-4 rounded-2xl bg-[#0e0e17]/80 border border-white/5 backdrop-blur-xl">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            {/* Left: Search & Filter Tabs */}
            <div className="flex flex-wrap items-center gap-3">
              {/* Search Input */}
              <div className="relative min-w-[220px]">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Buscar negocio o dirección..."
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
                title="Refrescar prospectos"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Composable Filters Row: Sector & Contact Channels */}
          <div className="pt-2 border-t border-white/5 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex flex-wrap items-center gap-3">
              {/* Sector selector */}
              <div className="flex items-center gap-1.5">
                <span className="text-gray-400 text-[11px] font-bold uppercase">Sector:</span>
                <select
                  value={selectedSector}
                  onChange={(e) => setSelectedSector(e.target.value)}
                  className="bg-[#08080d] border border-white/10 rounded-lg px-2.5 py-1 text-xs text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="ALL">Todos los sectores</option>
                  <option value="HOTELS_TOURISM">Hoteles & Turismo</option>
                  <option value="RESTAURANTS">Restaurantes & Bares</option>
                  <option value="CLINICS">Clínicas & Salud</option>
                  <option value="RETAIL">Comercio & Retail</option>
                  <option value="GENERAL">Servicios Generales B2B</option>
                </select>
              </div>

              {/* Contact channel filter */}
              <div className="flex items-center gap-1.5">
                <span className="text-gray-400 text-[11px] font-bold uppercase">Contacto:</span>
                <select
                  value={selectedContactChannel}
                  onChange={(e) => setSelectedContactChannel(e.target.value)}
                  className="bg-[#08080d] border border-white/10 rounded-lg px-2.5 py-1 text-xs text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="ALL">Cualquier canal</option>
                  <option value="EMAIL">Con Correo Electrónico</option>
                  <option value="WHATSAPP">Con WhatsApp / Teléfono</option>
                  <option value="BOTH">Ambos Canales Disponibles</option>
                  <option value="NEITHER">Sin Datos de Contacto</option>
                </select>
              </div>

              {/* Delivery status filter */}
              <div className="flex items-center gap-1.5">
                <span className="text-gray-400 text-[11px] font-bold uppercase">Envío:</span>
                <select
                  value={selectedDeliveryStatus}
                  onChange={(e) => setSelectedDeliveryStatus(e.target.value)}
                  className="bg-[#08080d] border border-white/10 rounded-lg px-2.5 py-1 text-xs text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="ALL">Todos los estados</option>
                  <option value="NOT_SENT">No contactados</option>
                  <option value="ACCEPTED">Aceptado por proveedor</option>
                </select>
              </div>
            </div>

            {/* Reset filters button */}
            {(selectedTier !== "ALL" || selectedSector !== "ALL" || selectedContactChannel !== "ALL" || selectedDeliveryStatus !== "ALL" || searchTerm) && (
              <button
                onClick={handleResetFilters}
                className="text-[11px] text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Restablecer filtros</span>
              </button>
            )}
          </div>
        </div>

        {/* Leads Render (Table or Kanban) */}
        {isLoading ? (
          <div className="p-12 text-center text-gray-400">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-indigo-400" />
            <p className="text-sm">Cargando prospectos...</p>
          </div>
        ) : leads.length === 0 ? (
          <div className="p-16 text-center rounded-3xl bg-[#0e0e17]/40 border border-white/5 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center mx-auto">
              <Compass className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">No se encontraron prospectos con estos filtros</h3>
              <p className="text-xs text-gray-400 mt-1 max-w-sm mx-auto">
                Prueba relajando los filtros de sector o canales de contacto, o lanza una nueva prospección geolocalizada.
              </p>
            </div>
            <button
              onClick={handleResetFilters}
              className="btn-ghost text-xs font-semibold py-2 px-4 rounded-xl border border-white/10"
            >
              Restablecer filtros
            </button>
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
            onStatusChange={async (leadId, newStatus) => {
              await api.updateLeadStatus(leadId, newStatus);
              refetch();
            }}
          />
        )}

        {/* Global Reset / Clear Database */}
        <div className="pt-6 border-t border-white/5 flex items-center justify-between">
          <Link
            href="/prospecting/new"
            className="btn-accent text-xs font-semibold py-2 px-4 rounded-xl flex items-center gap-1.5 shadow-lg shadow-indigo-600/20"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Nueva Búsqueda</span>
          </Link>

          <button
            onClick={handleClearDatabase}
            className="text-xs text-red-400/60 hover:text-red-400 flex items-center gap-1.5 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Limpiar base de datos y comenzar de cero</span>
          </button>
        </div>
      </main>

      {/* Interactive Detail Modal with Explainable Scoring & Direct Outreach */}
      <LeadDetailModal
        lead={activeLead}
        onClose={() => setActiveLead(null)}
        onLeadUpdated={() => {
          refetch();
        }}
      />
    </div>
  );
}
