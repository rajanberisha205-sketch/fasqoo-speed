/* ============================================================
   FASQOO – Tab-Navigation + Stabilität & Ping-Monitor
   ------------------------------------------------------------
   Läuft unabhängig neben app.js. Nutzt eine IIFE, damit keine
   globalen Variablen mit app.js kollidieren.
   ============================================================ */
(function(){
  'use strict';

  const $ = id => document.getElementById(id);
  const sleep = ms => new Promise(r => setTimeout(r, ms));

  /* ============================================================
     1) TAB-NAVIGATION
     ============================================================ */
  const tabs         = document.querySelectorAll('.fasqoo-tab');
  const speedSection = $('speed-section');
  const pingSection  = $('ping-section');

  function switchTab(name){
    tabs.forEach(t => {
      const active = t.dataset.tab === name;
      t.classList.toggle('active', active);
      t.setAttribute('aria-selected', active ? 'true' : 'false');
    });

    if(name === 'speed'){
      speedSection.classList.remove('hidden');
      pingSection.classList.add('hidden');
    } else {
      speedSection.classList.add('hidden');
      pingSection.classList.remove('hidden');
      // Canvas erst nach Sichtbarwerden messen
      setTimeout(resizePingCanvas, 40);
    }

    try{ history.replaceState(null, '', '#' + name); }catch(e){}
  }

  tabs.forEach(t => t.addEventListener('click', () => switchTab(t.dataset.tab)));

  // Deep-Link: #ping direkt öffnen
  if(location.hash === '#ping') switchTab('ping');


  /* ============================================================
     2) PWA INSTALL-BUTTON (ping-Bereich)
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
     3) PING-MONITOR
     ============================================================ */
  const SERVER_ENDPOINTS = {
    de: { label:'🇩🇪 Deutschland (Frankfurt)', tag:'fra', url:'https://speed.cloudflare.com/__down?bytes=1' },
    nl: { label:'🇳🇱 Niederlande (Amsterdam)', tag:'ams', url:'https://speed.cloudflare.com/__down?bytes=1' },
    gb: { label:'🇬🇧 Großbritannien (London)', tag:'lhr', url:'https://speed.cloudflare.com/__down?bytes=1' },
    at: { label:'🇦🇹 Österreich (Wien)',      tag:'vie', url:'https://speed.cloudflare.com/__down?bytes=1' }
  };

  const HISTORY_KEY = 'fasqoo_ping_history_v1';
  const MAX_HISTORY = 5;

  let pingRunning    = false;
  let pingSamples    = [];
  let pingRtts       = [];
  let pingFails      = 0;
  let pingTotal      = 0;
  let pingPerServer  = {};
  let lastResult     = null;

  const pingCanvas = $('pingCanvas');
  const pingCtx    = pingCanvas ? pingCanvas.getContext('2d') : null;

  /* ---------- Canvas Setup ---------- */
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

  /* ---------- Graph ---------- */
  function drawPingGraph(){
    if(!pingCanvas || !pingCtx) return;
    const w = pingCanvas.clientWidth;
    const h = pingCanvas.clientHeight;
    const isDark = document.body.classList.contains('dark');

    pingCtx.clearRect(0, 0, w, h);

    // Grid
    pingCtx.strokeStyle = isDark ? '#2b3037' : '#edf1f5';
    pingCtx.lineWidth = 1;
    for(let i = 1; i < 5; i++){
      const y = (i * h) / 5;
      pingCtx.beginPath();
      pingCtx.moveTo(0, y);
      pingCtx.lineTo(w, y);
      pingCtx.stroke();
    }

    if(pingSamples.length < 2){
      pingCtx.fillStyle = isDark ? '#6b7280' : '#9aa1ab';
      pingCtx.font = '11px Inter, system-ui, sans-serif';
      pingCtx.textAlign = 'center';
      pingCtx.fillText('Noch keine Daten – starte die Messung', w / 2, h / 2);
      return;
    }

    const values = pingSamples.map(s => s.ms);
    const maxVal = Math.max(50, ...values) * 1.15;
    const padX = 8, padY = 12;
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
    grad.addColorStop(0, 'rgba(255,90,31,.30)');
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
    pingCtx.lineWidth = 2.2;
    pingCtx.lineJoin = 'round';
    pingCtx.lineCap  = 'round';
    pingCtx.shadowColor = 'rgba(255,90,31,.35)';
    pingCtx.shadowBlur = 6;
    pingCtx.stroke();
    pingCtx.shadowBlur = 0;

    // Punkte
    pingSamples.forEach((s, i) => {
      const x = padX + (i / (pingSamples.length - 1)) * innerW;
      const y = padY + innerH - (Math.min(s.ms, maxVal) / maxVal) * innerH;
      pingCtx.beginPath();
      pingCtx.arc(x, y, 2.6, 0, Math.PI * 2);
      pingCtx.fillStyle = '#ff5a1f';
      pingCtx.fill();
    });

    // Skala
    pingCtx.fillStyle = isDark ? '#6b7280' : '#9aa1ab';
    pingCtx.font = '10px Inter, system-ui, sans-serif';
    pingCtx.textAlign = 'right';
    pingCtx.textBaseline = 'top';
    pingCtx.fillText(maxVal.toFixed(0) + ' ms', w - 4, 4);
  }

  /* ---------- Einzelner Ping ---------- */
  async function singlePing(serverKey){
    const endpoint = SERVER_ENDPOINTS[serverKey];
    const url = endpoint.url + '&t=' + Date.now() + '-' + Math.random();
    const t0 = performance.now();

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);

    try{
      const res = await fetch(url, {
        cache: 'no-store',
        mode: 'cors',
        credentials: 'omit',
        signal: controller.signal
      });
      clearTimeout(timeout);
      if(!res.ok) throw new Error('HTTP ' + res.status);
      await res.arrayBuffer();
      const ms = performance.now() - t0;
      if(!Number.isFinite(ms) || ms <= 0) throw new Error('Invalid');
      return { ok: true, ms };
    }catch(e){
      clearTimeout(timeout);
      return { ok: false, ms: null };
    }
  }

  /* ---------- Statistik ---------- */
  function median(arr){
    if(!arr.length) return 0;
    const a = [...arr].sort((x, y) => x - y);
    const mid = Math.floor(a.length / 2);
    return a.length % 2 ? a[mid] : (a[mid - 1] + a[mid]) / 2;
  }
  function calcJitter(rtts){
    if(rtts.length < 2) return 0;
    const deltas = [];
    for(let i = 1; i < rtts.length; i++) deltas.push(Math.abs(rtts[i] - rtts[i - 1]));
    return median(deltas);
  }

  /* ---------- Live-Werte ---------- */
  function colorPingClass(v){
    if(!Number.isFinite(v)) return '';
    if(v <= 40) return 'good';
    if(v <= 90) return 'medium';
    return 'bad';
  }
  function colorJitterClass(v){
    if(!Number.isFinite(v)) return '';
    if(v <= 10) return 'good';
    if(v <= 30) return 'medium';
    return 'bad';
  }
  function colorLossClass(v){
    if(!Number.isFinite(v)) return '';
    if(v < 0.5) return 'good';
    if(v < 2.5) return 'medium';
    return 'bad';
  }

  function setLiveValues(ping, jitter, loss){
    const pingEl = $('pingVal'), jitEl = $('pingJitter'), lossEl = $('pingLoss');
    if(pingEl){
      pingEl.textContent = Number.isFinite(ping) ? ping.toFixed(1) : '—';
      pingEl.className = 'val ' + colorPingClass(ping);
    }
    if(jitEl){
      jitEl.textContent = Number.isFinite(jitter) ? jitter.toFixed(1) : '—';
      jitEl.className = 'val ' + colorJitterClass(jitter);
    }
    if(lossEl){
      lossEl.textContent = Number.isFinite(loss) ? loss.toFixed(1) : '—';
      lossEl.className = 'val ' + colorLossClass(loss);
    }
  }

  function setPingStatus(text, cls){
    const el = $('pingStatus');
    if(!el) return;
    el.textContent = text;
    el.className = 'ping-status' + (cls ? ' ' + cls : '');
    const head = $('pingStatusHead');
    if(head) head.textContent = text;
  }

  /* ---------- Ergebnis-Tabelle ---------- */
  function renderPingResults(){
    const body = $('pingResultsBody');
    if(!body) return;

    const keys = Object.keys(pingPerServer).filter(k => pingPerServer[k].attempts > 0);
    if(!keys.length){
      body.innerHTML = '<tr><td colspan="5" class="ping-empty">Noch keine Messergebnisse.</td></tr>';
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
      return (
        '<tr>' +
          '<td class="srv">' + SERVER_ENDPOINTS[k].label + '</td>' +
          '<td><strong style="color:' + (avg <= 40 ? '#16a36a' : avg <= 90 ? '#e6a500' : '#e5484d') + '">' +
            (ok ? avg.toFixed(1) + ' ms' : '—') + '</strong></td>' +
          '<td>' + (ok ? jit.toFixed(1) + ' ms' : '—') + '</td>' +
          '<td>' + loss.toFixed(1) + ' %</td>' +
          '<td>' + (ok ? min.toFixed(0) + ' / ' + max.toFixed(0) + ' ms' : '—') + '</td>' +
        '</tr>'
      );
    }).join('');
  }

  /* ---------- Verlauf ---------- */
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
      body.innerHTML = '<tr><td colspan="5" class="ping-empty">Noch keine gespeicherten Tests.</td></tr>';
      return;
    }
    body.innerHTML = list.map(h => (
      '<tr>' +
        '<td>' + h.date + '</td>' +
        '<td>' + h.servers + '</td>' +
        '<td>' + h.ping.toFixed(1) + ' ms</td>' +
        '<td>' + h.jitter.toFixed(1) + ' ms</td>' +
        '<td>' + h.loss.toFixed(1) + ' %</td>' +
      '</tr>'
    )).join('');
  }

  /* ---------- Hauptmessung ---------- */
  async function runPingTest(){
    if(pingRunning) return;

    const selected = Array.from(document.querySelectorAll('#pingServerList input:checked'))
      .map(i => i.value);
    if(!selected.length){
      setPingStatus('⚠️ Bitte mindestens einen Server auswählen.', 'err');
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
    selected.forEach(k => pingPerServer[k] = { rtts: [], attempts: 0 });

    const startBtn = $('pingStart');
    const shareBtn = $('pingShare');
    if(startBtn) startBtn.disabled = true;
    if(shareBtn)  shareBtn.disabled  = true;

    $('pingResultsBody').innerHTML = '<tr><td colspan="5" class="ping-empty">Messung läuft…</td></tr>';
    setLiveValues(NaN, NaN, NaN);
    drawPingGraph();

    setPingStatus('📡 Messung läuft … (' + (isOverload ? 'Überlastungsmodus' : 'Normalmodus') + ')', 'live');
    const hint = $('pingChartHint');
    if(hint) hint.textContent = 'Sammle Daten …';

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
          const now = performance.now();
          pingSamples.push({ t: now, ms: r.ms, server: key });
          if(pingSamples.length > 120) pingSamples.shift();
        } else {
          pingFails++;
        }
      });

      const avgPing    = pingRtts.length ? median(pingRtts) : NaN;
      const jitter     = calcJitter(pingRtts);
      const packetLoss = pingTotal ? (pingFails / pingTotal) * 100 : 0;

      setLiveValues(avgPing, jitter, packetLoss);
      drawPingGraph();
      renderPingResults();

      if(hint) hint.textContent = 'Runde ' + (round + 1) + ' / ' + ROUNDS + ' · ' + pingRtts.length + ' Samples';

      await sleep(INTERVAL);
    }

    const finalPing   = pingRtts.length ? median(pingRtts) : NaN;
    const finalJitter = calcJitter(pingRtts);
    const finalLoss   = pingTotal ? (pingFails / pingTotal) * 100 : 0;

    setLiveValues(finalPing, finalJitter, finalLoss);
    drawPingGraph();
    setPingStatus('✅ Messung abgeschlossen · Ø ' + finalPing.toFixed(1) + ' ms', 'done');
    if(hint) hint.textContent = 'Fertig — ' + pingRtts.length + ' erfolgreiche Messungen';

    lastResult = {
      date: new Date().toLocaleString(),
      mode: isOverload ? 'Überlastung' : 'Normal',
      ping: finalPing,
      jitter: finalJitter,
      loss: finalLoss,
      servers: selected.map(k => SERVER_ENDPOINTS[k].label),
      perServer: JSON.parse(JSON.stringify(pingPerServer))
    };

    saveHistory({
      date: lastResult.date,
      servers: lastResult.servers.length + ' Server',
      ping: finalPing,
      jitter: finalJitter,
      loss: finalLoss
    });

    if(shareBtn) shareBtn.disabled = false;
    if(startBtn) startBtn.disabled = false;
    pingRunning = false;
  }

  const startBtn = $('pingStart');
  if(startBtn) startBtn.addEventListener('click', runPingTest);

  /* ---------- Modus-Auswahl ---------- */
  document.querySelectorAll('#pingMode label').forEach(l => {
    const input = l.querySelector('input');
    input.addEventListener('change', () => {
      document.querySelectorAll('#pingMode label').forEach(x => x.classList.remove('active'));
      if(input.checked) l.classList.add('active');
    });
  });

  /* ---------- Als Bild teilen (1200x630 PNG) ---------- */
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

    // Orange Glow oben
    const glow = c.createRadialGradient(W * 0.5, -80, 20, W * 0.5, -80, 500);
    glow.addColorStop(0, 'rgba(255,90,31,.45)');
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
    c.fillText('Stabilität & Ping-Monitor', 60, 138);

    c.fillStyle = 'rgba(255,255,255,.45)';
    c.font = '400 16px Inter, system-ui, sans-serif';
    c.fillText(lastResult.date + '  ·  Modus: ' + lastResult.mode, 60, 168);

    // Große Werte
    const drawMetric = (x, label, value, unit, color) => {
      c.fillStyle = 'rgba(255,255,255,.55)';
      c.font = '700 14px Inter, system-ui, sans-serif';
      c.fillText(label.toUpperCase(), x, 260);

      c.fillStyle = color;
      c.font = '800 88px Inter, system-ui, sans-serif';
      c.fillText(value, x, 360);

      const width = c.measureText(value).width;
      c.fillStyle = 'rgba(255,255,255,.55)';
      c.font = '500 20px Inter, system-ui, sans-serif';
      c.fillText(unit, x + width + 8, 360);
    };

    drawMetric(60,  'Ø Verzögerung', lastResult.ping.toFixed(1),   'ms', '#ff5a1f');
    drawMetric(460, 'Jitter',        lastResult.jitter.toFixed(1), 'ms', '#e6a500');
    drawMetric(840, 'Paketverlust',  lastResult.loss.toFixed(1),   '%',  '#16a36a');

    // Server-Zeile
    c.fillStyle = 'rgba(255,255,255,.55)';
    c.font = '600 14px Inter, system-ui, sans-serif';
    c.fillText('SERVER', 60, 440);
    c.fillStyle = 'rgba(255,255,255,.9)';
    c.font = '500 16px Inter, system-ui, sans-serif';
    c.fillText(lastResult.servers.join('  ·  '), 60, 468);

    // Footer
    c.fillStyle = 'rgba(255,255,255,.35)';
    c.font = '500 14px Inter, system-ui, sans-serif';
    c.fillText('Gemessen im Browser · www.fasqoo.com', 60, 580);

    // Orange Linie
    const line = c.createLinearGradient(0, 0, W, 0);
    line.addColorStop(0, '#ff5a1f');
    line.addColorStop(1, 'rgba(255,90,31,0)');
    c.fillStyle = line;
    c.fillRect(0, H - 6, W, 6);

    // Download
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

  /* ---------- Verlauf löschen ---------- */
  const clearBtn = $('pingClear');
  if(clearBtn) clearBtn.addEventListener('click', () => {
    if(!confirm('Verlauf wirklich löschen?')) return;
    try{ localStorage.removeItem(HISTORY_KEY); }catch(e){}
    renderHistory();
    setPingStatus('Verlauf gelöscht.', 'done');
  });

  /* ---------- Init ---------- */
  renderHistory();
  resizePingCanvas();

})();
