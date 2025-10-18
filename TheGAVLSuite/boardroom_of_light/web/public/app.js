const rosterEl = document.getElementById("roster");
const ledgerEl = document.getElementById("ledger");
const boardroomView = document.getElementById("boardroom-view");
const multiverseView = document.getElementById("multiverse-view");
const lightRosterEl = document.getElementById("light-roster");
const authenticRosterEl = document.getElementById("authentic-roster");
const headlinesEl = document.getElementById("headlines");
const evidenceEl = document.getElementById("evidence");
const toastEl = document.getElementById("toast");

const helpBubble = document.getElementById("help-bubble");
const helpToggle = document.getElementById("help-toggle");
const helpClose = document.getElementById("help-close");

const realmSelect = document.getElementById("realm-select");
const seatsInput = document.getElementById("seats-input");
const roundsInput = document.getElementById("rounds-input");
const quantumToggle = document.getElementById("quantum-toggle");
const multiSeatsInput = document.getElementById("multi-seats");
const multiRoundsInput = document.getElementById("multi-rounds");
const multiQuantumToggle = document.getElementById("multi-quantum");

const runSingleBtn = document.getElementById("run-single");
const runMultiverseBtn = document.getElementById("run-multiverse");

runSingleBtn.addEventListener("click", async () => {
  boardroomView.classList.remove("hidden");
  multiverseView.classList.add("hidden");
  rosterEl.innerHTML = "";
  ledgerEl.innerHTML = "";
  showToast("Running boardroom simulation...");

  try {
    const response = await fetch("/api/simulate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        realm: realmSelect.value,
        seats: seatsInput.value,
        rounds: roundsInput.value,
        quantum: quantumToggle.checked,
      }),
    });

    const payload = await response.json();
    if (!response.ok) {
      throw new Error(payload.message || "Simulation failed");
    }

    const { data } = payload;
    renderRoster(rosterEl, data.chamber.roster, realmSelect.value === "authentic");
    renderLedger(data.ledger);
    showToast("Boardroom ready.");
  } catch (error) {
    console.error(error);
    showToast(error.message, true);
  }
});

runMultiverseBtn.addEventListener("click", async () => {
  boardroomView.classList.add("hidden");
  multiverseView.classList.remove("hidden");
  lightRosterEl.innerHTML = "";
  authenticRosterEl.innerHTML = "";
  headlinesEl.innerHTML = "";
  evidenceEl.innerHTML = "";
  showToast("Running multiverse comparison...");

  try {
    const response = await fetch("/api/multiverse", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        seats: multiSeatsInput.value,
        rounds: multiRoundsInput.value,
        quantum: multiQuantumToggle.checked,
      }),
    });
    const payload = await response.json();
    if (!response.ok) {
      throw new Error(payload.message || "Comparison failed");
    }

    renderRoster(lightRosterEl, payload.data.boardrooms.light.roster);
    renderRoster(authenticRosterEl, payload.data.boardrooms.authentic.roster, true);
    renderHeadlines(payload.data.comparison.headlines);
    renderEvidence(payload.data.comparison.evidence, payload.data.comparison.accusations);
    showToast("Comparison ready.");
  } catch (error) {
    console.error(error);
    showToast(error.message, true);
  }
});

function renderRoster(root, roster = [], isAuthentic = false) {
  root.innerHTML = "";
  roster.forEach((seat) => {
    const card = document.createElement("article");
    card.className = "card";
    card.innerHTML = `
      <span class="badge">Seat ${seat.seat}</span>
      <h4>${seat.name}</h4>
      <p>${seat.title}</p>
      <p><strong>${seat.archetype || seat.virtue || ""}</strong></p>
      <p>${seat.description || ""}</p>
      ${seat.virtue ? `<p class="muted">Virtue: ${seat.virtue}</p>` : ""}
      ${seat.pressurePoint ? `<p class="muted">Pressure: ${seat.pressurePoint}</p>` : ""}
      ${seat.innerAffirmation ? `<p class="muted">Inner: ${seat.innerAffirmation}</p>` : ""}
      ${isAuthentic && seat.shadowWhisper ? `<p class="shadow">Shadow: ${seat.shadowWhisper}</p>` : ""}
    `;
    root.appendChild(card);
  });
}

function renderLedger(phases = []) {
  ledgerEl.innerHTML = "";
  phases.forEach((phase) => {
    const card = document.createElement("article");
    card.className = "phase-card";
    card.innerHTML = `<h4>${phase.phase.toUpperCase()}</h4>`;
    const list = document.createElement("div");
    list.className = "exchange-list";

    phase.exchanges.forEach((exchange) => {
      const item = document.createElement("div");
      item.className = "exchange";
      item.innerHTML = `
        <strong>${exchange.advisor}</strong> – ${exchange.polarity}
        <p>${exchange.declaration}</p>
        <p class="muted">Inner: ${exchange.innerThought}</p>
      `;
      list.appendChild(item);
    });

    card.appendChild(list);
    ledgerEl.appendChild(card);
  });
}

function renderHeadlines(headlines = []) {
  headlinesEl.innerHTML = "";
  headlines.forEach((headline) => {
    const item = document.createElement("div");
    item.className = "headline";
    item.textContent = headline;
    headlinesEl.appendChild(item);
  });
}

function renderEvidence(evidence = [], accusations = []) {
  evidenceEl.innerHTML = "";
  evidence.forEach((item) => {
    const card = document.createElement("div");
    card.className = "evidence";
    card.innerHTML = `
      <h4>${item.headline}</h4>
      <p>${item.detail}</p>
      ${item.virtuousInner ? `<p class="muted">Light inner: ${item.virtuousInner}</p>` : ""}
      ${item.authenticWhisper ? `<p class="muted">Authentic whisper: ${item.authenticWhisper}</p>` : ""}
    `;
    evidenceEl.appendChild(card);
  });

  accusations.forEach((accusation) => {
    const card = document.createElement("div");
    card.className = "evidence";
    card.style.borderColor = "rgba(255, 102, 128, 0.4)";
    card.style.background = "rgba(255, 102, 128, 0.12)";
    card.innerHTML = `
      <h4>Charge: ${accusation.target}</h4>
      <p>${accusation.charge}</p>
    `;
    evidenceEl.appendChild(card);
  });
}

function showToast(message, isError = false) {
  toastEl.textContent = message;
  toastEl.classList.remove("hidden");
  toastEl.style.borderColor = isError ? "rgba(255, 102, 128, 0.5)" : "rgba(255, 255, 255, 0.12)";
  toastEl.style.background = isError ? "rgba(60, 12, 21, 0.9)" : "rgba(14, 18, 36, 0.92)";
  clearTimeout(showToast.timeout);
  showToast.timeout = setTimeout(() => {
    toastEl.classList.add("hidden");
  }, 3200);
}

function toggleHelp() {
  helpBubble.classList.toggle("hidden");
}

helpToggle.addEventListener("click", toggleHelp);
helpClose.addEventListener("click", () => helpBubble.classList.add("hidden"));
helpBubble.addEventListener("dblclick", () => {
  helpBubble.style.top = "20px";
  helpBubble.style.right = "20px";
  helpBubble.style.left = "";
});

let isDragging = false;
let offsetX = 0;
let offsetY = 0;

helpBubble.addEventListener("pointerdown", (event) => {
  isDragging = true;
  helpBubble.setPointerCapture(event.pointerId);
  offsetX = event.clientX - helpBubble.offsetLeft;
  offsetY = event.clientY - helpBubble.offsetTop;
});

helpBubble.addEventListener("pointermove", (event) => {
  if (!isDragging) return;
  const x = event.clientX - offsetX;
  const y = event.clientY - offsetY;
  helpBubble.style.left = `${Math.max(12, Math.min(window.innerWidth - helpBubble.offsetWidth - 12, x))}px`;
  helpBubble.style.top = `${Math.max(12, Math.min(window.innerHeight - helpBubble.offsetHeight - 12, y))}px`;
  helpBubble.style.right = "";
});

helpBubble.addEventListener("pointerup", (event) => {
  isDragging = false;
  helpBubble.releasePointerCapture(event.pointerId);
});

helpBubble.addEventListener("pointerleave", () => {
  isDragging = false;
});
