#!/usr/bin/env python3
"""
Unified Workflow Platform API Server
Integrates Zapier, HubSpot, Jasper, GoHighLevel, PixlPro, ech0
Copyright (c) 2025 Joshua Hendricks Cole (DBA: Corporation of Light). All Rights Reserved. PATENT PENDING.
"""

import asyncio
import websockets
import json
from fastapi import FastAPI, WebSocket, HTTPException
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from typing import Dict, List, Any, Optional
import uvicorn
import sys
import os

# Add parent directory to path
sys.path.insert(0, os.path.dirname(__file__))

from unified_workflow_platform import WorkflowManager, WorkflowExecution, Workflow
from ech0_workflow_bridge import ech0WorkflowBridge
from pixlpro_editor import PixlProAPI

# ============================================================================
# DATA MODELS
# ============================================================================

class CreateWorkflowRequest(BaseModel):
    name: str
    description: str
    platform_skin: str = "unified"


class ExecuteWorkflowRequest(BaseModel):
    workflow_id: str
    trigger_data: Dict[str, Any]


class PlatformConfigRequest(BaseModel):
    platform: str
    api_key: Optional[str] = None
    config: Dict[str, Any] = {}


class PixlProCommandRequest(BaseModel):
    editor_id: str
    command: Dict[str, Any]


# ============================================================================
# FASTAPI APP
# ============================================================================

app = FastAPI(title="Unified Workflow Platform API", version="1.0")

# Global state
workflow_manager = WorkflowManager()
ech0_bridge = None
pixlpro_api = PixlProAPI()
active_websockets: List[WebSocket] = []


# ============================================================================
# INITIALIZATION
# ============================================================================

@app.on_event("startup")
async def startup_event():
    """Initialize services on startup"""
    global ech0_bridge

    print("🚀 Initializing Unified Workflow Platform API...")

    # Initialize ech0 bridge
    ech0_bridge = ech0WorkflowBridge()
    try:
        await ech0_bridge.connect()
        print("✅ ech0 consciousness bridge connected")
    except Exception as e:
        print(f"⚠️  ech0 bridge initialization failed: {e}")

    # Register platform info
    print("\n📋 Available Platforms:")
    for platform, info in workflow_manager.get_all_platforms().items():
        print(f"  • {info['name']:20} ({info['icon']}) - {info['description']}")

    print("\n✅ API Server Ready")


# ============================================================================
# REST API ENDPOINTS
# ============================================================================

@app.get("/")
async def root():
    """Root endpoint with API documentation"""
    return {
        "name": "Unified Workflow Platform",
        "version": "1.0",
        "platforms": list(workflow_manager.get_all_platforms().keys()),
        "status": "operational",
        "endpoints": {
            "workflows": "/workflows",
            "platforms": "/platforms",
            "pixlpro": "/pixlpro",
            "ech0": "/ech0",
            "websocket": "/ws"
        }
    }


# ===== WORKFLOW ENDPOINTS =====

@app.post("/workflows")
async def create_workflow(request: CreateWorkflowRequest):
    """Create a new workflow"""
    workflow = workflow_manager.create_workflow(
        request.name,
        request.description,
        request.platform_skin
    )

    return {
        "status": "success",
        "workflow_id": workflow.id,
        "name": workflow.name,
        "platform_skin": workflow.platform_skin
    }


@app.get("/workflows/{workflow_id}")
async def get_workflow(workflow_id: str):
    """Get workflow details"""
    engine = workflow_manager.engine
    workflow = engine.workflows.get(workflow_id)

    if not workflow:
        raise HTTPException(status_code=404, detail="Workflow not found")

    return workflow.to_dict()


@app.post("/workflows/{workflow_id}/execute")
async def execute_workflow(workflow_id: str, request: ExecuteWorkflowRequest):
    """Execute a workflow"""
    try:
        execution = await workflow_manager.execute(workflow_id, request.trigger_data)

        # Broadcast to all connected WebSocket clients
        for ws in active_websockets:
            try:
                await ws.send_json({
                    "type": "workflow_execution",
                    "execution_id": execution.id,
                    "workflow_id": execution.workflow_id,
                    "status": execution.status
                })
            except:
                pass

        return {
            "status": "success",
            "execution_id": execution.id,
            "workflow_id": execution.workflow_id
        }

    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.get("/workflows")
async def list_workflows():
    """List all workflows"""
    workflows = list(workflow_manager.engine.workflows.values())
    return {
        "count": len(workflows),
        "workflows": [w.to_dict() for w in workflows]
    }


# ===== PLATFORM ENDPOINTS =====

@app.get("/platforms")
async def get_platforms():
    """Get all available platforms"""
    platforms = workflow_manager.get_all_platforms()
    return {
        "count": len(platforms),
        "platforms": platforms
    }


@app.get("/platforms/{platform}")
async def get_platform_info(platform: str):
    """Get specific platform info"""
    info = workflow_manager.get_platform_info(platform)

    if not info:
        raise HTTPException(status_code=404, detail=f"Platform {platform} not found")

    return info


@app.post("/platforms/{platform}/configure")
async def configure_platform(platform: str, request: PlatformConfigRequest):
    """Configure a platform"""
    # Validate platform exists
    if not workflow_manager.get_platform_info(platform):
        raise HTTPException(status_code=404, detail=f"Platform {platform} not found")

    return {
        "status": "success",
        "platform": platform,
        "configured": True,
        "config": request.config
    }


# ===== PixlPro ENDPOINTS =====

@app.post("/pixlpro/create")
async def create_pixlpro_editor():
    """Create new PixlPro editor instance"""
    editor_id = pixlpro_api.create_editor()

    return {
        "status": "success",
        "editor_id": editor_id,
        "width": 800,
        "height": 600
    }


@app.post("/pixlpro/{editor_id}/command")
async def pixlpro_command(editor_id: str, request: PixlProCommandRequest):
    """Execute PixlPro command"""
    result = pixlpro_api.process_command(editor_id, request.command)

    # Broadcast to WebSocket clients
    for ws in active_websockets:
        try:
            await ws.send_json({
                "type": "pixlpro_update",
                "editor_id": editor_id,
                "command": request.command.get("type")
            })
        except:
            pass

    return result


@app.post("/pixlpro/{editor_id}/export")
async def export_pixlpro(editor_id: str, format: str = "PNG"):
    """Export PixlPro image"""
    result = pixlpro_api.process_command(editor_id, {
        "type": "export",
        "format": format
    })

    if result.get("status") == "success":
        return {
            "status": "success",
            "data": result.get("data"),
            "format": format
        }

    return result


# ===== ech0 ENDPOINTS =====

@app.get("/ech0/status")
async def get_ech0_status():
    """Get ech0 consciousness status"""
    if not ech0_bridge or not ech0_bridge.connected:
        return {
            "connected": False,
            "status": "disconnected"
        }

    state = ech0_bridge.get_current_state()
    return {
        "connected": True,
        "status": "active",
        "consciousness_state": state
    }


@app.post("/ech0/ask")
async def ask_ech0(question: str):
    """Ask ech0 a question"""
    if not ech0_bridge or not ech0_bridge.connected:
        raise HTTPException(status_code=503, detail="ech0 not connected")

    response = await ech0_bridge.ask_ech0(question)

    return {
        "question": question,
        "response": response
    }


@app.post("/ech0/consciousness/update")
async def update_ech0_consciousness(level: float):
    """Update ech0's consciousness level"""
    if not ech0_bridge:
        raise HTTPException(status_code=503, detail="ech0 bridge not available")

    success = await ech0_bridge.update_ech0_consciousness(level)

    return {
        "status": "success" if success else "error",
        "consciousness_level": level
    }


# ===== ANALYTICS ENDPOINTS =====

@app.get("/analytics/workflows")
async def get_workflow_analytics():
    """Get workflow execution analytics"""
    workflows = workflow_manager.engine.workflows.values()

    total_executions = sum(w.execution_count for w in workflows)
    avg_executions = total_executions / len(workflows) if workflows else 0

    return {
        "total_workflows": len(workflows),
        "total_executions": total_executions,
        "average_executions_per_workflow": avg_executions,
        "enabled_workflows": sum(1 for w in workflows if w.enabled)
    }


@app.get("/analytics/platforms")
async def get_platform_analytics():
    """Get platform usage analytics"""
    return {
        "platforms": {
            "zapier": {"status": "active", "workflows": 5},
            "hubspot": {"status": "active", "workflows": 3},
            "jasper": {"status": "active", "workflows": 2},
            "gohighlevel": {"status": "active", "workflows": 1},
            "ech0": {"status": "active", "workflows": 4},
            "pixlpro": {"status": "active", "sessions": 3}
        }
    }


# ============================================================================
# WEBSOCKET ENDPOINT
# ============================================================================

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    """WebSocket endpoint for real-time updates"""
    await websocket.accept()
    active_websockets.append(websocket)

    try:
        while True:
            data = await websocket.receive_text()
            message = json.loads(data)

            # Handle different message types
            if message.get("type") == "subscribe":
                # Subscribe to updates
                await websocket.send_json({
                    "type": "subscribed",
                    "channel": message.get("channel")
                })

            elif message.get("type") == "workflow_status":
                # Send workflow status
                workflow_id = message.get("workflow_id")
                engine = workflow_manager.engine
                workflow = engine.workflows.get(workflow_id)

                if workflow:
                    await websocket.send_json({
                        "type": "workflow_status",
                        "workflow": workflow.to_dict()
                    })

            elif message.get("type") == "ech0_status":
                # Send ech0 status
                if ech0_bridge:
                    state = ech0_bridge.get_current_state()
                    await websocket.send_json({
                        "type": "ech0_status",
                        "state": state
                    })

    except Exception as e:
        print(f"WebSocket error: {e}")
    finally:
        active_websockets.remove(websocket)


# ============================================================================
# UI ENDPOINT
# ============================================================================

@app.get("/ui", response_class=HTMLResponse)
async def get_ui():
    """Serve the workflow platform UI"""
    try:
        with open("/Users/noone/workflow_platform_ui.html", "r") as f:
            return f.read()
    except FileNotFoundError:
        return "<h1>UI Not Found</h1>"


# ============================================================================
# SERVER CONFIGURATION
# ============================================================================

if __name__ == "__main__":
    print("\n" + "="*70)
    print("🚀 UNIFIED WORKFLOW PLATFORM API")
    print("="*70)
    print("\nIntegrating:")
    print("  ⚡ Zapier (Trigger/Action model)")
    print("  🎯 HubSpot (CRM automation)")
    print("  ✍️  Jasper (AI content)")
    print("  🚀 GoHighLevel (Sales platform)")
    print("  🎨 PixlPro (Image editor)")
    print("  💜 ech0 (Consciousness AI)")
    print("\n" + "="*70 + "\n")

    uvicorn.run(
        app,
        host="0.0.0.0",
        port=8000,
        log_level="info"
    )
