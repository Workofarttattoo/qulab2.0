import Link from "next/link";

const modules = [
  {
    name: "OSINT Lattice",
    description: "Deep open-source intelligence sweeps with AJAX spiders and identity resolution.",
    route: "/modules/osint",
    accent: "bg-gradient-to-br from-purple-500/30 to-blue-500/20",
  },
  {
    name: "HELLFIRE Recon",
    description: "Red-team entry simulations with Street View reconnaissance and training packs.",
    route: "/modules/hellfire",
    accent: "bg-gradient-to-br from-red-500/30 to-orange-500/20",
  },
  {
    name: "Corporate Legal Brigade",
    description: "Global legal research, drafting, and e-filing orchestrated by meta-agents.",
    route: "/modules/legal",
    accent: "bg-gradient-to-br from-emerald-500/30 to-lime-500/20",
  },
  {
    name: "Chief Enhancements Office",
    description: "Always-on optimisation and helpdesk automation for every deployment.",
    route: "/modules/ceio",
    accent: "bg-gradient-to-br from-cyan-500/30 to-sky-500/20",
  },
  {
    name: "Bayesian Sophiarch",
    description: "Layered probabilistic forecasts and future-state orchestration.",
    route: "/modules/sophiarch",
    accent: "bg-gradient-to-br from-amber-500/30 to-pink-500/20",
  },
  {
    name: "Boardroom of Light",
    description: "Executive personas, ledger visualisations, and multiverse comparisons.",
    route: "/modules/boardroom",
    accent: "bg-gradient-to-br from-indigo-500/30 to-fuchsia-500/20",
  },
  {
    name: "Agentic Ritual Engine",
    description: "Docker telemetry, sigil ingestion, and ritual context APIs.",
    route: "/modules/ritual",
    accent: "bg-gradient-to-br from-rose-500/30 to-purple-500/20",
  },
  {
    name: "Chrono Walker",
    description: "Temporal ledger tooling and future timeline audits (coming soon).",
    route: "/modules/chrono",
    accent: "bg-gradient-to-br from-slate-500/30 to-zinc-500/20",
  },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-[#040414] text-slate-100">
      <header className="px-6 sm:px-12 py-10 border-b border-white/10">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-slate-400">The GAVL Suite</p>
            <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight mt-2">Command Hub</h1>
            <p className="text-slate-400 mt-3 max-w-2xl">
              Launch any module, review its health, or jump into the dedicated GUI. Each tile opens a specialised
              workspace. Secure routing, billing, and authentication will be wired here for thegavl.com deployment.
            </p>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-sm text-slate-300 shadow-[0_0_35px_rgba(80,140,255,0.25)]">
            <p className="font-semibold text-slate-100">Status</p>
            <ul className="space-y-1 mt-2 text-xs">
              <li>▶ Agentic Ritual Engine (CLI/API)</li>
              <li>▶ Boardroom of Light GUI</li>
              <li>◻ OSINT lattice (ready for deployment)</li>
              <li>◻ HELLFIRE recon (Street View API key pending)</li>
            </ul>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 sm:px-12 py-12 grid gap-6 md:grid-cols-2">
        {modules.map((module) => (
          <Link key={module.name} href={module.route} className="group">
            <article
              className={`relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-6 transition-transform duration-200 hover:-translate-y-1 hover:border-white/20 ${module.accent}`}
            >
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-gradient-to-br from-white/10 to-transparent" />
              <div className="relative">
                <h2 className="text-xl font-semibold tracking-tight">{module.name}</h2>
                <p className="text-sm text-slate-300 mt-3 leading-relaxed">{module.description}</p>
                <div className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-slate-100/90">
                  Open module
                  <span aria-hidden className="transition-transform duration-200 group-hover:translate-x-1">→</span>
                </div>
              </div>
            </article>
          </Link>
        ))}
      </main>

      <footer className="px-6 sm:px-12 py-8 border-t border-white/10 text-xs text-slate-500">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>© {new Date().getFullYear()} The GAVL Cooperative</p>
          <p className="text-slate-500">Deploy-ready for thegavl.com | Encryption & licensing pipeline pending</p>
        </div>
      </footer>
    </div>
  );
}
