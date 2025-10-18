# Boardroom Dashboard (Experimental)

A sandbox React interface for the Boardroom of Light that demonstrates how a governance console, research pipeline, and compliance loops could hang together. It relies on a mocked in-memory API (`src/api.js`) so the UI can run without any backend dependencies.

## Quick start

```bash
cd boardroom_of_light/web/dashboard
npm install
npm run dev
```

Open the printed URL (defaults to http://localhost:5173) to explore the dashboard. Data is intentionally ephemeral and resets on refresh.

## Integration notes

- Replace `src/api.js` with real fetchers that talk to the Boardroom of Light Express server or future orchestration services.
- Components are split by concern (`src/components/*`) so individual panels can be embedded elsewhere.
- The dashboard pairs nicely with the Jimminy Cricket companion—subscribe to `/api/latest` for conscience cues and surface them in the UI when wiring a real backend.
