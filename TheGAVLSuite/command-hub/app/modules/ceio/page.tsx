"use client";

import { useState } from "react";

export default function CeioModule() {
  const [product, setProduct] = useState("GAVL Console");
  const [improvements, setImprovements] = useState<string[]>([]);
  const [tickets, setTickets] = useState<string[]>([]);
  const [logs, setLogs] = useState<string[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const runAudit = async () => {
    if (isRunning) return;
    setIsRunning(true);
    try {
      const response = await fetch("/api/ceio", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ product }),
      });
      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.message || "CEIO dispatcher failed");
      }

      setImprovements(payload.improvements ?? []);
      setTickets(payload.tickets ?? []);
      const logEntries: string[] = Array.isArray(payload.logs) ? payload.logs : [];
      setLogs(logEntries.reverse());
    } catch (error: any) {
      setLogs((prev) => [`Error: ${error.message}`, ...prev]);
    } finally {
      setIsRunning(false);
    }
  };

  const resolveTickets = () => {
    setTickets((prev) => [
      `[${new Date().toLocaleTimeString()}] Manual override applied to ticket backlog.`,
      ...prev,
    ]);
  };

  return (
    <div className="min-h-screen bg-[#041610] text-cyan-100">
      <div className="max-w-5xl mx-auto px-6 sm:px-10 py-10 space-y-10">
        <header className="space-y-3">
          <p className="text-xs uppercase tracking-[0.3em] text-cyan-300">Module</p>
          <h1 className="text-3xl font-semibold tracking-tight">Chief Enhancements Office</h1>
          <p className="text-sm text-cyan-200/70">
            Continuous improvement loop for every GAVL deployment. The CEIO meta-agent audits telemetry, drafts optimisation
            plans, processes help tickets, and escalates research when internal improvements plateau.
          </p>
        </header>

        <section className="grid gap-6 md:grid-cols-[1.1fr_1fr]">
          <div className="rounded-3xl border border-cyan-500/20 bg-cyan-500/5 p-6 space-y-4">
            <h2 className="text-lg font-semibold">Target Product</h2>
            <input
              className="w-full rounded-xl bg-black/40 border border-cyan-500/30 px-3 py-2 text-sm focus:border-cyan-400 focus:outline-none"
              value={product}
              onChange={(e) => setProduct(e.target.value)}
            />
            <button
              onClick={runAudit}
              disabled={isRunning}
              className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-cyan-500 to-sky-500 px-4 py-2 text-sm font-semibold shadow-[0_0_25px_rgba(47,255,232,0.35)] disabled:opacity-40"
            >
              {isRunning ? "Running..." : "Run optimisation sweep"}
            </button>
            <button
              onClick={resolveTickets}
              className="inline-flex items-center justify-center rounded-full bg-white/10 px-4 py-2 text-sm font-semibold border border-white/20"
            >
              Auto-resolve tickets
            </button>
            <p className="text-xs text-cyan-200/70">Knowledge base: reports/enhancements/{product.replace(/\s+/g, "_")}</p>
          </div>

          <div className="rounded-3xl border border-cyan-500/20 bg-black/40 p-6 space-y-4">
            <h2 className="text-lg font-semibold text-cyan-100">Helpdesk Panel</h2>
            <div className="bg-black/60 border border-cyan-500/20 rounded-2xl p-4 text-xs text-cyan-200/80 min-h-[140px]">
              {tickets.length === 0 ? <p className="text-cyan-300/60">No tickets processed yet.</p> : tickets.map((ticket, idx) => <p key={idx}>{ticket}</p>)}
            </div>
          </div>
        </section>

        <section className="rounded-3xl border border-cyan-500/20 bg-black/40 p-6 space-y-4">
          <div>
            <h2 className="text-lg font-semibold text-cyan-100">Improvement Backlog</h2>
            <div className="bg-black/60 border border-cyan-500/20 rounded-2xl p-4 text-xs h-40 overflow-y-auto space-y-2">
              {improvements.length === 0 ? <p className="text-cyan-300/60">Awaiting audits…</p> : improvements.map((item, idx) => <p key={idx}>{item}</p>)}
            </div>
          </div>
          <div>
            <h2 className="text-lg font-semibold text-cyan-100">Agent Log</h2>
            <div className="bg-black/60 border border-cyan-500/20 rounded-2xl p-4 text-xs h-32 overflow-y-auto space-y-2">
              {logs.length === 0 ? <p className="text-cyan-300/60">No events yet.</p> : logs.map((entry, idx) => <p key={idx}>{entry}</p>)}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
