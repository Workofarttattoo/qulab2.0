# GAVL Modules Overview

Each module follows the same lattice pattern:
- A **meta-agent** orchestrator responsible for decomposing incoming objectives.
- A swarm of **sub-agents** (taskers) that execute domain-specific actions.
- A shared telemetry bus (`reports/`, `logs/`) for progress tracking.
- Compliance hooks (licensing, auditing) gated through Jiminy Cricket checks.

Modules implemented:
- `osint/`
- `hellfire_recon/`
- `corporate_legal_team/`
- `chief_enhancements_office/`
- `bayesian_sophiarch/`

Each module ships with:
- `meta_agent.py` – orchestrator scaffold.
- `tasks/` – placeholder task implementations.
- `README.md` – operating doctrine & compliance notes.
