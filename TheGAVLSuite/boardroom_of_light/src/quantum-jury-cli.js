#!/usr/bin/env node
import { spawn } from "child_process";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { readFile } from "fs/promises";

const MODULE_DIR = dirname(fileURLToPath(import.meta.url));
const PLUGINS = {
  ibm: join(MODULE_DIR, "boardroom_plugins", "quantum_jury_ibm.py"),
  local: join(MODULE_DIR, "boardroom_plugins", "quantum_jury_local.py"),
};

function parseArgs(argv) {
  const options = { mode: "local" };
  for (let i = 2; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === "--mode" && argv[i + 1]) {
      options.mode = argv[i + 1];
      i += 1;
    } else if (arg === "--payload" && argv[i + 1]) {
      options.payloadPath = argv[i + 1];
      i += 1;
    }
  }
  return options;
}

async function loadPayload(payloadPath) {
  if (!payloadPath) {
    return {};
  }
  const absolute = payloadPath.startsWith("/") ? payloadPath : join(process.cwd(), payloadPath);
  const raw = await readFile(absolute, "utf8");
  return JSON.parse(raw);
}

async function main() {
  const options = parseArgs(process.argv);
  const plugin = PLUGINS[options.mode];
  if (!plugin) {
    console.error(`[quantum-jury] Unknown mode '${options.mode}'. Available: ${Object.keys(PLUGINS).join(", ")}`);
    process.exit(1);
  }

  const payload = await loadPayload(options.payloadPath);

  const child = spawn("python3", [plugin], {
    cwd: MODULE_DIR,
    stdio: ["pipe", "pipe", "pipe"],
  });

  const outs = [];
  const errs = [];
  child.stdout.on("data", (chunk) => outs.push(chunk));
  child.stderr.on("data", (chunk) => errs.push(chunk));

  child.stdin.write(JSON.stringify(payload));
  child.stdin.end();

  child.on("close", (code) => {
    if (errs.length) {
      process.stderr.write(Buffer.concat(errs));
    }
    if (outs.length) {
      process.stdout.write(Buffer.concat(outs));
    }
    if (code !== 0) {
      process.exit(code ?? 1);
    }
  });
}

main().catch((error) => {
  console.error(`[quantum-jury] ${error.message}`);
  process.exit(1);
});
