"use client";

import React, { useState } from "react";
import { Header } from "@/components/shared/header";
import { SEARCH_CATEGORIES } from "@vertex/shared";
import { api } from "@/lib/api-client";
import { useRouter } from "next/navigation";
import {
  Compass,
  MapPin,
  Sliders,
  Sparkles,
  Coins,
  Loader2,
  CheckCircle2,
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function NewProspectingPage() {
  const router = useRouter();

  const [selectedCategory, setSelectedCategory] = useState<string>("veterinarias");
  const [customTerm, setCustomTerm] = useState<string>("");
  const [location, setLocation] = useState<string>("Cartagena, Colombia");
  const [radiusKm, setRadiusKm] = useState<number>(10);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const queryTermToUse = customTerm.trim() || selectedCategory;

  // Estimated credits cost based on search radius
  const estimatedCredits = Math.min(Math.round(radiusKm * 1.5 + 5), 30);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!queryTermToUse || !location) return;

    try {
      setIsSubmitting(true);
      const res = await api.createCampaign({
        queryTerm: queryTermToUse,
        location,
        radiusMeters: radiusKm * 1000,
      });

      router.push(`/prospecting/${res.id}`);
    } catch (err) {
      alert("Error al iniciar campaña: " + (err as any)?.message);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col min-h-screen">
      <Header
        title="Nueva Prospección"
        subtitle="Configura los parámetros de búsqueda para descubrir leads con Google Places API"
      />

      <main className="p-8 max-w-4xl w-full mx-auto space-y-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Card: Category & Niche */}
          <div className="p-6 rounded-3xl bg-[#0e0e17]/80 border border-white/5 space-y-5 backdrop-blur-xl shadow-xl">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center font-bold text-xs">
                1
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Nicho o Categoría de Negocio</h3>
                <p className="text-xs text-gray-400">Selecciona una categoría predefinida o escribe una personalizada</p>
              </div>
            </div>

            {/* Category Tags */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
              {SEARCH_CATEGORIES.map((cat) => {
                const isSelected = selectedCategory === cat.value && !customTerm;
                return (
                  <button
                    type="button"
                    key={cat.value}
                    onClick={() => {
                      setSelectedCategory(cat.value);
                      setCustomTerm("");
                    }}
                    className={cn(
                      "p-3 rounded-xl text-left border text-xs font-semibold flex items-center gap-2 transition-all",
                      isSelected
                        ? "bg-indigo-600/20 text-indigo-300 border-indigo-500/40 shadow-inner"
                        : "bg-white/[0.02] text-gray-400 border-white/5 hover:border-white/15 hover:text-gray-200"
                    )}
                  >
                    <span>{cat.icon}</span>
                    <span className="truncate">{cat.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Custom Term Input */}
            <div className="pt-2">
              <label className="text-xs text-gray-400 font-medium block mb-1.5">
                O escribe un término específico (ej: "Estudios de Yoga", "Escuelas de Conducción")
              </label>
              <input
                type="text"
                value={customTerm}
                onChange={(e) => setCustomTerm(e.target.value)}
                placeholder="Escribe tu nicho personalizado..."
                className="w-full bg-[#08080d] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white placeholder:text-gray-400 focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>
          </div>

          {/* Card: Location & Radius */}
          <div className="p-6 rounded-3xl bg-[#0e0e17]/80 border border-white/5 space-y-6 backdrop-blur-xl shadow-xl">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center font-bold text-xs">
                2
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Ubicación y Cobertura Geográfica</h3>
                <p className="text-xs text-gray-400">Define la ciudad y el radio de exploración en kilómetros</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs text-gray-400 font-medium block mb-1.5 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Ciudad o Dirección Base</span>
                </label>
                <input
                  type="text"
                  required
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Ej: Cartagena, Colombia | Bogotá, Colombia | Ciudad de México..."
                  className="w-full bg-[#08080d] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white placeholder:text-gray-400 focus:outline-none focus:border-indigo-500 transition-colors"
                />
                {/* Quick City Presets */}
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {[
                    "Cartagena, Colombia",
                    "Barranquilla, Colombia",
                    "Bogotá, Colombia",
                    "Medellín, Colombia",
                    "Cali, Colombia",
                    "Ciudad de México",
                    "Miami, EE.UU."
                  ].map((city) => (
                    <button
                      key={city}
                      type="button"
                      onClick={() => setLocation(city)}
                      className={cn(
                        "text-[11px] px-2.5 py-1 rounded-lg border transition-all",
                        location === city
                          ? "bg-indigo-600/20 text-indigo-300 border-indigo-500/40"
                          : "bg-white/[0.02] text-gray-400 border-white/5 hover:border-white/15 hover:text-white"
                      )}
                    >
                      {city}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between text-xs mb-2">
                  <label className="text-gray-400 font-medium flex items-center gap-1.5">
                    <Sliders className="w-3.5 h-3.5 text-purple-400" />
                    <span>Radio de Búsqueda</span>
                  </label>
                  <span className="font-mono font-bold text-indigo-400 text-sm">
                    {radiusKm} km
                  </span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="50"
                  step="1"
                  value={radiusKm}
                  onChange={(e) => setRadiusKm(Number(e.target.value))}
                  className="w-full h-2 bg-[#08080d] rounded-lg appearance-none cursor-pointer accent-indigo-500"
                />
                <div className="flex justify-between text-[10px] text-gray-400 mt-1">
                  <span>1 km (Local)</span>
                  <span>25 km (Metropolitano)</span>
                  <span>50 km (Regional)</span>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Launch Bar */}
          <div className="p-6 rounded-3xl bg-gradient-to-r from-[#0c0c14] to-indigo-950/40 border border-indigo-500/20 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-2xl">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-bold text-white flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Modo Búsqueda Ilimitada VERTEX SAS</span>
                </div>
                <p className="text-[11px] text-gray-400 mt-0.5">
                  Descubre 50 prospectos locales por búsqueda con auditoría digital, WhatsApp directo y propuesta comercial generada.
                </p>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-accent text-sm font-bold px-8 py-3.5 shadow-xl shadow-indigo-600/30 w-full sm:w-auto"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Descubriendo Leads...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Lanzar Prospección</span>
                </>
              )}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
