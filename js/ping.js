/* ============================================================
   FASQOO – Tab-Navigation + Stabilität & Ping-Monitor
   Modern, minimalistisch, voll übersetzt (10 Sprachen)
   ============================================================ */
(function(){
  'use strict';

  const $ = id => document.getElementById(id);
  const sleep = ms => new Promise(r => setTimeout(r, ms));

  /* ============================================================
     ÜBERSETZUNGEN (10 Sprachen, synchron mit app.js)
     ============================================================ */
  const PING_TRANSLATIONS = {
    en:{
      kicker:'Live Network Stability',
      title:'Stability & Ping Monitor',
      phasePing:'Ping', phaseJitter:'Jitter', phaseLoss:'Loss',
      installApp:'Install Fasqoo as App',
      serverSelection:'Server Selection',
      regionEurope:'Europe', regionAmericas:'Americas',
      regionAsia:'Asia', regionOceania:'Oceania',
      modeTitle:'Test Mode',
      modeNormal:'Normal', modeOverload:'Overload',
      modeHint:'Normal measures standard values. Overload simulates dense network load for live streams & voice chats.',
      startBtn:'Start measurement',
      statusIdle:'Select servers & mode, then start the measurement.',
      statusRunning:'Measuring …',
      statusDone:'Measurement complete',
      statusSelectServer:'⚠️ Please select at least one server.',
      statusCleared:'History cleared.',
      metricPing:'Latency', metricJitter:'Jitter', metricLoss:'Packet Loss',
      chartTitle:'Live Graph', chartHintIdle:'Waiting for measurement…',
      chartHintCollecting:'Collecting data …',
      chartHintRound:'Round',
      chartHintSamples:'samples',
      chartHintDone:'Done',
      chartHintSuccessful:'successful measurements',
      chartNoData:'No data yet – start the measurement',
      thServer:'Server', thPing:'Ø Latency', thJitter:'Jitter',
      thLoss:'Loss', thMinMax:'Min / Max',
      thTime:'Time', thServers:'Servers',
      noResults:'No measurements yet.',
      noHistory:'No saved tests yet.',
      shareBtn:'Share as image', clearBtn:'Clear history',
      historyTitle:'Recent Tests',
      confirmClear:'Really delete history?',
      modeNormalLabel:'Normal', modeOverloadLabel:'Overload',
      serverCount:'servers'
    },
    de:{
      kicker:'Live Netzwerk-Stabilität',
      title:'Stabilität & Ping-Monitor',
      phasePing:'Ping', phaseJitter:'Jitter', phaseLoss:'Verlust',
      installApp:'Fasqoo als App installieren',
      serverSelection:'Server-Auswahl',
      regionEurope:'Europa', regionAmericas:'Amerika',
      regionAsia:'Asien', regionOceania:'Ozeanien',
      modeTitle:'Test-Modus',
      modeNormal:'Normal', modeOverload:'Überlastung',
      modeHint:'Normal misst Standardwerte. Überlastung simuliert dichte Netzwerk-Last für Live-Streams & Sprach-Chats.',
      startBtn:'Messung starten',
      statusIdle:'Wähle Server & Modus, dann starte die Messung.',
      statusRunning:'Messung läuft …',
      statusDone:'Messung abgeschlossen',
      statusSelectServer:'⚠️ Bitte mindestens einen Server auswählen.',
      statusCleared:'Verlauf gelöscht.',
      metricPing:'Verzögerung', metricJitter:'Jitter', metricLoss:'Paketverlust',
      chartTitle:'Live-Verlauf', chartHintIdle:'Warte auf Messung…',
      chartHintCollecting:'Sammle Daten …',
      chartHintRound:'Runde',
      chartHintSamples:'Samples',
      chartHintDone:'Fertig',
      chartHintSuccessful:'erfolgreiche Messungen',
      chartNoData:'Noch keine Daten – starte die Messung',
      thServer:'Server', thPing:'Ø Verzögerung', thJitter:'Jitter',
      thLoss:'Verlust', thMinMax:'Min / Max',
      thTime:'Zeit', thServers:'Server',
      noResults:'Noch keine Messergebnisse.',
      noHistory:'Noch keine gespeicherten Tests.',
      shareBtn:'Als Bild teilen', clearBtn:'Verlauf löschen',
      historyTitle:'Letzte Tests',
      confirmClear:'Verlauf wirklich löschen?',
      modeNormalLabel:'Normal', modeOverloadLabel:'Überlastung',
      serverCount:'Server'
    },
    fr:{
      kicker:'Stabilité réseau en direct', title:'Stabilité & Moniteur Ping',
      phasePing:'Ping', phaseJitter:'Gigue', phaseLoss:'Perte',
      installApp:'Installer Fasqoo',
      serverSelection:'Sélection du serveur',
      regionEurope:'Europe', regionAmericas:'Amériques',
      regionAsia:'Asie', regionOceania:'Océanie',
      modeTitle:'Mode de test', modeNormal:'Normal', modeOverload:'Surcharge',
      modeHint:'Normal mesure les valeurs standard. Surcharge simule une charge réseau dense pour les flux en direct et les chats vocaux.',
      startBtn:'Démarrer la mesure',
      statusIdle:'Sélectionnez les serveurs et le mode, puis démarrez.',
      statusRunning:'Mesure en cours …', statusDone:'Mesure terminée',
      statusSelectServer:'⚠️ Sélectionnez au moins un serveur.',
      statusCleared:'Historique effacé.',
      metricPing:'Latence', metricJitter:'Gigue', metricLoss:'Perte de paquets',
      chartTitle:'Graphique en direct', chartHintIdle:'En attente…',
      chartHintCollecting:'Collecte des données …',
      chartHintRound:'Tour', chartHintSamples:'échantillons',
      chartHintDone:'Terminé', chartHintSuccessful:'mesures réussies',
      chartNoData:'Aucune donnée – démarrez la mesure',
      thServer:'Serveur', thPing:'Latence Ø', thJitter:'Gigue',
      thLoss:'Perte', thMinMax:'Min / Max',
      thTime:'Heure', thServers:'Serveurs',
      noResults:'Aucune mesure pour le moment.',
      noHistory:'Aucun test enregistré.',
      shareBtn:'Partager en image', clearBtn:'Effacer l\'historique',
      historyTitle:'Tests récents',
      confirmClear:'Vraiment effacer l\'historique ?',
      modeNormalLabel:'Normal', modeOverloadLabel:'Surcharge',
      serverCount:'serveurs'
    },
    es:{
      kicker:'Estabilidad de red en vivo', title:'Estabilidad y Monitor de Ping',
      phasePing:'Ping', phaseJitter:'Jitter', phaseLoss:'Pérdida',
      installApp:'Instalar Fasqoo',
      serverSelection:'Selección de servidor',
      regionEurope:'Europa', regionAmericas:'América',
      regionAsia:'Asia', regionOceania:'Oceanía',
      modeTitle:'Modo de prueba', modeNormal:'Normal', modeOverload:'Sobrecarga',
      modeHint:'Normal mide valores estándar. Sobrecarga simula carga de red densa para transmisiones en vivo y chats de voz.',
      startBtn:'Iniciar medición',
      statusIdle:'Selecciona servidores y modo, luego inicia la medición.',
      statusRunning:'Midiendo …', statusDone:'Medición completada',
      statusSelectServer:'⚠️ Selecciona al menos un servidor.',
      statusCleared:'Historial borrado.',
      metricPing:'Latencia', metricJitter:'Jitter', metricLoss:'Pérdida de paquetes',
      chartTitle:'Gráfico en vivo', chartHintIdle:'Esperando medición…',
      chartHintCollecting:'Recopilando datos …',
      chartHintRound:'Ronda', chartHintSamples:'muestras',
      chartHintDone:'Listo', chartHintSuccessful:'mediciones exitosas',
      chartNoData:'Sin datos – inicia la medición',
      thServer:'Servidor', thPing:'Latencia Ø', thJitter:'Jitter',
      thLoss:'Pérdida', thMinMax:'Mín / Máx',
      thTime:'Hora', thServers:'Servidores',
      noResults:'Sin mediciones aún.',
      noHistory:'Sin pruebas guardadas.',
      shareBtn:'Compartir como imagen', clearBtn:'Borrar historial',
      historyTitle:'Pruebas recientes',
      confirmClear:'¿Borrar el historial?',
      modeNormalLabel:'Normal', modeOverloadLabel:'Sobrecarga',
      serverCount:'servidores'
    },
    it:{
      kicker:'Stabilità di rete in tempo reale', title:'Stabilità e Monitor Ping',
      phasePing:'Ping', phaseJitter:'Jitter', phaseLoss:'Perdita',
      installApp:'Installa Fasqoo',
      serverSelection:'Selezione server',
      regionEurope:'Europa', regionAmericas:'Americhe',
      regionAsia:'Asia', regionOceania:'Oceania',
      modeTitle:'Modalità test', modeNormal:'Normale', modeOverload:'Sovraccarico',
      modeHint:'Normale misura valori standard. Sovraccarico simula carico di rete intenso per streaming live e chat vocali.',
      startBtn:'Avvia misurazione',
      statusIdle:'Seleziona server e modalità, poi avvia la misurazione.',
      statusRunning:'Misurazione …', statusDone:'Misurazione completata',
      statusSelectServer:'⚠️ Seleziona almeno un server.',
      statusCleared:'Cronologia cancellata.',
      metricPing:'Latenza', metricJitter:'Jitter', metricLoss:'Perdita pacchetti',
      chartTitle:'Grafico in tempo reale', chartHintIdle:'In attesa…',
      chartHintCollecting:'Raccolta dati …',
      chartHintRound:'Round', chartHintSamples:'campioni',
      chartHintDone:'Fatto', chartHintSuccessful:'misurazioni riuscite',
      chartNoData:'Nessun dato – avvia la misurazione',
      thServer:'Server', thPing:'Latenza Ø', thJitter:'Jitter',
      thLoss:'Perdita', thMinMax:'Min / Max',
      thTime:'Ora', thServers:'Server',
      noResults:'Nessuna misurazione.',
      noHistory:'Nessun test salvato.',
      shareBtn:'Condividi come immagine', clearBtn:'Cancella cronologia',
      historyTitle:'Test recenti',
      confirmClear:'Cancellare la cronologia?',
      modeNormalLabel:'Normale', modeOverloadLabel:'Sovraccarico',
      serverCount:'server'
    },
    pt:{
      kicker:'Estabilidade de rede ao vivo', title:'Estabilidade e Monitor de Ping',
      phasePing:'Ping', phaseJitter:'Jitter', phaseLoss:'Perda',
      installApp:'Instalar Fasqoo',
      serverSelection:'Seleção de servidor',
      regionEurope:'Europa', regionAmericas:'Américas',
      regionAsia:'Ásia', regionOceania:'Oceania',
      modeTitle:'Modo de teste', modeNormal:'Normal', modeOverload:'Sobrecarga',
      modeHint:'Normal mede valores padrão. Sobrecarga simula carga de rede intensa para streams ao vivo e chats de voz.',
      startBtn:'Iniciar medição',
      statusIdle:'Selecione servidores e modo, depois inicie.',
      statusRunning:'A medir …', statusDone:'Medição concluída',
      statusSelectServer:'⚠️ Selecione pelo menos um servidor.',
      statusCleared:'Histórico apagado.',
      metricPing:'Latência', metricJitter:'Jitter', metricLoss:'Perda de pacotes',
      chartTitle:'Gráfico ao vivo', chartHintIdle:'A aguardar…',
      chartHintCollecting:'A recolher dados …',
      chartHintRound:'Ronda', chartHintSamples:'amostras',
      chartHintDone:'Concluído', chartHintSuccessful:'medições bem-sucedidas',
      chartNoData:'Sem dados – inicie a medição',
      thServer:'Servidor', thPing:'Latência Ø', thJitter:'Jitter',
      thLoss:'Perda', thMinMax:'Mín / Máx',
      thTime:'Hora', thServers:'Servidores',
      noResults:'Sem medições.',
      noHistory:'Sem testes guardados.',
      shareBtn:'Partilhar como imagem', clearBtn:'Limpar histórico',
      historyTitle:'Testes recentes',
      confirmClear:'Apagar o histórico?',
      modeNormalLabel:'Normal', modeOverloadLabel:'Sobrecarga',
      serverCount:'servidores'
    },
    nl:{
      kicker:'Live netwerkstabiliteit', title:'Stabiliteit & Ping Monitor',
      phasePing:'Ping', phaseJitter:'Jitter', phaseLoss:'Verlies',
      installApp:'Fasqoo installeren',
      serverSelection:'Server selectie',
      regionEurope:'Europa', regionAmericas:'Amerika',
      regionAsia:'Azië', regionOceania:'Oceanië',
      modeTitle:'Testmodus', modeNormal:'Normaal', modeOverload:'Overbelasting',
      modeHint:'Normaal meet standaardwaarden. Overbelasting simuleert zware netwerkbelasting voor live streams en spraakchats.',
      startBtn:'Start meting',
      statusIdle:'Selecteer servers en modus, start dan de meting.',
      statusRunning:'Meten …', statusDone:'Meting voltooid',
      statusSelectServer:'⚠️ Selecteer minstens één server.',
      statusCleared:'Geschiedenis gewist.',
      metricPing:'Latentie', metricJitter:'Jitter', metricLoss:'Pakketverlies',
      chartTitle:'Live grafiek', chartHintIdle:'Wachten…',
      chartHintCollecting:'Gegevens verzamelen …',
      chartHintRound:'Ronde', chartHintSamples:'samples',
      chartHintDone:'Klaar', chartHintSuccessful:'geslaagde metingen',
      chartNoData:'Nog geen gegevens – start de meting',
      thServer:'Server', thPing:'Latentie Ø', thJitter:'Jitter',
      thLoss:'Verlies', thMinMax:'Min / Max',
      thTime:'Tijd', thServers:'Servers',
      noResults:'Nog geen metingen.',
      noHistory:'Nog geen opgeslagen tests.',
      shareBtn:'Delen als afbeelding', clearBtn:'Geschiedenis wissen',
      historyTitle:'Recente tests',
      confirmClear:'Geschiedenis echt wissen?',
      modeNormalLabel:'Normaal', modeOverloadLabel:'Overbelasting',
      serverCount:'servers'
    },
    tr:{
      kicker:'Canlı ağ kararlılığı', title:'Kararlılık & Ping Monitörü',
      phasePing:'Ping', phaseJitter:'Jitter', phaseLoss:'Kayıp',
      installApp:'Fasqoo\'yu yükle',
      serverSelection:'Sunucu seçimi',
      regionEurope:'Avrupa', regionAmericas:'Amerika',
      regionAsia:'Asya', regionOceania:'Okyanusya',
      modeTitle:'Test modu', modeNormal:'Normal', modeOverload:'Aşırı yük',
      modeHint:'Normal standart değerleri ölçer. Aşırı yük, canlı yayın ve sesli sohbet için yoğun ağ yükünü simüle eder.',
      startBtn:'Ölçümü başlat',
      statusIdle:'Sunucu ve mod seçin, sonra ölçümü başlatın.',
      statusRunning:'Ölçülüyor …', statusDone:'Ölçüm tamamlandı',
      statusSelectServer:'⚠️ En az bir sunucu seçin.',
      statusCleared:'Geçmiş temizlendi.',
      metricPing:'Gecikme', metricJitter:'Jitter', metricLoss:'Paket kaybı',
      chartTitle:'Canlı grafik', chartHintIdle:'Bekleniyor…',
      chartHintCollecting:'Veri toplanıyor …',
      chartHintRound:'Tur', chartHintSamples:'örnek',
      chartHintDone:'Bitti', chartHintSuccessful:'başarılı ölçüm',
      chartNoData:'Henüz veri yok – ölçümü başlatın',
      thServer:'Sunucu', thPing:'Gecikme Ø', thJitter:'Jitter',
      thLoss:'Kayıp', thMinMax:'Min / Maks',
      thTime:'Zaman', thServers:'Sunucular',
      noResults:'Henüz ölçüm yok.',
      noHistory:'Kayıtlı test yok.',
      shareBtn:'Resim olarak paylaş', clearBtn:'Geçmişi temizle',
      historyTitle:'Son testler',
      confirmClear:'Geçmiş silinsin mi?',
      modeNormalLabel:'Normal', modeOverloadLabel:'Aşırı yük',
      serverCount:'sunucu'
    },
    sq:{
      kicker:'Stabilitet i rrjetit në kohë reale', title:'Stabiliteti & Monitor Ping',
      phasePing:'Ping', phaseJitter:'Jitter', phaseLoss:'Humbje',
      installApp:'Instalo Fasqoo',
      serverSelection:'Zgjedhja e serverit',
      regionEurope:'Europë', regionAmericas:'Amerikë',
      regionAsia:'Azi', regionOceania:'Oqeani',
      modeTitle:'Modaliteti i testit', modeNormal:'Normal', modeOverload:'Mbingarkesë',
      modeHint:'Normal mat vlera standarde. Mbingarkesa simulon ngarkesë të dendur rrjeti për transmetime live dhe biseda zanore.',
      startBtn:'Fillo matjen',
      statusIdle:'Zgjidh serverët dhe modalitetin, pastaj fillo matjen.',
      statusRunning:'Po matet …', statusDone:'Matja përfundoi',
      statusSelectServer:'⚠️ Zgjidh të paktën një server.',
      statusCleared:'Historiku u fshi.',
      metricPing:'Vonesa', metricJitter:'Jitter', metricLoss:'Humbje paketash',
      chartTitle:'Grafik live', chartHintIdle:'Në pritje…',
      chartHintCollecting:'Po mblidhen të dhënat …',
      chartHintRound:'Raund', chartHintSamples:'mostra',
      chartHintDone:'Përfundoi', chartHintSuccessful:'matje të suksesshme',
      chartNoData:'Nuk ka të dhëna – fillo matjen',
      thServer:'Serveri', thPing:'Vonesa Ø', thJitter:'Jitter',
      thLoss:'Humbje', thMinMax:'Min / Maks',
      thTime:'Koha', thServers:'Serverët',
      noResults:'Nuk ka matje.',
      noHistory:'Nuk ka teste të ruajtura.',
      shareBtn:'Shpërndaj si imazh', clearBtn:'Fshi historikun',
      historyTitle:'Testet e fundit',
      confirmClear:'Vërtet fshi historikun?',
      modeNormalLabel:'Normal', modeOverloadLabel:'Mbingarkesë',
      serverCount:'serverë'
    },
    ar:{
      kicker:'استقرار الشبكة المباشر', title:'مراقب الاستقرار و Ping',
      phasePing:'Ping', phaseJitter:'Jitter', phaseLoss:'فقدان',
      installApp:'تثبيت Fasqoo',
      serverSelection:'اختيار الخادم',
      regionEurope:'أوروبا', regionAmericas:'أمريكا',
      regionAsia:'آسيا', regionOceania:'أوقيانوسيا',
      modeTitle:'وضع الاختبار', modeNormal:'عادي', modeOverload:'حمل زائد',
      modeHint:'العادي يقيس القيم القياسية. الحمل الزائد يحاكي حمل شبكة كثيف للبث المباشر والمحادثات الصوتية.',
      startBtn:'بدء القياس',
      statusIdle:'اختر الخوادم والوضع، ثم ابدأ القياس.',
      statusRunning:'جارٍ القياس …', statusDone:'اكتمل القياس',
      statusSelectServer:'⚠️ اختر خادمًا واحدًا على الأقل.',
      statusCleared:'تم مسح السجل.',
      metricPing:'زمن الاستجابة', metricJitter:'Jitter', metricLoss:'فقدان الحزم',
      chartTitle:'رسم بياني مباشر', chartHintIdle:'في انتظار القياس…',
      chartHintCollecting:'جمع البيانات …',
      chartHintRound:'الجولة', chartHintSamples:'عينة',
      chartHintDone:'اكتمل', chartHintSuccessful:'قياسات ناجحة',
      chartNoData:'لا توجد بيانات — ابدأ القياس',
      thServer:'الخادم', thPing:'الاستجابة Ø', thJitter:'Jitter',
      thLoss:'الفقدان', thMinMax:'الأدنى / الأقصى',
      thTime:'الوقت', thServers:'الخوادم',
      noResults:'لا توجد قياسات بعد.',
      noHistory:'لا توجد اختبارات محفوظة.',
      shareBtn:'مشاركة كصورة', clearBtn:'مسح السجل',
      historyTitle:'الاختبارات الأخيرة',
      confirmClear:'هل تريد مسح السجل؟',
      modeNormalLabel:'عادي', modeOverloadLabel:'حمل زائد',
      serverCount:'خوادم'
    }
  };

  function getCurrentLang(){
    try{
      const stored = localStorage.getItem('fasqoo_lang');
      if(stored && PING_TRANSLATIONS[stored]) return stored;
    }catch(e){}
    const htmlLang = (document.documentElement.lang || '').slice(0,2).toLowerCase();
    if(PING_TRANSLATIONS[htmlLang]) return htmlLang;
    return 'en';
  }

  function t(key){
    const lang = getCurrentLang();
    const dict = PING_TRANSLATIONS[lang] || PING_TRANSLATIONS.en;
    return dict[key] || PING_TRANSLATIONS.en[key] || key;
  }

  function applyPingTranslations(){
    document.querySelectorAll('[data-ping-i18n]').forEach(el => {
      const key = el.getAttribute('data-ping-i18n');
      const val = t(key);
      if(val) el.textContent = val;
    });
    // Chart Hint übersetzen, falls nicht im aktiven Messvorgang
    const hint = $('pingChartHint');
    if(hint && !hint.dataset.live){
      hint.textContent = t('chartHintIdle');
    }
    // Status nur übersetzen, wenn nicht gerade am Messen
    if(!pingRunning){
      const status = $('pingStatus');
      if(status && !status.dataset.sticky){
        status.textContent = t('statusIdle');
        status.className = 'ping-status';
      }
    }
    // Falls eine Messung gelaufen ist und wir fertig sind
    if(lastResult && !pingRunning){
      renderPingResults();
      renderHistory();
    }
  }

  /* ============================================================
     TABS
     ============================================================ */
  const tabs         = document.querySelectorAll('.fasqoo-tab');
  const speedSection = $('speed-section');
  const pingSection  = $('ping-section');

  function switchTab(name){
    tabs.forEach(tab => {
      const active = tab.dataset.tab === name;
      tab.classList.toggle('active', active);
      tab.setAttribute('aria-selected', active ? 'true' : 'false');
    });
    if(name === 'speed'){
      speedSection.classList.remove('hidden');
      pingSection.classList.add('hidden');
    } else {
      speedSection.classList.add('hidden');
      pingSection.classList.remove('hidden');
      setTimeout(resizePingCanvas, 40);
    }
    try{ history.replaceState(null, '', '#' + name); }catch(e){}
  }
  tabs.forEach(tab => tab.addEventListener('click', () => switchTab(tab.dataset.tab)));
  if(location.hash === '#ping') switchTab('ping');

  /* ============================================================
     INSTALL BUTTON
     ============================================================ */
  let deferredPrompt = null;
  const pingInstallBtn = $('pingInstallButton');

  window.addEventListener('beforeinstallprompt', e => {
    e.preventDefault();
    deferredPrompt = e;
    if(pingInstallBtn) pingInstallBtn.hidden = false;
  });
  if(pingInstallBtn){
    pingInstallBtn.addEventListener('click', async () => {
      if(!deferredPrompt) return;
      deferredPrompt.prompt();
      try{ await deferredPrompt.userChoice; }catch(e){}
      deferredPrompt = null;
      pingInstallBtn.hidden = true;
    });
  }
  window.addEventListener('appinstalled', () => {
    deferredPrompt = null;
    if(pingInstallBtn) pingInstallBtn.hidden = true;
  });
  if(window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true){
    if(pingInstallBtn) pingInstallBtn.hidden = true;
  }

  /* ============================================================
     SERVER LISTE
     ============================================================ */
  const SERVER_ENDPOINTS = {
    'de':     { label:'Frankfurt',    url:'https://speed.cloudflare.com/__down?bytes=1' },
    'nl':     { label:'Amsterdam',    url:'https://speed.cloudflare.com/__down?bytes=1' },
    'gb':     { label:'London',       url:'https://speed.cloudflare.com/__down?bytes=1' },
    'at':     { label:'Wien',         url:'https://speed.cloudflare.com/__down?bytes=1' },
    'fr':     { label:'Paris',        url:'https://speed.cloudflare.com/__down?bytes=1' },
    'pl':     { label:'Warschau',     url:'https://speed.cloudflare.com/__down?bytes=1' },
    'us-east':{ label:'New York',     url:'https://speed.cloudflare.com/__down?bytes=1' },
    'us-west':{ label:'Los Angeles',  url:'https://speed.cloudflare.com/__down?bytes=1' },
    'br':     { label:'São Paulo',    url:'https://speed.cloudflare.com/__down?bytes=1' },
    'ca':     { label:'Toronto',      url:'https://speed.cloudflare.com/__down?bytes=1' },
    'sg':     { label:'Singapur',     url:'https://speed.cloudflare.com/__down?bytes=1' },
    'jp':     { label:'Tokio',        url:'https://speed.cloudflare.com/__down?bytes=1' },
    'in':     { label:'Mumbai',       url:'https://speed.cloudflare.com/__down?bytes=1' },
    'kr':     { label:'Seoul',        url:'https://speed.cloudflare.com/__down?bytes=1' },
    'au':     { label:'Sydney',       url:'https://speed.cloudflare.com/__down?bytes=1' },
    'nz':     { label:'Auckland',     url:'https://speed.cloudflare.com/__down?bytes=1' }
  };

  const HISTORY_KEY = 'fasqoo_ping_history_v2';
  const MAX_HISTORY = 5;

  let pingRunning   = false;
  let pingSamples   = [];
  let pingRtts      = [];
  let pingFails     = 0;
  let pingTotal     = 0;
  let pingPerServer = {};
  let lastResult    = null;

  const pingCanvas = $('pingCanvas');
  const pingCtx    = pingCanvas ? pingCanvas.getContext('2d') : null;

  /* ============================================================
     CANVAS
     ============================================================ */
  function resizePingCanvas(){
    if(!pingCanvas) return;
    const rect = pingCanvas.getBoundingClientRect();
    if(!rect.width) return;
    const dpr = window.devicePixelRatio || 1;
    pingCanvas.width  = rect.width  * dpr;
    pingCanvas.height = rect.height * dpr;
    if(pingCtx) pingCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
    drawPingGraph();
  }
  window.addEventListener('resize', resizePingCanvas);

  function drawPingGraph(){
    if(!pingCanvas || !pingCtx) return;
    const w = pingCanvas.clientWidth;
    const h = pingCanvas.clientHeight;
    const isDark = document.body.classList.contains('dark');
    pingCtx.clearRect(0, 0, w, h);

    // Subtilere Grid
    pingCtx.strokeStyle = isDark ? '#232830' : '#f0f2f5';
    pingCtx.lineWidth = 1;
    for(let i = 1; i < 4; i++){
      const y = (i * h) / 4;
      pingCtx.beginPath();
      pingCtx.moveTo(0, y);
      pingCtx.lineTo(w, y);
      pingCtx.stroke();
    }

    if(pingSamples.length < 2){
      pingCtx.fillStyle = isDark ? '#4b5563' : '#b0b6c0';
      pingCtx.font = '500 11px Inter, system-ui, sans-serif';
      pingCtx.textAlign = 'center';
      pingCtx.textBaseline = 'middle';
      pingCtx.fillText(t('chartNoData'), w / 2, h / 2);
      return;
    }

    const values = pingSamples.map(s => s.ms);
    const maxVal = Math.max(30, ...values) * 1.15;
    const padX = 4, padY = 10;
    const innerW = w - padX * 2;
    const innerH = h - padY * 2;

    // Fläche
    pingCtx.beginPath();
    pingSamples.forEach((s, i) => {
      const x = padX + (i / (pingSamples.length - 1)) * innerW;
      const y = padY + innerH - (Math.min(s.ms, maxVal) / maxVal) * innerH;
      if(i === 0) pingCtx.moveTo(x, y); else pingCtx.lineTo(x, y);
    });
    pingCtx.lineTo(padX + innerW, h - padY);
    pingCtx.lineTo(padX, h - padY);
    pingCtx.closePath();
    const grad = pingCtx.createLinearGradient(0, 0, 0, h);
    grad.addColorStop(0, 'rgba(255,90,31,.20)');
    grad.addColorStop(1, 'rgba(255,90,31,0)');
    pingCtx.fillStyle = grad;
    pingCtx.fill();

    // Linie
    pingCtx.beginPath();
    pingSamples.forEach((s, i) => {
      const x = padX + (i / (pingSamples.length - 1)) * innerW;
      const y = padY + innerH - (Math.min(s.ms, maxVal) / maxVal) * innerH;
      if(i === 0) pingCtx.moveTo(x, y); else pingCtx.lineTo(x, y);
    });
    pingCtx.strokeStyle = '#ff5a1f';
    pingCtx.lineWidth = 1.8;
    pingCtx.lineJoin = 'round';
    pingCtx.lineCap  = 'round';
    pingCtx.stroke();

    // Letzter Punkt
    const lastP = pingSamples[pingSamples.length - 1];
    const lastX = padX + innerW;
    const lastY = padY + innerH - (Math.min(lastP.ms, maxVal) / maxVal) * innerH;
    pingCtx.beginPath();
    pingCtx.arc(lastX, lastY, 3.2, 0, Math.PI * 2);
    pingCtx.fillStyle = '#ff5a1f';
    pingCtx.fill();

    // Skala
    pingCtx.fillStyle = isDark ? '#4b5563' : '#b0b6c0';
    pingCtx.font = '500 10px Inter, system-ui, sans-serif';
    pingCtx.textAlign = 'right';
    pingCtx.textBaseline = 'top';
    pingCtx.fillText(maxVal.toFixed(0) + ' ms', w - 2, 2);
  }

  /* ============================================================
     PING
     ============================================================ */
  async function singlePing(serverKey){
    const endpoint = SERVER_ENDPOINTS[serverKey];
    const url = endpoint.url + '&t=' + Date.now() + '-' + Math.random();
    const t0 = performance.now();
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);
    try{
      const res = await fetch(url, {
        cache:'no-store', mode:'cors', credentials:'omit',
        signal: controller.signal
      });
      clearTimeout(timeout);
      if(!res.ok) throw new Error('HTTP ' + res.status);
      await res.arrayBuffer();
      const ms = performance.now() - t0;
      if(!Number.isFinite(ms) || ms <= 0) throw new Error('Invalid');
      return { ok:true, ms };
    }catch(e){
      clearTimeout(timeout);
      return { ok:false, ms:null };
    }
  }

  function median(arr){
    if(!arr.length) return 0;
    const a = [...arr].sort((x,y) => x-y);
    const m = Math.floor(a.length/2);
    return a.length % 2 ? a[m] : (a[m-1]+a[m])/2;
  }
  function calcJitter(rtts){
    if(rtts.length < 2) return 0;
    const d = [];
    for(let i=1; i<rtts.length; i++) d.push(Math.abs(rtts[i] - rtts[i-1]));
    return median(d);
  }

  function colorClass(v, type){
    if(!Number.isFinite(v)) return '';
    if(type === 'ping')   return v <= 40 ? 'good' : v <= 90 ? 'medium' : 'bad';
    if(type === 'jitter') return v <= 10 ? 'good' : v <= 30 ? 'medium' : 'bad';
    if(type === 'loss')   return v < 0.5 ? 'good' : v < 2.5 ? 'medium' : 'bad';
    return '';
  }

  function setLiveValues(ping, jitter, loss){
    const setCard = (id, val, type) => {
      const el = $(id);
      if(!el) return;
      const unitSpan = el.querySelector('.m-unit');
      const unitText = unitSpan ? unitSpan.outerHTML : '';
      const display = Number.isFinite(val) ? val.toFixed(1) : '—';
      el.innerHTML = display + unitText;
      el.className = 'm-value ' + colorClass(val, type);
    };
    setCard('pingVal', ping, 'ping');
    setCard('pingJitter', jitter, 'jitter');
    setCard('pingLoss', loss, 'loss');
  }

  function setPingStatus(text, cls, sticky){
    const el = $('pingStatus');
    if(!el) return;
    el.textContent = text;
    el.className = 'ping-status' + (cls ? ' ' + cls : '');
    if(sticky) el.dataset.sticky = '1'; else delete el.dataset.sticky;
  }

  /* ============================================================
     RESULT TABLE
     ============================================================ */
  function renderPingResults(){
    const body = $('pingResultsBody');
    if(!body) return;
    const keys = Object.keys(pingPerServer).filter(k => pingPerServer[k].attempts > 0);
    if(!keys.length){
      body.innerHTML = '<tr><td colspan="5" class="table-empty">' + t('noResults') + '</td></tr>';
      return;
    }
    body.innerHTML = keys.map(k => {
      const d = pingPerServer[k];
      const ok = d.rtts.length;
      const avg = ok ? median(d.rtts) : 0;
      const jit = calcJitter(d.rtts);
      const loss = d.attempts ? ((d.attempts - ok) / d.attempts) * 100 : 0;
      const min = ok ? Math.min(...d.rtts) : 0;
      const max = ok ? Math.max(...d.rtts) : 0;
      // Flag aus dem Server-Tile kopieren
      const tile = document.querySelector('.server-tile input[value="' + k + '"]');
      const flagSVG = tile ? tile.parentElement.querySelector('.flag').innerHTML : '';
      return (
        '<tr>' +
          '<td class="srv"><span class="flag">' + flagSVG + '</span>' + SERVER_ENDPOINTS[k].label + '</td>' +
          '<td class="ping-val" style="color:' + (avg <= 40 ? '#16a36a' : avg <= 90 ? '#c78900' : '#e5484d') + '">' +
            (ok ? avg.toFixed(1) + ' ms' : '—') + '</td>' +
          '<td style="color:var(--muted)">' + (ok ? jit.toFixed(1) + ' ms' : '—') + '</td>' +
          '<td style="color:var(--muted)">' + loss.toFixed(1) + ' %</td>' +
          '<td style="color:var(--muted)">' + (ok ? min.toFixed(0) + ' / ' + max.toFixed(0) + ' ms' : '—') + '</td>' +
        '</tr>'
      );
    }).join('');
  }

  /* ============================================================
     HISTORY
     ============================================================ */
  function loadHistory(){
    try{
      const raw = localStorage.getItem(HISTORY_KEY);
      return raw ? JSON.parse(raw) : [];
    }catch(e){ return []; }
  }
  function saveHistory(entry){
    const list = loadHistory();
    list.unshift(entry);
    try{ localStorage.setItem(HISTORY_KEY, JSON.stringify(list.slice(0, MAX_HISTORY))); }catch(e){}
    renderHistory();
  }
  function renderHistory(){
    const body = $('pingHistoryBody');
    if(!body) return;
    const list = loadHistory();
    if(!list.length){
      body.innerHTML = '<tr><td colspan="5" class="table-empty">' + t('noHistory') + '</td></tr>';
      return;
    }
    body.innerHTML = list.map(h => (
      '<tr>' +
        '<td style="color:var(--muted)">' + h.date + '</td>' +
        '<td style="color:var(--text);font-weight:600">' + h.servers + '</td>' +
        '<td class="ping-val">' + h.ping.toFixed(1) + ' ms</td>' +
        '<td style="color:var(--muted)">' + h.jitter.toFixed(1) + ' ms</td>' +
        '<td style="color:var(--muted)">' + h.loss.toFixed(1) + ' %</td>' +
      '</tr>'
    )).join('');
  }

  /* ============================================================
     MAIN TEST
     ============================================================ */
  async function runPingTest(){
    if(pingRunning) return;

    const selected = Array.from(document.querySelectorAll('#pingServerList input:checked, .server-tile input:checked'))
      .map(i => i.value);
    if(!selected.length){
      setPingStatus(t('statusSelectServer'), 'err', true);
      return;
    }

    const mode = (document.querySelector('input[name="pingMode"]:checked') || {}).value || 'normal';
    const isOverload = mode === 'overload';

    pingRunning   = true;
    pingSamples   = [];
    pingRtts      = [];
    pingFails     = 0;
    pingTotal     = 0;
    pingPerServer = {};
    selected.forEach(k => pingPerServer[k] = { rtts:[], attempts:0 });

    const startBtn = $('pingStart');
    const shareBtn = $('pingShare');
    if(startBtn) startBtn.disabled = true;
    if(shareBtn) shareBtn.disabled = true;

    $('pingResultsBody').innerHTML = '<tr><td colspan="5" class="table-empty">' + t('statusRunning') + '</td></tr>';
    setLiveValues(NaN, NaN, NaN);
    drawPingGraph();
    setPingStatus(t('statusRunning') + ' (' + t(isOverload ? 'modeOverloadLabel' : 'modeNormalLabel') + ')', 'live', true);

    const hint = $('pingChartHint');
    if(hint){ hint.textContent = t('chartHintCollecting'); hint.dataset.live = '1'; }

    const ROUNDS     = isOverload ? 24 : 18;
    const CONCURRENT = isOverload ? 4  : 1;
    const INTERVAL   = isOverload ? 350 : 700;

    for(let round = 0; round < ROUNDS && pingRunning; round++){
      const batch = [];
      for(let i = 0; i < CONCURRENT; i++){
        const key = selected[(round * CONCURRENT + i) % selected.length];
        batch.push(key);
      }

      const results = await Promise.all(batch.map(key => singlePing(key)));
      results.forEach((r, idx) => {
        const key = batch[idx];
        pingPerServer[key].attempts++;
        pingTotal++;
        if(r.ok){
          pingPerServer[key].rtts.push(r.ms);
          pingRtts.push(r.ms);
          pingSamples.push({ t: performance.now(), ms: r.ms, server: key });
          if(pingSamples.length > 120) pingSamples.shift();
        } else pingFails++;
      });

      const avgPing    = pingRtts.length ? median(pingRtts) : NaN;
      const jitter     = calcJitter(pingRtts);
      const packetLoss = pingTotal ? (pingFails / pingTotal) * 100 : 0;

      setLiveValues(avgPing, jitter, packetLoss);
      drawPingGraph();
      renderPingResults();

      if(hint) hint.textContent =
        t('chartHintRound') + ' ' + (round+1) + ' / ' + ROUNDS +
        ' · ' + pingRtts.length + ' ' + t('chartHintSamples');
      await sleep(INTERVAL);
    }

    const finalPing   = pingRtts.length ? median(pingRtts) : NaN;
    const finalJitter = calcJitter(pingRtts);
    const finalLoss   = pingTotal ? (pingFails / pingTotal) * 100 : 0;

    setLiveValues(finalPing, finalJitter, finalLoss);
    drawPingGraph();
    setPingStatus('✓ ' + t('statusDone') + ' · Ø ' + finalPing.toFixed(1) + ' ms', 'done', true);
    if(hint){
      hint.textContent = t('chartHintDone') + ' — ' + pingRtts.length + ' ' + t('chartHintSuccessful');
      delete hint.dataset.live;
    }

    lastResult = {
      date: new Date().toLocaleString(),
      mode: isOverload ? t('modeOverloadLabel') : t('modeNormalLabel'),
      ping: finalPing, jitter: finalJitter, loss: finalLoss,
      servers: selected.map(k => SERVER_ENDPOINTS[k].label),
      serverKeys: selected
    };

    saveHistory({
      date: lastResult.date,
      servers: selected.length + ' ' + t('serverCount'),
      ping: finalPing, jitter: finalJitter, loss: finalLoss
    });

    if(shareBtn) shareBtn.disabled = false;
    if(startBtn) startBtn.disabled = false;
    pingRunning = false;
  }

  const startBtn = $('pingStart');
  if(startBtn) startBtn.addEventListener('click', runPingTest);

  /* ============================================================
     MODE SELECTOR
     ============================================================ */
  document.querySelectorAll('#pingMode label').forEach(l => {
    const input = l.querySelector('input');
    input.addEventListener('change', () => {
      document.querySelectorAll('#pingMode label').forEach(x => x.classList.remove('active'));
      if(input.checked) l.classList.add('active');
    });
  });

  /* ============================================================
     SHARE AS IMAGE
     ============================================================ */
  const shareBtn = $('pingShare');
  if(shareBtn) shareBtn.addEventListener('click', () => {
    if(!lastResult) return;

    const W = 1200, H = 630;
    const cv = document.createElement('canvas');
    cv.width = W; cv.height = H;
    const c = cv.getContext('2d');

    // Hintergrund
    const bg = c.createLinearGradient(0, 0, W, H);
    bg.addColorStop(0, '#0d0f12');
    bg.addColorStop(1, '#1a1f2b');
    c.fillStyle = bg;
    c.fillRect(0, 0, W, H);

    // Orange Glow
    const glow = c.createRadialGradient(W*0.5, -80, 20, W*0.5, -80, 500);
    glow.addColorStop(0, 'rgba(255,90,31,.42)');
    glow.addColorStop(1, 'rgba(255,90,31,0)');
    c.fillStyle = glow;
    c.fillRect(0, 0, W, 320);

    // Header
    c.fillStyle = '#ff5a1f';
    c.font = '800 44px Inter, system-ui, sans-serif';
    c.textBaseline = 'alphabetic';
    c.fillText('Fasqoo', 60, 100);

    c.fillStyle = 'rgba(255,255,255,.75)';
    c.font = '600 22px Inter, system-ui, sans-serif';
    c.fillText(t('title'), 60, 138);

    c.fillStyle = 'rgba(255,255,255,.45)';
    c.font = '400 16px Inter, system-ui, sans-serif';
    c.fillText(lastResult.date + '  ·  ' + lastResult.mode, 60, 168);

    // Metriken
    const drawMetric = (x, label, value, unit, color) => {
      c.fillStyle = 'rgba(255,255,255,.55)';
      c.font = '700 14px Inter, system-ui, sans-serif';
      c.fillText(label.toUpperCase(), x, 260);
      c.fillStyle = color;
      c.font = '800 88px Inter, system-ui, sans-serif';
      c.fillText(value, x, 360);
      const wVal = c.measureText(value).width;
      c.fillStyle = 'rgba(255,255,255,.55)';
      c.font = '500 20px Inter, system-ui, sans-serif';
      c.fillText(unit, x + wVal + 8, 360);
    };
    drawMetric(60,  t('metricPing'),   lastResult.ping.toFixed(1),   'ms', '#ff5a1f');
    drawMetric(460, t('metricJitter'), lastResult.jitter.toFixed(1), 'ms', '#e6a500');
    drawMetric(840, t('metricLoss'),   lastResult.loss.toFixed(1),   '%',  '#16a36a');

    // Server
    c.fillStyle = 'rgba(255,255,255,.55)';
    c.font = '600 14px Inter, system-ui, sans-serif';
    c.fillText(t('thServers').toUpperCase(), 60, 440);
    c.fillStyle = 'rgba(255,255,255,.9)';
    c.font = '500 16px Inter, system-ui, sans-serif';
    c.fillText(lastResult.servers.join('  ·  '), 60, 468);

    // Footer
    c.fillStyle = 'rgba(255,255,255,.35)';
    c.font = '500 14px Inter, system-ui, sans-serif';
    c.fillText('www.fasqoo.com', 60, 580);

    // Orange Linie
    const line = c.createLinearGradient(0, 0, W, 0);
    line.addColorStop(0, '#ff5a1f');
    line.addColorStop(1, 'rgba(255,90,31,0)');
    c.fillStyle = line;
    c.fillRect(0, H - 6, W, 6);

    cv.toBlob(blob => {
      if(!blob) return;
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'fasqoo-ping-' + Date.now() + '.png';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 4000);
    }, 'image/png');
  });

  /* ============================================================
     CLEAR
     ============================================================ */
  const clearBtn = $('pingClear');
  if(clearBtn) clearBtn.addEventListener('click', () => {
    if(!confirm(t('confirmClear'))) return;
    try{ localStorage.removeItem(HISTORY_KEY); }catch(e){}
    renderHistory();
    setPingStatus(t('statusCleared'), 'done', true);
    setTimeout(() => {
      if(!pingRunning){
        setPingStatus(t('statusIdle'), '', false);
      }
    }, 2000);
  });

  /* ============================================================
     SPRACHWECHSEL ERKENNEN
     ============================================================ */
  // a) Select in der Navigation
  const langSelect = document.getElementById('lang');
  if(langSelect){
    langSelect.addEventListener('change', () => {
      setTimeout(applyPingTranslations, 60);
    });
  }
  // b) MutationObserver auf <html lang="...">
  const htmlObserver = new MutationObserver(() => {
    setTimeout(applyPingTranslations, 20);
  });
  htmlObserver.observe(document.documentElement, { attributes:true, attributeFilter:['lang'] });
  // c) Custom-Event abfangen, falls app.js irgendwann eins wirft
  window.addEventListener('fasqoo-lang-changed', () => setTimeout(applyPingTranslations, 20));

  /* ============================================================
     INIT
     ============================================================ */
  applyPingTranslations();
  renderHistory();
  resizePingCanvas();

})();
