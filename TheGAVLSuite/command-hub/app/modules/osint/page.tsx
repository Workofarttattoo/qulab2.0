"use client";

import { useState } from "react";

export default function OsintModule() {
  const [subject, setSubject] = useState("");
  const [status, setStatus] = useState("Idle");
  const [logs, setLogs] = useState<string[]>([]);

  const handleLaunch = () => {
    if (!subject.trim()) {
      setLogs((prev) => ["Please enter a subject name.", ...prev]);
      return;
    }
    setStatus("Running lattice...");
    setLogs((prev) => [
      `[${new Date().toLocaleTimeString()}] Queued discovery, identity, AJAX spider, social graph, reporting tasks for ${subject}.`,
      ...prev,
    ]);
    // Placeholder: integrate API call to OSINT meta-agent
    setTimeout(() => setStatus("Report ready"), 1500);
  };

  return (
    <div className="min-h-screen bg-[#06071A] text-slate-100">
      <div className="max-w-4xl mx-auto px-6 sm:px-10 py-10 space-y-10">
        <header className="space-y-3">
          <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Module</p>
          <h1 className="text-3xl font-semibold tracking-tight">OSINT Lattice Console</h1>
          <p className="text-sm text-slate-300">
            Configure a subject search and trigger the meta-agent lattice. The orchestrator will dispatch AJAX-enabled spiders,
            identity resolution, and social graphing tasks, feeding the final dossier to the GAVL data bus.
          </p>
        </header>

        <section className="grid gap-6 sm:grid-cols-[1.4fr_1fr]">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6 space-y-4">
            <h2 className="text-lg font-semibold">Launch Sweep</h2>
            <label className="grid gap-1 text-sm text-slate-300">
              Subject name or alias
              <input
                className="rounded-xl bg-black/30 border border-white/10 px-3 py-2 text-sm focus:border-purple-400 focus:outline-none"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="e.g. Alexandra Example"
              />
            </label>
            <label className="grid gap-1 text-sm text-slate-300">
              Options
              <textarea
                className="rounded-xl bg-black/30 border border-white/10 px-3 py-2 text-sm min-h-[120px] focus:border-purple-400 focus:outline-none"
                placeholder="JSON config (license tier, SSN access, coordinate hints, etc.)"
              />
            </label>
            <button
              onClick={handleLaunch}
              className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-purple-500 to-blue-500 px-4 py-2 text-sm font-semibold shadow-[0_0_25px_rgba(94,109,255,0.35)]"
            >
              Launch lattice
            </button>
            <p className="text-xs text-slate-400">Status: {status}</p>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-6 space-y-3">
            <h2 className="text-lg font-semibold">Latest Artifact</h2>
            <div className="bg-black/40 border border-white/10 rounded-2xl p-4 text-xs text-slate-300 min-h-[140px]">
              <p>Reports will be written to <code className="bg-white/10 px-1 rounded">reports/osint/</code>.</p>
              <p>Integrate the meta-agent API to surface live dossier previews here.</p>
            </div>
            <a
              href="/"
              className="inline-flex items-center gap-2 text-xs text-purple-200 hover:underline"
            >
              Open reports directory →
            </a>
          </div>
        </section>

        <section className="rounded-3xl border border-white/10 bg-white/5 p-6">
          <h2 className="text-lg font-semibold mb-3">Lattice Log</h2>
          <div className="bg-black/40 border border-white/10 rounded-2xl p-4 text-xs h-60 overflow-y-auto space-y-2">
            {logs.length === 0 ? <p className="text-slate-500">Awaiting events…</p> : logs.map((log, idx) => <p key={idx}>{log}</p>)}
          </div>
        </section>
      </div>
    </div>
  );
}
