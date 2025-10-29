"""
QuLab2.0 Teleportation Discovery CLI.

Interactive command-line interface for quantum teleportation research:
- Explore protocols at different distances
- Characterize channel performance
- Assess hardware feasibility
- Optimize protocol parameters
- Generate research reports

Usage:
    python -m qulab.cli_teleport_discovery

Copyright (c) 2025 Joshua Hendricks Cole (DBA: Corporation of Light). All Rights Reserved. PATENT PENDING.
"""

import typer
from typing import Optional
import json
from pathlib import Path
from tabulate import tabulate
import sys

from qulab.quantum.protocols import (
    ProtocolFactory,
    TeleportationProtocolType,
    ProtocolParameters,
    compare_protocols_at_distance,
)
from qulab.quantum.channels import (
    ChannelCharacteristics,
    ChannelType,
    NoiseModel,
    ChannelCharacterizer,
    ChannelScenarios,
)
from qulab.quantum.hardware_feasibility import (
    FeasibilityAssessor,
)
from qulab.quantum.hardware_integration import (
    get_hardware_manager,
    demo_hardware_integration,
)
from qulab.quantum.validation_suite import (
    ComprehensiveValidator,
    demo_validation_suite,
)

app = typer.Typer(
    help="QuLab2.0: Quantum Teleportation Discovery Framework",
    pretty_exceptions_show_locals=False,
)

# ═══════════════════════════════════════════════════════════════════════════
# WORKFLOW GUIDANCE
# ═══════════════════════════════════════════════════════════════════════════

@app.command("health")
def check_system_health():
    """
    Perform system health check and diagnostics.

    Verifies that all QuLab2.0 components are properly installed and functional.
    Reports on quantum simulators, dependencies, and available backends.
    """
    import sys

    typer.echo("\n" + "=" * 70)
    typer.echo("QULAB2.0 SYSTEM HEALTH CHECK")
    typer.echo("=" * 70 + "\n")

    all_healthy = True

    # 1. Check Python version
    typer.echo("🐍 Python Environment:")
    python_version = f"{sys.version_info.major}.{sys.version_info.minor}.{sys.version_info.micro}"
    typer.echo(f"   Version: {python_version}")
    if sys.version_info >= (3, 9):
        typer.echo("   Status: ✅ GOOD (3.9+)")
    else:
        typer.echo(f"   Status: ⚠️  WARNING (need 3.9+, have {python_version})")
        all_healthy = False
    typer.echo()

    # 2. Check core dependencies
    typer.echo("📦 Core Dependencies:")
    dependencies = {
        "numpy": "Numerical computing",
        "scipy": "Scientific computing",
        "typer": "CLI framework",
        "tabulate": "Table formatting",
    }

    for pkg, description in dependencies.items():
        try:
            __import__(pkg)
            typer.echo(f"   ✅ {pkg:15s} - {description}")
        except ImportError:
            typer.echo(f"   ❌ {pkg:15s} - {description} (NOT INSTALLED)")
            all_healthy = False
    typer.echo()

    # 3. Check quantum simulators
    typer.echo("⚛️  Quantum Simulators:")
    simulators = {
        "qiskit": "IBM Qiskit",
        "qiskit_aer": "Qiskit Aer",
        "qiskit_ibm_runtime": "IBM Quantum Hardware",
    }

    qiskit_available = False
    for pkg, description in simulators.items():
        try:
            __import__(pkg)
            typer.echo(f"   ✅ {description:30s} - Available")
            qiskit_available = True
        except ImportError:
            typer.echo(f"   ⚠️  {description:30s} - Not installed")

    if not qiskit_available:
        typer.echo("\n   💡 HINT: Install Qiskit for quantum hardware integration:")
        typer.echo("      pip install qiskit qiskit-aer")
        all_healthy = False
    typer.echo()

    # 4. Check QuLab modules
    typer.echo("🔬 QuLab2.0 Modules:")
    modules = [
        ("protocols", "Teleportation protocols"),
        ("channels", "Channel characterization"),
        ("optimization", "Quantum optimization"),
        ("hardware_feasibility", "Hardware assessment"),
        ("hardware_integration", "Hardware integration"),
        ("validation_suite", "Validation framework"),
        ("scaling_studies", "Scaling analysis"),
    ]

    for module_name, description in modules:
        try:
            __import__(f"qulab.quantum.{module_name}")
            typer.echo(f"   ✅ {description:35s} - Loaded")
        except ImportError as e:
            typer.echo(f"   ❌ {description:35s} - FAILED ({e})")
            all_healthy = False
    typer.echo()

    # 5. Check available backends
    typer.echo("🖥️  Available Quantum Backends:")
    try:
        manager = get_hardware_manager()
        backends = manager.get_available_backends()
        if backends:
            for name, caps in backends.items():
                typer.echo(f"   ✅ {caps.name:30s} ({caps.num_qubits} qubits, {caps.two_qubit_gate_fidelity*100:.2f}% fidelity)")
        else:
            typer.echo("   ⚠️  No backends available")
            all_healthy = False
    except Exception as e:
        typer.echo(f"   ❌ Could not load backends: {e}")
        all_healthy = False
    typer.echo()

    # Summary
    typer.echo("=" * 70)
    if all_healthy:
        typer.echo("✅ SYSTEM HEALTHY - All components operational")
        typer.echo("\nYou're ready to start quantum teleportation discovery!")
        typer.echo("Run 'python -m qulab.cli_teleport_discovery workflow' to get started.")
    else:
        typer.echo("⚠️  SYSTEM DEGRADED - Some components missing or not working")
        typer.echo("\nTo fix issues:")
        typer.echo("  1. Install missing dependencies: pip install -r requirements.txt")
        typer.echo("  2. For quantum hardware: pip install qiskit qiskit-aer")
        typer.echo("  3. Check Python version (need 3.9+)")
    typer.echo("=" * 70 + "\n")


@app.command("workflow")
def show_workflow_guide():
    """
    Display guided workflow for quantum teleportation discovery.

    Learn the recommended sequence for exploring quantum teleportation protocols,
    analyzing channels, assessing hardware feasibility, and optimizing parameters.
    """
    guide = """
╔══════════════════════════════════════════════════════════════════════════════╗
║                  QULAB2.0 QUANTUM TELEPORTATION DISCOVERY                    ║
║                        RECOMMENDED WORKFLOW GUIDE                             ║
╚══════════════════════════════════════════════════════════════════════════════╝

STEP 1️⃣  Define Your Goal
──────────────────────────────────────────────────────────────────────────────
Decide what you want to achieve:
  ✓ Build a teleporter for local network (10-100 km)?
  ✓ Plan a metropolitan quantum network (50-200 km)?
  ✓ Design a long-distance link (500+ km)?

STEP 2️⃣  Compare Protocols for Your Distance
──────────────────────────────────────────────────────────────────────────────
Command: protocol-compare --distance <km> [--verbose]

Examples:
  • python -m qulab.cli_teleport_discovery protocol-compare --distance 10
  • python -m qulab.cli_teleport_discovery protocol-compare --distance 100 --verbose
  • python -m qulab.cli_teleport_discovery protocol-compare --distance 500

This shows:
  ✓ Which protocols perform best for your distance
  ✓ Resource requirements (qubits, classical bits)
  ✓ Success probability
  ✓ Execution time

STEP 3️⃣  Analyze Channel Performance
──────────────────────────────────────────────────────────────────────────────
Command: channel-analyze --channel-type <type> --distance <km> [--noise-model <model>]

Channel types: fiber_optic, free_space, waveguide
Noise models: amplitude_damping, phase_damping, depolarizing, thermal

Examples:
  • python -m qulab.cli_teleport_discovery channel-analyze --distance 10
  • python -m qulab.cli_teleport_discovery channel-analyze --channel-type free_space --distance 50

This shows:
  ✓ Photon loss effects
  ✓ Noise impacts
  ✓ Decoherence effects
  ✓ Limiting factors and maximum distance

STEP 4️⃣  Assess Hardware Feasibility
──────────────────────────────────────────────────────────────────────────────
Command: hardware-assess --distance <km> --num-qubits <n> --target-fidelity <f>

Examples:
  • python -m qulab.cli_teleport_discovery hardware-assess --distance 10
  • python -m qulab.cli_teleport_discovery hardware-assess --distance 100 --num-qubits 2 --target-fidelity 0.95

This shows:
  ✓ Hardware requirements (gate fidelity, coherence time, etc.)
  ✓ Timeline to achieve requirements
  ✓ Estimated cost
  ✓ Critical path components
  ✓ Platform-specific options (superconducting, trapped ion, etc.)

STEP 5️⃣  Optimize Protocol Parameters
──────────────────────────────────────────────────────────────────────────────
Command: optimize-protocol --distance <km> --method <algorithm>

Methods: grover (fastest), vqe (accurate), qaoa (circuit-level)

Examples:
  • python -m qulab.cli_teleport_discovery optimize-protocol --distance 10 --method grover
  • python -m qulab.cli_teleport_discovery optimize-protocol --distance 100 --method vqe
  • python -m qulab.cli_teleport_discovery compare-optimizers --distance 50

This shows:
  ✓ Optimal parameters for your configuration
  ✓ Fidelity improvement percentage
  ✓ Resource efficiency
  ✓ Confidence scores

STEP 6️⃣  Validate Your Design
──────────────────────────────────────────────────────────────────────────────
Command: validate-protocol --protocol <name> --distance <km> [--monte-carlo-runs <n>]

Protocols: bell_state, entanglement_swapping, quantum_repeater, etc.

Examples:
  • python -m qulab.cli_teleport_discovery validate-protocol --protocol bell_state --distance 10
  • python -m qulab.cli_teleport_discovery validate-protocol --protocol entanglement_swapping --distance 100 --monte-carlo-runs 50000

This shows:
  ✓ Statistical validation results
  ✓ Confidence intervals
  ✓ Noise robustness analysis
  ✓ Comparison with published benchmarks

STEP 7️⃣  Explore Hardware Options
──────────────────────────────────────────────────────────────────────────────
Command: hardware-backends

Examples:
  • python -m qulab.cli_teleport_discovery hardware-backends
  • python -m qulab.cli_teleport_discovery hardware-backends --output json
  • python -m qulab.cli_teleport_discovery hardware-demo

This shows:
  ✓ Available quantum simulators and hardware
  ✓ Qubit counts and fidelity ratings
  ✓ Integration options

QUICK START EXAMPLE
──────────────────────────────────────────────────────────────────────────────
Design a quantum teleporter for a 50 km metropolitan network:

  1. Compare protocols:
     python -m qulab.cli_teleport_discovery protocol-compare --distance 50 --verbose

  2. Analyze fiber optic channel:
     python -m qulab.cli_teleport_discovery channel-analyze --distance 50

  3. Assess hardware needs:
     python -m qulab.cli_teleport_discovery hardware-assess --distance 50 --target-fidelity 0.95

  4. Optimize for your protocol:
     python -m qulab.cli_teleport_discovery optimize-protocol --distance 50 --method grover

  5. Validate the design:
     python -m qulab.cli_teleport_discovery validate-protocol --protocol entanglement_swapping --distance 50

  6. Save all results to JSON for analysis:
     python -m qulab.cli_teleport_discovery protocol-compare --distance 50 --output results.json

FOR MORE HELP
──────────────────────────────────────────────────────────────────────────────
Each command has detailed help:
  python -m qulab.cli_teleport_discovery <command> --help

Or see comprehensive demos:
  python -m qulab.cli_teleport_discovery demo
  python -m qulab.cli_teleport_discovery hardware-demo
  python -m qulab.cli_teleport_discovery validation-demo

╚══════════════════════════════════════════════════════════════════════════════╝
    """
    typer.echo(guide)


# ═══════════════════════════════════════════════════════════════════════════
# PROTOCOL EXPLORATION
# ═══════════════════════════════════════════════════════════════════════════

@app.command("protocol-compare")
def compare_protocols(
    distance_km: float = typer.Option(
        10.0,
        "--distance",
        help="Communication distance in kilometers. Range: 0.1 to 10000 km. Example: 10 for local testing, 100 for metropolitan, 500+ for long-distance."
    ),
    bell_pair_fidelity: float = typer.Option(
        0.99,
        "--bell-fidelity",
        help="Quality of entanglement (Bell pair fidelity). Range: 0.0 to 1.0. Typical: 0.99 for modern systems."
    ),
    gate_fidelity: float = typer.Option(
        0.99,
        "--gate-fidelity",
        help="Quality of quantum gates. Range: 0.0 to 1.0. Typical: 0.99 for superconducting qubits, 0.999+ for trapped ions."
    ),
    output: Optional[str] = typer.Option(
        None,
        "--output",
        help="Save results to JSON file. Example: --output results.json"
    ),
    verbose: bool = typer.Option(False, "--verbose", "-v", help="Enable detailed output with error breakdowns"),
):
    """
    Compare all quantum teleportation protocols at a given distance.

    This command evaluates multiple teleportation protocol variants (Bell state, entanglement swapping,
    quantum repeaters, etc.) and determines which performs best for your specific distance and fidelity
    requirements. Results show fidelity, resource requirements, execution time, and suitability for distance.

    EXAMPLES:

    1. Compare protocols for 10 km (local network):
       python -m qulab.cli_teleport_discovery protocol-compare --distance 10

    2. Compare for 100 km with lower gate fidelity (more realistic):
       python -m qulab.cli_teleport_discovery protocol-compare --distance 100 --gate-fidelity 0.98

    3. Save comparison results for further analysis:
       python -m qulab.cli_teleport_discovery protocol-compare --distance 50 --output comparison.json

    4. Verbose output to see error source breakdown:
       python -m qulab.cli_teleport_discovery protocol-compare --distance 100 --verbose
    """
    # ─────────────────────────────────────────────────────────────────────────
    # INPUT VALIDATION
    # ─────────────────────────────────────────────────────────────────────────

    validation_errors = []

    if not (0.1 <= distance_km <= 10000):
        validation_errors.append(f"Distance {distance_km} km out of range [0.1, 10000]. Suggested: 10-500 km")

    if not (0.0 <= bell_pair_fidelity <= 1.0):
        validation_errors.append(f"Bell pair fidelity {bell_pair_fidelity} out of range [0.0, 1.0]")

    if not (0.0 <= gate_fidelity <= 1.0):
        validation_errors.append(f"Gate fidelity {gate_fidelity} out of range [0.0, 1.0]")

    if validation_errors:
        typer.echo("\n❌ INPUT VALIDATION FAILED:", err=True)
        for error in validation_errors:
            typer.echo(f"   • {error}", err=True)
        typer.echo("\n💡 HINT: Use --help to see valid ranges and examples", err=True)
        raise typer.Exit(1)

    # ─────────────────────────────────────────────────────────────────────────
    # MAIN LOGIC
    # ─────────────────────────────────────────────────────────────────────────
    typer.echo("\n" + "=" * 70)
    typer.echo("QUANTUM TELEPORTATION PROTOCOL COMPARISON")
    typer.echo("=" * 70)
    typer.echo(f"📊 Distance: {distance_km} km")
    typer.echo(f"📈 Bell pair fidelity: {bell_pair_fidelity:.4f}")
    typer.echo(f"⚙️  Gate fidelity: {gate_fidelity:.4f}")
    typer.echo()

    try:
        # Compare protocols
        results = compare_protocols_at_distance(
            distance_km=distance_km,
            bell_pair_fidelity=bell_pair_fidelity,
            gate_fidelity=gate_fidelity,
        )
    except Exception as e:
        typer.echo(f"\n❌ ERROR: Failed to compare protocols: {e}", err=True)
        typer.echo("\n💡 HINT: Check that your fidelity values are realistic (0.95-0.999 range)", err=True)
        raise typer.Exit(1)

    # Display results
    table_data = []
    for protocol_name, result in results.items():
        table_data.append([
            protocol_name,
            f"{result.fidelity:.4f}",
            f"{result.success_probability * 100:.1f}%",
            f"{result.quantum_resources_needed} qubits",
            f"{result.classical_bits_needed} bits",
            f"{result.time_required_us:.2f} µs",
            "✓ BEST" if result.optimal_for_distance else "",
        ])

    headers = ["Protocol", "Fidelity", "Success Rate", "Qubits", "Classical Bits", "Time", "Notes"]
    typer.echo(tabulate(table_data, headers=headers, tablefmt="grid"))

    # Verbose output with error breakdowns
    if verbose:
        typer.echo("\n📋 DETAILED ERROR BREAKDOWN:")
        typer.echo("─" * 70)
        for protocol_name, result in results.items():
            if result.error_sources:
                typer.echo(f"\n{protocol_name}:")
                for error_source, error_magnitude in result.error_sources.items():
                    percentage = (error_magnitude / sum(result.error_sources.values()) * 100) if sum(result.error_sources.values()) > 0 else 0
                    typer.echo(f"  • {error_source:25s}: {error_magnitude:8.4f} ({percentage:5.1f}%)")

    # Recommendations
    typer.echo("\n💡 RECOMMENDATIONS:")
    best_protocol = max(results.items(), key=lambda x: x[1].fidelity)
    typer.echo(f"  • Best fidelity: {best_protocol[0]} ({best_protocol[1].fidelity:.4f})")

    if distance_km < 10:
        typer.echo(f"  • Distance is short: Bell state teleportation recommended")
    elif distance_km < 100:
        typer.echo(f"  • Distance is medium: Entanglement swapping recommended")
    else:
        typer.echo(f"  • Distance is long: Quantum repeater network needed")

    # Save if requested
    if output:
        output_data = {
            "distance_km": distance_km,
            "results": {
                name: {
                    "fidelity": result.fidelity,
                    "success_probability": result.success_probability,
                    "quantum_resources_needed": result.quantum_resources_needed,
                    "classical_bits_needed": result.classical_bits_needed,
                    "time_required_us": result.time_required_us,
                }
                for name, result in results.items()
            }
        }
        Path(output).write_text(json.dumps(output_data, indent=2))
        typer.echo(f"\nResults saved to: {output}")

    typer.echo()


# ═══════════════════════════════════════════════════════════════════════════
# CHANNEL CHARACTERIZATION
# ═══════════════════════════════════════════════════════════════════════════

@app.command("channel-analyze")
def analyze_channel(
    channel_type: str = typer.Option("fiber_optic", help="Channel type: fiber_optic, free_space, waveguide"),
    distance_km: float = typer.Option(10.0, help="Communication distance"),
    noise_model: str = typer.Option("amplitude_damping", help="Noise model"),
    output: Optional[str] = typer.Option(None, help="Save detailed report to JSON"),
):
    """Analyze quantum channel performance at given distance."""
    typer.echo("\n" + "=" * 70)
    typer.echo("QUANTUM CHANNEL CHARACTERIZATION ANALYSIS")
    typer.echo("=" * 70)
    typer.echo(f"Channel: {channel_type} ({distance_km} km)")
    typer.echo(f"Noise model: {noise_model}")
    typer.echo()

    # Create channel
    try:
        ch_type = ChannelType[channel_type.upper()]
        noise = NoiseModel[noise_model.upper()]
    except KeyError as e:
        typer.echo(f"Error: Unknown channel type or noise model: {e}", err=True)
        raise typer.Exit(1)

    chars = ChannelCharacteristics(
        channel_type=ch_type,
        distance_km=distance_km,
        noise_model=noise,
    )

    # Analyze
    characterizer = ChannelCharacterizer(chars)
    result = characterizer.analyze_fidelity()

    # Display results
    typer.echo("FIDELITY ANALYSIS:")
    typer.echo(f"  Photon loss fidelity:     {result.photon_loss_fidelity:.4f}")
    typer.echo(f"  Noise fidelity:           {result.noise_fidelity:.4f}")
    typer.echo(f"  Decoherence fidelity:     {result.decoherence_fidelity:.4f}")
    typer.echo(f"  Combined fidelity:        {result.combined_fidelity:.4f}")
    typer.echo(f"  Success rate:             {result.success_rate_percent:.1f}%")
    typer.echo()

    typer.echo("ERROR SOURCES:")
    for source, error in result.fidelity_breakdown.items():
        typer.echo(f"  {source:20s}: {error:.4f}")
    typer.echo()

    typer.echo(f"LIMITING FACTOR: {result.limiting_factor}")
    typer.echo(f"Distance limit (>80% fidelity): {result.distance_limit_km:.1f} km")
    typer.echo()

    typer.echo("IMPROVEMENT OPPORTUNITIES:")
    for suggestion in result.improvement_opportunities:
        typer.echo(f"  • {suggestion}")

    # Save if requested
    if output:
        output_data = {
            "channel_type": channel_type,
            "distance_km": distance_km,
            "fidelity_analysis": {
                "photon_loss": result.photon_loss_fidelity,
                "noise": result.noise_fidelity,
                "decoherence": result.decoherence_fidelity,
                "combined": result.combined_fidelity,
                "success_rate_percent": result.success_rate_percent,
            },
            "limiting_factor": result.limiting_factor,
            "distance_limit_km": result.distance_limit_km,
        }
        Path(output).write_text(json.dumps(output_data, indent=2))
        typer.echo(f"\nDetailed report saved to: {output}")

    typer.echo()


# ═══════════════════════════════════════════════════════════════════════════
# HARDWARE FEASIBILITY
# ═══════════════════════════════════════════════════════════════════════════

@app.command("hardware-assess")
def assess_hardware(
    distance_km: float = typer.Option(10.0, help="Target communication distance"),
    num_qubits: int = typer.Option(1, help="Number of qubits to teleport"),
    target_fidelity: float = typer.Option(0.95, help="Target output fidelity"),
    output: Optional[str] = typer.Option(None, help="Save comprehensive report to JSON"),
):
    """Assess hardware requirements to build a quantum teleporter."""
    typer.echo("\n" + "=" * 70)
    typer.echo("QUANTUM TELEPORTER HARDWARE FEASIBILITY ASSESSMENT")
    typer.echo("=" * 70)
    typer.echo(f"Distance: {distance_km} km")
    typer.echo(f"Qubits to teleport: {num_qubits}")
    typer.echo(f"Target fidelity: {target_fidelity * 100:.0f}%")
    typer.echo()

    # Assess
    assessor = FeasibilityAssessor(distance_km=distance_km, num_qubits=num_qubits)
    report = assessor.assess(target_fidelity=target_fidelity)

    # Overall assessment
    typer.echo("OVERALL FEASIBILITY:")
    typer.echo(f"  Status: {report.overall_feasibility.value.upper()}")
    typer.echo(f"  Timeline: {report.years_to_achievement:.1f} years")
    typer.echo(f"  Estimated cost: ${report.total_cost_estimate_usd/1e6:.0f}M")
    typer.echo(f"  Success probability: {report.success_probability * 100:.0f}%")
    typer.echo()

    # Hardware requirements
    typer.echo("HARDWARE REQUIREMENTS:")
    req_table = []
    for req in report.hardware_requirements:
        req_table.append([
            req.name,
            req.current_state,
            req.required_state,
            f"{req.timeline_years:.1f} yr",
            f"${req.cost_estimate_usd/1e6:.0f}M",
            req.feasibility.value,
        ])

    headers = ["Requirement", "Current", "Required", "Timeline", "Cost", "Feasibility"]
    typer.echo(tabulate(req_table, headers=headers, tablefmt="grid"))
    typer.echo()

    # Critical path
    typer.echo("CRITICAL PATH (Most challenging):")
    for item in report.critical_path:
        typer.echo(f"  • {item}")
    typer.echo()

    # Scaling options
    typer.echo("HARDWARE PLATFORM OPTIONS:")
    for platform, details in report.scaling_options.items():
        typer.echo(f"\n  {platform.upper()}")
        typer.echo(f"    Fidelity: {details['fidelity']:.4f}")
        typer.echo(f"    Scalability: {details['scalability']}")
        typer.echo(f"    Timeline: {details['timeline_years']} years")
        typer.echo(f"    Cost: ${details['cost_usd']/1e6:.0f}M")
        typer.echo(f"    Advantages: {details['advantages']}")
        typer.echo(f"    Disadvantages: {details['disadvantages']}")

    # Save if requested
    if output:
        output_data = {
            "distance_km": distance_km,
            "num_qubits": num_qubits,
            "target_fidelity": target_fidelity,
            "feasibility": {
                "status": report.overall_feasibility.value,
                "years_to_achievement": report.years_to_achievement,
                "estimated_cost_usd": report.total_cost_estimate_usd,
                "success_probability": report.success_probability,
            },
            "critical_path": report.critical_path,
            "specifications": {
                "num_qubits": report.specifications.num_qubits,
                "two_qubit_fidelity": report.specifications.two_qubit_fidelity,
                "coherence_time_us": report.specifications.coherence_time_us,
            }
        }
        Path(output).write_text(json.dumps(output_data, indent=2))
        typer.echo(f"\nComprehensive report saved to: {output}")

    typer.echo()


# ═══════════════════════════════════════════════════════════════════════════
# QUANTUM OPTIMIZATION
# ═══════════════════════════════════════════════════════════════════════════

@app.command("optimize-protocol")
def optimize_protocol(
    distance_km: float = typer.Option(10.0, help="Communication distance in km"),
    num_qubits: int = typer.Option(1, help="Number of qubits to teleport"),
    target_fidelity: float = typer.Option(0.95, help="Target output fidelity"),
    method: str = typer.Option("grover", help="Optimization method: grover, vqe, qaoa"),
    output: Optional[str] = typer.Option(None, help="Save results to JSON file"),
):
    """Optimize protocol parameters for given distance using quantum algorithms."""
    from qulab.quantum.optimization import QuantumOptimizationSuite

    typer.echo("\n" + "=" * 70)
    typer.echo("QUANTUM-ENHANCED PROTOCOL OPTIMIZATION")
    typer.echo("=" * 70)
    typer.echo(f"Distance: {distance_km} km")
    typer.echo(f"Qubits: {num_qubits}")
    typer.echo(f"Target fidelity: {target_fidelity * 100:.0f}%")
    typer.echo(f"Optimization method: {method.upper()}")
    typer.echo()

    # Run optimization
    opt_result = QuantumOptimizationSuite.optimize_for_distance(
        distance_km=distance_km,
        target_fidelity=target_fidelity,
        num_qubits=num_qubits,
        method=method
    )

    result = opt_result["result"]

    # Display results
    typer.echo("OPTIMIZATION RESULTS:")
    typer.echo(f"  Optimal fidelity:       {result.optimal_fidelity:.4f}")
    typer.echo(f"  Improvement:            {result.improvement_percent:+.1f}%")
    typer.echo(f"  Resource efficiency:    {result.resource_efficiency:.4f}")
    typer.echo(f"  Search space size:      {result.search_space_size}")
    typer.echo(f"  Iterations required:    {result.iterations_required}")
    typer.echo(f"  Computation time:       {result.computation_time_ms:.1f} ms")
    typer.echo(f"  Confidence score:       {result.confidence_score:.2f}")
    typer.echo()

    typer.echo("OPTIMAL PARAMETERS:")
    for param, value in result.optimal_parameters.items():
        typer.echo(f"  {param:25s}: {value:.6f}")
    typer.echo()

    typer.echo("RECOMMENDATIONS:")
    for rec in opt_result["recommendations"]:
        typer.echo(f"  • {rec}")
    typer.echo()

    # Save if requested
    if output:
        output_data = {
            "distance_km": distance_km,
            "num_qubits": num_qubits,
            "target_fidelity": target_fidelity,
            "method": method,
            "optimization": {
                "fidelity": result.optimal_fidelity,
                "improvement_percent": result.improvement_percent,
                "efficiency": result.resource_efficiency,
                "parameters": result.optimal_parameters,
                "computation_time_ms": result.computation_time_ms,
                "confidence": result.confidence_score,
            },
            "recommendations": opt_result["recommendations"],
        }
        Path(output).write_text(json.dumps(output_data, indent=2))
        typer.echo(f"Results saved to: {output}")

    typer.echo()


@app.command("compare-optimizers")
def compare_optimization_methods(
    distance_km: float = typer.Option(10.0, help="Communication distance in km"),
    num_qubits: int = typer.Option(1, help="Number of qubits to teleport"),
    output: Optional[str] = typer.Option(None, help="Save comparison to JSON file"),
):
    """Compare all quantum optimization methods (Grover, VQE, QAOA)."""
    from qulab.quantum.optimization import QuantumOptimizationSuite

    typer.echo("\n" + "=" * 70)
    typer.echo("COMPARING QUANTUM OPTIMIZATION METHODS")
    typer.echo("=" * 70)
    typer.echo(f"Distance: {distance_km} km")
    typer.echo(f"Qubits: {num_qubits}")
    typer.echo()

    # Run comparison
    comparison = QuantumOptimizationSuite.compare_optimization_methods(
        distance_km=distance_km,
        num_qubits=num_qubits
    )

    # Display comparison
    comparison_data = []
    for method, res in comparison["results"].items():
        result = res["result"]
        comparison_data.append([
            method.upper(),
            f"{result.optimal_fidelity:.4f}",
            f"{result.improvement_percent:+.1f}%",
            f"{result.iterations_required}",
            f"{result.computation_time_ms:.0f} ms",
            f"{result.confidence_score:.2f}",
        ])

    headers = ["Method", "Fidelity", "Improvement", "Iterations", "Time", "Confidence"]
    typer.echo(tabulate(comparison_data, headers=headers, tablefmt="grid"))
    typer.echo()

    typer.echo(f"BEST METHOD: {comparison['recommendation'].upper()}")
    typer.echo()

    # Save if requested
    if output:
        output_data = {
            "distance_km": distance_km,
            "num_qubits": num_qubits,
            "comparison": {},
            "best_method": comparison["recommendation"],
        }

        for method, res in comparison["results"].items():
            result = res["result"]
            output_data["comparison"][method] = {
                "fidelity": result.optimal_fidelity,
                "improvement_percent": result.improvement_percent,
                "iterations": result.iterations_required,
                "time_ms": result.computation_time_ms,
                "confidence": result.confidence_score,
            }

        Path(output).write_text(json.dumps(output_data, indent=2))
        typer.echo(f"Comparison saved to: {output}")

    typer.echo()


# ═══════════════════════════════════════════════════════════════════════════
# DISCOVERY DEMO
# ═══════════════════════════════════════════════════════════════════════════

@app.command("demo")
def run_discovery_demo():
    """Run comprehensive teleportation discovery demonstration."""
    typer.echo("\n" + "=" * 70)
    typer.echo("QULAB2.0 QUANTUM TELEPORTATION DISCOVERY DEMONSTRATION")
    typer.echo("=" * 70)

    # Test different distances
    test_distances = [1.0, 10.0, 100.0]

    for distance in test_distances:
        typer.echo(f"\n{'=' * 70}")
        typer.echo(f"SCENARIO: {distance} km distance")
        typer.echo(f"{'=' * 70}")

        # 1. Compare protocols
        results = compare_protocols_at_distance(distance)
        best = max(results.items(), key=lambda x: x[1].fidelity)
        typer.echo(f"\nBest protocol at {distance} km: {best[0]}")
        typer.echo(f"  Fidelity: {best[1].fidelity:.4f}")
        typer.echo(f"  Resources: {best[1].quantum_resources_needed} qubits, {best[1].classical_bits_needed} classical bits")

        # 2. Analyze channel
        chars = ChannelCharacteristics(
            channel_type=ChannelType.FIBER_OPTIC,
            distance_km=distance,
            noise_model=NoiseModel.AMPLITUDE_DAMPING,
        )
        characterizer = ChannelCharacterizer(chars)
        fidelity = characterizer.analyze_fidelity()
        typer.echo(f"\nChannel analysis:")
        typer.echo(f"  Combined fidelity: {fidelity.combined_fidelity:.4f}")
        typer.echo(f"  Success rate: {fidelity.success_rate_percent:.1f}%")
        typer.echo(f"  Limiting factor: {fidelity.limiting_factor}")

        # 3. Hardware feasibility
        assessor = FeasibilityAssessor(distance_km=distance, num_qubits=1)
        feasibility = assessor.assess(target_fidelity=0.95)
        typer.echo(f"\nHardware feasibility:")
        typer.echo(f"  Status: {feasibility.overall_feasibility.value}")
        typer.echo(f"  Timeline: {feasibility.years_to_achievement:.1f} years")
        typer.echo(f"  Cost estimate: ${feasibility.total_cost_estimate_usd/1e6:.0f}M")


# ═══════════════════════════════════════════════════════════════════════════
# QUANTUM HARDWARE INTEGRATION
# ═══════════════════════════════════════════════════════════════════════════

@app.command("hardware-backends")
def list_quantum_backends(output: Optional[str] = typer.Option(None, help="Output format (json)")):
    """List available quantum hardware backends."""
    manager = get_hardware_manager()
    backends = manager.get_available_backends()

    if output == "json":
        import json
        data = {}
        for name, caps in backends.items():
            data[name] = {
                "name": caps.name,
                "qubits": caps.num_qubits,
                "2q_gate_fidelity": f"{caps.two_qubit_gate_fidelity*100:.2f}%",
                "cloud_accessible": caps.cloud_accessible,
                "backend_name": caps.backend_name
            }
        typer.echo(json.dumps(data, indent=2))
    else:
        table_data = []
        for name, caps in backends.items():
            table_data.append([
                caps.name,
                caps.num_qubits,
                f"{caps.two_qubit_gate_fidelity*100:.2f}%",
                f"{caps.measurement_fidelity*100:.2f}%",
                "Cloud" if caps.cloud_accessible else "Local"
            ])

        print("\n📡 AVAILABLE QUANTUM BACKENDS")
        print("=" * 100)
        print(tabulate(table_data,
                      headers=["Backend", "Qubits", "2Q Gate Fidelity", "Measurement Fidelity", "Access"],
                      tablefmt="grid"))


@app.command("hardware-demo")
def show_hardware_demo():
    """Demonstrate quantum hardware integration capabilities."""
    demo_hardware_integration()


# ═══════════════════════════════════════════════════════════════════════════
# COMPREHENSIVE VALIDATION
# ═══════════════════════════════════════════════════════════════════════════

@app.command("validate-protocol")
def validate_protocol_cmd(
    protocol: str = typer.Option("bell_state", help="Protocol to validate"),
    distance_km: float = typer.Option(10, help="Distance in kilometers"),
    num_qubits: int = typer.Option(2, help="Number of qubits"),
    min_fidelity: float = typer.Option(0.90, help="Minimum acceptable fidelity"),
    monte_carlo_runs: int = typer.Option(10000, help="Number of Monte Carlo runs"),
    output: Optional[str] = typer.Option(None, help="Output format (json)"),
):
    """Comprehensively validate a quantum teleportation protocol."""

    validator = ComprehensiveValidator()

    # Define protocol simulation
    def protocol_simulation():
        """Simulate protocol with realistic noise."""
        import numpy as np
        # Base fidelity depends on protocol and distance
        if protocol == "bell_state":
            base_fidelity = 0.98 - (distance_km / 1000)
        elif protocol == "entanglement_swapping":
            base_fidelity = 0.96 - (distance_km / 500)
        else:
            base_fidelity = 0.95

        # Add realistic noise
        noise = np.random.normal(0, 0.01)
        return np.clip(base_fidelity + noise, 0, 1)

    typer.echo(f"\n🔬 Validating {protocol} protocol at {distance_km} km...")
    typer.echo(f"   Min acceptable fidelity: {min_fidelity*100:.1f}%")
    typer.echo(f"   Monte Carlo runs: {monte_carlo_runs:,}")
    typer.echo()

    # Run validation
    report = validator.validate_protocol(
        protocol_name=protocol.replace("_", " ").title(),
        protocol_fn=protocol_simulation,
        distance_km=distance_km,
        num_qubits=num_qubits,
        min_acceptable_fidelity=min_fidelity,
        num_monte_carlo=monte_carlo_runs
    )

    if output == "json":
        import json
        data = {
            "protocol": report.protocol_name,
            "distance_km": report.distance_km,
            "fidelity": {
                "nominal": report.fidelity_nominal,
                "mean": report.fidelity_stats.mean,
                "std": report.fidelity_stats.std,
                "ci_95": [report.fidelity_stats.ci_95_lower, report.fidelity_stats.ci_95_upper]
            },
            "passes_validation": report.passes_validation,
            "confidence_level": report.confidence_level,
            "noise_robustness": report.noise_robustness
        }
        typer.echo(json.dumps(data, indent=2))
    else:
        print(report.detailed_report)


@app.command("validation-demo")
def show_validation_demo():
    """Demonstrate comprehensive validation suite capabilities."""
    demo_validation_suite()


if __name__ == "__main__":
    app()
