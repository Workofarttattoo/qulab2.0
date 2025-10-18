# GAVL Suite Meta-Agent Module Runner Guide

**Copyright (c) 2025 Joshua Hendricks Cole (DBA: Corporation of Light). All Rights Reserved. PATENT PENDING.**

## Overview

The GAVL Suite provides a unified runner framework for all meta-agent modules. Each module can be run independently or through the master runner script with consistent CLI interface and testing.

## Available Modules

| Module | Purpose | Status |
|--------|---------|--------|
| **OSINT** | Intelligence gathering and analysis | ✅ Ready |
| **HELLFIRE** | Security assessment and entry vector analysis | ✅ Ready |
| **Bayesian Sophiarch** | Probabilistic forecasting and analysis | ✅ Ready |
| **Corporate Legal** | Legal research and compliance analysis | ✅ Ready |
| **Chief Enhancements** | Product improvement and enhancement analysis | ✅ Ready |

## Master Runner Script

### Installation

```bash
cd TheGAVLSuite/modules
chmod +x run_module.py
```

### Usage

#### List All Modules

```bash
python run_module.py --list
```

Output:
```
Available meta-agent modules:

  osint           - OSINT meta-agent for intelligence gathering and analysis
  hellfire        - HELLFIRE Recon meta-agent for security assessments
  bayesian        - Bayesian Sophiarch meta-agent for probabilistic forecasting
  legal           - Corporate Legal meta-agent for legal research and compliance
  enhancements    - Chief Enhancements meta-agent for product improvement analysis
```

#### Health Check All Modules

```bash
python run_module.py --health-check
```

Returns JSON with health status for each module.

#### Run Specific Module

```bash
# Demo mode
python run_module.py osint --demo

# With verbose output
python run_module.py bayesian --demo --verbose

# Via stdin
echo '{"subject": "test.com"}' | python run_module.py osint

# Get module-specific help
python run_module.py legal --help
```

## Individual Module Runners

Each module has its own runner with consistent CLI interface:

### Common Flags (All Modules)

| Flag | Description |
|------|-------------|
| `--demo` | Run with demo data (no stdin required) |
| `--verbose` / `-v` | Enable verbose logging to stderr |
| `--json` | Output JSON only (suppress logs) |
| `--output-dir PATH` | Custom output directory for reports |
| `--help` / `-h` | Show module-specific help |

### OSINT Module

**Location:** `modules/osint/runner.py`

**Required Input:**
- `subject` (string): Target domain or entity

**Optional Parameters:**
- `depth` (int): Crawl depth (default: 2)
- `follow_redirects` (bool): Follow HTTP redirects
- `timeout` (int): Request timeout in seconds
- `include_social` (bool): Include social media analysis

**Examples:**

```bash
# Demo mode
python modules/osint/runner.py --demo

# Via stdin
echo '{"subject": "example.com"}' | python modules/osint/runner.py

# Using example config
cat modules/examples/osint_example.json | python modules/osint/runner.py --verbose

# Custom output directory
python modules/osint/runner.py --demo --output-dir ./osint_reports
```

**Output Structure:**
```json
{
  "status": "ok",
  "subject": "example.com",
  "evidence": {
    "sources": [...],
    "identities": [...],
    "social_graph": {...}
  },
  "logs": [...]
}
```

### HELLFIRE Recon Module

**Location:** `modules/hellfire_recon/runner.py`

**Required Input:**
- `client` (string): Client name or assessment target

**Optional Parameters:**
- `scope` (string): Assessment scope ("external", "internal")
- `methodology` (string): Testing methodology ("owasp", "nist")
- `depth` (int): Analysis depth
- `include_social_engineering` (bool): Include SE vectors

**Examples:**

```bash
# Demo mode
python modules/hellfire_recon/runner.py --demo

# Via stdin
echo '{"client": "Acme Corp"}' | python modules/hellfire_recon/runner.py

# Using example config
cat modules/examples/hellfire_example.json | python modules/hellfire_recon/runner.py -v

# JSON output only
python modules/hellfire_recon/runner.py --demo --json
```

**Output Structure:**
```json
{
  "status": "ok",
  "client": "Acme Corp",
  "surface": {...},
  "vectors": [...],
  "training": [...],
  "logs": [...]
}
```

### Bayesian Sophiarch Module

**Location:** `modules/bayesian_sophiarch/runner.py`

**Required Input:**
- `problem` (string): Problem description

**Optional Parameters:**
- `horizons` (array): Forecast horizons (e.g., ["1d", "1w", "1m"])
- `priors` (string): Prior distribution type
- `confidence_threshold` (float): Minimum confidence level
- `monte_carlo_samples` (int): Number of MC samples

**Examples:**

```bash
# Demo mode
python modules/bayesian_sophiarch/runner.py --demo

# Via stdin
echo '{"problem": "Revenue forecast", "horizons": ["1d", "1w"]}' | \
  python modules/bayesian_sophiarch/runner.py

# Using example config
cat modules/examples/bayesian_example.json | \
  python modules/bayesian_sophiarch/runner.py --verbose
```

**Output Structure:**
```json
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

### Corporate Legal Module

**Location:** `modules/corporate_legal_team/runner.py`

**Required Input:**
- `matter` (string): Legal matter description
- `jurisdiction` (string): Legal jurisdiction code

**Optional Parameters:**
- `client` (string): Client name
- `research_depth` (string): Research thoroughness
- `include_precedents` (bool): Include case precedents
- `regulatory_frameworks` (array): Applicable frameworks

**Examples:**

```bash
# Demo mode
python modules/corporate_legal_team/runner.py --demo

# Via stdin
echo '{"matter": "Contract review", "jurisdiction": "CA"}' | \
  python modules/corporate_legal_team/runner.py

# Using example config
cat modules/examples/legal_example.json | \
  python modules/corporate_legal_team/runner.py -v

# Custom output
python modules/corporate_legal_team/runner.py --demo \
  --output-dir ./legal_reports
```

**Output Structure:**
```json
{
  "status": "ok",
  "matter": "Contract review",
  "jurisdiction": "CA",
  "dossier": {...},
  "filings": [...],
  "logs": [...]
}
```

### Chief Enhancements Module

**Location:** `modules/chief_enhancements_office/runner.py`

**Required Input:**
- `product` (string): Product name or description

**Optional Parameters:**
- `analyze_telemetry` (bool): Analyze usage telemetry
- `generate_tickets` (bool): Generate improvement tickets
- `prioritization_method` (string): Prioritization approach
- `technical_debt_assessment` (bool): Assess technical debt

**Examples:**

```bash
# Demo mode
python modules/chief_enhancements_office/runner.py --demo

# Via stdin
echo '{"product": "My App"}' | \
  python modules/chief_enhancements_office/runner.py

# Using example config
cat modules/examples/enhancements_example.json | \
  python modules/chief_enhancements_office/runner.py --verbose

# JSON output only
python modules/chief_enhancements_office/runner.py --demo --json
```

**Output Structure:**
```json
{
  "status": "ok",
  "product": "My App",
  "telemetry": {...},
  "improvements": [...],
  "tickets": [...],
  "logs": [...]
}
```

## Health Checks

Each module provides a `health_check()` function for system integration:

```python
from modules.osint import runner

health = runner.health_check()
# Returns:
# {
#   "tool": "osint",
#   "status": "ok",  # or "warn", "error"
#   "summary": "OSINT meta-agent operational with 5 tasks",
#   "details": {
#     "pipeline_tasks": 5,
#     "latency_ms": 12.34,
#     "output_dir": "/path/to/reports"
#   }
# }
```

## Integration Tests

### Running Tests

```bash
# Install pytest if needed
pip install pytest pytest-mock

# Run all tests
cd TheGAVLSuite/modules
pytest tests/

# Run specific module tests
pytest tests/test_osint_runner.py

# Run with verbose output
pytest tests/ -v

# Run with coverage
pytest tests/ --cov=modules --cov-report=html
```

### Test Structure

Each module has comprehensive integration tests:

- `test_health_check()` - Verify health check function
- `test_demo_mode()` - Test demo mode execution
- `test_verbose_mode()` - Test verbose output
- `test_stdin_mode()` - Test JSON stdin input
- `test_missing_*_error()` - Test error handling
- `test_invalid_json_error()` - Test JSON parsing errors
- `test_custom_output_dir()` - Test custom output paths
- `test_exception_handling()` - Test exception recovery
- `test_help_flag()` - Test help documentation

### Fixtures

Available test fixtures (see `modules/tests/conftest.py`):

- `temp_output_dir` - Temporary directory for outputs
- `mock_subprocess` - Mock subprocess calls
- `mock_requests` - Mock HTTP requests
- `sample_*_payload` - Sample input data for each module

### Writing New Tests

```python
from modules.tests.conftest import assert_valid_status_response

def test_my_feature(capsys):
    """Test my feature."""
    exit_code = runner.main(["--demo"])
    captured = capsys.readouterr()

    assert exit_code == 0
    output = json.loads(captured.out)
    assert_valid_status_response(output)
```

## Example Configurations

Pre-built example configurations are available in `modules/examples/`:

| File | Description |
|------|-------------|
| `osint_example.json` | OSINT investigation configuration |
| `hellfire_example.json` | Security assessment configuration |
| `bayesian_example.json` | Probabilistic forecast configuration |
| `legal_example.json` | Legal research configuration |
| `enhancements_example.json` | Product enhancement configuration |

Usage:
```bash
cat modules/examples/osint_example.json | python run_module.py osint
```

## Error Handling

All runners follow consistent error handling:

### Success Response
```json
{
  "status": "ok",
  "data": {...},
  "logs": [...]
}
```

### Error Response
```json
{
  "status": "error",
  "message": "Descriptive error message",
  "context": {...}
}
```

### Exit Codes
- `0` - Success
- `1` - Error (invalid input, execution failure)

## Best Practices

1. **Use Demo Mode for Testing**
   ```bash
   python run_module.py osint --demo --verbose
   ```

2. **Validate JSON Before Piping**
   ```bash
   cat config.json | jq . && cat config.json | python run_module.py osint
   ```

3. **Capture Output for Analysis**
   ```bash
   python run_module.py bayesian --demo > forecast.json
   ```

4. **Use Custom Output Directories**
   ```bash
   python run_module.py legal --demo --output-dir ./client_reports
   ```

5. **Run Health Checks Before Production Use**
   ```bash
   python run_module.py --health-check | jq '.[] | select(.status=="error")'
   ```

## Troubleshooting

### Module Import Errors

**Problem:** `ImportError: No module named 'modules.osint'`

**Solution:**
```bash
export PYTHONPATH="${PYTHONPATH}:/path/to/TheGAVLSuite"
cd TheGAVLSuite/modules
python run_module.py --list
```

### Missing Dependencies

**Problem:** Module health check shows errors

**Solution:**
```bash
# Check requirements
cat modules/osint/requirements.txt

# Install dependencies
pip install -r modules/osint/requirements.txt
```

### JSON Parse Errors

**Problem:** `Invalid JSON payload`

**Solution:**
```bash
# Validate JSON first
echo '{"subject": "test.com"}' | jq .

# Then pipe to runner
echo '{"subject": "test.com"}' | python modules/osint/runner.py
```

### Permission Errors

**Problem:** Cannot write to output directory

**Solution:**
```bash
# Use custom output directory
mkdir -p /tmp/gavl_reports
python run_module.py osint --demo --output-dir /tmp/gavl_reports
```

## Integration with Ai|oS

To integrate meta-agent modules with Ai|oS runtime:

```python
from modules.osint import runner

def osint_analysis_action(ctx: ExecutionContext) -> ActionResult:
    """Ai|oS action for OSINT analysis."""
    target = ctx.environment.get("OSINT_TARGET", "example.com")

    # Run OSINT module
    import json
    from io import StringIO
    import sys

    payload = {"subject": target, "options": {}}
    old_stdin = sys.stdin
    sys.stdin = StringIO(json.dumps(payload))

    try:
        exit_code = runner.main([])
        if exit_code == 0:
            return ActionResult(
                success=True,
                message=f"OSINT analysis complete for {target}",
                payload={"target": target}
            )
    finally:
        sys.stdin = old_stdin

    return ActionResult(
        success=False,
        message="OSINT analysis failed"
    )
```

## Support

For issues or questions:

1. Check module-specific README: `modules/<module>/README.md`
2. Review test cases: `modules/tests/test_<module>_runner.py`
3. Run health check: `python run_module.py --health-check`
4. Check example configs: `modules/examples/<module>_example.json`

## Version History

- **v1.0.0** (2025-10-14) - Initial release with unified runner framework
  - All 5 modules operational with consistent CLI
  - Comprehensive integration test suite
  - Master runner script with health checks
  - Example configurations for all modules

---

**Patent Pending** - This framework and its implementations are subject to patent protection.
