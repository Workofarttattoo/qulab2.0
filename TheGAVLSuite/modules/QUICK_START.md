# GAVL Suite Meta-Agent Quick Start Guide

**Copyright (c) 2025 Joshua Hendricks Cole (DBA: Corporation of Light). All Rights Reserved. PATENT PENDING.**

## Installation

```bash
cd TheGAVLSuite/modules

# Install test dependencies
pip install -r tests/requirements.txt

# Install module dependencies (as needed)
pip install -r osint/requirements.txt
pip install -r hellfire_recon/requirements.txt
```

## Quick Commands

### List All Modules
```bash
python run_module.py --list
```

### Health Check All Modules
```bash
python run_module.py --health-check
```

### Run Module in Demo Mode
```bash
# Any module
python run_module.py osint --demo
python run_module.py hellfire --demo
python run_module.py bayesian --demo
python run_module.py legal --demo
python run_module.py enhancements --demo

# With verbose output
python run_module.py osint --demo --verbose
```

### Run with Example Config
```bash
cat examples/osint_example.json | python run_module.py osint
cat examples/hellfire_example.json | python run_module.py hellfire
cat examples/bayesian_example.json | python run_module.py bayesian
cat examples/legal_example.json | python run_module.py legal
cat examples/enhancements_example.json | python run_module.py enhancements
```

### Run Tests
```bash
# All tests
pytest tests/ -v

# Specific module
pytest tests/test_osint_runner.py -v

# With coverage
pytest tests/ --cov=modules --cov-report=html
```

## Module Reference

### OSINT - Intelligence Gathering
```bash
# Input
echo '{"subject": "example.com"}' | python run_module.py osint

# Output
{
  "status": "ok",
  "subject": "example.com",
  "evidence": {...},
  "logs": [...]
}
```

### HELLFIRE - Security Assessment
```bash
# Input
echo '{"client": "Acme Corp"}' | python run_module.py hellfire

# Output
{
  "status": "ok",
  "client": "Acme Corp",
  "surface": {...},
  "vectors": [...],
  "training": [...],
  "logs": [...]
}
```

### Bayesian - Probabilistic Forecasting
```bash
# Input
echo '{"problem": "Revenue forecast", "horizons": ["1d", "1w"]}' | python run_module.py bayesian

# Output
{
  "status": "ok",
  "problem": "Revenue forecast",
  "horizons": ["1d", "1w"],
  "datasets": {...},
  "layers": {...},
  "outcomes": {...},
  "logs": [...]
}
```

### Legal - Legal Research
```bash
# Input
echo '{"matter": "Contract review", "jurisdiction": "CA"}' | python run_module.py legal

# Output
{
  "status": "ok",
  "matter": "Contract review",
  "jurisdiction": "CA",
  "dossier": {...},
  "filings": [...],
  "logs": [...]
}
```

### Enhancements - Product Improvement
```bash
# Input
echo '{"product": "My App"}' | python run_module.py enhancements

# Output
{
  "status": "ok",
  "product": "My App",
  "telemetry": {...},
  "improvements": [...],
  "tickets": [...],
  "logs": [...]
}
```

## Common Flags

| Flag | Description |
|------|-------------|
| `--demo` | Run with demo data (no stdin) |
| `--verbose` / `-v` | Verbose logging to stderr |
| `--json` | JSON-only output |
| `--output-dir PATH` | Custom output directory |
| `--help` / `-h` | Show help |

## Error Handling

### Success Response
```json
{
  "status": "ok",
  "data": {...}
}
```

### Error Response
```json
{
  "status": "error",
  "message": "Error description",
  "context": {...}
}
```

### Exit Codes
- `0` = Success
- `1` = Error

## Testing

```bash
# Run all tests
pytest tests/ -v

# Run specific test
pytest tests/test_osint_runner.py::TestOsintRunner::test_demo_mode -v

# Run with coverage
pytest tests/ --cov=modules --cov-report=term-missing

# Run tests matching pattern
pytest tests/ -k "demo_mode" -v
```

## Documentation

- **Full Guide:** [MODULE_RUNNER_GUIDE.md](MODULE_RUNNER_GUIDE.md)
- **Test Guide:** [tests/README.md](tests/README.md)
- **Verification:** [VERIFICATION_SUMMARY.md](VERIFICATION_SUMMARY.md)

## Troubleshooting

### Import Errors
```bash
# Set PYTHONPATH
export PYTHONPATH="${PYTHONPATH}:/path/to/TheGAVLSuite"

# Or run from correct directory
cd TheGAVLSuite/modules
python run_module.py --list
```

### Missing Dependencies
```bash
# Check requirements
cat modules/osint/requirements.txt

# Install
pip install -r modules/osint/requirements.txt
```

### Invalid JSON
```bash
# Validate first
echo '{"subject": "test.com"}' | jq .

# Then pipe
echo '{"subject": "test.com"}' | python run_module.py osint
```

## Integration with Ai|oS

```python
from modules.osint import runner

def osint_action(ctx: ExecutionContext) -> ActionResult:
    """Ai|oS action for OSINT analysis."""
    import json
    from io import StringIO
    import sys

    payload = {"subject": ctx.environment.get("OSINT_TARGET")}
    sys.stdin = StringIO(json.dumps(payload))

    exit_code = runner.main([])
    return ActionResult(
        success=(exit_code == 0),
        message="OSINT analysis complete"
    )
```

## Support

For detailed information:
1. Read [MODULE_RUNNER_GUIDE.md](MODULE_RUNNER_GUIDE.md)
2. Check module-specific `--help`
3. Review example configs in `examples/`
4. Run health checks: `python run_module.py --health-check`

---

**Quick Start Version:** 1.0.0
**Last Updated:** October 14, 2025
**Status:** Production Ready
