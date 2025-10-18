# Module Production Roadmaps

This document captures what is implemented today, the missing pieces needed for production readiness, and suggested work packages for each module. Treat it as the master backlog when spinning up engineering teams.

---
## 1. Command Hub (Next.js)
**Current:** Multi-launcher UI, module console scaffolds, Python runner integration via API routes.

**Outstanding:**
- Authentication & SSO (NextAuth, OAuth, or custom JWT) with per-tenant entitlements.
- Billing hooks (Stripe/Braintree) to enforce per-search/per-module pricing.
- Background job queue for long-running meta-agent tasks; push status updates via WebSockets.
- Logging/monitoring (OpenTelemetry, Datadog) for API routes and Python subprocesses.
- Error surfaces + retries when Python runners crash or hang.
- Deployment pipeline (Vercel/containers) and hardened headers/CSP.

**Suggested work packages:**
1. Auth & billing integration sprint (SSO, account management, rate limiting).
2. Job orchestration + status updates (Redis queue, Socket.io).
3. Observability + security hardening (metrics, audit logs, CSP).
4. Packaging into Electron for offline operators.

---
## 2. OSINT Lattice
**Current:** Discovery, identity, AJAX spider, social graph tasks with report export; GUI triggers pipeline.

**Outstanding:**
- Real connectors for breaches, social APIs, corporate registries, and skip-trace services.
- Rate limiting, captcha handling, TOR/proxy rotation.
- SSN and sensitive data access flow, licensing verification.
- Workbook export (Excel/CSV) + evidence viewer in hub.
- Persistence layer (PostgreSQL) to track histories and reruns.
- Automated de-duplication, confidence scoring, case notes.

**Work packages:**
1. Data source integration (HaveIBeenPwned, LinkedIn, PeopleDataLabs, etc.).
2. Compliance engine (Jiminy policies, licensing, audit logging).
3. Evidence store + GUI viewer + CSV/XLSX export.
4. Advanced analytics (relationship graphs, ML entity resolution).

---
## 3. HELLFIRE Recon
**Current:** Network/physical recon tasks, Street View capture scaffold, training pack output, GUI console.

**Outstanding:**
- Real security tool integration (nmap, masscan, metasploit) via dedicated workers or containers.
- Physical recon automation (OpenStreetMap queries, door/window detection using CV).
- Street View annotation, map overlays, video walkthroughs.
- Client engagement workflow (contracts, scope of work, liability waivers).
- Secure storage for recon artifacts; encryption at rest.
- Reporting templates (PDF/HTML) with mitigation guidance.

**Work packages:**
1. Offensive tool pipeline (Dockerised scanners, result parsers).
2. Physical recon automation + CV overlays.
3. Engagement management (docs, approvals, compliance logs).
4. Final report generator + training content delivery platform.

---
## 4. Corporate Legal Brigade
**Current:** Intake, research placeholder, drafting placeholder, filing stub; GUI + API integration + JSON reporting.

**Outstanding:**
- Legal research connectors (Fastcase, LexisNexis, government statutes).
- Draft generation using LLM + template engine (Docx/PDF). 
- E-filing portal integration (state/federal) with credential storage.
- Conflict checks / matter management database.
- Opinion letter and checklist library; version control for briefs.
- Attorney credential management, jurisdiction gating.

**Work packages:**
1. Knowledge integration + search service (vector DB, legal APIs).
2. Drafting engine (prompt templates, human review workflow, Docx export).
3. Matter management system (Postgres + GraphQL, conflict logging, docket tracking).
4. E-filing automation + secure credential vault.

---
## 5. Chief Enhancements & Improvements Office (CEIO)
**Current:** Telemetry audit, optimisation proposals, ticket triage, external escalation; GUI + API.

**Outstanding:**
- Ingestion of real telemetry (metrics/logs) from product deployments.
- Integration with ticket systems (Zendesk/Jira) and release pipelines (GitHub, CI/CD).
- Auto-patching / hotfix deployment approvals.
- Learning system for prioritising improvements (feedback loop with CEIO knowledge base).
- Role-based alerts/escalations to human owners.

**Work packages:**
1. Telemetry ingestion (OpenTelemetry collector, metrics store).
2. Ticketing + release integration (Zendesk/Jira APIs, Git hooks).
3. Recommendation engine (ML ranking, reinforcement learning for improvement impact).
4. Workflow automation (approvals, change management, audit logs).

---
## 6. Bayesian Sophiarch
**Current:** Layered forecasting scaffold, CLI/API integration, GUI showing outputs.

**Outstanding:**
- Real dataset ingestion pipelines (market feeds, internal KPIs, regulatory trackers).
- Probabilistic model implementation (PyMC3/Stan/HMM/RNN) with calibration.
- Bayesian updating, scenario generation, Monte Carlo simulations.
- Visualization dashboards (probability cones, sensitivity analysis, waterfall charts).
- Feedback loop to Chrono Walker and Boardroom modules.

**Work packages:**
1. Data pipeline (ETL, feature store, data validation).
2. Modeling core (Bayesian networks, HMMs, reinforcement learning for decisions).
3. Visualization & reporting (interactive charts, PDF briefs).
4. Continuous learning (model monitoring, drift detection, re-training pipeline).

---
## 7. Boardroom of Light
**Current:** Streamlit app + GUI launcher; personas and multiverse simulator.

**Outstanding:**
- Migrate Streamlit features into Next.js for a single UI experience.
- Persist conversations/ledger entries to database; provide playback/export.
- Add configurable personas, real-time editing, persona library.
- Integrate with Bayesian Sophiarch outputs for predictive deliberations.
- Multi-user session support, presence indicators, votes.

**Work packages:**
1. React/Next migration of Streamlit features.
2. Persistence + collaboration (WebSockets, database, session management).
3. Persona builder + library management.
4. Integration with forecasting / OSINT insights (dashboard overlays).

---
## 8. Agentic Ritual Engine
**Current:** CLI, FastAPI, flipbook builder, boardroom integration, data pipelines.

**Outstanding:**
- Dockerized deployment, Kubernetes helm charts.
- Additional ingestion pipelines (crypto telemetry, satellite data, etc.).
- Automated testing (pytest, integration tests) and CI/CD.
- API auth, rate limiting, and audit logging.
- Expand flipbook to interactive dashboard (Next.js or Grafana plugin).

**Work packages:**
1. Containerization + CI/CD pipeline.
2. Ingestion & processing enhancements (task queue, streaming pipeline).
3. Testing suite & QA automation.
4. API management (auth, metrics, docs, SDKs).

---
## 9. Chrono Walker
**Current:** Project placeholder.

**Outstanding:**
- Design timeline data model; define event ingestion APIs.
- Temporal analytics (causality, forecasting alignment, anomaly detection).
- GUI timeline visualisation integrated into Command Hub.
- Sync/merge with Sophiarch forecasts and Boardroom ledgers.

**Work packages:**
1. Data model + ingestion services.
2. Analytics engine (causality graphs, timeline clustering).
3. UI/visualisation (Next.js timeline, filters, search).
4. Integration tasks with other modules.

---
## 10. Security, Licensing, Compliance (Cross-cutting)
- Centralize Jiminy Cricket policies, per-module licensing checks, and audit logs.
- Encryption strategy for stored artifacts and reports.
- Secrets management (Vault, AWS Secrets Manager) for API keys and credentials.
- Pen test / vulnerability scan pipeline; compliance (SOC2/GDPR) requirements.

**Work packages:**
1. Unified policy engine (licensing + Jiminy).
2. Secret management & rotation plan.
3. Security testing + compliance documentation.
4. Audit/reporting dashboards for administrators.

---
## Summary of Remaining Major Effort
| Area | Status | Key Missing Deliverables |
|------|--------|---------------------------|
| Command Hub | Prototype | Auth, billing, job orchestration, deployment hardening |
| OSINT | Prototype agents | Real data connectors, compliance, storage, analytics |
| HELLFIRE | Prototype agents | Real tooling, CV overlays, engagement workflow |
| Corporate Legal | Prototype agents | Legal research, drafting engine, matter management |
| CEIO | Prototype agents | Telemetry ingestion, ticket/release integration, recommendation engine |
| Bayesian Sophiarch | Prototype agents | Real modeling, dataset pipeline, visual analytics |
| Boardroom | MVP (Streamlit) | Migration to Next UI, persistence, collaboration |
| Ritual Engine | MVP | Containerization, auth, additional pipelines |
| Chrono Walker | Placeholder | Full design/implementation |

Use this roadmap to brief engineering teams, scope sprints, and track the remaining journey to true production readiness.
