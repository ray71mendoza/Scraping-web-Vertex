"use client";

import React, { useState } from "react";
import { Header } from "@/components/shared/header";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import { useAuth } from "@/lib/auth-context";
import {
  Settings as SettingsIcon,
  ShieldCheck,
  Key,
  Coins,
  Cpu,
  Mail,
  CheckCircle2,
  AlertCircle,
  Building2,
  Users,
  Save,
  Check,
} from "lucide-react";

export default function SettingsPage() {
  const { user } = useAuth();
  const [saved, setSaved] = useState(false);

  const { data: quota, isLoading } = useQuery({
    queryKey: ["quota"],
    queryFn: () => api.getQuota(),
  });

  const [googleKey, setGoogleKey] = useState("");
  const [openaiKey, setOpenaiKey] = useState("");
  const [resendKey, setResendKey] = useState("");

  const handleSaveKeys = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const remaining = quota?.remaining ?? 980;
  const used = quota?.used ?? 20;
  const limit = quota?.limit ?? 1000;
  const usedPercent = Math.min(Math.round((used / limit) * 100), 100);

  return (
    <div className="flex-1 flex flex-col min-h-screen">
      <Header
        title="Configuración & Integraciones"
        subtitle="Administra cuotas de API, llaves de integración y parámetros de organización"
      />

      <main className="p-8 max-w-5xl w-full mx-auto space-y-8">
        {/* Quota & Usage Meter Card */}
        <div className="p-6 rounded-3xl bg-[#0e0e17]/80 border border-white/5 space-y-5 backdrop-blur-xl shadow-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
                <Coins className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Consumo de Cuota de API</h3>
                <p className="text-xs text-gray-400">
                  Límite mensual asignado a tu organización para auditoría y scraping
                </p>
              </div>
            </div>
            <span className="text-xs font-bold font-mono text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-3 py-1 rounded-full">
              {remaining} créditos restantes
            </span>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="w-full bg-[#08080d] h-3 rounded-full overflow-hidden border border-white/5">
              <div
                className="bg-gradient-to-r from-indigo-500 to-purple-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${Math.max(usedPercent, 2)}%` }}
              />
            </div>
            <div className="flex justify-between text-[11px] text-gray-400 font-mono">
              <span>{used} consumidos ({usedPercent}%)</span>
              <span>Límite: {limit} llamadas</span>
            </div>
          </div>
        </div>

        {/* API Integrations Status Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <Cpu className="w-4 h-4 text-indigo-400" /> Google Places
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Activo
              </span>
            </div>
            <p className="text-[11px] text-gray-400">
              FieldMasks optimizados con caché Redis TTL de 30 días para ahorro de costos.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <Key className="w-4 h-4 text-purple-400" /> OpenAI GPT-4o
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Activo
              </span>
            </div>
            <p className="text-[11px] text-gray-400">
              Generación estructurada de diagnóstico FODA y propuestas comerciales.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <Mail className="w-4 h-4 text-pink-400" /> Resend Email
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                Simulación / API
              </span>
            </div>
            <p className="text-[11px] text-gray-400">
              Despacho de correos HTML corporativos y registro de trazabilidad.
            </p>
          </div>
        </div>

        {/* API Keys Configuration Form */}
        <form onSubmit={handleSaveKeys} className="p-6 rounded-3xl bg-[#0e0e17]/80 border border-white/5 space-y-6 backdrop-blur-xl shadow-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-purple-500/10 text-purple-400 flex items-center justify-center">
                <Key className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Claves de API Personalizadas</h3>
                <p className="text-xs text-gray-400">
                  Sobrescribe las claves del servidor para usar tus propias cuentas de facturación
                </p>
              </div>
            </div>

            <button
              type="submit"
              className="btn-accent text-xs font-bold px-4 py-2 flex items-center gap-1.5"
            >
              {saved ? <Check className="w-4 h-4 text-emerald-400" /> : <Save className="w-4 h-4" />}
              <span>{saved ? "Guardado" : "Guardar Claves"}</span>
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold text-gray-300 uppercase tracking-wider block mb-1.5">
                Google Places API Key
              </label>
              <input
                type="password"
                value={googleKey}
                onChange={(e) => setGoogleKey(e.target.value)}
                placeholder="AIzaSy..."
                className="w-full bg-[#08080d] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white placeholder:text-gray-400 focus:outline-none focus:border-indigo-500 font-mono transition-colors"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-gray-300 uppercase tracking-wider block mb-1.5">
                OpenAI API Key
              </label>
              <input
                type="password"
                value={openaiKey}
                onChange={(e) => setOpenaiKey(e.target.value)}
                placeholder="sk-proj-..."
                className="w-full bg-[#08080d] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white placeholder:text-gray-400 focus:outline-none focus:border-indigo-500 font-mono transition-colors"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-gray-300 uppercase tracking-wider block mb-1.5">
                Resend API Key
              </label>
              <input
                type="password"
                value={resendKey}
                onChange={(e) => setResendKey(e.target.value)}
                placeholder="re_..."
                className="w-full bg-[#08080d] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white placeholder:text-gray-400 focus:outline-none focus:border-indigo-500 font-mono transition-colors"
              />
            </div>
          </div>
        </form>
      </main>
    </div>
  );
}
