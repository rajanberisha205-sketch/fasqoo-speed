// Globale Variablen für den Zustand des Fensters
let isLoginMode = false; // Startet im Registrierungs-Modus

// Fenster öffnen und schließen
function openAuthModal() { document.getElementById('auth-modal').style.display = 'flex'; }
function closeAuthModal() { document.getElementById('auth-modal').style.display = 'none'; }

// Wechselt zwischen Login und Registrierung
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
    companyInput.style.display = "none"; // Firmenname wird beim Login nicht gebraucht
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

// Verarbeitet das Absenden des Formulars (Klick auf den Button)
async function handleAuthSubmit() {
  const email = document.getElementById('auth-email').value;
  const password = document.getElementById('auth-password').value;
  const companyName = document.getElementById('auth-company').value;

  if (!email || !password) return alert("Bitte füllen Sie E-Mail und Passwort aus.");

  if (isLoginMode) {
    // LOGIN AUSFÜHREN
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return alert("Fehler beim Login: " + error.message);
    alert("Erfolgreich eingeloggt!");
    window.location.reload();
  } else {
    // REGISTRIERUNG AUSFÜHREN
    if (!companyName) return alert("Bitte geben Sie Ihren Firmennamen an.");
    
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) return alert("Fehler bei Registrierung: " + error.message);

    // Firmennamen im Profil speichern
    if (data.user) {
      await supabase.from('profiles').insert([{ id: data.user.id, company_name: companyName }]);
      alert("Registrierung erfolgreich! Bestätigen Sie Ihre E-Mail, falls Sie eine Nachricht erhalten.");
      window.location.reload();
    }
  }
}

// Prüft beim Laden der Website, ob der User bereits eingeloggt ist
async function checkUserStatus() {
  const { data: { session } } = await supabase.auth.getSession();
  const navBtn = document.getElementById('auth-nav-btn');

  if (session) {
    // User ist eingeloggt -> Ändere Button zu "Abmelden"
    navBtn.innerText = "Abmelden";
    navBtn.style.background = "#333";
    navBtn.onclick = async function() {
      await supabase.auth.signOut();
      window.location.reload();
    };
    
    // HIER KÖNNEN SIE NUN DIE CLOUD-HISTORIE LADEN!
    console.log("Eingeloggter User:", session.user.email);
  }
}

// Führt den Status-Check aus, sobald die Seite geladen ist
document.addEventListener('DOMContentLoaded', checkUserStatus);
