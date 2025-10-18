"use client";

import { useState } from "react";

const defaultHorizons = ["30d", "90d", "180d"];

export default function SophiarchModule() {
  const [problem, setProblem] = useState("Launch strategy");
  const [horizons, setHorizons] = useState(defaultHorizons.join(", "));
  const [results, setResults] = useState<string[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [outcomes, setOutcomes] = useState<any[]>([]);

  const runForecast = async () => {
    if (isRunning) return;
    setIsRunning(true);
    const horizonList = horizons.split(",").map((h) => h.trim()).filter(Boolean);
    try {
      const response = await fetch("/api/sophiarch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ problem, horizons: horizonList }),
      });
      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.message || "Sophiarch dispatcher failed");
      }

      setOutcomes(payload.outcomes ?? []);
      const logEntries: string[] = Array.isArray(payload.logs) ? payload.logs : [];
      setResults(logEntries.reverse());
    } catch (error: any) {
      setResults([`Error: ${error.message}`]);
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0C0718] text-amber-100">
      <div className="max-w-5xl mx-auto px-6 sm:px-10 py-10 space-y-10">
        <header className="space-y-3">
          <p className="text-xs uppercase tracking-[0.3em] text-amber-400">Module</p>
          <h1 className="text-3xl font-semibold tracking-tight">Bayesian Sophiarch</h1>
          <p className="text-sm text-amber-200/70">
            Layer multiple probabilistic models to converge on the most likely outcomes. Integrates Chrono Walker timelines
            and Boardroom decision support.
          </p>
        </header>

        <section className="rounded-3xl border border-amber-500/20 bg-amber-500/5 p-6 space-y-4">
          <h2 className="text-lg font-semibold">Forecast Configuration</h2>
          <label className="grid gap-1 text-sm text-amber-100/80">
            Problem statement
            <input
              className="rounded-xl bg-black/40 border border-amber-500/30 px-3 py-2 text-sm focus:border-amber-400 focus:outline-none"
              value={problem}
              onChange={(e) => setProblem(e.target.value)}
            />
          </label>
          <label className="grid gap-1 text-sm text-amber-100/80">
            Horizons (comma separated)
            <input
              className="rounded-xl bg-black/40 border border-amber-500/30 px-3 py-2 text-sm focus:border-amber-400 focus:outline-none"
              value={horizons}
              onChange={(e) => setHorizons(e.target.value)}
            />
          </label>
          <button
            onClick={runForecast}
            disabled={isRunning}
            className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-amber-500 to-pink-500 px-4 py-2 text-sm font-semibold shadow-[0_0_25px_rgba(255,149,0,0.35)] disabled:opacity-40"
          >
            {isRunning ? "Running..." : "Run forecast"}
          </button>
        </section>

        <section className="rounded-3xl border border-amber-500/20 bg-black/40 p-6 space-y-4">
          <div>
            <h2 className="text-lg font-semibold text-amber-100">Oracle Output</h2>
            <div className="bg-black/60 border border-amber-500/20 rounded-2xl p-4 text-xs h-36 overflow-y-auto space-y-2">
              {results.length === 0 ? <p className="text-amber-300/60">Awaiting forecasts…</p> : results.map((item, idx) => <p key={idx}>{item}</p>)}
            </div>
          </div>
          <div>
            <h2 className="text-lg font-semibold text-amber-100">Probability Layers</h2>
            <div className="bg-black/60 border border-amber-500/20 rounded-2xl p-4 text-xs h-28 overflow-y-auto space-y-2">
              {outcomes.length === 0 ? (
                <p className="text-amber-300/60">No outcomes yet.</p>
              ) : (
                outcomes.map((outcome, idx) => (
                  <div key={idx}>
                    <p className="font-semibold text-amber-200">{outcome.horizon || outcome.report_path || `Layer ${idx + 1}`}</p>
                    {outcome.probabilities && (
                      <p className="text-amber-300">
                        {Object.entries(outcome.probabilities)
                          .map(([k, v]) => `${k}: ${(Number(v) * 100).toFixed(1)}%`)
                          .join(" · ")}
                      </p>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
          <p className="text-xs text-amber-200/70">Final synthesis written to reports/sophiarch/&lt;problem&gt;_forecast.json.</p>
        </section>
      </div>
    </div>
  );
}
