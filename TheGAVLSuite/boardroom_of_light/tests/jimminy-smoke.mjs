import { spawn } from "child_process";
import { once } from "events";
import { setTimeout as delay } from "timers/promises";
import assert from "node:assert/strict";
import process from "node:process";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { BoardroomOfLightSimulator } from "../src/boardroom-simulator.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.join(__dirname, "..");

class SkipTestError extends Error {
  constructor(message) {
    super(message);
    this.name = "SkipTest";
  }
}

async function startServer() {
  const server = spawn("node", ["src/jimminy-cricket-server.mjs"], {
    cwd: PROJECT_ROOT,
    stdio: ["ignore", "pipe", "pipe"],
    env: {
      ...process.env,
      JIMMINY_HOST: process.env.JIMMINY_HOST ?? "127.0.0.1",
      JIMMINY_PORT: process.env.JIMMINY_PORT ?? "4180",
      JIMMINY_AUTONOMY_COOLDOWN_MS: "4000",
    },
  });

  let resolved = false;
  const readyPromise = new Promise((resolve, reject) => {
    server.stdout.on("data", (chunk) => {
      const text = chunk.toString("utf8");
      if (!resolved && text.includes("Jimminy Cricket server")) {
        resolved = true;
        resolve();
      }
    });
    server.stderr.on("data", (chunk) => {
      const text = chunk.toString("utf8");
      if (!resolved && text.includes("EPERM")) {
        resolved = true;
        reject(new SkipTestError("Port binding blocked by sandbox."));
      } else if (!resolved) {
        resolved = true;
        reject(new Error(text));
      }
    });
    server.on("exit", (code) => {
      if (!resolved) {
        reject(new Error(`Jimminy server exited prematurely with code ${code}`));
      }
    });
  });

  await readyPromise;
  return server;
}

async function stopServer(server) {
  if (server?.killed) return;
  server.kill();
  try {
    await once(server, "exit");
  } catch (error) {
    // ignore
  }
}

async function fetchText(url) {
  const response = await fetch(url);
  assert.equal(response.status, 200, `Expected 200 from ${url}, received ${response.status}`);
  return response.text();
}

async function fetchJson(url) {
  const response = await fetch(url);
  assert.equal(response.status, 200, `Expected 200 from ${url}, received ${response.status}`);
  return response.json();
}

async function runSmoke() {
  let server;
  try {
    server = await startServer();
  } catch (error) {
    if (error instanceof SkipTestError) {
      console.warn(`[jimminy-smoke] Skipping: ${error.message}`);
      return;
    }
    throw error;
  }

  try {
    const host = process.env.JIMMINY_HOST ?? "127.0.0.1";
    const port = process.env.JIMMINY_PORT ?? "4180";
    const base = `http://${host}:${port}`;

    const html = await fetchText(`${base}/`);
    assert.ok(html.includes("Jimminy Cricket Whisper Log"), "Missing whisper log heading");

    const script = await fetchText(`${base}/jimminy.js`);
    assert.ok(script.includes("buildWireSphere"), "Jimminy wireframe builder missing");

    const lightResult = await new BoardroomOfLightSimulator({ realm: "light", seats: 6, rounds: 2 }).run();
    const authenticResult = await new BoardroomOfLightSimulator({ realm: "authentic", seats: 6, rounds: 2 }).run();

    const ingestResponse = await fetch(`${base}/ingest`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ lightResult, authenticResult }),
    });
    assert.equal(ingestResponse.status, 202, "Expected 202 from /ingest");

    await delay(500);

    const latest = await fetchJson(`${base}/api/latest`);
    assert.equal(latest.status, "ok", "Latest endpoint did not return ok status");
    assert.ok(latest.multiverse?.boardrooms?.light, "Latest payload missing light boardroom");
    assert.ok(latest.multiverse?.boardrooms?.authentic, "Latest payload missing authentic boardroom");
  } finally {
    await stopServer(server);
  }
}

runSmoke().catch((error) => {
  if (error instanceof SkipTestError) {
    console.warn(`[jimminy-smoke] Skipping: ${error.message}`);
    process.exit(0);
    return;
  }
  console.error(error);
  process.exitCode = 1;
});
