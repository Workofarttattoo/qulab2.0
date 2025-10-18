# OSINT Meta-Agent (Open-Source Intelligence)

**Purpose:** provide the most comprehensive open-source intelligence dossier for a named subject. The meta-agent spawns specialised sub-agents to harvest PII, social graphs, breach data, and public filings, assembling a continuously-updated workbook.

## Features
- Meta-agent lattice that spawns discovery, identity resolution, AJAX email/data spidering, social mapping, and reporting sub-agents.
- Spreadsheet/JSON export (see `reports/osint/`), suitable for licensed analysts.
- Hooks for licensed-only data (SSN, skip-trace) delegated via Jiminy Cricket compliance checks.
- Subscription model (default $5 USD per subject search) configurable via suite launcher.

## Compliance Notes
- Enforce licensing checks before enabling high-risk endpoints (SSN, credit, DMV).
- Honor privacy laws (GDPR, CPRA) by logging consent or legal basis in the report metadata.
- Provide opt-out mechanisms and data-retention policies.
- AJAX spidering must respect robots policies, rate limits, and terms-of-service; record justification for any intrusive crawl.

## Running a lattice
```python
from pathlib import Path
from modules.osint.meta_agent import OsintMetaAgent

agent = OsintMetaAgent(output_dir=Path("reports/osint"))
ctx = agent.run("Alexandra Example", scope="full", spider=True)
print(ctx.evidence["report_path"])
```

Integrate with the GAVL launcher to enforce billing, authentication, and per-search limits.
