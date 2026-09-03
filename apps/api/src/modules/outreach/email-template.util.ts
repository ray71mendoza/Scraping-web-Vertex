// ═══════════════════════════════════════════════════════════
// VERTEX Prospect — Branded HTML Email Template Generator
// ═══════════════════════════════════════════════════════════

export function generateProposalEmailHtml(data: {
  businessName: string;
  subject: string;
  body: string;
  opportunityScore: number;
  highImpactServices: string[];
}): string {
  const paragraphs = data.body
    .split('\n\n')
    .map((p) => `<p style="margin: 0 0 16px 0; line-height: 1.6; color: #374151; font-size: 15px;">${p.replace(/\n/g, '<br>')}</p>`)
    .join('');

  const servicesHtml = (data.highImpactServices || [])
    .map(
      (s) =>
        `<li style="margin-bottom: 8px; color: #4F46E5; font-weight: 600;">✦ ${s}</li>`,
    )
    .join('');

  return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${data.subject}</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #F3F4F6; margin: 0; padding: 30px 15px;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #FFFFFF; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.05); border: 1px solid #E5E7EB;">
    <!-- Header -->
    <div style="background: linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%); padding: 32px 24px; text-align: center;">
      <h1 style="color: #FFFFFF; margin: 0; font-size: 24px; font-weight: 800; letter-spacing: 0.5px;">VERTEX</h1>
      <p style="color: #E0E7FF; margin: 6px 0 0 0; font-size: 13px; text-transform: uppercase; letter-spacing: 1px;">Auditoría & Transformación Digital PYMES</p>
    </div>

    <!-- Body -->
    <div style="padding: 32px 28px;">
      <div style="display: inline-block; background-color: #FEF2F2; border: 1px solid #FECACA; border-radius: 8px; padding: 6px 12px; margin-bottom: 20px;">
        <span style="color: #DC2626; font-size: 12px; font-weight: 700;">Score de Oportunidad Detectado: ${data.opportunityScore}/100</span>
      </div>

      ${paragraphs}

      ${
        data.highImpactServices?.length > 0
          ? `
      <div style="background-color: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 12px; padding: 20px; margin: 24px 0;">
        <h3 style="margin: 0 0 12px 0; color: #1E293B; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px;">Oportunidades de Alto Impacto Identificadas:</h3>
        <ul style="margin: 0; padding-left: 20px; font-size: 14px;">
          ${servicesHtml}
        </ul>
      </div>
      `
          : ''
      }

      <div style="text-align: center; margin-top: 32px; padding-top: 24px; border-top: 1px solid #F1F5F9;">
        <a href="https://vertex.com/agendar" style="display: inline-block; background: linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%); color: #FFFFFF; text-decoration: none; padding: 14px 28px; border-radius: 10px; font-weight: 700; font-size: 14px; box-shadow: 0 4px 14px rgba(79, 70, 229, 0.3);">
          Agendar Diagnóstico Gratuito de 15 Min
        </a>
      </div>
    </div>

    <!-- Footer -->
    <div style="background-color: #F9FAFB; padding: 20px 24px; text-align: center; border-top: 1px solid #E5E7EB; font-size: 12px; color: #9CA3AF;">
      <p style="margin: 0;">© 2026 VERTEX Technologies Inc. Todos los derechos reservados.</p>
      <p style="margin: 4px 0 0 0;">Este análisis fue generado tras una auditoría pública en Google Business Profile & Web.</p>
    </div>
  </div>
</body>
</html>
  `.trim();
}
