"use client";

import React, { useState } from "react";
import type { Lead, AIDiagnosis } from "@vertex/shared";
import { api } from "@/lib/api-client";
import { ScoreGauge } from "@/components/shared/score-gauge";
import { OpportunityBadge } from "@/components/shared/opportunity-badge";
import {
  X,
  Sparkles,
  Globe,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  MessageCircle,
  Mail,
  ExternalLink,
  Copy,
  Check,
  Send,
  Loader2,
  Phone,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface LeadDetailModalProps {
  lead: Lead | null;
  onClose: () => void;
  onLeadUpdated: () => void;
}

export function LeadDetailModal({
  lead,
  onClose,
  onLeadUpdated,
}: LeadDetailModalProps) {
  if (!lead) return null;

  const [activeTab, setActiveTab] = useState<"audit" | "proposal" | "whatsapp">("proposal");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [copied, setCopied] = useState(false);
  const [proposal, setProposal] = useState<AIDiagnosis | null>(
    (lead.aiDiagnosis as AIDiagnosis) || null
  );

  const handleGenerateProposal = async () => {
    try {
      setIsGenerating(true);
      const data = await api.generateProposal(lead.id);
      setProposal(data);
      onLeadUpdated();
    } catch (err) {
      console.error("Failed to generate proposal", err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSendEmail = async () => {
    try {
      setIsSendingEmail(true);
      await api.sendEmail(lead.id);
      alert("¡Email enviado con éxito!");
      onLeadUpdated();
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

  const auditItems = [
    { label: "Sitio Web Operativo", passed: lead.hasWebsite, value: lead.websiteUrl || "No detectado" },
    { label: "Certificado SSL (HTTPS)", passed: lead.hasValidSsl, value: lead.hasValidSsl ? "Válido" : "Inseguro" },
    { label: "Dominio Propio (No gratuito)", passed: lead.hasCustomDomain, value: lead.hasCustomDomain ? "Propio" : "Subdominio/Sin Web" },
    { label: "Instagram / Facebook", passed: lead.hasFacebook || lead.hasInstagram, value: (lead.hasFacebook || lead.hasInstagram) ? "Activo" : "No detectado" },
    { label: "Canal Directo WhatsApp", passed: lead.hasWhatsapp, value: lead.hasWhatsapp ? "Integrado" : "No detectado" },
    { label: "Reseñas Google Maps > 20", passed: (lead.googleUserRatingsTotal || 0) > 20, value: `${lead.googleUserRatingsTotal || 0} reseñas` },
    { label: "Calificación Google > 4.0", passed: (lead.googleRating || 0) > 4.0, value: `${lead.googleRating?.toFixed(1) || 0} estrellas` },
  ];

  const whatsappMessage = proposal?.whatsappHook || `Hola ${lead.businessName}, somos VERTEX...`;
  const cleanPhone = (lead.internationalPhone || "").replace(/[^0-9]/g, "");
  const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(whatsappMessage)}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-4xl max-h-[90vh] bg-[#0c0c14] border border-white/10 rounded-3xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-white/5 flex items-start justify-between bg-white/[0.01]">
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-black text-white">{lead.businessName}</h2>
              <OpportunityBadge tier={lead.opportunityTier} score={lead.opportunityScore} />
            </div>
            <p className="text-xs text-gray-400 mt-1 flex items-center gap-2">
              <span>{lead.formattedAddress}</span>
              {lead.internationalPhone && (
                <>
                  <span>•</span>
                  <span className="text-gray-300 font-mono">{lead.internationalPhone}</span>
                </>
              )}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Content */}
        <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Left Column: Scoring & Digital Audit */}
          <div className="space-y-6">
            <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/5 flex flex-col items-center justify-center text-center">
              <ScoreGauge score={lead.opportunityScore} label="Oportunidad VERTEX" />
              <div className="mt-4 text-xs text-gray-400">
                Madurez Digital: <strong className="text-white font-mono">{lead.digitalScore}/100</strong>
              </div>
            </div>

            {/* Checklist */}
            <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/5 space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">
                Checklist Auditoría
              </h3>
              <div className="space-y-2.5 text-xs">
                {auditItems.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {item.passed ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      ) : (
                        <XCircle className="w-3.5 h-3.5 text-red-400 shrink-0" />
                      )}
                      <span className="text-gray-300">{item.label}</span>
                    </div>
                    <span className="text-[11px] font-mono text-gray-400 truncate max-w-[100px]">
                      {item.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column (2 cols): AI Diagnosis & Outreach Studio */}
          <div className="md:col-span-2 flex flex-col space-y-4">
            {/* Tabs */}
            <div className="flex items-center gap-2 p-1 bg-white/[0.03] border border-white/5 rounded-xl">
              <button
                onClick={() => setActiveTab("proposal")}
                className={cn(
                  "flex-1 py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all",
                  activeTab === "proposal"
                    ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/20"
                    : "text-gray-400 hover:text-white"
                )}
              >
                <Mail className="w-3.5 h-3.5" />
                <span>Propuesta Email</span>
              </button>
              <button
                onClick={() => setActiveTab("whatsapp")}
                className={cn(
                  "flex-1 py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all",
                  activeTab === "whatsapp"
                    ? "bg-emerald-600 text-white shadow-lg shadow-emerald-500/20"
                    : "text-gray-400 hover:text-white"
                )}
              >
                <MessageCircle className="w-3.5 h-3.5" />
                <span>Gancho WhatsApp</span>
              </button>
            </div>

            {/* AI Proposal Content */}
            <div className="flex-1 bg-white/[0.02] border border-white/5 rounded-2xl p-5 flex flex-col">
              {proposal ? (
                <div className="space-y-4 flex-1">
                  {/* Diagnosis summary */}
                  <div className="p-3.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20">
                    <div className="text-[11px] font-bold text-indigo-300 uppercase mb-1 flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-indigo-400" />
                      Diagnóstico FODA Brecha Digital
                    </div>
                    <p className="text-xs text-indigo-100 leading-relaxed">
                      {proposal.digitalGapAnalysis}
                    </p>
                  </div>

                  {/* High impact services suggested */}
                  {proposal.highImpactServices?.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {proposal.highImpactServices.map((srv, idx) => (
                        <span
                          key={idx}
                          className="px-2.5 py-1 rounded-md bg-purple-500/10 border border-purple-500/20 text-purple-300 text-[11px] font-medium"
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
                        <label className="text-[11px] font-bold text-gray-400 uppercase">
                          Asunto del Correo
                        </label>
                        <div className="mt-1 p-2.5 rounded-lg bg-[#08080d] border border-white/10 text-xs text-white font-medium">
                          {proposal.outreachEmail?.subject}
                        </div>
                      </div>

                      <div>
                        <label className="text-[11px] font-bold text-gray-400 uppercase">
                          Cuerpo de la Propuesta
                        </label>
                        <div className="mt-1 p-3 rounded-lg bg-[#08080d] border border-white/10 text-xs text-gray-200 whitespace-pre-line leading-relaxed h-44 overflow-y-auto">
                          {proposal.outreachEmail?.body}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3 pt-2">
                      <label className="text-[11px] font-bold text-gray-400 uppercase">
                        Mensaje Optimizado para WhatsApp Comercial
                      </label>
                      <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-500/20 text-xs text-emerald-100 whitespace-pre-line leading-relaxed">
                        {proposal.whatsappHook}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-8 space-y-4">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
                    <Sparkles className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">Generar Propuesta Personalizada</h4>
                    <p className="text-xs text-gray-400 max-w-sm mt-1">
                      El motor de IA generará un diagnóstico FODA, servicios de alto impacto y un copy persuasivo para email y WhatsApp.
                    </p>
                  </div>
                  <button
                    onClick={handleGenerateProposal}
                    disabled={isGenerating}
                    className="btn-accent text-xs font-semibold py-2.5 px-6"
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

            {/* Footer Action Buttons */}
            {proposal && (
              <div className="flex items-center justify-between gap-3 pt-2">
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
                  <span>{copied ? "Copiado" : "Copiar Texto"}</span>
                </button>

                <div className="flex flex-wrap items-center gap-2">
                  {lead.internationalPhone && (
                    <a
                      href={whatsappUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3.5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-emerald-600/20 transition-all"
                    >
                      <MessageCircle className="w-4 h-4" />
                      <span>Enviar WhatsApp</span>
                    </a>
                  )}

                  {lead.detectedEmails?.[0] && (
                    <a
                      href={`https://mail.google.com/mail/?view=cm&fs=1&to=${lead.detectedEmails[0]}&su=${encodeURIComponent(proposal.outreachEmail.subject)}&body=${encodeURIComponent(proposal.outreachEmail.body)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3.5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-blue-600/20 transition-all"
                    >
                      <Mail className="w-4 h-4" />
                      <span>Enviar por Gmail</span>
                    </a>
                  )}

                  <button
                    onClick={handleSendEmail}
                    disabled={isSendingEmail}
                    className="btn-accent text-xs font-bold py-2.5 px-4"
                  >
                    {isSendingEmail ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                    <span>Enviar con Resend</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
