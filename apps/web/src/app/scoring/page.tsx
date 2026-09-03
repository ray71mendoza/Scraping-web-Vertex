"use client";

import React from "react";
import { Header } from "@/components/shared/header";
import { SCORING_WEIGHTS } from "@vertex/shared";
import {
  Flame,
  Globe,
  Share2,
  Star,
  CheckCircle2,
  Sparkles,
  Calculator,
  Shield,
} from "lucide-react";

export default function ScoringEnginePage() {
  return (
    <div className="flex-1 flex flex-col min-h-screen">
      <Header
        title="Motor de Scoring Determinista"
        subtitle="Reglas algorítmicas de auditoría digital y cálculo de oportunidad comercial"
      />

      <main className="p-8 max-w-6xl w-full mx-auto space-y-8">
        {/* Formula Hero Banner */}
        <div className="p-8 rounded-3xl bg-gradient-to-r from-indigo-950/60 via-purple-950/40 to-[#0e0e17] border border-indigo-500/20 backdrop-blur-xl shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-xs font-semibold">
              <Calculator className="w-3.5 h-3.5" />
              <span>Regla de Oportunidad Inversa</span>
            </div>
            <h2 className="text-2xl font-black text-white">
              Cálculo Algorítmico de Madurez Digital (0 a 100)
            </h2>
            <p className="text-xs text-gray-300 max-w-2xl leading-relaxed">
              El motor evalúa 10 factores objetivos sin intervención humana. A menor digitalización del negocio, mayor es la oportunidad comercial de venta para servicios de desarrollo web, agendamiento y automatización.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-[#08080d]/80 border border-indigo-500/30 text-center shrink-0">
            <span className="text-[10px] font-bold text-gray-400 uppercase">Fórmula de Negocio</span>
            <div className="text-base font-black font-mono text-indigo-300 mt-1">
              Opportunity = 100 - Digital
            </div>
          </div>
        </div>

        {/* 3 Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Web Presence (40 pts) */}
          <div className="p-6 rounded-3xl bg-[#0e0e17]/80 border border-white/5 space-y-4 backdrop-blur-xl shadow-xl flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center">
                  <Globe className="w-5 h-5" />
                </div>
                <span className="text-xs font-extrabold text-blue-400 bg-blue-500/10 border border-blue-500/20 px-2.5 py-1 rounded-full">
                  40 Puntos Máx
                </span>
              </div>
              <h3 className="text-sm font-bold text-white">Presencia Web & SEO</h3>
              <p className="text-xs text-gray-400 mt-1">Infraestructura y calidad técnica del sitio web</p>

              <div className="space-y-2.5 mt-5 text-xs">
                <div className="flex items-center justify-between p-2 rounded-lg bg-white/[0.02]">
                  <span className="text-gray-300">Tiene Sitio Web Activo</span>
                  <span className="font-mono font-bold text-emerald-400">+{SCORING_WEIGHTS.WEB_PRESENCE.HAS_WEBSITE} pts</span>
                </div>
                <div className="flex items-center justify-between p-2 rounded-lg bg-white/[0.02]">
                  <span className="text-gray-300">Certificado SSL Válido (HTTPS)</span>
                  <span className="font-mono font-bold text-emerald-400">+{SCORING_WEIGHTS.WEB_PRESENCE.HAS_SSL} pts</span>
                </div>
                <div className="flex items-center justify-between p-2 rounded-lg bg-white/[0.02]">
                  <span className="text-gray-300">Dominio Propio (No Wix/WP free)</span>
                  <span className="font-mono font-bold text-emerald-400">+{SCORING_WEIGHTS.WEB_PRESENCE.HAS_CUSTOM_DOMAIN} pts</span>
                </div>
                <div className="flex items-center justify-between p-2 rounded-lg bg-white/[0.02]">
                  <span className="text-gray-300">Diseño Responsivo / PWA</span>
                  <span className="font-mono font-bold text-emerald-400">+{SCORING_WEIGHTS.WEB_PRESENCE.IS_RESPONSIVE_PWA} pts</span>
                </div>
                <div className="flex items-center justify-between p-2 rounded-lg bg-white/[0.02]">
                  <span className="text-gray-300">Metatags OpenGraph para Redes</span>
                  <span className="font-mono font-bold text-emerald-400">+{SCORING_WEIGHTS.WEB_PRESENCE.HAS_META_OG} pts</span>
                </div>
              </div>
            </div>
          </div>

          {/* Social Channels (30 pts) */}
          <div className="p-6 rounded-3xl bg-[#0e0e17]/80 border border-white/5 space-y-4 backdrop-blur-xl shadow-xl flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="w-9 h-9 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center">
                  <Share2 className="w-5 h-5" />
                </div>
                <span className="text-xs font-extrabold text-purple-400 bg-purple-500/10 border border-purple-500/20 px-2.5 py-1 rounded-full">
                  30 Puntos Máx
                </span>
              </div>
              <h3 className="text-sm font-bold text-white">Canales Directos & Redes</h3>
              <p className="text-xs text-gray-400 mt-1">Conectividad comercial y atención directa</p>

              <div className="space-y-2.5 mt-5 text-xs">
                <div className="flex items-center justify-between p-2 rounded-lg bg-white/[0.02]">
                  <span className="text-gray-300">Instagram o Facebook Activo</span>
                  <span className="font-mono font-bold text-purple-400">+{SCORING_WEIGHTS.SOCIAL_CHANNELS.HAS_SOCIAL_MEDIA} pts</span>
                </div>
                <div className="flex items-center justify-between p-2 rounded-lg bg-white/[0.02]">
                  <span className="text-gray-300">Botón / Enlace Directo WhatsApp</span>
                  <span className="font-mono font-bold text-purple-400">+{SCORING_WEIGHTS.SOCIAL_CHANNELS.HAS_WHATSAPP} pts</span>
                </div>
              </div>
            </div>
          </div>

          {/* Reputation (30 pts) */}
          <div className="p-6 rounded-3xl bg-[#0e0e17]/80 border border-white/5 space-y-4 backdrop-blur-xl shadow-xl flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
                  <Star className="w-5 h-5" />
                </div>
                <span className="text-xs font-extrabold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded-full">
                  30 Puntos Máx
                </span>
              </div>
              <h3 className="text-sm font-bold text-white">Reputación Google Maps</h3>
              <p className="text-xs text-gray-400 mt-1">Autoridad local y volumen de clientes</p>

              <div className="space-y-2.5 mt-5 text-xs">
                <div className="flex items-center justify-between p-2 rounded-lg bg-white/[0.02]">
                  <span className="text-gray-300">Más de 20 Reseñas en Maps</span>
                  <span className="font-mono font-bold text-amber-400">+{SCORING_WEIGHTS.REPUTATION.REVIEWS_ABOVE_20} pts</span>
                </div>
                <div className="flex items-center justify-between p-2 rounded-lg bg-white/[0.02]">
                  <span className="text-gray-300">Calificación Mayor a 4.0 ★</span>
                  <span className="font-mono font-bold text-amber-400">+{SCORING_WEIGHTS.REPUTATION.RATING_ABOVE_4} pts</span>
                </div>
                <div className="flex items-center justify-between p-2 rounded-lg bg-white/[0.02]">
                  <span className="text-gray-300">Perfil Completo con Teléfono</span>
                  <span className="font-mono font-bold text-amber-400">+{SCORING_WEIGHTS.REPUTATION.COMPLETE_PROFILE} pts</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Severity Tiers Breakdown */}
        <div className="p-6 rounded-3xl bg-[#0e0e17]/80 border border-white/5 space-y-4 backdrop-blur-xl shadow-xl">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Flame className="w-4 h-4 text-indigo-400" />
            <span>Niveles de Prioridad Comercial</span>
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
            <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 space-y-1">
              <span className="font-bold text-red-400 uppercase">Oportunidad Crítica</span>
              <p className="text-gray-300 font-mono">Score 80 a 100</p>
              <p className="text-[11px] text-gray-400 mt-1">Sin web o web muy precaria. Cliente ideal para paquete completo.</p>
            </div>
            <div className="p-4 rounded-2xl bg-orange-500/10 border border-orange-500/20 space-y-1">
              <span className="font-bold text-orange-400 uppercase">Oportunidad Alta</span>
              <p className="text-gray-300 font-mono">Score 60 a 79</p>
              <p className="text-[11px] text-gray-400 mt-1">Web en subdominio gratuito o sin SSL/WhatsApp.</p>
            </div>
            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 space-y-1">
              <span className="font-bold text-amber-400 uppercase">Oportunidad Media</span>
              <p className="text-gray-300 font-mono">Score 40 a 59</p>
              <p className="text-[11px] text-gray-400 mt-1">Presencia básica establecida. Venta de automatización.</p>
            </div>
            <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 space-y-1">
              <span className="font-bold text-emerald-400 uppercase">Oportunidad Baja</span>
              <p className="text-gray-300 font-mono">Score 0 a 39</p>
              <p className="text-[11px] text-gray-400 mt-1">Negocio con alta digitalización y múltiples canales activos.</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
