"""
FastAPI endpoints for QuLab.

Provides REST API endpoints for teleportation, simulation, governance,
and encoding operations with comprehensive documentation and validation.
"""

from .teleport import router as teleport_router

# Import from backend if available, otherwise create stubs
try:
    from ..backend.api.governance import router as governance_router
except (ImportError, ModuleNotFoundError):
    governance_router = None

try:
    from ..backend.api.encoding import router as encoding_router
except (ImportError, ModuleNotFoundError):
    encoding_router = None

# Simulate router stub
class MockRouter:
    def get(self, path):
        def decorator(func):
            return func
        return decorator
    def post(self, path):
        def decorator(func):
            return func
        return decorator

simulate_router = MockRouter()

__all__ = [
    "teleport_router",
    "simulate_router",
    "governance_router",
    "encoding_router",
]
