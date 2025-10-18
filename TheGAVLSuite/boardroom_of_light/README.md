# Boardroom of Light

Boardroom of Light is an interactive simulation that assembles a panel of seven-hat advisors and watches them deliberate on guidance, risk, and activation codes. The module powers the KRONKETA “boardroom assembly” ritual and now ships with an optional Jimminy Cricket conscience companion plus quantum jury helpers for evidentiary reviews.

## Features

- **Seven-Hat personas** – virtuous versus authentic personas carry inner affirmations or shadow whispers that influence resonance.
- **Phase analysis** – illumination, refraction, and coherence rounds expose tension between fact and fabrication.
- **Quantum bridges** – invoke `qiskit_consensus.py` or the new quantum jury plugins for probabilistic consensus metrics.
- **Jimminy Cricket companion** – live websocket server + wireframe avatar whispering conscience scores and watchlists.
- **Multiverse comparisons** – pit light and authentic rooms side-by-side and contrast resonance deltas.

## Project Layout

```
boardroom_of_light/
  modules/
    noigela-module/          # @gavl/noigela advisor package
  src/
    boardroom-personas.js      # seven-hat persona definitions + roster builders
    boardroom-simulator.js     # core simulation engine
    boardroom-multiverse.js    # comparative analysis utilities
    jimminy-cricket-server.mjs # websocket/REST companion service
    quantum-jury-cli.js        # helpers to invoke quantum jury plugins
    boardroom_plugins/
      qiskit_consensus.py      # classic consensus bridge
      quantum_jury_ibm.py      # IBM Quantum runtime multi-juror evaluator
      quantum_jury_local.py    # Aer-powered juror narrative simulator
  tests/
    jimminy-smoke.mjs          # boots the companion server and validates APIs
  web/
    public/                    # legacy control panel
    jimminy-cricket/           # three.js companion UI
    dashboard/                 # experimental React governance dashboard
```

## Setup

Install dependencies (uses the included No'iGeL(a) module):

```bash
cd boardroom_of_light
npm install
```

Optional: install Python 3 with Qiskit / Qiskit Aer for local quantum helpers or Qiskit Runtime access for IBM Quantum runs.

## REST API (Powering the Dashboard)

The bundled Express server (`npm run gui`) exposes live governance endpoints that the React dashboard consumes:

| Method & Path | Description |
| --- | --- |
| `GET /api/corporations` | List seeded corporations |
| `POST /api/corporations` | Create a new corporation |
| `GET /api/corporations/:id` | Fetch corporation record |
| `GET /api/corporations/:id/dashboard` | Aggregate onboarding, research, compliance, lock data |
| `PATCH /api/corporations/:id/onboarding` | Update onboarding checklist |
| `POST/GET /api/corporations/:id/research` | Generate or fetch research sets |
| `GET /api/corporations/:id/research/export` | Download CSV of current top-ten ideas |
| `POST/DELETE /api/corporations/:id/lock` | Create or destroy a business lock |
| `GET /api/corporations/:id/compliance` | Retrieve compliance nudges, bottlenecks, logs |
| `POST /api/corporations/:id/compliance` | Append a compliance proof log |
| `GET /api/corporations/:id/memories` | List uploaded artifacts |
| `POST /api/corporations/:id/memories` | Upload an artifact (base64 payload) |

Each mutating call automatically triggers a conscience refresh so Jimminy can whisper updated guidance.

## Usage

Run a single boardroom session:

```bash
npm run simulate
```

Compare light vs authentic boardrooms:

```bash
npm run multiverse -- --seats 9 --rounds 4 --quantum
```

Results are printed as structured JSON for downstream visualisers or conscience helpers.

Start the Jimminy Cricket live companion (REST + WebSocket + 3D UI):

```bash
npm run conscience
# visit http://localhost:4180 (configurable via JIMMINY_HOST/JIMMINY_PORT)
```

Feed live telemetry into the companion:

```bash
curl -X POST http://localhost:4180/ingest \
  -H "content-type: application/json" \
  -d '{"lightResult": {...}, "authenticResult": {...}}'
```

Run the smoke suite (skips automatically when sockets are blocked by the sandbox):

```bash
npm run test:smoke
```

Invoke quantum jury helpers:

```bash
# IBM Quantum Runtime (requires token via --payload or IBM_QUANTUM_TOKEN)
node src/quantum-jury-cli.js --mode ibm --payload jury-strategies.json

# Local Aer simulator
node src/quantum-jury-cli.js --mode local --payload evidence.json
```

The CLI prints JSON distributions and modal verdict data to stdout.

Spin up the experimental governance dashboard:

```bash
cd web/dashboard
npm install
npm run dev
# talks to http://localhost:5050 APIs
```

## Integration Notes

- Jimminy Cricket integration can be embedded in dashboards by subscribing to `ws://host/jimminy` and polling `/api/latest`.
- Quantum jury plugins are decoupled Python tools; wire them into legal or compliance workflows as evidence arbiters.
- When deploying independently from Legion, keep the `modules/noigela-module` tree in sync or publish it to a registry.
