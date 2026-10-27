"use client";

import React, { useState } from "react";
import { Header } from "@/components/shared/header";
import {
  ShieldCheck,
  Globe,
  Share2,
  CheckCircle2,
  Sparkles,
  Calculator,
  Building,
  Info,
  AlertTriangle,
  Layers,
  Percent,
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function ScoringEnginePage() {
  const [activeSector, setActiveSector] = useState<"HOTELS_TOURISM" | "RESTAURANTS" | "CLINICS" | "RETAIL" | "GENERAL">("HOTELS_TOURISM");

  const sectorProfiles = {
    HOTELS_TOURISM: {
      title: "Hoteles & Hospedaje",
      icon: "🏨",
      description: "Prioriza motor de reservas directas (elimina comisiones de Booking/Expedia), navegación móvil veloz, botón de WhatsApp y reputación en mapas.",
      rules: [
        { name: "Motor de Reservas Directas", weight: 30, critical: true, reason: "Mayor impacto en rentabilidad del negocio." },
        { name: "Sitio Web Corporativo Indexado", weight: 25, critical: true, reason: "Presencia institucional obligatoria." },
        { name: "Diseño Responsivo Mobile-First", weight: 15, critical: false, reason: "Navegación de turistas en smartphones." },
        { name: "Certificado SSL/HTTPS Válido", weight: 10, critical: false, reason: "Seguridad en datos de tarjeta de crédito." },
        { name: "Canal Directo de WhatsApp", weight: 10, critical: false, reason: "Consultas de tarifas y disponibilidad." },
        { name: "Ficha Google Maps Verificada", weight: 10, critical: false, reason: "Geolocalización del huésped." },
      ],
    },
    RESTAURANTS: {
      title: "Restaurantes & Gastronomía",
      icon: "🍽️",
      description: "Prioriza menú digital accesible sin descargas PDF pesadas, reservas rápidas por WhatsApp y reputación en reseñas.",
      rules: [
        { name: "Menú Digital Interactivo", weight: 35, critical: true, reason: "Elimina PDFs lentos y mejora la experiencia." },
        { name: "Canal Directo de WhatsApp", weight: 25, critical: true, reason: "Toma de pedidos y reservas de mesas." },
        { name: "Sitio Web Operativo", weight: 20, critical: false, reason: "Información de horarios y sucursales." },
        { name: "Diseño Optimizado para Celulares", weight: 10, critical: false, reason: "Búsqueda comensal sobre la marcha." },
        { name: "Ficha Google Maps Verificada", weight: 10, critical: false, reason: "Ubicación exacta y reseñas." },
      ],
    },
    CLINICS: {
      title: "Clínicas & Centros de Salud",
      icon: "🏥",
      description: "Prioriza catálogo de especialidades médicas, agendamiento de turnos, certificado SSL para datos de pacientes y contacto directo.",
      rules: [
        { name: "Sistema de Citas y Especialidades", weight: 30, critical: true, reason: "Flujo central de captación de pacientes." },
        { name: "Sitio Web Oficial Operativo", weight: 20, critical: true, reason: "Autoridad institucional y credibilidad." },
        { name: "Certificado de Seguridad SSL/HTTPS", weight: 15, critical: true, reason: "Privacidad de datos médicos sensibles." },
        { name: "Diseño Responsivo Móvil", weight: 15, critical: false, reason: "Consultas de pacientes en emergencias." },
        { name: "Canal Directo de WhatsApp", weight: 10, critical: false, reason: "Atención comercial inmediata." },
        { name: "Formulario de Contacto Seguro", weight: 10, critical: false, reason: "Recepción de órdenes médicas." },
      ],
    },
    RETAIL: {
      title: "Comercio & Retail Local",
      icon: "🛍️",
      description: "Prioriza catálogo de productos o ecommerce, canal de venta por WhatsApp y navegación móvil fluida.",
      rules: [
        { name: "Catálogo de Productos / Ecommerce", weight: 35, critical: true, reason: "Muestra visual de inventario disponible." },
        { name: "Canal de WhatsApp Comercial", weight: 20, critical: true, reason: "Comercio conversacional y ventas rápidas." },
        { name: "Sitio Web Propio Operativo", weight: 20, critical: false, reason: "Autoridad de marca frente a redes sociales." },
        { name: "Experiencia Móvil Ultrarrápida", weight: 15, critical: false, reason: "Evita abandonos en carritos de compra." },
        { name: "Certificado SSL Válido", weight: 10, critical: false, reason: "Confianza en transacciones." },
      ],
    },
    GENERAL: {
      title: "Servicios Generales & B2B",
      icon: "🏢",
      description: "Evaluación estándar para empresas de servicios profesionales, consultoría y corporativos.",
      rules: [
        { name: "Sitio Web Corporativo", weight: 25, critical: true, reason: "Presencia básica obligatoria." },
        { name: "Dominio Propio (no gratuito)", weight: 15, critical: false, reason: "Imagen profesional B2B." },
        { name: "Certificado SSL HTTPS", weight: 15, critical: false, reason: "Cifrado de navegación." },
        { name: "Diseño Responsivo", weight: 15, critical: false, reason: "Adaptación multidispositivo." },
        { name: "Canal Directo WhatsApp", weight: 15, critical: false, reason: "Atención ágil." },
        { name: "Formulario de Contacto", weight: 15, critical: false, reason: "Captura de leads." },
      ],
    },
  };

  const currentSector = sectorProfiles[activeSector];

  return (
    <div className="flex-1 flex flex-col min-h-screen">
      <Header
        title="Motor de Scoring Determinista Explicable"
        subtitle="Evaluación multi-dimensional, perfiles sectoriales y umbral de evidencia verificada"
      />

      <main className="p-8 max-w-6xl w-full mx-auto space-y-8">
        {/* Hero Explanation Banner */}
        <div className="p-8 rounded-3xl bg-gradient-to-r from-indigo-950/70 via-purple-950/40 to-[#0e0e17] border border-indigo-500/20 backdrop-blur-xl shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-xs font-semibold">
              <Calculator className="w-3.5 h-3.5" />
              <span>Modelo Multi-Dimensional Explicable (v2.1)</span>
            </div>
            <h2 className="text-2xl font-black text-white">
              Scoring Comercial Basado en Evidencia Verificada
            </h2>
            <p className="text-xs text-gray-300 max-w-2xl leading-relaxed">
              El motor reemplaza la heurística inversa tradicional con 3 dimensiones objetivas independientes del modelo de lenguaje: <strong>Necesidad Digital</strong>, <strong>Ajuste con Servicios VERTEX</strong> y <strong>Confianza de Evidencia</strong>. Ningún score se presenta como probabilidad calibrada de compra.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-[#08080d]/90 border border-indigo-500/30 text-center shrink-0 space-y-1">
            <span className="text-[10px] font-bold text-gray-400 uppercase">Fórmula Normalizada</span>
            <div className="text-xs font-mono font-bold text-indigo-300">
              Oportunidad = (0.55 × Necesidad) + (0.45 × Ajuste)
            </div>
            <div className="text-[10px] text-amber-400 font-medium pt-1 border-t border-white/5">
              Condicionado a Cobertura ≥ 40%
            </div>
          </div>
        </div>

        {/* 3 Inspectable Dimensions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-3xl bg-[#0e0e17]/80 border border-white/5 space-y-3 shadow-xl">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center font-bold">
              1
            </div>
            <h3 className="text-sm font-bold text-white">Necesidad Digital (0-100)</h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              Cuantifica las brechas tecnológicas ausentes o defectuosas según los requerimientos del sector del negocio.
            </p>
            <div className="p-3 rounded-xl bg-white/[0.02] text-[11px] text-gray-300 border border-white/5 space-y-1">
              <strong className="text-white block font-semibold">Regla matemática estricta:</strong>
              <span>Los estados <em>DESCONOCIDO</em> o <em>BLOQUEADO</em> nunca incrementan la necesidad ni penalizan al prospecto.</span>
            </div>
          </div>

          <div className="p-6 rounded-3xl bg-[#0e0e17]/80 border border-white/5 space-y-3 shadow-xl">
            <div className="w-10 h-10 rounded-2xl bg-purple-500/10 text-purple-400 flex items-center justify-center font-bold">
              2
            </div>
            <h3 className="text-sm font-bold text-white">Ajuste de Servicios (0-100)</h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              Mide la sinergia comercial directa entre los problemas verificados y las soluciones activas en el catálogo de VERTEX.
            </p>
            <div className="p-3 rounded-xl bg-white/[0.02] text-[11px] text-gray-300 border border-white/5 space-y-1">
              <strong className="text-white block font-semibold">Soluciones asociadas:</strong>
              <span>Desarrollo Web, Agendamiento, Menús Digitales, WhatsApp CRM, SEO Técnico y Seguridad SSL.</span>
            </div>
          </div>

          <div className="p-6 rounded-3xl bg-[#0e0e17]/80 border border-white/5 space-y-3 shadow-xl">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold">
              3
            </div>
            <h3 className="text-sm font-bold text-white">Confianza de Evidencia (0-100)</h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              Mide el porcentaje de verificaciones concretadas sobre páginas públicas accesibles y la actualidad de la auditoría.
            </p>
            <div className="p-3 rounded-xl bg-amber-500/10 text-[11px] text-amber-300 border border-amber-500/20 space-y-1">
              <strong className="block font-semibold">Umbral de Cobertura (Gate):</strong>
              <span>Bajo el 40% de cobertura, se marca como <em>"Evidencia insuficiente"</em> y no califica a prioridad alta.</span>
            </div>
          </div>
        </div>

        {/* Sector Profile Rules Matrix */}
        <div className="p-6 rounded-3xl bg-[#0e0e17]/90 border border-white/5 space-y-6 shadow-xl">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-4">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Building className="w-4 h-4 text-indigo-400" />
                <span>Matrices de Ponderación por Sector Económico</span>
              </h3>
              <p className="text-xs text-gray-400 mt-0.5">
                Cada industria tiene necesidades digitales particulares. Un restaurante no requiere motor hotelero.
              </p>
            </div>

            {/* Sector switcher */}
            <div className="flex flex-wrap items-center gap-1.5 bg-[#08080d] p-1 rounded-xl border border-white/5">
              {(Object.keys(sectorProfiles) as Array<keyof typeof sectorProfiles>).map((key) => (
                <button
                  key={key}
                  onClick={() => setActiveSector(key)}
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1",
                    activeSector === key
                      ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                      : "text-gray-400 hover:text-white"
                  )}
                >
                  <span>{sectorProfiles[key].icon}</span>
                  <span>{sectorProfiles[key].title}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-1">
            <span className="text-xs font-bold text-indigo-400 uppercase">Criterio Operativo:</span>
            <p className="text-xs text-gray-300 leading-relaxed">{currentSector.description}</p>
          </div>

          {/* Rules Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-white/5 text-[11px] font-bold text-gray-400 uppercase">
                  <th className="py-2.5 px-3">Capacidad Evaluada</th>
                  <th className="py-2.5 px-3 text-center">Peso Relativo</th>
                  <th className="py-2.5 px-3">Impacto Comercial para el Sector</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {currentSector.rules.map((rule, idx) => (
                  <tr key={idx} className="hover:bg-white/[0.01]">
                    <td className="py-3 px-3 font-medium text-white flex items-center gap-2">
                      {rule.critical ? (
                        <span className="w-2 h-2 rounded-full bg-red-400 shrink-0" title="Crítico" />
                      ) : (
                        <span className="w-2 h-2 rounded-full bg-indigo-400 shrink-0" title="Estándar" />
                      )}
                      <span>{rule.name}</span>
                    </td>
                    <td className="py-3 px-3 text-center font-mono font-bold text-indigo-400">
                      {rule.weight} pts
                    </td>
                    <td className="py-3 px-3 text-gray-400 leading-relaxed">
                      {rule.reason}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
