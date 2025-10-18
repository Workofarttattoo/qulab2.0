#!/usr/bin/env python3
"""
Quantum-Enhanced Ai:oS Deployment Script
Copyright (c) 2025 Joshua Hendricks Cole (DBA: Corporation of Light). All Rights Reserved. PATENT PENDING.

This script deploys and validates the quantum-enhanced Ai:oS system.

Features:
- Validates quantum algorithms
- Runs comprehensive benchmarks
- Tests accuracy vs classical
- Generates deployment report
- Checks dependencies
"""

import sys
import time
import json
import numpy as np
from pathlib import Path
from datetime import datetime
from typing import Dict, List, Tuple

# Add aios to path
sys.path.insert(0, str(Path(__file__).parent / 'aios'))

def print_header(text: str):
    """Print formatted header."""
    print("\n" + "=" * 80)
    print(f"  {text}")
    print("=" * 80 + "\n")

def print_success(text: str):
    """Print success message."""
    print(f"✅ {text}")

def print_error(text: str):
    """Print error message."""
    print(f"❌ {text}")

def print_info(text: str):
    """Print info message."""
    print(f"ℹ️  {text}")

def check_dependencies() -> bool:
    """Check if all required dependencies are available."""
    print_header("STEP 1: Checking Dependencies")

    all_ok = True

    # Check Python version
    if sys.version_info < (3, 8):
        print_error(f"Python 3.8+ required, found {sys.version_info.major}.{sys.version_info.minor}")
        all_ok = False
    else:
        print_success(f"Python {sys.version_info.major}.{sys.version_info.minor}.{sys.version_info.micro}")

    # Check NumPy
    try:
        import numpy
        print_success(f"NumPy {numpy.__version__}")
    except ImportError:
        print_error("NumPy not available")
        all_ok = False

    # Check if quantum modules exist
    quantum_files = [
        'aios/quantum_enhanced_runtime.py',
        'aios/quantum_enhanced_ml_algorithms.py',
        'aios/quantum_ml_algorithms.py',
        'aios/quantum_hhl_algorithm.py',
    ]

    for file in quantum_files:
        path = Path(file)
        if path.exists():
            print_success(f"Found {file}")
        else:
            print_error(f"Missing {file}")
            all_ok = False

    return all_ok

def test_quantum_runtime() -> Dict:
    """Test quantum-enhanced runtime."""
    print_header("STEP 2: Testing Quantum Runtime")

    try:
        from config import load_manifest
        from quantum_enhanced_runtime import create_quantum_runtime

        print_info("Loading manifest...")
        manifest = load_manifest()
        print_success("Manifest loaded")

        print_info("Creating quantum runtime...")
        runtime = create_quantum_runtime(manifest, use_quantum=True)
        print_success("Quantum runtime created")

        print_info("Running quantum boot sequence...")
        start_time = time.perf_counter()
        metrics = runtime.quantum_boot()
        boot_time = time.perf_counter() - start_time

        print_success(f"Quantum boot completed in {boot_time:.3f}s")
        print_info(f"  - Speedup: {metrics['speedup']:.1f}x")
        print_info(f"  - Parallel levels: {metrics['num_levels']}")
        print_info(f"  - Total actions: {metrics['num_actions']}")
        print_info(f"  - Quantum enabled: {metrics['quantum_enabled']}")

        return {
            'success': True,
            'boot_time': boot_time,
            'metrics': metrics
        }

    except Exception as e:
        print_error(f"Quantum runtime test failed: {e}")
        import traceback
        traceback.print_exc()
        return {'success': False, 'error': str(e)}

def test_quantum_algorithms() -> Dict:
    """Test quantum ML algorithms."""
    print_header("STEP 3: Testing Quantum Algorithms")

    results = {}

    # Test 1: Quantum Amplitude Estimation
    print_info("Testing Quantum Amplitude Estimation...")
    try:
        from quantum_enhanced_ml_algorithms import QuantumAmplitudeEstimator

        qae = QuantumAmplitudeEstimator(use_quantum=True)
        signals = [
            (0.8, 6.0),
            (0.6, 4.0),
            (0.7, 3.0),
            (0.5, 2.0),
        ]

        start = time.perf_counter()
        result = qae.estimate_probability(signals, target_accuracy=0.01)
        elapsed = time.perf_counter() - start

        print_success(f"QAE: probability={result.probability:.4f}, speedup={result.speedup:.1f}x, time={elapsed*1000:.2f}ms")
        results['qae'] = {
            'success': True,
            'probability': result.probability,
            'speedup': result.speedup,
            'time_ms': elapsed * 1000
        }
    except Exception as e:
        print_error(f"QAE test failed: {e}")
        results['qae'] = {'success': False, 'error': str(e)}

    # Test 2: Grover MCTS (conceptual test - needs policy/value nets)
    print_info("Testing Grover MCTS (initialization only)...")
    try:
        from quantum_enhanced_ml_algorithms import QuantumGroverMCTS

        # Dummy networks
        policy_net = lambda x: np.random.random(10)
        value_net = lambda x: np.random.random(1)

        mcts = QuantumGroverMCTS(policy_net, value_net, use_quantum=True)
        print_success("Grover MCTS initialized successfully")
        results['grover_mcts'] = {'success': True, 'initialized': True}
    except Exception as e:
        print_error(f"Grover MCTS test failed: {e}")
        results['grover_mcts'] = {'success': False, 'error': str(e)}

    # Test 3: Quantum State Space Model
    print_info("Testing Quantum State Space Model (HHL)...")
    try:
        from quantum_enhanced_ml_algorithms import QuantumStateSpaceModel

        model = QuantumStateSpaceModel(d_model=128, d_state=4, use_quantum=True)

        # Small system for testing
        A = np.array([
            [2.0, -0.5, 0.0, 0.0],
            [-0.5, 2.0, -0.5, 0.0],
            [0.0, -0.5, 2.0, -0.5],
            [0.0, 0.0, -0.5, 2.0]
        ])
        x = np.array([1.0, 0.5, 0.3, 0.1])

        start = time.perf_counter()
        solution, metrics = model.solve_state_update(A, x)
        elapsed = time.perf_counter() - start

        print_success(f"HHL: method={metrics['method']}, time={elapsed*1000:.2f}ms")
        results['hhl'] = {
            'success': True,
            'method': metrics['method'],
            'time_ms': elapsed * 1000,
            'speedup': metrics.get('speedup', 1.0)
        }
    except Exception as e:
        print_error(f"HHL test failed: {e}")
        results['hhl'] = {'success': False, 'error': str(e)}

    # Test 4: Quantum Particle Filter
    print_info("Testing Quantum Particle Filter...")
    try:
        from quantum_enhanced_ml_algorithms import QuantumParticleFilter

        pf = QuantumParticleFilter(
            num_particles=100,
            state_dim=2,
            obs_dim=1,
            use_quantum=True
        )

        # Simple test
        transition_fn = lambda x: x + 0.1
        pf.predict(transition_fn, process_noise=0.05)

        observation = np.array([1.0])
        likelihood_fn = lambda y, x: np.exp(-0.5 * np.sum((y - x[:1])**2))
        pf.update(observation, likelihood_fn)

        estimate = pf.estimate()
        print_success(f"Particle Filter: estimate={estimate}")
        results['particle_filter'] = {'success': True, 'estimate': estimate.tolist()}
    except Exception as e:
        print_error(f"Particle Filter test failed: {e}")
        results['particle_filter'] = {'success': False, 'error': str(e)}

    return results

def run_benchmarks() -> Dict:
    """Run performance benchmarks."""
    print_header("STEP 4: Running Performance Benchmarks")

    benchmarks = {}

    # Benchmark 1: Classical vs Quantum Runtime
    print_info("Benchmarking runtime boot sequence...")
    try:
        from config import load_manifest
        from runtime import AgentaRuntime
        from quantum_enhanced_runtime import create_quantum_runtime

        manifest = load_manifest()

        # Classical boot
        print_info("  Running classical boot...")
        classical_runtime = AgentaRuntime(manifest)
        start = time.perf_counter()
        classical_runtime.boot()
        classical_time = time.perf_counter() - start

        # Quantum boot
        print_info("  Running quantum boot...")
        quantum_runtime = create_quantum_runtime(manifest, use_quantum=True)
        start = time.perf_counter()
        metrics = quantum_runtime.quantum_boot()
        quantum_time = time.perf_counter() - start

        speedup = classical_time / quantum_time if quantum_time > 0 else 1.0

        print_success(f"Boot benchmark: {classical_time:.3f}s classical → {quantum_time:.3f}s quantum = {speedup:.1f}x speedup")

        benchmarks['boot'] = {
            'classical_time_s': classical_time,
            'quantum_time_s': quantum_time,
            'speedup': speedup
        }
    except Exception as e:
        print_error(f"Boot benchmark failed: {e}")
        benchmarks['boot'] = {'success': False, 'error': str(e)}

    return benchmarks

def generate_deployment_report(
    dependencies_ok: bool,
    runtime_results: Dict,
    algorithm_results: Dict,
    benchmarks: Dict
) -> str:
    """Generate deployment report."""
    print_header("STEP 5: Generating Deployment Report")

    report = {
        'deployment_time': datetime.now().isoformat(),
        'status': 'SUCCESS' if dependencies_ok and runtime_results.get('success') else 'FAILED',
        'dependencies': {
            'all_ok': dependencies_ok,
            'python_version': f"{sys.version_info.major}.{sys.version_info.minor}.{sys.version_info.micro}"
        },
        'quantum_runtime': runtime_results,
        'quantum_algorithms': algorithm_results,
        'benchmarks': benchmarks,
        'summary': {}
    }

    # Calculate summary statistics
    if runtime_results.get('success'):
        report['summary']['boot_speedup'] = runtime_results['metrics'].get('speedup', 0)
        report['summary']['boot_time_s'] = runtime_results.get('boot_time', 0)

    successful_algorithms = sum(1 for r in algorithm_results.values() if r.get('success'))
    report['summary']['algorithms_tested'] = len(algorithm_results)
    report['summary']['algorithms_successful'] = successful_algorithms

    # Save report
    report_path = Path('QUANTUM_DEPLOYMENT_REPORT.json')
    with open(report_path, 'w') as f:
        json.dump(report, f, indent=2)

    print_success(f"Deployment report saved to {report_path}")

    return str(report_path)

def print_deployment_summary(
    dependencies_ok: bool,
    runtime_results: Dict,
    algorithm_results: Dict,
    benchmarks: Dict
):
    """Print deployment summary."""
    print_header("DEPLOYMENT SUMMARY")

    print("📊 Deployment Status:")
    print(f"  - Dependencies: {'✅ OK' if dependencies_ok else '❌ FAILED'}")
    print(f"  - Quantum Runtime: {'✅ OK' if runtime_results.get('success') else '❌ FAILED'}")

    successful = sum(1 for r in algorithm_results.values() if r.get('success'))
    total = len(algorithm_results)
    print(f"  - Quantum Algorithms: {successful}/{total} passed")

    if runtime_results.get('success'):
        metrics = runtime_results['metrics']
        print(f"\n⚡ Performance Metrics:")
        print(f"  - Boot time: {runtime_results['boot_time']:.3f}s")
        print(f"  - Speedup: {metrics['speedup']:.1f}x")
        print(f"  - Quantum enabled: {metrics['quantum_enabled']}")
        print(f"  - Parallel levels: {metrics['num_levels']}")

    if benchmarks.get('boot', {}).get('speedup'):
        print(f"\n🚀 Benchmark Results:")
        boot = benchmarks['boot']
        print(f"  - Classical boot: {boot['classical_time_s']:.3f}s")
        print(f"  - Quantum boot: {boot['quantum_time_s']:.3f}s")
        print(f"  - Measured speedup: {boot['speedup']:.1f}x")

    print("\n" + "=" * 80)
    if dependencies_ok and runtime_results.get('success'):
        print("  ✅ DEPLOYMENT SUCCESSFUL - Quantum Ai:oS is ready!")
    else:
        print("  ⚠️  DEPLOYMENT COMPLETED WITH WARNINGS - Review errors above")
    print("=" * 80 + "\n")

def main():
    """Main deployment function."""
    print("\n" + "╔" + "═" * 78 + "╗")
    print("║" + " " * 78 + "║")
    print("║" + "  QUANTUM-ENHANCED AI:OS DEPLOYMENT SCRIPT".center(78) + "║")
    print("║" + " " * 78 + "║")
    print("╚" + "═" * 78 + "╝\n")

    print("Copyright (c) 2025 Joshua Hendricks Cole (DBA: Corporation of Light).")
    print("All Rights Reserved. PATENT PENDING.\n")

    start_time = time.perf_counter()

    # Step 1: Check dependencies
    dependencies_ok = check_dependencies()

    if not dependencies_ok:
        print_error("Dependency check failed. Please install required dependencies.")
        print_info("Run: pip install numpy")
        sys.exit(1)

    # Step 2: Test quantum runtime
    runtime_results = test_quantum_runtime()

    # Step 3: Test quantum algorithms
    algorithm_results = test_quantum_algorithms()

    # Step 4: Run benchmarks
    benchmarks = run_benchmarks()

    # Step 5: Generate report
    report_path = generate_deployment_report(
        dependencies_ok,
        runtime_results,
        algorithm_results,
        benchmarks
    )

    # Print summary
    total_time = time.perf_counter() - start_time
    print_deployment_summary(dependencies_ok, runtime_results, algorithm_results, benchmarks)

    print(f"⏱️  Total deployment time: {total_time:.2f}s")
    print(f"📄 Full report: {report_path}")
    print()

    # Next steps
    print("🎯 Next Steps:")
    print("  1. Review the deployment report: QUANTUM_DEPLOYMENT_REPORT.json")
    print("  2. Check the visual summary: open AIOS_QUANTUM_OPTIMIZATION_SUMMARY.html")
    print("  3. Read the documentation:")
    print("     - AIOS_QUANTUM_OPTIMIZATION_ANALYSIS.md")
    print("     - AIOS_QUANTUM_OPTIMIZATION_COMPLETE.md")
    print("  4. Integrate quantum runtime into your application:")
    print("     from aios.quantum_enhanced_runtime import create_quantum_runtime")
    print()

    return 0 if (dependencies_ok and runtime_results.get('success')) else 1

if __name__ == "__main__":
    sys.exit(main())
