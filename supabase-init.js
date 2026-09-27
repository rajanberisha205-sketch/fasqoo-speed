/* ============================================================================
 * fasqoo.com – supabase-init.js
 * ----------------------------------------------------------------------------
 * Vereinfachte Version: NUR Login, Registrierung und Dashboard-Daten.
 * Kein Stripe, keine Tiers, keine Paywall.
 *
 * Enthält:
 *   • Supabase-Client
 *   • Auth-Modal (Login/Registrierung)
 *   • Navigation (Button-Status je nach Session)
 *   • Speedtest-Cloud-Speicherung
 *   • Dashboard-Zugriffsschutz + Test-Historie
 * ==========================================================================*/

/* ---------------------------------------------------------------------------
 * 1) SUPABASE CLIENT
 * -------------------------------------------------------------------------*/
const supabaseUrl = 'https://IHRE_PROJEKT_ID.supabase.co'; // ← TODO: eigene URL
const supabaseKey = 'sb_publishable_BmeWWZLUXiOXJWbleo9KFg_Jp1fnMoZ';

const supabaseLib = window.supabasejs || window.supabase;
if (!supabaseLib) {
  console.error('[fasqoo] Supabase-Bibliothek nicht geladen. Prüfen Sie den <script>-Tag.');
}
const supabase = supabaseLib.createClient(supabaseUrl, supabaseKey);

/* ---------------------------------------------------------------------------
 * 2) KONSTANTEN & STATE
 * -------------------------------------------------------------------------*/
const ROUTES = {
  INDEX:     '/index.html',
  DASHBOARD: '/dashboard.html'
};

let isRedirecting = false;
let isLoginMode   = false;

/* ---------------------------------------------------------------------------
 * 3) HELFER
 * -------------------------------------------------------------------------*/
function currentPageFile() {
  const file = window.location.pathname.split('/').pop().toLowerCase();
  return file || 'index.html';
}
function isDashboardPage() { return currentPageFile().startsWith('dashboard'); }
function isIndexPage() {
  const file = currentPageFile();
  return file === '' || file.startsWith('index');
}
function safeRedirect(url) {
  if (isRedirecting) return;
  isRedirecting = true;
  window.location.href = url;
}
async function getSession() {
  const { data, error } = await supabase.auth.getSession();
  if (error) {
    console.warn('[fasqoo] getSession Fehler:', error.message);
    return null;
  }
  return data?.session ?? null;
}
function escapeHtml(value) {
  if (value === null || value === undefined) return '';
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/* ===========================================================================
 * 4) AUTH-MODAL
 * ========================================================================*/
function openAuthModal() {
  const modal = document.getElementById('auth-modal');
  if (modal) modal.style.display = 'flex';
}
function closeAuthModal() {
  const modal = document.getElementById('auth-modal');
  if (modal) modal.style.display = 'none';
}

function toggleAuthMode(event) {
  if (event) event.preventDefault();
  isLoginMode = !isLoginMode;

  const title        = document.getElementById('modal-title');
  const companyField = document.getElementById('company-field');
  const submitBtn    = document.getElementById('auth-submit-btn');
  const subText      = document.querySelector('.modal-sub');
  const switchText   = document.getElementById('modal-switch-text');
  const switchLink   = document.querySelector('.modal-switch a');

  if (isLoginMode) {
    if (title)        title.innerText = 'Login';
    if (companyField) companyField.style.display = 'none';
    if (submitBtn)    submitBtn.innerText = 'Einloggen';
    if (subText)      subText.innerText = 'Melden Sie sich an, um auf Ihr Dashboard zuzugreifen.';
    if (switchText)   switchText.innerText = 'Noch kein Konto?';
    if (switchLink)   switchLink.innerText = 'Jetzt registrieren';
  } else {
    if (title)        title.innerText = 'Registrierung';
    if (companyField) companyField.style.display = 'block';
    if (submitBtn)    submitBtn.innerText = 'Konto erstellen';
    if (subText)      subText.innerText = 'Erstellen Sie ein Konto und speichern Sie Ihre Tests in der Cloud.';
    if (switchText)   switchText.innerText = 'Bereits registriert?';
    if (switchLink)   switchLink.innerText = 'Jetzt einloggen';
  }
}

/**
 * Login / Registrierung.
 * Nach Erfolg → direkt aufs Dashboard (kein reload).
 */
async function handleAuthSubmit() {
  const emailEl    = document.getElementById('auth-email');
  const passwordEl = document.getElementById('auth-password');
  const companyEl  = document.getElementById('auth-company');

  const email       = emailEl    ? emailEl.value.trim() : '';
  const password    = passwordEl ? passwordEl.value     : '';
  const companyName = companyEl  ? companyEl.value.trim(): '';

  if (!email || !password) {
    alert('Bitte E-Mail und Passwort eingeben.');
    return;
  }

  const submitBtn = document.getElementById('auth-submit-btn');
  if (submitBtn) { submitBtn.disabled = true; submitBtn.style.opacity = '.7'; }

  try {
    /* ---------------------------- LOGIN ---------------------------- */
    if (isLoginMode) {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) { alert(error.message); return; }
      if (!data?.session) {
        alert('Login fehlgeschlagen. Bitte bestätigen Sie zunächst Ihre E-Mail-Adresse.');
        return;
      }
      closeAuthModal();
      safeRedirect(ROUTES.DASHBOARD);
      return;
    }

    /* ------------------------- REGISTRIERUNG ------------------------ */
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) { alert(error.message); return; }

    if (data?.user) {
      // Profil in 'profiles' anlegen (Firmenname optional)
      const { error: profileError } = await supabase
        .from('profiles')
        .insert([{
          id:           data.user.id,
          company_name: companyName || null
        }]);

      // Fehler ignorieren, wenn Profil schon existiert (DB-Trigger)
      if (profileError && profileError.code !== '23505') {
        console.warn('[fasqoo] Profil konnte nicht angelegt werden:', profileError.message);
      }
    }

    // E-Mail-Bestätigung aktiv? Dann gibt es noch keine Session.
    if (!data?.session) {
      alert('Fast fertig! Bitte bestätigen Sie Ihre E-Mail-Adresse, um sich einzuloggen.');
      closeAuthModal();
      return;
    }

    closeAuthModal();
    safeRedirect(ROUTES.DASHBOARD);

  } finally {
    if (submitBtn) { submitBtn.disabled = false; submitBtn.style.opacity = '1'; }
  }
}

/* ===========================================================================
 * 5) STARTSEITE (index.html)
 * ========================================================================*/

async function checkUserStatus() {
  const btn = document.getElementById('auth-nav-btn');
  if (!btn) return;

  const session = await getSession();

  if (session) {
    btn.innerText = 'Zum Dashboard';
    btn.dataset.fasqooAction = 'dashboard';
  } else {
    btn.innerText = 'Login';
    btn.dataset.fasqooAction = 'login';
  }
}

async function handleAuthNavClick(event) {
  if (event && typeof event.preventDefault === 'function') event.preventDefault();

  const session = await getSession();
  if (session) {
    safeRedirect(ROUTES.DASHBOARD);
    return;
  }
  openAuthModal();
}

async function initIndexPage() {
  await checkUserStatus();

  // Modal öffnen, falls von einer anderen Seite weitergeleitet
  if (sessionStorage.getItem('fasqoo_open_auth') === '1') {
    sessionStorage.removeItem('fasqoo_open_auth');
    setTimeout(openAuthModal, 200);
  }

  // Hintergrund-Klick schließt Modal
  const modal = document.getElementById('auth-modal');
  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeAuthModal();
    });
  }

  // Auf Login-Status reagieren
  supabase.auth.onAuthStateChange((event, session) => {
    if (!isIndexPage()) return;
    const navBtn = document.getElementById('auth-nav-btn');
    if (!navBtn) return;

    if (session) {
      navBtn.innerText = 'Zum Dashboard';
      navBtn.dataset.fasqooAction = 'dashboard';
    } else {
      navBtn.innerText = 'Login';
      navBtn.dataset.fasqooAction = 'login';
    }
  });
}

/**
 * Speichert ein Messergebnis in die Cloud – nur wenn eingeloggt.
 */
async function saveFasqooTestToCloud(download, upload, ping, jitter, packetLoss, isp) {
  const session = await getSession();
  if (!session) return false;

  const { error } = await supabase.from('saved_speedtests').insert([{
    user_id:        session.user.id,
    download_speed: parseFloat(download),
    upload_speed:   parseFloat(upload),
    ping:           parseFloat(ping),
    jitter:         parseFloat(jitter),
    packet_loss:    parseFloat(packetLoss),
    isp:            isp || null
  }]);

  if (error) {
    console.warn('[fasqoo] Test konnte nicht gespeichert werden:', error.message);
    return false;
  }
  return true;
}

/* ===========================================================================
 * 6) DASHBOARD (dashboard.html)
 * ========================================================================*/

/** Türsteher: Ohne Session sofort zurück zur Startseite. */
async function requireSessionOrRedirect() {
  const session = await getSession();
  if (!session) {
    safeRedirect(ROUTES.INDEX);
    return null;
  }
  return session;
}

/** Lädt die Test-Historie des Users (unbegrenzt). */
async function loadUserTests(userId) {
  const { data, error } = await supabase
    .from('saved_speedtests')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('[fasqoo] Historie konnte nicht geladen werden:', error.message);
    showDashboardError('Die Test-Historie konnte nicht geladen werden: ' + error.message);
    return [];
  }

  const tests = data || [];

  // An das Dashboard-UI übergeben, falls dort implementiert
  if (typeof window.renderDashboardData === 'function') {
    window.renderDashboardData(tests);
  } else {
    renderFallbackTable(tests);
  }
  return tests;
}

/** Fallback-Tabelle */
function renderFallbackTable(tests) {
  const tbody = document.getElementById('test-history-body');
  if (!tbody) return;

  if (!tests.length) {
    tbody.innerHTML = '<tr><td colspan="7" class="empty-state">Noch keine gespeicherten Tests vorhanden.</td></tr>';
    return;
  }

  tbody.innerHTML = tests.map((t) => {
    const date = t.created_at ? new Date(t.created_at).toLocaleString('de-DE') : '–';
    const fmt = (v, d = 1) => (v == null ? '–' : Number(v).toFixed(d).replace('.', ','));
    return `
      <tr>
        <td class="cell-mono">${escapeHtml(date)}</td>
        <td>${fmt(t.download_speed)} Mbit/s</td>
        <td>${fmt(t.upload_speed)} Mbit/s</td>
        <td>${t.ping ?? '–'} ms</td>
        <td>${fmt(t.jitter)} ms</td>
        <td>${fmt(t.packet_loss, 1)} %</td>
        <td class="cell-mono">${escapeHtml(t.isp || '–')}</td>
      </tr>`;
  }).join('');
}

function showDashboardError(message) {
  const box = document.getElementById('dashboard-error');
  if (!box) return;
  box.innerText = message;
  box.style.display = 'block';
}

/** Abmelden → zurück zur Startseite. */
async function handleLogout(event) {
  if (event && typeof event.preventDefault === 'function') event.preventDefault();

  const { error } = await supabase.auth.signOut();
  if (error) console.warn('[fasqoo] Logout-Fehler:', error.message);

  safeRedirect(ROUTES.INDEX);
}

async function initDashboardPage() {
  /* 1) Zugriffsschutz */
  const session = await requireSessionOrRedirect();
  if (!session) return;

  /* 2) Logout-Button verdrahten */
  const logoutBtn = document.getElementById('logout-btn')
                 || document.getElementById('signout-btn');
  if (logoutBtn && !logoutBtn.hasAttribute('onclick')) {
    logoutBtn.addEventListener('click', handleLogout);
  }

  /* 3) Firmenname laden und Begrüßung personalisieren */
  const { data: profile } = await supabase
    .from('profiles')
    .select('company_name')
    .eq('id', session.user.id)
    .maybeSingle();

  const welcome = document.getElementById('welcome-line');
  if (welcome && profile?.company_name) {
    welcome.innerText = `Willkommen zurück, ${profile.company_name}. Hier ist die Übersicht Ihrer Netzwerk-Performance.`;
  }

  /* 4) Test-Historie laden */
  await loadUserTests(session.user.id);

  /* 5) Auf Session-Ende reagieren */
  supabase.auth.onAuthStateChange((event, newSession) => {
    if (!isDashboardPage()) return;
    if (event === 'SIGNED_OUT' || !newSession) {
      safeRedirect(ROUTES.INDEX);
    }
  });
}

/* ===========================================================================
 * 7) BOOTSTRAP
 * ========================================================================*/
async function initFasqooApp() {
  if (isDashboardPage()) {
    await initDashboardPage();
  } else {
    await initIndexPage();
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initFasqooApp);
} else {
  initFasqooApp();
}

/* ---------------------------------------------------------------------------
 * 8) GLOBALE EXPORTS (für inline-onclick)
 * -------------------------------------------------------------------------*/
window.openAuthModal         = openAuthModal;
window.closeAuthModal        = closeAuthModal;
window.toggleAuthMode        = toggleAuthMode;
window.handleAuthSubmit      = handleAuthSubmit;
window.handleAuthNavClick    = handleAuthNavClick;
window.checkUserStatus       = checkUserStatus;
window.saveFasqooTestToCloud = saveFasqooTestToCloud;
window.handleLogout          = handleLogout;
