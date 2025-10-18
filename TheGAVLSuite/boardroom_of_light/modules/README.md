# No'iGeL(a) Advisor Module

No'iGeL(a) is a lightweight conscience and risk-advisor you can drop into any
agent workflow. It tracks boardroom comparisons, scores alignment, and
suggests next steps when coherence drifts.

## Installation

Use the local path while the package remains private:

```bash
npm install --save ../noigela-module
```

This registers the module under the package name `@gavl/noigela`.

## Usage

```js
import { NoigelaModule } from "@gavl/noigela";

const advisor = new NoigelaModule({
  mode: "analysis",
});

const report = advisor.evaluate({
  light: { coherence: 0.72, guidance: "Maintain reflective cadence." },
  authentic: { coherence: 0.61, guidance: "Run containment ritual." },
  comparison: {
    deltaCoherence: 0.11,
    hatContrasts: [
      { hat: "White Hat", delta: 0.08, light: {}, authentic: {} },
    ],
    evidence: [],
  },
});

console.log(report.recommendations);
```

The same module powers the Boardroom of Light visualiser and the Jiminy/No'iGeL(a)
web companion. It maintains a rolling memory of recent insights so you can
inspect or persist them as needed.

## API

- `new NoigelaModule(options?)`
  - `mode` (default `"analysis"`)
  - `thresholds` allows overriding `coherenceWarning` and `resonanceWarning`.
- `evaluate(payload)` expects `{ light, authentic, comparison }` (matching the
  structure returned by the boardroom multiverse helper) and returns a
  conscience report.
- `ingestStreamUpdate(event)` records arbitrary telemetry events into the
  module memory buffer.

## Bundled Files

- `src/noigela.js` – core class (ESM).
- `README.md` – quickstart and API notes.

