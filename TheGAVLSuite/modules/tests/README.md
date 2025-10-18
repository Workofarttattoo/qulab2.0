# GAVL Suite Meta-Agent Integration Test Suite

**Copyright (c) 2025 Joshua Hendricks Cole (DBA: Corporation of Light). All Rights Reserved. PATENT PENDING.**

## Overview

Comprehensive integration test suite for all GAVL Suite meta-agent modules. Tests verify end-to-end functionality, error handling, and proper integration with the runner framework.

## Installation

```bash
cd TheGAVLSuite/modules/tests
pip install -r requirements.txt
```

## Running Tests

### All Tests

```bash
cd TheGAVLSuite/modules
pytest tests/ -v
```

### Specific Module Tests

```bash
# OSINT module
pytest tests/test_osint_runner.py -v

# HELLFIRE module
pytest tests/test_hellfire_runner.py -v

# Bayesian Sophiarch module
pytest tests/test_bayesian_runner.py -v

# Corporate Legal module
pytest tests/test_legal_runner.py -v

# Chief Enhancements module
pytest tests/test_enhancements_runner.py -v
```

### With Coverage Report

```bash
pytest tests/ --cov=modules --cov-report=html
open htmlcov/index.html  # View coverage report
```

### Verbose Output

```bash
pytest tests/ -vv --tb=short
```

## Test Structure

Each module has its own test file with consistent test cases:

### Test Files

- `conftest.py` - Shared fixtures and utilities
- `test_osint_runner.py` - OSINT module tests
- `test_hellfire_runner.py` - HELLFIRE module tests
- `test_bayesian_runner.py` - Bayesian Sophiarch tests
- `test_legal_runner.py` - Corporate Legal tests
- `test_enhancements_runner.py` - Chief Enhancements tests

### Standard Test Cases

Each module test file includes:

1. **Health Check Test** - Verifies module health check function
2. **Demo Mode Test** - Tests demo mode execution
3. **Verbose Mode Test** - Tests verbose logging output
4. **Stdin Mode Test** - Tests JSON stdin input parsing
5. **Missing Input Error Test** - Tests required field validation
6. **Invalid JSON Error Test** - Tests JSON parsing error handling
7. **Custom Output Dir Test** - Tests custom output directory
8. **Exception Handling Test** - Tests exception recovery
9. **Help Flag Test** - Tests help documentation display

## Fixtures

### Shared Fixtures (conftest.py)

#### temp_output_dir
Provides temporary directory for test outputs.

```python
def test_with_temp_dir(temp_output_dir):
    output_file = temp_output_dir / "result.json"
    # ... test code
```

#### mock_subprocess
Mocks subprocess calls to prevent external command execution.

```python
def test_with_mock_subprocess(mock_subprocess):
    mock_subprocess.return_value.returncode = 0
    # ... test code
```

#### mock_requests
Mocks HTTP requests library.

```python
def test_with_mock_requests(mock_requests):
    mock_requests["get"].return_value.status_code = 200
    # ... test code
```

#### Sample Payloads

Pre-built test payloads for each module:

- `sample_osint_payload` - OSINT test data
- `sample_hellfire_payload` - HELLFIRE test data
- `sample_bayesian_payload` - Bayesian test data
- `sample_legal_payload` - Legal test data
- `sample_enhancements_payload` - Enhancements test data

```python
def test_with_sample_data(sample_osint_payload):
    assert sample_osint_payload["subject"] == "test-target.example.com"
```

### Assertion Helpers

#### assert_valid_status_response(response)
Validates response structure and status field.

```python
from modules.tests.conftest import assert_valid_status_response

def test_response_format():
    response = {"status": "ok", "logs": []}
    assert_valid_status_response(response)
```

#### assert_health_check_format(health)
Validates health check response structure.

```python
from modules.tests.conftest import assert_health_check_format

def test_health_format():
    health = {"tool": "osint", "status": "ok", "summary": "...", "details": {}}
    assert_health_check_format(health)
```

## Writing New Tests

### Test Class Pattern

```python
class TestMyModuleRunner:
    """Test suite for My Module runner."""

    def test_health_check(self):
        """Test health check function."""
        health = runner.health_check()
        assert_health_check_format(health)
        assert health["tool"] == "my_module"

    def test_demo_mode(self, temp_output_dir, capsys):
        """Test demo mode execution."""
        with patch("modules.my_module.meta_agent.MyAgent.run") as mock_run:
            # Setup mock
            mock_ctx = MyContext(...)
            mock_run.return_value = mock_ctx

            # Run
            exit_code = runner.main(["--demo"])
            captured = capsys.readouterr()

            # Assert
            assert exit_code == 0
            output = json.loads(captured.out)
            assert_valid_status_response(output)

    # ... more tests
```

### Mocking Meta-Agent Execution

```python
from unittest.mock import patch

def test_with_mock(self):
    with patch("modules.osint.meta_agent.OsintMetaAgent.run") as mock_run:
        # Setup mock return value
        from modules.osint.meta_agent import TaskContext
        mock_ctx = TaskContext(
            subject="test.com",
            evidence={"data": "test"}
        )
        mock_ctx.logs.append("[info] Test log")
        mock_run.return_value = mock_ctx

        # Run test
        exit_code = runner.main(["--demo"])
        assert exit_code == 0
```

### Testing Error Conditions

```python
def test_error_handling(self, capsys):
    """Test exception handling."""
    with patch("modules.osint.meta_agent.OsintMetaAgent.run") as mock_run:
        mock_run.side_effect = Exception("Test error")

        exit_code = runner.main(["--demo"])
        captured = capsys.readouterr()

        assert exit_code == 1
        output = json.loads(captured.out)
        assert output["status"] == "error"
        assert "Test error" in output["message"]
```

## Test Coverage Goals

Target coverage levels:

- **Overall Coverage:** >90%
- **Runner Functions:** 100%
- **Health Checks:** 100%
- **Error Handling:** >95%
- **CLI Argument Parsing:** 100%

## Continuous Integration

### GitHub Actions Example

```yaml
name: Test Meta-Agent Modules

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
    - uses: actions/checkout@v2

    - name: Set up Python
      uses: actions/setup-python@v2
      with:
        python-version: '3.10'

    - name: Install dependencies
      run: |
        cd TheGAVLSuite/modules
        pip install -r tests/requirements.txt

    - name: Run tests with coverage
      run: |
        cd TheGAVLSuite/modules
        pytest tests/ --cov=modules --cov-report=xml

    - name: Upload coverage
      uses: codecov/codecov-action@v2
      with:
        file: ./coverage.xml
```

## Troubleshooting

### Import Errors

**Problem:** `ModuleNotFoundError: No module named 'modules'`

**Solution:**
```bash
# Run from modules directory
cd TheGAVLSuite/modules
pytest tests/

# Or set PYTHONPATH
export PYTHONPATH="${PYTHONPATH}:/path/to/TheGAVLSuite"
```

### Fixture Not Found

**Problem:** `fixture 'sample_osint_payload' not found`

**Solution:** Ensure `conftest.py` is in the tests directory and pytest is discovering it.

```bash
pytest --fixtures tests/  # List available fixtures
```

### Mock Not Working

**Problem:** Real functions being called instead of mocks

**Solution:** Check import paths in patch decorators match actual module structure.

```python
# Correct
@patch("modules.osint.meta_agent.OsintMetaAgent.run")

# Incorrect
@patch("osint.meta_agent.OsintMetaAgent.run")
```

### Test Isolation Issues

**Problem:** Tests affecting each other

**Solution:** Use fixtures to ensure clean state:

```python
@pytest.fixture(autouse=True)
def reset_state():
    """Reset state before each test."""
    # Reset any global state
    yield
    # Cleanup after test
```

## Best Practices

1. **Mock External Dependencies**
   - Always mock HTTP requests, subprocess calls, file I/O
   - Use fixtures for consistent mocking

2. **Test Both Success and Failure Paths**
   - Test happy path and error conditions
   - Verify proper error messages and exit codes

3. **Use Descriptive Test Names**
   - Test names should describe what is being tested
   - Follow pattern: `test_<feature>_<scenario>`

4. **Keep Tests Fast**
   - Mock slow operations
   - Use small test datasets
   - Run expensive tests separately

5. **Assert Expected Behavior**
   - Check exit codes
   - Validate output structure
   - Verify error messages
   - Test side effects

## Running Specific Test Categories

### Quick Smoke Tests

```bash
pytest tests/ -k "health_check or demo_mode"
```

### Error Handling Tests

```bash
pytest tests/ -k "error"
```

### Verbose Tests

```bash
pytest tests/ -k "verbose"
```

### Integration Tests Only

```bash
pytest tests/ -m integration  # If marked with @pytest.mark.integration
```

## Performance Testing

To add performance benchmarks:

```python
import time

def test_performance(benchmark):
    """Benchmark module execution."""
    def run_module():
        return runner.main(["--demo"])

    result = benchmark(run_module)
    assert result == 0
```

Run with:
```bash
pytest tests/ --benchmark-only
```

## Documentation

Each test should have a docstring explaining:
- What is being tested
- Expected behavior
- Any special setup or teardown

Example:
```python
def test_custom_output_dir(self, temp_output_dir, capsys):
    """Test custom output directory functionality.

    Verifies that the --output-dir flag correctly sets
    the output directory for generated reports.
    """
    # ... test implementation
```

## Version History

- **v1.0.0** (2025-10-14) - Initial test suite
  - 40+ integration tests across 5 modules
  - Comprehensive fixture library
  - Mock framework for external dependencies
  - Helper functions for assertions

---

**Patent Pending** - This test framework is part of the GAVL Suite patent application.
