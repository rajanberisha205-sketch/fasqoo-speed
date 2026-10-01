/* ============================================================
   FASQOO – faq.js
   Verantwortlich für:
   - Empfehlungen ("Was du tun kannst") bei App-Profilen
   - "Nochmal testen"-Button
   - "ISP-Bericht"-Button (Download als .txt)
   - Sprachsteuerung: Standard = Englisch
   - Automatisches Rendern nach Test-Ende
   ============================================================ */

(function () {
  'use strict';

  /* ============================================================
     1) STANDARD-SPRACHE: ENGLISCH
     ============================================================ */
  const DEFAULT_LANG = 'en';
  const STORAGE_KEY = 'fasqoo_lang';

  function getSavedLang() {
    try {
      return localStorage.getItem(STORAGE_KEY);
    } catch (e) {
      return null;
    }
  }

  function saveLang(lang) {
    try {
      localStorage.setItem(STORAGE_KEY, lang);
    } catch (e) {}
  }

  function detectLang() {
    // 1) Gespeicherte Sprache hat Vorrang
    const saved = getSavedLang();
    if (saved) return saved;

    // 2) Standard = Englisch (NICHT Browser-Sprache)
    return DEFAULT_LANG;
  }

  function applyLang(lang) {
    if (!lang) lang = DEFAULT_LANG;

    // <html lang="...">
    document.documentElement.setAttribute('lang', lang);

    // Select-Feld setzen (falls vorhanden)
    const select = document.getElementById('lang');
    if (select && select.value !== lang) {
      select.value = lang;
    }

    // data-i18n Attribute übersetzen (falls i18n.js vorhanden)
    if (typeof window.fasqooApplyTranslations === 'function') {
      window.fasqooApplyTranslations(lang);
    }

    // Event für andere Module
    window.dispatchEvent(new CustomEvent('fasqoo:langchange', { detail: { lang } }));
  }

  // Sprache beim Laden anwenden
  function initLanguage() {
    const lang = detectLang();
    applyLang(lang);

    // Sprachwechsel über Select
    const select = document.getElementById('lang');
    if (select) {
      select.addEventListener('change', function () {
        const newLang = this.value || DEFAULT_LANG;
        saveLang(newLang);
        applyLang(newLang);
      });
    }
  }

  /* ============================================================
     2) EMPFEHLUNGEN JE NACH PROBLEM
     ============================================================ */
  function getRecommendations(data) {
    const recs = [];
    const lang = detectLang();

    const ping = Number(data.ping) || 0;
    const jitter = Number(data.jitter) || 0;
    const loss = Number(data.loss) || 0;
    const down = Number(data.download) || 0;
    const up = Number(data.upload) || 0;
    const bloat = Number(data.bufferbloat) || 0;

    // Übersetzungen für Empfehlungen
    const T = {
      en: {
        ping: [
          'Restart your router (unplug for 10 seconds)',
          'Switch Wi-Fi to 5 GHz (less interference)',
          'Use a LAN cable instead of Wi-Fi'
        ],
        jitter: [
          'Disconnect other devices from the network (streaming, downloads)',
          'Disable VPN if active'
        ],
        loss: [
          'Check router cables and connections',
          'Contact your ISP – packet loss is often a line issue'
        ],
        down: [
          'Pause downloads and test again',
          'Check whether your plan delivers the expected speed'
        ],
        up: [
          'For video calls/backups: check upload – consider upgrading your plan'
        ],
        bloat: [
          'Use a router with SQM/QoS (reduces bufferbloat)',
          'Update your router firmware'
        ],
        ok: ['Connection is stable – no action needed.'],
        title: 'What you can do'
      },
      de: {
        ping: [
          'Router neu starten (10 Sek. vom Strom trennen)',
          'WLAN auf 5 GHz umstellen (weniger Störungen)',
          'LAN-Kabel statt WLAN verwenden'
        ],
        jitter: [
          'Andere Geräte vom Netzwerk trennen (Streaming, Downloads)',
          'VPN deaktivieren, falls aktiv'
        ],
        loss: [
          'Router-Kabel und Anschlüsse prüfen',
          'ISP kontaktieren – Paketverlust ist oft ein Leitungsproblem'
        ],
        down: [
          'Downloads pausieren und erneut testen',
          'Prüfen, ob dein Tarif die erwartete Geschwindigkeit liefert'
        ],
        up: [
          'Für Videoanrufe/Backups: Upload prüfen – ggf. Tarif upgraden'
        ],
        bloat: [
          'Router mit SQM/QoS-Funktion verwenden (reduziert Bufferbloat)',
          'Router-Firmware aktualisieren'
        ],
        ok: ['Verbindung ist stabil – keine Aktion nötig.'],
        title: 'Was du tun kannst'
      }
    };

    const L = T[lang] || T.en;

    if (ping > 100) recs.push(...L.ping);
    if (jitter > 30) recs.push(...L.jitter);
    if (loss > 1) recs.push(...L.loss);
    if (down < 25) recs.push(...L.down);
    if (up < 5) recs.push(...L.up);
    if (bloat > 100) recs.push(...L.bloat);
    if (recs.length === 0) recs.push(...L.ok);

    return { title: L.title, items: recs };
  }

  /* ============================================================
     3) EMPFEHLUNGS-BOX RENDERN
     ============================================================ */
  function renderRecommendation(data) {
    const container = document.getElementById('recommendationContainer');
    if (!container) return;

    // Alte Box entfernen
    const old = container.querySelector('.recommendation-box');
    if (old) old.remove();

    const { title, items } = getRecommendations(data);

    const box = document.createElement('div');
    box.className = 'recommendation-box';

    const strong = document.createElement('strong');
    strong.textContent = title;

    const ul = document.createElement('ul');
    items.forEach(function (item) {
      const li = document.createElement('li');
      li.textContent = item;
      ul.appendChild(li);
    });

    box.appendChild(strong);
    box.appendChild(ul);
    container.appendChild(box);
  }

  /* ============================================================
     4) ACTION-ROW: "Nochmal testen" + "ISP-Bericht"
     ============================================================ */
  function renderResultActions() {
    const gradeDisplay = document.getElementById('gradeDisplay');
    if (!gradeDisplay) return;
    if (gradeDisplay.querySelector('.result-actions')) return;

    const lang = detectLang();
    const labels = {
      en: { retest: 'Test again', isp: 'Create ISP report' },
      de: { retest: 'Nochmal testen', isp: 'ISP-Bericht erstellen' }
    };
    const L = labels[lang] || labels.en;

    const row = document.createElement('div');
    row.className = 'result-actions';
    row.innerHTML =
      '<button type="button" class="primary" id="retestBtn">' +
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
          '<path d="M3 12a9 9 0 1 0 3-6.7"/><path d="M3 4v5h5"/>' +
        '</svg>' +
        '<span>' + L.retest + '</span>' +
      '</button>' +
      '<button type="button" id="ispReportBtn">' +
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
          '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>' +
          '<path d="M14 2v6h6"/><path d="M9 13h6"/><path d="M9 17h6"/>' +
        '</svg>' +
        '<span>' + L.isp + '</span>' +
      '</button>';

    gradeDisplay.appendChild(row);

    const retestBtn = document.getElementById('retestBtn');
    if (retestBtn) {
      retestBtn.addEventListener('click', function () {
        const start = document.getElementById('start');
        if (start) start.click();
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    }

    const ispBtn = document.getElementById('ispReportBtn');
    if (ispBtn) {
      ispBtn.addEventListener('click', generateIspReport);
    }
  }

  /* ============================================================
     5) ISP-BERICHT ALS .TXT-DATEI
     ============================================================ */
  function generateIspReport() {
    const get = function (id) {
      const el = document.getElementById(id);
      return el ? (el.textContent || '—').trim() : '—';
    };

    const lang = detectLang();
    const now = new Date();

    const T = {
      en: {
        header: 'FASQOO – NETWORK REPORT',
        date: 'Date',
        testId: 'Test ID',
        conn: 'CONNECTION DATA',
        download: 'Download',
        upload: 'Upload',
        ping: 'Ping',
        jitter: 'Jitter',
        loss: 'Packet loss',
        bloat: 'Bufferbloat',
        quality: 'Quality',
        network: 'NETWORK',
        ip: 'Public IP',
        isp: 'Provider / ISP',
        loc: 'Location',
        asn: 'Network / ASN',
        note: 'NOTE',
        noteText: 'This report was created with Fasqoo (fasqoo.com). It documents the values reached at the time of measurement. Please attach this report to your ISP request.'
      },
      de: {
        header: 'FASQOO – NETZWERK-BERICHT',
        date: 'Datum',
        testId: 'Test-ID',
        conn: 'VERBINDUNGSDATEN',
        download: 'Download',
        upload: 'Upload',
        ping: 'Ping',
        jitter: 'Jitter',
        loss: 'Paketverlust',
        bloat: 'Bufferbloat',
        quality: 'Qualität',
        network: 'NETZWERK',
        ip: 'Öffentliche IP',
        isp: 'Anbieter/ISP',
        loc: 'Standort',
        asn: 'Netzwerk/ASN',
        note: 'HINWEIS',
        noteText: 'Dieser Bericht wurde mit Fasqoo (fasqoo.com) erstellt. Er dokumentiert die zum Messzeitpunkt erreichten Werte. Bitte legen Sie diesen Bericht Ihrem ISP-Anliegen bei.'
      }
    };

    const L = T[lang] || T.en;

    const lines = [
      '========================================',
      '  ' + L.header,
      '========================================',
      L.date + ':        ' + now.toLocaleString(lang === 'de' ? 'de-DE' : 'en-US'),
      L.testId + ':      ' + get('tid'),
      '',
      '--- ' + L.conn + ' ---',
      L.download + ':     ' + get('down') + ' Mbps',
      L.upload + ':       ' + get('up') + ' Mbps',
      L.ping + ':         ' + get('ping') + ' ms',
      L.jitter + ':       ' + get('jitter') + ' ms',
      L.loss + ': ' + get('loss') + ' %',
      L.bloat + ':  ' + get('bloat') + ' ms',
      L.quality + ':     ' + get('score'),
      '',
      '--- ' + L.network + ' ---',
      L.ip + ': ' + get('ip'),
      L.isp + ':   ' + get('isp'),
      L.loc + ':       ' + get('loc'),
      L.asn + ':   ' + get('asn'),
      '',
      '--- ' + L.note + ' ---',
      L.noteText,
      '========================================'
    ].join('\n');

    const blob = new Blob([lines], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'fasqoo-isp-report-' + Date.now() + '.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  /* ============================================================
     6) OBSERVER: Reagieren, wenn app.js Ergebnisse liefert
     ============================================================ */
  function attachObservers() {
    // App-Profile werden gerendert → Empfehlung anfügen
    const appsContainer = document.getElementById('appsContainer');
    if (appsContainer) {
      const appsObserver = new MutationObserver(function () {
        if (window.__fasqooLastResult) {
          renderRecommendation(window.__fasqooLastResult);
        }
      });
      appsObserver.observe(appsContainer, { childList: true, subtree: true });
    }

    // Note wird gesetzt → Action-Row anfügen
    const gradeDisplay = document.getElementById('gradeDisplay');
    if (gradeDisplay) {
      const gradeObserver = new MutationObserver(function () {
        const badge = document.getElementById('gradeBadge');
        if (badge && badge.textContent && badge.textContent.trim() !== '—') {
          renderResultActions();
        }
      });
      gradeObserver.observe(gradeDisplay, { childList: true, subtree: true, characterData: true });
    }
  }

  /* ============================================================
     7) GLOBALE API für app.js
     ============================================================ */
  window.fasqooSaveResult = function (data) {
    window.__fasqooLastResult = data || {};
    renderRecommendation(window.__fasqooLastResult);
  };

  window.fasqooGetLang = detectLang;
  window.fasqooSetLang = function (lang) {
    saveLang(lang);
    applyLang(lang);
  };

   /* ============================================================
     8) TAB-SWITCHING (Speed ↔ Ping)
     ============================================================ */
  function initTabs() {
    var tabs = document.querySelectorAll('.fasqoo-tab');
    var speedSection = document.getElementById('speed-section');
    var pingSection = document.getElementById('ping-section');
    var slider = document.getElementById('tabSlider');
    if (!tabs.length || !speedSection || !pingSection) return;

    function moveSlider(activeTab) {
      if (!slider || !activeTab) return;
      var parent = activeTab.parentElement;
      var parentRect = parent.getBoundingClientRect();
      var tabRect = activeTab.getBoundingClientRect();
      slider.style.width = tabRect.width + 'px';
      slider.style.transform = 'translateX(' + (tabRect.left - parentRect.left - 5) + 'px)';
    }

    function activateTab(tabName) {
      tabs.forEach(function (t) {
        var isActive = t.dataset.tab === tabName;
        t.classList.toggle('active', isActive);
        t.setAttribute('aria-selected', String(isActive));
      });

      if (tabName === 'ping') {
        speedSection.classList.add('hidden');
        pingSection.classList.remove('hidden');
      } else {
        speedSection.classList.remove('hidden');
        pingSection.classList.add('hidden');
      }

      var activeTab = document.querySelector('.fasqoo-tab[data-tab="' + tabName + '"]');
      if (activeTab) moveSlider(activeTab);
    }

    tabs.forEach(function (tab) {
      tab.addEventListener('click', function () {
        activateTab(this.dataset.tab);
      });
    });

    var activeTab = document.querySelector('.fasqoo-tab.active');
    if (activeTab) setTimeout(function () { moveSlider(activeTab); }, 50);

    window.addEventListener('resize', function () {
      var current = document.querySelector('.fasqoo-tab.active');
      if (current) moveSlider(current);
    });
  }

  /* ============================================================
     9) INIT
     ============================================================ */
  function init() {
    initLanguage();
    attachObservers();
    initTabs();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
