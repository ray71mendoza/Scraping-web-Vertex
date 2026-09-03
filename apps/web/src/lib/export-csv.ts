import type { Lead } from "@vertex/shared";

export function exportLeadsToCsv(leads: Lead[], filename = "vertex_leads_export.csv") {
  if (!leads || leads.length === 0) {
    alert("No hay leads para exportar con los filtros seleccionados");
    return;
  }

  const headers = [
    "Nombre del Negocio",
    "Direccion",
    "Telefono",
    "Sitio Web",
    "Score Oportunidad",
    "Nivel Oportunidad",
    "Madurez Digital",
    "Tiene Web",
    "SSL Valido",
    "Dominio Propio",
    "WhatsApp",
    "Instagram/Facebook",
    "Emails Detectados",
    "CMS Detectado",
    "Google Rating",
    "Total Reseñas",
    "Estado CRM",
  ];

  const rows = leads.map((lead) => [
    `"${(lead.businessName || "").replace(/"/g, '""')}"`,
    `"${(lead.formattedAddress || "").replace(/"/g, '""')}"`,
    `"${lead.internationalPhone || ""}"`,
    `"${lead.websiteUrl || ""}"`,
    lead.opportunityScore,
    lead.opportunityTier,
    lead.digitalScore,
    lead.hasWebsite ? "SI" : "NO",
    lead.hasValidSsl ? "SI" : "NO",
    lead.hasCustomDomain ? "SI" : "NO",
    lead.hasWhatsapp ? "SI" : "NO",
    (lead.hasFacebook || lead.hasInstagram) ? "SI" : "NO",
    `"${(lead.detectedEmails || []).join(", ")}"`,
    `"${lead.detectedCms || ""}"`,
    lead.googleRating || "",
    lead.googleUserRatingsTotal || 0,
    lead.status,
  ]);

  const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");

  const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
