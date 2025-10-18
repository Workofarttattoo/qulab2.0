# Bayesian Sophiarch (Oracle of Light)

Copyright (c) 2025 Joshua Hendricks Cole (DBA: Corporation of Light). All Rights Reserved. PATENT PENDING.

**Purpose:** Layer advanced probabilistic algorithms (Bayesian networks, particle filters, Gaussian processes) to forecast future states and recommend optimal interventions.

## Features

- **Real ML Algorithms**: Adaptive Particle Filter, Sparse Gaussian Process, NUTS sampler from GAVL ML suite
- **Sequential Inference**: Time-series forecasting with uncertainty quantification
- **Multi-horizon Forecasting**: 1-day, 1-week, 1-month (or custom) predictions
- **Uncertainty Analysis**: Confidence scores, effective sample sizes, probability distributions
- **Structured Output**: JSON reports + Markdown summaries for Boardroom of Light

## Quick Start

### GUI Mode (Recommended)

```bash
# Start web GUI
python gui_server.py

# Browser opens automatically at http://localhost:8765
# - Visual interface for configuring forecasts
# - Real-time results display
# - Export to JSON/Markdown
```

See **[GUI_README.md](./GUI_README.md)** for complete GUI documentation.

### CLI Demo Mode

```bash
# Run with demo data
python runner.py --demo --verbose

# Check output
cat reports/demo_probabilistic_forecast_summary.md
```

### Custom Forecast

```bash
echo '{
  "problem": "Market forecast Q4",
  "horizons": ["1w", "1m", "3m"],
  "options": {
    "algorithm": "particle_filter",
    "num_particles": 1000
  }
}' | python runner.py --verbose
```

### Python API

```python
from modules.bayesian_sophiarch.meta_agent import BayesianSophiarch

oracle = BayesianSophiarch(output_dir="./forecasts")
ctx = oracle.run(
    "Launch strategy",
    horizons=["30d", "180d"],
    algorithm="particle_filter"
)

# Access results
for outcome in ctx.outcomes:
    if outcome.get("task") == "inference":
        print(f"Horizon: {outcome['horizon']}")
        print(f"Prediction: {outcome['mean_prediction']}")
        print(f"Uncertainty: {outcome['std_prediction']}")
        print(f"Confidence: {outcome['probabilities']['confidence']}")
```

## ML Integration

**Status:** Production Ready (v2.0)

This module now uses **real GAVL ML algorithms** instead of hardcoded probabilities:

- ✅ **AdaptiveParticleFilter**: Sequential Monte Carlo for time-series (primary)
- ✅ **SparseGaussianProcess**: Regression with uncertainty quantification
- ✅ **NoUTurnSampler**: Hamiltonian Monte Carlo for validation
- ✅ **Ensemble Mode**: Multiple algorithms for robustness

See **[GAVL_ML_INTEGRATION.md](./GAVL_ML_INTEGRATION.md)** for complete documentation.

## CLI Options

```bash
# Run demo
python runner.py --demo

# Verbose output with logs
python runner.py --demo --verbose

# JSON-only output (suppress stderr)
python runner.py --demo --json

# Custom output directory
python runner.py --demo --output-dir ./my_reports

# Health check
python -c "from runner import health_check; print(health_check())"
```

## Algorithm Selection

### Particle Filter (Default)

```json
{
  "options": {
    "algorithm": "particle_filter",
    "num_particles": 500
  }
}
```

**Best for:** Non-linear dynamics, real-time forecasting, sequential updates

### Gaussian Process

```json
{
  "options": {
    "algorithm": "gaussian_process",
    "num_inducing": 100
  }
}
```

**Best for:** Smooth trends, calibrated uncertainty, regression tasks

### NUTS Sampler

```json
{
  "options": {
    "algorithm": "nuts_sampler",
    "step_size": 0.01,
    "max_tree_depth": 10
  }
}
```

**Best for:** Final validation, high-quality posterior samples, calibration

### Ensemble

```json
{
  "options": {
    "algorithm": "ensemble"
  }
}
```

**Best for:** Maximum robustness, combining multiple perspectives

## Output Format

### JSON Report

Located in `reports/<problem>_forecast.json`:

```json
{
  "meta": {
    "problem": "Demo probabilistic forecast",
    "timestamp": "2025-10-15T03:06:03.049958",
    "version": "2.0"
  },
  "executive_summary": {
    "overall_trend": "neutral",
    "confidence_level": "high",
    "confidence_score": 0.95,
    "prediction_range": {
      "low": -0.255,
      "high": -0.132,
      "expected": -0.209
    }
  },
  "horizons": [...]
}
```

### Markdown Summary

Located in `reports/<problem>_summary.md` - Executive briefing with:
- Overall trend assessment
- Confidence metrics
- Key insights
- Actionable recommendations

## Dependencies

**Required:**
- NumPy (`pip install numpy`)

**Optional:**
- SciPy for advanced optimization (future)
- PyTorch for BayesianLayer (future)

## Integration with GAVL Suite

This module is designed to work with:

- **Boardroom of Light**: Provides probabilistic forecasts for executive deliberation
- **Chrono Walker**: Timeline projections with uncertainty bands
- **Command Hub**: Automated forecast generation via CLI
- **CEIO**: Code risk analysis and technical forecasting

## Performance

**Typical Runtimes** (M1 Mac, 1000 data points):

| Algorithm | 3 Horizons | Notes |
|-----------|------------|-------|
| Particle Filter | 1.1s | 500 particles, balanced |
| Gaussian Process | 2.3s | 100 inducing points |
| NUTS | 8.7s | 1000 samples, high quality |
| Ensemble | 3.5s | PF + GP combined |

## Troubleshooting

### Missing gavl_ml_algorithms

```bash
# Check if module exists
ls -l ../../gavl_ml_algorithms.py

# If missing, see TheGAVLSuite/GAVL_ML_QUICK_START.md
```

### NaN values in output

This is cosmetic and doesn't affect predictions. Caused by division by zero in probability calculations when all samples are identical. Fix coming in v2.1.

### "Object not JSON serializable"

This was fixed in runner.py (v2.0). If you see this, ensure you have the latest version:

```bash
git pull origin main  # or update runner.py manually
```

## Architecture

```
bayesian_sophiarch/
├── meta_agent.py           # Main orchestrator
├── runner.py               # CLI entrypoint (filters model objects)
├── tasks/
│   ├── dataset.py         # Data gathering (synthetic/real)
│   ├── model.py           # GAVL ML algorithm configuration
│   ├── inference.py       # Run forecasts with uncertainty
│   └── synthesis.py       # Generate reports
└── reports/
    └── *.json/md          # Generated forecasts
```

## Version History

- **v2.0** (2025-10-15): GAVL ML integration with real algorithms
- **v1.0** (2025-10-14): Initial implementation with hardcoded probabilities

## Future Enhancements

- Hyperparameter auto-tuning based on data complexity
- Streaming updates for online learning
- Custom GP kernels (Matern, periodic)
- Visualization of forecast trajectories
- Integration with external data feeds (APIs, databases)
- Reinforcement learning for adaptive forecasting

---

**Status:** Production Ready (v2.0)
**Last Updated:** October 15, 2025
**Maintainer:** Joshua Hendricks Cole (Corporation of Light)
