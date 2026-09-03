"use client";

import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import { Header } from "@/components/shared/header";
import { OpportunityBadge } from "@/components/shared/opportunity-badge";
import { ScoreGauge } from "@/components/shared/score-gauge";
import type { AIDiagnosis } from "@vertex/shared";
import {
  ArrowLeft,
  Sparkles,
  Globe,
  CheckCircle2,
  XCircle,
  MessageCircle,
  Mail,
  ExternalLink,
  Copy,
  Check,
  Send,
  Loader2,
  Star,
  Building2,
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function LeadDetailPage() {
  const params = useParams();
  const router = useRouter();
  const leadId = params.id as string;

  const [activeTab, setActiveTab] = useState<"proposal" | "whatsapp">("proposal");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [copied, setCopied] = useState(false);

  const { data: lead, isLoading, refetch } = useQuery({
    queryKey: ["lead", leadId],
    queryFn: () => api.getLeadById(leadId),
  });

  const proposal = (lead?.aiDiagnosis as AIDiagnosis) || null;

  const handleGenerateProposal = async () => {
    try {
      setIsGenerating(true);
      await api.generateProposal(leadId);
      refetch();
    } catch (err) {
      alert("Error al generar propuesta: " + (err as any)?.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSendEmail = async () => {
    try {
      setIsSendingEmail(true);
      await api.sendEmail(leadId);
      alert("¡Email enviado con éxito!");
      refetch();
    } catch (err) {
      alert("Error al enviar email: " + (err as any)?.message);
    } finally {
      setIsSendingEmail(false);
    }
  };

  const handleCopyText = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (isLoading || !lead) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
      </div>
    );
  }

  const auditItems = [
    { label: "Sitio Web Operativo", passed: lead.hasWebsite, value: lead.websiteUrl || "No detectado" },
    { label: "Certificado SSL (HTTPS)", passed: lead.hasValidSsl, value: lead.hasValidSsl ? "Válido" : "Inseguro" },
    { label: "Dominio Propio (No gratuito)", passed: lead.hasCustomDomain, value: lead.hasCustomDomain ? "Propio" : "Subdominio" },
    { label: "Instagram / Facebook", passed: lead.hasFacebook || lead.hasInstagram, value: (lead.hasFacebook || lead.hasInstagram) ? "Activo" : "No detectado" },
    { label: "Canal Directo WhatsApp", passed: lead.hasWhatsapp, value: lead.hasWhatsapp ? "Integrado" : "No detectado" },
    { label: "Reseñas Google Maps > 20", passed: (lead.googleUserRatingsTotal || 0) > 20, value: `${lead.googleUserRatingsTotal || 0} reseñas` },
    { label: "Calificación Google > 4.0", passed: (lead.googleRating || 0) > 4.0, value: `${lead.googleRating?.toFixed(1) || 0} estrellas` },
  ];

  const whatsappMessage = proposal?.whatsappHook || `Hola ${lead.businessName}, somos VERTEX...`;
  const cleanPhone = (lead.internationalPhone || "").replace(/[^0-9]/g, "");
  const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(whatsappMessage)}`;

  return (
    <div className="flex-1 flex flex-col min-h-screen">
      <Header
        title={lead.businessName}
        subtitle="Ficha Técnica y Generador de Propuesta Comercial con IA"
      />

      <main className="p-8 max-w-6xl w-full mx-auto space-y-6">
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 text-xs font-semibold text-gray-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Volver al listado</span>
        </button>

        {/* Lead Summary Hero */}
        <div className="p-6 rounded-3xl bg-[#0e0e17]/80 border border-white/5 backdrop-blur-xl flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-black text-white">{lead.businessName}</h2>
              <OpportunityBadge tier={lead.opportunityTier} score={lead.opportunityScore} />
            </div>
            <p className="text-xs text-gray-400 flex items-center gap-2">
              <span>{lead.formattedAddress}</span>
              {lead.internationalPhone && (
                <>
                  <span>•</span>
                  <span className="text-gray-300 font-mono">{lead.internationalPhone}</span>
                </>
              )}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-gray-400 bg-white/5 px-3 py-1.5 rounded-xl border border-white/5">
              Estado: <strong className="text-white">{lead.status}</strong>
            </span>
          </div>
        </div>

        {/* 2-Column Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Scoring & Audit */}
          <div className="space-y-6">
            <div className="p-6 rounded-3xl bg-white/[0.02] border border-white/5 flex flex-col items-center justify-center text-center">
              <ScoreGauge score={lead.opportunityScore} size={130} strokeWidth={10} label="Score Oportunidad VERTEX" />
              <div className="mt-4 text-xs text-gray-400">
                Madurez Digital Detectada: <strong className="text-white font-mono">{lead.digitalScore}/100</strong>
              </div>
            </div>

            <div className="p-6 rounded-3xl bg-white/[0.02] border border-white/5 space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">
                Checklist de Madurez Digital
              </h3>
              <div className="space-y-3 text-xs">
                {auditItems.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {item.passed ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      ) : (
                        <XCircle className="w-4 h-4 text-red-400 shrink-0" />
                      )}
                      <span className="text-gray-300">{item.label}</span>
                    </div>
                    <span className="text-[11px] font-mono text-gray-400 truncate max-w-[120px]">
                      {item.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column (2 cols): AI Studio */}
          <div className="lg:col-span-2 space-y-4">
            {/* Tabs */}
            <div className="flex items-center gap-2 p-1.5 bg-white/[0.03] border border-white/5 rounded-2xl">
              <button
                onClick={() => setActiveTab("proposal")}
                className={cn(
                  "flex-1 py-2.5 px-4 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all",
                  activeTab === "proposal"
                    ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/20"
                    : "text-gray-400 hover:text-white"
                )}
              >
                <Mail className="w-4 h-4" />
                <span>Propuesta Email</span>
              </button>
              <button
                onClick={() => setActiveTab("whatsapp")}
                className={cn(
                  "flex-1 py-2.5 px-4 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all",
                  activeTab === "whatsapp"
                    ? "bg-emerald-600 text-white shadow-lg shadow-emerald-500/20"
                    : "text-gray-400 hover:text-white"
                )}
              >
                <MessageCircle className="w-4 h-4" />
                <span>Gancho WhatsApp</span>
              </button>
            </div>

            {/* AI Proposal Card */}
            <div className="p-6 rounded-3xl bg-white/[0.02] border border-white/5 space-y-5">
              {proposal ? (
                <div className="space-y-4">
                  {/* Diagnosis */}
                  <div className="p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/20">
                    <div className="text-xs font-bold text-indigo-300 uppercase mb-1 flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-indigo-400" />
                      Diagnóstico FODA Brecha Digital
                    </div>
                    <p className="text-xs text-indigo-100 leading-relaxed">
                      {proposal.digitalGapAnalysis}
                    </p>
                  </div>

                  {/* High Impact Services */}
                  {proposal.highImpactServices?.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {proposal.highImpactServices.map((srv, idx) => (
                        <span
                          key={idx}
                          className="px-3 py-1 rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs font-medium"
                        >
                          ✦ {srv}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Active Tab View */}
                  {activeTab === "proposal" ? (
                    <div className="space-y-3 pt-2">
                      <div>
                        <label className="text-xs font-bold text-gray-400 uppercase">
                          Asunto del Correo
                        </label>
                        <div className="mt-1 p-3 rounded-xl bg-[#08080d] border border-white/10 text-xs text-white font-medium">
                          {proposal.outreachEmail?.subject}
                        </div>
                      </div>

                      <div>
                        <label className="text-xs font-bold text-gray-400 uppercase">
                          Cuerpo de la Propuesta
                        </label>
                        <div className="mt-1 p-4 rounded-xl bg-[#08080d] border border-white/10 text-xs text-gray-200 whitespace-pre-line leading-relaxed h-52 overflow-y-auto">
                          {proposal.outreachEmail?.body}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3 pt-2">
                      <label className="text-xs font-bold text-gray-400 uppercase">
                        Mensaje Optimizado para WhatsApp Comercial
                      </label>
                      <div className="p-5 rounded-2xl bg-emerald-950/20 border border-emerald-500/20 text-xs text-emerald-100 whitespace-pre-line leading-relaxed">
                        {proposal.whatsappHook}
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-white/5">
                    <button
                      onClick={() =>
                        handleCopyText(
                          activeTab === "proposal"
                            ? `${proposal.outreachEmail.subject}\n\n${proposal.outreachEmail.body}`
                            : proposal.whatsappHook
                        )
                      }
                      className="px-4 py-2.5 rounded-xl border border-white/10 text-xs font-semibold text-gray-300 hover:text-white hover:bg-white/5 flex items-center gap-1.5 transition-all"
                    >
                      {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                      <span>{copied ? "Copiado al Portapapeles" : "Copiar Texto"}</span>
                    </button>

                    <div className="flex items-center gap-2">
                      {lead.internationalPhone && (
                        <a
                          href={whatsappUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-emerald-600/20 transition-all"
                        >
                          <MessageCircle className="w-4 h-4" />
                          <span>Abrir WhatsApp Web</span>
                        </a>
                      )}

                      <button
                        onClick={handleSendEmail}
                        disabled={isSendingEmail}
                        className="btn-accent text-xs font-bold py-2.5 px-5"
                      >
                        {isSendingEmail ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Send className="w-4 h-4" />
                        )}
                        <span>Disparar Email</span>
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center text-center p-12 space-y-4">
                  <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
                    <Sparkles className="w-7 h-7" />
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-white">Generar Propuesta Personalizada</h4>
                    <p className="text-xs text-gray-400 max-w-md mt-1">
                      El motor de IA generará un diagnóstico de brecha digital, oportunidades de servicios y un copy persuasivo personalizado.
                    </p>
                  </div>
                  <button
                    onClick={handleGenerateProposal}
                    disabled={isGenerating}
                    className="btn-accent text-xs font-semibold py-3 px-8"
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Generando con IA...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        <span>Generar con GPT-4o</span>
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
