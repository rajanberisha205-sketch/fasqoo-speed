// =========================================================================
// FASQOO NETWORK INTELLIGENCE - DB INITIALIZATION & B2B AUTHENTICATION
// =========================================================================

// 1. SETZEN SIE HIER IHRE PROJEKT-URL EIN (aus dem Supabase-Dashboard)
const supabaseUrl = 'https://IHRE_PROJEKT_ID.supabase.co'; 

// 2. IHR LIVE-PUBLISHABLE-KEY (Sicher geschützt durch Row Level Security)
const supabaseKey = 'sb_publishable_BmeWWZLUXiOXJWbleo9KFg_Jp1fnMoZ';

// 3. Verbindung zum sicheren Cloud-Backend herstellen
const supabase = supabasejs.createClient(supabaseUrl, supabaseKey);

// =========================================================================
// MODAL UI CONTROL (Öffnen, Schließen & Modus wechseln)
// =========================================================================
let isLoginMode = false; // Standardmäßig im Registrierungs-Modus

function openAuthModal() { 
  document.getElementById('auth-modal').style.display = 'flex'; 
}

function closeAuthModal() { 
  document.getElementById('auth-modal').style.display = 'none'; 
}

function toggleAuthMode(event) {
  event.preventDefault();
  isLoginMode = !isLoginMode;
  
  const title = document.getElementById('modal-title');
  const companyInput = document.getElementById('auth-company');
  const submitBtn = document.getElementById('auth-submit-btn');
  const toggleText = document.getElementById('auth-toggle-text');
  const toggleLink = document.getElementById('auth-toggle-link');

  if (isLoginMode) {
    title.innerText = "Firmen-Login";
    companyInput.style.display = "none";
    submitBtn.innerText = "Einloggen";
    toggleText.innerText = "Neu bei Fasqoo?";
    toggleLink.innerText = "Account erstellen";
  } else {
    title.innerText = "Firmen-Registrierung";
    companyInput.style.display = "block";
    submitBtn.innerText = "Kostenlosen Account erstellen";
    toggleText.innerText = "Bereits registriert?";
    toggleLink.innerText = "Hier anmelden";
  }
}

// =========================================================================
// B2B AUTHENTICATION LOGIC (Senden an die Cloud-Datenbank)
// =========================================================================
async function handleAuthSubmit() {
  const email = document.getElementById('auth-email').value;
  const password = document.getElementById('auth-password').value;
  const companyName = document.getElementById('auth-company').value;

  if (!email || !password) {
    return alert("Bitte füllen Sie E-Mail und Passwort aus.");
  }

  if (isLoginMode) {
    // ---- FIRMEN LOGIN ----
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return alert("Fehler beim Login: " + error.message);
    alert("Erfolgreich eingeloggt!");
    window.location.reload();
  } else {
    // ---- FIRMEN REGISTRIERUNG ----
    if (!companyName) return alert("Bitte geben Sie Ihren Firmennamen an.");
    
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) return alert("Fehler bei Registrierung: " + error.message);

    // Firmennamen im Profil der PostgreSQL-Datenbank hinterlegen
    if (data.user) {
      await supabase.from('profiles').insert([{ id: data.user.id, company_name: companyName }]);
      alert("Registrierung erfolgreich! Ihr kostenloser IT-Account ist aktiv.");
      window.location.reload();
    }
  }
}

// =========================================================================
// AUTOMATISCHER STATUS-CHECK BEIM LADEN DER SEITE
// =========================================================================
async function checkUserStatus() {
  const { data: { session } } = await supabase.auth.getSession();
  const navBtn = document.getElementById('auth-nav-btn');

  if (session) {
    // Wenn eingeloggt, ändern wir das Menü zu "Abmelden"
    if (navBtn) {
      navBtn.innerText = "Abmelden (" + session.user.email + ")";
      navBtn.style.background = "#222";
      navBtn.style.border = "1px solid #444";
      navBtn.onclick = async function() {
        await supabase.auth.signOut();
        window.location.reload();
      };
    }
    // Dashboard-Historie laden (wird im nächsten Schritt mit der Tabelle verknüpft)
    loadBusinessDashboardData(session.user.id);
  }
}

// =========================================================================
// AUTOMATISCHES SPEICHERN DER IT-MESSERGEBNISSE
// =========================================================================
async function saveFasqooTestToCloud(download, upload, ping, jitter, packetLoss, isp) {
  const { data: { session } } = await supabase.auth.getSession();

  if (session) {
    const { error } = await supabase.from('saved_speedtests').insert([
      {
        user_id: session.user.id,
        download_speed: parseFloat(download),
        upload_speed: parseFloat(upload),
        ping: parseFloat(ping),
        jitter: parseFloat(jitter),
        packet_loss: parseFloat(packetLoss) || 0,
        isp: isp || 'Unknown'
      }
    ]);

    if (error) {
      console.error("Fehler beim Cloud-Backup des Tests:", error);
    } else {
      console.log("Messergebnisse erfolgreich in Fasqoo-Cloud gespeichert.");
      // Aktualisiere das Dashboard, damit der neue Test sofort sichtbar ist
      loadBusinessDashboardData(session.user.id);
    }
  }
}

// Platzhalter-Funktion, die die echten Daten zieht (wird in der UI-Tabelle genutzt)
async function loadBusinessDashboardData(userId) {
  const { data: tests, error } = await supabase
    .from('saved_speedtests')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (tests && typeof updateUiWithCloudData === 'function') {
    updateUiWithCloudData(tests);
  }
}

// Führt den Status-Check aus, sobald der Browser bereit ist
document.addEventListener('DOMContentLoaded', checkUserStatus);
