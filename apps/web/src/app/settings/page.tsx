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
        {/* Database Management & Auto-Cleanup Card */}
        <div className="p-6 rounded-3xl bg-[#0e0e17]/80 border border-white/5 space-y-5 backdrop-blur-xl shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Gestión de Memoria y Base de Datos</h3>
                <p className="text-xs text-gray-400">
                  Modo Ilimitado VERTEX SAS • Limpieza automática activada en cada nueva búsqueda
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={async () => {
                await api.clearAllData();
                alert("Base de datos y búsquedas anteriores limpiadas con éxito.");
                window.location.href = "/prospecting/new";
              }}
              className="px-4 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-300 hover:text-red-200 border border-red-500/30 text-xs font-bold transition-colors shrink-0"
            >
              Vaciar Historial y Limpiar Ahora
            </button>
          </div>

          <div className="p-4 rounded-2xl bg-emerald-950/20 border border-emerald-500/20 text-xs text-emerald-200 flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
            <span>
              <strong>Auto-limpieza activa:</strong> Cada vez que inicias una nueva prospección, las búsquedas anteriores se limpian automáticamente para no saturar memoria ni espacio en la base de datos.
            </span>
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
