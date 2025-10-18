"use client";

import Link from "next/link";

export default function RitualModule() {
  return (
    <div className="min-h-screen bg-[#100611] text-rose-100">
      <div className="max-w-5xl mx-auto px-6 sm:px-10 py-10 space-y-10">
        <header className="space-y-3">
          <p className="text-xs uppercase tracking-[0.3em] text-rose-300">Module</p>
          <h1 className="text-3xl font-semibold tracking-tight">Agentic Ritual Engine</h1>
          <p className="text-sm text-rose-200/70">
            CLI-driven orchestration for Docker telemetry, sigil ingestion, and ritual context APIs. Use the quick commands
            below or switch to the Streamlit pulse map for visual telemetry.
          </p>
        </header>

        <section className="rounded-3xl border border-rose-500/20 bg-rose-500/5 p-6 space-y-4 text-xs">
          <h2 className="text-lg font-semibold">Common Commands</h2>
          <div className="grid gap-2 bg-black/30 border border-rose-500/20 rounded-2xl p-4 font-mono">
            <code>python -m agentic_ritual_engine.main kb-init</code>
            <code>python -m agentic_ritual_engine.main ingest-sources --from data/sources.yaml</code>
            <code>python -m agentic_ritual_engine.main pdf-to-images --source "Key of Solomon" --dpi 300</code>
            <code>python -m agentic_ritual_engine.main detect-sigils --source key-of-solomon --min-area 1200</code>
            <code>python -m agentic_ritual_engine.main make-flipbook --filter '{"tradition": "Solomonic"}'</code>
          </div>
        </section>

        <section className="rounded-3xl border border-rose-500/20 bg-black/40 p-6 space-y-3">
          <h2 className="text-lg font-semibold text-rose-100">Visual Telemetry</h2>
          <p className="text-xs text-rose-200/70">
            Launch Streamlit dashboard from Boardroom module or integrate here via iframe after migration.
          </p>
          <Link href="/modules/boardroom" className="inline-flex items-center gap-2 text-xs text-rose-200 hover:underline">
            Go to Pulse Map →
          </Link>
        </section>
      </div>
    </div>
  );
}
