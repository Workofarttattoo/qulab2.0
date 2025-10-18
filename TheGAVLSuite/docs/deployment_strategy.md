# Deployment & Source Protection Strategy

## Goals
- Host the GAVL Command Hub at `thegavl.com` with module-specific subdomains.
- Provide desktop builds (Electron) for operators who need offline access.
- Protect proprietary algorithms from casual copying.
- Enforce licensing/billing gates per module.

## Architecture Overview
1. **Command Hub (Next.js)**
   - Hosted via Vercel or containerised on our cloud.
   - Routes to individual module GUIs (`/modules/*`).
   - Auth layer (JWT + API gateway) controls access per customer.

2. **Module Services**
   - OSINT, HELLFIRE, Corporate Legal, CEIO, Bayesian Sophiarch exposed as internal APIs (FastAPI / Node workers) behind service mesh.
   - Boardroom of Light and Ritual Engine continue to run as separate apps but are proxied through the hub for unified SSO.

3. **Desktop Shell**
   - Wrap the Command Hub with Electron to ship a signed binary for secure environments. Modules that require local access (e.g., CEIO agent) communicate with the hub via IPC.

## Source Protection Techniques
- **Frontend:** build with Next.js `output: standalone`, minify, and serve static assets from private bucket. Enable subresource integrity.
- **Backend/services:** ship Docker images or compiled binaries rather than raw scripts. Only open-source or client-specific hooks remain readable.
- **License enforcement:** Jiminy Cricket checks extended to verify license token before meta-agents run. Expired tokens => no module execution.
- **Secrets:** use Vault/Secrets Manager for API keys (Street View, data providers). Never ship them in client bundles.

## Subdomain Map
- `osint.thegavl.com` → OSINT API + GUI route `/modules/osint`
- `hellfire.thegavl.com` → Recon worker + GUI `/modules/hellfire`
- `legal.thegavl.com` → Corporate legal suite
- `ceio.thegavl.com` → Enhancement office console
- `oracle.thegavl.com` → Bayesian Sophiarch portal
- `ritual.thegavl.com` → Agentic Ritual Engine (CLI docs + API)
- `boardroom.thegavl.com` → Boardroom of Light
- `chrono.thegavl.com` → Chrono Walker (once live)

## Next Steps
1. Integrate NextAuth or custom SSO provider into Command Hub.
2. Containerise module APIs; deploy behind API gateway with rate limiting.
3. Add feature flags so the hub only exposes modules licensed for the tenant.
4. Implement build pipeline: `pnpm turbo build` → upload assets → sign Electron bundle → publish to download portal.
5. Store module output (reports, screenshots) in encrypted object storage keyed per customer.
