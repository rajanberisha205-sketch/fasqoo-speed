(function(){
'use strict';

/* ================================================================
   FASQOO GAMING & PING MONITOR
   ================================================================ */

/* ================================================================
   TAB SYSTEM
   ================================================================ */
(function initTabs(){

  const bandwidthTab = document.getElementById('bandwidthTab');
  const gamingTab = document.getElementById('gamingTab');

  const speedSection =
    document.getElementById('speedtest-section') ||
    document.getElementById('speedtest') ||
    document.getElementById('speedTestSection');

  const gamingSection = document.getElementById('gaming-section');

  if(!bandwidthTab || !gamingTab || !gamingSection){
    return;
  }

  function setMode(mode){

    const gaming = mode === 'gaming';

    gamingSection.classList.toggle('hidden', !gaming);

    if(speedSection){
      speedSection.classList.toggle('hidden', gaming);
    }

    bandwidthTab.classList.toggle('active', !gaming);
    gamingTab.classList.toggle('active', gaming);

    bandwidthTab.setAttribute(
      'aria-selected',
      String(!gaming)
    );

    gamingTab.setAttribute(
      'aria-selected',
      String(gaming)
    );
  }

  bandwidthTab.addEventListener('click', function(){
    setMode('speed');
  });

  gamingTab.addEventListener('click', function(){
    setMode('gaming');
  });

  setMode('speed');

})();


/* ================================================================
   TRANSLATIONS
   ================================================================ */

const EN = {

  navSpeedtest:'Speedtest',
  navTools:'Tools & IT-Diagnostics',
  navSectionNetwork:'Network & Speed',
  navSectionDiag:'IT Diagnostics & Security',
  navFaq:'FAQ',
  navAbout:'About Us',
  navWidget:'Widget',

  navStatus:'Network Status',
  navStatusDesc:'Live reachability & line diagnostics',

  navWidgetDesc:'Free test widget for other websites',

  navSecurity:'Security Analyzer',
  navSecurityDesc:'Check HTTP security headers in real time',

  navDns:'Visual DNS Test',
  navDnsDesc:'Track global DNS propagation visually',

  navSubnet:'Subnet Calculator',
  navSubnetDesc:'Calculate IP ranges and subnet masks',

  liteBtn:'Fasqoo Lite',
  installApp:'Install for Windows',

  footerBrand:
    'Fasqoo - Independent, browser-based internet speed tests and network tools.',

  footerSpeedTests:'Speed Tests',
  footerInternetSpeed:'Internet Speed Test',
  footerLite:'Fasqoo Lite',
  footerWidget:'Widget',
  footerNetworkTools:'Network Tools',
  footerNetworkStatus:'Network Status',
  footerITDiagnose:'IT Diagnostics',
  footerSecurity:'Security Analyzer',
  footerDns:'Visual DNS Test',
  footerCompany:'Company',
  footerAbout:'About Us',
  footerFaq:'FAQ',
  footerPrivacy:'Privacy Policy',
  footerCopyright:'© 2026 Fasqoo',

  footerBranding:
    'Powered by the Cloudflare Edge network to ensure maximum performance and measurement accuracy.',

  footerDisclaimer:
    'Fasqoo is an independent speed-test platform and is not an official Cloudflare product.',

  heroEyebrow:'Fasqoo Gaming Monitor',

  heroTitleTop:'Fasqoo Gaming-',
  heroTitleAccent:' & Ping-Monitor',

  heroText:
    'Check your latency (ping) and connection stability (jitter) to the world\'s most important gaming servers in real time before your match starts.',

  controlTitle:'Ready for your ping check?',

  controlText:
    'We measure client-side using browser requests to each provider. No install, no account, no tracking.',

  controlProviders:
    'Cloudflare Edge · direct endpoint ping · no server logs',

  startBtn:'Start ping test',
  stopBtn:'Stop',

  statusStarting:'Starting measurement …',
  statusTesting:'Pinging {name} …',

  statusDone:'Measurement complete',
  statusStopped:'Test stopped',

  summaryScoreLabel:'Score',

  summaryTitleExcellent:
    'Excellent connection for gaming',

  summaryTitleGood:
    'Good connection for gaming',

  summaryTitleMedium:
    'Usable, but not ideal',

  summaryTitleBad:
    'High latency detected',

  summaryTextExcellent:
    'All measured servers respond under 30 ms. This is a competitive-ready connection.',

  summaryTextGood:
    'Most servers respond in the acceptable range. Fast-paced shooters should still feel responsive.',

  summaryTextMedium:
    'Some servers respond slowly. Fast-paced games may feel laggy.',

  summaryTextBad:
    'Several servers respond very slowly. Check Wi-Fi, background downloads and your router.',

  statExcellent:'Excellent',
  statOk:'Acceptable',
  statBad:'High ping',
  statAvg:'Avg. ping',

  catATitle:'E-Sports & Shooters',

  catAText:
    'The most competitive titles. Every millisecond matters here.',

  catBTitle:'Gaming Platforms',

  catBText:
    'Launchers, stores and multiplayer networks of the big platforms.',

  catCTitle:'Discord & Voice',

  catCText:
    'Voice chat depends more on jitter than on ping – we measure both.',

  stateExcellent:'Excellent',
  stateOk:'Acceptable',
  stateBad:'High ping',

  stateTesting:'Testing',
  stateIdle:'Idle',
  stateFailed:'Failed',

  labelJitter:'Jitter',
  labelSamples:'Samples',
  ms:'ms',

  copyReport:'Copy report',
  exportJson:'Export as JSON',

  reportCopied:'Report copied',
  jsonExported:'JSON file downloaded',

  reportNote:
    'Note: ping values are browser-based measurements to public provider endpoints. They may differ slightly from in-game values because game servers are geographically distributed differently.',

  featKicker:'NETWORK INTELLIGENCE',

  featTitle:
    'Why ping & jitter matter more than raw bandwidth',

  featSub:
    'For online gaming, latency and stability matter – not the maximum download speed.',

  feat1T:'Latency (Ping)',

  feat1D:
    'The time between your click and the server response. Under 30 ms feels instant, above 60 ms becomes noticeably sluggish.',

  feat2T:'Jitter',

  feat2D:
    'The variation between individual measurements. High jitter causes rubberbanding and voice dropouts even if ping is low.',

  feat3T:'Packet Loss',

  feat3D:
    'Lost packets are retransmitted – creating brief freezes and teleportation. Wi-Fi and congested routers are the most common causes.',

  feat4T:'Router & Wi-Fi',

  feat4D:
    'A cable typically saves 5–15 ms compared to Wi-Fi. Test both and compare the values above.',

  feat5T:'Distance to server',

  feat5D:
    'The further the game server, the higher the ping. An EU server is usually 10–40 ms away for you, US servers 90–160 ms.',

  feat6T:'Bufferbloat',

  feat6D:
    'Fully saturated lines can double your ping. A modern router with SQM (Smart Queue Management) reduces this dramatically.',

  faqKicker:'HELP CENTER',

  faqTitle:'Frequently asked questions',

  faqQ1:'How does the ping monitor work?',

  faqA1:
    'Your browser sends small requests to public endpoints of each provider and measures the time until a response. The measurement runs entirely client-side – no credentials or user data are transmitted.',

  faqQ2:'Why do the values differ from my game?',

  faqA2:
    'We measure against general provider endpoints (e.g. Steam, Riot, Epic). The actual game server you connect to in matchmaking may be geographically different. The values here are a good indicator of general line quality.',

  faqQ3:'What is a good ping for gaming?',

  faqA3:
    'For competitive shooters (Valorant, CS2) under 30 ms is excellent, 30–60 ms acceptable. Above 60 ms becomes noticeable. For MMOs and strategy, anything under 100 ms is usually fine.',

  faqQ4:'What is a good jitter?',

  faqA4:
    'Under 5 ms is excellent. 5–15 ms is acceptable. Above 15 ms typically causes audible voice issues in Discord and rubberbanding in games.',

  faqQ5:'Can I export the result?',

  faqA5:
    'Yes. Use the buttons at the end of the measurement to copy the report as text or download it as a JSON file – e.g. for support tickets with your ISP.',

  ctaTitle:'Ready for a better game feel?',

  ctaText:
    'Run the test, compare your values and optimise your connection.',

  ctaBtn:'Start ping test',
  ctaBtnSpeed:'Speed Test'
};


/* ================================================================
   GERMAN
   ================================================================ */

const DE = {

  navSpeedtest:'Speedtest',
  navTools:'Tools & IT-Diagnose',
  navSectionNetwork:'Netzwerk & Speed',
  navSectionDiag:'IT-Diagnose & Security',
  navFaq:'FAQ',
  navAbout:'Über uns',
  navWidget:'Widget',

  navStatus:'Netzwerk-Status',
  navStatusDesc:'Live-Erreichbarkeit & Leitungs-Diagnose',

  navWidgetDesc:'Kostenloses Test-Widget für andere Websites',

  navSecurity:'Security Analyzer',
  navSecurityDesc:'HTTP-Sicherheitsheader in Echtzeit prüfen',

  navDns:'Visual DNS Test',
  navDnsDesc:'Globale DNS-Ausbreitung visuell tracken',

  navSubnet:'Subnetz-Rechner',
  navSubnetDesc:'IP-Bereiche und Masken kalkulieren',

  liteBtn:'Fasqoo Lite',
  installApp:'Für Windows installieren',

  footerBrand:
    'Fasqoo - Unabhängige, browserbasierte Internet-Geschwindigkeitstests und Netzwerktools.',

  footerSpeedTests:'Speed Tests',
  footerInternetSpeed:'Internet Speed Test',
  footerLite:'Fasqoo Lite',
  footerWidget:'Widget',
  footerNetworkTools:'Netzwerk-Tools',
  footerNetworkStatus:'Network Status',
  footerITDiagnose:'IT Diagnose',
  footerSecurity:'Security Analyzer',
  footerDns:'Visual DNS Test',
  footerCompany:'Unternehmen',
  footerAbout:'Über uns',
  footerFaq:'FAQ',
  footerPrivacy:'Datenschutz',
  footerCopyright:'© 2026 Fasqoo',

  footerBranding:
    'Betrieben über das Cloudflare Edge-Netzwerk für maximale Leistung und Messgenauigkeit.',

  footerDisclaimer:
    'Fasqoo ist eine unabhängige Speedtest-Plattform und kein offizielles Cloudflare-Produkt.',

  heroEyebrow:'Fasqoo Gaming-Monitor',

  heroTitleTop:'Fasqoo Gaming-',
  heroTitleAccent:' & Ping-Monitor',

  heroText:
    'Prüfe deine Latenz (Ping) und Verbindungsstabilität (Jitter) zu den weltweit wichtigsten Gaming-Servern in Echtzeit vor deinem Spielstart.',

  controlTitle:'Bereit für deinen Ping-Check?',

  controlText:
    'Wir messen clientseitig per Browser-Request die Antwortzeit zu jedem Anbieter. Keine Installation, kein Account, kein Tracking.',

  controlProviders:
    'Cloudflare Edge · direkter Endpunkt-Ping · keine Serverlogs',

  startBtn:'Ping-Test starten',
  stopBtn:'Stoppen',

  statusStarting:'Messung wird gestartet …',
  statusTesting:'Pinge {name} …',

  statusDone:'Messung abgeschlossen',
  statusStopped:'Test gestoppt',

  summaryScoreLabel:'Score',

  summaryTitleExcellent:
    'Exzellente Verbindung zum Gamen',

  summaryTitleGood:
    'Gute Verbindung zum Gamen',

  summaryTitleMedium:
    'Nutzbar, aber nicht ideal',

  summaryTitleBad:
    'Hohe Latenz erkannt',

  summaryTextExcellent:
    'Alle gemessenen Server antworten unter 30 ms. Das ist eine wettbewerbstaugliche Verbindung.',

  summaryTextGood:
    'Die meisten Server antworten im akzeptablen Bereich. Schnelle Shooter sollten sich noch responsiv anfühlen.',

  summaryTextMedium:
    'Einige Server antworten langsam. Schnelle Spiele können sich träge anfühlen.',

  summaryTextBad:
    'Mehrere Server antworten sehr langsam. Prüfe WLAN, Hintergrund-Downloads und deinen Router.',

  statExcellent:'Exzellent',
  statOk:'Akzeptabel',
  statBad:'Hoher Ping',
  statAvg:'Ø Ping',

  catATitle:'E-Sports & Shooter',
  catAText:
    'Die wettbewerbsintensivsten Titel. Hier entscheidet jede Millisekunde.',

  catBTitle:'Gaming-Plattformen',
  catBText:
    'Launcher, Stores und Multiplayer-Netzwerke der großen Plattformen.',

  catCTitle:'Discord & Voice',
  catCText:
    'Sprach-Chat hängt stärker vom Jitter als vom Ping ab – wir messen beides.',

  stateExcellent:'Exzellent',
  stateOk:'Akzeptabel',
  stateBad:'Hoher Ping',

  stateTesting:'Test läuft',
  stateIdle:'Bereit',
  stateFailed:'Fehlgeschlagen',

  labelJitter:'Jitter',
  labelSamples:'Messungen',
  ms:'ms',

  copyReport:'Bericht kopieren',
  exportJson:'Als JSON exportieren',

  reportCopied:'Bericht kopiert',
  jsonExported:'JSON-Datei heruntergeladen',

  reportNote:
    'Hinweis: Die Ping-Werte sind browserbasierte Messungen zu öffentlichen Anbieter-Endpunkten. Sie können leicht von den Werten im Spiel abweichen, da die tatsächlichen Gameserver geografisch anders verteilt sind.',

  featKicker:'NETZWERK-INTELLIGENZ',

  featTitle:
    'Warum Ping & Jitter wichtiger sind als reine Bandbreite',

  featSub:
    'Beim Online-Gaming zählen Latenz und Stabilität – nicht die maximale Download-Geschwindigkeit.',

  feat1T:'Latenz (Ping)',
  feat1D:
    'Die Zeit zwischen deiner Aktion und der Antwort des Servers. Unter 30 ms fühlt sich nahezu sofort an, über 60 ms wird es spürbar träge.',

  feat2T:'Jitter',
  feat2D:
    'Die Schwankung zwischen einzelnen Messungen. Hoher Jitter verursacht Rubberbanding und Sprachabbrüche, selbst wenn der Ping niedrig ist.',

  feat3T:'Paketverlust',
  feat3D:
    'Verlorene Pakete müssen erneut übertragen werden und können kurze Freezes verursachen. WLAN und überlastete Router sind häufige Ursachen.',

  feat4T:'Router & WLAN',
  feat4D:
    'Ein Netzwerkkabel spart gegenüber WLAN oft 5–15 ms. Teste beide Varianten und vergleiche die Werte.',

  feat5T:'Entfernung zum Server',
  feat5D:
    'Je weiter der Gameserver entfernt ist, desto höher ist der Ping.',

  feat6T:'Bufferbloat',
  feat6D:
    'Eine vollständig ausgelastete Leitung kann den Ping stark erhöhen. Moderne Router mit SQM können dies reduzieren.',

  faqKicker:'HILFECENTER',
  faqTitle:'Häufig gestellte Fragen',

  faqQ1:'Wie funktioniert der Ping-Monitor?',
  faqA1:
    'Dein Browser sendet kleine Requests an öffentliche Endpunkte der jeweiligen Anbieter und misst die Antwortzeit. Die Messung läuft vollständig clientseitig.',

  faqQ2:'Warum unterscheiden sich die Werte von meinem Spiel?',
  faqA2:
    'Wir messen öffentliche Endpunkte der Anbieter. Der tatsächliche Gameserver kann geografisch anders liegen.',

  faqQ3:'Welcher Ping ist gut fürs Gaming?',
  faqA3:
    'Unter 30 ms ist für kompetitive Spiele sehr gut. 30–60 ms ist häufig noch akzeptabel. Über 60 ms wird die Verzögerung zunehmend spürbar.',

  faqQ4:'Was ist ein guter Jitter?',
  faqA4:
    'Unter 5 ms ist sehr gut. 5–15 ms ist häufig noch akzeptabel. Höhere Werte können zu Sprachproblemen und Rubberbanding führen.',

  faqQ5:'Kann ich das Ergebnis exportieren?',
  faqA5:
    'Ja. Du kannst den Bericht kopieren oder als JSON-Datei herunterladen.',

  ctaTitle:'Bereit für ein besseres Gaming-Erlebnis?',

  ctaText:
    'Starte den Test, vergleiche deine Werte und optimiere deine Verbindung.',

  ctaBtn:'Ping-Test starten',
  ctaBtnSpeed:'Speedtest'
};


/* ================================================================
   LANGUAGE MAP
   ================================================================ */

const I18N = {

  en: EN,
  de: DE,

  fr: {
    ...EN,
    heroEyebrow:'Moniteur Gaming Fasqoo',
    heroTitleTop:'Fasqoo Gaming-',
    heroTitleAccent:' & Ping-Monitor',
    heroText:'Vérifiez votre latence et la stabilité de votre connexion vers les principaux serveurs de jeux.',
    startBtn:'Démarrer le test Ping',
    stopBtn:'Arrêter',
    copyReport:'Copier le rapport',
    exportJson:'Exporter en JSON'
  },

  es: {
    ...EN,
    heroEyebrow:'Monitor Gaming Fasqoo',
    heroText:'Comprueba tu latencia y la estabilidad de tu conexión con los principales servidores de juegos.',
    startBtn:'Iniciar prueba de Ping',
    stopBtn:'Detener',
    copyReport:'Copiar informe',
    exportJson:'Exportar como JSON'
  },

  it: {
    ...EN,
    heroEyebrow:'Monitor Gaming Fasqoo',
    heroText:'Controlla la latenza e la stabilità della tua connessione verso i principali server di gioco.',
    startBtn:'Avvia test Ping',
    stopBtn:'Ferma',
    copyReport:'Copia rapporto',
    exportJson:'Esporta JSON'
  },

  pt: {
    ...EN,
    heroEyebrow:'Monitor Gaming Fasqoo',
    heroText:'Verifique a latência e a estabilidade da sua ligação aos principais servidores de jogos.',
    startBtn:'Iniciar teste de Ping',
    stopBtn:'Parar',
    copyReport:'Copiar relatório',
    exportJson:'Exportar JSON'
  },

  nl: {
    ...EN,
    heroEyebrow:'Fasqoo Gaming Monitor',
    heroText:'Controleer je latency en verbindingsstabiliteit naar belangrijke gameservers.',
    startBtn:'Ping-test starten',
    stopBtn:'Stoppen',
    copyReport:'Rapport kopiëren',
    exportJson:'Exporteren als JSON'
  },

  tr: {
    ...EN,
    heroEyebrow:'Fasqoo Gaming Monitörü',
    heroText:'Önemli oyun sunucularına gecikmenizi ve bağlantı kararlılığınızı kontrol edin.',
    startBtn:'Ping testini başlat',
    stopBtn:'Durdur',
    copyReport:'Raporu kopyala',
    exportJson:'JSON olarak dışa aktar'
  },

  sq: {
    ...EN,
    heroEyebrow:'Fasqoo Gaming Monitor',
    heroText:'Kontrolloni ping-un dhe stabilitetin e lidhjes suaj me serverët kryesorë të lojërave.',
    startBtn:'Fillo testin Ping',
    stopBtn:'Ndalo',
    copyReport:'Kopjo raportin',
    exportJson:'Eksporto JSON'
  },

  ar: {
    ...EN,
    heroEyebrow:'مراقب الألعاب Fasqoo',
    heroText:'تحقق من زمن الاستجابة واستقرار الاتصال بخوادم الألعاب الرئيسية.',
    startBtn:'بدء اختبار Ping',
    stopBtn:'إيقاف',
    copyReport:'نسخ التقرير',
    exportJson:'تصدير JSON'
  }

};


/* ================================================================
   HELPERS
   ================================================================ */

function gmEl(id){
  return document.getElementById(id);
}

function currentLang(){

  const el = document.getElementById('lang');

  if(el && I18N[el.value]){
    return el.value;
  }

  return 'en';
}

function t(key){

  const lang = currentLang();

  const dict = I18N[lang] || I18N.en;

  if(dict[key] !== undefined){
    return dict[key];
  }

  if(I18N.en[key] !== undefined){
    return I18N.en[key];
  }

  return key;
}


/* ================================================================
   GAMES
   ================================================================ */

const GAMES = [

  {
    id:'valorant',
    name:'Valorant',
    provider:'Riot Games',
    cat:'A',
    url:'https://www.riotgames.com/'
  },

  {
    id:'cs2',
    name:'Counter-Strike 2',
    provider:'Steam',
    cat:'A',
    url:'https://store.steampowered.com/'
  },

  {
    id:'apex',
    name:'Apex Legends',
    provider:'EA',
    cat:'A',
    url:'https://www.ea.com/'
  },

  {
    id:'fortnite',
    name:'Fortnite',
    provider:'Epic Games',
    cat:'A',
    url:'https://www.epicgames.com/'
  },

  {
    id:'steam',
    name:'Steam',
    provider:'Valve',
    cat:'B',
    url:'https://store.steampowered.com/'
  },

  {
    id:'xbox',
    name:'Xbox Live',
    provider:'Microsoft',
    cat:'B',
    url:'https://www.xbox.com/'
  },

  {
    id:'psn',
    name:'PlayStation Network',
    provider:'Sony',
    cat:'B',
    url:'https://www.playstation.com/'
  },

  {
    id:'nintendo',
    name:'Nintendo Online',
    provider:'Nintendo',
    cat:'B',
    url:'https://www.nintendo.com/'
  },

  {
    id:'discord',
    name:'Discord Europe',
    provider:'Discord',
    cat:'C',
    url:'https://discord.com/'
  },

  {
    id:'teamspeak',
    name:'TeamSpeak',
    provider:'TeamSpeak',
    cat:'C',
    url:'https://www.teamspeak.com/'
  },

  {
    id:'mumble',
    name:'Mumble',
    provider:'Mumble',
    cat:'C',
    url:'https://www.mumble.info/'
  }

];


/* ================================================================
   STATE
   ================================================================ */

const SAMPLES_PER_TARGET = 4;

const state = {

  running:false,
  abort:false,

  results:{},

  startedAt:null

};


/* ================================================================
   STATUS
   ================================================================ */

function setStatus(type,text){

  const status = gmEl('gm_status');

  if(!status){
    return;
  }

  status.className = 'gm-status ' + (type || '');

  const msg = gmEl('gm_statusText');

  if(msg){
    msg.textContent = text || '';
  }
}

function hideStatus(){

  const status = gmEl('gm_status');

  if(status){
    status.className = 'gm-status';
  }
}


/* ================================================================
   FETCH PING
   ================================================================ */

async function measurePing(url, timeout=3500){

  const controller = new AbortController();

  const timer = setTimeout(
    () => controller.abort(),
    timeout
  );

  const start = performance.now();

  try{

    await fetch(
      url + (url.includes('?') ? '&' : '?') +
      'fasqoo=' + Date.now() + Math.random(),
      {
        method:'GET',
        mode:'cors',
        cache:'no-store',
        credentials:'omit',
        signal:controller.signal
      }
    );

    return performance.now() - start;

  }catch(e){

    return null;

  }finally{

    clearTimeout(timer);

  }
}


/* ================================================================
   JITTER
   ================================================================ */

function calculateJitter(values){

  if(!values || values.length < 2){
    return 0;
  }

  let total = 0;

  for(let i=1;i<values.length;i++){

    total += Math.abs(
      values[i] - values[i-1]
    );

  }

  return total / (values.length - 1);
}


/* ================================================================
   CLASSIFICATION
   ================================================================ */

function statusLabel(status){

  if(status === 'excellent'){
    return t('stateExcellent');
  }

  if(status === 'ok'){
    return t('stateOk');
  }

  if(status === 'bad'){
    return t('stateBad');
  }

  if(status === 'testing'){
    return t('stateTesting');
  }

  return t('stateFailed');
}


function classifyPing(ping,jitter){

  if(
    Number.isFinite(ping) &&
    Number.isFinite(jitter)
  ){

    if(ping < 30 && jitter < 5){
      return 'excellent';
    }

    if(ping < 60 && jitter < 15){
      return 'ok';
    }

  }

  return 'bad';
}


/* ================================================================
   GRID
   ================================================================ */

function renderGrids(){

  const container = gmEl('gm_gameGrid');

  if(!container){
    return;
  }

  container.innerHTML = '';

  const groups = {
    A:[],
    B:[],
    C:[]
  };

  GAMES.forEach(game => {

    if(groups[game.cat]){
      groups[game.cat].push(game);
    }

  });

  Object.keys(groups).forEach(cat => {

    const group = groups[cat];

    if(!group.length){
      return;
    }

    const wrapper = document.createElement('div');

    wrapper.className = 'gm-category';

    group.forEach(game => {

      const card = document.createElement('article');

      card.className = 'gm-game-card';

      card.dataset.game = game.id;

      card.innerHTML = `

        <div class="gm-game-top">

          <div class="gm-game-icon">
            ${getGameIcon(game.id)}
          </div>

          <div class="gm-game-name">
            ${escapeHTML(game.name)}
          </div>

        </div>

        <div class="gm-game-provider">
          ${escapeHTML(game.provider)}
        </div>

        <div class="gm-game-result">

          <span class="gm-game-ping" data-ping>
            —
          </span>

          <span class="gm-game-unit">
            ms
          </span>

        </div>

        <div class="gm-game-jitter">
          ${t('labelJitter')}: —
        </div>

        <div class="gm-game-state" data-state>
          ${t('stateIdle')}
        </div>

      `;

      wrapper.appendChild(card);

    });

    container.appendChild(wrapper);

  });

  updateGameCards();

}


/* ================================================================
   HTML ESCAPE
   ================================================================ */

function escapeHTML(value){

  return String(value ?? '')
    .replace(/&/g,'&amp;')
    .replace(/</g,'&lt;')
    .replace(/>/g,'&gt;')
    .replace(/"/g,'&quot;')
    .replace(/'/g,'&#039;');

}


/* ================================================================
   GAME ICONS
   ================================================================ */

function getGameIcon(id){

  const icons = {

    valorant:
      '<span class="gm-letter-icon">V</span>',

    cs2:
      '<span class="gm-letter-icon">CS</span>',

    apex:
      '<span class="gm-letter-icon">A</span>',

    fortnite:
      '<span class="gm-letter-icon">F</span>',

    steam:
      '<span class="gm-letter-icon">S</span>',

    xbox:
      '<span class="gm-letter-icon">X</span>',

    psn:
      '<span class="gm-letter-icon">PS</span>',

    nintendo:
      '<span class="gm-letter-icon">N</span>',

    discord:
      '<span class="gm-letter-icon">D</span>',

    teamspeak:
      '<span class="gm-letter-icon">TS</span>',

    mumble:
      '<span class="gm-letter-icon">M</span>'

  };

  return icons[id] || '<span class="gm-letter-icon">G</span>';

}


/* ================================================================
   UPDATE CARDS
   ================================================================ */

function updateGameCards(){

  GAMES.forEach(game => {

    const card =
      document.querySelector(
        '.gm-game-card[data-game="' +
        CSS.escape(game.id) +
        '"]'
      );

    if(!card){
      return;
    }

    const result = state.results[game.id];

    const pingEl = card.querySelector('[data-ping]');
    const stateEl = card.querySelector('[data-state]');
    const jitterEl = card.querySelector('.gm-game-jitter');

    if(!result){

      if(pingEl){
        pingEl.textContent = '—';
      }

      if(stateEl){
        stateEl.textContent = t('stateIdle');
        stateEl.className = 'gm-game-state';
      }

      if(jitterEl){
        jitterEl.textContent =
          t('labelJitter') + ': —';
      }

      return;
    }

    if(pingEl){

      pingEl.textContent =
        Number.isFinite(result.ping)
          ? result.ping.toFixed(0)
          : '—';

    }

    if(jitterEl){

      jitterEl.textContent =
        t('labelJitter') + ': ' +
        (
          Number.isFinite(result.jitter)
            ? result.jitter.toFixed(1)
            : '—'
        ) +
        ' ms';

    }

    if(stateEl){

      stateEl.textContent =
        statusLabel(result.status);

      stateEl.className =
        'gm-game-state gm-' +
        result.status;

    }

  });

}


/* ================================================================
   RUN SINGLE GAME TEST
   ================================================================ */

async function testGame(game){

  const samples = [];

  for(
    let i=0;
    i<SAMPLES_PER_TARGET;
    i++
  ){

    if(state.abort){
      break;
    }

    setStatus(
      'testing',
      t('statusTesting')
        .replace('{name}',game.name)
    );

    const ping =
      await measurePing(
        game.url,
        3500
      );

    if(
      Number.isFinite(ping)
    ){

      samples.push(ping);

    }

    await sleep(120);

  }

  if(!samples.length){

    state.results[game.id] = {

      game,
      ping:null,
      jitter:null,
      samples:[],
      status:'bad'

    };

    return;

  }

  const average =
    samples.reduce(
      (a,b)=>a+b,
      0
    ) / samples.length;

  const jitter =
    calculateJitter(samples);

  const status =
    classifyPing(
      average,
      jitter
    );

  state.results[game.id] = {

    game,
    ping:average,
    jitter,
    samples,
    status

  };

  updateGameCards();

}


/* ================================================================
   SLEEP
   ================================================================ */

function sleep(ms){

  return new Promise(
    resolve => setTimeout(resolve,ms)
  );

}


/* ================================================================
   MAIN TEST
   ================================================================ */

async function runTest(){

  if(state.running){
    return;
  }

  state.running = true;
  state.abort = false;

  state.results = {};

  const startButton =
    gmEl('gm_startBtn');

  const stopButton =
    gmEl('gm_stopBtn');

  if(startButton){
    startButton.disabled = true;
  }

  if(stopButton){
    stopButton.disabled = false;
  }

  setStatus(
    'starting',
    t('statusStarting')
  );

  renderGrids();

  state.startedAt =
    new Date().toISOString();

  try{

    for(const game of GAMES){

      if(state.abort){
        break;
      }

      await testGame(game);

    }

    if(state.abort){

      setStatus(
        'stopped',
        t('statusStopped')
      );

    }else{

      setStatus(
        'success',
        t('statusDone')
      );

    }

    renderSummary();

    saveGamingHistory();

  }catch(error){

    console.error(
      'Fasqoo Gaming Monitor:',
      error
    );

    setStatus(
      'error',
      'Measurement error'
    );

  }finally{

    state.running = false;

    if(startButton){
      startButton.disabled = false;
    }

  }

}


/* ================================================================
   SUMMARY
   ================================================================ */

function calculateSummary(){

  const results =
    Object.values(state.results)
      .filter(
        r => Number.isFinite(r.ping)
      );

  if(!results.length){

    return {
      average:null,
      jitter:null,
      status:'bad',
      count:0
    };

  }

  const average =
    results.reduce(
      (sum,r)=>sum+r.ping,
      0
    ) / results.length;

  const jitter =
    results.reduce(
      (sum,r)=>sum+(r.jitter || 0),
      0
    ) / results.length;

  return {

    average,
    jitter,

    status:
      classifyPing(
        average,
        jitter
      ),

    count:results.length

  };

}


function renderSummary(){

  const summary =
    calculateSummary();

  const box =
    gmEl('gm_summary');

  if(!box){
    return;
  }

  box.classList.add('show');

  const avg =
    gmEl('gm_summaryAvg');

  const jitter =
    gmEl('gm_summaryJitter');

  const title =
    gmEl('gm_summaryTitle');

  const text =
    gmEl('gm_summaryText');

  if(avg){

    avg.textContent =
      Number.isFinite(summary.average)
        ? summary.average.toFixed(0) + ' ms'
        : '—';

  }

  if(jitter){

    jitter.textContent =
      Number.isFinite(summary.jitter)
        ? summary.jitter.toFixed(1) + ' ms'
        : '—';

  }

  if(title){

    if(summary.status === 'excellent'){
      title.textContent =
        t('summaryTitleExcellent');
    }
    else if(summary.status === 'ok'){
      title.textContent =
        t('summaryTitleGood');
    }
    else{
      title.textContent =
        t('summaryTitleBad');
    }

  }

  if(text){

    if(summary.status === 'excellent'){
      text.textContent =
        t('summaryTextExcellent');
    }
    else if(summary.status === 'ok'){
      text.textContent =
        t('summaryTextGood');
    }
    else{
      text.textContent =
        t('summaryTextBad');
    }

  }

}


/* ================================================================
   HISTORY
   ================================================================ */

const HISTORY_KEY =
  'fasqoo_gaming_monitor_history_v1';


function getGamingHistory(){

  try{

    return JSON.parse(
      localStorage.getItem(
        HISTORY_KEY
      ) || '[]'
    );

  }catch(e){

    return [];

  }

}


function saveGamingHistory(){

  const summary =
    calculateSummary();

  const history =
    getGamingHistory();

  history.unshift({

    timestamp:
      new Date().toISOString(),

    averagePing:
      Number.isFinite(summary.average)
        ? summary.average
        : null,

    jitter:
      Number.isFinite(summary.jitter)
        ? summary.jitter
        : null,

    status:
      summary.status,

    results:
      Object.values(state.results)
        .map(r => ({

          id:r.game.id,
          name:r.game.name,

          ping:
            Number.isFinite(r.ping)
              ? r.ping
              : null,

          jitter:
            Number.isFinite(r.jitter)
              ? r.jitter
              : null,

          status:r.status

        }))

  });

  try{

    localStorage.setItem(
      HISTORY_KEY,
      JSON.stringify(
        history.slice(0,5)
      )
    );

  }catch(e){}

  renderHistory();

}


function renderHistory(){

  const container =
    gmEl('gm_history');

  if(!container){
    return;
  }

  const history =
    getGamingHistory();

  if(!history.length){

    container.innerHTML = '';

    return;

  }

  container.innerHTML =
    history.map(item => {

      const date =
        new Date(
          item.timestamp
        ).toLocaleString();

      return `

        <div class="gm-history-row">

          <div>
            <strong>${escapeHTML(date)}</strong>
          </div>

          <div>
            ${
              Number.isFinite(item.averagePing)
                ? item.averagePing.toFixed(0) + ' ms'
                : '—'
            }
          </div>

          <div>
            ${
              Number.isFinite(item.jitter)
                ? item.jitter.toFixed(1) + ' ms'
                : '—'
            }
          </div>

          <div class="gm-history-status gm-${item.status}">
            ${escapeHTML(statusLabel(item.status))}
          </div>

        </div>

      `;

    }).join('');

}


/* ================================================================
   CLEAR HISTORY
   ================================================================ */

const clearHistory =
  gmEl('gm_clearHistory');

if(clearHistory){

  clearHistory.addEventListener(
    'click',
    function(){

      try{

        localStorage.removeItem(
          HISTORY_KEY
        );

      }catch(e){}

      renderHistory();

    }
  );

}


/* ================================================================
   COPY REPORT
   ================================================================ */

function showToast(message){

  const toast =
    gmEl('gm_toast');

  const toastMsg =
    gmEl('gm_toastMsg');

  if(!toast){
    return;
  }

  if(toastMsg){
    toastMsg.textContent =
      message;
  }

  toast.classList.add('show');

  clearTimeout(
    toast._timer
  );

  toast._timer =
    setTimeout(
      () => toast.classList.remove('show'),
      1800
    );

}


function fallbackCopy(text){

  const textarea =
    document.createElement('textarea');

  textarea.value = text;

  textarea.style.position =
    'fixed';

  textarea.style.opacity =
    '0';

  document.body.appendChild(
    textarea
  );

  textarea.select();

  try{

    document.execCommand(
      'copy'
    );

    showToast(
      t('reportCopied')
    );

  }catch(e){

    showToast(
      'Copy failed'
    );

  }

  document.body.removeChild(
    textarea
  );

}


function copyText(text){

  if(
    navigator.clipboard &&
    window.isSecureContext
  ){

    navigator.clipboard.writeText(
      text
    ).then(

      () => showToast(
        t('reportCopied')
      ),

      () => fallbackCopy(text)

    );

  }else{

    fallbackCopy(text);

  }

}


const copyReport =
  gmEl('gm_copyReport');

if(copyReport){

  copyReport.addEventListener(
    'click',
    function(){

      const lines = [];

      lines.push(
        'Fasqoo Gaming & Ping Monitor'
      );

      lines.push(
        'Generated: ' +
        new Date().toLocaleString()
      );

      lines.push('');

      GAMES.forEach(game => {

        const r =
          state.results[game.id];

        if(!r){
          return;
        }

        if(Number.isFinite(r.ping)){

          lines.push(

            game.name +
            ' (' +
            game.provider +
            '): ' +

            r.ping.toFixed(0) +
            ' ms · Jitter ' +

            r.jitter.toFixed(1) +
            ' ms · ' +

            statusLabel(r.status) +

            ' · ' +

            r.samples.length +
            '/' +
            SAMPLES_PER_TARGET +
            ' samples'

          );

        }else{

          lines.push(
            game.name +
            ' (' +
            game.provider +
            '): unreachable'
          );

        }

      });

      copyText(
        lines.join('\n')
      );

    }
  );

}


/* ================================================================
   JSON EXPORT
   ================================================================ */

const exportJson =
  gmEl('gm_exportJson');

if(exportJson){

  exportJson.addEventListener(
    'click',
    function(){

      const report = {

        tool:
          'Fasqoo Gaming & Ping Monitor',

        generatedAt:
          new Date().toISOString(),

        samplesPerTarget:
          SAMPLES_PER_TARGET,

        results:
          GAMES.map(game => {

            const r =
              state.results[game.id];

            if(!r){

              return {

                id:game.id,
                name:game.name,
                provider:game.provider,
                status:'not-tested'

              };

            }

            return {

              id:game.id,
              name:game.name,
              provider:game.provider,
              category:game.cat,
              endpoint:game.url,

              pingMs:
                Number.isFinite(r.ping)
                  ? Math.round(r.ping * 10) / 10
                  : null,

              jitterMs:
                Number.isFinite(r.jitter)
                  ? Math.round(r.jitter * 10) / 10
                  : null,

              samples:
                r.samples.map(
                  value =>
                    Math.round(value * 10) / 10
                ),

              status:r.status

            };

          })

      };

      const blob =
        new Blob(
          [
            JSON.stringify(
              report,
              null,
              2
            )
          ],
          {
            type:'application/json'
          }
        );

      const a =
        document.createElement('a');

      a.href =
        URL.createObjectURL(blob);

      a.download =
        'fasqoo-ping-report-' +
        Date.now() +
        '.json';

      document.body.appendChild(a);

      a.click();

      document.body.removeChild(a);

      URL.revokeObjectURL(
        a.href
      );

      showToast(
        t('jsonExported')
      );

    }
  );

}


/* ================================================================
   20 SECOND LIVE MONITOR
   ================================================================ */

let fq20Running = false;

let fq20Timer = null;

let fq20Samples = [];

let fq20Start = 0;


function fq20Set(id,value){

  const el =
    gmEl(id);

  if(el){
    el.textContent =
      value;
  }

}


function fq20Render(){

  const pingValues =
    fq20Samples.filter(
      v => Number.isFinite(v)
    );

  if(!pingValues.length){

    fq20Set(
      'gm_fq20Ping',
      '—'
    );

    fq20Set(
      'gm_fq20Jitter',
      '—'
    );

    fq20Set(
      'gm_fq20Loss',
      '—'
    );

    return;

  }

  const average =
    pingValues.reduce(
      (a,b)=>a+b,
      0
    ) /
    pingValues.length;

  const jitter =
    calculateJitter(
      pingValues
    );

  const loss =
    (
      (fq20Samples.length -
       pingValues.length)
      /
      Math.max(
        1,
        fq20Samples.length
      )
    ) * 100;

  fq20Set(
    'gm_fq20Ping',
    average.toFixed(0)
  );

  fq20Set(
    'gm_fq20Jitter',
    jitter.toFixed(1)
  );

  fq20Set(
    'gm_fq20Loss',
    loss.toFixed(0)
  );


  let resultText = '';

  if(
    average < 20 &&
    jitter < 5
  ){

    resultText =
      '🚀 E-Sports Ready';

  }
  else if(
    average < 45 &&
    jitter < 12
  ){

    resultText =
      '👍 Stabil für Casual-Gaming';

  }
  else{

    resultText =
      '⚠️ Ping-Spikes / Instabil';

  }

  fq20Set(
    'gm_fq20ResultTitle',
    resultText
  );

}


/* ================================================================
   20 SECOND TEST
   ================================================================ */

async function run20SecondMonitor(){

  if(fq20Running){
    return;
  }

  fq20Running = true;

  fq20Samples = [];

  fq20Start =
    Date.now();

  const startButton =
    gmEl('gm_fq20Start');

  if(startButton){
    startButton.disabled = true;
  }

  const progress =
    gmEl('gm_fq20Progress');

  const graph =
    gmEl('gm_fq20Graph');

  const ctx =
    graph ?
    graph.getContext('2d') :
    null;

  const endpoint =
    '/cdn-cgi/trace';

  for(
    let second=0;
    second<20;
    second++
  ){

    const elapsed =
      Date.now() -
      fq20Start;

    if(progress){

      progress.style.width =
        Math.min(
          100,
          (elapsed / 20000) * 100
        ) + '%';

    }

    const ping =
      await measurePing(
        endpoint,
        900
      );

    fq20Samples.push(
      Number.isFinite(ping)
        ? ping
        : null
    );

    fq20Render();

    if(ctx && graph){

      draw20SecondGraph(
        ctx,
        graph,
        fq20Samples
      );

    }

    const wait =
      1000 -
      (
        Date.now() -
        (
          fq20Start +
          second * 1000
        )
      );

    if(wait > 0){

      await sleep(wait);

    }

  }

  if(progress){

    progress.style.width =
      '100%';

  }

  fq20Render();

  fq20Running = false;

  if(startButton){
    startButton.disabled = false;
  }

}


/* ================================================================
   GRAPH
   ================================================================ */

function draw20SecondGraph(
  ctx,
  canvas,
  values
){

  const rect =
    canvas.getBoundingClientRect();

  const dpr =
    window.devicePixelRatio || 1;

  canvas.width =
    Math.max(
      1,
      Math.floor(rect.width * dpr)
    );

  canvas.height =
    Math.max(
      1,
      Math.floor(rect.height * dpr)
    );

  ctx.setTransform(
    dpr,
    0,
    0,
    dpr,
    0,
    0
  );

  const width =
    rect.width;

  const height =
    rect.height;

  ctx.clearRect(
    0,
    0,
    width,
    height
  );

  const valid =
    values.filter(
      Number.isFinite
    );

  if(!valid.length){
    return;
  }

  const max =
    Math.max(
      50,
      ...valid
    );

  const min =
    0;

  ctx.beginPath();

  values.forEach(
    (value,index) => {

      if(!Number.isFinite(value)){
        return;
      }

      const x =
        values.length === 1
          ? 0
          : (
              index /
              Math.max(
                1,
                values.length - 1
              )
            ) *
            width;

      const y =
        height -
        (
          (value - min) /
          Math.max(
            1,
            max - min
          )
        ) *
        height;

      if(index === 0){
        ctx.moveTo(x,y);
      }else{
        ctx.lineTo(x,y);
      }

    }
  );

  ctx.lineWidth = 3;

  ctx.strokeStyle =
    '#ff5a1f';

  ctx.stroke();

}


/* ================================================================
   20 SECOND BUTTON
   ================================================================ */

const fq20StartButton =
  gmEl('gm_fq20Start');

if(fq20StartButton){

  fq20StartButton.addEventListener(
    'click',
    run20SecondMonitor
  );

}


/* ================================================================
   THEME SWITCHING
   ================================================================ */

function setupGamingTheme(){

  const themeButtons =
    document.querySelectorAll(
      '[data-theme], #themeToggle, #darkModeToggle'
    );

  themeButtons.forEach(
    button => {

      button.addEventListener(
        'click',
        function(){

          document.body.classList.add(
            'theme-switching'
          );

          requestAnimationFrame(
            () => {

              setTimeout(
                () => {

                  document.body.classList.remove(
                    'theme-switching'
                  );

                },
                0
              );

            }
          );

        }
      );

    }
  );

}


/* ================================================================
   EXTRA TRANSLATIONS
   ================================================================ */

const GM_EXTRA_TRANSLATIONS = {

  en:{

    ispKicker:
      'CONNECTION INFORMATION',

    ispTitle:
      'Your network connection',

    ispSub:
      'Detected directly in your browser. No account required.',

    ispLive:
      'LIVE',

    ispProvider:
      'ISP / Provider',

    ispIp:
      'Public IP',

    ispLocation:
      'Location',

    ispNetwork:
      'Network / ASN',

    ispUnavailable:
      'Unavailable',

    downloadImage:
      'Download as image',

    imageDownloaded:
      'Image downloaded'

  },

  de:{

    ispKicker:
      'VERBINDUNGSINFORMATIONEN',

    ispTitle:
      'Deine Netzwerkverbindung',

    ispSub:
      'Direkt im Browser erkannt. Kein Konto erforderlich.',

    ispLive:
      'LIVE',

    ispProvider:
      'ISP / Anbieter',

    ispIp:
      'Öffentliche IP',

    ispLocation:
      'Standort',

    ispNetwork:
      'Netzwerk / ASN',

    ispUnavailable:
      'Nicht verfügbar',

    downloadImage:
      'Als Bild herunterladen',

    imageDownloaded:
      'Bild heruntergeladen'

  },

  fr:{

    ispKicker:
      'INFORMATIONS DE CONNEXION',

    ispTitle:
      'Votre connexion réseau',

    ispSub:
      'Détectée directement dans votre navigateur. Aucun compte requis.',

    ispLive:
      'EN DIRECT',

    ispProvider:
      'FAI / Fournisseur',

    ispIp:
      'IP publique',

    ispLocation:
      'Emplacement',

    ispNetwork:
      'Réseau / ASN',

    ispUnavailable:
      'Indisponible',

    downloadImage:
      'Télécharger en image',

    imageDownloaded:
      'Image téléchargée'

  },

  es:{

    ispKicker:
      'INFORMACIÓN DE CONEXIÓN',

    ispTitle:
      'Tu conexión de red',

    ispSub:
      'Detectada directamente en tu navegador. No se requiere cuenta.',

    ispLive:
      'EN VIVO',

    ispProvider:
      'ISP / Proveedor',

    ispIp:
      'IP pública',

    ispLocation:
      'Ubicación',

    ispNetwork:
      'Red / ASN',

    ispUnavailable:
      'No disponible',

    downloadImage:
      'Descargar como imagen',

    imageDownloaded:
      'Imagen descargada'

  },

  it:{

    ispKicker:
      'INFORMAZIONI CONNESSIONE',

    ispTitle:
      'La tua connessione di rete',

    ispSub:
      'Rilevata direttamente nel browser. Nessun account richiesto.',

    ispLive:
      'LIVE',

    ispProvider:
      'ISP / Provider',

    ispIp:
      'IP pubblica',

    ispLocation:
      'Posizione',

    ispNetwork:
      'Rete / ASN',

    ispUnavailable:
      'Non disponibile',

    downloadImage:
      'Scarica come immagine',

    imageDownloaded:
      'Immagine scaricata'

  },

  pt:{

    ispKicker:
      'INFORMAÇÕES DA CONEXÃO',

    ispTitle:
      'Sua conexão de rede',

    ispSub:
      'Detectada diretamente no navegador. Não é necessária uma conta.',

    ispLive:
      'AO VIVO',

    ispProvider:
      'ISP / Provedor',

    ispIp:
      'IP pública',

    ispLocation:
      'Localização',

    ispNetwork:
      'Rede / ASN',

    ispUnavailable:
      'Indisponível',

    downloadImage:
      'Baixar como imagem',

    imageDownloaded:
      'Imagem baixada'

  },

  nl:{

    ispKicker:
      'VERBINDINGSINFORMATIE',

    ispTitle:
      'Je netwerkverbinding',

    ispSub:
      'Direct in je browser gedetecteerd. Geen account nodig.',

    ispLive:
      'LIVE',

    ispProvider:
      'ISP / Provider',

    ispIp:
      'Publiek IP',

    ispLocation:
      'Locatie',

    ispNetwork:
      'Netwerk / ASN',

    ispUnavailable:
      'Niet beschikbaar',

    downloadImage:
      'Als afbeelding downloaden',

    imageDownloaded:
      'Afbeelding gedownload'

  },

  tr:{

    ispKicker:
      'BAĞLANTI BİLGİLERİ',

    ispTitle:
      'Ağ bağlantınız',

    ispSub:
      'Doğrudan tarayıcınızda algılanır. Hesap gerekmez.',

    ispLive:
      'CANLI',

    ispProvider:
      'ISS / Sağlayıcı',

    ispIp:
      'Genel IP',

    ispLocation:
      'Konum',

    ispNetwork:
      'Ağ / ASN',

    ispUnavailable:
      'Kullanılamıyor',

    downloadImage:
      'Görüntü olarak indir',

    imageDownloaded:
      'Görüntü indirildi'

  },

  sq:{

    ispKicker:
      'INFORMACIONI I LIDHJES',

    ispTitle:
      'Lidhja juaj e rrjetit',

    ispSub:
      'Zbulohet direkt në shfletues. Nuk kërkohet llogari.',

    ispLive:
      'LIVE',

    ispProvider:
      'ISP / Ofruesi',

    ispIp:
      'IP publike',

    ispLocation:
      'Vendndodhja',

    ispNetwork:
      'Rrjeti / ASN',

    ispUnavailable:
      'Nuk disponohet',

    downloadImage:
      'Shkarko si imazh',

    imageDownloaded:
      'Imazhi u shkarkua'

  },

  ar:{

    ispKicker:
      'معلومات الاتصال',

    ispTitle:
      'اتصال الشبكة لديك',

    ispSub:
      'يتم اكتشافه مباشرة في المتصفح. لا يتطلب حسابًا.',

    ispLive:
      'مباشر',

    ispProvider:
      'مزود الإنترنت',

    ispIp:
      'عنوان IP العام',

    ispLocation:
      'الموقع',

    ispNetwork:
      'الشبكة / ASN',

    ispUnavailable:
      'غير متاح',

    downloadImage:
      'تنزيل كصورة',

    imageDownloaded:
      'تم تنزيل الصورة'

  }

};


Object.keys(
  GM_EXTRA_TRANSLATIONS
).forEach(
  lang => {

    Object.assign(
      I18N[lang] ||
      (I18N[lang] = {}),

      GM_EXTRA_TRANSLATIONS[lang]
    );

  }
);


/* ================================================================
   GAMING LOCALIZATION
   ================================================================ */

function applyGamingLang(lang){

  const safe =
    I18N[lang]
      ? lang
      : 'en';

  const dict =
    I18N[safe] ||
    I18N.en;

  document
    .querySelectorAll(
      '#gaming-section [data-gm-i18n]'
    )
    .forEach(
      element => {

        const key =
          element.getAttribute(
            'data-gm-i18n'
          );

        if(
          dict[key] !== undefined
        ){

          element.textContent =
            dict[key];

        }

      }
    );

  renderGrids();

  if(
    gmEl('gm_summary') &&
    gmEl('gm_summary')
      .classList
      .contains('show')
  ){

    renderSummary();

  }

}


function initGamingLang(){

  const langEl =
    document.getElementById('lang');

  const lang =
    langEl &&
    I18N[langEl.value]
      ? langEl.value
      : 'en';

  applyGamingLang(lang);

}


const gmLangEl =
  document.getElementById('lang');

if(gmLangEl){

  gmLangEl.addEventListener(
    'change',
    function(){

      applyGamingLang(
        gmLangEl.value
      );

    }
  );

}


/* ================================================================
   ISP / PUBLIC IP DETECTION
   ================================================================ */

async function loadGamingISP(){

  const fields = {

    provider:
      gmEl('gm_ispProvider'),

    ip:
      gmEl('gm_ispIp'),

    location:
      gmEl('gm_ispLocation'),

    network:
      gmEl('gm_ispNetwork')

  };

  if(!fields.provider){
    return;
  }

  const set =
    function(key,value){

      if(fields[key]){

        fields[key].textContent =
          value ||
          t('ispUnavailable');

      }

    };


  try{

    const controller =
      new AbortController();

    const timer =
      setTimeout(
        () => controller.abort(),
        3500
      );

    const response =
      await fetch(
        'https://ipwho.is/?fields=success,ip,continent,country,city,connection',
        {
          cache:'no-store',
          credentials:'omit',
          signal:controller.signal
        }
      );

    clearTimeout(timer);

    const data =
      await response.json();

    if(
      !data ||
      data.success === false
    ){

      throw new Error(
        'ISP lookup failed'
      );

    }

    const connection =
      data.connection || {};

    set(
      'provider',
      connection.isp ||
      connection.org ||
      '—'
    );

    set(
      'ip',
      data.ip ||
      '—'
    );

    const place =
      [
        data.city,
        data.country
      ]
      .filter(Boolean)
      .join(', ');

    set(
      'location',
      place || '—'
    );

    const asn =
      connection.asn
        ? 'AS' +
          String(
            connection.asn
          ).replace(
            /^AS/i,
            ''
          )
        : '';

    const org =
      connection.org ||
      '';

    set(
      'network',
      [
        asn,
        org
      ]
      .filter(Boolean)
      .join(' · ') ||
      '—'
    );

  }catch(error){

    set(
      'provider',
      'Unavailable'
    );

    set(
      'ip',
      'Unavailable'
    );

    set(
      'location',
      'Unavailable'
    );

    set(
      'network',
      'Unavailable'
    );

  }

}


/* ================================================================
   IMAGE REPORT DOWNLOAD
   ================================================================ */

function downloadGamingImage(){

  const canvas =
    document.createElement(
      'canvas'
    );

  const W = 1600;
  const H = 1000;

  canvas.width = W;
  canvas.height = H;

  const ctx =
    canvas.getContext('2d');

  const dark =
    document.body.classList.contains(
      'dark'
    );

  const bg =
    dark
      ? '#090c10'
      : '#ffffff';

  const fg =
    dark
      ? '#f4f6f8'
      : '#10141a';

  const muted =
    dark
      ? '#98a2ae'
      : '#69727e';


  ctx.fillStyle = bg;

  ctx.fillRect(
    0,
    0,
    W,
    H
  );


  ctx.fillStyle =
    '#ff5a1f';

  ctx.fillRect(
    0,
    0,
    W,
    12
  );


  ctx.font =
    '800 56px Inter, Arial, sans-serif';

  ctx.fillStyle =
    fg;

  ctx.fillText(
    'Fasqoo Gaming & Ping Monitor',
    70,
    105
  );


  ctx.font =
    '400 24px Inter, Arial, sans-serif';

  ctx.fillStyle =
    muted;

  ctx.fillText(
    'Gaming latency, jitter and connection diagnostics',
    70,
    148
  );


  let y = 215;

  ctx.font =
    '700 28px Inter, Arial, sans-serif';

  ctx.fillStyle =
    fg;

  ctx.fillText(
    'Connection',
    70,
    y
  );

  y += 48;


  ctx.font =
    '500 24px Inter, Arial, sans-serif';


  const connRows = [

    [
      'ISP / Provider',
      gmEl(
        'gm_ispProvider'
      )?.textContent ||
      '—'
    ],

    [
      'Public IP',
      gmEl(
        'gm_ispIp'
      )?.textContent ||
      '—'
    ],

    [
      'Location',
      gmEl(
        'gm_ispLocation'
      )?.textContent ||
      '—'
    ],

    [
      'Network / ASN',
      gmEl(
        'gm_ispNetwork'
      )?.textContent ||
      '—'
    ]

  ];


  connRows.forEach(
    ([label,value],index) => {

      const x =
        index % 2
          ? 820
          : 70;

      const yy =
        y +
        Math.floor(
          index / 2
        ) *
        58;

      ctx.fillStyle =
        muted;

      ctx.fillText(
        label,
        x,
        yy
      );

      ctx.fillStyle =
        fg;

      ctx.font =
        '700 24px Inter, Arial, sans-serif';

      ctx.fillText(
        String(value).slice(
          0,
          42
        ),
        x,
        yy + 28
      );

      ctx.font =
        '500 24px Inter, Arial, sans-serif';

    }
  );


  y = 365;

  ctx.font =
    '700 28px Inter, Arial, sans-serif';

  ctx.fillStyle =
    fg;

  ctx.fillText(
    '20-second monitor',
    70,
    y
  );


  y += 52;


  const values = [

    [
      'Average ping',
      (
        gmEl(
          'gm_fq20Ping'
        )?.textContent ||
        '—'
      ) +
      ' ms'
    ],

    [
      'Jitter',
      (
        gmEl(
          'gm_fq20Jitter'
        )?.textContent ||
        '—'
      ) +
      ' ms'
    ],

    [
      'Packet loss',
      (
        gmEl(
          'gm_fq20Loss'
        )?.textContent ||
        '—'
      ) +
      ' %'
    ],

    [
      'Gaming result',
      gmEl(
        'gm_fq20ResultTitle'
      )?.textContent ||
      '—'
    ]

  ];


  values.forEach(
    ([label,value],index) => {

      const x =
        70 +
        (index % 2) *
        750;

      const yy =
        y +
        Math.floor(
          index / 2
        ) *
        72;

      ctx.fillStyle =
        muted;

      ctx.font =
        '500 22px Inter, Arial, sans-serif';

      ctx.fillText(
        label,
        x,
        yy
      );

      ctx.fillStyle =
        fg;

      ctx.font =
        '700 26px Inter, Arial, sans-serif';

      ctx.fillText(
        String(value).slice(
          0,
          48
        ),
        x,
        yy + 31
      );

    }
  );


  y = 570;

  ctx.fillStyle =
    fg;

  ctx.font =
    '700 28px Inter, Arial, sans-serif';

  ctx.fillText(
    'Gaming servers',
    70,
    y
  );


  const rows =
    GAMES
      .map(
        game =>
          state.results[
            game.id
          ]
      )
      .filter(Boolean);


  y += 48;


  ctx.font =
    '500 20px Inter, Arial, sans-serif';


  rows
    .slice(0,12)
    .forEach(
      (result,index) => {

        const x =
          index % 2
            ? 820
            : 70;

        const yy =
          y +
          Math.floor(
            index / 2
          ) *
          48;

        ctx.fillStyle =
          fg;

        const ping =
          Number.isFinite(
            result.ping
          )
            ? result.ping.toFixed(0) +
              ' ms'
            : '—';

        ctx.fillText(
          (
            result.game.name ||
            result.id
          ).slice(
            0,
            30
          ),
          x,
          yy
        );

        ctx.fillStyle =
          muted;

        ctx.fillText(
          ping,
          x + 330,
          yy
        );

      }
    );


  ctx.fillStyle =
    muted;

  ctx.font =
    '400 18px Inter, Arial, sans-serif';

  ctx.fillText(
    'fasqoo.com · Browser-based measurement',
    70,
    H - 55
  );


  const a =
    document.createElement('a');

  a.download =
    'fasqoo-gaming-monitor-' +
    Date.now() +
    '.png';

  a.href =
    canvas.toDataURL(
      'image/png'
    );

  a.click();


  showToast(
    t('imageDownloaded')
  );

}


const gmImageBtn =
  gmEl(
    'gm_downloadImage'
  );

if(gmImageBtn){

  gmImageBtn.addEventListener(
    'click',
    downloadGamingImage
  );

}


/* ================================================================
   INITIALIZATION
   ================================================================ */

renderGrids();

renderHistory();

setupGamingTheme();

initGamingLang();

loadGamingISP();


})();
