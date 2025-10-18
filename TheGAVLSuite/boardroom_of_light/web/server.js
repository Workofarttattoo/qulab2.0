import crypto from "crypto";
import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { spawn } from "child_process";

import { BoardroomOfLightSimulator } from "../src/boardroom-simulator.js";
import { runMultiverse, structureResult } from "../src/boardroom-multiverse.js";
import { getBoardroomByRealm } from "../src/boardroom-personas.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const MODULE_DIR = path.join(__dirname, "..", "src");

const JURY_PLUGINS = {
  local: path.join(MODULE_DIR, "boardroom_plugins", "quantum_jury_local.py"),
  ibm: path.join(MODULE_DIR, "boardroom_plugins", "quantum_jury_ibm.py"),
};

const app = express();
const PORT = Number.parseInt(process.env.PORT ?? "5050", 10);

app.use(express.json({ limit: "5mb" }));
app.use(express.static(path.join(__dirname, "public")));

// ---------------------------------------------------------------------------
// In-memory governance state (kept here so dashboard talks to live APIs)
// ---------------------------------------------------------------------------

const state = {
  corporations: [],
  research: new Map(),
  compliance: new Map(),
  locks: new Map(),
  memories: new Map(),
};

function uuid() {
  return crypto.randomUUID?.() ?? `${Date.now().toString(16)}-${Math.random().toString(16).slice(2)}`;
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function ensureCorp(corpId) {
  const corp = state.corporations.find((entry) => entry.id === corpId);
  if (!corp) {
    const error = new Error(`Corporation ${corpId} not found`);
    error.statusCode = 404;
    throw error;
  }
  return corp;
}

function seedCompliance(corpId) {
  if (!state.compliance.has(corpId)) {
    state.compliance.set(corpId, {
      officer: "C&EO",
      nudges: [
        "Keep consensus logs synced with Boardroom of Light",
        "Publish weekly ethics digest",
      ],
      bottlenecks: [
        "Awaiting SOC 2 Type II attestation",
        "Regional privacy addendum draft",
      ],
      logs: [],
    });
  }
}

function seedResearch(corpId) {
  if (!state.research.has(corpId)) {
    const ideas = Array.from({ length: 10 }).map((_, index) => ({
      id: uuid(),
      title: `Idea ${index + 1}`,
      description: "Synthetic opportunity generated for sandbox use.",
      projected_roi: 35 + index,
      risk_score: 0.2 + index * 0.03,
      capital_required: 50000 + index * 15000,
      timeframe_months: 6 + index,
      confidence: 0.6 + index * 0.02,
    }));
    state.research.set(corpId, {
      total_ideas: 10000,
      top_five_do_now: ideas.slice(0, 5),
      top_ten: ideas,
    });
  }
}

function seedMemories(corpId) {
  if (!state.memories.has(corpId)) {
    state.memories.set(corpId, { items: [] });
  }
}

function ensureSeeded() {
  if (!state.corporations.length) {
    const id = uuid();
    state.corporations.push({
      id,
      name: "Lumen Labs",
      region: "Delaware",
      onboarding: {
        ein: "in-progress",
        dba: "pending",
        state_tax: "pending",
        county_filing: "pending",
        notes: "Seed corporation for exploration.",
      },
      locked: null,
    });
    seedCompliance(id);
    seedResearch(id);
    seedMemories(id);
  }
}

ensureSeeded();

async function notifyJimminy(multiverse) {
  if (!multiverse) return;
  const host = process.env.JIMMINY_HOST ?? "127.0.0.1";
  const port = process.env.JIMMINY_PORT ?? "4180";
  const endpoint = process.env.JIMMINY_WEBHOOK ?? `http://${host}:${port}/ingest`;
  try {
    await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ multiverse }),
    });
  } catch (error) {
    if (process.env.DEBUG_JIMMINY) {
      console.warn(`[boardroom] jimminy notify failed: ${error.message}`);
    }
  }
}

async function triggerConscience() {
  if (process.env.DISABLE_JIMMINY_NOTIFY === "1") {
    return;
  }
  try {
    const multiverse = await runMultiverse({});
    await notifyJimminy(multiverse);
  } catch (error) {
    if (process.env.DEBUG_JIMMINY) {
      console.warn(`[boardroom] conscience refresh failed: ${error.message}`);
    }
  }
}

function scheduleConscience() {
  setImmediate(() => {
    triggerConscience().catch(() => undefined);
  });
}

// ---------------------------------------------------------------------------
// Simulation + quantum jury endpoints
// ---------------------------------------------------------------------------

app.post("/api/simulate", async (req, res) => {
  try {
    const options = {
      realm: req.body?.realm === "authentic" ? "authentic" : "light",
      seats: Number.parseInt(req.body?.seats ?? 7, 10),
      rounds: Number.parseInt(req.body?.rounds ?? 3, 10),
      quantum: Boolean(req.body?.quantum ?? false),
      quantumConfig: req.body?.quantumConfig ?? {},
      advisors: getBoardroomByRealm(req.body?.realm),
    };

    const simulator = new BoardroomOfLightSimulator(options);
    const result = await simulator.run();
    res.json({ status: "ok", data: structureResult(result) });
    scheduleConscience();
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
});

app.post("/api/multiverse", async (req, res) => {
  try {
    const options = {
      seats: Number.parseInt(req.body?.seats ?? 7, 10),
      rounds: Number.parseInt(req.body?.rounds ?? 3, 10),
      quantum: Boolean(req.body?.quantum ?? false),
      quantumConfig: req.body?.quantumConfig ?? {},
    };

    const multiverse = await runMultiverse(options);
    res.json({ status: "ok", data: multiverse });
    scheduleConscience();
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
});

app.post("/api/quantum-jury", async (req, res) => {
  try {
    const mode = req.body?.mode === "ibm" ? "ibm" : "local";
    const plugin = JURY_PLUGINS[mode];
    const child = spawn("python3", [plugin], {
      cwd: MODULE_DIR,
      stdio: ["pipe", "pipe", "pipe"],
    });

    const chunks = [];
    const errors = [];
    child.stdout.on("data", (chunk) => chunks.push(chunk));
    child.stderr.on("data", (chunk) => errors.push(chunk));

    child.stdin.write(JSON.stringify(req.body?.payload ?? {}));
    child.stdin.end();

    child.on("close", (code) => {
      if (errors.length) {
        console.error(Buffer.concat(errors).toString("utf8"));
      }
      const raw = Buffer.concat(chunks).toString("utf8");
      try {
        const parsed = JSON.parse(raw || "{}");
        if (parsed.status === "ok") {
          res.json(parsed);
        } else {
          res.status(500).json(parsed);
        }
      } catch (err) {
        res.status(500).json({ status: "error", message: err.message || raw || "Quantum jury failed." });
      }
      if (code !== 0) {
        console.warn(`[quantum-jury] child exited with code ${code}`);
      }
    });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
});

// ---------------------------------------------------------------------------
// Governance + dashboard endpoints
// ---------------------------------------------------------------------------

app.get("/api/corporations", (req, res) => {
  ensureSeeded();
  res.json({ status: "ok", data: clone(state.corporations) });
});

app.post("/api/corporations", (req, res) => {
  const id = uuid();
  const corp = {
    id,
    name: (req.body?.name || "Untitled Corp").trim() || "Untitled Corp",
    region: (req.body?.region || "").trim(),
    onboarding: {
      ein: "pending",
      dba: "pending",
      state_tax: "pending",
      county_filing: "pending",
      notes: "",
    },
    locked: null,
  };
  state.corporations.push(corp);
  seedCompliance(id);
  seedResearch(id);
  seedMemories(id);
  res.status(201).json({ status: "ok", data: clone(corp) });
  scheduleConscience();
});

app.get("/api/corporations/:id", (req, res) => {
  try {
    const corp = ensureCorp(req.params.id);
    res.json({ status: "ok", data: clone(corp) });
  } catch (error) {
    res.status(error.statusCode ?? 500).json({ status: "error", message: error.message });
  }
});

app.get("/api/corporations/:id/dashboard", (req, res) => {
  try {
    const corp = ensureCorp(req.params.id);
    seedResearch(corp.id);
    seedCompliance(corp.id);
    const research = state.research.get(corp.id);
    const compliance = state.compliance.get(corp.id);
    const payload = {
      name: corp.name,
      onboarding: corp.onboarding,
      research_summary: {
        total_ideas: research?.total_ideas ?? 0,
        avg_roi: research && research.top_five_do_now.length
          ? research.top_five_do_now.reduce((sum, item) => sum + item.projected_roi, 0) /
            research.top_five_do_now.length
          : 0,
      },
      locked_business: state.locks.get(corp.id) ?? null,
      compliance: {
        recent_logs: (compliance?.logs ?? []).slice(-3),
      },
    };
    res.json({ status: "ok", data: payload });
  } catch (error) {
    res.status(error.statusCode ?? 500).json({ status: "error", message: error.message });
  }
});

app.patch("/api/corporations/:id/onboarding", (req, res) => {
  try {
    const corp = ensureCorp(req.params.id);
    corp.onboarding = { ...corp.onboarding, ...(req.body ?? {}) };
    res.json({ status: "ok", data: clone(corp.onboarding) });
    scheduleConscience();
  } catch (error) {
    res.status(error.statusCode ?? 500).json({ status: "error", message: error.message });
  }
});

app.post("/api/corporations/:id/research", (req, res) => {
  try {
    const corp = ensureCorp(req.params.id);
    seedResearch(corp.id);
    const research = state.research.get(corp.id);
    if (req.body?.budget) {
      const factor = Math.min(2, Math.max(0.5, Number(req.body.budget) / 150000));
      research.top_five_do_now = research.top_five_do_now.map((idea) => ({
        ...idea,
        projected_roi: Math.min(100, idea.projected_roi * factor),
      }));
    }
    state.research.set(corp.id, research);
    res.json({ status: "ok", data: clone(research) });
    scheduleConscience();
  } catch (error) {
    res.status(error.statusCode ?? 500).json({ status: "error", message: error.message });
  }
});

app.get("/api/corporations/:id/research", (req, res) => {
  try {
    const corp = ensureCorp(req.params.id);
    seedResearch(corp.id);
    res.json({ status: "ok", data: clone(state.research.get(corp.id)) });
  } catch (error) {
    res.status(error.statusCode ?? 500).json({ status: "error", message: error.message });
  }
});

app.get("/api/corporations/:id/research/export", (req, res) => {
  try {
    const corp = ensureCorp(req.params.id);
    seedResearch(corp.id);
    const research = state.research.get(corp.id);
    const rows = [
      ["idea", "roi", "risk", "capital", "timeframe"],
      ...research.top_ten.map((idea) => [
        idea.title,
        idea.projected_roi,
        idea.risk_score,
        idea.capital_required,
        idea.timeframe_months,
      ]),
    ];
    const csv = rows.map((row) => row.join(",")).join("\n");
    res.setHeader("Content-Type", "text/csv");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${corp.name.replace(/\\s+/g, "_")}-ideas.csv"`,
    );
    res.send(csv);
  } catch (error) {
    res.status(error.statusCode ?? 500).json({ status: "error", message: error.message });
  }
});

app.post("/api/corporations/:id/lock", (req, res) => {
  try {
    const corp = ensureCorp(req.params.id);
    seedResearch(corp.id);
    const research = state.research.get(corp.id);
    const idea = research?.top_ten?.find((item) => item.id === req.body?.idea_id);
    if (!idea) {
      throw Object.assign(new Error("Idea not found"), { statusCode: 404 });
    }
    const lock = {
      idea,
      first_quarter_budget: Number(req.body?.first_quarter_budget ?? 0),
      key_objectives: Array.isArray(req.body?.key_objectives) ? req.body.key_objectives : [],
      compliance_plan: req.body?.compliance_plan ?? "",
    };
    state.locks.set(corp.id, lock);
    corp.locked = lock;
    res.json({ status: "ok", data: clone(lock) });
    scheduleConscience();
  } catch (error) {
    res.status(error.statusCode ?? 500).json({ status: "error", message: error.message });
  }
});

app.delete("/api/corporations/:id/lock", (req, res) => {
  try {
    const corp = ensureCorp(req.params.id);
    state.locks.delete(corp.id);
    corp.locked = null;
    res.status(204).end();
    scheduleConscience();
  } catch (error) {
    res.status(error.statusCode ?? 500).json({ status: "error", message: error.message });
  }
});

app.get("/api/corporations/:id/compliance", (req, res) => {
  try {
    const corp = ensureCorp(req.params.id);
    seedCompliance(corp.id);
    res.json({ status: "ok", data: clone(state.compliance.get(corp.id)) });
  } catch (error) {
    res.status(error.statusCode ?? 500).json({ status: "error", message: error.message });
  }
});

app.post("/api/corporations/:id/compliance", (req, res) => {
  try {
    const corp = ensureCorp(req.params.id);
    seedCompliance(corp.id);
    const compliance = state.compliance.get(corp.id);
    compliance.logs.push({
      id: uuid(),
      timestamp: new Date().toISOString(),
      owner: req.body?.owner || "C&EO",
      category: req.body?.category || "ops",
      summary: req.body?.summary || "",
    });
    res.status(201).json({ status: "ok", data: clone(compliance) });
    scheduleConscience();
  } catch (error) {
    res.status(error.statusCode ?? 500).json({ status: "error", message: error.message });
  }
});

app.get("/api/corporations/:id/memories", (req, res) => {
  try {
    const corp = ensureCorp(req.params.id);
    seedMemories(corp.id);
    res.json({ status: "ok", data: clone(state.memories.get(corp.id)) });
  } catch (error) {
    res.status(error.statusCode ?? 500).json({ status: "error", message: error.message });
  }
});

app.post("/api/corporations/:id/memories", (req, res) => {
  try {
    const corp = ensureCorp(req.params.id);
    seedMemories(corp.id);
    const record = state.memories.get(corp.id);
    const memory = {
      id: uuid(),
      filename: req.body?.filename || "artifact.bin",
      category: req.body?.category || "artifact",
      content: req.body?.content || null,
      uploaded_at: new Date().toISOString(),
    };
    record.items.push(memory);
    res.status(201).json({ status: "ok", data: clone(memory) });
    scheduleConscience();
  } catch (error) {
    res.status(error.statusCode ?? 500).json({ status: "error", message: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`[boardroom-of-light] GUI listening on http://localhost:${PORT}`);
});
