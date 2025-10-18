const DEFAULT_THRESHOLDS = {
  coherenceWarning: 0.15,
  resonanceWarning: 0.12,
};

export class NoigelaModule {
  constructor(options = {}) {
    this.mode = options.mode ?? "analysis";
    this.thresholds = { ...DEFAULT_THRESHOLDS, ...(options.thresholds ?? {}) };
    this.memory = [];
  }

  evaluate(payload) {
    const { light, authentic, comparison } = payload;
    if (!light || !authentic || !comparison) {
      throw new Error("NoigelaModule requires light, authentic, and comparison payloads.");
    }

    const conscienceScore = this._scoreAlignment(comparison);
    const innerMonologue = this._composeWhispers(comparison, conscienceScore);
    const recommendations = this._recommendNextSteps(comparison);

    const report = {
      timestamp: Date.now(),
      conscienceScore,
      innerMonologue,
      recommendations,
      observation: {
        light: {
          coherence: light.coherence,
          guidance: light.guidance,
        },
        authentic: {
          coherence: authentic.coherence,
          guidance: authentic.guidance,
        },
        delta: comparison.deltaCoherence,
      },
      watchlist: this._buildWatchlist(comparison),
    };

    this.memory.push(report);
    if (this.memory.length > 100) {
      this.memory.shift();
    }

    return report;
  }

  ingestStreamUpdate(event) {
    if (!event) {
      return null;
    }
    const insight = {
      timestamp: Date.now(),
      type: event.type ?? "observation",
      summary: event.summary ?? "",
      payload: event,
    };
    this.memory.push(insight);
    if (this.memory.length > 100) {
      this.memory.shift();
    }
    return insight;
  }

  _scoreAlignment(comparison) {
    const coherenceThreshold = this.thresholds.coherenceWarning || DEFAULT_THRESHOLDS.coherenceWarning;
    const resonanceThreshold = this.thresholds.resonanceWarning || DEFAULT_THRESHOLDS.resonanceWarning;

    const coherenceContribution = Math.max(-1, Math.min(1, (comparison.deltaCoherence ?? 0) / coherenceThreshold));
    const resonanceContribution = (comparison.hatContrasts ?? []).reduce((acc, contrast) => {
      if (!contrast || typeof contrast.delta !== "number") {
        return acc;
      }
      const normalized = contrast.delta / resonanceThreshold;
      return acc + Math.max(-1, Math.min(1, normalized));
    }, 0);

    const averageResonanceContribution = resonanceContribution / Math.max(1, (comparison.hatContrasts ?? []).length);
    const rawScore = (coherenceContribution * 0.6) + (averageResonanceContribution * 0.4);

    return Number.parseFloat(Math.max(-1, Math.min(1, rawScore)).toFixed(3));
  }

  _composeWhispers(comparison, conscienceScore) {
    const polarity = conscienceScore >= 0 ? "hopeful" : "concerned";
    const tone = polarity === "hopeful"
      ? "Small victories sparkle."
      : "Shadow frets across the ledger.";

    const criticalHat = (comparison.hatContrasts ?? [])[0];
    const focusLine = criticalHat
      ? `${criticalHat.hat} seat delta at ${criticalHat.delta >= 0 ? "+" : ""}${criticalHat.delta}.`
      : "Hat deltas stable.";

    return {
      tone,
      polarity,
      message: `${tone} ${focusLine}`,
    };
  }

  _recommendNextSteps(comparison) {
    const actions = [];
    const coherenceThreshold = this.thresholds.coherenceWarning || DEFAULT_THRESHOLDS.coherenceWarning;

    if ((comparison.deltaCoherence ?? 0) < -coherenceThreshold) {
      actions.push("Trigger assemble-boardroom ritual for authentic realm; coherence drift detected.");
    } else if ((comparison.deltaCoherence ?? 0) > coherenceThreshold) {
      actions.push("Leverage light realm blueprint as activation code baseline.");
    }

    (comparison.evidence ?? []).slice(0, 3).forEach((item) => {
      if (!item?.headline) return;
      actions.push(`Interview ${item.headline} persona; contrast whisper vs affirmation.`);
    });

    if (!actions.length) {
      actions.push("Maintain dual-room observation; no urgent variance detected.");
    }

    return actions;
  }

  _buildWatchlist(comparison) {
    return (comparison.hatContrasts ?? []).map((contrast) => ({
      hat: contrast.hat,
      delta: contrast.delta,
      flagged: Math.abs(contrast.delta ?? 0) >= (this.thresholds.resonanceWarning || DEFAULT_THRESHOLDS.resonanceWarning),
      authenticInnerThought: contrast.authentic?.innerThoughts?.slice(-1)?.[0],
      lightAffirmation: contrast.light?.innerThoughts?.slice(-1)?.[0],
    }));
  }
}

export const JimminyCricketModule = NoigelaModule;

export default NoigelaModule;
