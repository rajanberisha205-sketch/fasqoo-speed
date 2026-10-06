/* ==========================================================
   FASQOO PING MONITOR
   REAL BROWSER LATENCY / JITTER / PACKET LOSS
   ========================================================== */

(function () {
  "use strict";

  const $ = (id) => document.getElementById(id);

  const sleep = (ms) =>
    new Promise(resolve => setTimeout(resolve, ms));

  /* ==========================================================
     SERVER
     ========================================================== */

  const SERVER_ENDPOINTS = {
    de: {
      label: "Frankfurt",
      url: "https://speed.cloudflare.com/__down?bytes=1"
    },
    nl: {
      label: "Amsterdam",
      url: "https://speed.cloudflare.com/__down?bytes=1"
    },
    gb: {
      label: "London",
      url: "https://speed.cloudflare.com/__down?bytes=1"
    },
    at: {
      label: "Wien",
      url: "https://speed.cloudflare.com/__down?bytes=1"
    },
    fr: {
      label: "Paris",
      url: "https://speed.cloudflare.com/__down?bytes=1"
    },
    pl: {
      label: "Warschau",
      url: "https://speed.cloudflare.com/__down?bytes=1"
    },
    "us-east": {
      label: "New York",
      url: "https://speed.cloudflare.com/__down?bytes=1"
    },
    "us-west": {
      label: "Los Angeles",
      url: "https://speed.cloudflare.com/__down?bytes=1"
    },
    br: {
      label: "São Paulo",
      url: "https://speed.cloudflare.com/__down?bytes=1"
    },
    ca: {
      label: "Toronto",
      url: "https://speed.cloudflare.com/__down?bytes=1"
    },
    sg: {
      label: "Singapur",
      url: "https://speed.cloudflare.com/__down?bytes=1"
    },
    jp: {
      label: "Tokio",
      url: "https://speed.cloudflare.com/__down?bytes=1"
    },
    in: {
      label: "Mumbai",
      url: "https://speed.cloudflare.com/__down?bytes=1"
    },
    kr: {
      label: "Seoul",
      url: "https://speed.cloudflare.com/__down?bytes=1"
    },
    au: {
      label: "Sydney",
      url: "https://speed.cloudflare.com/__down?bytes=1"
    },
    nz: {
      label: "Auckland",
      url: "https://speed.cloudflare.com/__down?bytes=1"
    }
  };

  const HISTORY_KEY = "fasqoo_ping_history_v3";
  const MAX_HISTORY = 10;

  let pingRunning = false;
  let pingSamples = [];
  let pingRtts = [];
  let pingFails = 0;
  let pingTotal = 0;
  let pingPerServer = {};
  let lastResult = null;

  /* ==========================================================
     LANGUAGE
     ========================================================== */

  function getLang() {
    try {
      return localStorage.getItem("fasqoo_lang") || "en";
    } catch (e) {
      return "en";
    }
  }

  const TEXT = {
    en: {
      noResults: "No results yet",
      noHistory: "No history yet",
      running: "Measuring…",
      done: "Complete",
      idle: "Ready",
      failed: "Measurement failed",
      selectServer: "Please select at least one server",
      normal: "Normal",
      overload: "Under load",
      samples: "samples",
      successful: "successful",
      collecting: "Collecting latency samples…",
      completeHint: "Real browser latency measurement completed",
      serverCount: "servers",
      cleared: "History cleared",
      metricPing: "Ping",
      metricJitter: "Jitter",
      metricLoss: "Packet Loss"
    },
    de: {
      noResults: "Noch keine Ergebnisse",
      noHistory: "Noch keine Historie",
      running: "Messung läuft…",
      done: "Fertig",
      idle: "Bereit",
      failed: "Messung fehlgeschlagen",
      selectServer: "Bitte mindestens einen Server auswählen",
      normal: "Normal",
      overload: "Unter Last",
      samples: "Messungen",
      successful: "erfolgreich",
      collecting: "Latenz wird gemessen…",
      completeHint: "Echte Browser-Latenzmessung abgeschlossen",
      serverCount: "Server",
      cleared: "Historie gelöscht",
      metricPing: "Ping",
      metricJitter: "Jitter",
      metricLoss: "Paketverlust"
    }
  };

  function t(key) {
    const lang = getLang();
    return (TEXT[lang] && TEXT[lang][key]) ||
           TEXT.en[key] ||
           key;
  }

  /* ==========================================================
     CANVAS
     ========================================================== */

  const pingCanvas = $("pingCanvas");
  const pingCtx = pingCanvas
    ? pingCanvas.getContext("2d")
    : null;

  function resizePingCanvas() {
    if (!pingCanvas || !pingCtx) return;

    const rect = pingCanvas.getBoundingClientRect();

    if (!rect.width || !rect.height) return;

    const dpr = window.devicePixelRatio || 1;

    pingCanvas.width = Math.round(rect.width * dpr);
    pingCanvas.height = Math.round(rect.height * dpr);

    pingCtx.setTransform(
      dpr,
      0,
      0,
      dpr,
      0,
      0
    );

    drawPingGraph();
  }

  window.addEventListener(
    "resize",
    resizePingCanvas,
    { passive: true }
  );

  function drawPingGraph() {
    if (!pingCanvas || !pingCtx) return;

    const w = pingCanvas.clientWidth;
    const h = pingCanvas.clientHeight;

    if (!w || !h) return;

    const dark =
      document.body.classList.contains("dark");

    pingCtx.clearRect(0, 0, w, h);

    /* Grid */

    pingCtx.strokeStyle =
      dark ? "#252a32" : "#eceff3";

    pingCtx.lineWidth = 1;

    for (let i = 1; i < 4; i++) {
      const y = (i * h) / 4;

      pingCtx.beginPath();
      pingCtx.moveTo(0, y);
      pingCtx.lineTo(w, y);
      pingCtx.stroke();
    }

    if (pingSamples.length < 2) {
      pingCtx.fillStyle =
        dark ? "#596273" : "#9da5af";

      pingCtx.font =
        "500 11px Inter, system-ui, sans-serif";

      pingCtx.textAlign = "center";
      pingCtx.textBaseline = "middle";

      pingCtx.fillText(
        t("collecting"),
        w / 2,
        h / 2
      );

      return;
    }

    const values = pingSamples
      .map(x => x.ms)
      .filter(Number.isFinite);

    if (!values.length) return;

    const maxValue =
      Math.max(30, ...values) * 1.15;

    const padX = 5;
    const padY = 10;

    const innerW = w - padX * 2;
    const innerH = h - padY * 2;

    /* Area */

    pingCtx.beginPath();

    pingSamples.forEach((sample, index) => {
      const x =
        padX +
        (index / (pingSamples.length - 1)) *
          innerW;

      const y =
        padY +
        innerH -
        (Math.min(sample.ms, maxValue) /
          maxValue) *
          innerH;

      if (index === 0) {
        pingCtx.moveTo(x, y);
      } else {
        pingCtx.lineTo(x, y);
      }
    });

    pingCtx.lineTo(
      padX + innerW,
      h - padY
    );

    pingCtx.lineTo(
      padX,
      h - padY
    );

    pingCtx.closePath();

    const gradient =
      pingCtx.createLinearGradient(
        0,
        0,
        0,
        h
      );

    gradient.addColorStop(
      0,
      "rgba(255,90,31,.20)"
    );

    gradient.addColorStop(
      1,
      "rgba(255,90,31,0)"
    );

    pingCtx.fillStyle = gradient;
    pingCtx.fill();

    /* Line */

    pingCtx.beginPath();

    pingSamples.forEach((sample, index) => {
      const x =
        padX +
        (index / (pingSamples.length - 1)) *
          innerW;

      const y =
        padY +
        innerH -
        (Math.min(sample.ms, maxValue) /
          maxValue) *
          innerH;

      if (index === 0) {
        pingCtx.moveTo(x, y);
      } else {
        pingCtx.lineTo(x, y);
      }
    });

    pingCtx.strokeStyle = "#ff5a1f";
    pingCtx.lineWidth = 1.8;
    pingCtx.lineJoin = "round";
    pingCtx.lineCap = "round";
    pingCtx.stroke();

    /* Last point */

    const last =
      pingSamples[pingSamples.length - 1];

    const lastX =
      padX + innerW;

    const lastY =
      padY +
      innerH -
      (Math.min(last.ms, maxValue) /
        maxValue) *
        innerH;

    pingCtx.beginPath();

    pingCtx.arc(
      lastX,
      lastY,
      3,
      0,
      Math.PI * 2
    );

    pingCtx.fillStyle = "#ff5a1f";
    pingCtx.fill();

    /* Scale */

    pingCtx.fillStyle =
      dark ? "#596273" : "#9da5af";

    pingCtx.font =
      "500 10px Inter, system-ui, sans-serif";

    pingCtx.textAlign = "right";
    pingCtx.textBaseline = "top";

    pingCtx.fillText(
      maxValue.toFixed(0) + " ms",
      w - 2,
      2
    );
  }

  /* ==========================================================
     CACHE BUSTING
     KEIN Math.random()
     ========================================================== */

  let requestCounter = 0;

  function cacheBust() {
    requestCounter++;

    return (
      Date.now().toString(36) +
      "-" +
      requestCounter.toString(36)
    );
  }

  /* ==========================================================
     SINGLE REAL PING
     ========================================================== */

  async function singlePing(serverKey) {
    const endpoint =
      SERVER_ENDPOINTS[serverKey];

    if (!endpoint) {
      return {
        ok: false,
        ms: null
      };
    }

    const url =
      endpoint.url +
      "&fasqoo_ping=" +
      cacheBust();

    const controller =
      new AbortController();

    const timeout =
      setTimeout(() => {
        controller.abort();
      }, 4000);

    const started =
      performance.now();

    try {
      const response =
        await fetch(url, {
          cache: "no-store",
          mode: "cors",
          credentials: "omit",
          signal: controller.signal
        });

      clearTimeout(timeout);

      if (!response.ok) {
        throw new Error(
          "HTTP " + response.status
        );
      }

      /*
       * Force the browser to complete
       * the response before stopping timer.
       */

      await response.arrayBuffer();

      const elapsed =
        performance.now() - started;

      if (
        !Number.isFinite(elapsed) ||
        elapsed <= 0 ||
        elapsed > 4000
      ) {
        throw new Error(
          "Invalid latency"
        );
      }

      return {
        ok: true,
        ms: elapsed
      };

    } catch (error) {
      clearTimeout(timeout);

      return {
        ok: false,
        ms: null
      };
    }
  }

  /* ==========================================================
     MEDIAN
     ========================================================== */

  function median(values) {
    if (!values.length) {
      return NaN;
    }

    const sorted =
      [...values]
        .filter(Number.isFinite)
        .sort((a, b) => a - b);

    if (!sorted.length) {
      return NaN;
    }

    const middle =
      Math.floor(sorted.length / 2);

    if (sorted.length % 2) {
      return sorted[middle];
    }

    return (
      (sorted[middle - 1] +
       sorted[middle]) / 2
    );
  }

  /* ==========================================================
     ROBUST JITTER
     ========================================================== */

  function calculateJitter(values) {
    if (values.length < 2) {
      return 0;
    }

    const differences = [];

    for (
      let i = 1;
      i < values.length;
      i++
    ) {
      const previous = values[i - 1];
      const current = values[i];

      if (
        Number.isFinite(previous) &&
        Number.isFinite(current)
      ) {
        differences.push(
          Math.abs(current - previous)
        );
      }
    }

    return differences.length
      ? median(differences)
      : 0;
  }

  /* ==========================================================
     UI COLORS
     ========================================================== */

  function colorClass(value, type) {
    if (!Number.isFinite(value)) {
      return "";
    }

    if (type === "ping") {
      if (value <= 40) return "good";
      if (value <= 90) return "medium";
      return "bad";
    }

    if (type === "jitter") {
      if (value <= 10) return "good";
      if (value <= 30) return "medium";
      return "bad";
    }

    if (type === "loss") {
      if (value < 0.5) return "good";
      if (value < 2.5) return "medium";
      return "bad";
    }

    return "";
  }

  /* ==========================================================
     LIVE VALUES
     ========================================================== */

  function setLiveCard(
    id,
    value,
    type,
    unit
  ) {
    const element = $(id);

    if (!element) return;

    const display =
      Number.isFinite(value)
        ? value.toFixed(1)
        : "—";

    const unitElement =
      element.querySelector(".m-unit");

    const unitHTML =
      unitElement
        ? unitElement.outerHTML
        : unit
          ? `<span class="m-unit">${unit}</span>`
          : "";

    element.innerHTML =
      display + unitHTML;

    element.className =
      "m-value " +
      colorClass(value, type);
  }

  function setLiveValues(
    ping,
    jitter,
    loss
  ) {
    setLiveCard(
      "pingVal",
      ping,
      "ping",
      "ms"
    );

    setLiveCard(
      "pingJitter",
      jitter,
      "jitter",
      "ms"
    );

    setLiveCard(
      "pingLoss",
      loss,
      "loss",
      "%"
    );
  }

  /* ==========================================================
     STATUS
     ========================================================== */

  function setPingStatus(
    text,
    className,
    sticky
  ) {
    const element =
      $("pingStatus");

    if (!element) return;

    element.textContent = text;

    element.className =
      "ping-status" +
      (className
        ? " " + className
        : "");

    if (sticky) {
      element.dataset.sticky = "1";
    } else {
      delete element.dataset.sticky;
    }
  }

  /* ==========================================================
     RESULTS TABLE
     ========================================================== */

  function renderPingResults() {
    const body =
      $("pingResultsBody");

    if (!body) return;

    const keys =
      Object.keys(pingPerServer)
        .filter(key =>
          pingPerServer[key].attempts > 0
        );

    if (!keys.length) {
      body.innerHTML =
        `<tr>
          <td colspan="5"
              class="table-empty">
            ${t("noResults")}
          </td>
        </tr>`;

      return;
    }

    body.innerHTML =
      keys.map(key => {
        const data =
          pingPerServer[key];

        const successful =
          data.rtts.length;

        const ping =
          successful
            ? median(data.rtts)
            : NaN;

        const jitter =
          successful >= 2
            ? calculateJitter(data.rtts)
            : 0;

        const loss =
          data.attempts > 0
            ? (
                (data.attempts -
                 successful) /
                data.attempts
              ) * 100
            : 0;

        const min =
          successful
            ? Math.min(...data.rtts)
            : NaN;

        const max =
          successful
            ? Math.max(...data.rtts)
            : NaN;

        let pingColor =
          "#16a36a";

        if (ping > 90) {
          pingColor = "#e5484d";
        } else if (ping > 40) {
          pingColor = "#c78900";
        }

        return `
          <tr>
            <td class="srv">
              ${SERVER_ENDPOINTS[key].label}
            </td>

            <td
              class="ping-val"
              style="color:${pingColor}"
            >
              ${
                Number.isFinite(ping)
                  ? ping.toFixed(1) + " ms"
                  : "—"
              }
            </td>

            <td style="color:var(--muted)">
              ${
                Number.isFinite(jitter)
                  ? jitter.toFixed(1) + " ms"
                  : "—"
              }
            </td>

            <td style="color:var(--muted)">
              ${loss.toFixed(1)} %
            </td>

            <td style="color:var(--muted)">
              ${
                Number.isFinite(min)
                  ? min.toFixed(0) +
                    " / " +
                    max.toFixed(0) +
                    " ms"
                  : "—"
              }
            </td>
          </tr>
        `;
      }).join("");
  }

  /* ==========================================================
     HISTORY
     ========================================================== */

  function loadHistory() {
    try {
      const raw =
        localStorage.getItem(
          HISTORY_KEY
        );

      return raw
        ? JSON.parse(raw)
        : [];

    } catch (error) {
      return [];
    }
  }

  function saveHistory(entry) {
    const history =
      loadHistory();

    history.unshift(entry);

    try {
      localStorage.setItem(
        HISTORY_KEY,
        JSON.stringify(
          history.slice(
            0,
            MAX_HISTORY
          )
        )
      );
    } catch (error) {}

    renderHistory();
  }

  function renderHistory() {
    const body =
      $("pingHistoryBody");

    if (!body) return;

    const history =
      loadHistory();

    if (!history.length) {
      body.innerHTML =
        `<tr>
          <td colspan="5"
              class="table-empty">
            ${t("noHistory")}
          </td>
        </tr>`;

      return;
    }

    body.innerHTML =
      history.map(item => `
        <tr>
          <td style="color:var(--muted)">
            ${item.date}
          </td>

          <td style="color:var(--text);font-weight:600">
            ${item.servers}
          </td>

          <td class="ping-val">
            ${Number(item.ping).toFixed(1)} ms
          </td>

          <td style="color:var(--muted)">
            ${Number(item.jitter).toFixed(1)} ms
          </td>

          <td style="color:var(--muted)">
            ${Number(item.loss).toFixed(1)} %
          </td>
        </tr>
      `).join("");
  }

  /* ==========================================================
     SERVER SELECTION
     ========================================================== */

  function getSelectedServers() {
    const valid =
      Object.keys(
        SERVER_ENDPOINTS
      );

    const selected = [];

    document
      .querySelectorAll(
        'input[type="checkbox"]'
      )
      .forEach(checkbox => {
        if (
          checkbox.checked &&
          valid.includes(
            checkbox.value
          )
        ) {
          selected.push(
            checkbox.value
          );
        }
      });

    return selected;
  }

  /* ==========================================================
     MAIN TEST
     ========================================================== */

  async function runPingTest() {
    if (pingRunning) {
      return;
    }

    const selected =
      getSelectedServers();

    if (!selected.length) {
      setPingStatus(
        t("selectServer"),
        "err",
        true
      );

      return;
    }

    pingRunning = true;

    pingSamples = [];
    pingRtts = [];
    pingFails = 0;
    pingTotal = 0;
    pingPerServer = {};

    selected.forEach(key => {
      pingPerServer[key] = {
        rtts: [],
        attempts: 0
      };
    });

    const startButton =
      $("pingStart");

    const shareButton =
      $("pingShare");

    if (startButton) {
      startButton.disabled = true;
    }

    if (shareButton) {
      shareButton.disabled = true;
    }

    const modeElement =
      document.querySelector(
        'input[name="pingMode"]:checked'
      );

    const mode =
      modeElement
        ? modeElement.value
        : "normal";

    const overload =
      mode === "overload";

    const rounds =
      overload ? 30 : 40;

    const concurrency =
      overload ? 4 : 1;

    const interval =
      overload ? 250 : 450;

    setLiveValues(
      NaN,
      NaN,
      NaN
    );

    drawPingGraph();

    setPingStatus(
      t("running") +
      " · " +
      (
        overload
          ? t("overload")
          : t("normal")
      ),
      "live",
      true
    );

    const hint =
      $("pingChartHint");

    if (hint) {
      hint.textContent =
        t("collecting");

      hint.dataset.live = "1";
    }

    /* ========================================================
       REAL LATENCY SAMPLING
       ======================================================== */

    for (
      let round = 0;
      round < rounds &&
      pingRunning;
      round++
    ) {

      const batch = [];

      for (
        let i = 0;
        i < concurrency;
        i++
      ) {
        const index =
          (
            round * concurrency +
            i
          ) % selected.length;

        batch.push(
          selected[index]
        );
      }

      const results =
        await Promise.all(
          batch.map(
            server =>
              singlePing(server)
          )
        );

      results.forEach(
        (result, index) => {
          const server =
            batch[index];

          const serverData =
            pingPerServer[
              server
            ];

          serverData.attempts++;

          pingTotal++;

          if (result.ok) {

            serverData.rtts.push(
              result.ms
            );

            pingRtts.push(
              result.ms
            );

            pingSamples.push({
              t: performance.now(),
              ms: result.ms,
              server
            });

            if (
              pingSamples.length >
              120
            ) {
              pingSamples.shift();
            }

          } else {
            pingFails++;
          }
        }
      );

      const currentPing =
        pingRtts.length
          ? median(pingRtts)
          : NaN;

      const currentJitter =
        calculateJitter(
          pingRtts
        );

      const currentLoss =
        pingTotal
          ? (
              pingFails /
              pingTotal
            ) * 100
          : 0;

      setLiveValues(
        currentPing,
        currentJitter,
        currentLoss
      );

      drawPingGraph();
      renderPingResults();

      if (hint) {
        hint.textContent =
          t("collecting") +
          " " +
          (round + 1) +
          " / " +
          rounds +
          " · " +
          pingRtts.length +
          " " +
          t("samples");
      }

      await sleep(interval);
    }

    /* ========================================================
       FINAL RESULT
       ======================================================== */

    const finalPing =
      pingRtts.length
        ? median(pingRtts)
        : NaN;

    const finalJitter =
      calculateJitter(
        pingRtts
      );

    const finalLoss =
      pingTotal
        ? (
            pingFails /
            pingTotal
          ) * 100
        : 0;

    setLiveValues(
      finalPing,
      finalJitter,
      finalLoss
    );

    drawPingGraph();
    renderPingResults();

    if (
      Number.isFinite(finalPing)
    ) {
      setPingStatus(
        "✓ " +
        t("done") +
        " · " +
        finalPing.toFixed(1) +
        " ms",
        "done",
        true
      );
    } else {
      setPingStatus(
        t("failed"),
        "err",
        true
      );
    }

    if (hint) {
      hint.textContent =
        t("completeHint") +
        " · " +
        pingRtts.length +
        " " +
        t("successful");

      delete hint.dataset.live;
    }

    lastResult = {
      date:
        new Date().toLocaleString(),

      mode:
        overload
          ? t("overload")
          : t("normal"),

      ping:
        Number.isFinite(finalPing)
          ? finalPing
          : 0,

      jitter:
        Number.isFinite(finalJitter)
          ? finalJitter
          : 0,

      loss:
        Number.isFinite(finalLoss)
          ? finalLoss
          : 100,

      servers:
        selected.map(
          key =>
            SERVER_ENDPOINTS[
              key
            ].label
        ),

      serverKeys:
        selected
    };

    saveHistory({
      date:
        lastResult.date,

      servers:
        selected.length +
        " " +
        t("serverCount"),

      ping:
        lastResult.ping,

      jitter:
        lastResult.jitter,

      loss:
        lastResult.loss
    });

    if (shareButton) {
      shareButton.disabled = false;
    }

    if (startButton) {
      startButton.disabled = false;
    }

    pingRunning = false;
  }

  /* ==========================================================
     BUTTON
     ========================================================== */

  const startButton =
    $("pingStart");

  if (startButton) {
    startButton.addEventListener(
      "click",
      runPingTest
    );
  }

  /* ==========================================================
     MODE SWITCH
     ========================================================== */

  document
    .querySelectorAll(
      "#pingMode label"
    )
    .forEach(label => {

      const input =
        label.querySelector(
          "input"
        );

      if (!input) return;

      input.addEventListener(
        "change",
        () => {

          document
            .querySelectorAll(
              "#pingMode label"
            )
            .forEach(
              element =>
                element.classList.remove(
                  "active"
                )
            );

          if (input.checked) {
            label.classList.add(
              "active"
            );
          }
        }
      );
    });

  /* ==========================================================
     CLEAR
     ========================================================== */

  const clearButton =
    $("pingClear");

  if (clearButton) {
    clearButton.addEventListener(
      "click",
      () => {

        try {
          localStorage.removeItem(
            HISTORY_KEY
          );
        } catch (e) {}

        renderHistory();

        setPingStatus(
          t("cleared"),
          "done",
          true
        );
      }
    );
  }

  /* ==========================================================
     INIT
     ========================================================== */

  renderHistory();

  setTimeout(
    resizePingCanvas,
    100
  );

})();
