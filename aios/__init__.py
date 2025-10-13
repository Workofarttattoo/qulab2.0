"""
AI:OS control-plane package.

This module exposes helpers for constructing the AI:OS runtime from the
default manifest or a user-provided configuration bundle.  The CLI entrypoint
(`aios/aios`) imports from here.
"""

# Branding
DISPLAY_NAME = "AI:OS"
DISPLAY_NAME_FULL = "AI:OS - Agentic Intelligence Operating System"
VERSION = "0.1.0"

from .config import load_manifest
from .probabilistic_core import agentaos_load
from .prompt import IntentMatch, PromptRouter
from .runtime import AgentaRuntime
from .settings import settings

__all__ = [
    "DISPLAY_NAME",
    "DISPLAY_NAME_FULL",
    "VERSION",
    "AgentaRuntime",
    "agentaos_load",
    "load_manifest",
    "PromptRouter",
    "IntentMatch",
    "settings"
]
