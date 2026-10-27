"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import { Header } from "@/components/shared/header";
import { OpportunityBadge } from "@/components/shared/opportunity-badge";
import { ScoreGauge } from "@/components/shared/score-gauge";
import type { CompanyContactChannels, OutreachDraftDto, DeliveryHistoryItem, CommercialProposalDto, ClientReportProjection } from "@vertex/shared";
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
  Phone,
  Building2,
  Layers,
  FileText,
  Share2,
  AlertTriangle,
  History,
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function LeadDetailClient() {
  const params = useParams();
  const router = useRouter();
  const leadId = (params?.id as string) || "default";

  const [activeTab, setActiveTab] = useState<"outreach" | "audit" | "proposal" | "reports">("outreach");
  const [outreachChannel, setOutreachChannel] = useState<"EMAIL" | "WHATSAPP">("EMAIL");
  const [contactChannels, setContactChannels] = useState<CompanyContactChannels | null>(null);
  const [drafts, setDrafts] = useState<{ email: OutreachDraftDto; whatsapp: OutreachDraftDto } | null>(null);
  const [emailSubject, setEmailSubject] = useState("");
  const [emailBody, setEmailBody] = useState("");
  const [whatsappBody, setWhatsappBody] = useState("");
  const [attachReport, setAttachReport] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [sendResult, setSendResult] = useState<{ success: boolean; message: string; providerId?: string } | null>(null);
  const [deliveryHistory, setDeliveryHistory] = useState<DeliveryHistoryItem[]>([]);
  const [proposalData, setProposalData] = useState<CommercialProposalDto | null>(null);
  const [clientReport, setClientReport] = useState<ClientReportProjection | null>(null);
  const [shareLink, setShareLink] = useState<{ url: string; copied: boolean } | null>(null);

  const { data: lead, isLoading, refetch } = useQuery({
    queryKey: ["lead", leadId],
    queryFn: () => api.getLeadById(leadId),
  });

  useEffect(() => {
    async function loadData() {
      if (!leadId) return;
      try {
        const [channelsData, draftsData, historyData, propData, repData] = await Promise.all([
          api.getCompanyContactChannels(leadId),
          api.getCompanyOutreachDrafts(leadId),
          api.getDeliveryHistory(leadId),
          api.getLatestProposal(leadId),
          api.getClientReport(leadId),
        ]);

        setContactChannels(channelsData);
        setDrafts(draftsData);
        setEmailSubject(draftsData.email.subject || "");
        setEmailBody(draftsData.email.body);
        setWhatsappBody(draftsData.whatsapp.body);
        setDeliveryHistory(historyData);
        setProposalData(propData);
        setClientReport(repData);

        if (channelsData.availability === "WHATSAPP_ONLY") {
          setOutreachChannel("WHATSAPP");
        }
      } catch (err) {
        console.error("Error loading lead details:", err);
      }
    }

    loadData();
  }, [leadId]);

  const handleDirectDispatch = async () => {
    try {
      setIsSending(true);
      setSendResult(null);

      const isEmail = outreachChannel === "EMAIL";
      const destination = isEmail
        ? contactChannels?.email.destination
        : contactChannels?.whatsapp.destination;

      if (!destination) {
        setSendResult({
          success: false,
          message: "No hay un destino de contacto válido configurado.",
        });
        return;
      }

      const res = await api.dispatchOutreach({
        leadId,
        channel: outreachChannel,
        destination,
        subject: isEmail ? emailSubject : undefined,
        body: isEmail ? emailBody : whatsappBody,
        attachClientReport: attachReport,
        idempotencyKey: `direct_${leadId}_${outreachChannel}_${Date.now()}`,
      });

      setSendResult({
        success: res.success,
        message: res.message,
        providerId: res.providerMessageId || undefined,
      });

      const updatedHistory = await api.getDeliveryHistory(leadId);
      setDeliveryHistory(updatedHistory);
      refetch();
    } catch (err: any) {
      setSendResult({
        success: false,
        message: "Error en el despacho: " + (err?.message || "Error de servidor."),
      });
    } finally {
      setIsSending(false);
    }
  };

  const handleCreateShareLink = async () => {
    try {
      const res = await api.createShareLink(leadId);
      const fullUrl = `${window.location.origin}${res.shareUrl}`;
      navigator.clipboard.writeText(fullUrl);
      setShareLink({ url: fullUrl, copied: true });
      setTimeout(() => setShareLink((prev) => (prev ? { ...prev, copied: false } : null)), 3000);
    } catch (err) {
      console.error("Error creating share link:", err);
    }
  };

  if (isLoading || !lead) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
      </div>
    );
  }

  const activeChannel = outreachChannel === "EMAIL" ? contactChannels?.email : contactChannels?.whatsapp;

  return (
    <div className="flex-1 flex flex-col min-h-screen">
      <Header
        title={lead.businessName}
        subtitle={`${lead.formattedAddress || "Ubicación detectada"} • Sector: ${(lead as any).sector || "General"}`}
      />

      <main className="p-8 max-w-7xl w-full mx-auto space-y-6">
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-1.5 text-xs text-gray-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Volver al listado de prospectos</span>
        </button>

        {/* Navigation Tabs */}
        <div className="px-6 pt-3 border-b border-white/5 flex items-center gap-2 bg-[#0e0e17] rounded-t-2xl">
          <button
            onClick={() => setActiveTab("outreach")}
            className={cn(
              "py-3 px-4 text-xs font-bold flex items-center gap-2 border-b-2 transition-all",
              activeTab === "outreach" ? "border-indigo-500 text-white" : "border-transparent text-gray-400 hover:text-white"
            )}
          >
            <Send className="w-4 h-4 text-indigo-400" />
            <span>Contacto Directo en App</span>
          </button>
          <button
            onClick={() => setActiveTab("audit")}
            className={cn(
              "py-3 px-4 text-xs font-bold flex items-center gap-2 border-b-2 transition-all",
              activeTab === "audit" ? "border-indigo-500 text-white" : "border-transparent text-gray-400 hover:text-white"
            )}
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Auditoría & Scoring Explicable</span>
          </button>
          <button
            onClick={() => setActiveTab("proposal")}
            className={cn(
              "py-3 px-4 text-xs font-bold flex items-center gap-2 border-b-2 transition-all",
              activeTab === "proposal" ? "border-indigo-500 text-white" : "border-transparent text-gray-400 hover:text-white"
            )}
          >
            <Layers className="w-4 h-4 text-purple-400" />
            <span>Propuesta del Catálogo</span>
          </button>
          <button
            onClick={() => setActiveTab("reports")}
            className={cn(
              "py-3 px-4 text-xs font-bold flex items-center gap-2 border-b-2 transition-all",
              activeTab === "reports" ? "border-indigo-500 text-white" : "border-transparent text-gray-400 hover:text-white"
            )}
          >
            <FileText className="w-4 h-4 text-cyan-400" />
            <span>Informes & Enlace Cliente</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6 bg-[#0e0e17]/80 border border-white/5 rounded-b-2xl backdrop-blur-xl">
          {activeTab === "outreach" && (
            <div className="space-y-6">
              {/* Channel Selector */}
              <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-[#08080d] border border-white/5">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setOutreachChannel("EMAIL")}
                    className={cn(
                      "px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all",
                      outreachChannel === "EMAIL" ? "bg-indigo-600 text-white shadow-lg" : "text-gray-400 hover:text-white"
                    )}
                  >
                    <Mail className="w-4 h-4" />
                    <span>Correo Electrónico ({contactChannels?.email.destination || "Sin email"})</span>
                  </button>
                  <button
                    onClick={() => setOutreachChannel("WHATSAPP")}
                    className={cn(
                      "px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all",
                      outreachChannel === "WHATSAPP" ? "bg-emerald-600 text-white shadow-lg" : "text-gray-400 hover:text-white"
                    )}
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>WhatsApp ({contactChannels?.whatsapp.destination || "Sin teléfono"})</span>
                  </button>
                </div>

                <div className="text-xs text-indigo-300 bg-indigo-500/10 px-3 py-1.5 rounded-xl border border-indigo-500/20">
                  Despacho directo sin salir de la app
                </div>
              </div>

              {/* Message Editor */}
              <div className="space-y-4">
                {outreachChannel === "EMAIL" ? (
                  <div className="space-y-3">
                    <div>
                      <label className="text-[11px] font-bold text-gray-400 uppercase">Asunto del Correo</label>
                      <input
                        type="text"
                        value={emailSubject}
                        onChange={(e) => setEmailSubject(e.target.value)}
                        className="mt-1 w-full p-2.5 rounded-xl bg-[#08080d] border border-white/10 text-xs text-white"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-gray-400 uppercase">Cuerpo de la Propuesta</label>
                      <textarea
                        rows={14}
                        value={emailBody}
                        onChange={(e) => setEmailBody(e.target.value)}
                        className="mt-1 w-full p-3 rounded-xl bg-[#08080d] border border-white/10 text-xs text-gray-200 whitespace-pre-line leading-relaxed font-sans"
                      />
                    </div>
                  </div>
                ) : (
                  <div>
                    <label className="text-[11px] font-bold text-gray-400 uppercase">Mensaje para WhatsApp Comercial</label>
                    <textarea
                      rows={14}
                      value={whatsappBody}
                      onChange={(e) => setWhatsappBody(e.target.value)}
                      className="mt-1 w-full p-3 rounded-xl bg-emerald-950/20 border border-emerald-500/20 text-xs text-emerald-100 whitespace-pre-line leading-relaxed font-sans"
                    />
                  </div>
                )}

                {/* Feedback Banner */}
                {sendResult && (
                  <div
                    className={cn(
                      "p-3.5 rounded-xl text-xs flex items-center gap-2",
                      sendResult.success ? "bg-emerald-500/10 text-emerald-300 border border-emerald-500/20" : "bg-red-500/10 text-red-300 border border-red-500/20"
                    )}
                  >
                    {sendResult.success ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <XCircle className="w-4 h-4 text-red-400" />}
                    <span>{sendResult.message}</span>
                  </div>
                )}

                <div className="flex items-center justify-between pt-2">
                  <label className="flex items-center gap-2 cursor-pointer text-xs text-gray-300">
                    <input
                      type="checkbox"
                      checked={attachReport}
                      onChange={(e) => setAttachReport(e.target.checked)}
                      className="rounded bg-white/5 border-white/10 text-indigo-600"
                    />
                    <span>Adjuntar enlace al Informe Técnico del Cliente</span>
                  </label>

                  <button
                    onClick={handleDirectDispatch}
                    disabled={isSending || !activeChannel?.destination}
                    className={cn(
                      "px-6 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg transition-all",
                      outreachChannel === "EMAIL" ? "bg-indigo-600 hover:bg-indigo-500 text-white" : "bg-emerald-600 hover:bg-emerald-500 text-white",
                      (!activeChannel?.destination || isSending) && "opacity-60 cursor-not-allowed"
                    )}
                  >
                    {isSending ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Despachando...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        <span>{outreachChannel === "EMAIL" ? "Enviar Correo Directo" : "Enviar WhatsApp Directo"}</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === "audit" && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/5 flex flex-col items-center justify-center text-center">
                <ScoreGauge score={lead.opportunityScore} label="Oportunidad VERTEX" />
                <div className="mt-4 text-xs text-gray-400">
                  Madurez Digital: <strong className="text-white font-mono">{lead.digitalScore}/100</strong>
                </div>
              </div>
              <div className="md:col-span-2 p-5 rounded-2xl bg-white/[0.02] border border-white/5 space-y-3">
                <h3 className="text-xs font-bold uppercase text-gray-400">Dimensiones de Scoring</h3>
                <div className="grid grid-cols-3 gap-3">
                  <div className="p-3 rounded-xl bg-[#08080d] text-center">
                    <span className="text-[10px] text-gray-400 uppercase block">Necesidad Digital</span>
                    <span className="text-xl font-bold text-indigo-400">{(lead as any).digitalNeedScore ?? (100 - lead.digitalScore)}/100</span>
                  </div>
                  <div className="p-3 rounded-xl bg-[#08080d] text-center">
                    <span className="text-[10px] text-gray-400 uppercase block">Ajuste Servicios</span>
                    <span className="text-xl font-bold text-purple-400">{(lead as any).serviceFitScore ?? 80}/100</span>
                  </div>
                  <div className="p-3 rounded-xl bg-[#08080d] text-center">
                    <span className="text-[10px] text-gray-400 uppercase block">Confianza</span>
                    <span className="text-xl font-bold text-emerald-400">{(lead as any).evidenceConfidenceScore ?? 85}%</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "proposal" && (
            <div className="space-y-4">
              <h3 className="text-xs font-bold uppercase text-gray-400">Servicios Recomendados</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {(proposalData?.recommendedServices || []).map((srv, idx) => (
                  <div key={idx} className="p-4 rounded-xl bg-[#08080d] border border-white/5 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white">{srv.serviceName}</span>
                      <span className="text-xs font-bold text-emerald-400 font-mono">{srv.priceFormatted}</span>
                    </div>
                    <p className="text-xs text-gray-400">{srv.rationale}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "reports" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-xl bg-cyan-950/20 border border-cyan-500/20">
                <span className="text-xs text-cyan-200">Enlace seguro para previsualización del cliente (72h)</span>
                <button
                  onClick={handleCreateShareLink}
                  className="px-3.5 py-1.5 rounded-lg bg-cyan-600 text-white text-xs font-bold flex items-center gap-1.5"
                >
                  {shareLink?.copied ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Share2 className="w-3.5 h-3.5" />}
                  <span>{shareLink?.copied ? "Copiado" : "Copiar Enlace"}</span>
                </button>
              </div>
              <div className="p-6 rounded-2xl bg-white text-slate-800">
                <h4 className="text-sm font-bold text-slate-900">{clientReport?.executiveSummary}</h4>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
