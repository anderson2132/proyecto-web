/* ============================================
   QORI WASI — JavaScript Principal
   Versión auditada y refactorizada
   ============================================ */

'use strict';

// ============================================
// UTILIDADES SEGURAS — prevención XSS
// ============================================

/** Escapa caracteres HTML peligrosos antes de insertar en el DOM */
const escapeHtml = (str) => {
  if (typeof str !== 'string') return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
};

/** Crea un elemento DOM con atributos seguros (sin innerHTML) */
const createElement = (tag, attrs = {}, children = []) => {
  const el = document.createElement(tag);
  Object.entries(attrs).forEach(([k, v]) => {
    if (k === 'className') el.className = v;
    else if (k === 'textContent') el.textContent = v;
    else if (k === 'title') el.title = v;
    else if (k === 'type') el.type = v;
    else if (k === 'ariaLabel') el.setAttribute('aria-label', v);
    else el.setAttribute(k, v);
  });
  children.forEach(child => {
    if (typeof child === 'string') el.appendChild(document.createTextNode(child));
    else if (child instanceof Node) el.appendChild(child);
  });
  return el;
};

// ============================================
// CATÁLOGO DE PRODUCTOS — Tech Home Office
// ============================================
const catalog = [
  // SOPORTES & STANDS
  {
    id: 1, nombre: 'Soporte Monitor Elevador Bambú', marca: 'Qori Wasi',
    precio: 89.90, precioOriginal: 119.90, descuento: 25,
    cat: 'soportes', emoji: '🖥️', rating: 4.9, reviews: 342,
    badge: 'sale', desc: 'Madera de bambú sostenible con bandeja organizadora inferior. Eleva 10cm.'
  },
  {
    id: 2, nombre: 'Brazo Articulado Doble Monitor', marca: 'ErgoArm',
    precio: 249.00, precioOriginal: null, descuento: 0,
    cat: 'soportes', emoji: '🖥️', rating: 4.8, reviews: 218,
    badge: 'hot', desc: 'Brazo VESA 75/100mm, carga máx. 8kg por pantalla. Ajuste en 360°.'
  },
  {
    id: 3, nombre: 'Soporte Laptop Plegable Aluminio', marca: 'Qori Wasi',
    precio: 69.90, precioOriginal: 89.90, descuento: 22,
    cat: 'soportes', emoji: '💻', rating: 4.7, reviews: 597,
    badge: 'sale', desc: 'Aleación de aluminio 6061. Plegable, altura ajustable en 6 niveles.'
  },
  {
    id: 4, nombre: 'Soporte Teléfono y Tablet 360°', marca: 'Flexstand',
    precio: 39.90, precioOriginal: null, descuento: 0,
    cat: 'soportes', emoji: '📱', rating: 4.6, reviews: 1203,
    badge: 'new', desc: 'Compatible con dispositivos de 4" a 13". Rotación completa.'
  },
  {
    id: 5, nombre: 'Soporte Documentos Vertical Acrílico', marca: 'Qori Wasi',
    precio: 45.00, precioOriginal: 58.00, descuento: 22,
    cat: 'soportes', emoji: '📋', rating: 4.5, reviews: 189,
    badge: null, desc: 'Acrílico transparente. Sostenedor de documentos A4 con clip ajustable.'
  },
  {
    id: 6, nombre: 'Reposamuñecas Gel Premium Teclado', marca: 'ErgoRest',
    precio: 49.90, precioOriginal: null, descuento: 0,
    cat: 'soportes', emoji: '⌨️', rating: 4.8, reviews: 445,
    badge: null, desc: 'Gel de memoria con cobertura en tela transpirable. 45cm de largo.'
  },
  // ILUMINACIÓN
  {
    id: 7, nombre: 'Lámpara LED Escritorio con Puerto USB', marca: 'LumEco',
    precio: 99.90, precioOriginal: 129.90, descuento: 23,
    cat: 'iluminacion', emoji: '💡', rating: 4.9, reviews: 867,
    badge: 'sale', desc: '5 modos de color, 10 niveles de brillo. Carga USB integrada. CRI>90.'
  },
  {
    id: 8, nombre: 'Lámpara Clip Monitor Anti-Fatiga', marca: 'LumEco',
    precio: 79.90, precioOriginal: null, descuento: 0,
    cat: 'iluminacion', emoji: '🔦', rating: 4.8, reviews: 634,
    badge: 'hot', desc: 'Sin reflejos en pantalla. Control táctil. Sensor presencia automático.'
  },
  {
    id: 9, nombre: 'Ring Light LED 10" con Trípode', marca: 'PixelGlow',
    precio: 119.00, precioOriginal: 159.00, descuento: 25,
    cat: 'iluminacion', emoji: '🌟', rating: 4.7, reviews: 523,
    badge: 'sale', desc: 'Luz fría/cálida/neutra. Soporte telescópico hasta 1.5m.'
  },
  {
    id: 10, nombre: 'Lámpara Escritorio Solar Inalámbrica', marca: 'SolarDesk',
    precio: 139.00, precioOriginal: null, descuento: 0,
    cat: 'iluminacion', emoji: '☀️', rating: 4.5, reviews: 198,
    badge: 'new', desc: 'Panel solar integrado. Batería 4000mAh. Hasta 12h de autonomía.'
  },
  // PERIFÉRICOS
  {
    id: 11, nombre: 'Teclado Mecánico Compacto 75%', marca: 'KeyFlow',
    precio: 349.00, precioOriginal: 429.00, descuento: 19,
    cat: 'perifericos', emoji: '⌨️', rating: 4.9, reviews: 1089,
    badge: 'sale', desc: 'Switches brown táctiles. Retroiluminación RGB per-key. Inalámbrico BT5.'
  },
  {
    id: 12, nombre: 'Ratón Vertical Ergonómico Inalámbrico', marca: 'ErgoClick',
    precio: 189.00, precioOriginal: 229.00, descuento: 17,
    cat: 'perifericos', emoji: '🖱️', rating: 4.8, reviews: 762,
    badge: 'sale', desc: 'Posición natural 57°. DPI ajustable 400-3200. Batería 90 días.'
  },
  {
    id: 13, nombre: 'Webcam 4K Auto-Focus con Micrófono', marca: 'ClearView',
    precio: 299.00, precioOriginal: null, descuento: 0,
    cat: 'perifericos', emoji: '📷', rating: 4.8, reviews: 445,
    badge: 'hot', desc: 'Resolución 4K@30fps / 1080p@60fps. Obturador de privacidad. USB-C.'
  },
  {
    id: 14, nombre: 'Auriculares ANC Modo Concentración', marca: 'FocusSound',
    precio: 449.00, precioOriginal: 599.00, descuento: 25,
    cat: 'perifericos', emoji: '🎧', rating: 4.9, reviews: 1234,
    badge: 'sale', desc: 'Cancelación activa de ruido -35dB. 40h batería. Carga rápida 10min=3h.'
  },
  // ORGANIZACIÓN
  {
    id: 15, nombre: 'Organizador Desk Pad XL 90x40cm', marca: 'Qori Wasi',
    precio: 79.90, precioOriginal: null, descuento: 0,
    cat: 'organizacion', emoji: '🗒️', rating: 4.9, reviews: 2341,
    badge: 'hot', desc: 'Base antideslizante. Piel vegana premium. 5 colores disponibles.'
  },
  {
    id: 16, nombre: 'Bandeja Cajón Bajo Escritorio', marca: 'HideDesk',
    precio: 119.00, precioOriginal: 145.00, descuento: 18,
    cat: 'organizacion', emoji: '🗄️', rating: 4.7, reviews: 389,
    badge: null, desc: 'Instalación sin tornillos. Carga máx. 5kg. Teclado y mouse en reposo.'
  },
  {
    id: 17, nombre: 'Organizador Cables Clip x8 Silicona', marca: 'CableZen',
    precio: 19.90, precioOriginal: 26.00, descuento: 23,
    cat: 'organizacion', emoji: '🔌', rating: 4.6, reviews: 3218,
    badge: 'sale', desc: 'Silicona autoenlazante. Autoadhesivo 3M. Sin residuos al retirar.'
  },
  {
    id: 18, nombre: 'Hub USB-C 7 en 1 Aluminio Pro', marca: 'ConnectAll',
    precio: 159.00, precioOriginal: 199.00, descuento: 20,
    cat: 'organizacion', emoji: '🔗', rating: 4.8, reviews: 1567,
    badge: 'sale', desc: 'HDMI 4K, USB-A x3, SD, MicroSD, USB-C 100W PD. Aluminio CNC.'
  },
  {
    id: 19, nombre: 'Cargador Inalámbrico 15W Flat Pad', marca: 'AirCharge',
    precio: 89.00, precioOriginal: null, descuento: 0,
    cat: 'organizacion', emoji: '⚡', rating: 4.7, reviews: 892,
    badge: 'new', desc: 'Qi 15W compatible iPhone/Android. Ultra-delgado 5mm. LED indicador.'
  },
  {
    id: 20, nombre: 'Multicharger 65W GaN 4 puertos', marca: 'PowerGaN',
    precio: 129.00, precioOriginal: 169.00, descuento: 24,
    cat: 'organizacion', emoji: '🔋', rating: 4.9, reviews: 734,
    badge: 'sale', desc: 'Tecnología GaN. USB-C x2 + USB-A x2. Carga simultánea 4 dispositivos.'
  },
];

const MAX_ITEM_QTY = 10;
const SHIPPING_THRESHOLD = 150;

// ============================================
// CARRITO — con manejo seguro de errores
// ============================================
const loadFromStorage = (key, fallback) => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
};

const saveToStorage = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.warn('No se pudo guardar en localStorage:', e.message);
  }
};

let cart     = loadFromStorage('qoriwasi_cart', []);
let wishlist = loadFromStorage('qoriwasi_wish', []);

const saveCart = () => {
  saveToStorage('qoriwasi_cart', cart);
  updateCartBadge();
  renderCartDrawer();
};

const updateCartBadge = () => {
  const total = cart.reduce((s, i) => s + i.qty, 0);
  document.querySelectorAll('.cart-count').forEach(el => {
    el.textContent = String(total);
    el.style.display = total > 0 ? 'flex' : 'none';
  });
};

const addToCart = (id) => {
  const numId = Number(id);
  if (!Number.isInteger(numId) || numId <= 0) return;
  const product = catalog.find(p => p.id === numId);
  if (!product) return;

  const existing = cart.find(i => i.id === numId);
  if (existing) {
    if (existing.qty >= MAX_ITEM_QTY) {
      showToast(`Máximo ${MAX_ITEM_QTY} unidades por producto`);
      return;
    }
    existing.qty++;
  } else {
    cart.push({
      id: product.id,
      nombre: product.nombre,
      marca: product.marca,
      precio: product.precio,
      emoji: product.emoji,
      qty: 1,
    });
  }
  saveCart();
  showToast(`${product.nombre} agregado al carrito`);
};

const removeFromCart = (id) => {
  const numId = Number(id);
  cart = cart.filter(i => i.id !== numId);
  saveCart();
};

const changeQty = (id, delta) => {
  const numId = Number(id);
  const item = cart.find(i => i.id === numId);
  if (!item) return;
  const newQty = item.qty + delta;
  if (newQty <= 0) {
    removeFromCart(numId);
  } else if (newQty <= MAX_ITEM_QTY) {
    item.qty = newQty;
    saveCart();
  }
};

const cartTotal = () => {
  const total = cart.reduce((s, i) => {
    const price = Number(i.precio);
    const qty   = Number(i.qty);
    return s + (isNaN(price) || isNaN(qty) ? 0 : price * qty);
  }, 0);
  return total.toFixed(2);
};

// ============================================
// RENDER CARRITO DRAWER — sin innerHTML con datos externos
// ============================================
const renderCartDrawer = () => {
  const listEl    = document.getElementById('cartList');
  const totalEl   = document.getElementById('cartTotalVal');
  const titleEl   = document.getElementById('cartDrawerTitle');
  const shippingEl = document.getElementById('cartShipping');
  if (!listEl) return;

  const count = cart.reduce((s, i) => s + i.qty, 0);
  if (titleEl) titleEl.textContent = `Carrito (${count} ${count === 1 ? 'producto' : 'productos'})`;

  // Limpia el contenido previo de forma segura
  while (listEl.firstChild) listEl.removeChild(listEl.firstChild);

  if (cart.length === 0) {
    const empty = createElement('div', { className: 'cart-empty-state' }, [
      createElement('i', { textContent: '🛒' }),
      createElement('p', { textContent: 'Tu carrito está vacío' }),
      createElement('small', { textContent: 'Descubre nuestra colección de home office' }),
    ]);
    listEl.appendChild(empty);
  } else {
    cart.forEach(item => {
      const thumbEl   = createElement('div', { className: 'cart-item-thumb', textContent: item.emoji });
      const brandEl   = createElement('div', { className: 'cart-item-brand', textContent: escapeHtml(item.marca) });
      const nameEl    = createElement('div', { className: 'cart-item-name',  textContent: escapeHtml(item.nombre) });
      const priceEl   = createElement('span', { className: 'cart-item-price', textContent: `S/ ${(item.precio * item.qty).toFixed(2)}` });
      const removeBtn = createElement('button', { className: 'cart-remove', type: 'button', ariaLabel: `Eliminar ${escapeHtml(item.nombre)} del carrito`, textContent: '✕' });
      const qtyMinus  = createElement('button', { className: 'qty-btn-sm', type: 'button', ariaLabel: 'Reducir cantidad', textContent: '−' });
      const qtyVal    = createElement('span',  { className: 'qty-val', textContent: String(item.qty) });
      const qtyPlus   = createElement('button', { className: 'qty-btn-sm', type: 'button', ariaLabel: 'Aumentar cantidad', textContent: '+' });

      // Eventos con referencias seguras
      const itemId = item.id;
      qtyMinus.addEventListener('click', () => changeQty(itemId, -1));
      qtyPlus.addEventListener('click',  () => changeQty(itemId,  1));
      removeBtn.addEventListener('click', () => removeFromCart(itemId));

      const qtyControl  = createElement('div', { className: 'qty-control' }, [qtyMinus, qtyVal, qtyPlus]);
      const controlsEl  = createElement('div', { className: 'cart-item-controls' }, [qtyControl]);
      const infoEl      = createElement('div', { className: 'cart-item-info' }, [brandEl, nameEl, controlsEl]);
      const priceColEl  = createElement('div', { className: 'cart-item-price-col' }, [priceEl, removeBtn]);
      const itemEl      = createElement('div', { className: 'cart-item' }, [thumbEl, infoEl, priceColEl]);

      listEl.appendChild(itemEl);
    });
  }

  if (totalEl) totalEl.textContent = `S/ ${cartTotal()}`;

  if (shippingEl) {
    const total = parseFloat(cartTotal());
    shippingEl.style.display = total > 0 ? 'flex' : 'none';
    if (total >= SHIPPING_THRESHOLD) {
      shippingEl.textContent = '✓ ¡Envío gratis incluido!';
      shippingEl.style.color = 'var(--success)';
    } else {
      const missing = (SHIPPING_THRESHOLD - total).toFixed(2);
      shippingEl.textContent = `Agrega S/ ${missing} más para envío gratis`;
      shippingEl.style.color = 'var(--text-soft)';
    }
  }
};

// ============================================
// TOAST — notificación accesible
// ============================================
let toastTimer = null;

const showToast = (msg) => {
  const el = document.getElementById('toast');
  if (!el) return;
  const textEl = el.querySelector('.toast-text');
  if (textEl) textEl.textContent = msg;  // textContent, nunca innerHTML
  // aria-live ya está definido en el HTML (no se re-setea aquí)
  el.classList.add('visible');
  if (toastTimer) clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    el.classList.remove('visible');
    toastTimer = null;
  }, 3000);
};

// ============================================
// RENDER PRODUCTOS — DOM seguro sin innerHTML
// ============================================
const badgeLabels = { sale: 'Sale', new: 'Nuevo', hot: 'Popular' };
const badgeClasses = { sale: 'p-badge-sale', new: 'p-badge-new', hot: 'p-badge-hot' };

const starsText = (rating) => {
  const full = Math.floor(rating);
  const empty = 5 - full;
  return '★'.repeat(full) + '☆'.repeat(empty);
};

const buildProductCard = (p) => {
  const card = createElement('article', {
    className: 'product-card',
    role: 'article',
    ariaLabel: escapeHtml(p.nombre),
  });
  card.dataset.id = String(p.id);

  // Imagen / emoji area
  const imgArea = createElement('div', { className: 'product-img-area' });

  // Badge
  if (p.badge && badgeLabels[p.badge]) {
    const badgesWrap = createElement('div', { className: 'product-badges' });
    const badge = createElement('span', {
      className: `p-badge ${badgeClasses[p.badge]}`,
      textContent: badgeLabels[p.badge],
    });
    badgesWrap.appendChild(badge);
    imgArea.appendChild(badgesWrap);
  }

  // Wishlist button
  const wishBtn = createElement('button', {
    className: 'product-wish',
    type: 'button',
    ariaLabel: `Guardar ${escapeHtml(p.nombre)} en favoritos`,
    textContent: wishlist.includes(p.id) ? '♥' : '♡',
  });
  if (wishlist.includes(p.id)) wishBtn.classList.add('active');
  wishBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    toggleWish(wishBtn, p.id);
  });
  imgArea.appendChild(wishBtn);

  // Emoji del producto
  const emojiEl = createElement('span', {
    className: 'product-img-emoji',
    role: 'img',
    ariaLabel: escapeHtml(p.nombre),
    textContent: p.emoji,
  });
  imgArea.appendChild(emojiEl);

  // Quick add overlay
  const quickAdd = createElement('div', { className: 'quick-add', role: 'button', textContent: '+ Agregar al carrito' });
  quickAdd.setAttribute('tabindex', '0');
  quickAdd.addEventListener('click', () => addToCart(p.id));
  quickAdd.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') addToCart(p.id); });
  imgArea.appendChild(quickAdd);

  card.appendChild(imgArea);

  // Info
  const info = createElement('div', { className: 'product-info' });
  info.appendChild(createElement('div', { className: 'product-brand', textContent: escapeHtml(p.marca) }));
  info.appendChild(createElement('div', { className: 'product-name',  textContent: escapeHtml(p.nombre) }));

  // Stars
  const starsWrap = createElement('div', { className: 'product-stars', role: 'img', ariaLabel: `${p.rating} de 5 estrellas (${p.reviews} reseñas)` });
  starsWrap.appendChild(createElement('span', { className: 'stars-icons', textContent: starsText(p.rating) }));
  starsWrap.appendChild(createElement('span', { className: 'stars-count', textContent: `(${p.reviews.toLocaleString()})` }));
  info.appendChild(starsWrap);

  // Precio
  const footer = createElement('div', { className: 'product-footer' });
  const priceGroup = createElement('div', { className: 'product-price-group' });
  priceGroup.appendChild(createElement('span', { className: 'price-current', textContent: `S/ ${p.precio.toFixed(2)}` }));

  if (p.precioOriginal) {
    const priceRow = createElement('div', { className: 'price-row' });
    priceRow.appendChild(createElement('span', { className: 'price-original', textContent: `S/ ${p.precioOriginal.toFixed(2)}` }));
    priceRow.appendChild(createElement('span', { className: 'price-off',      textContent: `-${p.descuento}%` }));
    priceGroup.appendChild(priceRow);
  }
  footer.appendChild(priceGroup);

  const addBtn = createElement('button', {
    className: 'add-btn',
    type: 'button',
    ariaLabel: `Agregar ${escapeHtml(p.nombre)} al carrito`,
    textContent: '+',
  });
  addBtn.addEventListener('click', () => addToCart(p.id));
  footer.appendChild(addBtn);
  info.appendChild(footer);
  card.appendChild(info);

  return card;
};

const renderGrid = (cat, containerId) => {
  const container = document.getElementById(containerId);
  if (!container) return;
  while (container.firstChild) container.removeChild(container.firstChild);
  const items = cat === 'all' ? catalog : catalog.filter(p => p.cat === cat);
  const fragment = document.createDocumentFragment();
  items.forEach(p => fragment.appendChild(buildProductCard(p)));
  container.appendChild(fragment);
};

// ============================================
// WISHLIST
// ============================================
const toggleWish = (btn, id) => {
  const idx = wishlist.indexOf(id);
  if (idx > -1) {
    wishlist.splice(idx, 1);
    btn.textContent = '♡';
    btn.classList.remove('active');
  } else {
    wishlist.push(id);
    btn.textContent = '♥';
    btn.classList.add('active');
    showToast('Guardado en favoritos');
  }
  saveToStorage('qoriwasi_wish', wishlist);
};

// ============================================
// TABS
// ============================================
const initTabs = () => {
  document.querySelectorAll('[data-tab-group]').forEach(group => {
    group.querySelectorAll('.tab-btn').forEach(btn => {
      btn.addEventListener('click', function () {
        group.querySelectorAll('.tab-btn').forEach(b => {
          b.classList.remove('active');
          b.setAttribute('aria-selected', 'false');
        });
        group.querySelectorAll('.tab-content').forEach(c => {
          c.classList.remove('active');
          c.setAttribute('hidden', '');
        });
        this.classList.add('active');
        this.setAttribute('aria-selected', 'true');
        const target = document.getElementById(this.dataset.tab);
        if (target) {
          target.classList.add('active');
          target.removeAttribute('hidden');
        }
      });
    });
  });
};

// ============================================
// COUNTDOWN — con cleanup de intervalo
// ============================================
let countdownInterval = null;

const initCountdown = () => {
  const end  = new Date(Date.now() + 1000 * (3 * 3600 + 47 * 60 + 33));
  const nums = document.querySelectorAll('.cd-num');
  if (!nums.length) return;

  const tick = () => {
    const diff = Math.max(0, end - Date.now());
    if (diff === 0 && countdownInterval) {
      clearInterval(countdownInterval);
      countdownInterval = null;
    }
    if (nums[0]) nums[0].textContent = String(Math.floor(diff / 3600000)).padStart(2, '0');
    if (nums[1]) nums[1].textContent = String(Math.floor((diff % 3600000) / 60000)).padStart(2, '0');
    if (nums[2]) nums[2].textContent = String(Math.floor((diff % 60000) / 1000)).padStart(2, '0');
  };

  tick();
  countdownInterval = setInterval(tick, 1000);
};

// ============================================
// CART DRAWER
// ============================================
const initCartDrawer = () => {
  const overlay     = document.getElementById('drawerOverlay');
  const drawer      = document.getElementById('cartDrawer');
  const openBtns    = document.querySelectorAll('[data-open-cart]');
  const closeBtn    = document.getElementById('drawerClose');
  const checkoutBtn = document.getElementById('checkoutBtn');

  const openDrawer = () => {
    if (!overlay || !drawer) return;
    overlay.classList.add('open');
    drawer.classList.add('open');
    drawer.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    renderCartDrawer();
    closeBtn?.focus();
  };

  const closeDrawer = () => {
    if (!overlay || !drawer) return;
    overlay.classList.remove('open');
    drawer.classList.remove('open');
    drawer.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  };

  openBtns.forEach(btn => btn.addEventListener('click', openDrawer));
  closeBtn?.addEventListener('click', closeDrawer);
  overlay?.addEventListener('click', closeDrawer);

  // Cerrar con Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && drawer?.classList.contains('open')) closeDrawer();
  });

  checkoutBtn?.addEventListener('click', () => {
    if (cart.length === 0) {
      showToast('Tu carrito está vacío');
    } else {
      showToast('Redirigiendo al pago…');
    }
  });
};

// ============================================
// NEWSLETTER — con validación segura
// ============================================
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const initNewsletter = () => {
  const form = document.getElementById('newsletterForm');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const input = form.querySelector('input[type="email"]');
    if (!input) return;
    const email = input.value.trim();
    if (!EMAIL_REGEX.test(email)) {
      showToast('Por favor ingresa un correo válido');
      input.focus();
      return;
    }
    showToast('¡Suscripción confirmada!');
    input.value = '';
  });
};

// ============================================
// BÚSQUEDA — con sanitización
// ============================================
const initSearch = () => {
  const input = document.querySelector('.search-wrapper input');
  if (!input) return;

  // Limitar longitud del input
  input.setAttribute('maxlength', '100');

  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      const query = input.value.trim();
      if (query.length < 2) { showToast('Escribe al menos 2 caracteres'); return; }
      // escapeHtml antes de mostrar en toast
      showToast(`Buscando: "${escapeHtml(query)}"…`);
    }
  });
};

// ============================================
// ANNOUNCEMENT BAR
// ============================================
const initAnnouncement = () => {
  document.querySelector('.announcement-close')?.addEventListener('click', function () {
    const bar = this.closest('.announcement-bar');
    if (bar) {
      bar.setAttribute('aria-hidden', 'true');
      bar.style.display = 'none';
    }
  });
};

// ============================================
// HERO CARDS — accesibilidad teclado
// ============================================
const initHeroCards = () => {
  document.querySelectorAll('.hero-card').forEach(card => {
    card.setAttribute('role', 'button');
    card.setAttribute('tabindex', '0');
    const handler = () => document.getElementById('productos')?.scrollIntoView({ behavior: 'smooth' });
    card.addEventListener('click', handler);
    card.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') handler(); });
  });
};

// ============================================
// SCROLL TO SECTION
// ============================================
const scrollToSection = (id) => {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: 'smooth' });
};

// ============================================
// SWITCH TAB
// ============================================
const switchTab = (tabId) => {
  const btn = document.querySelector(`[data-tab="${tabId}"]`);
  if (btn) {
    btn.click();
    document.getElementById('productos')?.scrollIntoView({ behavior: 'smooth' });
  }
};

// ============================================
// EVENT DELEGATION — data-* atributos globales
// ============================================
const initDataDelegation = () => {
  document.addEventListener('click', (e) => {
    // data-section → scroll a sección
    const sectionBtn = e.target.closest('[data-section]');
    if (sectionBtn) {
      scrollToSection(sectionBtn.dataset.section);
      return;
    }

    // data-add-to-cart → agregar producto al carrito
    const addBtn = e.target.closest('[data-add-to-cart]');
    if (addBtn) {
      const id = parseInt(addBtn.dataset.addToCart, 10);
      if (!isNaN(id)) addToCart(id);
      return;
    }

    // data-switch-tab → cambiar pestaña activa
    const tabLink = e.target.closest('[data-switch-tab]');
    if (tabLink) {
      e.preventDefault();
      switchTab(tabLink.dataset.switchTab);
    }
  });
};

// ============================================
// INIT
// ============================================
document.addEventListener('DOMContentLoaded', () => {
  try {
    renderGrid('all',          'gridAll');
    renderGrid('soportes',     'gridSoportes');
    renderGrid('iluminacion',  'gridIluminacion');
    renderGrid('perifericos',  'gridPerifericos');
    renderGrid('organizacion', 'gridOrganizacion');

    initTabs();
    initCountdown();
    initCartDrawer();
    initNewsletter();
    initSearch();
    initAnnouncement();
    initHeroCards();
    initDataDelegation();
    updateCartBadge();
    renderCartDrawer();
  } catch (e) {
    console.error('Error al inicializar Qori Wasi:', e);
  }
});
