"use client";

import React from "react";
import { Header } from "@/components/shared/header";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import Link from "next/link";
import {
  Compass,
  ArrowRight,
  TrendingUp,
  Building2,
  Users,
  Target,
  Sparkles,
} from "lucide-react";

export default function DashboardHomePage() {
  const { data: campaigns, isLoading } = useQuery({
    queryKey: ["campaigns"],
    queryFn: () => api.getCampaigns(),
  });

  return (
    <div className="flex-1 flex flex-col min-h-screen">
      <Header
        title="Centro de Prospección VERTEX"
        subtitle="Monitorea tus campañas activas y prospectos calificados con IA"
      />

      <main className="p-8 max-w-7xl w-full mx-auto space-y-8">
        {/* Top Hero Banner */}
        <div className="p-8 rounded-3xl bg-gradient-to-r from-indigo-950/50 via-purple-950/30 to-[#0c0c14] border border-indigo-500/20 relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-2xl">
          <div className="space-y-2 z-10">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Scoring Determinista + GPT-4o</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-black text-white">
              Encuentra PYMES con brecha digital en minutos
            </h2>
            <p className="text-xs md:text-sm text-gray-400 max-w-xl">
              Descubre negocios en Google Maps, analiza automáticamente su presencia web, SSL, CMS y redes, y genera propuestas comerciales de alto impacto.
            </p>
          </div>

          <Link
            href="/prospecting/new"
            className="btn-accent text-sm font-bold px-6 py-3.5 shadow-xl shadow-indigo-600/30 shrink-0 z-10"
          >
            <Compass className="w-4 h-4" />
            <span>Iniciar Nueva Búsqueda</span>
          </Link>

          {/* Background Glow */}
          <div className="absolute -right-20 -top-20 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 space-y-2">
            <div className="flex items-center justify-between text-gray-400">
              <span className="text-xs font-bold uppercase tracking-wider">Campañas Activas</span>
              <Target className="w-4 h-4 text-indigo-400" />
            </div>
            <div className="text-2xl font-black text-white font-mono">
              {campaigns?.length ?? 0}
            </div>
            <div className="text-xs text-emerald-400 font-medium flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5" /> +100% efectividad
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 space-y-2">
            <div className="flex items-center justify-between text-gray-400">
              <span className="text-xs font-bold uppercase tracking-wider">Prospectos Encontrados</span>
              <Building2 className="w-4 h-4 text-purple-400" />
            </div>
            <div className="text-2xl font-black text-white font-mono">
              {campaigns?.reduce((acc, c) => acc + (c.totalFound || 0), 0) ?? 0}
            </div>
            <div className="text-xs text-gray-400 font-medium">
              Auditados por el worker de Playwright
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 space-y-2">
            <div className="flex items-center justify-between text-gray-400">
              <span className="text-xs font-bold uppercase tracking-wider">Créditos de Extracción</span>
              <Users className="w-4 h-4 text-pink-400" />
            </div>
            <div className="text-2xl font-black text-white font-mono">
              980 / 1,000
            </div>
            <div className="text-xs text-indigo-400 font-medium">
              FieldMasks optimizados activos
            </div>
          </div>
        </div>

        {/* Campaigns List */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white">Campañas de Prospección</h3>
            <Link
              href="/prospecting/new"
              className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1"
            >
              <span>Nueva Búsqueda</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {campaigns?.map((c) => (
              <Link
                key={c.id}
                href={`/prospecting/${c.id}`}
                className="p-5 rounded-2xl bg-[#0e0e17]/80 border border-white/5 hover:border-indigo-500/30 transition-all duration-200 group flex flex-col justify-between h-44 shadow-lg hover:shadow-indigo-500/10"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
                      {c.status}
                    </span>
                    <span className="text-xs text-gray-400 font-mono">
                      {new Date(c.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <h4 className="font-extrabold text-base text-white group-hover:text-indigo-300 transition-colors">
                    {c.queryTerm}
                  </h4>
                  <p className="text-xs text-gray-400 mt-1">{c.location}</p>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-white/5 text-xs text-gray-400">
                  <span>
                    Radio: <strong className="text-gray-300">{(c.radiusMeters / 1000).toFixed(0)} km</strong>
                  </span>
                  <div className="flex items-center gap-1 font-semibold text-white group-hover:text-indigo-300">
                    <span>Ver Leads</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              </Link>
            ))}

            {(!campaigns || campaigns.length === 0) && !isLoading && (
              <div className="col-span-full p-12 text-center border border-dashed border-white/10 rounded-2xl space-y-3">
                <Compass className="w-8 h-8 text-indigo-400 mx-auto" />
                <p className="text-sm text-gray-300 font-semibold">
                  Aún no tienes campañas de prospección creadas
                </p>
                <p className="text-xs text-gray-400 max-w-sm mx-auto">
                  Comienza descubriendo negocios en Google Places según tu nicho objetivo y ubicación geográfica.
                </p>
                <Link href="/prospecting/new" className="btn-accent text-xs mt-2 inline-flex">
                  Lanzar Primera Campaña
                </Link>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
