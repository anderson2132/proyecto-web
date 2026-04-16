// ============================================
// WASI TECH — Función: Crear Pedido
// Futuro: procesar pago con Culqi + guardar en Supabase
// ============================================

// Catálogo de precios en el servidor — fuente de verdad para validar totales
const CATALOG = {
  1:  { name: 'Soporte Monitor Bambú Pro',       price: 89.90  },
  2:  { name: 'Soporte Dual Monitor',            price: 149.90 },
  3:  { name: 'Brazo Articulado Monitor',        price: 129.90 },
  4:  { name: 'Soporte Laptop Plegable',         price: 59.90  },
  5:  { name: 'Soporte Teléfono Escritorio',     price: 29.90  },
  6:  { name: 'Reposamuñecas Gel Premium',       price: 39.90  },
  7:  { name: 'Lámpara LED Escritorio',          price: 79.90  },
  8:  { name: 'Luz Clip Monitor LED',            price: 49.90  },
  9:  { name: 'Ring Light 10" USB',             price: 69.90  },
  10: { name: 'Lámpara Solar Escritorio',        price: 89.90  },
  11: { name: 'Teclado Mecánico Compacto',       price: 199.90 },
  12: { name: 'Teclado KeyFlow Pro 75%',         price: 279.90 },
  13: { name: 'Ratón Ergonómico Vertical',       price: 89.90  },
  14: { name: 'Ratón Inalámbrico Silent',        price: 69.90  },
  15: { name: 'Webcam Full HD 1080p',            price: 149.90 },
  16: { name: 'Auriculares Noise Cancelling',    price: 229.90 },
  17: { name: 'Desk Pad XL Minimalista',         price: 59.90  },
  18: { name: 'Hub USB-C 7 en 1',               price: 89.90  },
  19: { name: 'Organizador Cables Escritorio',   price: 29.90  },
  20: { name: 'Cargador Inalámbrico 15W',        price: 49.90  },
};

const SHIPPING_THRESHOLD = 150;
const SHIPPING_COST      = 15;

exports.handler = async function(event) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Método no permitido' }) };
  }

  try {
    const body = JSON.parse(event.body);
    const { customer, items, token } = body;

    // ── Validaciones básicas ─────────────────────
    if (!customer?.email || !customer?.name || !Array.isArray(items) || !items.length) {
      return { statusCode: 400, body: JSON.stringify({ error: 'Datos incompletos' }) };
    }

    // ── Recalcular total en el servidor ──────────
    // Nunca confiar en el total enviado por el cliente
    let subtotal = 0;
    for (const item of items) {
      const product = CATALOG[item.id];
      if (!product) {
        return { statusCode: 400, body: JSON.stringify({ error: `Producto inválido: ${item.id}` }) };
      }
      const qty = Math.max(1, Math.min(99, parseInt(item.qty, 10) || 1));
      subtotal += product.price * qty;
    }
    const shipping = subtotal >= SHIPPING_THRESHOLD ? 0 : SHIPPING_COST;
    const total    = +(subtotal + shipping).toFixed(2);

    // ── TODO: Integrar Culqi ─────────────────────
    // const culqi = require('culqi-node');
    // const charge = await culqi.charges.create({ amount: total * 100, currency: 'PEN', token });

    // ── TODO: Guardar pedido en Supabase ─────────
    // const { data, error } = await supabase.from('orders').insert({ customer, items, total });

    // ── TODO: Enviar email de confirmación ───────
    // await sendConfirmationEmail(customer.email, order);

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        success:  true,
        message:  'Pedido recibido. Te contactaremos por WhatsApp para confirmar.',
        order_id: `WT-${Date.now()}`,
        total
      })
    };

  } catch (err) {
    console.error('Error en create-order:', err.message);
    return { statusCode: 500, body: JSON.stringify({ error: 'Error interno. Intenta de nuevo.' }) };
  }
};
