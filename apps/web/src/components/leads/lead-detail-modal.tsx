"use client";

import React, { useState, useEffect } from "react";
import type { Lead, AIDiagnosis, CompanyContactChannels, OutreachDraftDto, DeliveryHistoryItem, CommercialProposalDto, ClientReportProjection } from "@vertex/shared";
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
  Layers,
  FileText,
  Share2,
  Info,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  History,
  Lock,
  Building,
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

  // Active top-level tab
  const [activeTab, setActiveTab] = useState<"outreach" | "audit" | "proposal" | "reports">("outreach");

  // Outreach Studio States
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
  const [isEditingDraft, setIsEditingDraft] = useState(false);

  // Manual Contact Entry (when "neither" available)
  const [manualEmail, setManualEmail] = useState("");
  const [manualPhone, setManualPhone] = useState("");

  // Explainable Scoring & Explanations
  const [showScoreExplanation, setShowScoreExplanation] = useState(false);
  const [isRecalculatingScore, setIsRecalculatingScore] = useState(false);
  const [selectedSector, setSelectedSector] = useState<string>((lead as any).sector || "GENERAL");

  // Proposals & Reports States
  const [proposalData, setProposalData] = useState<CommercialProposalDto | null>(null);
  const [clientReport, setClientReport] = useState<ClientReportProjection | null>(null);
  const [shareLink, setShareLink] = useState<{ url: string; copied: boolean } | null>(null);
  const [isGeneratingShareLink, setIsGeneratingShareLink] = useState(false);
  const [copiedText, setCopiedText] = useState(false);

  // Load contact channels, drafts, and proposal when lead changes
  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      try {
        const [channelsData, draftsData, historyData, proposalRes, reportRes] = await Promise.all([
          api.getCompanyContactChannels(lead.id),
          api.getCompanyOutreachDrafts(lead.id),
          api.getDeliveryHistory(lead.id),
          api.getLatestProposal(lead.id),
          api.getClientReport(lead.id),
        ]);

        if (isMounted) {
          setContactChannels(channelsData);
          setDrafts(draftsData);
          setEmailSubject(draftsData.email.subject || "");
          setEmailBody(draftsData.email.body);
          setWhatsappBody(draftsData.whatsapp.body);
          setDeliveryHistory(historyData);
          setProposalData(proposalRes);
          setClientReport(reportRes);

          // Default channel tab to available channel
          if (channelsData.availability === "WHATSAPP_ONLY") {
            setOutreachChannel("WHATSAPP");
          } else {
            setOutreachChannel("EMAIL");
          }
        }
      } catch (err) {
        console.error("Error loading lead modal data:", err);
      }
    }

    loadData();
    return () => {
      isMounted = false;
    };
  }, [lead.id]);

  // Recalculate scoring with sector profile
  const handleRecalculateSector = async (newSector: string) => {
    try {
      setIsRecalculatingScore(true);
      setSelectedSector(newSector);
      await api.recalculateScore(lead.id, newSector as any);
      onLeadUpdated();
    } catch (err) {
      console.error("Failed to recalculate score:", err);
    } finally {
      setIsRecalculatingScore(false);
    }
  };

  // Direct In-App Outreach Dispatch
  const handleDirectDispatch = async () => {
    try {
      setIsSending(true);
      setSendResult(null);

      const isEmail = outreachChannel === "EMAIL";
      const destination = isEmail
        ? (contactChannels?.email.destination || manualEmail)
        : (contactChannels?.whatsapp.destination || manualPhone);

      if (!destination) {
        setSendResult({
          success: false,
          message: isEmail
            ? "Debe ingresar una dirección de correo válida para despachar."
            : "Debe ingresar un número telefónico en formato internacional (+57...) para despachar.",
        });
        return;
      }

      const res = await api.dispatchOutreach({
        leadId: lead.id,
        channel: outreachChannel,
        destination,
        subject: isEmail ? emailSubject : undefined,
        body: isEmail ? emailBody : whatsappBody,
        attachClientReport: attachReport,
        idempotencyKey: `dispatch_${lead.id}_${outreachChannel}_${Date.now()}`,
      });

      setSendResult({
        success: res.success,
        message: res.message,
        providerId: res.providerMessageId || undefined,
      });

      // Refresh delivery history and notify parent
      const updatedHistory = await api.getDeliveryHistory(lead.id);
      setDeliveryHistory(updatedHistory);
      onLeadUpdated();
    } catch (err: any) {
      setSendResult({
        success: false,
        message: "Error en el despacho: " + (err?.message || "Falla de conexión con el proveedor."),
      });
    } finally {
      setIsSending(false);
    }
  };

  // Generate secure expiring share link
  const handleCreateShareLink = async () => {
    try {
      setIsGeneratingShareLink(true);
      const res = await api.createShareLink(lead.id);
      const fullUrl = `${window.location.origin}${res.shareUrl}`;
      navigator.clipboard.writeText(fullUrl);
      setShareLink({ url: fullUrl, copied: true });
      setTimeout(() => setShareLink((prev) => (prev ? { ...prev, copied: false } : null)), 3000);
    } catch (err) {
      console.error("Error creating share link:", err);
    } finally {
      setIsGeneratingShareLink(false);
    }
  };

  // Dimensional scores
  const digitalNeed = (lead as any).digitalNeedScore ?? (100 - lead.digitalScore);
  const serviceFit = (lead as any).serviceFitScore ?? 80;
  const evidenceConfidence = (lead as any).evidenceConfidenceScore ?? 85;
  const isInsufficientEvidence = (lead as any).scoringExplanation?.isInsufficientEvidence ?? false;

  const activeChannelInfo = outreachChannel === "EMAIL" ? contactChannels?.email : contactChannels?.whatsapp;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-black/85 backdrop-blur-md animate-in fade-in">
      <div className="w-full max-w-5xl max-h-[92vh] bg-[#0c0c14] border border-white/10 rounded-3xl shadow-2xl flex flex-col overflow-hidden">
        {/* Top Header */}
        <div className="p-6 border-b border-white/5 flex items-start justify-between bg-white/[0.01]">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-3">
              <h2 className="text-xl font-black text-white">{lead.businessName}</h2>
              <OpportunityBadge tier={lead.opportunityTier} score={lead.opportunityScore} />
              {isInsufficientEvidence && (
                <span className="px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" />
                  Evidencia Insuficiente
                </span>
              )}
            </div>
            <p className="text-xs text-gray-400 flex flex-wrap items-center gap-2">
              <span>{lead.formattedAddress || "Ubicación en Google Maps"}</span>
              {lead.websiteUrl && (
                <>
                  <span>•</span>
                  <a
                    href={lead.websiteUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-indigo-400 hover:underline flex items-center gap-1 font-mono"
                  >
                    <span>{lead.websiteUrl.replace(/^https?:\/\//, "")}</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
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

        {/* Navigation Tabs */}
        <div className="px-6 pt-3 border-b border-white/5 flex items-center gap-2 bg-[#08080d]">
          <button
            onClick={() => setActiveTab("outreach")}
            className={cn(
              "py-3 px-4 text-xs font-bold flex items-center gap-2 border-b-2 transition-all",
              activeTab === "outreach"
                ? "border-indigo-500 text-white"
                : "border-transparent text-gray-400 hover:text-gray-200"
            )}
          >
            <Send className="w-4 h-4 text-indigo-400" />
            <span>Contacto Directo en App</span>
          </button>
          <button
            onClick={() => setActiveTab("audit")}
            className={cn(
              "py-3 px-4 text-xs font-bold flex items-center gap-2 border-b-2 transition-all",
              activeTab === "audit"
                ? "border-indigo-500 text-white"
                : "border-transparent text-gray-400 hover:text-gray-200"
            )}
          >
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Auditoría & Scoring Explicable</span>
          </button>
          <button
            onClick={() => setActiveTab("proposal")}
            className={cn(
              "py-3 px-4 text-xs font-bold flex items-center gap-2 border-b-2 transition-all",
              activeTab === "proposal"
                ? "border-indigo-500 text-white"
                : "border-transparent text-gray-400 hover:text-gray-200"
            )}
          >
            <Layers className="w-4 h-4 text-purple-400" />
            <span>Propuesta del Catálogo VERTEX</span>
          </button>
          <button
            onClick={() => setActiveTab("reports")}
            className={cn(
              "py-3 px-4 text-xs font-bold flex items-center gap-2 border-b-2 transition-all",
              activeTab === "reports"
                ? "border-indigo-500 text-white"
                : "border-transparent text-gray-400 hover:text-gray-200"
            )}
          >
            <FileText className="w-4 h-4 text-cyan-400" />
            <span>Informes & Enlace Cliente</span>
          </button>
        </div>

        {/* Modal Main Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* TAB 1: DIRECT OUTREACH STUDIO */}
          {activeTab === "outreach" && (
            <div className="space-y-6">
              {/* Contact Availability Banner */}
              <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 flex flex-wrap items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                    Disponibilidad de Canales de Contacto
                  </div>
                  <div className="flex flex-wrap items-center gap-3 text-xs">
                    {contactChannels?.email.isAvailable ? (
                      <span className="flex items-center gap-1.5 text-blue-400 bg-blue-500/10 px-2.5 py-1 rounded-md border border-blue-500/20 font-mono">
                        <Mail className="w-3.5 h-3.5" />
                        {contactChannels.email.destination}
                      </span>
                    ) : (
                      <span className="text-gray-500 flex items-center gap-1">
                        <Mail className="w-3.5 h-3.5 text-gray-600" /> Sin correo
                      </span>
                    )}

                    {contactChannels?.whatsapp.isAvailable ? (
                      <span className="flex items-center gap-1.5 text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-md border border-emerald-500/20 font-mono">
                        <MessageCircle className="w-3.5 h-3.5" />
                        {contactChannels.whatsapp.destination}
                        <span className="text-[10px] bg-emerald-500/20 px-1 rounded text-emerald-300">
                          {contactChannels.whatsapp.verificationLevel === "VERIFIED_WHATSAPP_LINK" ? "Verificado" : "Teléfono Maps"}
                        </span>
                      </span>
                    ) : (
                      <span className="text-gray-500 flex items-center gap-1">
                        <Phone className="w-3.5 h-3.5 text-gray-600" /> Sin teléfono
                      </span>
                    )}
                  </div>
                </div>

                {/* Simulation Mode Badge */}
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-xs text-indigo-300">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Despacho directo backend (sin salir de la app)</span>
                </div>
              </div>

              {/* Substantive Message Composer */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Left col: Channel Selector & Readiness */}
                <div className="space-y-4">
                  <div className="p-4 rounded-2xl bg-[#08080d] border border-white/5 space-y-3">
                    <label className="text-[11px] font-bold text-gray-400 uppercase">
                      Seleccionar Canal de Envío
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => setOutreachChannel("EMAIL")}
                        className={cn(
                          "py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all",
                          outreachChannel === "EMAIL"
                            ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30"
                            : "bg-white/[0.03] text-gray-400 hover:text-white"
                        )}
                      >
                        <Mail className="w-4 h-4" />
                        <span>Correo</span>
                      </button>
                      <button
                        onClick={() => setOutreachChannel("WHATSAPP")}
                        className={cn(
                          "py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all",
                          outreachChannel === "WHATSAPP"
                            ? "bg-emerald-600 text-white shadow-lg shadow-emerald-600/30"
                            : "bg-white/[0.03] text-gray-400 hover:text-white"
                        )}
                      >
                        <MessageCircle className="w-4 h-4" />
                        <span>WhatsApp</span>
                      </button>
                    </div>

                    {/* Readiness Alert */}
                    <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 text-[11px] text-gray-300 space-y-1">
                      <div className="font-semibold text-white flex items-center gap-1.5">
                        <Info className="w-3.5 h-3.5 text-indigo-400" />
                        <span>Estado de Preparación</span>
                      </div>
                      <p className="text-gray-400 leading-relaxed">
                        {activeChannelInfo?.readinessMessage || "Listo para despacho."}
                      </p>
                    </div>

                    {/* Manual Destination Input if missing */}
                    {!activeChannelInfo?.destination && (
                      <div className="pt-2 space-y-2">
                        <label className="text-[11px] font-bold text-amber-400">
                          {outreachChannel === "EMAIL" ? "Ingresar Correo Manual" : "Ingresar WhatsApp Manual (+57...)"}
                        </label>
                        <input
                          type={outreachChannel === "EMAIL" ? "email" : "text"}
                          placeholder={outreachChannel === "EMAIL" ? "contacto@empresa.com" : "+573001234567"}
                          value={outreachChannel === "EMAIL" ? manualEmail : manualPhone}
                          onChange={(e) =>
                            outreachChannel === "EMAIL" ? setManualEmail(e.target.value) : setManualPhone(e.target.value)
                          }
                          className="w-full px-3 py-2 rounded-xl bg-[#0e0e17] border border-white/10 text-xs text-white font-mono focus:outline-none focus:border-indigo-500"
                        />
                      </div>
                    )}

                    {/* Optional Client Report Attachment */}
                    <div className="pt-2 border-t border-white/5">
                      <label className="flex items-center gap-2 cursor-pointer text-xs text-gray-300">
                        <input
                          type="checkbox"
                          checked={attachReport}
                          onChange={(e) => setAttachReport(e.target.checked)}
                          className="rounded border-white/20 bg-white/5 text-indigo-600 focus:ring-0"
                        />
                        <span>Adjuntar enlace al Informe Técnico</span>
                      </label>
                    </div>
                  </div>
                </div>

                {/* Right 2 cols: Live Editor & Immediate Send */}
                <div className="md:col-span-2 space-y-4">
                  <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/5 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="text-xs font-bold text-white flex items-center gap-1.5">
                        <Sparkles className="w-4 h-4 text-indigo-400" />
                        <span>Propuesta Personalizada para {lead.businessName}</span>
                      </div>
                      <span className="text-[11px] text-gray-400 font-mono">
                        Sector: {selectedSector}
                      </span>
                    </div>

                    {outreachChannel === "EMAIL" ? (
                      <div className="space-y-3">
                        <div>
                          <label className="text-[11px] font-bold text-gray-400 uppercase">
                            Asunto del Correo
                          </label>
                          <input
                            type="text"
                            value={emailSubject}
                            onChange={(e) => setEmailSubject(e.target.value)}
                            className="mt-1 w-full p-2.5 rounded-xl bg-[#08080d] border border-white/10 text-xs text-white font-medium focus:outline-none focus:border-indigo-500"
                          />
                        </div>

                        <div>
                          <label className="text-[11px] font-bold text-gray-400 uppercase">
                            Cuerpo del Correo (Editable)
                          </label>
                          <textarea
                            rows={8}
                            value={emailBody}
                            onChange={(e) => setEmailBody(e.target.value)}
                            className="mt-1 w-full p-3 rounded-xl bg-[#08080d] border border-white/10 text-xs text-gray-200 whitespace-pre-line leading-relaxed focus:outline-none focus:border-indigo-500"
                          />
                        </div>
                      </div>
                    ) : (
                      <div>
                        <label className="text-[11px] font-bold text-gray-400 uppercase">
                          Mensaje de WhatsApp Comercial (Editable)
                        </label>
                        <textarea
                          rows={8}
                          value={whatsappBody}
                          onChange={(e) => setWhatsappBody(e.target.value)}
                          className="mt-1 w-full p-3 rounded-xl bg-emerald-950/20 border border-emerald-500/20 text-xs text-emerald-100 whitespace-pre-line leading-relaxed focus:outline-none focus:border-emerald-500"
                        />
                      </div>
                    )}

                    {/* Send Status Feedback Banner */}
                    {sendResult && (
                      <div
                        className={cn(
                          "p-3.5 rounded-xl text-xs flex items-start gap-2.5 animate-in fade-in",
                          sendResult.success
                            ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-300"
                            : "bg-red-500/10 border border-red-500/20 text-red-300"
                        )}
                      >
                        {sendResult.success ? (
                          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400 mt-0.5" />
                        ) : (
                          <XCircle className="w-4 h-4 shrink-0 text-red-400 mt-0.5" />
                        )}
                        <div>
                          <p className="font-semibold">{sendResult.message}</p>
                          {sendResult.providerId && (
                            <p className="font-mono text-[11px] opacity-80 mt-0.5">
                              ID de Mensaje Proveedor: {sendResult.providerId}
                            </p>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Action Dispatch Buttons */}
                    <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                      <div className="text-[11px] text-gray-400">
                        Destino: <strong className="text-white font-mono">{activeChannelInfo?.destination || (outreachChannel === "EMAIL" ? manualEmail : manualPhone) || "No especificado"}</strong>
                      </div>

                      <button
                        onClick={handleDirectDispatch}
                        disabled={isSending}
                        className={cn(
                          "px-6 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg transition-all",
                          outreachChannel === "EMAIL"
                            ? "bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/30"
                            : "bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/30",
                          isSending && "opacity-75 cursor-not-allowed"
                        )}
                      >
                        {isSending ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>Despachando desde Backend...</span>
                          </>
                        ) : (
                          <>
                            <Send className="w-4 h-4" />
                            <span>
                              {outreachChannel === "EMAIL" ? "Enviar Correo Directo" : "Enviar WhatsApp Directo"}
                            </span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Delivery History Section */}
                  {deliveryHistory.length > 0 && (
                    <div className="p-4 rounded-2xl bg-[#08080d] border border-white/5 space-y-3">
                      <div className="text-xs font-bold text-gray-300 flex items-center gap-2">
                        <History className="w-3.5 h-3.5 text-gray-400" />
                        <span>Historial de Envíos Realizados</span>
                      </div>
                      <div className="space-y-2">
                        {deliveryHistory.map((item, idx) => (
                          <div
                            key={idx}
                            className="p-2.5 rounded-xl bg-white/[0.02] border border-white/5 text-xs flex items-center justify-between"
                          >
                            <div className="flex items-center gap-2">
                              {item.channel === "EMAIL" ? (
                                <Mail className="w-3.5 h-3.5 text-blue-400" />
                              ) : (
                                <MessageCircle className="w-3.5 h-3.5 text-emerald-400" />
                              )}
                              <span className="font-mono text-gray-300">{item.destination}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                {item.status}
                              </span>
                              <span className="text-[10px] text-gray-500">
                                {new Date(item.createdAt).toLocaleTimeString()}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: AUDIT & EXPLAINABLE SCORING */}
          {activeTab === "audit" && (
            <div className="space-y-6">
              {/* Dimensional Scores Grid */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 flex flex-col items-center text-center">
                  <ScoreGauge score={lead.opportunityScore} label="Oportunidad VERTEX" />
                  <span className="text-[11px] text-gray-400 mt-2">Score Global Normalizado</span>
                </div>

                <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 flex flex-col justify-between">
                  <div className="text-xs font-bold text-gray-400 uppercase">1. Necesidad Digital</div>
                  <div className="text-3xl font-black text-indigo-400 font-mono my-2">{digitalNeed}/100</div>
                  <p className="text-[11px] text-gray-400 leading-snug">
                    Brechas verificadas según perfil de {selectedSector}.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 flex flex-col justify-between">
                  <div className="text-xs font-bold text-gray-400 uppercase">2. Ajuste de Servicios</div>
                  <div className="text-3xl font-black text-purple-400 font-mono my-2">{serviceFit}/100</div>
                  <p className="text-[11px] text-gray-400 leading-snug">
                    Alineación directa con servicios activos de VERTEX.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 flex flex-col justify-between">
                  <div className="text-xs font-bold text-gray-400 uppercase">3. Confianza de Evidencia</div>
                  <div className="text-3xl font-black text-emerald-400 font-mono my-2">{evidenceConfidence}%</div>
                  <p className="text-[11px] text-gray-400 leading-snug">
                    Cobertura de auditoría y calidad de fuentes públicas.
                  </p>
                </div>
              </div>

              {/* Sector Profile Switcher */}
              <div className="p-4 rounded-2xl bg-[#08080d] border border-white/5 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <Building className="w-4 h-4 text-indigo-400" />
                  <span className="text-xs font-bold text-white">Perfil Sectorial Aplicado:</span>
                </div>
                <div className="flex flex-wrap items-center gap-1.5">
                  {[
                    { key: "HOTELS_TOURISM", label: "Hoteles & Hospedaje" },
                    { key: "RESTAURANTS", label: "Restaurantes" },
                    { key: "CLINICS", label: "Clínicas & Salud" },
                    { key: "RETAIL", label: "Comercio & Retail" },
                    { key: "GENERAL", label: "Servicios Generales" },
                  ].map((sec) => (
                    <button
                      key={sec.key}
                      onClick={() => handleRecalculateSector(sec.key)}
                      disabled={isRecalculatingScore}
                      className={cn(
                        "px-3 py-1.5 rounded-lg text-xs font-medium transition-all",
                        selectedSector === sec.key
                          ? "bg-indigo-600 text-white font-bold"
                          : "bg-white/[0.03] text-gray-400 hover:text-white"
                      )}
                    >
                      {sec.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Detailed Checklist Breakdown */}
              <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/5 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                    Hallazgos de Auditoría Técnica & Comercial
                  </h3>
                  <button
                    onClick={() => setShowScoreExplanation(!showScoreExplanation)}
                    className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
                  >
                    <span>{showScoreExplanation ? "Ocultar desglose de reglas" : "Ver desglose de reglas"}</span>
                    {showScoreExplanation ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                  </button>
                </div>

                {/* Score Rule Contributions Drawer */}
                {showScoreExplanation && (
                  <div className="p-4 rounded-xl bg-[#08080d] border border-white/10 space-y-2.5 text-xs animate-in fade-in">
                    <p className="text-gray-300 text-[11px] leading-relaxed">
                      <strong>Principio de scoring determinista:</strong> Cada verificación evaluada como ausente o no detectada contribuye a la Necesidad Digital. Verificaciones con estado <em>DESCONOCIDO</em> o <em>BLOQUEADO</em> nunca incrementan la necesidad ni penalizan al prospecto.
                    </p>
                    <div className="divide-y divide-white/5 pt-2">
                      <div className="py-1.5 flex items-center justify-between text-gray-400">
                        <span>Sitio Web Oficial Operativo</span>
                        <span className="font-mono text-white">{lead.hasWebsite ? "Presente (+0 pts necesidad)" : "Ausente (+25 pts necesidad)"}</span>
                      </div>
                      <div className="py-1.5 flex items-center justify-between text-gray-400">
                        <span>Certificado SSL Cifrado (HTTPS)</span>
                        <span className="font-mono text-white">{lead.hasValidSsl ? "Presente (+0 pts)" : "No Seguro (+15 pts necesidad)"}</span>
                      </div>
                      <div className="py-1.5 flex items-center justify-between text-gray-400">
                        <span>Diseño Mobile-First Responsivo</span>
                        <span className="font-mono text-white">{lead.isResponsive ? "Presente" : "No detectado (+15 pts necesidad)"}</span>
                      </div>
                      <div className="py-1.5 flex items-center justify-between text-gray-400">
                        <span>Canal de Conversión WhatsApp</span>
                        <span className="font-mono text-white">{lead.hasWhatsapp ? "Integrado" : "No detectado (+20 pts necesidad)"}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: PROPOSALS & SERVICE CATALOG */}
          {activeTab === "proposal" && (
            <div className="space-y-6">
              <div className="p-5 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 space-y-2">
                <div className="text-xs font-bold text-indigo-300 uppercase flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-indigo-400" />
                  <span>Solución Mapeada desde el Catálogo Activo de VERTEX</span>
                </div>
                <p className="text-xs text-indigo-100 leading-relaxed">
                  {proposalData?.executiveSummary || "Soluciones propuestas orientadas a resolver las brechas verificadas en la auditoría técnica."}
                </p>
              </div>

              {/* Recommended Services List */}
              <div className="space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400">
                  Servicios Elegibles y Recomendados
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {(proposalData?.recommendedServices || []).map((srv, idx) => (
                    <div
                      key={idx}
                      className="p-5 rounded-2xl bg-white/[0.02] border border-white/5 space-y-3 flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-[10px] font-mono text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded">
                            {srv.serviceCode}
                          </span>
                          <span className="text-xs font-bold text-emerald-400 font-mono">
                            {srv.priceFormatted}
                          </span>
                        </div>
                        <h4 className="text-sm font-bold text-white">{srv.serviceName}</h4>
                        <p className="text-xs text-gray-400 mt-1 leading-relaxed">{srv.rationale}</p>
                      </div>

                      <div className="space-y-1.5 pt-3 border-t border-white/5 text-[11px] text-gray-300">
                        <strong className="text-gray-400 block text-[10px] uppercase">Entregables:</strong>
                        {srv.deliverables.slice(0, 3).map((d, dIdx) => (
                          <div key={dIdx} className="flex items-center gap-1.5">
                            <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
                            <span>{d}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Proposal Total & Estimate */}
              <div className="p-4 rounded-2xl bg-[#08080d] border border-white/5 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-gray-400 uppercase">Inversión Estimada Total</span>
                  <div className="text-base font-black text-emerald-400 font-mono">
                    {proposalData?.totalEstimateFormatted || "$1.800.000 COP"}
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-gray-400">Próximo paso sugerido:</span>
                  <p className="text-xs text-white font-medium">Llamada de demostración de 15 minutos</p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: REPORTS & SECURE CLIENT SHARING */}
          {activeTab === "reports" && (
            <div className="space-y-6">
              {/* Share Link Generator Banner */}
              <div className="p-5 rounded-2xl bg-cyan-950/20 border border-cyan-500/20 flex flex-wrap items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="text-xs font-bold text-cyan-300 uppercase flex items-center gap-1.5">
                    <Share2 className="w-4 h-4 text-cyan-400" />
                    <span>Enlace Seguro de Visualización para Cliente</span>
                  </div>
                  <p className="text-xs text-cyan-100 max-w-xl leading-relaxed">
                    Genera un enlace no predecible y con expiración de 72 horas. La vista de cliente excluye automáticamente scores internos de venta, notas privadas y rankings.
                  </p>
                </div>

                <button
                  onClick={handleCreateShareLink}
                  disabled={isGeneratingShareLink}
                  className="px-4 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-cyan-600/20 transition-all"
                >
                  {isGeneratingShareLink ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : shareLink?.copied ? (
                    <Check className="w-4 h-4 text-emerald-300" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                  <span>{shareLink?.copied ? "¡Enlace Copiado!" : "Generar Enlace Seguro"}</span>
                </button>
              </div>

              {/* Client Report Preview */}
              <div className="p-6 rounded-3xl bg-white text-slate-800 border border-slate-200 shadow-xl space-y-6">
                <div className="flex items-start justify-between border-b border-slate-200 pb-4">
                  <div className="space-y-1">
                    <span className="text-[10px] font-black uppercase tracking-wider text-cyan-700">
                      Informe Técnico de Diagnóstico Digital
                    </span>
                    <h3 className="text-xl font-black text-slate-900">{lead.businessName}</h3>
                    <p className="text-xs text-slate-500">
                      {lead.websiteUrl || "Sin sitio web indexado"} • {lead.formattedAddress}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-bold text-slate-800">VERTEX Innovation</p>
                    <p className="text-[10px] text-slate-500">Versión Cliente Aprobada</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wide text-slate-700">Resumen Ejecutivo</h4>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {clientReport?.executiveSummary || "Se completó la evaluación pública de presencia digital. Los hallazgos representan áreas de oportunidad para incrementar la captación comercial."}
                  </p>
                </div>

                {/* Verified Findings in Client Report */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wide text-slate-700">Hallazgos Verificados</h4>
                  <div className="space-y-2">
                    {(clientReport?.verifiedFindings || []).map((fnd, idx) => (
                      <div key={idx} className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                        <strong className="text-slate-900 block font-bold">{fnd.title}</strong>
                        <p className="text-slate-600 mt-0.5">{fnd.description}</p>
                        <p className="text-cyan-800 font-semibold text-[11px] mt-1">Impacto: {fnd.impact}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* VERTEX Signature Footer */}
                <div className="pt-4 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
                  <div>
                    <strong className="text-slate-800">Ray Mendoza</strong> — Director de Desarrollo
                    <p className="text-[11px]">gerenciavertexsas@gmail.com | +57 300 865 8910</p>
                  </div>
                  <div className="text-right font-mono text-[10px]">
                    https://vertexcorp.com.co
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
