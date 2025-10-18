# The GAVL Suite

The GAVL Suite consolidates all core ritual, analysis, and advisory modules into a single launch point for thegavl.com and its subdomains. Each component can run independently, but the suite provides a uniform structure for discovery, routing, conscience feedback, and quantum experiments.

## Quick Start

**Launch the interactive boot menu:**

```bash
./gavl.py
```

This opens the unified launcher with options to start any module or combination of modules. See [QUICKSTART.md](QUICKSTART.md) for a 30-second guide or [LAUNCHER_GUIDE.md](LAUNCHER_GUIDE.md) for complete documentation.

## Structure

```
TheGAVLSuite/
  agentic_ritual_engine/      # FastAPI + Typer orchestration for sigils & telemetry
  boardroom_of_light/         # Executive simulation GUI, Jimminy companion, quantum jury helpers
  chrono_walker/              # Timeline analysis tools (future integration)
  jiminy_cricket/             # Conscience helper library
  modules/
    osint/                    # Open-source intelligence meta-agent lattice
    hellfire_recon/           # Red-team / HELLFIRE recon meta-agent
    corporate_legal_team/     # Global legal brigade meta-agent
    chief_enhancements_office/# Chief Enhancements & Improvements officer
    bayesian_sophiarch/       # Oracle of Light probabilistic modeller
```

## Getting Started

### Unified Launcher (Recommended)

```bash
./gavl.py
```

Select from the interactive menu:
- **Core Services**: Boardroom of Light, Jiminy Cricket, Chrono Walker
- **Meta-Agents**: OSINT, HELLFIRE Recon, Corporate Legal, Chief Enhancements, Bayesian Sophiarch
- **Quick Actions**: Launch all core services, all meta-agents, or the full suite

### Manual Launch

1. **Boardroom of Light**
    ```bash
    cd TheGAVLSuite/boardroom_of_light
    npm install
    npm run gui
    # visit http://localhost:5050
    ```
   Optional extras:

    ```bash
    npm run conscience             # Jimminy Cricket live companion (REST + WS)
    npm run simulate -- --quantum  # Enable Qiskit bridge
    npm run jury -- --mode local   # Quantum jury helpers (local or IBM)
    cd web/dashboard && npm run dev  # Experimental governance UI (proxies to http://localhost:5050)
    ```

3. **Jiminy Cricket Library**
   ```bash
   cd TheGAVLSuite/jiminy_cricket
   pip install -e .
   ```

4. **Chrono Walker**
   ```bash
   cd TheGAVLSuite/chrono_walker
   python -m backend.server
   # API: http://localhost:8000
   ```

5. **Meta-Agent Modules**
   ```bash
   cd TheGAVLSuite/modules

   # Use the master runner
   python run_module.py --list
   python run_module.py osint --demo
   python run_module.py hellfire --demo

   # Or run individual modules
   cd osint && python runner.py --demo
   cd hellfire_recon && python runner.py --demo
   cd corporate_legal_team && python runner.py --demo
   cd chief_enhancements_office && python runner.py --demo
   cd bayesian_sophiarch && python runner.py --demo
   ```

## Status

✅ **COMPLETE**: Unified launcher with interactive boot menu (`gavl.py`)
✅ **COMPLETE**: All meta-agent modules (OSINT, HELLFIRE, Legal, CEIO, Sophiarch)
✅ **COMPLETE**: Master runner for meta-agents (`modules/run_module.py`)
✅ **COMPLETE**: Integration test suite (45+ tests)
✅ **COMPLETE**: Boardroom of Light with quantum jury
✅ **COMPLETE**: Jiminy Cricket conscience library
✅ **COMPLETE**: Chrono Walker timeline analysis

## Roadmap

- Create agentic ritual engine for sigil & telemetry orchestration
- Promote the quantum jury CLI + IBM Runtime bridge into legal / compliance flows
- Wire `LegionApp` (mobile experience) to fetch curated personas and conscience cues from the Jiminy service
- Add web dashboard for unified monitoring
- Create REST API gateway for external integrations

## Related Projects

- `../LegionApp` – mobile companion app for Venice.ai characters.
- `../control module pack` – legacy KRONKETA control packs (to be imported later).
- `../oracle_of_light` – layered forecasting engine (Oracle of Light / Bayesian Sophiarch) with FastAPI + Typer surfaces.
- `../quantum-bridge` – quantum experiment harness bridging jury simulations into IBM/Qiskit backends.
