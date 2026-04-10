// ============================================
// WASI TECH — Función: Enviar Email de Confirmación
// Futuro: integrar con MailerLite o SMTP
// ============================================

exports.handler = async function(event) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Método no permitido' }) };
  }

  try {
    const { email, name, order_id, items, total } = JSON.parse(event.body);

    if (!email || !order_id) {
      return { statusCode: 400, body: JSON.stringify({ error: 'Datos incompletos' }) };
    }

    // ── TODO: Enviar via MailerLite API ──────────
    // const response = await fetch('https://api.mailerlite.com/api/v2/campaigns', {
    //   headers: { 'X-MailerLite-ApiKey': process.env.MAILERLITE_API_KEY }
    // });

    // ── TODO: Enviar via SMTP (Nodemailer) ───────
    // const transporter = nodemailer.createTransporter({ ... });
    // await transporter.sendMail({ to: email, subject: `Pedido ${order_id}` });

    console.log(`Confirmación pendiente para: ${email} - Pedido: ${order_id}`);

    return {
      statusCode: 200,
      body: JSON.stringify({ success: true, message: 'Email en cola' })
    };

  } catch (err) {
    console.error('Error en send-confirmation:', err);
    return { statusCode: 500, body: JSON.stringify({ error: 'Error al enviar email' }) };
  }
};
