#!/usr/bin/env python3
"""
PixlPro - Photoshop-like Image Editor by Joshua Hendricks Cole
Browser-callable image editing engine
Copyright (c) 2025 Joshua Hendricks Cole (DBA: Corporation of Light). All Rights Reserved. PATENT PENDING.
"""

import base64
import io
from PIL import Image, ImageDraw, ImageFont, ImageFilter, ImageOps
import json
from typing import Dict, Any, Tuple, List, Optional
from dataclasses import dataclass
from enum import Enum
import uuid


class PixlProTool(Enum):
    """Available PixlPro tools"""
    BRUSH = "brush"
    ERASER = "eraser"
    PENCIL = "pencil"
    FILL = "fill"
    TEXT = "text"
    CROP = "crop"
    RESIZE = "resize"
    ROTATE = "rotate"
    FILTER = "filter"
    LAYER = "layer"
    SELECTION = "selection"
    CLONE = "clone"
    BLUR = "blur"
    SHARPEN = "sharpen"


class PixlProFilter(Enum):
    """Available PixlPro filters"""
    BLUR = "BLUR"
    SHARPEN = "SHARPEN"
    EDGE_ENHANCE = "EDGE_ENHANCE"
    SMOOTH = "SMOOTH"
    EMBOSS = "EMBOSS"
    POSTERIZE = "POSTERIZE"
    GRAYSCALE = "GRAYSCALE"
    SEPIA = "SEPIA"
    INVERT = "INVERT"
    BRIGHTNESS = "BRIGHTNESS"
    CONTRAST = "CONTRAST"
    SATURATE = "SATURATE"


@dataclass
class PixlProLayer:
    """Represents an image layer"""
    id: str
    name: str
    image: Image.Image
    opacity: float = 1.0
    blend_mode: str = "normal"
    visible: bool = True
    x: int = 0
    y: int = 0

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'opacity': self.opacity,
            'blend_mode': self.blend_mode,
            'visible': self.visible,
            'x': self.x,
            'y': self.y
        }


class PixlProEditor:
    """Photoshop-like image editor"""

    def __init__(self, width: int = 800, height: int = 600):
        self.width = width
        self.height = height
        self.layers: Dict[str, PixlProLayer] = {}
        self.active_layer_id: Optional[str] = None
        self.history: List[Image.Image] = []
        self.undo_stack: List[Image.Image] = []
        self.clipboard: Optional[Image.Image] = None

        # Create base layer
        self.create_layer("Background", Image.new("RGBA", (width, height), (255, 255, 255, 255)))

    def create_layer(self, name: str, image: Optional[Image.Image] = None) -> str:
        """Create a new layer"""
        layer_id = str(uuid.uuid4())

        if image is None:
            image = Image.new("RGBA", (self.width, self.height), (0, 0, 0, 0))

        layer = PixlProLayer(
            id=layer_id,
            name=name,
            image=image
        )

        self.layers[layer_id] = layer
        self.active_layer_id = layer_id
        return layer_id

    def delete_layer(self, layer_id: str):
        """Delete a layer"""
        if layer_id in self.layers:
            del self.layers[layer_id]
            if self.active_layer_id == layer_id:
                self.active_layer_id = list(self.layers.keys())[0] if self.layers else None

    def set_active_layer(self, layer_id: str):
        """Set active layer"""
        if layer_id in self.layers:
            self.active_layer_id = layer_id

    def get_active_layer(self) -> Optional[PixlProLayer]:
        """Get currently active layer"""
        if self.active_layer_id:
            return self.layers.get(self.active_layer_id)
        return None

    def draw_brush_stroke(self, x: int, y: int, size: int, color: Tuple[int, int, int, int], pressure: float = 1.0):
        """Draw brush stroke on active layer"""
        layer = self.get_active_layer()
        if not layer:
            return

        draw = ImageDraw.Draw(layer.image)
        radius = int(size / 2 * pressure)
        draw.ellipse(
            [(x - radius, y - radius), (x + radius, y + radius)],
            fill=color
        )

        self._record_history(layer)

    def draw_line(self, x1: int, y1: int, x2: int, y2: int, size: int, color: Tuple[int, int, int, int]):
        """Draw line on active layer"""
        layer = self.get_active_layer()
        if not layer:
            return

        draw = ImageDraw.Draw(layer.image)
        draw.line([(x1, y1), (x2, y2)], fill=color, width=size)
        self._record_history(layer)

    def add_text(self, x: int, y: int, text: str, font_size: int, color: Tuple[int, int, int, int]):
        """Add text to active layer"""
        layer = self.get_active_layer()
        if not layer:
            return

        draw = ImageDraw.Draw(layer.image)
        try:
            font = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", font_size)
        except:
            font = ImageFont.load_default()

        draw.text((x, y), text, font=font, fill=color)
        self._record_history(layer)

    def fill_color(self, x: int, y: int, color: Tuple[int, int, int, int]):
        """Fill area with color (flood fill)"""
        layer = self.get_active_layer()
        if not layer:
            return

        ImageDraw.floodfill(layer.image, (x, y), color)
        self._record_history(layer)

    def apply_filter(self, filter_type: PixlProFilter, strength: float = 1.0):
        """Apply filter to active layer"""
        layer = self.get_active_layer()
        if not layer:
            return

        image = layer.image

        if filter_type == PixlProFilter.BLUR:
            image = image.filter(ImageFilter.GaussianBlur(radius=int(5 * strength)))
        elif filter_type == PixlProFilter.SHARPEN:
            image = image.filter(ImageFilter.SHARPEN)
        elif filter_type == PixlProFilter.EDGE_ENHANCE:
            image = image.filter(ImageFilter.EDGE_ENHANCE)
        elif filter_type == PixlProFilter.SMOOTH:
            image = image.filter(ImageFilter.SMOOTH)
        elif filter_type == PixlProFilter.EMBOSS:
            image = image.filter(ImageFilter.EMBOSS)
        elif filter_type == PixlProFilter.GRAYSCALE:
            image = ImageOps.grayscale(image).convert("RGBA")
        elif filter_type == PixlProFilter.INVERT:
            image = ImageOps.invert(image)
        elif filter_type == PixlProFilter.BLUR:
            image = image.filter(ImageFilter.GaussianBlur(radius=int(5 * strength)))

        layer.image = image
        self._record_history(layer)

    def resize(self, width: int, height: int):
        """Resize canvas"""
        self.width = width
        self.height = height

        for layer in self.layers.values():
            layer.image = layer.image.resize((width, height), Image.Resampling.LANCZOS)

    def crop(self, x1: int, y1: int, x2: int, y2: int):
        """Crop canvas"""
        layer = self.get_active_layer()
        if not layer:
            return

        layer.image = layer.image.crop((x1, y1, x2, y2))
        self._record_history(layer)

    def rotate(self, degrees: float, expand: bool = False):
        """Rotate active layer"""
        layer = self.get_active_layer()
        if not layer:
            return

        layer.image = layer.image.rotate(degrees, expand=expand)
        self._record_history(layer)

    def flip_horizontal(self):
        """Flip active layer horizontally"""
        layer = self.get_active_layer()
        if not layer:
            return

        layer.image = ImageOps.mirror(layer.image)
        self._record_history(layer)

    def flip_vertical(self):
        """Flip active layer vertically"""
        layer = self.get_active_layer()
        if not layer:
            return

        layer.image = ImageOps.flip(layer.image)
        self._record_history(layer)

    def set_layer_opacity(self, layer_id: str, opacity: float):
        """Set layer opacity (0-1)"""
        if layer_id in self.layers:
            self.layers[layer_id].opacity = max(0, min(1, opacity))

    def merge_down(self):
        """Merge active layer with layer below"""
        if not self.active_layer_id:
            return

        layer_ids = list(self.layers.keys())
        idx = layer_ids.index(self.active_layer_id)

        if idx > 0:
            current = self.layers[self.active_layer_id]
            below = self.layers[layer_ids[idx - 1]]

            # Create merged image
            merged = Image.new("RGBA", (self.width, self.height), (0, 0, 0, 0))
            merged.paste(below.image, (0, 0), below.image)
            merged.paste(current.image, (0, 0), current.image)

            below.image = merged
            del self.layers[self.active_layer_id]
            self.active_layer_id = layer_ids[idx - 1]

    def flatten(self) -> Image.Image:
        """Flatten all layers to single image"""
        result = Image.new("RGBA", (self.width, self.height), (255, 255, 255, 255))

        for layer in self.layers.values():
            if layer.visible:
                layer_copy = layer.image.copy()

                # Apply opacity
                if layer.opacity < 1.0:
                    alpha = layer_copy.split()[3]
                    alpha = ImageOps.scale(alpha, int(255 * layer.opacity) / 255)
                    layer_copy.putalpha(alpha)

                result.paste(layer_copy, (layer.x, layer.y), layer_copy)

        return result

    def export_base64(self, format: str = "PNG") -> str:
        """Export as base64 string"""
        image = self.flatten()
        buffer = io.BytesIO()
        image.save(buffer, format=format)
        buffer.seek(0)
        return base64.b64encode(buffer.read()).decode('utf-8')

    def export_file(self, filepath: str, format: str = "PNG"):
        """Export to file"""
        image = self.flatten()
        image.save(filepath, format=format)

    def undo(self):
        """Undo last action"""
        if self.history:
            self.undo_stack.append(self.flatten())
            # Restore previous state
            layer = self.get_active_layer()
            if layer and self.history:
                layer.image = self.history.pop()

    def redo(self):
        """Redo last undone action"""
        if self.undo_stack:
            layer = self.get_active_layer()
            if layer:
                self.history.append(layer.image)
                layer.image = self.undo_stack.pop()

    def copy(self):
        """Copy active layer to clipboard"""
        layer = self.get_active_layer()
        if layer:
            self.clipboard = layer.image.copy()

    def paste(self) -> str:
        """Paste clipboard as new layer"""
        if self.clipboard:
            layer_id = self.create_layer("Pasted", self.clipboard.copy())
            return layer_id
        return None

    def get_layers_info(self) -> List[Dict]:
        """Get info about all layers"""
        return [layer.to_dict() for layer in self.layers.values()]

    def _record_history(self, layer: PixlProLayer):
        """Record layer state for undo"""
        self.history.append(layer.image.copy())
        self.undo_stack.clear()

    def get_state(self) -> Dict[str, Any]:
        """Get editor state"""
        return {
            'width': self.width,
            'height': self.height,
            'active_layer_id': self.active_layer_id,
            'layers': self.get_layers_info(),
            'has_clipboard': self.clipboard is not None,
            'history_size': len(self.history),
            'undo_stack_size': len(self.undo_stack)
        }


# ============================================================================
# PIXLPRO API
# ============================================================================

class PixlProAPI:
    """API for PixlPro editor operations"""

    def __init__(self):
        self.editors: Dict[str, PixlProEditor] = {}

    def create_editor(self, width: int = 800, height: int = 600) -> str:
        """Create new editor instance"""
        editor_id = str(uuid.uuid4())
        self.editors[editor_id] = PixlProEditor(width, height)
        return editor_id

    def get_editor(self, editor_id: str) -> Optional[PixlProEditor]:
        """Get editor instance"""
        return self.editors.get(editor_id)

    def delete_editor(self, editor_id: str):
        """Delete editor instance"""
        if editor_id in self.editors:
            del self.editors[editor_id]

    def process_command(self, editor_id: str, command: Dict[str, Any]) -> Dict[str, Any]:
        """Process editor command"""
        editor = self.get_editor(editor_id)
        if not editor:
            return {'error': 'Editor not found'}

        cmd_type = command.get('type')

        try:
            if cmd_type == 'draw_brush':
                editor.draw_brush_stroke(
                    command['x'], command['y'],
                    command['size'], tuple(command['color']),
                    command.get('pressure', 1.0)
                )
                return {'status': 'success', 'action': 'draw_brush'}

            elif cmd_type == 'draw_line':
                editor.draw_line(
                    command['x1'], command['y1'],
                    command['x2'], command['y2'],
                    command['size'], tuple(command['color'])
                )
                return {'status': 'success', 'action': 'draw_line'}

            elif cmd_type == 'add_text':
                editor.add_text(
                    command['x'], command['y'],
                    command['text'], command['font_size'],
                    tuple(command['color'])
                )
                return {'status': 'success', 'action': 'add_text'}

            elif cmd_type == 'fill':
                editor.fill_color(
                    command['x'], command['y'],
                    tuple(command['color'])
                )
                return {'status': 'success', 'action': 'fill'}

            elif cmd_type == 'apply_filter':
                editor.apply_filter(
                    PixlProFilter[command['filter']],
                    command.get('strength', 1.0)
                )
                return {'status': 'success', 'action': 'apply_filter'}

            elif cmd_type == 'resize':
                editor.resize(command['width'], command['height'])
                return {'status': 'success', 'action': 'resize'}

            elif cmd_type == 'rotate':
                editor.rotate(command['degrees'], command.get('expand', False))
                return {'status': 'success', 'action': 'rotate'}

            elif cmd_type == 'flip_horizontal':
                editor.flip_horizontal()
                return {'status': 'success', 'action': 'flip_horizontal'}

            elif cmd_type == 'flip_vertical':
                editor.flip_vertical()
                return {'status': 'success', 'action': 'flip_vertical'}

            elif cmd_type == 'undo':
                editor.undo()
                return {'status': 'success', 'action': 'undo'}

            elif cmd_type == 'redo':
                editor.redo()
                return {'status': 'success', 'action': 'redo'}

            elif cmd_type == 'export':
                base64_data = editor.export_base64(command.get('format', 'PNG'))
                return {
                    'status': 'success',
                    'action': 'export',
                    'data': base64_data,
                    'format': command.get('format', 'PNG')
                }

            elif cmd_type == 'get_state':
                return {'status': 'success', 'state': editor.get_state()}

            else:
                return {'error': f'Unknown command: {cmd_type}'}

        except Exception as e:
            return {'error': str(e), 'command': cmd_type}


if __name__ == "__main__":
    print("✅ PixlPro editor initialized")
