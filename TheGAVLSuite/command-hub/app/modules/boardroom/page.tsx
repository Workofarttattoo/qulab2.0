"use client";

export default function BoardroomModule() {
  return (
    <div className="min-h-screen bg-[#0B0915] text-fuchsia-100">
      <div className="max-w-5xl mx-auto px-6 sm:px-10 py-10 space-y-10">
        <header className="space-y-3">
          <p className="text-xs uppercase tracking-[0.3em] text-fuchsia-300">Module</p>
          <h1 className="text-3xl font-semibold tracking-tight">Boardroom of Light</h1>
          <p className="text-sm text-fuchsia-200/70">
            Launch the full Streamlit visualiser or use the quick controls below to trigger simulations from the hub.
          </p>
        </header>

        <section className="rounded-3xl border border-fuchsia-500/20 bg-fuchsia-500/5 p-6 space-y-4">
          <h2 className="text-lg font-semibold">Quick Actions</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            <a
              href="http://localhost:8501"
              className="rounded-2xl border border-fuchsia-500/30 bg-black/30 px-4 py-3 text-sm font-medium text-center hover:border-fuchsia-400/60 transition"
            >
              Open Streamlit GUI (ensure `python -m agentic_ritual_engine.main run-pulse-map` is active)
            </a>
            <a
              href="/"
              className="rounded-2xl border border-fuchsia-500/30 bg-black/30 px-4 py-3 text-sm font-medium text-center hover:border-fuchsia-400/60 transition"
            >
              View boardroom personas deck
            </a>
          </div>
        </section>

        <section className="rounded-3xl border border-fuchsia-500/20 bg-black/40 p-6 space-y-3">
          <h2 className="text-lg font-semibold text-fuchsia-100">Multiverse Snapshot</h2>
          <p className="text-xs text-fuchsia-200/70">
            Integrate the existing `/api/multiverse` endpoint to stream ledger outputs here. This panel will become the
            embedded boardroom visual once the Streamlit app is migrated into the Next.js portal.
          </p>
          <div className="bg-black/60 border border-fuchsia-500/20 rounded-2xl p-4 text-xs text-fuchsia-200/80 min-h-[140px]">
            <p>Light coherence: —</p>
            <p>Authentic coherence: —</p>
            <p>Delta: —</p>
          </div>
        </section>
      </div>
    </div>
  );
}
