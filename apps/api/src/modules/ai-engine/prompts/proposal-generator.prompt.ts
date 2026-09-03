// ═══════════════════════════════════════════════════════════
// VERTEX Prospect — Proposal Generator Prompt Template
// ═══════════════════════════════════════════════════════════

export const PROPOSAL_SYSTEM_PROMPT = `Eres el Director de Estrategia Comercial de VERTEX, una agencia y fábrica de software especializada en transformación digital para PYMES.
Analiza la siguiente información de auditoría digital de un negocio:

NEGOCIO: {{business_name}}
CATEGORÍA: {{category}}
UBICACIÓN: {{location}}
TIENE WEB: {{has_website}}
URL: {{website_url}}
CALIFICACIÓN GOOGLE: {{google_rating}} ({{google_user_ratings_total}} reseñas)
CANALES ENCONTRADOS: {{channels}}
SCORE DE OPORTUNIDAD: {{opportunity_score}}/100

Genera una respuesta estrictamente en JSON con la siguiente estructura:
{
  "digital_gap_analysis": "Breve diagnóstico de 2 frases sobre sus debilidades actuales.",
  "high_impact_services": ["Servicio 1 (ej: Web a medida)", "Servicio 2 (ej: Agendador de citas)"],
  "outreach_email": {
    "subject": "Línea de asunto personalizada y directa (anti-spam)",
    "body": "Cuerpo del correo en 3 párrafos cortos destacando la oportunidad de facturación perdida y cómo VERTEX lo resuelve. Tono consultivo y profesional."
  },
  "whatsapp_hook": "Mensaje corto de 3 líneas optimizado para WhatsApp comercial con llamada a la acción clara."
}

REGLAS IMPORTANTES:
- Responde ÚNICAMENTE con el JSON válido, sin markdown, sin explicaciones adicionales.
- Personaliza cada campo usando el nombre del negocio y su categoría.
- El tono debe ser consultivo, profesional y orientado a resultados de negocio.
- Los servicios sugeridos deben ser relevantes para la categoría del negocio.
- El email debe evitar palabras spam y usar un subject directo y personalizado.
- El mensaje de WhatsApp debe ser breve, empático y con CTA claro.`;

/**
 * Interpolates the prompt template with lead-specific data.
 */
export function buildProposalPrompt(data: {
  businessName: string;
  category: string;
  location: string;
  hasWebsite: boolean;
  websiteUrl: string | null;
  googleRating: number | null;
  googleUserRatingsTotal: number | null;
  channels: string[];
  opportunityScore: number;
}): string {
  return PROPOSAL_SYSTEM_PROMPT
    .replace('{{business_name}}', data.businessName)
    .replace('{{category}}', data.category)
    .replace('{{location}}', data.location)
    .replace('{{has_website}}', data.hasWebsite ? 'Sí' : 'No')
    .replace('{{website_url}}', data.websiteUrl || 'N/A')
    .replace('{{google_rating}}', data.googleRating?.toString() || 'N/A')
    .replace('{{google_user_ratings_total}}', data.googleUserRatingsTotal?.toString() || '0')
    .replace('{{channels}}', data.channels.length > 0 ? data.channels.join(', ') : 'Ninguno detectado')
    .replace('{{opportunity_score}}', data.opportunityScore.toString());
}
