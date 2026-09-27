/* ============================================================================
 * fasqoo.com – supabase-init.js
 * ----------------------------------------------------------------------------
 * Zentrale Backend-Logik für drei Seiten:
 *   • index.html      → öffentliche Startseite + Speedtest
 *   • dashboard.html  → privates B2B-Dashboard (nur eingeloggte User)
 *   • pricing.html    → B2B-Preisseite + Stripe-Integration
 *
 * Freemium:
 *   • 'free'     → max. 10 gespeicherte Tests sichtbar
 *   • 'business' → unbegrenzte Historie + White-Label
 * ==========================================================================*/

/* ---------------------------------------------------------------------------
 * 1) SUPABASE CLIENT
 * -------------------------------------------------------------------------*/
const supabaseUrl = 'https://IHRE_PROJEKT_ID.supabase.co'; // ← TODO: eigene URL
const supabaseKey = 'sb_publishable_BmeWWZLUXiOXJWbleo9KFg_Jp1fnMoZ';

// UMD-Build heißt üblicherweise `supabase` (window.supabase).
// Wir unterstützen zusätzlich `supabasejs`, falls vorhanden.
const supabaseLib = window.supabasejs || window.supabase;
if (!supabaseLib) {
  console.error('[fasqoo] Supabase-Bibliothek nicht geladen. Prüfen Sie den <script>-Tag.');
}
const supabase = supabaseLib.createClient(supabaseUrl, supabaseKey);

/* ---------------------------------------------------------------------------
 * 2) KONSTANTEN & GLOBALER STATE
 * -------------------------------------------------------------------------*/
const FREE_TIER_TEST_LIMIT = 10;

const ROUTES = {
  INDEX:    '/index.html',
  DASHBOARD:'/dashboard.html',
  PRICING:  '/pricing.html'
};

// Vom Dashboard gesetzt und von loadBusinessDashboardData() gelesen
window.fasqooUserTier             = null;   // 'free' | 'business'
window.fasqooUserId               = null;
window.fasqooCompanyName          = null;
window.fasqooFreeTierLimitReached = false;

// Verhindert doppelte Redirects
let isRedirecting = false;

// Login-/Register-Modus im Modal
let isLoginMode = false;

/* ---------------------------------------------------------------------------
 * 3) HELFER
 * -------------------------------------------------------------------------*/
function currentPageFile() {
  const file = window.location.pathname.split('/').pop().toLowerCase();
  return file || 'index.html';
}

function isDashboardPage() {
  return currentPageFile().startsWith('dashboard');
}

function isPricingPage() {
  return currentPageFile().startsWith('pricing');
}

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
 * 4) AUTH-MODAL (nur index.html)
 * ========================================================================*/
function openAuthModal() {
  const modal = document.getElementById('auth-modal');
  if (!modal) return;
  modal.style.display = 'flex';
}

function closeAuthModal() {
  const modal = document.getElementById('auth-modal');
  if (!modal) return;
  modal.style.display = 'none';
}

function toggleAuthMode(event) {
  if (event) event.preventDefault();

  isLoginMode = !isLoginMode;

  const title         = document.getElementById('modal-title');
  const companyField  = document.getElementById('company-field');
  const submitBtn     = document.getElementById('auth-submit-btn');
  const subText       = document.querySelector('.modal-sub');
  const switchText    = document.getElementById('modal-switch-text');
  const switchLink    = document.querySelector('.modal-switch a');

  if (isLoginMode) {
    if (title)        title.innerText = 'Firmen-Login';
    if (companyField) companyField.style.display = 'none';
    if (submitBtn)    submitBtn.innerText = 'Einloggen';
    if (subText)      subText.innerText = 'Melden Sie sich an, um auf Ihr IT-Dashboard zuzugreifen.';
    if (switchText)   switchText.innerText = 'Noch kein Konto?';
    if (switchLink)   switchLink.innerText = 'Jetzt registrieren';
  } else {
    if (title)        title.innerText = 'Firmen-Registrierung';
    if (companyField) companyField.style.display = 'block';
    if (submitBtn)    submitBtn.innerText = 'Kostenlosen Account erstellen';
    if (subText)      subText.innerText = 'Erstellen Sie ein kostenloses Konto und speichern Sie Ihre Tests in der Cloud.';
    if (switchText)   switchText.innerText = 'Bereits registriert?';
    if (switchLink)   switchLink.innerText = 'Jetzt einloggen';
  }
}

/**
 * Login / Registrierung.
 * WICHTIG: Nach Erfolg KEIN reload() mehr → direkt aufs Dashboard.
 */
async function handleAuthSubmit() {
  const emailEl    = document.getElementById('auth-email');
  const passwordEl = document.getElementById('auth-password');
  const companyEl  = document.getElementById('auth-company');

  const email       = emailEl    ? emailEl.value.trim()   : '';
  const password    = passwordEl ? passwordEl.value       : '';
  const companyName = companyEl  ? companyEl.value.trim() : '';

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
      // Profil anlegen (Standard-Tier = 'free').
      // Existiert das Profil bereits (z. B. via DB-Trigger), Fehler ignorieren.
      const { error: profileError } = await supabase
        .from('profiles')
        .insert([{
          id:           data.user.id,
          company_name: companyName || null,
          account_tier: 'free'
        }]);

      if (profileError && profileError.code !== '23505') {
        console.warn('[fasqoo] Profil konnte nicht angelegt werden:', profileError.message);
      }
    }

    // E-Mail-Bestätigung aktiv? Dann gibt es noch keine Session.
    if (!data?.session) {
      alert('Fast fertig! Bitte bestätigen Sie Ihre E-Mail-Adresse, um das Dashboard freizuschalten.');
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

/** Button-Text je nach Session-Status setzen. */
async function checkUserStatus() {
  const btn = document.getElementById('auth-nav-btn');
  if (!btn) return;

  const session = await getSession();

  if (session) {
    btn.innerText = 'Zum IT-Dashboard';
    btn.dataset.fasqooAction = 'dashboard';
  } else {
    btn.innerText = 'Firmen Login';
    btn.dataset.fasqooAction = 'login';
  }
}

/** Klick auf den Nav-Button. */
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
  // 1) Button-Status initial setzen
  await checkUserStatus();

  // 2) Modal öffnen, falls von pricing.html weitergeleitet
  if (sessionStorage.getItem('fasqoo_open_auth') === '1') {
    sessionStorage.removeItem('fasqoo_open_auth');
    setTimeout(openAuthModal, 200);
  }

  // 3) Modal-Hintergrund-Klick
  const modal = document.getElementById('auth-modal');
  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeAuthModal();
    });
  }

  // 4) Auf Login-Status reagieren (z. B. in anderem Tab)
  supabase.auth.onAuthStateChange((event, session) => {
    if (!isIndexPage()) return;
    const navBtn = document.getElementById('auth-nav-btn');
    if (!navBtn) return;

    if (session) {
      navBtn.innerText = 'Zum IT-Dashboard';
      navBtn.dataset.fasqooAction = 'dashboard';
    } else {
      navBtn.innerText = 'Firmen Login';
      navBtn.dataset.fasqooAction = 'login';
    }
  });
}

/**
 * Speichert ein Messergebnis von der Startseite in die Cloud –
 * aber nur, wenn eine aktive Session existiert.
 *
 * @returns {Promise<boolean>} true, wenn erfolgreich in Cloud gespeichert.
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
    console.warn('[fasqoo] Test konnte nicht in Cloud gespeichert werden:', error.message);
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

/** Profil laden → account_tier und company_name ermitteln. */
async function loadUserProfile(userId) {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, company_name, account_tier')
    .eq('id', userId)
    .maybeSingle();

  if (error) {
    console.warn('[fasqoo] Profil konnte nicht geladen werden:', error.message);
    return null;
  }
  return data;
}

/** Tier in UI schreiben (Badge, Upgrade-Button). */
function applyTierToUi(tier) {
  const badge = document.getElementById('account-tier-badge');
  if (badge) {
    badge.innerText = tier === 'business' ? 'Business' : 'Free';
    badge.dataset.tier = tier;
  }

  const upgradeBtn = document.getElementById('upgrade-btn');
  if (upgradeBtn) {
    upgradeBtn.style.display = tier === 'business' ? 'none' : 'inline-flex';
  }
}

/**
 * Lädt die Test-Historie.
 *  - free     → .limit(10) + Banner
 *  - business → unbegrenzt
 *
 * Wichtig: Auf der Dashboard-Seite ruft diese Funktion am Ende
 * `window.renderDashboardData(tests)` auf, sofern definiert.
 */
async function loadBusinessDashboardData(userId) {
  const tier = window.fasqooUserTier || 'free';

  let query = supabase
    .from('saved_speedtests')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (tier !== 'business') {
    query = query.limit(FREE_TIER_TEST_LIMIT);
  }

  const { data, error } = await query;

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
    // Fallback-Rendering (falls die Dashboard-UI-Logik noch nicht geladen ist)
    renderFallbackTable(tests);
  }

  // Paywall-Banner aktualisieren
  updateFreeTierBanner(tier, tests.length);

  return tests;
}

/** Fallback-Tabelle, falls die Dashboard-Seite kein eigenes Rendering liefert. */
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

/** Banner/Warnung im Free-Tarif. */
function updateFreeTierBanner(tier, loadedCount) {
  const banner = document.getElementById('free-tier-banner');
  if (!banner) return;

  if (tier === 'business') {
    window.fasqooFreeTierLimitReached = false;
    banner.style.display = 'none';
    return;
  }

  window.fasqooFreeTierLimitReached = loadedCount >= FREE_TIER_TEST_LIMIT;

  banner.style.display = 'flex';

  const textEl = banner.querySelector('[data-fasqoo-banner-text]');
  if (textEl) {
    if (window.fasqooFreeTierLimitReached) {
      textEl.innerText = `Sie sehen nur die letzten ${FREE_TIER_TEST_LIMIT} Tests. ` +
                         `Schalten Sie unbegrenzten Cloud-Speicher und automatisierte IT-Reports frei!`;
    } else {
      textEl.innerText = `Free-Tarif: ${loadedCount} von ${FREE_TIER_TEST_LIMIT} Tests sichtbar. ` +
                         `Upgraden Sie für die unbegrenzte Historie.`;
    }
  }
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
  /* 1) Zugriffsschutz: Ohne Session sofort zurück zur Startseite */
  const session = await requireSessionOrRedirect();
  if (!session) return;

  window.fasqooUserId = session.user.id;

  /* 2) Logout-Button verdrahten (falls nicht schon inline) */
  const logoutBtn = document.getElementById('logout-btn')
                 || document.getElementById('signout-btn');
  if (logoutBtn && !logoutBtn.hasAttribute('onclick')) {
    logoutBtn.addEventListener('click', handleLogout);
  }

  /* 3) Upgrade-Button verdrahten */
  const upgradeBtn = document.getElementById('upgrade-btn');
  if (upgradeBtn && !upgradeBtn.hasAttribute('onclick')) {
    upgradeBtn.addEventListener('click', (e) => {
      e.preventDefault();
      initiateStripeUpgrade();
    });
  }

  /* 4) Profil / Tier ermitteln */
  const profile = await loadUserProfile(session.user.id);
  window.fasqooUserTier    = profile?.account_tier || 'free';
  window.fasqooCompanyName = profile?.company_name || null;

  // Begrüßung personalisieren
  const welcome = document.getElementById('welcome-line');
  if (welcome && window.fasqooCompanyName) {
    welcome.innerText = `Willkommen zurück, ${window.fasqooCompanyName}. Hier ist die Übersicht Ihrer Netzwerk-Performance.`;
  }

  applyTierToUi(window.fasqooUserTier);

  /* 5) Daten laden (mit Tier-Limit) */
  await loadBusinessDashboardData(session.user.id);

  /* 6) Auf Session-Ende reagieren (Logout in anderem Tab) */
  supabase.auth.onAuthStateChange((event, newSession) => {
    if (!isDashboardPage()) return;
    if (event === 'SIGNED_OUT' || !newSession) {
      safeRedirect(ROUTES.INDEX);
    }
  });
}

/* ===========================================================================
 * 7) STRIPE-UPGRADE
 * ========================================================================*/

/**
 * Leitet zum Stripe-Checkout / zur Pricing-Seite weiter und übergibt
 * die Supabase-User-ID als 'clientReferenceId'.
 *
 * Der eigentliche Checkout muss serverseitig (Supabase Edge Function)
 * erstellt werden, damit Stripe nach erfolgreicher Zahlung über einen
 * Webhook das Profil auf account_tier = 'business' setzen kann.
 */
async function initiateStripeUpgrade(event) {
  if (event && typeof event.preventDefault === 'function') event.preventDefault();

  const session = await getSession();
  if (!session) {
    // Nicht eingeloggt → zur Startseite mit Auth-Modal
    sessionStorage.setItem('fasqoo_open_auth', '1');
    safeRedirect(ROUTES.INDEX);
    return;
  }

  const userId = session.user.id;
  const email  = session.user.email || '';

  // Client-Reference-ID sichern (für Rücksprung nach Checkout)
  try {
    sessionStorage.setItem('fasqoo_stripe_client_reference_id', userId);
  } catch (e) { /* Storage evtl. blockiert */ }

  // Konfigurierbare Ziel-URL (in HTML über data-Attribut oder global)
  const pricingUrl =
    window.FASQOO_STRIPE_PRICING_URL ||
    document.getElementById('upgrade-btn')?.dataset?.stripeUrl ||
    document.getElementById('stripe-upgrade-btn')?.dataset?.stripeUrl ||
    ROUTES.PRICING;

  const url = new URL(pricingUrl, window.location.origin);
  url.searchParams.set('client_reference_id', userId);
  if (email) url.searchParams.set('prefilled_email', email);

  window.location.href = url.toString();
}

/* ===========================================================================
 * 8) PRICING (pricing.html)
 * ========================================================================*/

async function initPricingPage() {
  // Pricing-Seite braucht keine aktive Session; nur Preis-Karten & Stripe.
  // Session-Info wird bereits im <script> der Seite in die Stripe-Table injiziert.
}

/* ===========================================================================
 * 9) BOOTSTRAP – erkennt automatisch, auf welcher Seite wir sind
 * ========================================================================*/
async function initFasqooApp() {
  if (isDashboardPage()) {
    await initDashboardPage();
  } else if (isPricingPage()) {
    await initPricingPage();
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
 * 10) GLOBALE EXPORTS
 *     → damit inline-Handler im HTML (onclick="...") funktionieren.
 * -------------------------------------------------------------------------*/
window.openAuthModal             = openAuthModal;
window.closeAuthModal            = closeAuthModal;
window.toggleAuthMode            = toggleAuthMode;
window.handleAuthSubmit          = handleAuthSubmit;
window.handleAuthNavClick        = handleAuthNavClick;
window.checkUserStatus           = checkUserStatus;
window.saveFasqooTestToCloud     = saveFasqooTestToCloud;
window.loadBusinessDashboardData = loadBusinessDashboardData;
window.initiateStripeUpgrade     = initiateStripeUpgrade;
window.handleLogout              = handleLogout;
