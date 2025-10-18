"use client";

import { useState } from "react";

export default function HellfireModule() {
  const [client, setClient] = useState("");
  const [address, setAddress] = useState("");
  const [notes, setNotes] = useState<string[]>([]);

  const scheduleRecon = () => {
    if (!client.trim()) {
      setNotes((prev) => ["Enter a client codename first.", ...prev]);
      return;
    }
    setNotes((prev) => [
      `[${new Date().toLocaleTimeString()}] Scheduled recon for ${client}. Street View capture queued (${address || "no address"}).`,
      ...prev,
    ]);
  };

  return (
    <div className="min-h-screen bg-[#110606] text-rose-100">
      <div className="max-w-5xl mx-auto px-6 sm:px-10 py-10 space-y-10">
        <header className="space-y-3">
          <p className="text-xs uppercase tracking-[0.3em] text-rose-400">Module</p>
          <h1 className="text-3xl font-semibold tracking-tight">HELLFIRE Recon Command</h1>
          <p className="text-sm text-rose-200/70">
            Launch combined network and physical penetration assessments. Integrates automated Street View capture, entry
            vector mapping, and tailored training packs for operators.
          </p>
        </header>

        <section className="grid gap-6 md:grid-cols-[1.2fr_1fr]">
          <div className="rounded-3xl border border-rose-500/20 bg-rose-500/5 p-6 space-y-4">
            <h2 className="text-lg font-semibold">Engagement Brief</h2>
            <label className="grid gap-1 text-sm text-rose-100/80">
              Client codename
              <input
                className="rounded-xl bg-black/40 border border-rose-500/30 px-3 py-2 text-sm focus:border-rose-400 focus:outline-none"
                placeholder="Fortress Dynamics"
                value={client}
                onChange={(e) => setClient(e.target.value)}
              />
            </label>
            <label className="grid gap-1 text-sm text-rose-100/80">
              Primary address or coordinates (optional)
              <input
                className="rounded-xl bg-black/40 border border-rose-500/30 px-3 py-2 text-sm focus:border-rose-400 focus:outline-none"
                placeholder="1234 Example Ave, Gotham"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
            </label>
            <button
              onClick={scheduleRecon}
              className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-rose-500 to-orange-500 px-4 py-2 text-sm font-semibold shadow-[0_0_25px_rgba(255,99,132,0.35)]"
            >
              Schedule recon
            </button>
            <p className="text-xs text-rose-200/70">
              Street View API key required for live imagery. Pending screenshots will appear in the evidence gallery below.
            </p>
          </div>

          <div className="rounded-3xl border border-rose-500/20 bg-black/40 p-6 space-y-4">
            <h2 className="text-lg font-semibold text-rose-100">Latest Evidence</h2>
            <div className="bg-black/60 border border-rose-500/20 rounded-2xl p-4 text-xs text-rose-200/80 min-h-[140px]">
              <p>Street View shots and entry vector overlays will be attached once the run completes.</p>
              <p className="mt-3">Reports: <code>reports/hellfire/&lt;client&gt;_hellfire.json</code></p>
              <p className="mt-1">Screenshots: <code>reports/hellfire/screenshots/</code></p>
            </div>
          </div>
        </section>

        <section className="rounded-3xl border border-rose-500/20 bg-black/40 p-6">
          <h2 className="text-lg font-semibold text-rose-100">Operations Log</h2>
          <div className="bg-black/60 border border-rose-500/20 rounded-2xl p-4 text-xs h-60 overflow-y-auto space-y-2">
            {notes.length === 0 ? <p className="text-rose-300/60">Awaiting recon tasks…</p> : notes.map((note, idx) => <p key={idx}>{note}</p>)}
          </div>
        </section>
      </div>
    </div>
  );
}
