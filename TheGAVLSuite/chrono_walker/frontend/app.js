const elements = {
  ledgerBody: document.querySelector("#ledger-table tbody"),
  addStatus: document.querySelector('[data-slot="add-status"]'),
  forecastStatus: document.querySelector('[data-slot="forecast-status"]'),
  cadenceStatus: document.querySelector('[data-slot="cadence-status"]'),
  bandStatus: document.querySelector('[data-slot="band-status"]'),
  forecastConsole: document.querySelector("#forecast-console"),
  cadenceConsole: document.querySelector("#cadence-console"),
  bandConsole: document.querySelector("#band-console"),
  forecastChart: document.getElementById("forecast-chart"),
  cadenceGauge: document.getElementById("cadence-gauge"),
  bandViolations: document.getElementById("band-violations"),
  overlay: document.getElementById("system-status"),
  refreshLedgerBtn: document.getElementById("refresh-ledger"),
  metricStart: document.querySelector('[data-metric="start-mean"]'),
  metricFinal: document.querySelector('[data-metric="final-mean"]'),
  metricLo: document.querySelector('[data-metric="final-lo"]'),
  metricHi: document.querySelector('[data-metric="final-hi"]'),
};

const state = {
  online: false,
  healthTimer: null,
};

async function request(path, payload = null) {
  const init = {
    method: payload ? "POST" : "GET",
    headers: payload ? { "Content-Type": "application/json" } : undefined,
    body: payload ? JSON.stringify(payload) : undefined,
  };
  let response;
  try {
    response = await fetch(path, init);
  } catch (error) {
    throw new Error(error.message || "Network request failed");
  }
  const text = await response.text();
  let data = null;
  try {
    data = text ? JSON.parse(text) : {};
  } catch (error) {
    /* leave data null if JSON decode fails */
  }
  if (!response.ok) {
    const message = data && data.error ? data.error : `HTTP ${response.status}`;
    throw new Error(message);
  }
  return data ?? {};
}

function pulseStatus(node, text, ok = true) {
  if (!node) return;
  node.textContent = text;
  node.classList.remove("ok", "err");
  node.classList.add(ok ? "ok" : "err");
  setTimeout(() => {
    node?.classList.remove("ok", "err");
  }, 4500);
}

function setOnline(online) {
  state.online = online;
  if (!elements.overlay) return;
  if (online) {
    elements.overlay.classList.add("hidden");
  } else {
    elements.overlay.classList.remove("hidden");
  }
}

async function checkHealth({ silent = false } = {}) {
  try {
    await request("/api/health");
    if (!state.online && !silent) {
      pulseStatus(elements.addStatus, "Telemetry uplink restored.");
    }
    setOnline(true);
    return true;
  } catch (error) {
    if (!silent) {
      pulseStatus(elements.addStatus, "Server offline. Launch backend.server", false);
    }
    setOnline(false);
    return false;
  }
}

function ensureOnline(statusNode) {
  if (state.online) return true;
  pulseStatus(statusNode, "Server offline. Launch backend.server", false);
  return false;
}

function formatNumber(value, decimals = 3) {
  if (!Number.isFinite(value)) return "--";
  return Number.parseFloat(value).toFixed(decimals);
}

async function refreshLedger() {
  if (!state.online) {
    elements.ledgerBody.innerHTML = '<tr><td colspan="6">Server offline.</td></tr>';
    return;
  }
  try {
    const { ledger = [] } = await request("/api/ledger");
    if (!ledger.length) {
      elements.ledgerBody.innerHTML = '<tr><td colspan="6">No evidence recorded yet.</td></tr>';
      return;
    }
    elements.ledgerBody.innerHTML = ledger
      .slice()
      .reverse()
      .map(
        (row) => `<tr>
            <td>${row.timestamp}</td>
            <td>${row.field}</td>
            <td>${row.kind}</td>
            <td>${formatNumber(row.strength, 2)}</td>
            <td>${formatNumber(row.outcome, 2)}</td>
            <td>${row.title || "--"}</td>
          </tr>`
      )
      .join("");
  } catch (error) {
    elements.ledgerBody.innerHTML = `<tr><td colspan="6">Error fetching ledger: ${error.message}</td></tr>`;
  }
}

function renderForecastMetrics(payload) {
  if (!elements.metricStart) return;
  const finalIndex = Math.max(0, (payload.trajectory_means?.length || 1) - 1);
  const finalMean = payload.trajectory_means?.[finalIndex];
  const finalLo = payload.lo?.[finalIndex];
  const finalHi = payload.hi?.[finalIndex];

  elements.metricStart.textContent = formatNumber(payload.start_mean, 3);
  elements.metricFinal.textContent = formatNumber(finalMean, 3);
  elements.metricLo.textContent = formatNumber(finalLo, 3);
  elements.metricHi.textContent = formatNumber(finalHi, 3);
}

function renderForecastChart(payload) {
  const canvas = elements.forecastChart;
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  const means = payload.trajectory_means ?? [];
  const lows = payload.lo ?? [];
  const highs = payload.hi ?? [];

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (!means.length) {
    ctx.fillStyle = "rgba(102, 246, 255, 0.6)";
    ctx.font = "16px 'Fira Code', monospace";
    ctx.textAlign = "center";
    ctx.fillText("Awaiting projection...", canvas.width / 2, canvas.height / 2);
    return;
  }

  const combined = [...means, ...lows, ...highs, payload.start_mean].filter((v) => Number.isFinite(v));
  const minVal = Math.max(0, Math.min(...combined) - 0.05);
  const maxVal = Math.min(1, Math.max(...combined) + 0.05);
  const range = Math.max(maxVal - minVal, 1e-3);

  const marginX = 30;
  const marginY = 20;
  const width = canvas.width - marginX * 2;
  const height = canvas.height - marginY * 2;
  const count = means.length;
  const stepX = count > 1 ? width / (count - 1) : 0;

  const scaleX = (i) => marginX + i * stepX;
  const scaleY = (value) => marginY + height - ((value - minVal) / range) * height;

  const gradient = ctx.createLinearGradient(0, marginY, 0, height + marginY);
  gradient.addColorStop(0, "rgba(102, 246, 255, 0.32)");
  gradient.addColorStop(1, "rgba(102, 246, 255, 0.02)");

  ctx.beginPath();
  ctx.moveTo(scaleX(0), scaleY(lows[0] ?? means[0]));
  for (let i = 0; i < count; i += 1) {
    ctx.lineTo(scaleX(i), scaleY(lows[i] ?? means[i]));
  }
  for (let i = count - 1; i >= 0; i -= 1) {
    ctx.lineTo(scaleX(i), scaleY(highs[i] ?? means[i]));
  }
  ctx.closePath();
  ctx.fillStyle = gradient;
  ctx.fill();

  ctx.lineWidth = 2.2;
  ctx.strokeStyle = "rgba(57, 255, 196, 0.85)";
  ctx.beginPath();
  ctx.moveTo(scaleX(0), scaleY(means[0]));
  for (let i = 1; i < count; i += 1) {
    ctx.lineTo(scaleX(i), scaleY(means[i]));
  }
  ctx.stroke();

  ctx.fillStyle = "rgba(57, 255, 196, 0.9)";
  ctx.shadowColor = "rgba(57, 255, 196, 0.6)";
  ctx.shadowBlur = 12;
  ctx.beginPath();
  ctx.arc(scaleX(0), scaleY(means[0]), 4, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(scaleX(count - 1), scaleY(means[count - 1]), 5, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;

  ctx.strokeStyle = "rgba(102, 246, 255, 0.15)";
  ctx.lineWidth = 1;
  ctx.setLineDash([4, 8]);
  for (let i = 0; i < count; i += 1) {
    const x = scaleX(i);
    ctx.beginPath();
    ctx.moveTo(x, marginY);
    ctx.lineTo(x, canvas.height - marginY / 2);
    ctx.stroke();
  }
  ctx.setLineDash([]);

  ctx.fillStyle = "rgba(232, 245, 255, 0.65)";
  ctx.font = "12px 'Orbitron', sans-serif";
  ctx.textAlign = "center";
  for (let i = 0; i < count; i += 1) {
    const label = `P${i + 1}`;
    ctx.fillText(label, scaleX(i), canvas.height - 6);
  }
}

function renderForecastConsole(payload) {
  const means = payload.trajectory_means ?? [];
  if (!means.length) {
    elements.forecastConsole.textContent = "Awaiting projection...";
    return;
  }
  const lastIndex = means.length - 1;
  const lines = [
    `[start] ${formatNumber(payload.start_mean)}`,
    `[periods] ${means.length}`,
    `[mean→P${lastIndex + 1}] ${formatNumber(means[lastIndex])}`,
    `[band (5-95)] ${formatNumber(payload.lo?.[lastIndex])} – ${formatNumber(payload.hi?.[lastIndex])}`,
  ];
  elements.forecastConsole.textContent = lines.join("\n");
}

function renderCadenceGauge(payload) {
  const container = elements.cadenceGauge;
  if (!container) return;
  container.innerHTML = "";

  if (!Number.isFinite(payload.total_events)) {
    container.textContent = "Cadence requires more signal.";
    return;
  }

  const ratio = Math.min(payload.events_per_period / 12, 1);
  const height = Math.max(14, Math.round(ratio * 100));
  const left = 8 + ratio * 84;

  const bar = document.createElement("div");
  bar.className = "sparkline-bar";
  bar.style.height = `${height}%`;
  bar.style.left = `${left}%`;
  container.appendChild(bar);

  const label = document.createElement("div");
  label.className = "gauge-label";
  label.style.left = `${left}%`;
  label.textContent = `${payload.events_per_period} / period`;
  container.appendChild(label);

  const baseline = document.createElement("div");
  baseline.className = "gauge-label";
  baseline.style.left = "6%";
  baseline.style.top = "6px";
  baseline.textContent = `Events total ≈ ${formatNumber(payload.total_events, 1)}`;
  container.appendChild(baseline);
}

function renderCadenceConsole(payload) {
  if (!Number.isFinite(payload.total_events)) {
    elements.cadenceConsole.textContent = "Unable to solve cadence with current parameters.";
    return;
  }
  const lines = [
    `[current_mean] ${formatNumber(payload.current_mean)}`,
    `[total_events] ${formatNumber(payload.total_events, 1)}`,
    `[events/period] ${payload.events_per_period}`,
  ];
  elements.cadenceConsole.textContent = lines.join("\n");
}

function renderBandViolations(payload) {
  const container = elements.bandViolations;
  if (!container) return;
  container.innerHTML = "";
  if (payload.ok) {
    const card = document.createElement("div");
    card.className = "anomaly-card";
    card.innerHTML = "<strong>Stable</strong><span>All projected periods remain inside band.</span>";
    container.appendChild(card);
    return;
  }
  if (!payload.violations || !payload.violations.length) {
    container.textContent = "No violation data available.";
    return;
  }
  payload.violations.forEach((violation) => {
    const card = document.createElement("div");
    card.className = "anomaly-card";
    card.innerHTML = `<strong>Period ${violation.period}</strong><span>Mean ${formatNumber(
      violation.mean,
      3
    )} (${formatNumber(violation.lo, 3)} – ${formatNumber(violation.hi, 3)})</span>`;
    container.appendChild(card);
  });
}

function renderBandConsole(payload) {
  const lines = [
    `[start] ${formatNumber(payload.start_mean)}`,
    `[bounds] ${formatNumber(payload.bounds?.[0])} – ${formatNumber(payload.bounds?.[1])}`,
    `[status] ${payload.ok ? "IN-BAND" : "BREACH"}`,
  ];
  elements.bandConsole.textContent = lines.join("\n");
}

function bindTabs() {
  const buttons = document.querySelectorAll(".tab-button");
  const panels = document.querySelectorAll(".panel");
  buttons.forEach((btn) => {
    btn.classList.add("pulse-button");
    btn.addEventListener("click", () => {
      buttons.forEach((b) => b.classList.remove("active"));
      panels.forEach((panel) => panel.classList.remove("active"));
      btn.classList.add("active");
      document.getElementById(btn.dataset.target).classList.add("active");
    });
  });
}

function initForms() {
  document.querySelectorAll("button.primary, button.ghost-btn").forEach((btn) => {
    btn.classList.add("pulse-button");
  });

  document.querySelector("#add-evidence-form").addEventListener("submit", async (event) => {
    event.preventDefault();
    if (!ensureOnline(elements.addStatus)) return;
    const data = new FormData(event.currentTarget);
    const payload = {
      field: data.get("field"),
      kind: data.get("kind"),
      strength: Number.parseFloat(data.get("strength")),
      outcome: Number.parseFloat(data.get("outcome")),
      source: data.get("source") || "",
      title: data.get("title") || "",
      notes: data.get("notes") || "",
    };
    try {
      const result = await request("/api/add-evidence", payload);
      if (result.error) throw new Error(result.error);
      pulseStatus(elements.addStatus, "Evidence captured.");
      event.currentTarget.reset();
      refreshLedger();
    } catch (error) {
      pulseStatus(elements.addStatus, `Error: ${error.message}`, false);
    }
  });

  document.querySelector("#forecast-form").addEventListener("submit", async (event) => {
    event.preventDefault();
    if (!ensureOnline(elements.forecastStatus)) return;
    elements.forecastStatus.textContent = "Running Monte Carlo...";
    const data = new FormData(event.currentTarget);
    const payload = {
      periods: Number.parseInt(data.get("periods"), 10),
      events_per_period: Number.parseInt(data.get("events_per_period"), 10),
      profile: data.get("profile"),
      event_strength: Number.parseFloat(data.get("event_strength")),
      outcome_mean: Number.parseFloat(data.get("outcome_mean")),
      outcome_std: Number.parseFloat(data.get("outcome_std")),
    };
    try {
      const result = await request("/api/forecast", payload);
      renderForecastMetrics(result);
      renderForecastChart(result);
      renderForecastConsole(result);
      pulseStatus(elements.forecastStatus, "Simulation complete.");
    } catch (error) {
      pulseStatus(elements.forecastStatus, `Error: ${error.message}`, false);
      renderForecastChart({ trajectory_means: [] });
    }
  });

  document.querySelector("#cadence-form").addEventListener("submit", async (event) => {
    event.preventDefault();
    if (!ensureOnline(elements.cadenceStatus)) return;
    elements.cadenceStatus.textContent = "Solving cadence...";
    const data = new FormData(event.currentTarget);
    const payload = {
      band_low: Number.parseFloat(data.get("band_low")),
      periods: Number.parseInt(data.get("periods"), 10),
      event_strength: Number.parseFloat(data.get("event_strength")),
      event_outcome: Number.parseFloat(data.get("event_outcome")),
    };
    try {
      const result = await request("/api/plan-cadence", payload);
      renderCadenceConsole(result);
      renderCadenceGauge(result);
      pulseStatus(elements.cadenceStatus, "Cadence solved.");
    } catch (error) {
      pulseStatus(elements.cadenceStatus, `Error: ${error.message}`, false);
      elements.cadenceConsole.textContent = "Cadence computation failed.";
      elements.cadenceGauge.textContent = "";
    }
  });

  document.querySelector("#band-form").addEventListener("submit", async (event) => {
    event.preventDefault();
    if (!ensureOnline(elements.bandStatus)) return;
    elements.bandStatus.textContent = "Evaluating trajectories...";
    const data = new FormData(event.currentTarget);
    const payload = {
      low: Number.parseFloat(data.get("low")),
      high: Number.parseFloat(data.get("high")),
      periods: Number.parseInt(data.get("periods"), 10),
      events_per_period: Number.parseInt(data.get("events_per_period"), 10),
      event_strength: Number.parseFloat(data.get("event_strength")),
      event_outcome: Number.parseFloat(data.get("event_outcome")),
      event_outcome_std: Number.parseFloat(data.get("event_outcome_std")),
    };
    try {
      const result = await request("/api/enforce-band", payload);
      renderBandConsole(result);
      renderBandViolations(result);
      pulseStatus(elements.bandStatus, result.ok ? "Cadence within band." : "Band breach detected.", result.ok);
    } catch (error) {
      pulseStatus(elements.bandStatus, `Error: ${error.message}`, false);
      elements.bandConsole.textContent = "Band evaluation failed.";
      elements.bandViolations.textContent = "";
    }
  });
}

async function main() {
  bindTabs();
  initForms();
  await checkHealth({ silent: true });
  if (state.online) {
    refreshLedger();
  }
  if (elements.refreshLedgerBtn) {
    elements.refreshLedgerBtn.addEventListener("click", () => {
      if (!ensureOnline(elements.addStatus)) return;
      refreshLedger();
    });
  }
  state.healthTimer = setInterval(() => checkHealth({ silent: true }), 12000);
}

window.addEventListener("DOMContentLoaded", main);
