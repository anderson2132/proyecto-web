// ============================================
// WASI TECH — Firebase Auth
// Reemplaza los valores de firebaseConfig con
// los de tu proyecto en console.firebase.google.com
// ============================================

const firebaseConfig = {
  apiKey:            "TU_API_KEY",
  authDomain:        "TU_PROYECTO.firebaseapp.com",
  projectId:         "TU_PROYECTO",
  storageBucket:     "TU_PROYECTO.appspot.com",
  messagingSenderId: "TU_SENDER_ID",
  appId:             "TU_APP_ID"
};

// Inicializar Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();

// ============================================
// OBTENER USUARIO ACTUAL
// ============================================
const getUser = () => auth.currentUser;

const waitForUser = () =>
  new Promise((resolve) => {
    const unsub = auth.onAuthStateChanged((user) => {
      unsub();
      resolve(user);
    });
  });

// ============================================
// LOGIN CON PROVEEDOR SOCIAL
// ============================================
const PROVIDERS = {
  google:    new firebase.auth.GoogleAuthProvider(),
  facebook:  new firebase.auth.FacebookAuthProvider(),
  microsoft: new firebase.auth.OAuthProvider('microsoft.com')
};

// Agregar scope de email a Microsoft
PROVIDERS.microsoft.addScope('email');
PROVIDERS.microsoft.addScope('profile');

const loginWith = async (providerName) => {
  const provider = PROVIDERS[providerName];
  if (!provider) return;
  try {
    await auth.signInWithPopup(provider);
    // Redirigir a cuenta.html tras login exitoso
    const params = new URLSearchParams(window.location.search);
    window.location.href = params.get('next') || 'cuenta.html';
  } catch (err) {
    console.error('Error login:', err.message);
    if (err.code === 'auth/popup-closed-by-user') return;
    if (err.code === 'auth/account-exists-with-different-credential') {
      alert('Ya tienes una cuenta con otro método de inicio de sesión. Usa el mismo que registraste antes.');
    } else {
      alert('Error al iniciar sesión. Intenta de nuevo.');
    }
  }
};

// ============================================
// CERRAR SESIÓN
// ============================================
const logout = async () => {
  await auth.signOut();
  window.location.href = 'index.html';
};

// ============================================
// ESCUCHAR CAMBIOS DE SESIÓN
// ============================================
const onAuthChange = (callback) => {
  auth.onAuthStateChanged(callback);
};

// ============================================
// ACTUALIZAR UI DEL HEADER SEGÚN SESIÓN
// ============================================
const initAuthHeader = () => {
  auth.onAuthStateChanged((user) => {
    const accountBtn = document.querySelector('[data-account-btn]');
    if (!accountBtn) return;

    if (user) {
      const name  = user.displayName || user.email.split('@')[0];
      const photo = user.photoURL;

      accountBtn.innerHTML = photo
        ? `<img src="${photo}" alt="${name}" style="width:28px;height:28px;border-radius:50%;object-fit:cover;">`
        : `<i class="far fa-user" aria-hidden="true"></i>`;
      accountBtn.setAttribute('title', name);
      accountBtn.setAttribute('aria-label', `Mi cuenta — ${name}`);
      accountBtn.onclick = () => { window.location.href = 'cuenta.html'; };
    } else {
      accountBtn.innerHTML = `<i class="far fa-user" aria-hidden="true"></i>`;
      accountBtn.onclick = () => { window.location.href = 'login.html'; };
    }
  });
};

// ============================================
// PROTEGER PÁGINA (redirige si no hay sesión)
// ============================================
const requireAuth = async () => {
  const user = await waitForUser();
  if (!user) {
    window.location.href = 'login.html?next=' + encodeURIComponent(window.location.pathname);
    return null;
  }
  return user;
};
