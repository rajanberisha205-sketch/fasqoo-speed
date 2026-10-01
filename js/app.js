/* ============================================================
   EMAIL REPORT CTA — Show after test + submit handler
   ============================================================ */
const emailCta = document.getElementById("emailReportCta");
const emailForm = document.getElementById("emailReportForm");
const emailNote = document.getElementById("emailReportNote");

function showEmailCta(){
  if(!emailCta) return;
  emailCta.hidden = false;
  setTimeout(() => {
    if(emailCta.getBoundingClientRect().top > window.innerHeight){
      emailCta.scrollIntoView({behavior:"smooth", block:"center"});
    }
  }, 400);
}

// Beim neuen Test wieder verstecken
document.getElementById("start")?.addEventListener("click", () => {
  if(emailCta) emailCta.hidden = true;
});

// Status-Mutation observer → CTA nach Abschluss zeigen
const emailStatusObserver = new MutationObserver(() => {
  const s = document.getElementById("status")?.textContent || "";
  const t = translations[currentLang] || translations.en;
  if(s === t.complete && last && last.id){
    showEmailCta();
  }
});
const statusEl = document.getElementById("status");
if(statusEl) emailStatusObserver.observe(statusEl, {childList:true, subtree:true, characterData:true});

// Submit
emailForm?.addEventListener("submit", async (e) => {
  e.preventDefault();
  const input = emailForm.querySelector('input[name="email"]');
  const email = (input?.value || "").trim();
  const t = translations[currentLang] || translations.en;

  if(!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)){
    emailNote.textContent = "Bitte gültige E-Mail-Adresse eingeben.";
    emailNote.className = "email-report-note err";
    input?.focus();
    return;
  }
  if(!last || !last.id){
    emailNote.textContent = t.alertRun || "Bitte zuerst einen Test ausführen.";
    emailNote.className = "email-report-note err";
    return;
  }

  const btn = emailForm.querySelector(".email-report-btn");
  const oldText = btn.textContent;
  btn.disabled = true;
  btn.textContent = "Wird gesendet…";
  emailNote.textContent = "";
  emailNote.className = "email-report-note";

  try{
    // 👉 HIER deinen echten Endpoint eintragen
    const res = await fetch("/api/subscribe", {
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body: JSON.stringify({
        email,
        testId: last.id,
        result: {
          download: last.download,
          upload: last.upload,
          ping: last.ping,
          jitter: last.jitter,
          packetLoss: last.packetLoss,
          bufferbloat: last.bufferbloat,
          quality: last.quality
        },
        isp: last.isp,
        location: last.location,
        lang: currentLang,
        ts: new Date().toISOString()
      })
    });

    if(!res.ok) throw new Error("HTTP " + res.status);
    emailNote.textContent = "✓ Bericht ist unterwegs – bitte prüfe dein Postfach.";
    emailNote.className = "email-report-note ok";
    emailForm.reset();
  }catch(err){
    console.warn("Email CTA failed:", err);
    emailNote.textContent = "Senden fehlgeschlagen. Bitte später erneut versuchen.";
    emailNote.className = "email-report-note err";
  }finally{
    btn.disabled = false;
    btn.textContent = oldText;
  }
});
