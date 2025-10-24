#!/usr/bin/env python
"""
Standalone tests for OpenAGI Load Testing Framework.
No pytest dependencies - can run directly.

Copyright (c) 2025 Joshua Hendricks Cole (DBA: Corporation of Light).
All Rights Reserved. PATENT PENDING.
"""

import sys
import tempfile
import time
from pathlib import Path

try:
    from aios.openagi_load_testing import (
        LoadTestOrchestrator,
        PerformanceMetrics,
        LoadTestResult,
    )
except ImportError as e:
    print(f"Error importing load testing module: {e}")
    sys.exit(1)


def test_orchestrator_initialization():
    """Test load test orchestrator initialization."""
    temp_dir = tempfile.TemporaryDirectory()
    orchestrator = LoadTestOrchestrator(Path(temp_dir.name))

    assert orchestrator is not None
    assert orchestrator.storage_path.exists()
    assert orchestrator.test_results == []
    print("✓ test_orchestrator_initialization passed")


def test_performance_metrics_creation():
    """Test performance metrics creation."""
    metrics = PerformanceMetrics(
        operation="test_op",
        total_operations=100,
        successful_operations=95,
        failed_operations=5,
        total_time_seconds=1.0,
        min_time_ms=5.0,
        max_time_ms=50.0,
        avg_time_ms=10.0,
        operations_per_second=100.0,
        memory_used_mb=10.5,
        memory_peak_mb=15.0,
        error_rate=0.05,
    )

    assert metrics.operation == "test_op"
    assert metrics.total_operations == 100
    assert metrics.successful_operations == 95
    assert metrics.error_rate == 0.05
    assert metrics.operations_per_second == 100.0

    # Test to_dict
    d = metrics.to_dict()
    assert d["operation"] == "test_op"
    assert d["total_operations"] == 100
    print("✓ test_performance_metrics_creation passed")


def test_load_test_result_creation():
    """Test load test result creation."""
    metrics = [
        PerformanceMetrics(
            operation="test_op",
            total_operations=100,
            successful_operations=100,
            failed_operations=0,
            total_time_seconds=1.0,
            min_time_ms=5.0,
            max_time_ms=50.0,
            avg_time_ms=10.0,
            operations_per_second=100.0,
            memory_used_mb=10.0,
            memory_peak_mb=15.0,
            error_rate=0.0,
        )
    ]

    result = LoadTestResult(
        test_name="Test Suite",
        timestamp="2025-10-24T00:00:00",
        duration_seconds=10.0,
        metrics=metrics,
        system_health={"health": "good"},
        bottlenecks=[],
        recommendations=["All good"],
    )

    assert result.test_name == "Test Suite"
    assert len(result.metrics) == 1
    assert result.duration_seconds == 10.0
    print("✓ test_load_test_result_creation passed")


def test_approval_workflow_load_test():
    """Test approval workflow load test."""
    temp_dir = tempfile.TemporaryDirectory()
    orchestrator = LoadTestOrchestrator(Path(temp_dir.name))

    # Run small test
    metrics = orchestrator.run_approval_workflow_load_test(
        num_concurrent=5,
        operations_per_thread=2,
    )

    assert metrics.operation is not None
    assert metrics.total_operations == 10  # 5 * 2
    assert metrics.avg_time_ms >= 0
    assert metrics.memory_peak_mb >= 0
    print("✓ test_approval_workflow_load_test passed")


def test_forensic_mode_load_test():
    """Test forensic mode load test."""
    temp_dir = tempfile.TemporaryDirectory()
    orchestrator = LoadTestOrchestrator(Path(temp_dir.name))

    # Run small test
    metrics = orchestrator.run_forensic_mode_load_test(
        num_concurrent=5,
        operations_per_thread=2,
        workflow_size=3,
    )

    assert metrics.operation is not None
    assert metrics.total_operations == 10  # 5 * 2
    assert metrics.avg_time_ms >= 0
    assert metrics.memory_peak_mb >= 0
    print("✓ test_forensic_mode_load_test passed")


def test_integrated_system_test():
    """Test integrated system test."""
    temp_dir = tempfile.TemporaryDirectory()
    orchestrator = LoadTestOrchestrator(Path(temp_dir.name))

    # Run small test
    metrics = orchestrator.run_integrated_system_test(num_requests=5)

    assert metrics.operation is not None
    assert metrics.total_operations == 5
    assert metrics.avg_time_ms >= 0
    print("✓ test_integrated_system_test passed")


def test_storage_scalability_test():
    """Test storage scalability test."""
    temp_dir = tempfile.TemporaryDirectory()
    orchestrator = LoadTestOrchestrator(Path(temp_dir.name))

    # Run small test
    metrics = orchestrator.run_storage_scalability_test(num_records=100)

    assert metrics.operation is not None
    assert metrics.total_operations == 100
    assert metrics.avg_time_ms >= 0
    print("✓ test_storage_scalability_test passed")


def test_analyze_results():
    """Test results analysis."""
    temp_dir = tempfile.TemporaryDirectory()
    orchestrator = LoadTestOrchestrator(Path(temp_dir.name))

    metrics = [
        PerformanceMetrics(
            operation="test_op",
            total_operations=100,
            successful_operations=100,
            failed_operations=0,
            total_time_seconds=1.0,
            min_time_ms=5.0,
            max_time_ms=50.0,
            avg_time_ms=10.0,
            operations_per_second=100.0,
            memory_used_mb=10.0,
            memory_peak_mb=15.0,
            error_rate=0.0,
        )
    ]

    health, bottlenecks, recommendations = orchestrator.analyze_results(metrics)

    assert "tests_run" in health
    assert health["tests_run"] == 1
    assert health["overall_error_rate"] == 0.0
    assert len(recommendations) > 0
    print("✓ test_analyze_results passed")


def test_high_error_rate_detection():
    """Test detection of high error rates."""
    temp_dir = tempfile.TemporaryDirectory()
    orchestrator = LoadTestOrchestrator(Path(temp_dir.name))

    metrics = [
        PerformanceMetrics(
            operation="problematic_op",
            total_operations=100,
            successful_operations=90,
            failed_operations=10,
            total_time_seconds=1.0,
            min_time_ms=5.0,
            max_time_ms=50.0,
            avg_time_ms=10.0,
            operations_per_second=100.0,
            memory_used_mb=10.0,
            memory_peak_mb=15.0,
            error_rate=0.10,  # 10% error rate
        )
    ]

    health, bottlenecks, recommendations = orchestrator.analyze_results(metrics)

    # Should detect high error rate
    assert any("error rate" in b.lower() for b in bottlenecks)
    print("✓ test_high_error_rate_detection passed")


def test_high_latency_detection():
    """Test detection of high latency."""
    temp_dir = tempfile.TemporaryDirectory()
    orchestrator = LoadTestOrchestrator(Path(temp_dir.name))

    metrics = [
        PerformanceMetrics(
            operation="slow_op",
            total_operations=100,
            successful_operations=100,
            failed_operations=0,
            total_time_seconds=10.0,
            min_time_ms=50.0,
            max_time_ms=500.0,
            avg_time_ms=150.0,  # High latency
            operations_per_second=10.0,
            memory_used_mb=10.0,
            memory_peak_mb=15.0,
            error_rate=0.0,
        )
    ]

    health, bottlenecks, recommendations = orchestrator.analyze_results(metrics)

    # Should detect high latency
    assert any("latency" in b.lower() for b in bottlenecks)
    print("✓ test_high_latency_detection passed")


def test_high_memory_detection():
    """Test detection of high memory usage."""
    temp_dir = tempfile.TemporaryDirectory()
    orchestrator = LoadTestOrchestrator(Path(temp_dir.name))

    metrics = [
        PerformanceMetrics(
            operation="memory_op",
            total_operations=100,
            successful_operations=100,
            failed_operations=0,
            total_time_seconds=1.0,
            min_time_ms=5.0,
            max_time_ms=50.0,
            avg_time_ms=10.0,
            operations_per_second=100.0,
            memory_used_mb=600.0,
            memory_peak_mb=800.0,  # High memory
            error_rate=0.0,
        )
    ]

    health, bottlenecks, recommendations = orchestrator.analyze_results(metrics)

    # Should detect high memory
    assert any("memory" in b.lower() for b in bottlenecks)
    print("✓ test_high_memory_detection passed")


def test_save_results():
    """Test saving test results."""
    temp_dir = tempfile.TemporaryDirectory()
    orchestrator = LoadTestOrchestrator(Path(temp_dir.name))

    metrics = [
        PerformanceMetrics(
            operation="test_op",
            total_operations=100,
            successful_operations=100,
            failed_operations=0,
            total_time_seconds=1.0,
            min_time_ms=5.0,
            max_time_ms=50.0,
            avg_time_ms=10.0,
            operations_per_second=100.0,
            memory_used_mb=10.0,
            memory_peak_mb=15.0,
            error_rate=0.0,
        )
    ]

    result = LoadTestResult(
        test_name="Test Suite",
        timestamp="2025-10-24T00:00:00",
        duration_seconds=1.0,
        metrics=metrics,
        system_health={"health": "good"},
        bottlenecks=[],
        recommendations=["All good"],
    )

    orchestrator.test_results.append(result)

    # Save to temp file
    output_path = Path(temp_dir.name) / "results.json"
    saved_path = orchestrator.save_results(output_path)

    assert saved_path.exists()
    assert output_path.exists()

    # Verify JSON is valid
    import json
    with open(saved_path, 'r') as f:
        data = json.load(f)
    assert len(data) == 1
    assert data[0]["test_name"] == "Test Suite"

    print("✓ test_save_results passed")


def test_complete_load_test():
    """Test complete load test suite."""
    temp_dir = tempfile.TemporaryDirectory()
    orchestrator = LoadTestOrchestrator(Path(temp_dir.name))

    # Run complete test
    result = orchestrator.run_complete_load_test()

    assert result is not None
    assert result.test_name is not None
    assert len(result.metrics) == 4  # Should have 4 test metrics
    assert result.duration_seconds > 0
    assert "tests_run" in result.system_health
    assert "bottlenecks" in result.__dict__
    assert "recommendations" in result.__dict__

    print("✓ test_complete_load_test passed")


def test_results_summary_generation():
    """Test results summary generation."""
    temp_dir = tempfile.TemporaryDirectory()
    orchestrator = LoadTestOrchestrator(Path(temp_dir.name))

    metrics = [
        PerformanceMetrics(
            operation="test_op",
            total_operations=100,
            successful_operations=100,
            failed_operations=0,
            total_time_seconds=1.0,
            min_time_ms=5.0,
            max_time_ms=50.0,
            avg_time_ms=10.0,
            operations_per_second=100.0,
            memory_used_mb=10.0,
            memory_peak_mb=15.0,
            error_rate=0.0,
        )
    ]

    result = LoadTestResult(
        test_name="Test Suite",
        timestamp="2025-10-24T00:00:00",
        duration_seconds=1.0,
        metrics=metrics,
        system_health={"health": "good"},
        bottlenecks=[],
        recommendations=["All good"],
    )

    orchestrator.test_results.append(result)

    # Should not raise exception
    orchestrator.print_summary()
    print("✓ test_results_summary_generation passed")


def run_all_tests():
    """Run all tests."""
    tests = [
        test_orchestrator_initialization,
        test_performance_metrics_creation,
        test_load_test_result_creation,
        test_approval_workflow_load_test,
        test_forensic_mode_load_test,
        test_integrated_system_test,
        test_storage_scalability_test,
        test_analyze_results,
        test_high_error_rate_detection,
        test_high_latency_detection,
        test_high_memory_detection,
        test_save_results,
        test_complete_load_test,
        test_results_summary_generation,
    ]

    print("=" * 70)
    print("Running OpenAGI Load Testing Framework Tests...")
    print("=" * 70)

    passed = 0
    failed = 0

    for test in tests:
        try:
            test()
            passed += 1
        except AssertionError as e:
            print(f"✗ {test.__name__} failed: {e}")
            failed += 1
        except Exception as e:
            print(f"✗ {test.__name__} error: {e}")
            import traceback
            traceback.print_exc()
            failed += 1

    print("=" * 70)
    print(f"Results: {passed} passed, {failed} failed")
    print("=" * 70)

    return failed == 0


if __name__ == "__main__":
    success = run_all_tests()
    sys.exit(0 if success else 1)
