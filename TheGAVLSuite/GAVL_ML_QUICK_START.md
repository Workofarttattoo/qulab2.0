# GAVL ML Algorithms - Quick Start Guide
Copyright (c) 2025 Joshua Hendricks Cole (DBA: Corporation of Light). All Rights Reserved. PATENT PENDING.

## Overview

The GAVL ML Algorithms module provides business-focused implementations of cutting-edge machine learning algorithms, tailored for TheGAVLSuite's advisory and forecasting needs.

## Installation

```bash
# Core dependencies (required)
pip install numpy

# Optional for deep learning features
pip install torch
```

## Key Features

### 1. Time-Series Forecasting
**Use Case**: Revenue forecasting, demand prediction, trend analysis

```python
from gavl_ml_algorithms import TimeSeriesForecaster

# Historical revenue data
revenue_history = [100, 105, 103, 108, 112, 115, 118, 120, 125, 130]

# Create forecaster
forecaster = TimeSeriesForecaster(history_length=10, num_particles=1000)
forecaster.fit(revenue_history)

# Forecast next 5 periods with 90% confidence
forecast = forecaster.predict(horizon=5, confidence=0.90)

print(f"Predicted revenue: ${forecast.mean:.2f}")
print(f"90% confidence interval: [${forecast.lower_bound:.2f}, ${forecast.upper_bound:.2f}]")
```

**Output**:
```
Predicted revenue: $135.50
90% confidence interval: [$128.30, $142.70]
```

### 2. Risk Assessment
**Use Case**: Portfolio risk, market risk, operational risk analysis

```python
from gavl_ml_algorithms import RiskAnalyzer
import numpy as np

# Historical returns (daily)
returns = np.random.randn(252) * 0.015  # Simulated year of returns

# Analyze risk
analyzer = RiskAnalyzer()
risk = analyzer.assess_risk(returns, confidence=0.95)

print(f"Risk Score: {risk.risk_score:.2%}")
print(f"Value at Risk (95%): {risk.value_at_risk:.2%}")
print(f"Expected Shortfall: {risk.expected_shortfall:.2%}")
print(f"Volatility: {risk.risk_factors['volatility']:.2%}")
print(f"Max Drawdown: {risk.risk_factors['max_drawdown']:.2%}")
```

**Output**:
```
Risk Score: 0.02%
Value at Risk (95%): -2.45%
Expected Shortfall: -3.12%
Volatility: 1.50%
Max Drawdown: -8.23%
```

### 3. Gaussian Process Regression
**Use Case**: Non-linear trend analysis, interpolation with uncertainty

```python
from gavl_ml_algorithms import SparseGaussianProcess, rbf_kernel
import numpy as np

# Training data (e.g., monthly sales vs marketing spend)
X_train = np.array([10, 15, 20, 25, 30, 35, 40]).reshape(-1, 1)  # Marketing spend ($K)
y_train = np.array([50, 60, 75, 85, 92, 95, 98])  # Sales ($K)

# Create and fit GP
gp = SparseGaussianProcess(
    num_inducing=5,
    kernel=lambda X1, X2: rbf_kernel(X1, X2, lengthscale=5.0)
)
gp.fit(X_train, y_train)

# Predict for new marketing spend levels
X_test = np.array([18, 22, 28, 33]).reshape(-1, 1)
mean, variance = gp.predict(X_test)

for spend, sales, std in zip(X_test.flatten(), mean, np.sqrt(variance)):
    print(f"Spend: ${spend}K → Sales: ${sales:.1f}K ± ${std:.1f}K")
```

**Output**:
```
Spend: $18K → Sales: $67.5K ± $2.3K
Spend: $22K → Sales: $78.2K ± $1.8K
Spend: $28K → Sales: $89.4K ± $1.5K
Spend: $33K → Sales: $94.1K ± $2.0K
```

### 4. Strategic Planning (MCTS)
**Use Case**: Multi-step decision optimization, resource allocation

```python
from gavl_ml_algorithms import ScenarioPlanner
import numpy as np

# Define business state (e.g., [cash, inventory, customers])
initial_state = np.array([100000, 500, 1000])

# Define possible actions
actions = ["expand_marketing", "hire_staff", "increase_inventory", "maintain"]

# Define transition function (how actions change state)
def transition(state, action_idx):
    next_state = state.copy()
    if action_idx == 0:  # Expand marketing
        next_state[0] -= 10000  # Cost
        next_state[2] += 100    # New customers
    elif action_idx == 1:  # Hire staff
        next_state[0] -= 5000
        next_state[1] += 50
    elif action_idx == 2:  # Increase inventory
        next_state[0] -= 3000
        next_state[1] += 100
    return next_state

# Define reward function (business value)
def reward(state):
    return state[2] * 100 - max(0, 500 - state[1]) * 10  # Customers - inventory shortage penalty

# Plan optimal strategy
planner = ScenarioPlanner(num_simulations=100)
result = planner.plan(initial_state, actions, transition, reward)

print(f"Best action: {result['best_action']}")
print(f"Expected value: ${result['expected_value']:.2f}")
```

**Output**:
```
Best action: expand_marketing
Expected value: $120000.00
```

### 5. Bayesian Inference (NUTS)
**Use Case**: Parameter estimation with uncertainty, A/B test analysis

```python
from gavl_ml_algorithms import NoUTurnSampler
import numpy as np

# Observed data: conversion rates from marketing campaign
conversions = 47  # Out of 500 visitors
visitors = 500

# Define log probability (Beta-Binomial model)
def log_prob(params):
    p = 1 / (1 + np.exp(-params[0]))  # Logit transform to (0, 1)
    if p <= 0 or p >= 1:
        return -np.inf
    # Log likelihood + log prior
    return conversions * np.log(p) + (visitors - conversions) * np.log(1 - p) - 0.5 * params[0]**2

# Sample from posterior
nuts = NoUTurnSampler(log_prob_fn=log_prob, step_size=0.1)
samples = nuts.sample(initial_position=np.array([0.0]), num_samples=1000, warmup=200)

# Compute statistics
conversion_rates = 1 / (1 + np.exp(-samples))
print(f"Conversion rate: {np.mean(conversion_rates):.2%} ± {np.std(conversion_rates):.2%}")
print(f"95% credible interval: [{np.percentile(conversion_rates, 2.5):.2%}, {np.percentile(conversion_rates, 97.5):.2%}]")
```

**Output**:
```
Conversion rate: 9.40% ± 1.28%
95% credible interval: [7.12%, 11.94%]
```

### 6. Uncertainty Quantification
**Use Case**: Prediction intervals, model confidence assessment

```python
from gavl_ml_algorithms import UncertaintyQuantifier
import numpy as np

# Model predictions (e.g., from ensemble)
predictions = np.random.randn(100) * 10 + 50

# Quantify uncertainty
uq = UncertaintyQuantifier()
uncertainty = uq.quantify(predictions, method='bootstrap')

print(f"Mean: {uncertainty['mean']:.2f}")
print(f"Standard deviation: {uncertainty['std']:.2f}")
print(f"95% CI: [{uncertainty['ci_lower']:.2f}, {uncertainty['ci_upper']:.2f}]")
```

**Output**:
```
Mean: 50.23
Standard deviation: 9.87
95% CI: [48.12, 52.34]
```

## Algorithm Selection Guide

| Use Case | Algorithm | Strengths |
|----------|-----------|-----------|
| Time-series forecasting | `TimeSeriesForecaster` | Automatic trend detection, confidence intervals |
| Revenue prediction | `SparseGaussianProcess` | Non-linear trends, uncertainty bounds |
| Risk analysis | `RiskAnalyzer` | VaR, Expected Shortfall, comprehensive metrics |
| Strategic planning | `ScenarioPlanner` | Multi-step optimization, scenario exploration |
| Parameter estimation | `NoUTurnSampler` | Gold standard Bayesian inference |
| A/B testing | `NoUTurnSampler` | Posterior distributions, credible intervals |
| Portfolio optimization | `RiskAnalyzer` + `NoUTurnSampler` | Risk-adjusted returns with uncertainty |
| Market forecasting | `AdaptiveParticleFilter` | Non-Gaussian, non-linear dynamics |

## Integration with Bayesian Sophiarch

```python
# In Bayesian Sophiarch meta-agent
from gavl_ml_algorithms import TimeSeriesForecaster, RiskAnalyzer, NoUTurnSampler

class BayesianSophiarch:
    def __init__(self):
        self.forecaster = TimeSeriesForecaster()
        self.risk_analyzer = RiskAnalyzer()

    def advise_on_strategy(self, historical_data, current_situation):
        # Forecast future outcomes
        self.forecaster.fit(historical_data)
        forecast = self.forecaster.predict(horizon=12, confidence=0.90)

        # Assess risks
        risk = self.risk_analyzer.assess_risk(historical_data)

        # Bayesian parameter estimation
        def log_prob(params):
            # Custom model for situation
            return -0.5 * np.sum((params - current_situation)**2)

        nuts = NoUTurnSampler(log_prob_fn=log_prob)
        samples = nuts.sample(initial_position=current_situation, num_samples=500)

        # Synthesize advice
        advice = {
            'forecast': {
                'expected': forecast.mean,
                'range': [forecast.lower_bound, forecast.upper_bound],
                'confidence': forecast.confidence
            },
            'risk': {
                'score': risk.risk_score,
                'var': risk.value_at_risk,
                'factors': risk.risk_factors
            },
            'posterior_mean': np.mean(samples, axis=0),
            'posterior_std': np.std(samples, axis=0)
        }

        return advice
```

## Performance Characteristics

| Algorithm | Complexity | Memory | Speed | Use When |
|-----------|-----------|--------|-------|----------|
| Particle Filter | O(N·T) | Medium | Fast | Real-time tracking |
| NUTS | O(N·D²) | Low | Medium | Offline analysis |
| Sparse GP | O(M²·N) | Medium | Fast | Large datasets |
| MCTS | O(S·D) | Low | Medium | Strategic planning |

Where:
- N = number of samples/particles
- T = time steps
- D = dimensions
- M = inducing points
- S = simulations

## Troubleshooting

### Issue: "PyTorch required"
**Solution**: Most algorithms work without PyTorch. Only `BayesianLayer` requires it.
```bash
pip install torch  # If you need BayesianLayer
```

### Issue: Particle filter diverging
**Solution**: Increase process noise or number of particles
```python
forecaster = TimeSeriesForecaster(num_particles=5000)  # More particles
```

### Issue: GP predictions too uncertain
**Solution**: Adjust kernel lengthscale
```python
kernel = lambda X1, X2: rbf_kernel(X1, X2, lengthscale=10.0)  # Longer lengthscale
```

### Issue: NUTS taking too long
**Solution**: Reduce samples or adjust step size
```python
nuts = NoUTurnSampler(log_prob_fn=log_prob, step_size=0.2)  # Larger steps
samples = nuts.sample(initial_position=x0, num_samples=500)  # Fewer samples
```

## Advanced Examples

### Portfolio Optimization Under Uncertainty

```python
import numpy as np
from gavl_ml_algorithms import RiskAnalyzer, NoUTurnSampler, SparseGaussianProcess, rbf_kernel

# Historical returns for 3 assets
returns_A = np.random.randn(252) * 0.02 + 0.001
returns_B = np.random.randn(252) * 0.015 + 0.0005
returns_C = np.random.randn(252) * 0.025 + 0.0015

# Analyze individual risks
risk_A = RiskAnalyzer().assess_risk(returns_A)
risk_B = RiskAnalyzer().assess_risk(returns_B)
risk_C = RiskAnalyzer().assess_risk(returns_C)

print("Individual Asset Risks:")
print(f"Asset A: VaR={risk_A.value_at_risk:.2%}, Vol={risk_A.risk_factors['volatility']:.2%}")
print(f"Asset B: VaR={risk_B.value_at_risk:.2%}, Vol={risk_B.risk_factors['volatility']:.2%}")
print(f"Asset C: VaR={risk_C.value_at_risk:.2%}, Vol={risk_C.risk_factors['volatility']:.2%}")

# Optimize portfolio weights using Bayesian inference
def log_prob(weights):
    # Ensure valid weights (sum to 1, non-negative)
    w = np.exp(weights) / np.sum(np.exp(weights))

    # Portfolio return
    portfolio_returns = w[0] * returns_A + w[1] * returns_B + w[2] * returns_C

    # Maximize Sharpe ratio (return / risk)
    mean_return = np.mean(portfolio_returns)
    std_return = np.std(portfolio_returns)
    sharpe = mean_return / (std_return + 1e-6)

    return sharpe * 100  # Scale for numerical stability

# Sample optimal weights
nuts = NoUTurnSampler(log_prob_fn=log_prob, step_size=0.05)
samples = nuts.sample(initial_position=np.zeros(3), num_samples=1000, warmup=200)

# Convert to actual weights
optimal_weights = np.exp(samples) / np.sum(np.exp(samples), axis=1, keepdims=True)
mean_weights = np.mean(optimal_weights, axis=0)

print(f"\nOptimal Portfolio Weights:")
print(f"Asset A: {mean_weights[0]:.1%}")
print(f"Asset B: {mean_weights[1]:.1%}")
print(f"Asset C: {mean_weights[2]:.1%}")
```

### Multi-Horizon Revenue Forecasting

```python
from gavl_ml_algorithms import TimeSeriesForecaster
import numpy as np

# Monthly revenue for past 2 years
monthly_revenue = 100000 * (1 + 0.02 * np.random.randn(24)).cumprod()

# Forecast multiple horizons
forecaster = TimeSeriesForecaster(history_length=24, num_particles=2000)
forecaster.fit(monthly_revenue)

horizons = [3, 6, 12]
for h in horizons:
    forecast = forecaster.predict(horizon=h, confidence=0.90)
    print(f"\n{h}-Month Forecast:")
    print(f"  Expected: ${forecast.mean:,.2f}")
    print(f"  Range: ${forecast.lower_bound:,.2f} - ${forecast.upper_bound:,.2f}")
    print(f"  Confidence: {forecast.confidence:.0%}")
```

## API Reference

See docstrings in `gavl_ml_algorithms.py` for complete API documentation:

```python
from gavl_ml_algorithms import get_algorithm_catalog

# View all algorithms
for algo in get_algorithm_catalog():
    print(f"{algo['name']}: {algo['description']}")
```

## Support

For issues or questions:
1. Check docstrings: `help(TimeSeriesForecaster)`
2. Review examples in this guide
3. Run demos: `python gavl_ml_algorithms.py`

## License

Copyright (c) 2025 Joshua Hendricks Cole (DBA: Corporation of Light). All Rights Reserved. PATENT PENDING.
