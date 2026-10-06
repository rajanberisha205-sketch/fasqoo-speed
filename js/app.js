/* ==========================================================
   FASQOO SPEED TEST v8.1
   - 6 metrics incl. Bufferbloat + Packet Loss
   - Sample-synced pulse
   - Colored interim states (blue → green/yellow/red)
   - Live gradient chart with glow + scale
   - Overall Grade A+ to F with glow
   - 8 application profile tiles with SVG icons + reveal
   - Full i18n coverage (10 languages, 100%)
   ========================================================== */

/* ---------- PROFESSIONAL DESKTOP INSTALL ---------- */
let deferredInstallPrompt = null;
const installButton = document.getElementById("installButton");
const installLabel = document.getElementById("installLabel");
const installIcon = document.getElementById("installIcon");

function isMobileDevice(){
  return /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent) ||
         (navigator.maxTouchPoints > 1 && Math.min(screen.width, screen.height) < 900);
}
function isDesktopDevice(){
  return !isMobileDevice();
}
function isStandalone(){
  return window.matchMedia("(display-mode: standalone)").matches ||
         window.navigator.standalone === true ||
         document.referrer.startsWith("android-app://");
}
function getDesktopPlatform(){
  const ua = navigator.userAgent || "";
  if(/Windows/i.test(ua)) return "windows";
  if(/Macintosh|Mac OS X/i.test(ua)) return "mac";
  if(/CrOS/i.test(ua)) return "chromeos";
  if(/Linux/i.test(ua)) return "linux";
  return "desktop";
}
function updateInstallButton(){
  if(!installButton) return;
  const visible = isDesktopDevice() && !isStandalone();
  installButton.hidden = !visible;
  if(!visible) return;

  const platform = getDesktopPlatform();
  const labels = {
    windows:"Install for Windows",
    mac:"Install for Mac",
    linux:"Install for Linux",
    chromeos:"Install for ChromeOS",
    desktop:"Install App"
  };
  const icons = {
    windows:"⊞",
    mac:"⌘",
    linux:"◉",
    chromeos:"▣",
    desktop:"↓"
  };
  const label = labels[platform] || labels.desktop;
  if(installLabel) installLabel.textContent = label;
  if(installIcon) installIcon.textContent = icons[platform] || icons.desktop;
  installButton.setAttribute("aria-label", label);
}
window.addEventListener("beforeinstallprompt", e => {
  e.preventDefault();
  deferredInstallPrompt = e;
  updateInstallButton();
});
installButton?.addEventListener("click", async () => {
  if(deferredInstallPrompt){
    try{
      deferredInstallPrompt.prompt();
      await deferredInstallPrompt.userChoice;
    }catch(e){}
    deferredInstallPrompt = null;
    updateInstallButton();
    return;
  }

  const platform = getDesktopPlatform();
  const t = installTranslations[currentLang] || installTranslations.en;
  const fallback = t.browserHint || installTranslations.en.browserHint;
  alert(fallback.replace("{platform}", platform === "windows" ? "Windows" : platform === "mac" ? "macOS" : platform === "linux" ? "Linux" : platform === "chromeos" ? "ChromeOS" : "your desktop"));
});
window.addEventListener("appinstalled", () => {
  deferredInstallPrompt = null;
  updateInstallButton();
});
window.matchMedia("(display-mode: standalone)").addEventListener?.("change", updateInstallButton);
window.addEventListener("resize", updateInstallButton);
updateInstallButton();

const $ = id => document.getElementById(id);
const sleep = ms => new Promise(r => setTimeout(r, ms));

/* ---------- TRANSLATIONS ---------- */
const translations = {
en:{navFaq:"FAQ",navAntivirus:"Antivirus Scanner",navAntivirusDesc:"Scan files and content for security risks",download:"Download",navStatus:"Network Status",navDiag:"IT Diagnostics",navAbout:"About Us",liteBtn:"Fasqoo Lite",widgetBtn:"Speed Widget",navWidget:"Widget",title:"Free Internet Speed Test",sub:"See what your connection really delivers — in seconds. Includes suitability for streaming, gaming and home office.",serverLabel:"Server",ready:"Ready to test",start:"Start Speed Test",startAgain:"Test Again",testing:"Testing…",complete:"Test completed",ping:"Ping",jitter:"Jitter",upload:"Upload",chartLive:"Live Performance",chartWait:"Waiting",lblIp:"Public IP",lblIsp:"Provider / ISP",lblLoc:"Location",lblAsn:"Network / ASN",qTitle:"Connection Quality",qDefault:"Run a test to evaluate your connection.",qualityBasis:"Based on download, upload, ping & jitter",appsTitle:"What can you do with your connection?",appsSub:"Live check for gaming, 4K streaming, home office and social media.",diagTitle:"Network Diagnostics",diagLatT:"Latency",diagLatD:"Measures response time.",diagStabT:"Stability",diagStabD:"Jitter shows connection stability.",diagDnsT:"DNS Diagnostics",diagDnsD:"Checks DNS resolvers.",diagIpT:"IP Diagnostics",diagIpD:"Detects IP, ISP, ASN.",repTitle:"Professional Test Report",lblRepTestId:"Test ID",copy:"Copy Result",share:"Share Result",json:"Export JSON",print:"Print Report",histTitle:"Test History",histRecent:"Recent measurements",histClear:"Clear history",thDate:"Date",thProvider:"Provider",thDown:"Download",thUp:"Upload",thPing:"Ping",thQual:"Quality",noHistory:"No tests recorded yet.",ftRights:"© 2026 Fasqoo. All Rights Reserved.",ftAccess:"Accessibility",ftImprint:"Imprint",ftPrivacy:"Privacy Policy",ftTerms:"Terms of Use",ftNoSell:"Do Not Sell My Info",footerAntivirus:"Antivirus Scanner",ftPowered:"Powered by the Cloudflare Edge network to ensure maximum performance and measurement accuracy.",ftDisclaimer:"Fasqoo is an independent speed-test platform and is not an official Cloudflare product.",stPing:"Measuring latency…",stDown:"Measuring download…",stUp:"Measuring upload…",stErr:"Test failed.",measurementUnavailable:"Measurement unavailable. Please try again.",stExc:"Excellent",stGood:"Good",stLim:"Limited",q90:"Excellent connection.",q75:"Very good connection.",q55:"Good connection.",q35:"Average connection.",q0:"Poor connection.",alertRun:"Please run a speed test first.",unavail:"Unavailable",notDetected:"Not detected",appRunTest:"Run test",copied:"Copied",gradeTitle:"Overall Network Grade",appsKicker:"APPLICATION PROFILES",appsBadge:"LIVE CHECK"},
de:{navFaq:"FAQ",navAntivirus:"Antivirus Scanner",navAntivirusDesc:"Dateien und Inhalte auf Sicherheitsrisiken prüfen",download:"Download",navStatus:"Netzwerk-Status",navDiag:"IT-Diagnose",navAbout:"Über uns",liteBtn:"Fasqoo Lite",widgetBtn:"Speed-Widget",navWidget:"Widget",title:"Free Internet Speed Test",sub:"Sieh in Sekunden, was deine Leitung wirklich leistet – inkl. Eignung für Streaming, Gaming und Homeoffice.",serverLabel:"Server",ready:"Bereit zum Testen",start:"Speedtest starten",startAgain:"Test erneut starten",testing:"Test läuft…",complete:"Test abgeschlossen",ping:"Ping",jitter:"Jitter",upload:"Upload",chartLive:"Echtzeit-Leistung",chartWait:"Wartet",lblIp:"Öffentliche IP",lblIsp:"Anbieter / ISP",lblLoc:"Standort",lblAsn:"Netzwerk / ASN",qTitle:"Verbindungsqualität",qDefault:"Führe einen Test aus, um deine Verbindung zu bewerten.",qualityBasis:"Basierend auf Download, Upload, Ping & Jitter",appsTitle:"Was kannst du mit deiner Verbindung machen?",appsSub:"Live-Check für Gaming, 4K-Streaming, Homeoffice und Social Media.",diagTitle:"Netzwerkdiagnose",diagLatT:"Latenz",diagLatD:"Misst die Antwortzeit.",diagStabT:"Stabilität",diagStabD:"Jitter zeigt Verbindungsstabilität.",diagDnsT:"DNS-Diagnose",diagDnsD:"Prüft DNS-Resolver.",diagIpT:"IP-Diagnose",diagIpD:"Erkennt IP, ISP, ASN.",repTitle:"Professioneller Testbericht",lblRepTestId:"Test ID",copy:"Ergebnis kopieren",share:"Ergebnis teilen",json:"JSON exportieren",print:"Bericht drucken",histTitle:"Testverlauf",histRecent:"Letzte Messungen",histClear:"Verlauf löschen",thDate:"Datum",thProvider:"Anbieter",thDown:"Download",thUp:"Upload",thPing:"Ping",thQual:"Qualität",noHistory:"Noch keine Messungen.",ftRights:"© 2026 Fasqoo. Alle Rechte vorbehalten.",ftAccess:"Barrierefreiheit",ftImprint:"Impressum",ftPrivacy:"Datenschutz",ftTerms:"Nutzungsbedingungen",ftNoSell:"Meine Daten nicht verkaufen",footerAntivirus:"Antivirus Scanner",ftPowered:"Betrieben über das Cloudflare Edge-Netzwerk für maximale Leistung und Messgenauigkeit.",ftDisclaimer:"Fasqoo ist eine unabhängige Speedtest-Plattform und kein offizielles Cloudflare-Produkt.",stPing:"Latenz wird gemessen…",stDown:"Download wird gemessen…",stUp:"Upload wird gemessen…",stErr:"Test fehlgeschlagen.",measurementUnavailable:"Messung momentan nicht verfügbar. Bitte erneut versuchen.",stExc:"Hervorragend",stGood:"Gut",stLim:"Eingeschränkt",q90:"Hervorragende Verbindung.",q75:"Sehr gute Verbindung.",q55:"Gute Verbindung.",q35:"Durchschnittliche Verbindung.",q0:"Schlechte Verbindung.",alertRun:"Bitte führe zuerst einen Speedtest aus.",unavail:"Nicht verfügbar",notDetected:"Nicht erkannt",appRunTest:"Test ausführen",copied:"Kopiert",gradeTitle:"Gesamtnote des Netzwerks",appsKicker:"ANWENDUNGSPROFILE",appsBadge:"LIVE-CHECK"},
fr:{navFaq:"FAQ",navAntivirus:"Scanner antivirus",navAntivirusDesc:"Analyser les fichiers et contenus pour détecter les risques",download:"Téléchargement",navStatus:"État du réseau",navDiag:"Diagnostic IT",navAbout:"À propos",liteBtn:"Fasqoo Lite",widgetBtn:"Speed Widget",navWidget:"Widget",title:"Free Internet Speed Test",sub:"Découvrez en quelques secondes ce que votre connexion délivre vraiment — y compris pour le streaming, le gaming et le télétravail.",serverLabel:"Serveur",ready:"Prêt à tester",start:"Lancer le test",startAgain:"Relancer",testing:"Test en cours…",complete:"Test terminé",ping:"Ping",jitter:"Jitter",upload:"Envoi",chartLive:"Performance en direct",chartWait:"En attente",lblIp:"IP publique",lblIsp:"Fournisseur / FAI",lblLoc:"Localisation",lblAsn:"Réseau / ASN",qTitle:"Qualité de connexion",qDefault:"Lancez un test pour évaluer votre connexion.",qualityBasis:"Basé sur le téléchargement, l'envoi, le ping et le jitter",appsTitle:"Que pouvez-vous faire ?",appsSub:"Vérification en direct pour le gaming, la 4K, le télétravail et les réseaux sociaux.",diagTitle:"Diagnostic réseau",diagLatT:"Latence",diagLatD:"Mesure le temps de réponse.",diagStabT:"Stabilité",diagStabD:"Le jitter montre la stabilité.",diagDnsT:"Diagnostic DNS",diagDnsD:"Vérifie les résolveurs DNS.",diagIpT:"Diagnostic IP",diagIpD:"Détecte IP, FAI, ASN.",repTitle:"Rapport professionnel",lblRepTestId:"ID",copy:"Copier",share:"Partager",json:"Exporter JSON",print:"Imprimer",histTitle:"Historique",histRecent:"Mesures récentes",histClear:"Effacer",thDate:"Date",thDown:"Téléchargement",thUp:"Envoi",thPing:"Ping",thQual:"Qualité",noHistory:"Aucun test enregistré.",ftRights:"© 2026 Fasqoo. Tous droits réservés.",ftAccess:"Accessibilité",ftImprint:"Mentions légales",ftPrivacy:"Confidentialité",ftTerms:"Conditions",ftNoSell:"Ne pas vendre mes données",footerAntivirus:"Scanner antivirus",ftPowered:"Propulsé par le réseau Cloudflare Edge pour garantir une performance et une précision de mesure maximales.",ftDisclaimer:"Fasqoo est une plateforme de test de vitesse indépendante et n'est pas un produit officiel Cloudflare.",stPing:"Mesure de la latence…",stDown:"Mesure du téléchargement…",stUp:"Mesure de l'envoi…",stErr:"Échec.",measurementUnavailable:"Mesure indisponible. Veuillez réessayer.",stExc:"Excellent",stGood:"Bon",stLim:"Limité",q90:"Excellente connexion.",q75:"Très bonne connexion.",q55:"Bonne connexion.",q35:"Connexion moyenne.",q0:"Connexion faible.",alertRun:"Lancez d'abord un test.",unavail:"Indisponible",notDetected:"Non détecté",appRunTest:"Lancer",copied:"Copié",gradeTitle:"Note globale du réseau",appsKicker:"PROFILS D'USAGE",appsBadge:"VÉRIF. LIVE"},
es:{navFaq:"FAQ",navAntivirus:"Escáner antivirus",navAntivirusDesc:"Analiza archivos y contenido en busca de riesgos de seguridad",download:"Descarga",navStatus:"Estado de red",navDiag:"Diagnóstico TI",navAbout:"Sobre nosotros",liteBtn:"Fasqoo Lite",widgetBtn:"Speed Widget",navWidget:"Widget",title:"Free Internet Speed Test",sub:"Descubre en segundos lo que realmente ofrece tu conexión, incluida su idoneidad para streaming, juegos y teletrabajo.",serverLabel:"Servidor",ready:"Listo",start:"Iniciar test",startAgain:"Repetir",testing:"Probando…",complete:"Completado",ping:"Ping",jitter:"Jitter",upload:"Subida",chartLive:"Rendimiento en vivo",chartWait:"Esperando",lblIp:"IP Pública",lblIsp:"Proveedor / ISP",lblLoc:"Ubicación",lblAsn:"Red / ASN",qTitle:"Calidad",qDefault:"Ejecuta un test para evaluar tu conexión.",qualityBasis:"Basado en descarga, subida, ping y jitter",appsTitle:"¿Qué puedes hacer?",appsSub:"Comprobación en vivo para juegos, 4K, teletrabajo y redes sociales.",diagTitle:"Diagnóstico de red",diagLatT:"Latencia",diagLatD:"Mide el tiempo de respuesta.",diagStabT:"Estabilidad",diagStabD:"El jitter muestra estabilidad.",diagDnsT:"Diagnóstico DNS",diagDnsD:"Prueba los DNS.",diagIpT:"Diagnóstico IP",diagIpD:"Detecta IP, ISP, ASN.",repTitle:"Informe profesional",lblRepTestId:"ID",copy:"Copiar",share:"Compartir",json:"Exportar JSON",print:"Imprimir",histTitle:"Historial",histRecent:"Recientes",histClear:"Borrar",thDate:"Fecha",thDown:"Descarga",thUp:"Subida",thPing:"Ping",thQual:"Calidad",noHistory:"Sin pruebas guardadas.",ftRights:"© 2026 Fasqoo. Todos los derechos reservados.",ftAccess:"Accesibilidad",ftImprint:"Aviso legal",ftPrivacy:"Privacidad",ftTerms:"Términos",ftNoSell:"No vender mis datos",footerAntivirus:"Escáner antivirus",ftPowered:"Impulsado por la red Cloudflare Edge para garantizar el máximo rendimiento y precisión de medición.",ftDisclaimer:"Fasqoo es una plataforma de test de velocidad independiente y no es un producto oficial de Cloudflare.",stPing:"Midiendo latencia…",stDown:"Midiendo descarga…",stUp:"Midiendo subida…",stErr:"Falló.",measurementUnavailable:"Medición no disponible. Inténtalo de nuevo.",stExc:"Excelente",stGood:"Bueno",stLim:"Limitado",q90:"Excelente conexión.",q75:"Muy buena conexión.",q55:"Buena conexión.",q35:"Conexión promedio.",q0:"Conexión pobre.",alertRun:"Ejecuta primero un test.",unavail:"No disponible",notDetected:"No detectado",appRunTest:"Ejecutar",copied:"Copiado",gradeTitle:"Calificación global de red",appsKicker:"PERFILES DE USO",appsBadge:"CHEQUEO LIVE"},
it:{navFaq:"FAQ",navAntivirus:"Scanner antivirus",navAntivirusDesc:"Controlla file e contenuti per individuare rischi di sicurezza",download:"Download",navStatus:"Stato rete",navDiag:"Diagnostica IT",navAbout:"Chi siamo",liteBtn:"Fasqoo Lite",widgetBtn:"Speed Widget",navWidget:"Widget",title:"Free Internet Speed Test",sub:"Scopri in pochi secondi cosa offre davvero la tua connessione, inclusa l'idoneità per streaming, gaming e smart working.",serverLabel:"Server",ready:"Pronto",start:"Avvia test",startAgain:"Ripeti",testing:"In corso…",complete:"Completato",ping:"Ping",jitter:"Jitter",upload:"Upload",chartLive:"Prestazioni Live",chartWait:"In attesa",lblIp:"IP Pubblico",lblIsp:"Provider / ISP",lblLoc:"Posizione",lblAsn:"Rete / ASN",qTitle:"Qualità",qDefault:"Esegui un test per valutare la connessione.",qualityBasis:"Basato su download, upload, ping e jitter",appsTitle:"Cosa puoi fare?",appsSub:"Controllo live per gaming, 4K, smart working e social.",diagTitle:"Diagnostica di rete",diagLatT:"Latenza",diagLatD:"Misura i tempi di risposta.",diagStabT:"Stabilità",diagStabD:"Il jitter mostra la stabilità.",diagDnsT:"Diagnostica DNS",diagDnsD:"Verifica i DNS.",diagIpT:"Diagnostica IP",diagIpD:"Rileva IP, ISP, ASN.",repTitle:"Report professionale",lblRepTestId:"ID",copy:"Copia",share:"Condividi",json:"Esporta JSON",print:"Stampa",histTitle:"Cronologia",histRecent:"Recenti",histClear:"Cancella",thDate:"Data",thDown:"Download",thUp:"Upload",thPing:"Ping",thQual:"Qualità",noHistory:"Nessun test salvato.",ftRights:"© 2026 Fasqoo. Tutti i diritti riservati.",ftAccess:"Accessibilità",ftImprint:"Note legali",ftPrivacy:"Privacy",ftTerms:"Termini",ftNoSell:"Non vendere i miei dati",footerAntivirus:"Scanner antivirus",ftPowered:"Basato sulla rete Cloudflare Edge per garantire massime prestazioni e precisione di misurazione.",ftDisclaimer:"Fasqoo è una piattaforma di speed test indipendente e non è un prodotto ufficiale Cloudflare.",stPing:"Misura latenza…",stDown:"Misura download…",stUp:"Misura upload…",stErr:"Fallito.",measurementUnavailable:"Misurazione non disponibile. Riprova.",stExc:"Eccellente",stGood:"Buono",stLim:"Limitato",q90:"Connessione eccellente.",q75:"Ottima connessione.",q55:"Buona connessione.",q35:"Connessione media.",q0:"Connessione scarsa.",alertRun:"Esegui prima un test.",unavail:"Non disponibile",notDetected:"Non rilevato",appRunTest:"Esegui",copied:"Copiato",gradeTitle:"Voto globale della rete",appsKicker:"PROFILI D'USO",appsBadge:"CHECK LIVE"},
pt:{navFaq:"FAQ",navAntivirus:"Scanner antivírus",navAntivirusDesc:"Verifica ficheiros e conteúdos em busca de riscos de segurança",download:"Download",navStatus:"Estado da Rede",navDiag:"Diagnóstico TI",navAbout:"Sobre",liteBtn:"Fasqoo Lite",widgetBtn:"Speed Widget",navWidget:"Widget",title:"Free Internet Speed Test",sub:"Descubra em segundos o que a sua ligação realmente oferece — incluindo adequação para streaming, jogos e teletrabalho.",serverLabel:"Servidor",ready:"Pronto",start:"Iniciar teste",startAgain:"Repetir",testing:"A testar…",complete:"Concluído",ping:"Ping",jitter:"Jitter",upload:"Upload",chartLive:"Desempenho",chartWait:"Aguarda",lblIp:"IP Público",lblIsp:"Fornecedor / ISP",lblLoc:"Localização",lblAsn:"Rede / ASN",qTitle:"Qualidade",qDefault:"Execute um teste para avaliar a ligação.",qualityBasis:"Baseado em download, upload, ping e jitter",appsTitle:"O que pode fazer?",appsSub:"Verificação em direto para jogos, 4K, teletrabalho e redes sociais.",diagTitle:"Diagnóstico de Rede",diagLatT:"Latência",diagLatD:"Mede o tempo de resposta.",diagStabT:"Estabilidade",diagStabD:"O jitter mostra estabilidade.",diagDnsT:"Diagnóstico DNS",diagDnsD:"Verifica os DNS.",diagIpT:"Diagnóstico IP",diagIpD:"Deteta IP, ISP, ASN.",repTitle:"Relatório profissional",lblRepTestId:"ID",copy:"Copiar",share:"Partilhar",json:"Exportar JSON",print:"Imprimir",histTitle:"Histórico",histRecent:"Recentes",histClear:"Limpar",thDate:"Data",thDown:"Download",thUp:"Upload",thPing:"Ping",thQual:"Qualidade",noHistory:"Sem testes guardados.",ftRights:"© 2026 Fasqoo. Todos os direitos reservados.",ftAccess:"Acessibilidade",ftImprint:"Informação legal",ftPrivacy:"Privacidade",ftTerms:"Termos",ftNoSell:"Não vender os meus dados",footerAntivirus:"Scanner antivírus",ftPowered:"Suportado pela rede Cloudflare Edge para garantir o máximo desempenho e precisão de medição.",ftDisclaimer:"A Fasqoo é uma plataforma de teste de velocidade independente e não é um produto oficial da Cloudflare.",stPing:"A medir latência…",stDown:"A medir download…",stUp:"A medir upload…",stErr:"Falhou.",measurementUnavailable:"Medição indisponível. Tente novamente.",stExc:"Excelente",stGood:"Bom",stLim:"Limitado",q90:"Ligação excelente.",q75:"Muito boa ligação.",q55:"Boa ligação.",q35:"Ligação média.",q0:"Ligação fraca.",alertRun:"Execute primeiro um teste.",unavail:"Indisponível",notDetected:"Não detetado",appRunTest:"Executar",copied:"Copiado",gradeTitle:"Nota global da rede",appsKicker:"PERFIS DE USO",appsBadge:"VERIF. LIVE"},
nl:{navFaq:"FAQ",navAntivirus:"Antivirusscanner",navAntivirusDesc:"Bestanden en inhoud controleren op beveiligingsrisico's",download:"Download",navStatus:"Netwerkstatus",navDiag:"IT-Diagnose",navAbout:"Over ons",liteBtn:"Fasqoo Lite",widgetBtn:"Speed Widget",navWidget:"Widget",title:"Free Internet Speed Test",sub:"Zie in seconden wat je verbinding echt levert — inclusief geschiktheid voor streaming, gaming en thuiswerken.",serverLabel:"Server",ready:"Klaar",start:"Start test",startAgain:"Opnieuw",testing:"Bezig…",complete:"Voltooid",ping:"Ping",jitter:"Jitter",upload:"Upload",chartLive:"Live",chartWait:"Wachten",lblIp:"Openbaar IP",lblIsp:"Provider / ISP",lblLoc:"Locatie",lblAsn:"Netwerk / ASN",qTitle:"Kwaliteit",qDefault:"Voer een test uit om te beoordelen.",qualityBasis:"Gebaseerd op download, upload, ping en jitter",appsTitle:"Wat kun je doen?",appsSub:"Live check voor gamen, 4K, thuiswerken en social.",diagTitle:"Netwerkdiagnose",diagLatT:"Latentie",diagLatD:"Meet reactietijd.",diagStabT:"Stabiliteit",diagStabD:"Jitter toont stabiliteit.",diagDnsT:"DNS-diagnose",diagDnsD:"Controleert DNS.",diagIpT:"IP-diagnose",diagIpD:"Detecteert IP, ISP, ASN.",repTitle:"Professioneel rapport",lblRepTestId:"ID",copy:"Kopiëren",share:"Delen",json:"JSON exporteren",print:"Afdrukken",histTitle:"Geschiedenis",histRecent:"Recent",histClear:"Wissen",thDate:"Datum",thDown:"Download",thUp:"Upload",thPing:"Ping",thQual:"Kwaliteit",noHistory:"Nog geen tests.",ftRights:"© 2026 Fasqoo. Alle rechten voorbehouden.",ftAccess:"Toegankelijkheid",ftImprint:"Impressum",ftPrivacy:"Privacy",ftTerms:"Voorwaarden",ftNoSell:"Verkoop mijn data niet",footerAntivirus:"Antivirusscanner",ftPowered:"Aangedreven door het Cloudflare Edge-netwerk voor maximale prestaties en meetnauwkeurigheid.",ftDisclaimer:"Fasqoo is een onafhankelijk speedtest-platform en geen officieel Cloudflare-product.",stPing:"Latentie meten…",stDown:"Download meten…",stUp:"Upload meten…",stErr:"Mislukt.",measurementUnavailable:"Meting niet beschikbaar. Probeer opnieuw.",stExc:"Uitstekend",stGood:"Goed",stLim:"Beperkt",q90:"Uitstekende verbinding.",q75:"Zeer goede verbinding.",q55:"Goede verbinding.",q35:"Gemiddelde verbinding.",q0:"Slechte verbinding.",alertRun:"Voer eerst een test uit.",unavail:"Niet beschikbaar",notDetected:"Niet gedetecteerd",appRunTest:"Start",copied:"Gekopieerd",gradeTitle:"Algemene netwerkbeoordeling",appsKicker:"GEBRUIKSPROFIELEN",appsBadge:"LIVE CHECK"},
tr:{navFaq:"SSS",navAntivirus:"Antivirüs Tarayıcı",navAntivirusDesc:"Dosyaları ve içerikleri güvenlik risklerine karşı kontrol edin",navStatus:"Ağ Durumu",navDiag:"BT Tanılama",navAbout:"Hakkımızda",liteBtn:"Fasqoo Lite",widgetBtn:"Speed Widget",navWidget:"Widget",download:"İndirme",title:"Free Internet Speed Test",sub:"Bağlantınızın gerçekte ne sunduğunu saniyeler içinde görün — streaming, oyun ve evden çalışma uygunluğu dahil.",serverLabel:"Sunucu",ready:"Hazır",start:"Testi başlat",startAgain:"Tekrar",testing:"Test ediliyor…",complete:"Tamamlandı",ping:"Ping",jitter:"Jitter",upload:"Yükleme",chartLive:"Canlı",chartWait:"Bekliyor",lblIp:"Açık IP",lblIsp:"Sağlayıcı / ISP",lblLoc:"Konum",lblAsn:"Ağ / ASN",qTitle:"Kalite",qDefault:"Bağlantınızı değerlendirmek için test yapın.",qualityBasis:"İndirme, yükleme, ping ve jitter değerlerine dayanır",appsTitle:"Ne yapabilirsiniz?",appsSub:"Oyun, 4K, evden çalışma ve sosyal medya için canlı kontrol.",diagTitle:"Ağ Tanılama",diagLatT:"Gecikme",diagLatD:"Yanıt süresini ölçer.",diagStabT:"Kararlılık",diagStabD:"Jitter kararlılığı gösterir.",diagDnsT:"DNS Tanılama",diagDnsD:"DNS sunucularını kontrol eder.",diagIpT:"IP Tanılama",diagIpD:"IP, ISP, ASN tespit eder.",repTitle:"Profesyonel Rapor",lblRepTestId:"ID",copy:"Kopyala",share:"Paylaş",json:"JSON",print:"Yazdır",histTitle:"Geçmiş",histRecent:"Son ölçümler",histClear:"Temizle",thDate:"Tarih",thDown:"İndirme",thUp:"Yükleme",thPing:"Ping",thQual:"Kalite",noHistory:"Kayıt yok.",ftRights:"© 2026 Fasqoo. Tüm hakları saklıdır.",ftAccess:"Erişilebilirlik",ftImprint:"Künye",ftPrivacy:"Gizlilik",ftTerms:"Şartlar",ftNoSell:"Verilerimi satma",footerAntivirus:"Antivirüs Tarayıcı",ftPowered:"Maksimum performans ve ölçüm doğruluğu için Cloudflare Edge ağı tarafından desteklenmektedir.",ftDisclaimer:"Fasqoo bağımsız bir hız testi platformudur ve resmi bir Cloudflare ürünü değildir.",stPing:"Gecikme ölçülüyor…",stDown:"İndirme ölçülüyor…",stUp:"Yükleme ölçülüyor…",stErr:"Başarısız.",measurementUnavailable:"Ölçüm kullanılamıyor. Tekrar deneyin.",stExc:"Mükemmel",stGood:"İyi",stLim:"Sınırlı",q90:"Mükemmel bağlantı.",q75:"Çok iyi bağlantı.",q55:"İyi bağlantı.",q35:"Ortalama bağlantı.",q0:"Zayıf bağlantı.",alertRun:"Önce test yapın.",unavail:"Kullanılamıyor",notDetected:"Tespit edilmedi",appRunTest:"Çalıştır",copied:"Kopylandı",gradeTitle:"Genel Ağ Notu",appsKicker:"KULLANIM PROFİLLERİ",appsBadge:"CANLI KONTROL"},
sq:{navFaq:"FAQ",navAntivirus:"Skaneri antivirus",navAntivirusDesc:"Kontrollo skedarët dhe përmbajtjen për rreziqe sigurie",download:"Shkarkim",navStatus:"Statusi i rrjetit",navDiag:"Diagnostika IT",navAbout:"Rreth nesh",liteBtn:"Fasqoo Lite",widgetBtn:"Speed Widget",navWidget:"Widget",title:"Free Internet Speed Test",sub:"Shiko në sekonda se çfarë ofron vërtet lidhja jote – përfshirë përshtatshmërinë për streaming, lojëra dhe punë nga shtëpia.",serverLabel:"Serveri",ready:"Gati",start:"Fillo testin",startAgain:"Përsëri",testing:"Duke testuar…",complete:"Përfundoi",ping:"Ping",jitter:"Jitter",upload:"Ngarkim",chartLive:"Performanca",chartWait:"Pritje",lblIp:"IP Publike",lblIsp:"Ofruesi / ISP",lblLoc:"Vendndodhja",lblAsn:"Rrjeti / ASN",qTitle:"Cilësia",qDefault:"Bëj një test për të vlerësuar lidhjen.",qualityBasis:"Bazuar në shkarkim, ngarkim, ping dhe jitter",appsTitle:"Çfarë mund të bësh?",appsSub:"Kontroll i drejtpërdrejtë për lojëra, 4K, punë nga shtëpia dhe rrjete sociale.",diagTitle:"Diagnostika e Rrjetit",diagLatT:"Vonesa",diagLatD:"Mat kohën e përgjigjes.",diagStabT:"Qëndrueshmëria",diagStabD:"Jitter tregon qëndrueshmërinë.",diagDnsT:"Diagnostika DNS",diagDnsD:"Teston DNS-të.",diagIpT:"Diagnostika IP",diagIpD:"Zbulon IP, ISP, ASN.",repTitle:"Raport Profesional",lblRepTestId:"ID",copy:"Kopjo",share:"Shpërndaj",json:"Eksporto JSON",print:"Printo",histTitle:"Historiku",histRecent:"Matjet e fundit",histClear:"Pastro",thDate:"Data",thDown:"Shkarkim",thUp:"Ngarkim",thPing:"Ping",thQual:"Cilësia",noHistory:"Nuk ka matje.",ftRights:"© 2026 Fasqoo. Të gjitha të drejtat e rezervuara.",ftAccess:"Qasueshmëria",ftImprint:"Impresum",ftPrivacy:"Privatësia",ftTerms:"Kushtet",ftNoSell:"Mos shit të dhënat e mia",footerAntivirus:"Skaneri antivirus",ftPowered:"Mundësuar nga rrjeti Cloudflare Edge për performancë maksimale dhe saktësi matjeje.",ftDisclaimer:"Fasqoo është platformë e pavarur e testimit të shpejtësisë dhe nuk është produkt zyrtar i Cloudflare.",stPing:"Matja e vonesës…",stDown:"Matja e shkarkimit…",stUp:"Matja e ngarkimit…",stErr:"Dështoi.",measurementUnavailable:"Matja e padisponueshme. Provo përsëri.",stExc:"Shkëlqyeshëm",stGood:"Mirë",stLim:"E kufizuar",q90:"Lidhje e shkëlqyer.",q75:"Lidhje shumë e mirë.",q55:"Lidhje e mirë.",q35:"Lidhje mesatare.",q0:"Lidhje e dobët.",alertRun:"Kryej fillimisht një test.",unavail:"E padisponueshme",notDetected:"Nuk u zbulua",appRunTest:"Kryej",copied:"U kopjua",gradeTitle:"Nota globale e rrjetit",appsKicker:"PROFILET E PËRDORIMIT",appsBadge:"KONTROLL LIVE"},
ar:{navFaq:"الأسئلة الشائعة",navAntivirus:"فحص مكافحة الفيروسات",navAntivirusDesc:"فحص الملفات والمحتوى بحثًا عن مخاطر أمنية",navStatus:"حالة الشبكة",navDiag:"تشخيص IT",navAbout:"من نحن",liteBtn:"Fasqoo Lite",widgetBtn:"Speed Widget",navWidget:"Widget",download:"تنزيل",title:"Free Internet Speed Test",sub:"اكتشف في ثوانٍ ما تقدمه اتصالك فعلاً — بما في ذلك مدى ملاءمته للبث والألعاب والعمل من المنزل.",serverLabel:"الخادم",ready:"جاهز",start:"بدء الاختبار",startAgain:"إعادة",testing:"جارٍ…",complete:"اكتمل",ping:"Ping",jitter:"Jitter",upload:"رفع",chartLive:"الأداء المباشر",chartWait:"انتظار",lblIp:"عنوان IP",lblIsp:"المزود",lblLoc:"الموقع",lblAsn:"الشبكة",qTitle:"جودة الاتصال",qDefault:"قم بإجراء اختبار.",qualityBasis:"استنادًا إلى التنزيل والرفع وPing وJitter",appsTitle:"ماذا يمكنك أن تفعل؟",appsSub:"فحص مباشر للألعاب و4K والعمل من المنزل.",diagTitle:"تشخيص الشبكة",diagLatT:"زمن الاستجابة",diagLatD:"يقيس وقت الاستجابة.",diagStabT:"الاستقرار",diagStabD:"يوضح Jitter الاستقرار.",diagDnsT:"تشخيص DNS",diagDnsD:"يتحقق من DNS.",diagIpT:"تشخيص IP",diagIpD:"يكتشف IP و ISP.",repTitle:"تقرير احترافي",lblRepTestId:"معرّف",copy:"نسخ",share:"مشاركة",json:"تصدير",print:"طباعة",histTitle:"السجل",histRecent:"القياسات الأخيرة",histClear:"مسح",thDate:"التاريخ",thDown:"تنزيل",thUp:"رفع",thPing:"Ping",thQual:"الجودة",noHistory:"لا توجد اختبارات.",ftRights:"© 2026 Fasqoo. جميع الحقوق محفوظة.",ftAccess:"إمكانية الوصول",ftImprint:"بيانات الناشر",ftPrivacy:"الخصوصية",ftTerms:"الشروط",ftNoSell:"لا تبيع بياناتي",footerAntivirus:"فحص مكافحة الفيروسات",ftPowered:"مدعوم بشبكة Cloudflare Edge لضمان أقصى أداء ودقة قياس.",ftDisclaimer:"Fasqoo منصة اختبار سرعة مستقلة وليست منتجًا رسميًا من Cloudflare.",stPing:"قياس زمن الاستجابة…",stDown:"قياس التنزيل…",stUp:"قياس الرفع…",stErr:"فشل.",measurementUnavailable:"القياس غير متاح. حاول مجددًا.",stExc:"ممتاز",stGood:"جيد",stLim:"محدود",q90:"اتصال ممتاز.",q75:"اتصال جيد جدًا.",q55:"اتصال جيد.",q35:"اتصال متوسط.",q0:"اتصال ضعيف.",alertRun:"قم بإجراء اختبار أولاً.",unavail:"غير متاح",notDetected:"لم يُكتشف",appRunTest:"تشغيل",copied:"تم النسخ",gradeTitle:"التقييم العام للشبكة",appsKicker:"ملفات الاستخدام",appsBadge:"فحص مباشر"}
};

const siteNavTranslations = {
  en:{navSpeedtest:"Speedtest",navTools:"Tools & IT Diagnostics",navSectionNetwork:"Network & Speed",navSectionDiag:"IT Diagnostics & Security",navStatusDesc:"Live reachability & line diagnostics",navWidgetDesc:"Free test widget for other websites",navGaming:"Gaming & Ping Monitor",navGamingDesc:"Live ping & gaming performance monitor",navSecurityDesc:"Check HTTP security headers in real time",navDnsDesc:"Track global DNS propagation visually",navSubnetDesc:"Calculate IP ranges and subnet masks",navSecurity:"Security Analyzer",navDns:"Visual DNS Test",navSubnet:"Subnet Calculator",footerBrand:"Fasqoo - Independent, browser-based internet speed tests and network tools.",footerSpeedTests:"Speed Tests",footerInternetSpeed:"Internet Speed Test",footerLite:"Fasqoo Lite",footerWidget:"Widget",footerNetworkTools:"Network Tools",footerNetworkStatus:"Network Status",footerGaming:"Gaming & Ping Monitor",footerITDiagnose:"IT Diagnostics",footerSecurity:"Security Analyzer",footerDns:"Visual DNS Test",footerCompany:"Company",footerAbout:"About Us",footerFaq:"FAQ",footerPrivacy:"Privacy Policy",footerCopyright:"© 2026 Fasqoo",footerBranding:"Measurement via Cloudflare Edge · Fasqoo is an independent platform.",footerDisclaimer:"Fasqoo is an independent speed-test platform and is not an official Cloudflare product."},
  de:{navSpeedtest:"Speedtest",navTools:"Tools & IT-Diagnose",navSectionNetwork:"Netzwerk & Speed",navSectionDiag:"IT-Diagnose & Security",navStatusDesc:"Live-Erreichbarkeit & Leitungs-Diagnose",navWidgetDesc:"Kostenloses Test-Widget für andere Websites",navGaming:"Gaming- & Ping-Monitor",navGamingDesc:"Live-Ping & Gaming-Performance überwachen",navSecurityDesc:"HTTP-Sicherheitsheader in Echtzeit prüfen",navDnsDesc:"Globale DNS-Ausbreitung visuell tracken",navSubnetDesc:"IP-Bereiche und Masken kalkulieren",navSecurity:"Security Analyzer",navDns:"Visual DNS Test",navSubnet:"Subnetz-Rechner",footerBrand:"Fasqoo - Unabhängige, browserbasierte Internet-Geschwindigkeitstests und Netzwerktools.",footerSpeedTests:"Speed Tests",footerInternetSpeed:"Internet Speed Test",footerLite:"Fasqoo Lite",footerWidget:"Widget",footerNetworkTools:"Netzwerk-Tools",footerNetworkStatus:"Network Status",footerGaming:"Gaming- & Ping-Monitor",footerITDiagnose:"IT Diagnose",footerSecurity:"Security Analyzer",footerDns:"Visual DNS Test",footerCompany:"Unternehmen",footerAbout:"Über uns",footerFaq:"FAQ",footerPrivacy:"Datenschutz",footerCopyright:"© 2026 Fasqoo",footerBranding:"Unterstützt durch das Cloudflare Edge-Netzwerk für maximale Leistung und Messgenauigkeit.",footerDisclaimer:"Fasqoo ist eine unabhängige Speedtest-Plattform und kein offizielles Cloudflare-Produkt."},
  fr:{navSpeedtest:"Speedtest",navTools:"Outils & diagnostic",navSectionNetwork:"Réseau & vitesse",navSectionDiag:"Diagnostic IT & sécurité",navGaming:"Moniteur Gaming & Ping",navGamingDesc:"Surveillance du ping et des performances de jeu",navSecurity:"Analyseur de sécurité",navDns:"Test DNS visuel",navSubnet:"Calculateur de sous-réseau",footerBrand:"Fasqoo - Tests de vitesse Internet indépendants, directement dans le navigateur, et outils réseau.",footerSpeedTests:"Tests de vitesse",footerInternetSpeed:"Test de vitesse Internet",footerLite:"Fasqoo Lite",footerWidget:"Widget",footerNetworkTools:"Outils réseau",footerNetworkStatus:"État du réseau",footerGaming:"Moniteur Gaming & Ping",footerITDiagnose:"Diagnostic IT",footerSecurity:"Analyseur de sécurité",footerDns:"Test DNS visuel",footerCompany:"Entreprise",footerAbout:"À propos",footerFaq:"FAQ",footerPrivacy:"Confidentialité",footerCopyright:"© 2026 Fasqoo",footerBranding:"Mesure via Cloudflare Edge · Fasqoo est une plateforme indépendante."},
  es:{navSpeedtest:"Speedtest",navTools:"Herramientas y diagnóstico",navSectionNetwork:"Red y velocidad",navSectionDiag:"Diagnóstico TI y seguridad",navGaming:"Monitor Gaming y Ping",navGamingDesc:"Monitor de ping y rendimiento en juegos en vivo",navSecurity:"Analizador de seguridad",navDns:"Prueba DNS visual",navSubnet:"Calculadora de subredes",footerBrand:"Fasqoo - Pruebas de velocidad de Internet independientes desde el navegador y herramientas de red.",footerSpeedTests:"Pruebas de velocidad",footerInternetSpeed:"Test de velocidad de Internet",footerLite:"Fasqoo Lite",footerWidget:"Widget",footerNetworkTools:"Herramientas de red",footerNetworkStatus:"Estado de red",footerGaming:"Monitor Gaming y Ping",footerITDiagnose:"Diagnóstico TI",footerSecurity:"Analizador de seguridad",footerDns:"Prueba DNS visual",footerCompany:"Empresa",footerAbout:"Sobre nosotros",footerFaq:"FAQ",footerPrivacy:"Privacidad",footerCopyright:"© 2026 Fasqoo",footerBranding:"Medición mediante Cloudflare Edge · Fasqoo es una plataforma independiente."},
  it:{navSpeedtest:"Speedtest",navTools:"Strumenti e diagnostica",navSectionNetwork:"Rete e velocità",navSectionDiag:"Diagnostica IT e sicurezza",navGaming:"Monitor Gaming & Ping",navGamingDesc:"Monitor ping e prestazioni gaming in tempo reale",navSecurity:"Analizzatore di sicurezza",navDns:"Test DNS visivo",navSubnet:"Calcolatore subnet",footerBrand:"Fasqoo - Test di velocità Internet indipendenti dal browser e strumenti di rete.",footerSpeedTests:"Speed Test",footerInternetSpeed:"Speed Test Internet",footerLite:"Fasqoo Lite",footerWidget:"Widget",footerNetworkTools:"Strumenti di rete",footerNetworkStatus:"Stato della rete",footerGaming:"Monitor Gaming & Ping",footerITDiagnose:"Diagnostica IT",footerSecurity:"Analizzatore di sicurezza",footerDns:"Test DNS visivo",footerCompany:"Azienda",footerAbout:"Chi siamo",footerFaq:"FAQ",footerPrivacy:"Privacy",footerCopyright:"© 2026 Fasqoo",footerBranding:"Misurazione tramite Cloudflare Edge · Fasqoo è una piattaforma indipendente."},
  pt:{navSpeedtest:"Speedtest",navTools:"Ferramentas e diagnóstico",navSectionNetwork:"Rede e velocidade",navSectionDiag:"Diagnóstico de TI e segurança",navGaming:"Monitor de Gaming e Ping",navGamingDesc:"Monitor de ping e desempenho em jogos em direto",navSecurity:"Analisador de segurança",navDns:"Teste DNS visual",navSubnet:"Calculadora de sub-rede",footerBrand:"Fasqoo - Testes de velocidade da Internet independentes no navegador e ferramentas de rede.",footerSpeedTests:"Testes de velocidade",footerInternetSpeed:"Teste de velocidade da Internet",footerLite:"Fasqoo Lite",footerWidget:"Widget",footerNetworkTools:"Ferramentas de rede",footerNetworkStatus:"Status da rede",footerGaming:"Monitor de Gaming e Ping",footerITDiagnose:"Diagnóstico de TI",footerSecurity:"Analisador de segurança",footerDns:"Teste DNS visual",footerCompany:"Empresa",footerAbout:"Sobre nós",footerFaq:"FAQ",footerPrivacy:"Privacidade",footerCopyright:"© 2026 Fasqoo",footerBranding:"Medição via Cloudflare Edge · A Fasqoo é uma plataforma independente."},
  nl:{navSpeedtest:"Speedtest",navTools:"Tools & Diagnose",navSectionNetwork:"Netwerk & snelheid",navSectionDiag:"IT-diagnose & beveiliging",navGaming:"Gaming- & Ping-monitor",navGamingDesc:"Live ping- en gameprestatiemonitor",navSecurity:"Security Analyzer",navDns:"Visuele DNS-test",navSubnet:"Subnetcalculator",footerBrand:"Fasqoo - Onafhankelijke browsergebaseerde internetsnelheidstests en netwerktools.",footerSpeedTests:"Snelheidstests",footerInternetSpeed:"Internetsnelheidstest",footerLite:"Fasqoo Lite",footerWidget:"Widget",footerNetworkTools:"Netwerktools",footerNetworkStatus:"Netwerkstatus",footerGaming:"Gaming- & Ping-monitor",footerITDiagnose:"IT-diagnose",footerSecurity:"Security Analyzer",footerDns:"Visuele DNS-test",footerCompany:"Bedrijf",footerAbout:"Over ons",footerFaq:"FAQ",footerPrivacy:"Privacy",footerCopyright:"© 2026 Fasqoo",footerBranding:"Meting via Cloudflare Edge · Fasqoo is een onafhankelijk platform."},
  tr:{navSpeedtest:"Speedtest",navTools:"Araçlar ve Tanılama",navSectionNetwork:"Ağ ve Hız",navSectionDiag:"BT Tanılama ve Güvenlik",navGaming:"Oyun ve Ping Monitörü",navGamingDesc:"Canlı ping ve oyun performansı izleme",navSecurity:"Güvenlik Analizörü",navDns:"Görsel DNS Testi",navSubnet:"Alt Ağ Hesaplayıcı",footerBrand:"Fasqoo - Bağımsız, tarayıcı tabanlı internet hız testleri ve ağ araçları.",footerSpeedTests:"Hız Testleri",footerInternetSpeed:"İnternet Hız Testi",footerLite:"Fasqoo Lite",footerWidget:"Widget",footerNetworkTools:"Ağ Araçları",footerNetworkStatus:"Ağ Durumu",footerGaming:"Oyun ve Ping Monitörü",footerITDiagnose:"BT Tanılama",footerSecurity:"Güvenlik Analizörü",footerDns:"Görsel DNS Testi",footerCompany:"Şirket",footerAbout:"Hakkımızda",footerFaq:"SSS",footerPrivacy:"Gizlilik",footerCopyright:"© 2026 Fasqoo",footerBranding:"Cloudflare Edge üzerinden ölçüm · Fasqoo bağımsız bir platformdur."},
  sq:{navSpeedtest:"Speedtest",navTools:"Mjete & Diagnostikë",navSectionNetwork:"Rrjeti & Shpejtësia",navSectionDiag:"Diagnostikë IT & Siguri",navGaming:"Monitor Loje & Ping",navGamingDesc:"Monitor ping dhe performancë lojërash në kohë reale",navSecurity:"Analizuesi i Sigurisë",navDns:"Testi Vizual DNS",navSubnet:"Llogaritësi i Nënrrjetit",footerBrand:"Fasqoo - Teste të pavarura të shpejtësisë së internetit në shfletues dhe mjete rrjeti.",footerSpeedTests:"Teste Shpejtësie",footerInternetSpeed:"Testi i Shpejtësisë së Internetit",footerLite:"Fasqoo Lite",footerWidget:"Widget",footerNetworkTools:"Mjete Rrjeti",footerNetworkStatus:"Statusi i Rrjetit",footerGaming:"Monitor Loje & Ping",footerITDiagnose:"Diagnostikë IT",footerSecurity:"Analizuesi i Sigurisë",footerDns:"Testi Vizual DNS",footerCompany:"Kompania",footerAbout:"Rreth nesh",footerFaq:"FAQ",footerPrivacy:"Privatësia",footerCopyright:"© 2026 Fasqoo",footerBranding:"Matje përmes Cloudflare Edge · Fasqoo është një platformë e pavarur."},
  ar:{navSpeedtest:"اختبار السرعة",navTools:"الأدوات والتشخيص",navSectionNetwork:"الشبكة والسرعة",navSectionDiag:"تشخيص تقنية المعلومات والأمان",navGaming:"مراقب الألعاب والبنغ",navGamingDesc:"مراقبة البنغ وأداء الألعاب المباشر",navSecurity:"محلل الأمان",navDns:"اختبار DNS المرئي",navSubnet:"حاسبة الشبكات الفرعية",footerBrand:"Fasqoo - اختبارات سرعة إنترنت مستقلة عبر المتصفح وأدوات الشبكات.",footerSpeedTests:"اختبارات السرعة",footerInternetSpeed:"اختبار سرعة الإنترنت",footerLite:"Fasqoo Lite",footerWidget:"الأداة",footerNetworkTools:"أدوات الشبكة",footerNetworkStatus:"حالة الشبكة",footerGaming:"مراقب الألعاب والبنغ",footerITDiagnose:"تشخيص تقنية المعلومات",footerSecurity:"محلل الأمان",footerDns:"اختبار DNS المرئي",footerCompany:"الشركة",footerAbout:"من نحن",footerFaq:"الأسئلة الشائعة",footerPrivacy:"الخصوصية",footerCopyright:"© 2026 Fasqoo",footerBranding:"القياس عبر Cloudflare Edge · Fasqoo منصة مستقلة."}
};

const extraTranslations = {
  en:{eyebrow:'FASQOO NETWORK INTELLIGENCE',trust1:'Accurate measurement – no estimates',trust2:'Free & no account required',liveTest:'LIVE CONNECTION TEST',readyPhase:'Ready',phasePing:'Ping',phaseDownload:'Download',phaseUpload:'Upload',phaseResult:'Result',unitMbps:'Mbps',waiting:'Waiting for measurement',notMeasured:'Not measured',networkIntelligence:'NETWORK INTELLIGENCE',understand:'Understand your connection',intelligenceSub:'Fasqoo turns your measurements into practical network insights.',professional:'PROFESSIONAL',latency:'Latency',responseTime:'Response time',stability:'Stability',jitterConsistency:'Jitter consistency',throughput:'Throughput',downloadCapacity:'Download capacity',testServer:'Test server',automaticEdge:'Automatic edge selection',measurementReal:'Measuring real network performance',measurementComplete:'Measurement complete',measurementRetry:'No synthetic result was used. Start the test again to retry the real measurement.',howMeasures:'HOW FASQOO MEASURES',transparent:'TRANSPARENT',methodTitle:'How your connection is measured',methodSub:'Fasqoo measures the connection from your browser to the measurement infrastructure and reports the values it actually receives.',method1T:'Latency & jitter',method1D:'Multiple small requests are timed. Ping is based on the measured response times; jitter describes the variation between measurements.',method2T:'Download',method2D:'The browser downloads data from the test endpoint. Fasqoo calculates throughput from the bytes received and elapsed time.',method3T:'Upload',method3D:'The browser sends measured payloads to the test endpoint and calculates throughput from the bytes sent and elapsed time.',method4T:'Why results vary',method4D:'Wi-Fi signal, device load, VPNs, ISP congestion, routing and distance to the test edge can change the result. Repeat the test for a clearer picture.',methodNote:'Measurement infrastructure: Cloudflare Speed Test endpoints. Fasqoo is an independent speed-test platform and is not an official Cloudflare product.'},
  de:{eyebrow:'FASQOO NETZWERK-INTELLIGENZ',trust1:'Echte Messung – keine Schätzwerte',trust2:'Kostenlos & ohne Konto',liveTest:'LIVE-VERBINDUNGSTEST',readyPhase:'Bereit',phasePing:'Ping',phaseDownload:'Download',phaseUpload:'Upload',phaseResult:'Ergebnis',unitMbps:'Mbit/s',waiting:'Warten auf Messung',notMeasured:'Nicht gemessen',networkIntelligence:'NETZWERK-INTELLIGENZ',understand:'Verstehe deine Verbindung',intelligenceSub:'Fasqoo verwandelt deine Messwerte in praktische Netzwerkinformationen.',professional:'PROFESSIONELL',latency:'Latenz',responseTime:'Antwortzeit',stability:'Stabilität',jitterConsistency:'Jitter-Konsistenz',throughput:'Durchsatz',downloadCapacity:'Download-Kapazität',testServer:'Testserver',automaticEdge:'Automatische Edge-Auswahl',measurementReal:'Echte Netzwerkleistung wird gemessen',measurementComplete:'Messung abgeschlossen',measurementRetry:'Es wurde kein künstlicher Wert verwendet. Starte den Test erneut.',howMeasures:'SO MISST FASQOO',transparent:'TRANSPARENT',methodTitle:'So wird deine Verbindung gemessen',methodSub:'Fasqoo misst die Verbindung von deinem Browser zur Messinfrastruktur und gibt die Werte aus, die tatsächlich empfangen werden.',method1T:'Latenz & Jitter',method1D:'Mehrere kleine Anfragen werden zeitlich gemessen. Der Ping basiert auf den gemessenen Antwortzeiten; Jitter beschreibt die Schwankung zwischen den Messungen.',method2T:'Download',method2D:'Der Browser lädt Daten vom Test-Endpunkt. Fasqoo berechnet den Durchsatz aus empfangenen Bytes und verstrichener Zeit.',method3T:'Upload',method3D:'Der Browser sendet gemessene Nutzdaten an den Test-Endpunkt und berechnet den Durchsatz aus gesendeten Bytes und verstrichener Zeit.',method4T:'Warum Ergebnisse schwanken',method4D:'WLAN-Signal, Gerätelast, VPNs, ISP-Überlastung, Routing und Entfernung zum Test-Edge können das Ergebnis verändern. Wiederhole den Test für ein klareres Bild.',methodNote:'Messinfrastruktur: Cloudflare Speed Test Endpunkte. Fasqoo ist eine unabhängige Speedtest-Plattform und kein offizielles Cloudflare-Produkt.'},
  fr:{eyebrow:'INTELLIGENCE RÉSEAU FASQOO',trust1:'Mesure réelle – sans estimation',trust2:'Gratuit & sans compte',liveTest:'TEST DE CONNEXION EN DIRECT',readyPhase:'Prêt',phasePing:'Ping',phaseDownload:'Téléchargement',phaseUpload:'Envoi',phaseResult:'Résultat',unitMbps:'Mbit/s',waiting:'En attente de mesure',notMeasured:'Non mesuré',networkIntelligence:'INTELLIGENCE RÉSEAU',understand:'Comprenez votre connexion',intelligenceSub:'Fasqoo transforme vos mesures en informations réseau pratiques.',professional:'PROFESSIONNEL',latency:'Latence',responseTime:'Temps de réponse',stability:'Stabilité',jitterConsistency:'Régularité du jitter',throughput:'Débit',downloadCapacity:'Capacité de téléchargement',testServer:'Serveur de test',automaticEdge:'Sélection automatique',measurementReal:'Mesure réelle en cours',measurementComplete:'Mesure terminée',measurementRetry:'Aucun résultat synthétique utilisé. Relancez le test.',howMeasures:'COMMENT FASQOO MESURE',transparent:'TRANSPARENT',methodTitle:'Comment votre connexion est mesurée',methodSub:'Fasqoo mesure la connexion entre votre navigateur et l\'infrastructure de mesure et rapporte les valeurs réellement reçues.',method1T:'Latence & jitter',method1D:'Plusieurs petites requêtes sont chronométrées. Le ping est basé sur les temps de réponse mesurés ; le jitter décrit la variation entre les mesures.',method2T:'Téléchargement',method2D:'Le navigateur télécharge les données depuis le point de test. Fasqoo calcule le débit à partir des octets reçus et du temps écoulé.',method3T:'Envoi',method3D:'Le navigateur envoie des charges utiles mesurées au point de test et calcule le débit à partir des octets envoyés et du temps écoulé.',method4T:'Pourquoi les résultats varient',method4D:'Le signal Wi-Fi, la charge de l\'appareil, les VPN, la congestion du FAI, le routage et la distance jusqu\'au point de test peuvent modifier le résultat. Relancez le test pour une image plus claire.',methodNote:'Infrastructure de mesure : points de terminaison Cloudflare Speed Test. Fasqoo est une plateforme de test de vitesse indépendante et n\'est pas un produit officiel Cloudflare.'},
  es:{eyebrow:'INTELIGENCIA DE RED FASQOO',trust1:'Medición real – sin estimaciones',trust2:'Gratis y sin cuenta',liveTest:'PRUEBA EN VIVO',readyPhase:'Listo',phasePing:'Ping',phaseDownload:'Descarga',phaseUpload:'Subida',phaseResult:'Resultado',unitMbps:'Mbit/s',waiting:'Esperando medición',notMeasured:'No medido',networkIntelligence:'INTELIGENCIA DE RED',understand:'Entiende tu conexión',intelligenceSub:'Fasqoo convierte tus mediciones en información práctica.',professional:'PROFESIONAL',latency:'Latencia',responseTime:'Tiempo de respuesta',stability:'Estabilidad',jitterConsistency:'Consistencia del jitter',throughput:'Rendimiento',downloadCapacity:'Capacidad de descarga',testServer:'Servidor de prueba',automaticEdge:'Selección automática',measurementReal:'Midiendo rendimiento real',measurementComplete:'Medición completada',measurementRetry:'No se usó ningún valor sintético. Repite el test.',howMeasures:'CÓMO MIDE FASQOO',transparent:'TRANSPARENTE',methodTitle:'Cómo se mide tu conexión',methodSub:'Fasqoo mide la conexión desde tu navegador hasta la infraestructura de medición y reporta los valores que realmente recibe.',method1T:'Latencia y jitter',method1D:'Se cronometran varias peticiones pequeñas. El ping se basa en los tiempos de respuesta medidos; el jitter describe la variación entre mediciones.',method2T:'Descarga',method2D:'El navegador descarga datos desde el endpoint de prueba. Fasqoo calcula el rendimiento a partir de los bytes recibidos y el tiempo transcurrido.',method3T:'Subida',method3D:'El navegador envía cargas medidas al endpoint de prueba y calcula el rendimiento a partir de los bytes enviados y el tiempo transcurrido.',method4T:'Por qué varían los resultados',method4D:'La señal Wi-Fi, la carga del dispositivo, las VPN, la congestión del ISP, el enrutamiento y la distancia al edge de prueba pueden cambiar el resultado. Repite la prueba para una imagen más clara.',methodNote:'Infraestructura de medición: endpoints de Cloudflare Speed Test. Fasqoo es una plataforma de test de velocidad independiente y no es un producto oficial de Cloudflare.'},
  it:{eyebrow:'INTELLIGENZA DI RETE FASQOO',trust1:'Misurazione reale – senza stime',trust2:'Gratis e senza account',liveTest:'TEST IN DIRETTA',readyPhase:'Pronto',phasePing:'Ping',phaseDownload:'Download',phaseUpload:'Upload',phaseResult:'Risultato',unitMbps:'Mbit/s',waiting:'In attesa',notMeasured:'Non misurato',networkIntelligence:'INTELLIGENZA DI RETE',understand:'Comprendi la connessione',intelligenceSub:'Fasqoo trasforma le misurazioni in informazioni pratiche.',professional:'PROFESSIONALE',latency:'Latenza',responseTime:'Tempo di risposta',stability:'Stabilità',jitterConsistency:'Coerenza del jitter',throughput:'Velocità',downloadCapacity:'Capacità di download',testServer:'Server di test',automaticEdge:'Selezione automatica',measurementReal:'Misurazione reale in corso',measurementComplete:'Misurazione completata',measurementRetry:'Nessun valore sintetico utilizzato. Ripeti il test.',howMeasures:'COME MISURA FASQOO',transparent:'TRASPARENTE',methodTitle:'Come viene misurata la tua connessione',methodSub:'Fasqoo misura la connessione dal tuo browser all\'infrastruttura di misurazione e riporta i valori effettivamente ricevuti.',method1T:'Latenza e jitter',method1D:'Vengono cronometrate diverse piccole richieste. Il ping si basa sui tempi di risposta misurati; il jitter descrive la variazione tra le misurazioni.',method2T:'Download',method2D:'Il browser scarica i dati dall\'endpoint di test. Fasqoo calcola la velocità dai byte ricevuti e dal tempo trascorso.',method3T:'Upload',method3D:'Il browser invia payload misurati all\'endpoint di test e calcola la velocità dai byte inviati e dal tempo trascorso.',method4T:'Perché i risultati variano',method4D:'Segnale Wi-Fi, carico del dispositivo, VPN, congestione ISP, routing e distanza dall\'edge di test possono modificare il risultato. Ripeti il test per un quadro più chiaro.',methodNote:'Infrastruttura di misurazione: endpoint Cloudflare Speed Test. Fasqoo è una piattaforma di speed test indipendente e non è un prodotto ufficiale Cloudflare.'},
  pt:{eyebrow:'INTELIGÊNCIA DE REDE FASQOO',trust1:'Medição real – sem estimativas',trust2:'Grátis e sem conta',liveTest:'TESTE EM DIRETO',readyPhase:'Pronto',phasePing:'Ping',phaseDownload:'Download',phaseUpload:'Upload',phaseResult:'Resultado',unitMbps:'Mbit/s',waiting:'A aguardar medição',notMeasured:'Não medido',networkIntelligence:'INTELIGÊNCIA DE REDE',understand:'Compreenda a sua ligação',intelligenceSub:'A Fasqoo transforma as medições em informação prática.',professional:'PROFISSIONAL',latency:'Latência',responseTime:'Tempo de resposta',stability:'Estabilidade',jitterConsistency:'Consistência do jitter',throughput:'Débito',downloadCapacity:'Capacidade de download',testServer:'Servidor de teste',automaticEdge:'Seleção automática',measurementReal:'A medir desempenho real',measurementComplete:'Medição concluída',measurementRetry:'Nenhum valor sintético foi usado. Repita o teste.',howMeasures:'COMO A FASQOO MEDE',transparent:'TRANSPARENTE',methodTitle:'Como a sua ligação é medida',methodSub:'A Fasqoo mede a ligação do seu navegador até à infraestrutura de medição e reporta os valores realmente recebidos.',method1T:'Latência e jitter',method1D:'Vários pequenos pedidos são cronometrados. O ping baseia-se nos tempos de resposta medidos; o jitter descreve a variação entre medições.',method2T:'Download',method2D:'O navegador descarrega dados do endpoint de teste. A Fasqoo calcula o débito a partir dos bytes recebidos e do tempo decorrido.',method3T:'Upload',method3D:'O navegador envia cargas medidas para o endpoint de teste e calcula o débito a partir dos bytes enviados e do tempo decorrido.',method4T:'Porque os resultados variam',method4D:'Sinal Wi-Fi, carga do dispositivo, VPNs, congestionamento do ISP, encaminhamento e distância até ao edge de teste podem alterar o resultado. Repita o teste para uma imagem mais clara.',methodNote:'Infraestrutura de medição: endpoints Cloudflare Speed Test. A Fasqoo é uma plataforma de teste de velocidade independente e não é um produto oficial da Cloudflare.'},
  nl:{eyebrow:'FASQOO NETWERKINTELLIGENTIE',trust1:'Echte meting – geen schattingen',trust2:'Gratis & zonder account',liveTest:'LIVE VERBINDINGSTEST',readyPhase:'Klaar',phasePing:'Ping',phaseDownload:'Download',phaseUpload:'Upload',phaseResult:'Resultaat',unitMbps:'Mbit/s',waiting:'Wachten op meting',notMeasured:'Niet gemeten',networkIntelligence:'NETWERKINTELLIGENTIE',understand:'Begrijp je verbinding',intelligenceSub:'Fasqoo zet metingen om in praktische netwerkinformatie.',professional:'PROFESSIONEEL',latency:'Latentie',responseTime:'Reactietijd',stability:'Stabiliteit',jitterConsistency:'Jitter-consistentie',throughput:'Doorvoer',downloadCapacity:'Downloadcapaciteit',testServer:'Testserver',automaticEdge:'Automatische Edge-selectie',measurementReal:'Echte netwerkprestaties meten',measurementComplete:'Meting voltooid',measurementRetry:'Geen synthetische waarden gebruikt. Start opnieuw.',howMeasures:'HOE FASQOO MEET',transparent:'TRANSPARANT',methodTitle:'Hoe je verbinding wordt gemeten',methodSub:'Fasqoo meet de verbinding van je browser naar de meetinfrastructuur en rapporteert de waarden die daadwerkelijk worden ontvangen.',method1T:'Latentie & jitter',method1D:'Meerdere kleine verzoeken worden getimed. Ping is gebaseerd op de gemeten responstijden; jitter beschrijft de variatie tussen metingen.',method2T:'Download',method2D:'De browser downloadt gegevens van het test-eindpunt. Fasqoo berekent de doorvoer uit ontvangen bytes en verstreken tijd.',method3T:'Upload',method3D:'De browser verzendt gemeten payloads naar het test-eindpunt en berekent de doorvoer uit verzonden bytes en verstreken tijd.',method4T:'Waarom resultaten variëren',method4D:'Wi-Fi-signaal, apparaatbelasting, VPN\'s, ISP-congestie, routing en afstand tot de test-edge kunnen het resultaat beïnvloeden. Herhaal de test voor een duidelijker beeld.',methodNote:'Meetinfrastructuur: Cloudflare Speed Test-eindpunten. Fasqoo is een onafhankelijk speedtest-platform en geen officieel Cloudflare-product.'},
  tr:{eyebrow:'FASQOO AĞ ZEKÂSI',trust1:'Gerçek ölçüm – tahmin yok',trust2:'Ücretsiz ve hesapsız',liveTest:'CANLI BAĞLANTI TESTİ',readyPhase:'Hazır',phasePing:'Ping',phaseDownload:'İndirme',phaseUpload:'Yükleme',phaseResult:'Sonuç',unitMbps:'Mbit/s',waiting:'Ölçüm bekleniyor',notMeasured:'Ölçülmedi',networkIntelligence:'AĞ ZEKÂSI',understand:'Bağlantınızı anlayın',intelligenceSub:'Fasqoo ölçümleri pratik ağ bilgisine dönüştürür.',professional:'PROFESYONEL',latency:'Gecikme',responseTime:'Yanıt süresi',stability:'Kararlılık',jitterConsistency:'Jitter tutarlılığı',throughput:'Veri aktarımı',downloadCapacity:'İndirme kapasitesi',testServer:'Test sunucusu',automaticEdge:'Otomatik Edge',measurementReal:'Gerçek performans ölçülüyor',measurementComplete:'Ölçüm tamamlandı',measurementRetry:'Sentetik değer kullanılmadı. Tekrar deneyin.',howMeasures:'FASQOO NASIL ÖLÇER',transparent:'ŞEFFAF',methodTitle:'Bağlantınız nasıl ölçülür',methodSub:'Fasqoo, tarayıcınızdan ölçüm altyapısına olan bağlantıyı ölçer ve gerçekte alınan değerleri raporlar.',method1T:'Gecikme ve jitter',method1D:'Birden fazla küçük istek zamanlanır. Ping, ölçülen yanıt sürelerine dayanır; jitter ölçümler arasındaki değişimi ifade eder.',method2T:'İndirme',method2D:'Tarayıcı test uç noktasından veri indirir. Fasqoo, alınan baytlar ve geçen süreden veri hızını hesaplar.',method3T:'Yükleme',method3D:'Tarayıcı ölçülen yükleri test uç noktasına gönderir ve gönderilen baytlar ile geçen süreden veri hızını hesaplar.',method4T:'Sonuçlar neden değişir',method4D:'Wi-Fi sinyali, cihaz yükü, VPN\'ler, ISP yoğunluğu, yönlendirme ve test edge\'ine uzaklık sonucu değiştirebilir. Daha net bir tablo için testi tekrarlayın.',methodNote:'Ölçüm altyapısı: Cloudflare Speed Test uç noktaları. Fasqoo bağımsız bir hız testi platformudur ve resmi bir Cloudflare ürünü değildir.'},
  sq:{eyebrow:'INTELIGJENCA E RRJETIT FASQOO',trust1:'Matje e saktë – pa vlerësime',trust2:'Falas dhe pa llogari',liveTest:'TEST REAL I LIDHJES',readyPhase:'Gati',phasePing:'Ping',phaseDownload:'Shkarkim',phaseUpload:'Ngarkim',phaseResult:'Rezultat',unitMbps:'Mbit/s',waiting:'Në pritje të matjes',notMeasured:'Nuk është matur',networkIntelligence:'INTELIGJENCA E RRJETIT',understand:'Kupto lidhjen tënde',intelligenceSub:'Fasqoo i kthen matjet në informacione praktike.',professional:'PROFESIONAL',latency:'Vonesa',responseTime:'Koha e përgjigjes',stability:'Qëndrueshmëria',jitterConsistency:'Qëndrueshmëria e jitter-it',throughput:'Rrjedha',downloadCapacity:'Kapaciteti i shkarkimit',testServer:'Serveri i testit',automaticEdge:'Zgjedhje automatike',measurementReal:'Po matet performanca reale',measurementComplete:'Matja përfundoi',measurementRetry:'Asnjë vlerë sintetike. Provo përsëri.',howMeasures:'SI MAT FASQOO',transparent:'TRANSPARENTE',methodTitle:'Si matet lidhja jote',methodSub:'Fasqoo mat lidhjen nga shfletuesi yt deri te infrastruktura e matjes dhe raporton vlerat që merren realisht.',method1T:'Vonesa & jitter',method1D:'Disa kërkesa të vogla maten me kohë. Ping-u bazohet në kohët e matura të përgjigjes; jitter-i përshkruan variacionin midis matjeve.',method2T:'Shkarkim',method2D:'Shfletuesi shkarkon të dhëna nga endpoint-i i testit. Fasqoo llogarit rrjedhën nga bajtët e marrë dhe koha e kaluar.',method3T:'Ngarkim',method3D:'Shfletuesi dërgon ngarkesa të matura në endpoint-in e testit dhe llogarit rrjedhën nga bajtët e dërguar dhe koha e kaluar.',method4T:'Pse rezultatet ndryshojnë',method4D:'Sinjali Wi-Fi, ngarkesa e pajisjes, VPN-të, mbingarkesa e ISP-së, rrugëtimi dhe distanca deri te test edge mund të ndryshojnë rezultatin. Përsërit testin për një pamje më të qartë.',methodNote:'Infrastruktura e matjes: endpoint-e Cloudflare Speed Test. Fasqoo është platformë e pavarur e testimit të shpejtësisë dhe nuk është produkt zyrtar i Cloudflare.'},
  ar:{eyebrow:'ذكاء شبكة FASQOO',trust1:'قياس حقيقي — بدون تقديرات',trust2:'مجاني وبدون حساب',liveTest:'اختبار اتصال مباشر',readyPhase:'جاهز',phasePing:'Ping',phaseDownload:'تنزيل',phaseUpload:'رفع',phaseResult:'النتيجة',unitMbps:'ميغابت/ث',waiting:'بانتظار القياس',notMeasured:'لم يتم القياس',networkIntelligence:'ذكاء الشبكة',understand:'افهم اتصالك',intelligenceSub:'تحوّل Fasqoo قياساتك إلى معلومات عملية.',professional:'احترافي',latency:'زمن الاستجابة',responseTime:'وقت الاستجابة',stability:'الاستقرار',jitterConsistency:'اتساق Jitter',throughput:'معدل النقل',downloadCapacity:'سعة التنزيل',testServer:'خادم الاختبار',automaticEdge:'اختيار Edge تلقائيًا',measurementReal:'جارٍ قياس أداء الشبكة الحقيقي',measurementComplete:'اكتمل القياس',measurementRetry:'لم يتم استخدام قيمة صناعية. أعد الاختبار.',howMeasures:'كيف تقيس FASQOO',transparent:'شفاف',methodTitle:'كيف يتم قياس اتصالك',methodSub:'تقيس Fasqoo الاتصال من متصفحك إلى البنية التحتية للقياس وتُبلّغ عن القيم التي يتم استلامها فعليًا.',method1T:'زمن الاستجابة و Jitter',method1D:'يتم توقيت عدة طلبات صغيرة. يعتمد Ping على أزمنة الاستجابة المقاسة؛ يصف Jitter التباين بين القياسات.',method2T:'تنزيل',method2D:'يقوم المتصفح بتنزيل البيانات من نقطة اختبار. تحسب Fasqoo معدل النقل من البايتات المستلمة والوقت المنقضي.',method3T:'رفع',method3D:'يرسل المتصفح حمولات مقاسة إلى نقطة الاختبار ويحسب معدل النقل من البايتات المرسلة والوقت المنقضي.',method4T:'لماذا تختلف النتائج',method4D:'قد تغيّر إشارة Wi-Fi وحمل الجهاز وشبكات VPN وازدحام مزود الخدمة والتوجيه والمسافة إلى نقطة الاختبار النتيجة. أعد الاختبار للحصول على صورة أوضح.',methodNote:'البنية التحتية للقياس: نقاط Cloudflare Speed Test. Fasqoo منصة اختبار سرعة مستقلة وليست منتجًا رسميًا من Cloudflare.'}
};

const metricTranslations = {
  en:{packetLoss:"Packet Loss",bufferbloat:"Bufferbloat",bbGradeA:"A · Excellent",bbGradeB:"B · Good",bbGradeC:"C · Fair",bbGradeD:"D · Poor"},
  de:{packetLoss:"Paketverlust",bufferbloat:"Bufferbloat",bbGradeA:"A · Hervorragend",bbGradeB:"B · Gut",bbGradeC:"C · Mäßig",bbGradeD:"D · Schlecht"},
  fr:{packetLoss:"Perte de paquets",bufferbloat:"Bufferbloat",bbGradeA:"A · Excellent",bbGradeB:"B · Bon",bbGradeC:"C · Moyen",bbGradeD:"D · Faible"},
  es:{packetLoss:"Pérdida de paquetes",bufferbloat:"Bufferbloat",bbGradeA:"A · Excelente",bbGradeB:"B · Bueno",bbGradeC:"C · Aceptable",bbGradeD:"D · Malo"},
  it:{packetLoss:"Perdita pacchetti",bufferbloat:"Bufferbloat",bbGradeA:"A · Eccellente",bbGradeB:"B · Buono",bbGradeC:"C · Discreto",bbGradeD:"D · Scarso"},
  pt:{packetLoss:"Perda de pacotes",bufferbloat:"Bufferbloat",bbGradeA:"A · Excelente",bbGradeB:"B · Bom",bbGradeC:"C · Razoável",bbGradeD:"D · Fraco"},
  nl:{packetLoss:"Pakketverlies",bufferbloat:"Bufferbloat",bbGradeA:"A · Uitstekend",bbGradeB:"B · Goed",bbGradeC:"C · Redelijk",bbGradeD:"D · Slecht"},
  tr:{packetLoss:"Paket Kaybı",bufferbloat:"Bufferbloat",bbGradeA:"A · Mükemmel",bbGradeB:"B · İyi",bbGradeC:"C · Orta",bbGradeD:"D · Zayıf"},
  sq:{packetLoss:"Humbje paketash",bufferbloat:"Bufferbloat",bbGradeA:"A · Shkëlqyeshëm",bbGradeB:"B · Mirë",bbGradeC:"C · Mesatar",bbGradeD:"D · Dobët"},
  ar:{packetLoss:"فقدان الحزم",bufferbloat:"Bufferbloat",bbGradeA:"A · ممتاز",bbGradeB:"B · جيد",bbGradeC:"C · مقبول",bbGradeD:"D · ضعيف"}
};

const installTranslations = {
  en:{installApp:"Install App",browserHint:"App installation is available in a supported desktop browser via the install icon or browser menu."},
  de:{installApp:"App installieren",browserHint:"Die App-Installation ist in einem unterstützten Desktop-Browser über das Installationssymbol oder das Browsermenü verfügbar."},
  fr:{installApp:"Installer l’application",browserHint:"L’installation est disponible dans un navigateur de bureau compatible via l’icône d’installation ou le menu du navigateur."},
  es:{installApp:"Instalar aplicación",browserHint:"La instalación está disponible en un navegador de escritorio compatible mediante el icono de instalación o el menú del navegador."},
  it:{installApp:"Installa app",browserHint:"L’installazione è disponibile in un browser desktop compatibile tramite l’icona di installazione o il menu del browser."},
  pt:{installApp:"Instalar aplicação",browserHint:"A instalação está disponível num navegador de computador compatível através do ícone de instalação ou do menu do navegador."},
  nl:{installApp:"App installeren",browserHint:"Installatie is beschikbaar in een ondersteunde desktopbrowser via het installatiepictogram of browsermenu."},
  tr:{installApp:"Uygulamayı yükle",browserHint:"Kurulum, desteklenen bir masaüstü tarayıcıda yükleme simgesi veya tarayıcı menüsü üzerinden kullanılabilir."},
  sq:{installApp:"Instalo aplikacionin",browserHint:"Instalimi është i disponueshëm në një shfletues desktop të mbështetur përmes ikonës së instalimit ose menysë së shfletuesit."},
  ar:{installApp:"تثبيت التطبيق",browserHint:"يتوفر تثبيت التطبيق في متصفح سطح مكتب مدعوم عبر رمز التثبيت أو قائمة المتصفح."}
};

const staticUiTranslations = {
  en:{widgetTitle:"Fasqoo Speed Widget",widgetLive:"Live result",widgetDownload:"Mbps download",widgetRun:"Run speed test",providerLabel:"Provider"},
  de:{widgetTitle:"Fasqoo Speed-Widget",widgetLive:"Live-Ergebnis",widgetDownload:"Mbps Download",widgetRun:"Speedtest starten",providerLabel:"Anbieter"},
  fr:{widgetTitle:"Widget de vitesse Fasqoo",widgetLive:"Résultat en direct",widgetDownload:"Téléchargement en Mbps",widgetRun:"Lancer le test",providerLabel:"Fournisseur"},
  es:{widgetTitle:"Widget de velocidad Fasqoo",widgetLive:"Resultado en directo",widgetDownload:"Descarga en Mbps",widgetRun:"Iniciar prueba",providerLabel:"Proveedor"},
  it:{widgetTitle:"Widget velocità Fasqoo",widgetLive:"Risultato in tempo reale",widgetDownload:"Download in Mbps",widgetRun:"Avvia test",providerLabel:"Provider"},
  pt:{widgetTitle:"Widget de velocidade Fasqoo",widgetLive:"Resultado em direto",widgetDownload:"Download em Mbps",widgetRun:"Iniciar teste",providerLabel:"Fornecedor"},
  nl:{widgetTitle:"Fasqoo-snelheidswidget",widgetLive:"Live resultaat",widgetDownload:"Mbps download",widgetRun:"Snelheidstest starten",providerLabel:"Provider"},
  tr:{widgetTitle:"Fasqoo Hız Widget'ı",widgetLive:"Canlı sonuç",widgetDownload:"Mbps indirme",widgetRun:"Hız testini başlat",providerLabel:"Sağlayıcı"},
  sq:{widgetTitle:"Widget-i i shpejtësisë Fasqoo",widgetLive:"Rezultat në kohë reale",widgetDownload:"Shkarkim në Mbps",widgetRun:"Fillo testin",providerLabel:"Ofruesi"},
  ar:{widgetTitle:"أداة سرعة Fasqoo",widgetLive:"النتيجة المباشرة",widgetDownload:"التنزيل بالميغابت/ث",widgetRun:"بدء اختبار السرعة",providerLabel:"مزود الخدمة"}
};

let lastBloatMs = null;
let running = false, samples = [], info = {}, last = {}, currentLang = "en", gaugeMax = 100;
const SPEED_BASE = "https://speed.cloudflare.com";

function tx(key){
  return (metricTranslations[currentLang] && metricTranslations[currentLang][key])
      || metricTranslations.en[key] || key;
}

/* ---------- MENU ---------- */
$("menuToggle").addEventListener("click", () => {
  const open = $("mainMenu").classList.toggle("active");
  $("menuToggle").setAttribute("aria-expanded", String(open));
});
document.querySelectorAll(".main-menu > a").forEach(a => a.addEventListener("click", () => {
  $("mainMenu").classList.remove("active");
  $("menuToggle").setAttribute("aria-expanded","false");
  toolsDropdown.classList.remove("open");
  toolsToggle.setAttribute("aria-expanded","false");
}));
const toolsDropdown = $("toolsDropdown");
const toolsToggle = toolsDropdown.querySelector(".nav-dropdown-toggle");
toolsToggle.addEventListener("click", e => {
  e.stopPropagation();
  const open = toolsDropdown.classList.toggle("open");
  toolsToggle.setAttribute("aria-expanded", String(open));
});
toolsDropdown.querySelectorAll(".nav-dropdown-menu a").forEach(a => a.addEventListener("click", () => {
  toolsDropdown.classList.remove("open");
  toolsToggle.setAttribute("aria-expanded","false");
  $("mainMenu").classList.remove("active");
  $("menuToggle").setAttribute("aria-expanded","false");
}));
document.addEventListener("click", e => {
  if(!toolsDropdown.contains(e.target)){
    toolsDropdown.classList.remove("open");
    toolsToggle.setAttribute("aria-expanded","false");
  }
});

/* ---------- APPLICATION PROFILES (8 tiles, SVG) ---------- */
const APP_KEYS = ["gaming","stream","fourk","call","office","cloud","social","web"];

function appIcon(key){
  const S = 'xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" ' +
            'stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"';
  const icons = {
    gaming:
      '<svg '+S+'><line x1="6" y1="11" x2="10" y2="11"/><line x1="8" y1="9" x2="8" y2="13"/>'+
      '<circle cx="15.5" cy="10.5" r="0.9" fill="currentColor" stroke="none"/>'+
      '<circle cx="17.5" cy="12.5" r="0.9" fill="currentColor" stroke="none"/>'+
      '<path d="M3.5 15.5c-.7-2-.7-4.3 0-6.3A3.4 3.4 0 0 1 7 7h10a3.4 3.4 0 0 1 3.5 2.2c.7 2 .7 4.3 0 6.3A3.4 3.4 0 0 1 17 18H7a3.4 3.4 0 0 1-3.5-2.5Z"/></svg>',
    stream:
      '<svg '+S+'><circle cx="12" cy="12" r="2.2" fill="currentColor" stroke="none"/>'+
      '<path d="M8.4 8.4a5 5 0 0 0 0 7.2"/><path d="M15.6 15.6a5 5 0 0 0 0-7.2"/>'+
      '<path d="M5.6 5.6a9 9 0 0 0 0 12.8"/><path d="M18.4 18.4a9 9 0 0 0 0-12.8"/></svg>',
    fourk:
      '<svg '+S+'><rect x="2.5" y="4" width="19" height="13" rx="2"/>'+
      '<path d="M8 21h8"/><path d="M12 17v4"/>'+
      '<text x="12" y="12.6" font-family="Inter, sans-serif" font-size="6" font-weight="800" '+
      'fill="currentColor" stroke="none" text-anchor="middle">4K</text></svg>',
    call:
      '<svg '+S+'><rect x="2.5" y="6" width="13" height="12" rx="2.2"/>'+
      '<path d="M15.5 11.2 21 8v8l-5.5-3.2Z"/></svg>',
    office:
      '<svg '+S+'><rect x="4" y="5" width="16" height="11" rx="1.8"/>'+
      '<path d="M2 19h20"/><path d="M9 16v3"/><path d="M15 16v3"/></svg>',
    cloud:
      '<svg '+S+'><path d="M7 18a4 4 0 0 1-.6-7.96A5.5 5.5 0 0 1 17 9.5a3.75 3.75 0 0 1 .5 7.5H7Z"/>'+
      '<path d="M12 15v-3.4"/><path d="M10.4 12.6 12 11l1.6 1.6"/></svg>',
    social:
      '<svg '+S+'><path d="M4 5.5A2.5 2.5 0 0 1 6.5 3h11A2.5 2.5 0 0 1 20 5.5v8A2.5 2.5 0 0 1 17.5 16H9l-4.2 3.6A.6.6 0 0 1 4 19.1V5.5Z"/>'+
      '<path d="M12 12.2c-1.9-1.4-3.3-2.4-3.3-3.9A1.6 1.6 0 0 1 12 7.4a1.6 1.6 0 0 1 3.3.9c0 1.5-1.4 2.5-3.3 3.9Z" '+
      'fill="currentColor" stroke="none"/></svg>',
    web:
      '<svg '+S+'><circle cx="12" cy="12" r="9"/>'+
      '<path d="M3 12h18"/>'+
      '<path d="M12 3c2.6 2.7 4 5.7 4 9s-1.4 6.3-4 9c-2.6-2.7-4-5.7-4-9s1.4-6.3 4-9Z"/></svg>'
  };
  return icons[key] || '';
}

const APP_META = {
  gaming:{title:{en:"Online Gaming",de:"Online-Gaming",fr:"Jeux en ligne",es:"Juegos online",it:"Gaming online",pt:"Jogos online",nl:"Online gamen",tr:"Çevrimiçi oyun",sq:"Lojëra online",ar:"ألعاب عبر الإنترنت"},desc:{en:"Low ping, low jitter, no lag spikes.",de:"Niedriger Ping, wenig Jitter, keine Lag-Spikes.",fr:"Ping et jitter bas, pas de lag.",es:"Ping y jitter bajos, sin lag.",it:"Ping e jitter bassi, niente lag.",pt:"Ping e jitter baixos, sem lag.",nl:"Lage ping, lage jitter, geen lag.",tr:"Düşük ping, düşük jitter, gecikme yok.",sq:"Ping i ulët, jitter i ulët, pa vonesa.",ar:"بينغ منخفض، بدون تأخير."}},
  stream:{title:{en:"Live Streaming",de:"Live-Streaming",fr:"Streaming en direct",es:"Streaming en vivo",it:"Streaming live",pt:"Streaming ao vivo",nl:"Live streamen",tr:"Canlı yayın",sq:"Transmetim live",ar:"البث المباشر"},desc:{en:"Smooth HD/4K streaming without buffering.",de:"Flüssiges HD/4K-Streaming ohne Puffern.",fr:"Streaming HD/4K fluide sans mise en mémoire.",es:"Streaming HD/4K fluido sin buffering.",it:"Streaming HD/4K fluido senza buffering.",pt:"Streaming HD/4K fluido sem buffering.",nl:"Vloeiend HD/4K streamen zonder bufferen.",tr:"Arabelleksiz akıcı HD/4K yayın.",sq:"Streaming HD/4K pa ndërprerje.",ar:"بث سلس بدقة HD/4K."}},
  fourk:{title:{en:"4K Ultra HD",de:"4K Ultra HD",fr:"4K Ultra HD",es:"4K Ultra HD",it:"4K Ultra HD",pt:"4K Ultra HD",nl:"4K Ultra HD",tr:"4K Ultra HD",sq:"4K Ultra HD",ar:"4K فائق الدقة"},desc:{en:"Streaming without buffering or drops.",de:"Streaming ohne Puffern oder Aussetzer.",fr:"Streaming sans mise en mémoire tampon.",es:"Streaming sin buffering.",it:"Streaming senza buffering.",pt:"Streaming sem buffering.",nl:"Streamen zonder bufferen.",tr:"Takılmadan yayın.",sq:"Streaming pa ndërprerje.",ar:"بث بدون توقف."}},
  call:{title:{en:"Video Calls",de:"Videoanrufe",fr:"Appels vidéo",es:"Videollamadas",it:"Videochiamate",pt:"Videochamadas",nl:"Videobellen",tr:"Görüntülü arama",sq:"Thirrje video",ar:"مكالمات الفيديو"},desc:{en:"Smooth video conferencing with low lag.",de:"Flüssige Videokonferenzen mit niedriger Latenz.",fr:"Visioconférence fluide avec faible latence.",es:"Videoconferencias fluidas con baja latencia.",it:"Videoconferenze fluide con bassa latenza.",pt:"Videoconferências fluidas com baixa latência.",nl:"Vloeiende videoconferenties met lage latentie.",tr:"Düşük gecikmeli görüntülü görüşme.",sq:"Videokonferenca të qeta me vonesë të ulët.",ar:"مكالمات فيديو سلسة بتأخير منخفض."}},
  office:{title:{en:"Home Office",de:"Homeoffice",fr:"Télétravail",es:"Teletrabajo",it:"Smart working",pt:"Teletrabalho",nl:"Thuiswerken",tr:"Evden çalışma",sq:"Punë nga shtëpia",ar:"العمل من المنزل"},desc:{en:"Video calls, VPN, cloud apps.",de:"Videocalls, VPN, Cloud-Apps.",fr:"Visio, VPN, cloud.",es:"Videollamadas, VPN, nube.",it:"Videochiamate, VPN, cloud.",pt:"Videochamadas, VPN, cloud.",nl:"Videobellen, VPN, cloud.",tr:"Görüntülü görüşme, VPN, bulut.",sq:"Thirrje video, VPN, cloud.",ar:"مكالمات الفيديو، VPN، السحابة."}},
  cloud:{title:{en:"Cloud & Backup",de:"Cloud & Backup",fr:"Cloud & sauvegarde",es:"Nube y copias",it:"Cloud e backup",pt:"Cloud e backup",nl:"Cloud & back-up",tr:"Bulut ve yedek",sq:"Cloud & backup",ar:"السحابة والنسخ الاحتياطي"},desc:{en:"Fast uploads for cloud services and backups.",de:"Schnelle Uploads für Cloud-Dienste und Backups.",fr:"Envois rapides vers le cloud.",es:"Subidas rápidas a la nube.",it:"Upload rapidi verso il cloud.",pt:"Uploads rápidos para a nuvem.",nl:"Snelle uploads naar de cloud.",tr:"Bulut ve yedeklemeler için hızlı yükleme.",sq:"Ngarkime të shpejta për cloud.",ar:"رفع سريع للخدمات السحابية."}},
  social:{title:{en:"Web & Social",de:"Web & Social",fr:"Web & réseaux",es:"Web y redes",it:"Web e social",pt:"Web e redes",nl:"Web & social",tr:"Web ve sosyal",sq:"Web & sociale",ar:"الويب والتواصل"},desc:{en:"Fast browsing, reels, stories.",de:"Schnelles Surfen, Reels, Stories.",fr:"Navigation rapide, reels, stories.",es:"Navegación rápida, reels, stories.",it:"Navigazione veloce, reel, storie.",pt:"Navegação rápida, reels, stories.",nl:"Snel browsen, reels, stories.",tr:"Hızlı gezinme, reels, hikayeler.",sq:"Shfletim i shpejtë, reels, stories.",ar:"تصفح سريع، ريلز، ستوريز."}},
  web:{title:{en:"Web Browsing",de:"Web-Surfen",fr:"Navigation web",es:"Navegación web",it:"Navigazione web",pt:"Navegação web",nl:"Web browsen",tr:"Web gezinme",sq:"Shfletim web",ar:"تصفح الويب"},desc:{en:"Fast page loads and downloads.",de:"Schnelle Seitenladezeiten und Downloads.",fr:"Chargements et téléchargements rapides.",es:"Cargas y descargas rápidas.",it:"Caricamenti e download rapidi.",pt:"Carregamentos e downloads rápidos.",nl:"Snelle pagina's en downloads.",tr:"Hızlı sayfa yükleme ve indirme.",sq:"Ngarkim i shpejtë i faqeve.",ar:"تحميل صفحات سريع."}}
};

const APP_STATUS_TEXT = {
  pass:{en:"Perfect",de:"Perfekt",fr:"Parfait",es:"Perfecto",it:"Perfetto",pt:"Perfeito",nl:"Perfect",tr:"Mükemmel",sq:"Perfekt",ar:"ممتاز"},
  ok:{en:"Usable",de:"Nutzbar",fr:"Utilisable",es:"Utilizable",it:"Utilizzabile",pt:"Utilizável",nl:"Bruikbaar",tr:"Kullanılabilir",sq:"I përdorshëm",ar:"قابل للاستخدام"},
  fail:{en:"Not recommended",de:"Nicht empfohlen",fr:"Non recommandé",es:"No recomendado",it:"Non consigliato",pt:"Não recomendado",nl:"Niet aanbevolen",tr:"Önerilmez",sq:"Nuk rekomandohet",ar:"غير مُوصى به"}
};

function buildAppCards(){
  const container = $("appsContainer");
  if(!container) return;
  container.innerHTML = "";
  APP_KEYS.forEach(k => {
    const meta = APP_META[k];
    if(!meta) return;
    const card = document.createElement("div");
    card.className = "app-profile";
    card.dataset.appKey = k;
    card.innerHTML =
      '<div class="app-emoji" aria-hidden="true">'+appIcon(k)+'</div>'+
      '<h3 data-app-title="'+k+'"></h3>'+
      '<p data-app-desc="'+k+'"></p>'+
      '<div class="app-verdict"><span class="mark">•</span><span class="vtxt">Waiting…</span></div>';
    container.appendChild(card);
  });
}

/* ---------- CHART ---------- */
const canvas = $("chart");
const ctx = canvas.getContext("2d");
function resizeCanvas(){
  const r = canvas.getBoundingClientRect();
  const d = window.devicePixelRatio || 1;
  canvas.width = r.width * d; canvas.height = r.height * d;
  ctx.setTransform(d,0,0,d,0,0);
  drawChart();
}
function drawChart(){
  if(!canvas || !canvas.clientWidth) return;
  const w = canvas.clientWidth, h = canvas.clientHeight;
  ctx.clearRect(0,0,w,h);
  const isDark = document.body.classList.contains("dark");
  const gridColor = isDark ? "#2b3037" : "#edf1f5";
  const scaleColor = isDark ? "#6b7280" : "#9aa1ab";
  ctx.strokeStyle = gridColor;
  ctx.lineWidth = 1;
  for(let i=1;i<5;i++){ const y=i*h/5; ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(w,y); ctx.stroke(); }
  const max = Math.max(100, ...samples);
  ctx.fillStyle = scaleColor;
  ctx.font = "10px Inter, system-ui, sans-serif";
  ctx.textAlign = "right";
  ctx.textBaseline = "top";
  ctx.fillText(max.toFixed(0) + " Mbps", w - 6, 6);
  if(samples.length < 2) return;
  const pts = samples.map((v,i) => ({ x: i*w/(samples.length-1), y: h-12-v/max*(h-24) }));
  ctx.beginPath();
  pts.forEach((p,i) => i===0 ? ctx.moveTo(p.x,p.y) : ctx.lineTo(p.x,p.y));
  ctx.lineTo(w, h); ctx.lineTo(0, h); ctx.closePath();
  const fillGrad = ctx.createLinearGradient(0,0,0,h);
  fillGrad.addColorStop(0, "rgba(37,99,235,.22)");
  fillGrad.addColorStop(1, "rgba(37,99,235,0)");
  ctx.fillStyle = fillGrad; ctx.fill();
  ctx.beginPath();
  pts.forEach((p,i) => i===0 ? ctx.moveTo(p.x,p.y) : ctx.lineTo(p.x,p.y));
  const lineGrad = ctx.createLinearGradient(0,0,0,h);
  lineGrad.addColorStop(0, "#2563eb");
  lineGrad.addColorStop(1, "rgba(37,99,235,.35)");
  ctx.strokeStyle = lineGrad; ctx.lineWidth = 2.5;
  ctx.lineJoin = "round"; ctx.lineCap = "round";
  ctx.shadowColor = "rgba(37,99,235,.45)"; ctx.shadowBlur = 8;
  ctx.stroke(); ctx.shadowBlur = 0;
}
window.addEventListener("resize", resizeCanvas);

/* ---------- THEME ---------- */
function applyTheme(dark){
  document.body.classList.toggle("dark", dark);
  $("themeBtn").textContent = dark ? "☀" : "☾";
  const tc = $("themeColor");
  if(tc) tc.setAttribute("content", dark ? "#090c10" : "#ffffff");
  localStorage.setItem("fasqoo_dark", dark);
  drawChart();
}
$("themeBtn").addEventListener("click", () => applyTheme(!document.body.classList.contains("dark")));

/* ---------- GAUGE ---------- */
function getGaugeMax(v){ return v<=100?100:v<=300?300:v<=500?500:v<=1000?1000:v<=2500?2500:v<=5000?5000:10000; }
let gaugeNumberRaf = 0;
let gaugeNumberDisplay = 0;
let gaugeNumberTarget = 0;
function animateGaugeNumber(){
  const diff = gaugeNumberTarget - gaugeNumberDisplay;
  if(Math.abs(diff) < 0.03){ gaugeNumberDisplay = gaugeNumberTarget; gaugeNumberRaf = 0; }
  else{ gaugeNumberDisplay += diff * (1 - Math.exp(-0.11)); gaugeNumberRaf = requestAnimationFrame(animateGaugeNumber); }
  const n = gaugeNumberDisplay;
  $("speed").textContent = n < 10 ? n.toFixed(1) : Math.round(n);
}
function gauge(v){
  if(!Number.isFinite(v)) return;
  gaugeMax = Math.max(gaugeMax, getGaugeMax(v));
  const p = Math.max(0, Math.min(v/gaugeMax, 1));
  const c = 816, vis = c*.75;
  $("prog").style.strokeDashoffset = c - vis*p;
  gaugeNumberTarget = v;
  if(!gaugeNumberRaf) gaugeNumberRaf = requestAnimationFrame(animateGaugeNumber);
}
function resetGauge(){
  gaugeMax = 100; samples = [];
  gaugeNumberTarget = 0; gaugeNumberDisplay = 0;
  if(gaugeNumberRaf){ cancelAnimationFrame(gaugeNumberRaf); gaugeNumberRaf = 0; }
  $("speed").textContent = "0";
  gauge(0);
  drawChart();
}

/* ---------- NETWORK INFO ---------- */
async function netinfo(){
  const t = translations[currentLang];
  try{
    const r = await fetch("https://ipwho.is/", {cache:"no-store"});
    const d = await r.json();
    if(!d.success) throw 0;
    info = d;
    if(!localStorage.getItem("fasqoo_lang") && d.country_code){
      window.dispatchEvent(new CustomEvent("fasqoo-country-detected", {detail:d.country_code}));
    }
    $("ip").textContent = d.ip || t.unavail;
    $("isp").textContent = (d.connection && (d.connection.isp || d.connection.org)) || t.unavail;
    $("loc").textContent = [d.city, d.region, d.country].filter(Boolean).join(", ") || t.unavail;
    $("asn").textContent = (d.connection && d.connection.asn ? "AS"+d.connection.asn+" · " : "") + ((d.connection && d.connection.org) || t.unavail);
    if(d.type === "IPv4"){ $("ipv4").textContent = d.ip; $("ipv6").textContent = t.notDetected; }
    if(d.type === "IPv6"){ $("ipv6").textContent = d.ip; $("ipv4").textContent = t.notDetected; }
  }catch(e){
    ["ip","isp","loc","asn"].forEach(id => $(id).textContent = t.unavail);
  }
}
function measureDns(){
  try{
    const e = performance.getEntriesByType("resource").filter(x => x.name.includes("speed.cloudflare.com") && x.domainLookupEnd>0);
    if(!e.length){ $("dns").textContent = "n/v"; return; }
    const dnsMs = e[e.length-1].domainLookupEnd - e[e.length-1].domainLookupStart;
    $("dns").textContent = dnsMs>0 ? dnsMs.toFixed(1)+" ms" : "< 1 ms";
  }catch(e){ $("dns").textContent = "n/v"; }
}

/* ---------- TIMEOUT ---------- */
function testTimeout(ms){
  const c = new AbortController();
  const t = setTimeout(()=>c.abort(), ms);
  return {signal:c.signal, clear:()=>clearTimeout(t)};
}

/* ---------- MEASUREMENT ENGINE ---------- */
const MEASUREMENT_V7 = { version: "8.1", phaseMs: 8000, maxStreams: 8 };

function percentile(values, q){
  if(!values.length) return NaN;
  const a=[...values].sort((x,y)=>x-y);
  const pos=(a.length-1)*q;
  const lo=Math.floor(pos), hi=Math.ceil(pos);
  return lo===hi ? a[lo] : a[lo] + (a[hi]-a[lo])*(pos-lo);
}
function robustMedian(values){ return percentile(values,0.5); }
function chooseStreams(mbps, max = MEASUREMENT_V7.maxStreams){
  if(mbps >= 2500) return Math.min(8, max);
  if(mbps >= 1000) return Math.min(6, max);
  if(mbps >= 300)  return Math.min(5, max);
  if(mbps >= 100)  return Math.min(4, max);
  if(mbps >= 25)   return Math.min(3, max);
  return 2;
}
function clampNumber(v,min,max){ return Math.max(min,Math.min(max,v)); }

/* ---------- COLOR LOGIC ---------- */
function colorPing(v){ return v<=15?"val-good":v<=50?"val-medium":"val-bad"; }
function colorJitter(v){ return v<=5?"val-good":v<=15?"val-medium":"val-bad"; }
function colorDownload(v){ return v>=100?"val-good":v>=25?"val-medium":"val-bad"; }
function colorUpload(v){ return v>=20?"val-good":v>=5?"val-medium":"val-bad"; }
function colorLoss(v){ return v<0.5?"val-good":v<2.5?"val-medium":"val-bad"; }

function setMeasuring(id){
  const el=$(id); if(!el) return;
  el.classList.remove("val-good","val-medium","val-bad");
  el.classList.add("val-measuring");
}
function setFinal(id, cls){
  const el=$(id); if(!el) return;
  el.classList.remove("val-measuring");
  if(cls) el.classList.add(cls);
}

/* ---------- TICKER ---------- */
const _tickers = new WeakMap();
function tickValue(el, target, opts = {}){
  if(!el) return;
  const decimals = opts.decimals ?? 1;
  const duration = opts.duration ?? 550;
  const from     = Number(el.dataset.numericValue || "0") || 0;
  const to       = Number(target);
  if(!Number.isFinite(to)) return;
  if(_tickers.has(el)) cancelAnimationFrame(_tickers.get(el));
  const startTime = performance.now();
  function frame(now){
    const t = Math.min(1, (now - startTime) / duration);
    const eased = 1 - Math.pow(1 - t, 3);
    const v = from + (to - from) * eased;
    el.textContent = (decimals === 0 ? Math.round(v) : v.toFixed(decimals));
    el.dataset.numericValue = String(v);
    if(t < 1){ _tickers.set(el, requestAnimationFrame(frame)); }
    else{
      el.textContent = (decimals === 0 ? Math.round(to) : to.toFixed(decimals));
      el.dataset.numericValue = String(to);
      _tickers.delete(el);
    }
  }
  _tickers.set(el, requestAnimationFrame(frame));
}

/* ---------- PULSE ---------- */
let pulseTimer = null;
function pulseOnce(ms){
  const icon = document.getElementById("pingIcon");
  if(!icon) return;
  const dur = Math.max(300, Math.min(900, ms * 12));
  icon.style.animationDuration = dur + "ms";
  icon.classList.remove("pulse-sync");
  void icon.offsetWidth;
  icon.classList.add("pulse-sync");
  if(pulseTimer) clearTimeout(pulseTimer);
  pulseTimer = setTimeout(() => { icon.classList.remove("pulse-sync"); pulseTimer = null; }, dur + 50);
}
function stopPingPulse(){
  const icon = document.getElementById("pingIcon");
  if(!icon) return;
  if(pulseTimer){ clearTimeout(pulseTimer); pulseTimer = null; }
  icon.classList.remove("pulse-sync");
  icon.style.animationDuration = "";
}

/* ---------- BUFFERBLOAT ---------- */
function displayBufferbloat(bloatMs){
  lastBloatMs = bloatMs;
  const el = $("bloat"), gradeEl = $("bloatGrade");
  if(!el) return;
  if(!Number.isFinite(bloatMs)){
    el.textContent = "—"; el.dataset.numericValue = "0";
    el.classList.remove("val-good","val-medium","val-bad","val-measuring");
    if(gradeEl) gradeEl.textContent = "";
    return;
  }
  tickValue(el, bloatMs, {decimals:0, duration:700});
  let cls, gradeKey;
  if(bloatMs < 30){ cls="val-good"; gradeKey="bbGradeA"; }
  else if(bloatMs < 60){ cls="val-good"; gradeKey="bbGradeB"; }
  else if(bloatMs < 200){ cls="val-medium"; gradeKey="bbGradeC"; }
  else { cls="val-bad"; gradeKey="bbGradeD"; }
  setFinal("bloat", cls);
  if(gradeEl) gradeEl.textContent = tx(gradeKey);
}

/* ---------- GRADE ---------- */
function computeGrade(bloat, ping, jitter, down, up){
  const b = Number.isFinite(bloat) ? bloat : (ping > 200 ? 400 : ping > 120 ? 220 : ping > 60 ? 90 : 30);
  let score;
  if(b < 15) score = 100; else if(b < 30) score = 95; else if(b < 50) score = 88;
  else if(b < 80) score = 80; else if(b < 120) score = 72; else if(b < 200) score = 60;
  else if(b < 400) score = 45; else score = 30;
  if(ping > 60) score -= 10; if(ping > 120) score -= 10;
  if(jitter > 20) score -= 5; if(jitter > 40) score -= 5;
  if(down < 25) score -= 8; if(down < 5) score -= 12; if(up < 5) score -= 5;
  if(down >= 200 && up >= 30 && ping < 15 && jitter < 5 && b < 20) score = 100;
  if(score >= 98) return {letter:"A+", tier:"excellent", score};
  if(score >= 92) return {letter:"A",  tier:"excellent", score};
  if(score >= 85) return {letter:"A-", tier:"excellent", score};
  if(score >= 78) return {letter:"B+", tier:"good",      score};
  if(score >= 71) return {letter:"B",  tier:"good",      score};
  if(score >= 64) return {letter:"B-", tier:"good",      score};
  if(score >= 56) return {letter:"C+", tier:"medium",    score};
  if(score >= 48) return {letter:"C",  tier:"medium",    score};
  if(score >= 40) return {letter:"C-", tier:"medium",    score};
  if(score >= 30) return {letter:"D",  tier:"bad",       score};
  if(score >= 20) return {letter:"D-", tier:"bad",       score};
  return {letter:"F", tier:"bad", score};
}
function showGrade(bloat, ping, jitter, down, up){
  const badge = $("gradeBadge"), sub = $("gradeSub");
  if(!badge) return;
  const g = computeGrade(bloat, ping, jitter, down, up);
  badge.textContent = g.letter;
  badge.classList.remove("tier-excellent","tier-good","tier-medium","tier-bad");
  badge.classList.add("tier-"+g.tier);
  if(sub){
    const t = translations[currentLang];
    const bloatTxt = Number.isFinite(bloat) ? Math.round(bloat)+" ms bufferbloat" : "bufferbloat n/a";
    sub.textContent = (g.tier==="excellent" ? t.stExc : g.tier==="good" ? t.stGood : g.tier==="medium" ? t.stLim : t.q0) + " · " + bloatTxt;
  }
}

/* ---------- PING ---------- */
async function pingTest(opts = {}){
  const onSample = opts.onSample || (()=>{});
  const vals = [];
  const MAX_ATTEMPTS = 10;
  let attempts = 0;
  for(let i=0; i<MAX_ATTEMPTS && running; i++){
    attempts++;
    try{
      const started = performance.now();
      const timer = testTimeout(9000);
      const r = await fetch(SPEED_BASE+"/__down?bytes=1&v=7&fasqoo=1&t="+Date.now()+"-"+Math.random(),
        { cache:"no-store", mode:"cors", credentials:"omit", signal:timer.signal });
      if(!r.ok) throw new Error("HTTP "+r.status);
      await r.arrayBuffer();
      timer.clear();
      const ms = performance.now() - started;
      if(Number.isFinite(ms) && ms > 0 && ms < 9000){ vals.push(ms); onSample(ms); }
    }catch(e){ console.warn("Cloudflare latency probe failed:", e?.message || e); }
    if(i < MAX_ATTEMPTS-1) await sleep(80);
  }
  if(vals.length < 3) throw new Error("MEASUREMENT_UNAVAILABLE");
  const ping = robustMedian(vals);
  const deltas = [];
  for(let i=1;i<vals.length;i++) deltas.push(Math.abs(vals[i]-vals[i-1]));
  const jitter = deltas.length ? robustMedian(deltas) : 0;
  const packetLoss = attempts > 0 ? ((attempts - vals.length) / attempts) * 100 : 0;
  return { ping, jitter, samples: vals, packetLoss, attempts };
}

/* ---------- IO HELPERS ---------- */
async function readResponseBytes(response,signal){
  if(!response.body){ const b=await response.arrayBuffer(); return b.byteLength; }
  const reader=response.body.getReader(); let bytes=0;
  try{
    while(running){
      if(signal?.aborted) throw new DOMException("Aborted","AbortError");
      const part=await reader.read();
      if(part.done) break;
      bytes += part.value?.byteLength || 0;
    }
  }catch(err){
    if(err.name !== "AbortError") console.warn("Stream read issue:", err.message);
  }finally{ try{reader.releaseLock();}catch(e){} }
  return bytes;
}
function makeUploadBuffer(bytes){
  const data=new Uint8Array(bytes);
  if(window.crypto?.getRandomValues){
    for(let i=0;i<bytes;i+=65536) crypto.getRandomValues(data.subarray(i,Math.min(i+65536,bytes)));
  }else data.fill(83);
  return data;
}
async function parallelDownload(bytesPerStream,streams,timeoutMs){
  const wallStart=performance.now();
  const jobs=Array.from({length:streams},async()=>{
    const timer=testTimeout(timeoutMs);
    try{
      const r=await fetch(SPEED_BASE+"/__down?bytes="+Math.max(1,Math.floor(bytesPerStream))+"&v=7&r="+Date.now()+Math.random(),{
        cache:"no-store",mode:"cors",credentials:"omit",signal:timer.signal
      });
      if(!r.ok) throw new Error("HTTP "+r.status);
      const bytes=await readResponseBytes(r,timer.signal);
      if(bytes<=0) throw new Error("Empty download");
      return bytes;
    }finally{timer.clear();}
  });
  const results=await Promise.allSettled(jobs);
  const good=results.filter(x=>x.status==="fulfilled" && x.value>0).map(x=>x.value);
  const seconds=(performance.now()-wallStart)/1000;
  if(!good.length || seconds<=0) throw new Error("Download failed");
  return {bytes:good.reduce((a,x)=>a+x,0),seconds,streams:good.length};
}
async function parallelUpload(bytesPerStream,streams,timeoutMs){
  const payload=makeUploadBuffer(bytesPerStream);
  const wallStart=performance.now();
  const jobs=Array.from({length:streams},async()=>{
    const timer=testTimeout(timeoutMs);
    try{
      const r=await fetch(SPEED_BASE+"/__up?v=7&r="+Date.now()+Math.random(),{
        method:"POST",body:payload,headers:{"Content-Type":"application/octet-stream"},
        cache:"no-store",mode:"cors",credentials:"omit",signal:timer.signal
      });
      if(!r.ok) throw new Error("HTTP "+r.status);
      try{await r.arrayBuffer();}catch(e){}
      return bytesPerStream;
    }finally{timer.clear();}
  });
  const results=await Promise.allSettled(jobs);
  const good=results.filter(x=>x.status==="fulfilled" && x.value>0).map(x=>x.value);
  const seconds=(performance.now()-wallStart)/1000;
  if(!good.length || seconds<=0) throw new Error("Upload failed");
  return {bytes:good.reduce((a,x)=>a+x,0),seconds,streams:good.length};
}
function nextPayloadBytes(mbps,remainingMs,streams,minBytes,maxBytes){
  const seconds=Math.max(0.25,Math.min(2.5,remainingMs/1000));
  const targetBytes=Math.ceil((mbps*1000000/8)*seconds*1.20/Math.max(1,streams));
  return clampNumber(targetBytes,minBytes,maxBytes);
}
async function bufferbloatProbe(shouldContinue, sink){
  await sleep(180);
  while(shouldContinue() && running){
    try{
      const started = performance.now();
      const timer = testTimeout(2500);
      const r = await fetch(SPEED_BASE+"/__down?bytes=1&v=7&bb=1&t="+Date.now()+"-"+Math.random(),{
        cache:"no-store", mode:"cors", credentials:"omit", signal:timer.signal
      });
      timer.clear();
      if(!r.ok) throw new Error("HTTP "+r.status);
      await r.arrayBuffer();
      const ms = performance.now()-started;
      if(Number.isFinite(ms) && ms>0 && ms<2500) sink.push(ms);
    }catch(e){}
    await sleep(300);
  }
}

/* ---------- DOWNLOAD ---------- */
async function downloadTest(){
  const t=translations[currentLang], x=extraTranslations[currentLang]||extraTranslations.en;
  $("status").textContent=t.stDown; $("chartState").textContent=t.download; samples=[];
  let mbps = 25;
  try{
    const warm = await parallelDownload(512*1024, 2, 5000);
    const warmMbps = warm.bytes*8/warm.seconds/1e6;
    if(Number.isFinite(warmMbps) && warmMbps > 0) mbps = warmMbps;
  }catch(e){ console.warn("Download warm-up failed:", e.message); }
  const TARGET=MEASUREMENT_V7.phaseMs, startTime=performance.now();
  const measured=[]; const loadedLatencies=[];
  let streams=2, bytesPerStream=512*1024;
  let probing = true;
  const probeTask = bufferbloatProbe(() => probing, loadedLatencies);
  while(running){
    const elapsed=performance.now()-startTime;
    if(elapsed>=TARGET) break;
    const remaining=TARGET-elapsed;
    streams=chooseStreams(mbps, MEASUREMENT_V7.maxStreams);
    bytesPerStream=nextPayloadBytes(mbps, remaining, streams, 128*1024, 32*1024*1024);
    const timeout=Math.max(4000, Math.min(7000, remaining+2000));
    try{
      const r=await parallelDownload(bytesPerStream, streams, timeout);
      const sp=r.bytes*8/r.seconds/1e6;
      if(Number.isFinite(sp) && sp>0){
        measured.push(sp); samples.push(sp);
        mbps = sp;
        gauge(sp);
        $("down").textContent=sp.toFixed(1);
        $("intelThroughput").textContent=sp.toFixed(1)+" "+x.unitMbps;
        drawChart();
      }
    }catch(e){
      console.warn("Download round failed:", e.message);
      if(performance.now()-startTime>=TARGET) break;
      await sleep(150);
    }
  }
  probing = false;
  try{ await probeTask; }catch(e){}
  if(measured.length < 1) throw new Error("Download measurement failed");
  return { speed: robustMedian(measured), loadedLatencies };
}

/* ---------- UPLOAD ---------- */
async function uploadTest(){
  const t=translations[currentLang];
  $("status").textContent=t.stUp; $("chartState").textContent=t.upload; samples=[];
  let mbps = 25;
  try{
    const warm = await parallelUpload(512*1024, 2, 5000);
    const warmMbps = warm.bytes*8/warm.seconds/1e6;
    if(Number.isFinite(warmMbps) && warmMbps > 0) mbps = warmMbps;
  }catch(e){ console.warn("Upload warm-up failed:", e.message); }
  const TARGET=MEASUREMENT_V7.phaseMs, startTime=performance.now();
  const measured=[]; const loadedLatencies=[];
  let streams=2, bytesPerStream=512*1024;
  let probing = true;
  const probeTask = bufferbloatProbe(() => probing, loadedLatencies);
  while(running){
    const elapsed=performance.now()-startTime;
    if(elapsed>=TARGET) break;
    const remaining=TARGET-elapsed;
    streams=chooseStreams(mbps, MEASUREMENT_V7.maxStreams);
    bytesPerStream=nextPayloadBytes(mbps, remaining, streams, 128*1024, 32*1024*1024);
    const timeout=Math.max(4500, Math.min(8000, remaining+2500));
    try{
      const r=await parallelUpload(bytesPerStream, streams, timeout);
      const sp=r.bytes*8/r.seconds/1e6;
      if(Number.isFinite(sp) && sp>0){
        measured.push(sp); samples.push(sp);
        mbps = sp;
        gauge(sp);
        $("up").textContent=sp.toFixed(1);
        drawChart();
      }
    }catch(e){
      console.warn("Upload round failed:", e.message);
      if(performance.now()-startTime>=TARGET) break;
      await sleep(150);
    }
  }
  probing = false;
  try{ await probeTask; }catch(e){}
  if(measured.length < 1) throw new Error("Upload measurement failed");
  return { speed: robustMedian(measured), loadedLatencies };
}

/* ---------- QUALITY ---------- */
function quality(d,u,p,j,loss=0,bloat=null){
  let s = 100;
  if(d<5) s-=45; else if(d<25) s-=30; else if(d<50) s-=20; else if(d<100) s-=10;
  if(u<2) s-=20; else if(u<5) s-=14; else if(u<10) s-=7;
  if(p>150) s-=30; else if(p>100) s-=24; else if(p>60) s-=15; else if(p>30) s-=7;
  if(j>50) s-=20; else if(j>30) s-=14; else if(j>15) s-=7;
  if(loss>=5) s-=40; else if(loss>=2) s-=25; else if(loss>=0.5) s-=10; else if(loss>0) s-=3;
  if(bloat!==null){
    if(bloat>=200) s-=20; else if(bloat>=100) s-=12; else if(bloat>=60) s-=6; else if(bloat>=30) s-=3;
  }
  return Math.max(0, Math.min(100, Math.round(s)));
}
function connectionAssessment(d,u,p,j){
  const t = translations[currentLang];
  const grade = d>=100 && u>=10 && p<=30 && j<=10 ? "excellent" :
                d>=50 && u>=5 && p<=60 && j<=20 ? "good" :
                d>=20 && u>=2 && p<=100 && j<=30 ? "medium" : "bad";
  const title = grade==="excellent" ? t.stExc : grade==="good" ? t.stGood : grade==="medium" ? t.stLim : t.q0;
  let detail = "";
  if(grade==="excellent") detail = `Download ${d.toFixed(1)} Mbps, Upload ${u.toFixed(1)} Mbps, Ping ${p.toFixed(1)} ms and Jitter ${j.toFixed(1)} ms indicate a strong, responsive connection.`;
  else if(grade==="good") detail = `Your measured speeds are suitable for most everyday use. ${p.toFixed(1)} ms ping and ${j.toFixed(1)} ms jitter indicate generally responsive performance.`;
  else if(grade==="medium") detail = `The connection is usable, but one or more values may affect demanding activities. Download ${d.toFixed(1)} Mbps, Upload ${u.toFixed(1)} Mbps, Ping ${p.toFixed(1)} ms, Jitter ${j.toFixed(1)} ms.`;
  else detail = `The connection has a limiting value. Download ${d.toFixed(1)} Mbps, Upload ${u.toFixed(1)} Mbps, Ping ${p.toFixed(1)} ms, Jitter ${j.toFixed(1)} ms.`;
  return {grade,title,detail};
}
function showQuality(s,d,u,p,j){
  const t = translations[currentLang];
  $("score").textContent = s+"/100";
  $("bar").style.width = s+"%";
  $("qtext").textContent = s>=90?t.q90:s>=75?t.q75:s>=55?t.q55:s>=35?t.q35:t.q0;
  const a=connectionAssessment(d,u,p,j);
  $("qualityLabel").textContent=a.title;
  $("qualityLabel").className="connection-grade "+a.grade;
  const detail=$("qualityDetail"); if(detail) detail.textContent=a.detail;
}

/* ---------- APPS ---------- */
function evaluateApps(d,u,p,j,loss=0,bloat=null){
  const lang = currentLang;
  const t = (group) => (APP_STATUS_TEXT[group] && APP_STATUS_TEXT[group][lang]) || APP_STATUS_TEXT[group].en;
  const b = Number.isFinite(bloat) ? bloat : 0;

  let g = 100;
  if(p>20) g-=15; if(p>40) g-=20; if(p>70) g-=25;
  if(j>10) g-=15; if(j>20) g-=20; if(j>40) g-=20;
  if(d<10) g-=15; if(u<3) g-=10;
  if(loss>=2) g-=20; else if(loss>=0.5) g-=10;
  if(b>=200) g-=25; else if(b>=100) g-=15; else if(b>=60) g-=8;

  let st = 100;
  if(d<25) st-=20; if(d<10) st-=25; if(d<5) st-=20;
  if(j>20) st-=15; if(j>40) st-=15;
  if(loss>=2) st-=20; else if(loss>=0.5) st-=10;
  if(b>=200) st-=10;

  let fk = d>=50?100:d>=25?85:d>=15?60:d>=10?35:10;

  let cl = 100;
  if(p>50) cl-=15; if(p>100) cl-=20;
  if(j>15) cl-=15; if(j>30) cl-=20;
  if(u<2) cl-=15; if(u<1) cl-=15;
  if(loss>=2) cl-=20; else if(loss>=0.5) cl-=10;
  if(b>=200) cl-=10;

  let o = 100;
  if(d<25) o-=15; if(u<10) o-=15; if(p>70) o-=15; if(j>25) o-=15;
  if(b>=200) o-=15;

  let cb = 100;
  if(u<10) cb-=15; if(u<5) cb-=20; if(u<2) cb-=20;
  if(d<10) cb-=10;
  if(p>100) cb-=10;
  if(loss>=2) cb-=15;

  let w = 100;
  if(d<10) w-=20; if(d<5) w-=20; if(p>100) w-=25; if(j>30) w-=15;

  let wb = 100;
  if(d<15) wb-=15; if(d<5) wb-=20;
  if(p>150) wb-=15; if(p>250) wb-=15;
  if(j>30) wb-=10;

  const scores = { gaming:g, stream:st, fourk:fk, call:cl, office:o, cloud:cb, social:w, web:wb };

  Object.entries(scores).forEach(([key, score]) => {
    const card = document.querySelector('.app-profile[data-app-key="'+key+'"]');
    if(!card) return;
    const mark = card.querySelector('.mark');
    const vtxt = card.querySelector('.vtxt');
    card.classList.add("revealed");
    card.classList.remove("pass","fail");
    if(score >= 70){ card.classList.add("pass"); mark.textContent = "✓"; vtxt.textContent = t("pass"); }
    else if(score >= 45){ card.classList.add("pass"); mark.textContent = "✓"; vtxt.textContent = t("ok"); }
    else{ card.classList.add("fail"); mark.textContent = "✕"; vtxt.textContent = t("fail"); }
  });
}
function resetAppCards(){
  document.querySelectorAll(".app-profile").forEach(card => {
    card.classList.remove("revealed","pass","fail");
    const mark = card.querySelector('.mark');
    const vtxt = card.querySelector('.vtxt');
    if(mark) mark.textContent = "•";
    if(vtxt) vtxt.textContent = "Waiting…";
  });
}

/* ---------- MISC ---------- */
function createTestID(){ return "FASQOO-"+Math.random().toString(36).slice(2,6).toUpperCase()+"-"+Math.random().toString(36).slice(2,6).toUpperCase(); }
function historyLoad(){
  const t = translations[currentLang];
  const h = JSON.parse(localStorage.getItem("fasqoo_history")||"[]");
  const body = $("history");
  if(!h.length){ body.innerHTML = '<tr><td colspan="6" class="empty">'+t.noHistory+'</td></tr>'; return; }
  body.innerHTML = h.map(x => '<tr><td>'+x.date+'</td><td>'+((x.isp||"—").replace(/[<>&"]/g,m=>({"<":"&lt;",">":"&gt;","&":"&amp;",'"':"&quot;"}[m])))+'</td><td>'+Number(x.d).toFixed(1)+' Mbps</td><td>'+Number(x.u).toFixed(1)+' Mbps</td><td>'+Number(x.p).toFixed(1)+' ms</td><td>'+x.s+'/100</td></tr>').join("");
}
function saveHistory(x){
  const h = JSON.parse(localStorage.getItem("fasqoo_history")||"[]");
  h.unshift(x);
  localStorage.setItem("fasqoo_history", JSON.stringify(h.slice(0,20)));
  historyLoad();
}
function setPremiumMetrics(d,u,p,j){
  const x = extraTranslations[currentLang] || extraTranslations.en;
  if(Number.isFinite(p)) $("intelLatency").textContent = p.toFixed(1)+" ms";
  if(Number.isFinite(j)) $("intelStability").textContent = j.toFixed(1)+" ms · "+(j <= 10 ? translations[currentLang].stExc : j <= 20 ? translations[currentLang].stGood : translations[currentLang].stLim);
  if(Number.isFinite(d)) $("intelThroughput").textContent = d.toFixed(1)+" "+x.unitMbps;
}
function setTestPhase(phase){
  document.querySelectorAll(".phase-step").forEach(el => el.classList.toggle("active", el.dataset.phase === phase));
  const label = $("testPhase");
  if(label){
    const x = extraTranslations[currentLang] || extraTranslations.en;
    const labels = {ping:x.responseTime,download:x.downloadCapacity,upload:x.throughput,complete:x.phaseResult};
    label.textContent = labels[phase] || x.readyPhase;
  }
}
function updateQualityLabel(s){
  const el = $("qualityLabel");
  if(!el) return;
  const t = translations[currentLang];
  el.textContent = s>=90 ? t.stExc : s>=75 ? (t.q75.replace(/connection\.?$/i, "").trim() || t.stGood) : s>=55 ? t.stGood : s>=35 ? t.stLim : t.q0;
}

/* ---------- START ---------- */
async function start(){
  if(running) return;
  running = true;
  const t = translations[currentLang];
  $("start").disabled = true;
  $("start").textContent = t.testing;
  resetGauge();
  ["down","up","ping","jitter","loss","bloat"].forEach(id => {
    const el = $(id);
    if(el){ el.textContent = "—"; el.dataset.numericValue = "0"; }
  });
  $("intelLatency").textContent = "—";
  $("intelStability").textContent = "—";
  $("intelThroughput").textContent = "—";
  $("score").textContent = "—";
  $("bar").style.width = "0%";
  const gradeEl = $("bloatGrade"); if(gradeEl) gradeEl.textContent = "";
  const gradeBadge = $("gradeBadge");
  if(gradeBadge){ gradeBadge.textContent="—"; gradeBadge.classList.remove("tier-excellent","tier-good","tier-medium","tier-bad"); }
  if($("gradeSub")) $("gradeSub").textContent = "Measuring…";
  lastBloatMs = null;
  resetAppCards();
  $("status").textContent = t.stPing;
  setTestPhase("ping");
  if($("measurementHint")) $("measurementHint").textContent = (extraTranslations[currentLang]||extraTranslations.en).measurementReal;

  try{
    if(performance.clearResourceTimings) performance.clearResourceTimings();
    ["ping","jitter","loss","bloat","down","up"].forEach(setMeasuring);
    const p = await pingTest({ onSample: pulseOnce });
    stopPingPulse();
    tickValue($("ping"),   p.ping,       {decimals:1, duration:600});
    setFinal("ping", colorPing(p.ping));
    tickValue($("jitter"), p.jitter,     {decimals:1, duration:600});
    setFinal("jitter", colorJitter(p.jitter));
    tickValue($("loss"),   p.packetLoss, {decimals:1, duration:600});
    setFinal("loss", colorLoss(p.packetLoss));
    $("intelLatency").textContent = p.ping.toFixed(1) + " ms";
    $("intelStability").textContent = p.jitter.toFixed(1) + " ms · " +
      (p.jitter<=10 ? t.stExc : p.jitter<=20 ? t.stGood : t.stLim);
    measureDns();
    setTestPhase("download");
    $("status").textContent = t.testing;
    await sleep(2000);
    const dRes = await downloadTest();
    const d = dRes.speed;
    tickValue($("down"), d, {decimals:1, duration:850});
    setFinal("down", colorDownload(d));
    setTestPhase("upload");
    $("status").textContent = t.testing;
    await sleep(2000);
    const uRes = await uploadTest();
    const u = uRes.speed;
    tickValue($("up"), u, {decimals:1, duration:850});
    setFinal("up", colorUpload(u));
    const allLoaded = [...dRes.loadedLatencies, ...uRes.loadedLatencies].filter(Number.isFinite);
    const loadedPing = allLoaded.length >= 3 ? robustMedian(allLoaded) : null;
    const bloatMs = loadedPing !== null ? Math.max(0, loadedPing - p.ping) : null;
    displayBufferbloat(bloatMs);
    showGrade(bloatMs, p.ping, p.jitter, d, u);
    setTestPhase("complete");
    const s = quality(d, u, p.ping, p.jitter, p.packetLoss, bloatMs);
    showQuality(s, d, u, p.ping, p.jitter);
    evaluateApps(d, u, p.ping, p.jitter, p.packetLoss, bloatMs);
    setPremiumMetrics(d, u, p.ping, p.jitter);
    updateQualityLabel(s);
    if($("measurementHint")) $("measurementHint").textContent = (extraTranslations[currentLang]||extraTranslations.en).measurementComplete;
    const testID = createTestID();
    const date = new Date().toLocaleString();
    last = {id:testID, date:date, download:d, upload:u, ping:p.ping, jitter:p.jitter,
      packetLoss:p.packetLoss, bufferbloat:bloatMs, quality:s,
      ip:info.ip||"", isp:(info.connection && (info.connection.isp||info.connection.org))||"",
      location:$("loc").textContent, asn:$("asn").textContent,
      ipv4:$("ipv4").textContent, ipv6:$("ipv6").textContent, dns:$("dns").textContent};
    $("tid").textContent = testID;
    $("status").textContent = t.complete;
    $("chartState").textContent = t.complete;
    saveHistory({date:date, d:d, u:u, p:p.ping, j:p.jitter, s:s, isp:last.isp||"—"});
    updateWidget();
  }catch(err){
    console.error("FASQOO TEST FAILED:", err);
    stopPingPulse();
    const tNow = translations[currentLang];
    $("status").textContent = tNow.measurementUnavailable || tNow.stErr;
    setTestPhase("ping");
    if($("measurementHint")) $("measurementHint").textContent = (extraTranslations[currentLang]||extraTranslations.en).measurementRetry;
  }
  running = false;
  $("start").disabled = false;
  $("start").textContent = translations[currentLang].startAgain;
}
$("start").addEventListener("click", start);

const _statusObserver = new MutationObserver(() => {
  const text = $("status")?.textContent || "";
  if(/download|descarga|téléchargement/i.test(text)) setTestPhase("download");
  else if(/upload|envoi|subida|envio|hochladen|yükleme|ngarkim/i.test(text)) setTestPhase("upload");
  else if(/ping|latency|latenz|latence|latencia|latenza|vonesa/i.test(text)) setTestPhase("ping");
});
_statusObserver.observe($("status"),{childList:true,subtree:true,characterData:true});

$("copy").addEventListener("click", async () => {
  const t = translations[currentLang];
  if(!last.id){ alert(t.alertRun); return; }
  const text = "Fasqoo Internet Speed Test\n\nTest ID: "+last.id+"\nDownload: "+last.download.toFixed(1)+" Mbps\nUpload: "+last.upload.toFixed(1)+" Mbps\nPing: "+last.ping.toFixed(1)+" ms\nJitter: "+last.jitter.toFixed(1)+" ms\nPacket Loss: "+(last.packetLoss||0).toFixed(1)+" %\nBufferbloat: "+(last.bufferbloat!==null?Math.round(last.bufferbloat)+" ms":"n/a")+"\nQuality: "+last.quality+"/100\n\nISP: "+last.isp+"\nLocation: "+last.location;
  try{ await navigator.clipboard.writeText(text); $("copy").textContent = t.copied; setTimeout(()=>$("copy").textContent = t.copy,1500); }
  catch(e){ alert(text); }
});
$("share").addEventListener("click", async () => {
  const t = translations[currentLang];
  if(!last.id){ alert(t.alertRun); return; }
  const text = "Fasqoo Speed Test — "+last.download.toFixed(1)+" Mbps down, "+last.upload.toFixed(1)+" Mbps up, "+last.ping.toFixed(1)+" ms ping";
  if(navigator.share){ try{ await navigator.share({title:"Fasqoo Speed Test", text:text}); }catch(e){} }
  else $("copy").click();
});
$("json").addEventListener("click", () => {
  const t = translations[currentLang];
  if(!last.id){ alert(t.alertRun); return; }
  const blob = new Blob([JSON.stringify(last, null, 2)], {type:"application/json"});
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = (last.id||"fasqoo-test")+".json"; a.click();
  URL.revokeObjectURL(url);
});
$("print").addEventListener("click", () => {
  const t = translations[currentLang];
  if(!last.id){ alert(t.alertRun); return; }
  window.print();
});
$("clear").addEventListener("click", () => { localStorage.removeItem("fasqoo_history"); historyLoad(); });

function applyExtraLanguage(lang){
  const x = extraTranslations[lang] || extraTranslations.en;
  const units = document.querySelectorAll('.unit');
  units.forEach(el => {
    const txt = el.textContent.trim();
    if (txt === 'Mbps' || txt === 'Mbit/s' || txt === 'ميغابت/ث') el.textContent = x.unitMbps;
  });
}

function applyLanguage(lang){
  if(!translations[lang]) lang = "en";
  currentLang = lang;
  const t = { ...translations[lang], ...(extraTranslations[lang] || {}), ...(installTranslations[lang] || installTranslations.en), ...(staticUiTranslations[lang] || staticUiTranslations.en), ...(metricTranslations[lang] || metricTranslations.en), ...(siteNavTranslations.en || {}), ...(siteNavTranslations[lang] || {}) };
  document.documentElement.lang = lang;
  document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
  document.title = `${t.title || translations[lang].title || "Internet Speed Test"} | Fasqoo`;
  updateInstallButton();

  document.querySelectorAll("[data-i18n]").forEach(el => {
    const key = el.getAttribute("data-i18n");
    if(t[key]) el.textContent = t[key];
  });

  APP_KEYS.forEach(k => {
    const title = document.querySelector('[data-app-title="'+k+'"]');
    const desc  = document.querySelector('[data-app-desc="'+k+'"]');
    const meta  = APP_META[k];
    if(!meta) return;
    if(title) title.textContent = (meta.title[lang]) || meta.title.en;
    if(desc)  desc.textContent  = (meta.desc[lang])  || meta.desc.en;
  });

  historyLoad();
  applyExtraLanguage(lang);
  if(!running && $("speed").textContent === "0") $("status").textContent = t.ready;
  if(lastBloatMs !== null) displayBufferbloat(lastBloatMs);
}

const supportedLangs = Object.keys(translations);
const langSelect = $("lang");
langSelect.addEventListener("change", e => {
  const chosen = supportedLangs.includes(e.target.value) ? e.target.value : "en";
  applyLanguage(chosen);
  localStorage.setItem("fasqoo_lang", chosen);
});

/* ---------- SPEED WIDGET ---------- */
const widget=$("speedWidget");
function updateWidget(){
  if(!last || !last.id) return;
  $("widgetSpeed").textContent=Number(last.download).toFixed(1);
  $("widgetPing").textContent=Number(last.ping).toFixed(1)+" ms";
  $("widgetJitter").textContent=Number(last.jitter).toFixed(1)+" ms";
  $("widgetUpload").textContent=Number(last.upload).toFixed(1)+" Mbps";
  $("widgetQuality").textContent=Number(last.quality)+"/100";
  $("widgetProvider").textContent=(staticUiTranslations[currentLang]||staticUiTranslations.en).providerLabel+": "+(last.isp||"—");
}
$("widgetClose")?.addEventListener("click",()=>widget.hidden=true);
$("widgetRun")?.addEventListener("click",async()=>{
  widget.hidden=true;
  await start();
  updateWidget();
  widget.hidden=false;
});

/* ---------- LAZY WIDGET ---------- */
window.addEventListener("load",()=>{
  const loadWidget=()=>{
    if(document.querySelector('script[data-fasqoo-widget]')) return;
    const sc=document.createElement("script");
    sc.src="https://lite.fasqoo.com/widget.js"; sc.async=true; sc.dataset.fasqooWidget="1";
    document.body.appendChild(sc);
  };
  if("requestIdleCallback" in window) requestIdleCallback(loadWidget,{timeout:2500});
  else setTimeout(loadWidget,1500);
});

/* ---------- SERVICE WORKER ---------- */
if("serviceWorker" in navigator){
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js")   // ← ändern zu "/service-worker.js"
      .then(reg => console.log("SW registered:", reg.scope))
      .catch(err => console.log("SW error:", err));
  });
}

/* ---------- INIT ---------- */
buildAppCards();
resizeCanvas();

const savedLang = localStorage.getItem("fasqoo_lang");
const browserCandidates = Array.isArray(navigator.languages) ? navigator.languages : [navigator.language || "en"];
const browserLang = browserCandidates.map(v => String(v || "").slice(0,2).toLowerCase()).find(v => supportedLangs.includes(v)) || "en";
const initialLang = (savedLang && supportedLangs.includes(savedLang)) ? savedLang : browserLang;
langSelect.value = initialLang;
applyLanguage(initialLang);

const countryLanguageMap = {US:"en",GB:"en",CA:"en",AU:"en",NZ:"en",ES:"es",MX:"es",AR:"es",CL:"es",CO:"es",PE:"es",DE:"de",AT:"de",CH:"de",FR:"fr",BE:"fr",IT:"it",PT:"pt",BR:"pt",NL:"nl",TR:"tr",AL:"sq",XK:"sq",KS:"sq",SA:"ar",AE:"ar",QA:"ar",JO:"ar",EG:"ar",MA:"ar",DZ:"ar",TN:"ar"};
if(!savedLang){
  window.addEventListener("fasqoo-country-detected", e => {
    const code = String(e.detail || "").toUpperCase();
    const detected = countryLanguageMap[code];
    if(detected && detected !== currentLang){ langSelect.value = detected; applyLanguage(detected); }
  }, {once:true});
}

applyTheme(localStorage.getItem("fasqoo_dark") === "true");
netinfo();
/* ==========================================================
   SMARTES PWA-INSTALLATIONS-POPUP (KORRIGIERT)
   ========================================================== */
let deferredInstallPrompt = null;

window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredInstallPrompt = e;
  showSmartInstallToast();
});

function isIOS() {
  return /iphone|ipad|ipod/.test(window.navigator.userAgent.toLowerCase());
}

function isStandalone() {
  return window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
}

function showSmartInstallToast() {
  if (isStandalone() || localStorage.getItem('fasqoo_pwa_dismissed')) return;
  if (document.getElementById('smartPwaToast')) return;

  const isApple = isIOS();
  const toast = document.createElement('div');
  toast.id = 'smartPwaToast';
  toast.className = 'pwa-toast';
  
  // Korrigierte Bedingungen (mit Syntax-Prüfung)
  const descText = isApple 
    ? "Tippe unten auf das Teilen-Symbol im Browser und wähle 'Zum Homescreen'." 
    : "Füge Fasqoo für blitzschnellen Zugriff zu deinem Startbildschirm hinzu.";
  const actionText = isApple ? "Verstanden" : "Installieren";

  toast.innerHTML = `
    <div class="pwa-toast-icon">⚡</div>
    <div class="pwa-toast-content">
      <h4 class="pwa-toast-title">Fasqoo als App installieren</h4>
      <p class="pwa-toast-desc">${descText}</p>
    </div>
    <button class="pwa-toast-btn" id="pwaActionBtn">${actionText}</button>
    <button class="pwa-toast-close" id="pwaCloseBtn">&times;</button>
  `;

  document.body.appendChild(toast);
  setTimeout(() => toast.classList.add('show'), 1500);

  toast.querySelector('#pwaActionBtn').addEventListener('click', async () => {
    if (!isApple && deferredInstallPrompt) {
      deferredInstallPrompt.prompt();
      await deferredInstallPrompt.userChoice;
      deferredInstallPrompt = null;
    }
    closeToast(toast);
  });

  toast.querySelector('#pwaCloseBtn').addEventListener('click', () => {
    closeToast(toast);
  });
}

function closeToast(toast) {
  toast.classList.remove('show');
  localStorage.setItem('fasqoo_pwa_dismissed', 'true');
  setTimeout(() => toast.remove(), 350);
}

window.addEventListener('load', () => {
  if (isIOS() && !isStandalone()) {
    setTimeout(showSmartInstallToast, 2500);
  }
});
