// ============================================
// WASI TECH — Función: Crear Pedido
// Futuro: procesar pago con Culqi + guardar en Supabase
// ============================================

exports.handler = async function(event) {
  // Solo acepta POST
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Método no permitido' }) };
  }

  try {
    const body = JSON.parse(event.body);
    const { customer, items, total, token } = body;

    // ── Validaciones básicas ─────────────────────
    if (!customer?.email || !customer?.name || !items?.length || !total) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Datos incompletos' })
      };
    }

    // ── TODO: Integrar Culqi ─────────────────────
    // const culqi = require('culqi-node');
    // const charge = await culqi.charges.create({ ... });

    // ── TODO: Guardar pedido en Supabase ─────────
    // const { data, error } = await supabase.from('orders').insert({ ... });

    // ── TODO: Enviar email de confirmación ───────
    // await sendConfirmationEmail(customer.email, order);

    // Respuesta temporal (mientras se integran los servicios)
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        success: true,
        message: 'Pedido recibido. Te contactaremos por WhatsApp para confirmar.',
        order_id: `WT-${Date.now()}`
      })
    };

  } catch (err) {
    console.error('Error en create-order:', err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Error interno. Intenta de nuevo.' })
    };
  }
};
