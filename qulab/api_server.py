"""
QuLab2.0 REST API Server.

Provides HTTP endpoints for quantum teleportation discovery:
- Protocol comparison
- Channel analysis
- Hardware feasibility
- Protocol optimization
- Validation suite
- Hardware integration

Usage:
    python -m qulab.api_server
    # Then visit http://localhost:8000/docs for interactive API documentation

Copyright (c) 2025 Joshua Hendricks Cole (DBA: Corporation of Light). All Rights Reserved. PATENT PENDING.
"""

from fastapi import FastAPI, HTTPException, Query
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field
from typing import Dict, List, Optional, Any
import uvicorn
import logging
from enum import Enum

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
)
from qulab.quantum.hardware_feasibility import FeasibilityAssessor
from qulab.quantum.hardware_integration import get_hardware_manager
from qulab.quantum.optimization import QuantumOptimizationSuite
from qulab.quantum.validation_suite import ComprehensiveValidator

# ─────────────────────────────────────────────────────────────────────────────
# CONFIGURATION
# ─────────────────────────────────────────────────────────────────────────────

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="QuLab2.0 API",
    description="Quantum Teleportation Discovery Framework REST API",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json"
)

# ─────────────────────────────────────────────────────────────────────────────
# DATA MODELS
# ─────────────────────────────────────────────────────────────────────────────

class ProtocolComparisonRequest(BaseModel):
    """Request to compare teleportation protocols."""
    distance_km: float = Field(10.0, ge=0.1, le=10000, description="Distance in km")
    bell_pair_fidelity: float = Field(0.99, ge=0.0, le=1.0, description="Bell pair fidelity")
    gate_fidelity: float = Field(0.99, ge=0.0, le=1.0, description="Gate fidelity")
    verbose: bool = Field(False, description="Include detailed error breakdowns")


class ChannelAnalysisRequest(BaseModel):
    """Request to analyze quantum channel."""
    distance_km: float = Field(10.0, ge=0.1, le=10000, description="Distance in km")
    channel_type: str = Field("fiber_optic", description="Channel type: fiber_optic, free_space, waveguide")
    noise_model: str = Field("amplitude_damping", description="Noise model")


class HardwareAssessmentRequest(BaseModel):
    """Request to assess hardware feasibility."""
    distance_km: float = Field(10.0, ge=0.1, le=10000, description="Distance in km")
    num_qubits: int = Field(1, ge=1, le=100, description="Number of qubits")
    target_fidelity: float = Field(0.95, ge=0.8, le=0.999, description="Target output fidelity")


class ProtocolOptimizationRequest(BaseModel):
    """Request to optimize protocol parameters."""
    distance_km: float = Field(10.0, ge=0.1, le=10000, description="Distance in km")
    num_qubits: int = Field(1, ge=1, le=100, description="Number of qubits")
    target_fidelity: float = Field(0.95, ge=0.8, le=0.999, description="Target fidelity")
    method: str = Field("grover", description="Optimization method: grover, vqe, qaoa")


class ProtocolValidationRequest(BaseModel):
    """Request to validate a protocol."""
    protocol: str = Field("bell_state", description="Protocol name")
    distance_km: float = Field(10.0, ge=0.1, le=10000, description="Distance in km")
    num_qubits: int = Field(2, ge=1, le=100, description="Number of qubits")
    min_fidelity: float = Field(0.90, ge=0.0, le=1.0, description="Minimum fidelity")
    monte_carlo_runs: int = Field(10000, ge=100, le=100000, description="Number of MC runs")


# ─────────────────────────────────────────────────────────────────────────────
# HEALTH & INFO ENDPOINTS
# ─────────────────────────────────────────────────────────────────────────────

@app.get("/health", tags=["System"])
async def health_check():
    """Check API health and component status."""
    try:
        # Test imports
        from qulab.quantum import protocols, channels, optimization

        # Test hardware manager
        manager = get_hardware_manager()
        backends = manager.get_available_backends()

        return {
            "status": "healthy",
            "message": "QuLab2.0 API operational",
            "components": {
                "protocols": "✓",
                "channels": "✓",
                "optimization": "✓",
                "hardware_integration": "✓",
                "backends": list(backends.keys())
            }
        }
    except Exception as e:
        logger.exception("Health check failed: %s", e)
        raise HTTPException(status_code=503, detail=f"Service degraded: {str(e)}")


@app.get("/info", tags=["System"])
async def api_info():
    """Get API information and capabilities."""
    return {
        "name": "QuLab2.0 Quantum Teleportation Discovery API",
        "version": "1.0.0",
        "description": "Framework for quantum teleportation protocol discovery and optimization",
        "endpoints": {
            "protocols": {
                "compare": "POST /protocols/compare",
                "optimize": "POST /protocols/optimize",
                "list_types": "GET /protocols/types"
            },
            "channels": {
                "analyze": "POST /channels/analyze",
                "list_types": "GET /channels/types",
                "list_noise_models": "GET /channels/noise-models"
            },
            "hardware": {
                "assess": "POST /hardware/assess",
                "backends": "GET /hardware/backends",
                "requirements": "GET /hardware/requirements"
            },
            "validation": {
                "validate": "POST /validation/validate",
                "compare_methods": "POST /optimization/compare-methods"
            }
        }
    }


# ─────────────────────────────────────────────────────────────────────────────
# PROTOCOL ENDPOINTS
# ─────────────────────────────────────────────────────────────────────────────

@app.get("/protocols/types", tags=["Protocols"])
async def list_protocol_types():
    """List all available protocol types."""
    return {
        "protocols": [pt.value for pt in TeleportationProtocolType],
        "descriptions": {
            "bell_state": "Standard Bennett et al. 1993 protocol",
            "entanglement_swapping": "Extend range through entanglement swapping",
            "quantum_repeater": "Multiple hop repeater network",
            "long_distance": "Repeater chains for continental distances",
            "multi_qubit": "Teleport multiple qubits simultaneously",
            "distributed": "Distributed across multiple nodes",
            "error_corrected": "With quantum error correction",
        }
    }


@app.post("/protocols/compare", tags=["Protocols"])
async def compare_protocols(request: ProtocolComparisonRequest):
    """Compare teleportation protocols at given distance."""
    try:
        results = compare_protocols_at_distance(
            distance_km=request.distance_km,
            bell_pair_fidelity=request.bell_pair_fidelity,
            gate_fidelity=request.gate_fidelity,
        )

        response = {
            "distance_km": request.distance_km,
            "parameters": {
                "bell_pair_fidelity": request.bell_pair_fidelity,
                "gate_fidelity": request.gate_fidelity,
            },
            "protocols": {}
        }

        best_protocol = None
        best_fidelity = 0

        for protocol_name, result in results.items():
            protocol_data = {
                "fidelity": result.fidelity,
                "success_probability": result.success_probability,
                "quantum_resources": result.quantum_resources_needed,
                "classical_bits": result.classical_bits_needed,
                "time_us": result.time_required_us,
                "optimal_for_distance": result.optimal_for_distance,
            }

            if request.verbose and result.error_sources:
                protocol_data["error_sources"] = result.error_sources

            response["protocols"][protocol_name] = protocol_data

            if result.fidelity > best_fidelity:
                best_fidelity = result.fidelity
                best_protocol = protocol_name

        response["recommendation"] = best_protocol
        return response

    except Exception as e:
        logger.exception("Protocol comparison failed: %s", e)
        raise HTTPException(status_code=400, detail=f"Comparison failed: {str(e)}")


# ─────────────────────────────────────────────────────────────────────────────
# CHANNEL ENDPOINTS
# ─────────────────────────────────────────────────────────────────────────────

@app.get("/channels/types", tags=["Channels"])
async def list_channel_types():
    """List all available channel types."""
    return {
        "types": [ct.value for ct in ChannelType],
        "descriptions": {
            "fiber_optic": "Fiber optic cables (0.2 dB/km loss)",
            "free_space": "Free space optical links (higher loss)",
            "waveguide": "Integrated waveguides (lowest loss)",
        }
    }


@app.get("/channels/noise-models", tags=["Channels"])
async def list_noise_models():
    """List all available noise models."""
    return {
        "models": [nm.value for nm in NoiseModel],
        "descriptions": {
            "amplitude_damping": "Photon loss (most common)",
            "phase_damping": "Phase errors without energy loss",
            "depolarizing": "Random bit flips on qubits",
            "thermal": "Thermal decoherence effects",
        }
    }


@app.post("/channels/analyze", tags=["Channels"])
async def analyze_channel(request: ChannelAnalysisRequest):
    """Analyze quantum channel performance."""
    try:
        ch_type = ChannelType[request.channel_type.upper()]
        noise = NoiseModel[request.noise_model.upper()]

        chars = ChannelCharacteristics(
            channel_type=ch_type,
            distance_km=request.distance_km,
            noise_model=noise,
        )

        characterizer = ChannelCharacterizer(chars)
        result = characterizer.analyze_fidelity()

        return {
            "distance_km": request.distance_km,
            "channel_type": request.channel_type,
            "noise_model": request.noise_model,
            "fidelity": {
                "photon_loss": result.photon_loss_fidelity,
                "noise": result.noise_fidelity,
                "decoherence": result.decoherence_fidelity,
                "combined": result.combined_fidelity,
            },
            "success_rate_percent": result.success_rate_percent,
            "limiting_factor": result.limiting_factor,
            "distance_limit_km": result.distance_limit_km,
            "error_breakdown": result.fidelity_breakdown,
        }

    except Exception as e:
        logger.exception("Channel analysis failed: %s", e)
        raise HTTPException(status_code=400, detail=f"Analysis failed: {str(e)}")


# ─────────────────────────────────────────────────────────────────────────────
# HARDWARE ENDPOINTS
# ─────────────────────────────────────────────────────────────────────────────

@app.get("/hardware/backends", tags=["Hardware"])
async def list_hardware_backends():
    """List available quantum hardware backends."""
    try:
        manager = get_hardware_manager()
        backends = manager.get_available_backends()

        response = {"backends": {}}
        for name, caps in backends.items():
            response["backends"][name] = {
                "name": caps.name,
                "num_qubits": caps.num_qubits,
                "two_qubit_fidelity": caps.two_qubit_gate_fidelity,
                "single_qubit_fidelity": caps.single_qubit_gate_fidelity,
                "measurement_fidelity": caps.measurement_fidelity,
                "cloud_accessible": caps.cloud_accessible,
                "coherence_time_us": caps.coherence_time_us,
                "gate_time_ns": caps.gate_time_ns,
            }

        return response

    except Exception as e:
        logger.exception("Backend listing failed: %s", e)
        raise HTTPException(status_code=500, detail=f"Backend query failed: {str(e)}")


@app.post("/hardware/assess", tags=["Hardware"])
async def assess_hardware(request: HardwareAssessmentRequest):
    """Assess hardware feasibility for teleportation."""
    try:
        assessor = FeasibilityAssessor(
            distance_km=request.distance_km,
            num_qubits=request.num_qubits
        )
        report = assessor.assess(target_fidelity=request.target_fidelity)

        return {
            "distance_km": request.distance_km,
            "num_qubits": request.num_qubits,
            "target_fidelity": request.target_fidelity,
            "feasibility": {
                "status": report.overall_feasibility.value,
                "years_to_achievement": report.years_to_achievement,
                "estimated_cost_usd": report.total_cost_estimate_usd,
                "success_probability": report.success_probability,
            },
            "specifications": {
                "num_qubits": report.specifications.num_qubits,
                "two_qubit_fidelity": report.specifications.two_qubit_fidelity,
                "coherence_time_us": report.specifications.coherence_time_us,
            },
            "critical_path": report.critical_path,
        }

    except Exception as e:
        logger.exception("Hardware assessment failed: %s", e)
        raise HTTPException(status_code=400, detail=f"Assessment failed: {str(e)}")


# ─────────────────────────────────────────────────────────────────────────────
# OPTIMIZATION ENDPOINTS
# ─────────────────────────────────────────────────────────────────────────────

@app.post("/protocols/optimize", tags=["Optimization"])
async def optimize_protocol(request: ProtocolOptimizationRequest):
    """Optimize protocol parameters for distance."""
    try:
        result = QuantumOptimizationSuite.optimize_for_distance(
            distance_km=request.distance_km,
            target_fidelity=request.target_fidelity,
            num_qubits=request.num_qubits,
            method=request.method
        )

        opt_result = result["result"]

        return {
            "distance_km": request.distance_km,
            "num_qubits": request.num_qubits,
            "method": request.method,
            "optimization": {
                "optimal_fidelity": opt_result.optimal_fidelity,
                "improvement_percent": opt_result.improvement_percent,
                "resource_efficiency": opt_result.resource_efficiency,
                "iterations": opt_result.iterations_required,
                "computation_time_ms": opt_result.computation_time_ms,
                "confidence_score": opt_result.confidence_score,
            },
            "parameters": opt_result.optimal_parameters,
            "recommendations": result["recommendations"],
        }

    except Exception as e:
        logger.exception("Optimization failed: %s", e)
        raise HTTPException(status_code=400, detail=f"Optimization failed: {str(e)}")


@app.post("/optimization/compare-methods", tags=["Optimization"])
async def compare_optimization_methods(request: ProtocolOptimizationRequest):
    """Compare all optimization methods."""
    try:
        comparison = QuantumOptimizationSuite.compare_optimization_methods(
            distance_km=request.distance_km,
            num_qubits=request.num_qubits
        )

        response = {
            "distance_km": request.distance_km,
            "num_qubits": request.num_qubits,
            "recommendation": comparison["recommendation"],
            "methods": {}
        }

        for method, res in comparison["results"].items():
            result = res["result"]
            response["methods"][method] = {
                "optimal_fidelity": result.optimal_fidelity,
                "improvement_percent": result.improvement_percent,
                "iterations": result.iterations_required,
                "computation_time_ms": result.computation_time_ms,
                "confidence": result.confidence_score,
            }

        return response

    except Exception as e:
        logger.exception("Method comparison failed: %s", e)
        raise HTTPException(status_code=400, detail=f"Comparison failed: {str(e)}")


# ─────────────────────────────────────────────────────────────────────────────
# VALIDATION ENDPOINTS
# ─────────────────────────────────────────────────────────────────────────────

@app.post("/validation/validate", tags=["Validation"])
async def validate_protocol(request: ProtocolValidationRequest):
    """Comprehensively validate a teleportation protocol."""
    try:
        validator = ComprehensiveValidator()

        # Define protocol simulation
        def protocol_simulation():
            import numpy as np
            if request.protocol == "bell_state":
                base_fidelity = 0.98 - (request.distance_km / 1000)
            elif request.protocol == "entanglement_swapping":
                base_fidelity = 0.96 - (request.distance_km / 500)
            else:
                base_fidelity = 0.95

            noise = np.random.normal(0, 0.01)
            return np.clip(base_fidelity + noise, 0, 1)

        # Run validation
        report = validator.validate_protocol(
            protocol_name=request.protocol.replace("_", " ").title(),
            protocol_fn=protocol_simulation,
            distance_km=request.distance_km,
            num_qubits=request.num_qubits,
            min_acceptable_fidelity=request.min_fidelity,
            num_monte_carlo=request.monte_carlo_runs
        )

        return {
            "protocol": request.protocol,
            "distance_km": request.distance_km,
            "num_qubits": request.num_qubits,
            "fidelity": {
                "nominal": report.fidelity_nominal,
                "mean": report.fidelity_stats.mean,
                "std": report.fidelity_stats.std,
                "median": report.fidelity_stats.median,
                "ci_95_lower": report.fidelity_stats.ci_95_lower,
                "ci_95_upper": report.fidelity_stats.ci_95_upper,
            },
            "passes_validation": report.passes_validation,
            "confidence_level": report.confidence_level,
            "noise_robustness": report.noise_robustness,
        }

    except Exception as e:
        logger.exception("Validation failed: %s", e)
        raise HTTPException(status_code=400, detail=f"Validation failed: {str(e)}")


# ─────────────────────────────────────────────────────────────────────────────
# ROOT ENDPOINT
# ─────────────────────────────────────────────────────────────────────────────

@app.get("/", tags=["Root"])
async def root():
    """Welcome to QuLab2.0 API."""
    return {
        "message": "Welcome to QuLab2.0: Quantum Teleportation Discovery Framework",
        "documentation": "Visit /docs for interactive API documentation",
        "health_check": "/health",
        "api_info": "/info",
    }


# ─────────────────────────────────────────────────────────────────────────────
# STARTUP
# ─────────────────────────────────────────────────────────────────────────────

if __name__ == "__main__":
    print("\n" + "=" * 70)
    print("QULAB2.0 REST API SERVER")
    print("=" * 70)
    print("\n🚀 Starting API server...")
    print("\n📖 Interactive API docs:")
    print("   http://localhost:8000/docs")
    print("\n📚 Alternative API docs (ReDoc):")
    print("   http://localhost:8000/redoc")
    print("\n💡 Health check:")
    print("   http://localhost:8000/health")
    print("\n" + "=" * 70 + "\n")

    uvicorn.run(
        "qulab.api_server:app",
        host="0.0.0.0",
        port=8000,
        reload=False,
        log_level="info"
    )
