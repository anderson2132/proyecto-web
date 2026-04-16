// ============================================
// WASI TECH — Supabase Auth
// SUPABASE_ANON_KEY es pública por diseño (Supabase la expone al cliente).
// La seguridad real se gestiona con Row Level Security (RLS) en Supabase.
// ============================================

const SUPABASE_URL      = 'https://bqyocxfrewbtzvyiaoxv.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_mZOQX-2mDyu2n9znrjb0Nw_DFhOUiqf';

// Inicializar cliente Supabase
const { createClient } = supabase;
const _supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ============================================
// OBTENER SESIÓN ACTUAL
// ============================================
const getSession = async () => {
  const { data: { session } } = await _supabase.auth.getSession();
  return session;
};

const getUser = async () => {
  const session = await getSession();
  return session?.user ?? null;
};

// ============================================
// LOGIN CON PROVEEDOR SOCIAL
// ============================================
const loginWith = async (provider) => {
  // Construir URL base correcta (funciona en GitHub Pages /proyecto-web/ y en local)
  const base = window.location.href.replace(/\/[^/]*$/, '/');
  const { error } = await _supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: base + 'cuenta.html'
    }
  });
  if (error) {
    console.error('Error login:', error.message);
    alert('Error al iniciar sesión. Intenta de nuevo.');
  }
};

// ============================================
// CERRAR SESIÓN
// ============================================
const logout = async () => {
  await _supabase.auth.signOut();
  window.location.href = 'index.html';
};

// ============================================
// ESCUCHAR CAMBIOS DE SESIÓN
// ============================================
const onAuthChange = (callback) => {
  _supabase.auth.onAuthStateChange((_event, session) => {
    callback(session?.user ?? null);
  });
};

// ============================================
// ACTUALIZAR UI DEL HEADER SEGÚN SESIÓN
// ============================================
const initAuthHeader = async () => {
  const user = await getUser();
  const accountBtn = document.querySelector('[data-account-btn]');
  if (!accountBtn) return;

  if (user) {
    const name  = user.user_metadata?.full_name || user.email.split('@')[0];
    const photo = user.user_metadata?.avatar_url;

    accountBtn.innerHTML = photo
      ? `<img src="${photo}" alt="${name}" style="width:28px;height:28px;border-radius:50%;object-fit:cover;">`
      : `<i class="far fa-user" aria-hidden="true"></i>`;
    accountBtn.setAttribute('title', name);
    accountBtn.setAttribute('aria-label', `Mi cuenta — ${name}`);
    accountBtn.addEventListener('click', () => { window.location.href = 'cuenta.html'; });
  } else {
    accountBtn.addEventListener('click', () => { window.location.href = 'login.html'; });
  }
};

// ============================================
// VALIDAR URL DE REDIRECCIÓN (evita open redirect)
// ============================================
const safeRedirect = (url) => {
  try {
    const u = new URL(url, window.location.origin);
    if (u.origin === window.location.origin) return u.pathname + u.search;
  } catch (_) {}
  return 'cuenta.html';
};

// ============================================
// PROTEGER PÁGINA (redirige si no hay sesión)
// ============================================
const requireAuth = async () => {
  const user = await getUser();
  if (!user) {
    window.location.href = 'login.html?next=' + encodeURIComponent(window.location.pathname);
  }
  return user;
};
