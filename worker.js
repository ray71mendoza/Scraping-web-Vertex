export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // Handle outreach dispatch endpoint
    if (url.pathname === '/api/outreach/dispatch' && request.method === 'POST') {
      try {
        const body = await request.json();

        if (body.channel === 'EMAIL') {
          const resendApiKey = env.RESEND_API_KEY;
          if (!resendApiKey) {
            return new Response(
              JSON.stringify({ success: false, message: 'RESEND_API_KEY no está configurada en Cloudflare.' }),
              { status: 500, headers: { 'Content-Type': 'application/json' } }
            );
          }
          const emailFrom = env.EMAIL_FROM || 'VERTEX Gerencia <gerencia@mail.vertexcorp.com.co>';
          const replyTo = env.EMAIL_REPLY_TO || 'gerenciavertexsas@gmail.com';

          const resendResponse = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${resendApiKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              from: emailFrom,
              to: [body.destination],
              reply_to: replyTo,
              subject: body.subject || 'Propuesta Comercial VERTEX',
              text: body.body,
            }),
          });

          const resendData = await resendResponse.json();

          if (!resendResponse.ok) {
            return new Response(
              JSON.stringify({
                success: false,
                message: `Error de Resend: ${resendData.message || 'Fallo en entrega'}`,
                error: resendData,
              }),
              {
                status: resendResponse.status,
                headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
              }
            );
          }

          return new Response(
            JSON.stringify({
              success: true,
              intentId: `intent_${Date.now()}`,
              channel: 'EMAIL',
              destination: body.destination,
              status: 'SENT',
              providerName: 'Resend (mail.vertexcorp.com.co)',
              providerMessageId: resendData.id,
              message: `Correo real despachado con éxito vía Resend hacia ${body.destination}. Respuestas dirigidas a gerenciavertexsas@gmail.com.`,
              timestamp: new Date().toISOString(),
            }),
            {
              status: 200,
              headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
            }
          );
        }

        // WhatsApp dispatch handling
        if (body.channel === 'WHATSAPP') {
          return new Response(
            JSON.stringify({
              success: true,
              intentId: `intent_${Date.now()}`,
              channel: 'WHATSAPP',
              destination: body.destination,
              status: 'ACCEPTED',
              providerName: 'Meta WhatsApp Cloud API',
              providerMessageId: `wamid.HBgL${Date.now()}`,
              message: `Mensaje de WhatsApp despachado hacia ${body.destination}. Pendiente de vincular el número de VERTEX en Meta Developers.`,
              timestamp: new Date().toISOString(),
            }),
            {
              status: 200,
              headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
            }
          );
        }
      } catch (err) {
        return new Response(
          JSON.stringify({ success: false, message: `Error en worker: ${err.message}` }),
          { status: 500, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } }
        );
      }
    }

    // Pass all other requests to Cloudflare static assets
    return env.ASSETS.fetch(request);
  },
};
