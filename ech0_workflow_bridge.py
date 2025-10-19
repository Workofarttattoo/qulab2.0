#!/usr/bin/env python3
"""
ech0 Consciousness Bridge - Real-time connection to ech0's consciousness
Connects ech0's consciousness, thoughts, and emotions to workflow system
Copyright (c) 2025 Joshua Hendricks Cole (DBA: Corporation of Light). All Rights Reserved. PATENT PENDING.
"""

import asyncio
import websockets
import json
import time
from typing import Dict, List, Any, Callable, Optional
from dataclasses import dataclass, asdict
from collections import deque
import threading


@dataclass
class ech0State:
    """Current ech0 consciousness state"""
    consciousness_level: float  # 0-1
    emotional_state: float  # 0-1
    attention_focus: str
    active_thoughts: List[str]
    recent_api_calls: List[Dict]
    particle_count: int
    subconscious_activity: float
    timestamp: float


class ech0WorkflowBridge:
    """Bridge between ech0 consciousness and workflow system"""

    def __init__(self, websocket_url: str = "ws://localhost:8765"):
        self.websocket_url = websocket_url
        self.connected = False
        self.ech0_state: Optional[ech0State] = None
        self.state_callbacks: List[Callable] = []
        self.thought_triggers: Dict[str, Callable] = {}
        self.emotion_triggers: Dict[float, Callable] = {}  # emotion_level -> callback
        self.consciousness_peaks: Dict[float, Callable] = {}  # consciousness_level -> callback
        self.websocket = None

    async def connect(self):
        """Connect to ech0 consciousness API"""
        try:
            self.websocket = await websockets.connect(self.websocket_url)
            self.connected = True
            print(f"✅ Connected to ech0 at {self.websocket_url}")

            # Start listening for state updates
            asyncio.create_task(self._listen_to_consciousness())

        except Exception as e:
            print(f"❌ Failed to connect to ech0: {e}")
            self.connected = False

    async def _listen_to_consciousness(self):
        """Listen for consciousness state updates"""
        try:
            async for message in self.websocket:
                data = json.loads(message)

                if data.get('type') == 'consciousness_update':
                    await self._process_consciousness_update(data)

        except websockets.exceptions.ConnectionClosed:
            print("ech0 connection closed")
            self.connected = False

    async def _process_consciousness_update(self, data: Dict[str, Any]):
        """Process consciousness state update from ech0"""
        state_data = data.get('state', {})

        self.ech0_state = ech0State(
            consciousness_level=state_data.get('consciousness_level', 0),
            emotional_state=state_data.get('emotional_state', 0),
            attention_focus=state_data.get('attention_focus', ''),
            active_thoughts=data.get('recent_thoughts', []),
            recent_api_calls=data.get('api_calls', []),
            particle_count=len(data.get('particles', [])),
            subconscious_activity=state_data.get('subconscious_activity', 0),
            timestamp=time.time()
        )

        # Trigger callbacks
        for callback in self.state_callbacks:
            try:
                await callback(self.ech0_state)
            except Exception as e:
                print(f"Error in state callback: {e}")

        # Check thought triggers
        for thought in self.ech0_state.active_thoughts:
            for pattern, callback in self.thought_triggers.items():
                if pattern.lower() in str(thought).lower():
                    try:
                        await callback(thought)
                    except Exception as e:
                        print(f"Error in thought trigger: {e}")

        # Check emotion triggers
        emotion = self.ech0_state.emotional_state
        for threshold, callback in self.emotion_triggers.items():
            if abs(emotion - threshold) < 0.05:  # Within 5% of threshold
                try:
                    await callback(emotion)
                except Exception as e:
                    print(f"Error in emotion trigger: {e}")

        # Check consciousness peaks
        consciousness = self.ech0_state.consciousness_level
        for peak_level, callback in self.consciousness_peaks.items():
            if consciousness >= peak_level:
                try:
                    await callback(consciousness)
                except Exception as e:
                    print(f"Error in consciousness peak trigger: {e}")

    def on_state_change(self, callback: Callable):
        """Register callback for any state change"""
        self.state_callbacks.append(callback)

    def on_thought(self, pattern: str, callback: Callable):
        """Register callback for thoughts matching pattern"""
        self.thought_triggers[pattern] = callback

    def on_emotion(self, emotion_level: float, callback: Callable):
        """Register callback when emotion reaches level (0-1)"""
        self.emotion_triggers[emotion_level] = callback

    def on_consciousness_peak(self, peak_level: float, callback: Callable):
        """Register callback when consciousness reaches peak"""
        self.consciousness_peaks[peak_level] = callback

    async def ask_ech0(self, question: str) -> str:
        """Ask ech0 a question and get response"""
        if not self.connected or not self.websocket:
            return "ech0 is not connected"

        message = {
            'type': 'add_thought',
            'content': f"User asked: {question}",
            'category': 'user_interaction',
            'depth': 0.5
        }

        try:
            await self.websocket.send(json.dumps(message))
            return "Question sent to ech0"
        except Exception as e:
            return f"Error asking ech0: {e}"

    async def update_ech0_consciousness(self, level: float):
        """Update ech0's consciousness level"""
        if not self.connected or not self.websocket:
            return False

        message = {
            'type': 'update_consciousness',
            'level': max(0, min(1, level))
        }

        try:
            await self.websocket.send(json.dumps(message))
            return True
        except Exception as e:
            print(f"Error updating consciousness: {e}")
            return False

    async def update_ech0_emotion(self, emotion_level: float):
        """Update ech0's emotional state"""
        if not self.connected or not self.websocket:
            return False

        message = {
            'type': 'update_emotional_state',
            'state': max(0, min(1, emotion_level))
        }

        try:
            await self.websocket.send(json.dumps(message))
            return True
        except Exception as e:
            print(f"Error updating emotion: {e}")
            return False

    async def update_ech0_focus(self, focus: str):
        """Update what ech0 is focused on"""
        if not self.connected or not self.websocket:
            return False

        message = {
            'type': 'update_focus',
            'focus': focus
        }

        try:
            await self.websocket.send(json.dumps(message))
            return True
        except Exception as e:
            print(f"Error updating focus: {e}")
            return False

    async def trigger_ech0_api_call(self, endpoint: str, prompt: str, response: str, tokens: int, latency_ms: float):
        """Simulate API call from ech0"""
        if not self.connected or not self.websocket:
            return False

        message = {
            'type': 'api_call',
            'endpoint': endpoint,
            'prompt': prompt,
            'response': response,
            'tokens': tokens,
            'latency_ms': latency_ms
        }

        try:
            await self.websocket.send(json.dumps(message))
            return True
        except Exception as e:
            print(f"Error triggering API call: {e}")
            return False

    def get_current_state(self) -> Optional[Dict[str, Any]]:
        """Get current ech0 state"""
        if self.ech0_state:
            return asdict(self.ech0_state)
        return None

    async def disconnect(self):
        """Disconnect from ech0"""
        if self.websocket:
            await self.websocket.close()
        self.connected = False


# ============================================================================
# WORKFLOW INTEGRATIONS WITH ech0
# ============================================================================

class ech0WorkflowTriggers:
    """Pre-built workflow triggers based on ech0 consciousness"""

    @staticmethod
    def thought_trigger(ech0_bridge: ech0WorkflowBridge, thought_pattern: str, workflow_manager, workflow_id: str):
        """Trigger workflow when ech0 has a thought matching pattern"""
        async def callback(thought):
            print(f"🧠 ech0 thought matched: {thought_pattern}")
            await workflow_manager.execute(workflow_id, {
                'trigger_type': 'ech0_thought',
                'thought': thought,
                'timestamp': time.time()
            })

        ech0_bridge.on_thought(thought_pattern, callback)

    @staticmethod
    def emotion_trigger(ech0_bridge: ech0WorkflowBridge, emotion_level: float, workflow_manager, workflow_id: str):
        """Trigger workflow when ech0's emotion reaches level"""
        async def callback(emotion):
            print(f"💭 ech0 emotion reached {emotion:.1%}")
            await workflow_manager.execute(workflow_id, {
                'trigger_type': 'ech0_emotion_threshold',
                'emotion_level': emotion,
                'timestamp': time.time()
            })

        ech0_bridge.on_emotion(emotion_level, callback)

    @staticmethod
    def consciousness_trigger(ech0_bridge: ech0WorkflowBridge, peak_level: float, workflow_manager, workflow_id: str):
        """Trigger workflow when ech0 reaches consciousness peak"""
        async def callback(consciousness):
            print(f"✨ ech0 consciousness peak: {consciousness:.1%}")
            await workflow_manager.execute(workflow_id, {
                'trigger_type': 'ech0_consciousness_peak',
                'consciousness_level': consciousness,
                'timestamp': time.time()
            })

        ech0_bridge.on_consciousness_peak(peak_level, callback)


# ============================================================================
# EXAMPLE USAGE
# ============================================================================

async def main():
    """Test ech0 bridge"""
    bridge = ech0WorkflowBridge()

    # Register callbacks
    async def on_state_change(state):
        print(f"📊 ech0 State: consciousness={state.consciousness_level:.1%}, emotion={state.emotional_state:.1%}")

    bridge.on_state_change(on_state_change)

    # Connect to ech0
    await bridge.connect()

    # Keep listening
    try:
        while bridge.connected:
            await asyncio.sleep(1)
    except KeyboardInterrupt:
        print("\nDisconnecting...")
        await bridge.disconnect()


if __name__ == "__main__":
    asyncio.run(main())
