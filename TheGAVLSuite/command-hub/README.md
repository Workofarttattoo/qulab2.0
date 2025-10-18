# GAVL Command Hub

Next.js portal that launches every module in The GAVL Suite. The hub communicates with the Python meta-agents (OSINT, HELLFIRE, Corporate Legal, CEIO, Bayesian Sophiarch) via server routes, providing a full-stack experience out of the box.

## Dev Setup
```bash
cd TheGAVLSuite/command-hub
npm install
npm run dev
```

The development server runs on `http://localhost:3000`. The hub expects Python available on PATH and the suite modules in `../modules`.

## Available Routes
- `/` – dashboard listing all modules.
- `/modules/osint` – trigger OSINT lattice.
- `/modules/hellfire` – configure recon job (requires `GOOGLE_MAPS_API_KEY` for Street View screenshots).
- `/modules/legal` – submit legal matters; calls Python meta-agent.
- `/modules/ceio` – run continuous improvement sweeps.
- `/modules/sophiarch` – run probabilistic forecasts.
- `/modules/boardroom` – Streamlit launchpad for Boardroom of Light.
- `/modules/ritual` – ritual engine command cheatsheet.

## API Endpoints
| Route | Description |
|-------|-------------|
| `POST /api/legal` | Calls `modules/corporate_legal_team/runner.py` |
| `POST /api/ceio` | Calls `modules/chief_enhancements_office/runner.py` |
| `POST /api/sophiarch` | Calls `modules/bayesian_sophiarch/runner.py` |

Payloads are JSON; responses mirror the Python context objects. Extend as needed for auth/billing.

## Environment
- `GOOGLE_MAPS_API_KEY` – optional for Street View capture in HELLFIRE module.

## Production Notes
- See `../docs/deployment_strategy.md` for hosting and source-protection guidance.
- Integrate SSO/licensing before exposing externally.
- Containerise the Python meta-agents or proxy them via an internal API gateway for deployment.
