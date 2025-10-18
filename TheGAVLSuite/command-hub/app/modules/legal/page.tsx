"use client";

import { useState } from "react";

export default function LegalModule() {
  const [matter, setMatter] = useState("");
  const [jurisdiction, setJurisdiction] = useState("");
  const [client, setClient] = useState("");
  const [activity, setActivity] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dossier, setDossier] = useState<any | null>(null);
  const [filings, setFilings] = useState<string[]>([]);

  const submitMatter = async () => {
    if (!matter.trim() || !jurisdiction.trim()) {
      setActivity((prev) => ["Matter and jurisdiction are required.", ...prev]);
      return;
    }
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/legal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ matter, jurisdiction, client }),
      });
      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.message || "Legal dispatcher failed");
      }

      setDossier(payload.dossier ?? null);
      setFilings(payload.filings ?? []);
      const logEntries: string[] = Array.isArray(payload.logs) ? payload.logs : [];
      setActivity((prev) => [...logEntries.reverse(), ...prev]);
    } catch (error: any) {
      setActivity((prev) => [`Error: ${error.message}`, ...prev]);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#070A16] text-emerald-100">
      <div className="max-w-5xl mx-auto px-6 sm:px-10 py-10 space-y-10">
        <header className="space-y-3">
          <p className="text-xs uppercase tracking-[0.3em] text-emerald-400">Module</p>
          <h1 className="text-3xl font-semibold tracking-tight">Corporate Legal Brigade</h1>
          <p className="text-sm text-emerald-200/70">
            Intake matters, trigger research, and monitor drafting/filing pipelines. Compliance gates (conflict checks, bar
            credentials) will be hooked into Jiminy Cricket before live deployment.
          </p>
        </header>

        <section className="grid gap-6 md:grid-cols-[1.1fr_1fr]">
          <div className="rounded-3xl border border-emerald-400/20 bg-emerald-500/5 p-6 space-y-4">
            <h2 className="text-lg font-semibold">New Matter</h2>
            <label className="grid gap-1 text-sm text-emerald-100/80">
              Matter description
              <input
                className="rounded-xl bg-black/40 border border-emerald-500/30 px-3 py-2 text-sm focus:border-emerald-400 focus:outline-none"
                placeholder="Data breach response"
                value={matter}
                onChange={(e) => setMatter(e.target.value)}
              />
            </label>
            <label className="grid gap-1 text-sm text-emerald-100/80">
              Jurisdiction
              <input
                className="rounded-xl bg-black/40 border border-emerald-500/30 px-3 py-2 text-sm focus:border-emerald-400 focus:outline-none"
                placeholder="California"
                value={jurisdiction}
                onChange={(e) => setJurisdiction(e.target.value)}
              />
            </label>
            <label className="grid gap-1 text-sm text-emerald-100/80">
              Client name (optional)
              <input
                className="rounded-xl bg-black/40 border border-emerald-500/30 px-3 py-2 text-sm focus:border-emerald-400 focus:outline-none"
                placeholder="Acme Corp"
                value={client}
                onChange={(e) => setClient(e.target.value)}
              />
            </label>
            <button
              onClick={submitMatter}
              className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-emerald-500 to-lime-500 px-4 py-2 text-sm font-semibold shadow-[0_0_25px_rgba(56,255,182,0.35)] disabled:opacity-40"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Processing..." : "Open matter"}
            </button>
          </div>

          <div className="rounded-3xl border border-emerald-400/20 bg-black/40 p-6 space-y-4">
            <h2 className="text-lg font-semibold text-emerald-100">Dossier Snapshot</h2>
            <div className="bg-black/60 border border-emerald-500/20 rounded-2xl p-4 text-xs text-emerald-200/80 min-h-[140px] space-y-2">
              <p className="font-semibold text-emerald-100">Client: {client || dossier?.client || "—"}</p>
              <p>Jurisdiction: {jurisdiction || dossier?.jurisdiction || "—"}</p>
              {dossier?.research ? (
                <div>
                  <p className="text-emerald-300">Research entries:</p>
                  <ul className="list-disc list-inside space-y-1">
                    {dossier.research.map((item: any, idx: number) => (
                      <li key={idx}>{JSON.stringify(item)}</li>
                    ))}
                  </ul>
                </div>
              ) : (
                <p className="text-emerald-300/60">Research pipeline idle.</p>
              )}
              {filings.length > 0 && (
                <div>
                  <p className="text-emerald-300">Draft filings:</p>
                  <ul className="list-disc list-inside space-y-1">
                    {filings.map((item, idx) => (
                      <li key={idx}>{item}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </section>

        <section className="rounded-3xl border border-emerald-400/20 bg-black/40 p-6">
          <h2 className="text-lg font-semibold text-emerald-100">Activity Log</h2>
          <div className="bg-black/60 border border-emerald-500/20 rounded-2xl p-4 text-xs h-60 overflow-y-auto space-y-2">
            {activity.length === 0 ? <p className="text-emerald-300/60">Awaiting matters…</p> : activity.map((item, idx) => <p key={idx}>{item}</p>)}
          </div>
        </section>
      </div>
    </div>
  );
}
