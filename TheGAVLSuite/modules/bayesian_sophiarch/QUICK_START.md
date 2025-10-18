# Bayesian Sophiarch Quick Start Guide

**Copyright (c) 2025 Joshua Hendricks Cole (DBA: Corporation of Light). All Rights Reserved. PATENT PENDING.**

## TL;DR

The Bayesian Sophiarch now uses **real ML algorithms** for Bayesian inference instead of hardcoded probabilities.

## 30-Second Test

```bash
cd TheGAVLSuite/modules/bayesian_sophiarch
python demo.py
# Select option 1, press Enter
# Check reports/demo1/ for output
```

## 5-Minute Usage

```python
from modules.bayesian_sophiarch.meta_agent import BayesianSophiarch

agent = BayesianSophiarch()

ctx = agent.run(
    problem="My forecast problem",
    horizons=["1w", "1m", "3m"],
    algorithm="particle_filter",  # or gaussian_process, nuts_sampler, ensemble
    num_samples=1000
)

# Check results
synthesis = next((o for o in ctx.outcomes if o.get("task") == "synthesis"), None)
print(f"Confidence: {synthesis['executive_summary']['confidence_score']:.2%}")
```

## What's New?

### Before:
```python
# Hardcoded placeholder probabilities
probabilities = {
    "status_quo": 0.5,
    "positive_shift": 0.3,
    "negative_shift": 0.2
}
```

### After:
```python
# Real Bayesian inference with probability distributions
from scipy import stats
norm = stats.norm(loc=pred_mean, scale=pred_std)
prob_positive = 1.0 - norm.cdf(baseline + 0.5 * pred_std)
# Computed from real ML algorithms!
```

## Available Algorithms

| Algorithm | Speed | Best For | Command |
|-----------|-------|----------|---------|
| **Particle Filter** | Fast | Real-time tracking | `algorithm="particle_filter"` |
| **Gaussian Process** | Medium | Uncertainty quantification | `algorithm="gaussian_process"` |
| **NUTS Sampler** | Slow | High accuracy | `algorithm="nuts_sampler"` |
| **Ensemble** | Slow | Critical decisions | `algorithm="ensemble"` |

## Configuration Templates

### Fast Forecast (Particle Filter)
```python
ctx = agent.run(
    problem="Quick market analysis",
    horizons=["1d", "1w"],
    algorithm="particle_filter",
    num_particles=300,
    num_samples=500
)
```

### Accurate Forecast (Gaussian Process)
```python
ctx = agent.run(
    problem="Revenue prediction",
    horizons=["1m", "3m", "6m"],
    algorithm="gaussian_process",
    num_inducing=100,
    num_samples=1000
)
```

### Gold Standard (NUTS)
```python
ctx = agent.run(
    problem="Risk assessment",
    horizons=["1m", "6m"],
    algorithm="nuts_sampler",
    step_size=0.01,
    num_samples=600
)
```

### Robust Ensemble
```python
ctx = agent.run(
    problem="Strategic planning",
    horizons=["1m", "3m", "6m", "1y"],
    algorithm="ensemble",
    num_samples=1000
)
```

## Output Files

After running, check:
```
reports/<problem_name>/
├── <problem>_forecast.json    # Complete analysis
└── <problem>_summary.md        # Executive summary
```

## JSON Output Structure

```json
{
  "meta": {
    "problem": "...",
    "timestamp": "...",
    "version": "2.0"
  },
  "executive_summary": {
    "overall_trend": "positive|neutral|negative",
    "confidence_level": "high|medium|low",
    "confidence_score": 0.87,
    "most_likely_outcome": "positive_shift",
    "outcome_probability": 0.62,
    "prediction_range": {
      "low": -0.123,
      "expected": 0.456,
      "high": 1.234
    }
  },
  "uncertainty_analysis": { ... },
  "recommendations": [ ... ]
}
```

## Key Metrics Explained

### Confidence Score (0-1)
- **>0.8**: High confidence - proceed with decisions
- **0.6-0.8**: Medium confidence - reasonable forecast
- **<0.6**: Low confidence - gather more data

### Probabilities
- **status_quo**: Within 0.5σ of baseline (~34% range)
- **positive_shift**: Above baseline + 0.5σ
- **negative_shift**: Below baseline - 0.5σ

### Trend
- **positive**: Mean prediction > 0.5
- **neutral**: Mean prediction between -0.5 and 0.5
- **negative**: Mean prediction < -0.5

## Time Horizons

Supports: `d` (days), `w` (weeks), `m` (months), `y` (years)

Examples:
- `"7d"` = 7 days
- `"2w"` = 14 days
- `"3m"` = 90 days
- `"1y"` = 365 days

## Common Issues

### Issue: "No module named 'aios'"
**Solution**: Ensure `/Users/noone` is in Python path:
```python
import sys
sys.path.insert(0, '/Users/noone')
```

### Issue: "No valid model layer found"
**Solution**: Check algorithm name spelling:
```python
algorithm="particle_filter"  # Not "particlefilter"
```

### Issue: "KeyError: 'prediction_range'"
**Solution**: This means no inference outcomes were generated. Check logs:
```python
for log in ctx.logs[-10:]:
    print(log)
```

## Demo Script

```bash
python demo.py
```

**Options:**
1. Particle Filter demo
2. Gaussian Process demo
3. NUTS Sampler demo
4. Ensemble demo
5. Custom Horizons demo
6. Run all demos

## Integration with Ai|oS

```python
# In your meta-agent
from modules.bayesian_sophiarch.meta_agent import BayesianSophiarch

def forecasting_action(ctx: ExecutionContext) -> ActionResult:
    agent = BayesianSophiarch()
    forecast = agent.run(problem="...", horizons=["1w", "1m"])

    synthesis = next(o for o in forecast.outcomes if o.get("task") == "synthesis")
    ctx.publish_metadata("forecast", synthesis["executive_summary"])

    return ActionResult(success=True, message="Forecast complete")
```

## Performance Tips

1. **Start small**: 100 particles, 500 samples
2. **Scale up**: Double parameters if confidence too low
3. **Use ensemble**: Only for critical decisions
4. **Monitor time**: NUTS is slow for >3 dimensions
5. **Check logs**: ctx.logs has detailed progress

## Verification

Quick test:
```bash
python -c "
import sys
sys.path.insert(0, '/Users/noone')
from TheGAVLSuite.modules.bayesian_sophiarch.meta_agent import BayesianSophiarch

agent = BayesianSophiarch()
ctx = agent.run('Test', horizons=['1d'], algorithm='particle_filter', num_samples=100)
print(f'Success! Generated {len(ctx.outcomes)} outcomes')
"
```

Expected output: `Success! Generated 1 outcomes`

## Getting Help

1. **Read ENHANCEMENTS.md**: Detailed technical documentation
2. **Read SUMMARY.md**: Comprehensive overview
3. **Run demo.py**: See examples in action
4. **Check logs**: `ctx.logs` has execution details
5. **Inspect reports**: JSON/Markdown show full analysis

## Next Steps

1. ✅ Run `python demo.py` to see it in action
2. ✅ Read generated markdown reports in `reports/`
3. ✅ Try your own problem statement
4. ✅ Experiment with different algorithms
5. ✅ Integrate into your Ai|oS workflow

---

**Quick Links:**
- Technical Details: [ENHANCEMENTS.md](ENHANCEMENTS.md)
- Full Overview: [SUMMARY.md](SUMMARY.md)
- Demo Script: [demo.py](demo.py)
- Main Code: [meta_agent.py](meta_agent.py)

**Status**: ✅ Production Ready | **Version**: 2.0.0 | **Date**: 2025-10-14
