// ═══════════════════════════════════════════════════════════
// VERTEX Prospect — Direct In-App Outreach Service
// ═══════════════════════════════════════════════════════════
// Implements direct backend dispatch for Email (Resend) and
// WhatsApp (Meta WhatsApp Business Cloud API) without leaving the app.
// Supports dry-run / simulation mode when API keys are unconfigured.

import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { prisma } from '@vertex/database';
import axios from 'axios';
import {
  normalizePhoneToE164,
  type CompanyContactChannels,
  type OutreachDraftDto,
  type SendOutreachRequest,
  type SendOutreachResponse,
  type DeliveryHistoryItem,
  type OutreachChannel,
} from '@vertex/shared';
import { generateProposalEmailHtml } from './email-template.util';

@Injectable()
export class OutreachService {
  private readonly logger = new Logger(OutreachService.name);

  // Email Config (Resend)
  private readonly resendApiKey: string;
  private readonly emailFrom: string;
  private readonly emailReplyTo: string;

  // WhatsApp Config (Meta WhatsApp Business Platform Cloud API)
  private readonly whatsappToken: string;
  private readonly whatsappPhoneId: string;
  private readonly whatsappApiVersion: string;

  constructor(private configService: ConfigService) {
    this.resendApiKey = this.configService.get<string>('RESEND_API_KEY', '');
    this.emailFrom = this.configService.get<string>('EMAIL_FROM', 'VERTEX Gerencia <gerencia@mail.vertexcorp.com.co>');
    this.emailReplyTo = this.configService.get<string>('EMAIL_REPLY_TO', 'gerenciavertexsas@gmail.com');

    this.whatsappToken = this.configService.get<string>('WHATSAPP_API_TOKEN', '');
    this.whatsappPhoneId = this.configService.get<string>('WHATSAPP_PHONE_NUMBER_ID', '');
    this.whatsappApiVersion = this.configService.get<string>('WHATSAPP_API_VERSION', 'v21.0');
  }

  /**
   * Evaluates available contact destinations and provider readiness for a company.
   */
  async getCompanyContactChannels(leadId: string): Promise<CompanyContactChannels> {
    const lead = await prisma.lead.findUnique({ where: { id: leadId } });
    if (!lead) throw new NotFoundException(`Lead ${leadId} no encontrado.`);

    const primaryEmail = lead.detectedEmails?.[0] || null;
    const phoneNorm = normalizePhoneToE164(lead.internationalPhone, 'CO');

    const isResendConfigured =
      Boolean(this.resendApiKey) &&
      this.resendApiKey !== 'your_resend_api_key_here' &&
      this.resendApiKey.startsWith('re_');

    const isWhatsAppConfigured =
      Boolean(this.whatsappToken) &&
      this.whatsappToken !== 'your_whatsapp_api_token_here' &&
      Boolean(this.whatsappPhoneId);

    // Email readiness
    let emailReadiness: any = 'MISSING_DESTINATION';
    let emailMessage = 'Sin correo detectado';
    if (primaryEmail) {
      if (isResendConfigured) {
        emailReadiness = 'READY';
        emailMessage = 'Listo para envío directo con Resend';
      } else {
        emailReadiness = 'SIMULATED';
        emailMessage = 'Modo Simulación activo (API key Resend no configurada)';
      }
    }

    // WhatsApp readiness
    let whatsappReadiness: any = 'MISSING_DESTINATION';
    let whatsappMessage = 'Sin teléfono detectado';
    if (phoneNorm.isValid && phoneNorm.e164) {
      if (isWhatsAppConfigured) {
        whatsappReadiness = 'READY';
        whatsappMessage = 'Listo para envío directo con Meta WhatsApp Cloud API';
      } else {
        whatsappReadiness = 'SIMULATED';
        whatsappMessage = 'Modo Simulación activo (Credenciales Meta no configuradas)';
      }
    }

    const hasEmail = Boolean(primaryEmail);
    const hasPhone = Boolean(phoneNorm.isValid && phoneNorm.e164);

    let availability: CompanyContactChannels['availability'] = 'NEITHER';
    if (hasEmail && hasPhone) availability = 'BOTH';
    else if (hasEmail) availability = 'EMAIL_ONLY';
    else if (hasPhone) availability = 'WHATSAPP_ONLY';

    return {
      availability,
      email: {
        channel: 'EMAIL',
        destination: primaryEmail,
        isAvailable: hasEmail,
        readiness: emailReadiness,
        verificationLevel: hasEmail ? 'EXTRACTED_EMAIL' : 'UNVERIFIED_PHONE',
        readinessMessage: emailMessage,
      },
      whatsapp: {
        channel: 'WHATSAPP',
        destination: phoneNorm.e164,
        isAvailable: hasPhone,
        readiness: whatsappReadiness,
        verificationLevel: lead.hasWhatsapp ? 'VERIFIED_WHATSAPP_LINK' : 'UNVERIFIED_PHONE',
        readinessMessage: whatsappMessage,
      },
    };
  }

  /**
   * Generates substantive, tailored outreach drafts for Email and WhatsApp
   * specifically connected to the company's verified gaps and matched VERTEX solutions.
   */
  async getCompanyOutreachDrafts(leadId: string): Promise<{
    email: OutreachDraftDto;
    whatsapp: OutreachDraftDto;
  }> {
    const lead = await prisma.lead.findUnique({
      where: { id: leadId },
      include: {
        findings: true,
        outreachDrafts: true,
      },
    });

    if (!lead) throw new NotFoundException(`Lead ${leadId} no encontrado.`);

    // Check if operator previously saved custom drafts
    const savedEmailDraft = lead.outreachDrafts.find((d) => d.channel === 'EMAIL');
    const savedWaDraft = lead.outreachDrafts.find((d) => d.channel === 'WHATSAPP');

    if (savedEmailDraft && savedWaDraft) {
      return {
        email: {
          id: savedEmailDraft.id,
          leadId,
          channel: 'EMAIL',
          version: savedEmailDraft.version,
          subject: savedEmailDraft.subject || '',
          body: savedEmailDraft.body,
          findingIds: savedEmailDraft.findingIds,
          serviceCodes: savedEmailDraft.serviceCodes,
          isReviewed: savedEmailDraft.isReviewed,
          updatedAt: savedEmailDraft.updatedAt.toISOString(),
        },
        whatsapp: {
          id: savedWaDraft.id,
          leadId,
          channel: 'WHATSAPP',
          version: savedWaDraft.version,
          body: savedWaDraft.body,
          findingIds: savedWaDraft.findingIds,
          serviceCodes: savedWaDraft.serviceCodes,
          isReviewed: savedWaDraft.isReviewed,
          updatedAt: savedWaDraft.updatedAt.toISOString(),
        },
      };
    }

    // Generate tailored content based on substantive verified findings
    const findings = lead.findings || [];
    const hasNoWeb = !lead.hasWebsite || findings.some((f) => f.code.includes('HTTP_ERROR'));
    const hasSslIssue = !lead.hasValidSsl && lead.hasWebsite;
    const hasMobileIssue = !lead.isResponsive && lead.hasWebsite;
    const hasNoWa = !lead.hasWhatsapp;

    let emailSubject = '';
    let emailBody = '';
    let whatsappBody = '';
    const findingIds: string[] = findings.map((f) => f.id);
    const serviceCodes: string[] = [];

    if (hasNoWeb) {
      serviceCodes.push('WEB_DEV_CORP', 'SEO_LOCAL_TECH');
      emailSubject = `${lead.businessName}: Diagnóstico de visibilidad digital y captación web`;
      emailBody = `Estimado equipo directivo de ${lead.businessName},

En VERTEX realizamos un análisis del ecosistema digital de negocios destacados en ${lead.formattedAddress || 'su localidad'}. Identificamos que ${lead.businessName} cuenta con una excelente reputación en Google (${lead.googleRating?.toFixed(1) || '4.0'}★ con ${lead.googleUserRatingsTotal || 'varias'} reseñas), pero actualmente carece de un sitio web corporativo indexado.

Esta situación desvía a clientes potenciales que buscan activamente sus servicios hacia competidores que sí disponen de canales de reserva o contacto web.

En VERTEX desarrollamos plataformas web modernas, veloces y diseñadas específicamente para captar clientes locales y automatizar la atención directa.

Si están interesados en captar estas búsquedas y modernizar su infraestructura digital, pueden comunicarse respondiendo directamente a este correo para agendar una reunión formal y presentarles la propuesta comercial detallada.

Para conocer más sobre nuestra empresa, trayectoria y explorar nuestro portafolio de servicios y casos de éxito, los invitamos a visitar nuestro sitio web oficial:
👉 https://vertexcorp.com.co/es

Atentamente,
Ray Mendoza
Director de Desarrollo | VERTEX Innovation & Consulting
gerenciavertexsas@gmail.com | +57 300 865 8910
Sitio Web Oficial: https://vertexcorp.com.co/es`;

      whatsappBody = `¡Hola equipo directivo de ${lead.businessName}! 👋

Somos *VERTEX Innovation & Consulting*, firma especializada en ingeniería de software, modernización web de alto rendimiento y automatización de canales comerciales para empresas en Colombia.

Estuvimos realizando una auditoría preliminar a su presencia comercial en Google Maps (${lead.googleRating?.toFixed(1) || '4.0'}★) y detectamos oportunidades críticas que están afectando la captación directa de clientes:

1. FALENCIAS DETECTADAS EN LA AUDITORÍA:
• Ausencia de Sitio Web Oficial: Su empresa no cuenta con un portal institucional propio indexado en Google, provocando que potenciales clientes migren hacia competidores.
• Falta de Canal de Conversión Directo: No disponen de flujo estructurado para cotizaciones y atención inmediata en WhatsApp Business.
• Oportunidad de Posicionamiento Local: Su ficha en Google puede conectarse con catálogos y sistemas de agendamiento para multiplicar consultas.

2. SOLUCIONES RECOMENDADAS VERTEX:
• Desarrollo de Sitio Web Corporativo Ultrarrápido con dominio propio y diseño de alta conversión para móviles.
• Integración de Canal Comercial en WhatsApp para cierre rápido de prospectos.
• Auditoría y Optimización de Presencia Digital en motores de búsqueda.

Si están interesados en captar más clientes y evaluar nuestra propuesta técnica, pueden responder directamente a este mensaje para agendar una reunión formal con nuestro equipo.

💡 Si tienen alguna duda o desean conocer más sobre nuestro trabajo y portafolio de servicios, pueden consultar nuestro sitio web oficial:
👉 https://vertexcorp.com.co/es

Atentamente,
*Ray Mendoza* | Director de Desarrollo
VERTEX Innovation & Consulting
📱 +57 300 865 8910 | ✉️ gerenciavertexsas@gmail.com
🌐 https://vertexcorp.com.co/es`;

    } else if (hasMobileIssue || hasSslIssue) {
      serviceCodes.push(hasMobileIssue ? 'WEB_DEV_REDESIGN' : 'SEC_SSL_INFRA');
      emailSubject = `${lead.businessName}: Oportunidad de optimización técnica y seguridad web`;
      emailBody = `Estimado equipo de ${lead.businessName},

Llevamos a cabo una auditoría de rendimiento, presencia móvil y seguridad sobre su portal web (${lead.websiteUrl || 'su portal'}). Detectamos oportunidades técnicas de alto impacto comercial:

${hasMobileIssue ? '• Navegación móvil no adaptada: El sitio no cuenta con viewport responsivo, dificultando la lectura y compra en smartphones.\n' : ''}${hasSslIssue ? '• Advertencia de seguridad SSL: El navegador clasifica la conexión como "No segura", reduciendo la confianza de los visitantes.\n' : ''}
En VERTEX modernizamos plataformas web existentes garantizando carga instantánea, navegación fluida en celulares y certificación de seguridad completa.

Si están interesados en corregir estas falencias y elevar la conversión de su portal, pueden comunicarse respondiendo a este mensaje para agendar una reunión técnica.

Para conocer más sobre nuestra empresa, trayectoria y explorar nuestro portafolio de servicios y casos de éxito, los invitamos a visitar nuestro sitio web oficial:
👉 https://vertexcorp.com.co/es

Cordialmente,
Ray Mendoza
Director de Desarrollo | VERTEX Innovation & Consulting
gerenciavertexsas@gmail.com | +57 300 865 8910
Sitio Web Oficial: https://vertexcorp.com.co/es`;

      whatsappBody = `¡Hola equipo de ${lead.businessName}! 👋

Somos *VERTEX Innovation & Consulting*, empresa especializada en modernización web, seguridad digital y automatización de procesos para negocios en Colombia.

Realizamos una auditoría técnica sobre su portal web (${lead.websiteUrl}) y detectamos hallazgos prioritarios para optimizar su conversión:

1. FALENCIAS DETECTADAS EN LA AUDITORÍA:
${hasMobileIssue ? '• Navegación Móvil No Adaptada: El portal presenta lentitud y elementos desalineados en smartphones, provocando pérdida de visitantes.\n' : ''}${hasSslIssue ? '• Advertencia de Certificado SSL: Navegadores indican "No es seguro", generando desconfianza en los usuarios.\n' : ''}• Desconexión con Canales de Cierre: Ausencia de botón estructurado que conecte la navegación web directamente con WhatsApp comercial.

2. SOLUCIONES RECOMENDADAS VERTEX:
• Modernización y Optimización Móvil Completa (velocidad de carga inferior a 2 segundos).
• Blindaje de Seguridad y Certificación SSL de grado empresarial.
• Integración de Canal Directo a WhatsApp Business para cerrar ventas inmediatamente.

Si desean modernizar estos aspectos y evaluar nuestra propuesta técnica, pueden responder a este mensaje para agendar una reunión con nuestro equipo.

💡 Si tienen alguna duda o desean conocer más sobre nuestro trabajo y portafolio de servicios, pueden consultar nuestro sitio web oficial:
👉 https://vertexcorp.com.co/es

Cordialmente,
*Ray Mendoza* | Director de Desarrollo
VERTEX Innovation & Consulting
📱 +57 300 865 8910 | ✉️ gerenciavertexsas@gmail.com
🌐 https://vertexcorp.com.co/es`;

    } else {
      serviceCodes.push('AUTOMATION_WHATSAPP_CRM', 'SEO_LOCAL_TECH');
      emailSubject = `${lead.businessName}: Optimización de conversión comercial y canal WhatsApp`;
      emailBody = `Estimado equipo de ${lead.businessName},

Revisamos su presencia digital en ${lead.websiteUrl || 'Google'} y encontramos una base sólida para acelerar sus ventas online. Identificamos que pueden incrementar significativamente sus conversiones incorporando un canal directo de WhatsApp empresarial y un sistema de agendamiento automatizado.

En VERTEX conectamos sitios web con flujos de atención comercial inmediata que multiplican las consultas efectivas.

Si están interesados en evaluar cómo implementar esta automatización, los invitamos a responder directamente a este correo para agendar una sesión de trabajo.

Para conocer más sobre nuestra empresa, trayectoria y explorar nuestro portafolio de servicios y casos de éxito, los invitamos a visitar nuestro sitio web oficial:
👉 https://vertexcorp.com.co/es

Saludos cordiales,
Ray Mendoza
Director de Desarrollo | VERTEX Innovation & Consulting
gerenciavertexsas@gmail.com | +57 300 865 8910
Sitio Web Oficial: https://vertexcorp.com.co/es`;

      whatsappBody = `¡Hola equipo de ${lead.businessName}! 👋

Somos *VERTEX Innovation & Consulting*, firma de tecnología especializada en desarrollo de software, modernización digital y automatización de canales de atención y ventas en Colombia.

Revisamos su presencia digital (${lead.websiteUrl || 'su canal online'}) y detectamos oportunidades determinantes para multiplicar sus ventas:

1. OPORTUNIDADES DE MEJORA DETECTADAS:
• Falta de Automatización Comercial: Las consultas comerciales se atienden de forma manual, generando retrasos en horarios de alta afluencia.
• Desvinculación de Redes y Portal Web: No disponen de flujos directos para convertir visitantes de redes en cotizaciones cerradas por WhatsApp.
• Oportunidad de Agendamiento Online: Ausencia de herramienta interactiva para que sus clientes agenden citas o pedidos en autoservicio.

2. SOLUCIONES RECOMENDADAS VERTEX:
• Canal Automatizado de WhatsApp Business conectado con su equipo de ventas y catálogo interactivo.
• Sistema de Agendamiento Digital 24/7 con confirmaciones automáticas.
• Integración de Campañas Digitales orientadas a captación de prospectos calificados.

Si desean conocer el plan de trabajo y modernizar sus canales de venta, pueden responder directamente a este mensaje para agendar una reunión formal con nuestro equipo.

💡 Si tienen alguna duda o desean conocer más sobre nuestro trabajo y portafolio de servicios, pueden consultar nuestro sitio web oficial:
👉 https://vertexcorp.com.co/es

Atentamente,
*Ray Mendoza* | Director de Desarrollo
VERTEX Innovation & Consulting
📱 +57 300 865 8910 | ✉️ gerenciavertexsas@gmail.com
🌐 https://vertexcorp.com.co/es`;
    }

    const emailDraft: OutreachDraftDto = {
      leadId,
      channel: 'EMAIL',
      version: 1,
      subject: emailSubject,
      body: emailBody,
      findingIds,
      serviceCodes,
      isReviewed: false,
      updatedAt: new Date().toISOString(),
    };

    const waDraft: OutreachDraftDto = {
      leadId,
      channel: 'WHATSAPP',
      version: 1,
      body: whatsappBody,
      findingIds,
      serviceCodes,
      isReviewed: false,
      updatedAt: new Date().toISOString(),
    };

    return { email: emailDraft, whatsapp: waDraft };
  }

  /**
   * Saves operator edits to an outreach draft.
   */
  async saveDraft(
    leadId: string,
    channel: OutreachChannel,
    data: { subject?: string; body: string },
  ) {
    const lead = await prisma.lead.findUnique({ where: { id: leadId } });
    if (!lead) throw new NotFoundException(`Lead ${leadId} no encontrado.`);

    const existing = await prisma.outreachDraft.findFirst({
      where: { leadId, channel },
    });

    if (existing) {
      return prisma.outreachDraft.update({
        where: { id: existing.id },
        data: {
          subject: data.subject ?? existing.subject,
          body: data.body,
          version: { increment: 1 },
          isReviewed: true,
        },
      });
    }

    return prisma.outreachDraft.create({
      data: {
        leadId,
        organizationId: lead.organizationId,
        channel,
        version: 1,
        subject: data.subject,
        body: data.body,
        isReviewed: true,
      },
    });
  }

  /**
   * Direct Dispatch: Dispatches the exact reviewed message from the backend
   * directly to Resend or Meta WhatsApp Cloud API without leaving the app.
   */
  async dispatchOutreach(
    request: SendOutreachRequest,
    operatorId = 'operator_default',
  ): Promise<SendOutreachResponse> {
    const { leadId, channel, destination, subject, body, idempotencyKey, attachClientReport } = request;

    if (!destination || !destination.trim()) {
      throw new BadRequestException('El destino de envío (correo o teléfono) no puede estar vacío.');
    }
    if (!body || !body.trim()) {
      throw new BadRequestException('El cuerpo del mensaje no puede estar vacío.');
    }
    if (!idempotencyKey) {
      throw new BadRequestException('Se requiere una clave de idempotencia única para el envío.');
    }

    const lead = await prisma.lead.findUnique({ where: { id: leadId } });
    if (!lead) throw new NotFoundException(`Lead ${leadId} no encontrado.`);

    // 1. Check idempotency: if this exact intent was already submitted, return previous record
    const existingIntent = await prisma.deliveryIntent.findUnique({
      where: { idempotencyKey },
    });
    if (existingIntent) {
      return {
        success: existingIntent.status !== 'FAILED',
        intentId: existingIntent.id,
        channel: existingIntent.channel as OutreachChannel,
        destination: existingIntent.destination,
        status: existingIntent.status as any,
        providerName: existingIntent.providerName as any,
        providerMessageId: existingIntent.providerMessageId,
        message: 'Envío ya procesado previamente (idempotencia confirmada).',
        timestamp: existingIntent.createdAt.toISOString(),
      };
    }

    // 2. Create DeliveryIntent record in PENDING status
    const intent = await prisma.deliveryIntent.create({
      data: {
        leadId: lead.id,
        organizationId: lead.organizationId,
        channel,
        destination: destination.trim(),
        subject: channel === 'EMAIL' ? (subject || 'Propuesta Comercial VERTEX') : null,
        renderedBody: body,
        idempotencyKey,
        status: 'PENDING',
        operatorId,
      },
    });

    // 3. Dispatch based on channel
    if (channel === 'EMAIL') {
      return this.dispatchEmail(intent.id, lead, destination, subject || 'Propuesta Comercial VERTEX', body, attachClientReport);
    } else {
      return this.dispatchWhatsApp(intent.id, lead, destination, body, attachClientReport);
    }
  }

  /**
   * Dispatches Email via Resend REST API or Simulation Mode.
   */
  private async dispatchEmail(
    intentId: string,
    lead: any,
    toEmail: string,
    subject: string,
    bodyText: string,
    attachClientReport?: boolean,
  ): Promise<SendOutreachResponse> {
    const isLiveResend =
      Boolean(this.resendApiKey) &&
      this.resendApiKey !== 'your_resend_api_key_here' &&
      this.resendApiKey.startsWith('re_');

    const htmlContent = generateProposalEmailHtml({
      businessName: lead.businessName,
      subject,
      body: bodyText,
      opportunityScore: lead.opportunityScore,
      highImpactServices: ['Desarrollo Web de Alta Conversión', 'Canal Oficial WhatsApp', 'SEO Local en Google Maps'],
    });

    if (isLiveResend) {
      try {
        const res = await axios.post(
          'https://api.resend.com/emails',
          {
            from: this.emailFrom,
            to: [toEmail],
            reply_to: this.emailReplyTo,
            subject,
            html: htmlContent,
            text: bodyText,
            headers: {
              'X-Entity-Ref-ID': intentId,
            },
          },
          {
            headers: {
              Authorization: `Bearer ${this.resendApiKey}`,
              'Content-Type': 'application/json',
            },
            timeout: 10000,
          },
        );

        const providerMsgId = res.data?.id || `resend_${Date.now()}`;

        await prisma.deliveryIntent.update({
          where: { id: intentId },
          data: {
            status: 'ACCEPTED',
            providerName: 'resend',
            providerMessageId: providerMsgId,
            dispatchedAt: new Date(),
          },
        });

        await prisma.deliveryAttempt.create({
          data: {
            deliveryIntentId: intentId,
            status: 'ACCEPTED',
            responseRaw: res.data,
          },
        });

        await this.updateLeadContactedState(lead.id, 'EMAIL');

        return {
          success: true,
          intentId,
          channel: 'EMAIL',
          destination: toEmail,
          status: 'ACCEPTED',
          providerName: 'resend',
          providerMessageId: providerMsgId,
          message: 'Aceptado por el proveedor Resend para entrega.',
          timestamp: new Date().toISOString(),
        };
      } catch (err: any) {
        const errorMsg = err.response?.data?.message || err.message;
        this.logger.error(`Resend dispatch error: ${errorMsg}`);

        await prisma.deliveryIntent.update({
          where: { id: intentId },
          data: {
            status: 'FAILED',
            providerName: 'resend',
            errorDetails: errorMsg,
          },
        });

        await prisma.deliveryAttempt.create({
          data: {
            deliveryIntentId: intentId,
            status: 'FAILED',
            errorMessage: errorMsg,
          },
        });

        return {
          success: false,
          intentId,
          channel: 'EMAIL',
          destination: toEmail,
          status: 'FAILED',
          providerName: 'resend',
          message: `Error al enviar con Resend: ${errorMsg}`,
          timestamp: new Date().toISOString(),
        };
      }
    } else {
      // ── Simulation Mode ──
      const simulatedMsgId = `sim_email_${Date.now()}`;
      this.logger.log(`[OUTREACH SIMULATION] Email dispatch to ${toEmail} | Subject: "${subject}"`);

      await prisma.deliveryIntent.update({
        where: { id: intentId },
        data: {
          status: 'ACCEPTED',
          providerName: 'simulation',
          providerMessageId: simulatedMsgId,
          dispatchedAt: new Date(),
        },
      });

      await prisma.deliveryAttempt.create({
        data: {
          deliveryIntentId: intentId,
          status: 'ACCEPTED',
          responseRaw: { simulated: true, note: 'Entorno de prueba sin API key real' },
        },
      });

      await this.updateLeadContactedState(lead.id, 'EMAIL');

      return {
        success: true,
        intentId,
        channel: 'EMAIL',
        destination: toEmail,
        status: 'ACCEPTED',
        providerName: 'simulation',
        providerMessageId: simulatedMsgId,
        message: 'Aceptado en Modo Simulación (no se envió al exterior; configure RESEND_API_KEY en producción).',
        timestamp: new Date().toISOString(),
      };
    }
  }

  /**
   * Dispatches WhatsApp via Meta WhatsApp Business Cloud API or Simulation Mode.
   */
  private async dispatchWhatsApp(
    intentId: string,
    lead: any,
    phoneE164: string,
    messageText: string,
    attachClientReport?: boolean,
  ): Promise<SendOutreachResponse> {
    const isLiveWhatsApp =
      Boolean(this.whatsappToken) &&
      this.whatsappToken !== 'your_whatsapp_api_token_here' &&
      Boolean(this.whatsappPhoneId);

    const cleanNumber = phoneE164.replace(/[^\d]/g, '');

    if (isLiveWhatsApp) {
      try {
        const metaUrl = `https://graph.facebook.com/${this.whatsappApiVersion}/${this.whatsappPhoneId}/messages`;
        const res = await axios.post(
          metaUrl,
          {
            messaging_product: 'whatsapp',
            recipient_type: 'individual',
            to: cleanNumber,
            type: 'text',
            text: {
              preview_url: true,
              body: messageText,
            },
          },
          {
            headers: {
              Authorization: `Bearer ${this.whatsappToken}`,
              'Content-Type': 'application/json',
            },
            timeout: 10000,
          },
        );

        const providerMsgId = res.data?.messages?.[0]?.id || `wamid_${Date.now()}`;

        await prisma.deliveryIntent.update({
          where: { id: intentId },
          data: {
            status: 'ACCEPTED',
            providerName: 'whatsapp_cloud',
            providerMessageId: providerMsgId,
            dispatchedAt: new Date(),
          },
        });

        await prisma.deliveryAttempt.create({
          data: {
            deliveryIntentId: intentId,
            status: 'ACCEPTED',
            responseRaw: res.data,
          },
        });

        await this.updateLeadContactedState(lead.id, 'WHATSAPP');

        return {
          success: true,
          intentId,
          channel: 'WHATSAPP',
          destination: phoneE164,
          status: 'ACCEPTED',
          providerName: 'whatsapp_cloud',
          providerMessageId: providerMsgId,
          message: 'Aceptado por Meta WhatsApp Cloud API para entrega.',
          timestamp: new Date().toISOString(),
        };
      } catch (err: any) {
        const errorMsg =
          err.response?.data?.error?.message ||
          err.response?.data?.message ||
          err.message;
        this.logger.error(`Meta WhatsApp dispatch error: ${errorMsg}`);

        await prisma.deliveryIntent.update({
          where: { id: intentId },
          data: {
            status: 'FAILED',
            providerName: 'whatsapp_cloud',
            errorDetails: errorMsg,
          },
        });

        await prisma.deliveryAttempt.create({
          data: {
            deliveryIntentId: intentId,
            status: 'FAILED',
            errorMessage: errorMsg,
          },
        });

        return {
          success: false,
          intentId,
          channel: 'WHATSAPP',
          destination: phoneE164,
          status: 'FAILED',
          providerName: 'whatsapp_cloud',
          message: `Rechazado por Meta API: ${errorMsg}`,
          timestamp: new Date().toISOString(),
        };
      }
    } else {
      // ── Simulation Mode ──
      const simulatedMsgId = `sim_wa_${Date.now()}`;
      this.logger.log(`[OUTREACH SIMULATION] WhatsApp dispatch to ${phoneE164} | Body: "${messageText.slice(0, 80)}..."`);

      await prisma.deliveryIntent.update({
        where: { id: intentId },
        data: {
          status: 'ACCEPTED',
          providerName: 'simulation',
          providerMessageId: simulatedMsgId,
          dispatchedAt: new Date(),
        },
      });

      await prisma.deliveryAttempt.create({
        data: {
          deliveryIntentId: intentId,
          status: 'ACCEPTED',
          responseRaw: { simulated: true, note: 'Entorno de prueba sin API token Meta' },
        },
      });

      await this.updateLeadContactedState(lead.id, 'WHATSAPP');

      return {
        success: true,
        intentId,
        channel: 'WHATSAPP',
        destination: phoneE164,
        status: 'ACCEPTED',
        providerName: 'simulation',
        providerMessageId: simulatedMsgId,
        message: 'Aceptado en Modo Simulación (no se envió al exterior; configure WHATSAPP_API_TOKEN en producción).',
        timestamp: new Date().toISOString(),
      };
    }
  }

  /**
   * Updates lead delivery state.
   */
  private async updateLeadContactedState(leadId: string, channel: string) {
    try {
      await prisma.lead.update({
        where: { id: leadId },
        data: {
          status: 'CONTACTED',
          deliveryStatus: 'ACCEPTED',
          lastDeliveryAt: new Date(),
        },
      });
    } catch {
      // ignore in offline fallback
    }
  }

  /**
   * Retrieves delivery history for a lead.
   */
  async getDeliveryHistory(leadId: string): Promise<DeliveryHistoryItem[]> {
    try {
      const items = await prisma.deliveryIntent.findMany({
        where: { leadId },
        orderBy: { createdAt: 'desc' },
      });

      return items.map((item) => ({
        id: item.id,
        channel: item.channel as OutreachChannel,
        destination: item.destination,
        subject: item.subject,
        bodySnippet: item.renderedBody.slice(0, 100),
        status: item.status,
        providerName: item.providerName,
        providerMessageId: item.providerMessageId,
        errorDetails: item.errorDetails,
        createdAt: item.createdAt.toISOString(),
        dispatchedAt: item.dispatchedAt?.toISOString(),
      }));
    } catch {
      return [];
    }
  }

  /**
   * Webhook processor for Resend incoming delivery updates.
   */
  async handleResendWebhook(payload: any) {
    const type = payload?.type;
    const emailId = payload?.data?.email_id;
    if (!emailId) return { processed: false, reason: 'No email_id' };

    try {
      await prisma.webhookEvent.create({
        data: {
          provider: 'resend',
          eventType: type || 'unknown',
          payload: payload as any,
          idempotencyKey: `resend_${payload?.id || Date.now()}`,
        },
      });

      const intent = await prisma.deliveryIntent.findFirst({
        where: { providerMessageId: emailId },
      });

      if (intent) {
        let newStatus: any = intent.status;
        if (type === 'email.delivered') newStatus = 'DELIVERED';
        else if (type === 'email.bounced' || type === 'email.complained') newStatus = 'FAILED';

        await prisma.deliveryIntent.update({
          where: { id: intent.id },
          data: { status: newStatus },
        });
      }
    } catch (err: any) {
      this.logger.error(`Resend webhook error: ${err.message}`);
    }

    return { processed: true };
  }

  /**
   * Webhook processor for Meta WhatsApp Cloud API status updates.
   */
  async handleWhatsAppWebhook(payload: any) {
    try {
      const entry = payload?.entry?.[0];
      const changes = entry?.changes?.[0];
      const value = changes?.value;
      const statuses = value?.statuses?.[0];

      if (statuses) {
        const wamid = statuses.id;
        const statusStr = statuses.status; // sent, delivered, read, failed

        await prisma.webhookEvent.create({
          data: {
            provider: 'whatsapp',
            eventType: `status_${statusStr}`,
            payload: payload as any,
            idempotencyKey: `wa_${statuses.id}_${statusStr}`,
          },
        });

        const intent = await prisma.deliveryIntent.findFirst({
          where: { providerMessageId: wamid },
        });

        if (intent) {
          let newStatus: any = intent.status;
          if (statusStr === 'delivered' || statusStr === 'read') newStatus = 'DELIVERED';
          else if (statusStr === 'sent') newStatus = 'SENT';
          else if (statusStr === 'failed') newStatus = 'FAILED';

          await prisma.deliveryIntent.update({
            where: { id: intent.id },
            data: { status: newStatus },
          });
        }
      }
    } catch (err: any) {
      this.logger.error(`WhatsApp webhook error: ${err.message}`);
    }

    return { processed: true };
  }
}
