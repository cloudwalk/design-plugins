bl_info = {
    "name": "Custom Render Settings",
    "author": "Your Name",
    "version": (1, 0),
    "blender": (3, 0, 0),
    "location": "Properties > Render Properties",
    "description": "Automatically sets custom render settings",
    "warning": "",
    "doc_url": "",
    "category": "Render",
}

import bpy
from bpy.app.handlers import persistent
from bpy.types import Operator, AddonPreferences
from bpy.props import BoolProperty

class CustomRenderSettingsPreferences(AddonPreferences):
    bl_idname = __name__

    auto_apply: BoolProperty(
        name="Apply on Startup",
        default=True,
        description="Automatically apply settings when Blender starts"
    )

    def draw(self, context):
        layout = self.layout
        layout.prop(self, "auto_apply")
        layout.operator("render.apply_custom_settings")

class ApplyCustomSettingsOperator(Operator):
    bl_idname = "render.apply_custom_settings"
    bl_label = "Apply Custom Render Settings"
    bl_description = "Apply the custom render settings now"
    
    def execute(self, context):
        try:
            scene = context.scene
            
            # Switch to Cycles first
            scene.render.engine = 'CYCLES'
            
            # Render settings
            scene.render.use_border = True
            scene.render.use_persistent_data = True
            scene.render.compositor_device = 'GPU'
            
            # Cycles settings
            scene.cycles.device = 'GPU'
            scene.cycles.samples = 300
            scene.cycles.use_animated_seed = True
            scene.cycles.max_bounces = 3
            scene.cycles.filter_width = 1.1
            scene.cycles.denoising_use_gpu = True
            scene.cycles.preview_samples = 100
            scene.cycles.use_preview_denoising = True
            
            # Color management settings
            scene.view_settings.view_transform = 'Khronos PBR Neutral'
            scene.view_settings.look = 'Medium High Contrast'
            
            self.report({'INFO'}, "Custom render settings applied successfully")
        except Exception as e:
            self.report({'ERROR'}, f"Error applying settings: {str(e)}")
        return {'FINISHED'}

@persistent
def load_post_handler(dummy):
    try:
        # Get preferences
        prefs = bpy.context.preferences.addons[__name__].preferences
        if prefs.auto_apply:
            # Use timer to ensure context is available
            bpy.app.timers.register(delayed_apply_settings, first_interval=0.1)
    except Exception:
        pass

def delayed_apply_settings():
    try:
        bpy.ops.render.apply_custom_settings()
    except Exception:
        pass
    return None  # Don't repeat the timer

def draw_menu(self, context):
    layout = self.layout
    layout.operator(ApplyCustomSettingsOperator.bl_idname)

classes = (
    CustomRenderSettingsPreferences,
    ApplyCustomSettingsOperator,
)

def register():
    for cls in classes:
        bpy.utils.register_class(cls)
    
    # Add menu item to Render Properties
    bpy.types.RENDER_PT_context.append(draw_menu)
    
    # Add load handler
    bpy.app.handlers.load_post.append(load_post_handler)
    
    # Register a timer to apply settings after registration
    bpy.app.timers.register(delayed_apply_settings, first_interval=0.1)

def unregister():
    # Remove load handler
    if load_post_handler in bpy.app.handlers.load_post:
        bpy.app.handlers.load_post.remove(load_post_handler)
    
    # Remove menu item
    bpy.types.RENDER_PT_context.remove(draw_menu)
    
    # Unregister classes
    for cls in reversed(classes):
        bpy.utils.unregister_class(cls)

if __name__ == "__main__":
    register()