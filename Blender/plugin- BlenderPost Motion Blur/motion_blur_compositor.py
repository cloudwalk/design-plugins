bl_info = {
    "name": "Motion Blur Compositor",
    "author": "Your Name",
    "version": (1, 0),
    "blender": (3, 0, 0),
    "location": "Node Editor > Add > Filter > Motion Blur Compositor",
    "description": "Adds motion blur using vector pass in compositor with physical presets",
    "warning": "",
    "doc_url": "",
    "category": "Node",
}

import bpy
from bpy.types import Operator, Panel, PropertyGroup
from bpy.props import FloatProperty, EnumProperty, PointerProperty, IntProperty, BoolProperty

# Preset definitions
MOTION_BLUR_PRESETS = [
    ('CUSTOM', "Custom", "Custom motion blur settings"),
    ('CINEMATIC_24FPS', "Cinematic (24 fps)", "Standard cinematic motion blur (1/48 shutter)"),
    ('CINEMATIC_30FPS', "Cinematic (30 fps)", "Standard cinematic motion blur (1/60 shutter)"),
    ('FAST_ACTION', "Fast Action", "Reduced motion blur for fast action (1/120 shutter)"),
    ('DREAMY', "Dreamy", "Extended motion blur for dreamy effect (1/24 shutter)"),
]

def update_motion_blur(self, context):
    """Update node values when properties change"""
    # Safety check
    if not context.scene.node_tree:
        return

    # Calculate base factor based on preset
    base_factor = 1.0  # Default for CUSTOM
    if self.preset == 'CINEMATIC_24FPS':
        base_factor = 0.5  # 1/48 shutter
    elif self.preset == 'CINEMATIC_30FPS':
        base_factor = 0.4  # 1/60 shutter
    elif self.preset == 'FAST_ACTION':
        base_factor = 0.2  # 1/120 shutter
    elif self.preset == 'DREAMY':
        base_factor = 1.0  # 1/24 shutter

    # Find and update the Motion Blur group node
    for node in context.scene.node_tree.nodes:
        if node.type == 'GROUP' and node.node_tree and node.node_tree.name == "Motion Blur Setup":
            # Update group input values
            node.inputs['Blur Scale'].default_value = base_factor * self.blur_scale
            node.inputs['Mix Factor'].default_value = self.mix_factor
            node.inputs['Depth Min'].default_value = self.depth_min
            node.inputs['Depth Max'].default_value = self.depth_max
            node.inputs['Samples'].default_value = self.samples
            node.inputs['Use Curved'].default_value = self.use_curved

            # Update the map range node inside the group
            for group_node in node.node_tree.nodes:
                if group_node.type == 'MAP_RANGE':
                    group_node.inputs[1].default_value = self.depth_min  # From Min
                    group_node.inputs[2].default_value = self.depth_max  # From Max
                    group_node.inputs[3].default_value = 0.0  # To Min
                    group_node.inputs[4].default_value = 1.0  # To Max

class MotionBlurProperties(PropertyGroup):
    preset: EnumProperty(
        name="Preset",
        description="Motion blur presets",
        items=MOTION_BLUR_PRESETS,
        default='CINEMATIC_24FPS',
        update=update_motion_blur
    )

    blur_scale: FloatProperty(
        name="Blur Scale",
        description="Multiplier for the motion blur effect",
        default=1.0,
        min=0.0,
        max=10.0,
        precision=3,
        update=update_motion_blur
    )

    mix_factor: FloatProperty(
        name="Mix Factor",
        description="Blend between original and motion blurred image",
        default=1.0,
        min=0.0,
        max=1.0,
        update=update_motion_blur
    )

    samples: IntProperty(
        name="Samples",
        description="Number of samples for motion blur quality",
        default=32,
        min=1,
        max=256,
        update=update_motion_blur
    )

    use_curved: BoolProperty(
        name="Curved Motion",
        description="Use curved motion for more natural blur",
        default=True,
        update=update_motion_blur
    )

    depth_min: FloatProperty(
        name="Depth Min",
        description="Minimum depth value for Z-pass mapping",
        default=0.0,
        min=0.0,
        max=100.0,
        update=update_motion_blur
    )

    depth_max: FloatProperty(
        name="Depth Max",
        description="Maximum depth value for Z-pass mapping",
        default=1.0,
        min=0.0,
        max=100.0,
        update=update_motion_blur
    )

class NODE_OT_motion_blur_setup(Operator):
    bl_idname = "node.setup_motion_blur"
    bl_label = "Setup Motion Blur"
    bl_description = "Sets up motion blur nodes in the compositor"
    bl_options = {'REGISTER', 'UNDO'}

    def setup_vector_pass(self, context):
        """Enable vector and depth passes in render layers"""
        for view_layer in context.scene.view_layers:
            view_layer.use_pass_vector = True
            view_layer.use_pass_z = True

    def create_node_setup(self, context):
        scene = context.scene
        if not scene.use_nodes:
            scene.use_nodes = True
            
        tree = scene.node_tree
        if not tree:
            self.report({'ERROR'}, "No node tree available")
            return {'CANCELLED'}
            
        # Find existing render layer node or create a new one
        render_layers = None
        for node in tree.nodes:
            if node.type == 'R_LAYERS':
                render_layers = node
                break
        
        if not render_layers:
            render_layers = tree.nodes.new('CompositorNodeRLayers')
            render_layers.location = (-600, 0)
        
        # Create motion blur nodes
        blur_node = tree.nodes.new('CompositorNodeVecBlur')
        normalize = tree.nodes.new('CompositorNodeNormalize')
        invert = tree.nodes.new('CompositorNodeInvert')
        map_range = tree.nodes.new('CompositorNodeMapRange')
        mix_node = tree.nodes.new('CompositorNodeMixRGB')
        
        # Position nodes relative to render layer node
        base_x = render_layers.location.x
        base_y = render_layers.location.y
        
        normalize.location = (base_x + 300, base_y - 200)
        invert.location = (base_x + 500, base_y - 200)
        map_range.location = (base_x + 700, base_y - 200)
        blur_node.location = (base_x + 900, base_y)
        mix_node.location = (base_x + 1100, base_y)
        
        # Set up nodes
        mix_node.blend_type = 'MIX'
        map_range.use_clamp = True
        
        props = scene.motion_blur_props
        
        # Calculate base factor based on preset
        base_factor = 1.0  # Default for CUSTOM
        if props.preset == 'CINEMATIC_24FPS':
            base_factor = 0.5
        elif props.preset == 'CINEMATIC_30FPS':
            base_factor = 0.4
        elif props.preset == 'FAST_ACTION':
            base_factor = 0.2
        elif props.preset == 'DREAMY':
            base_factor = 1.0
            
        # Set Vector Blur node properties
        blur_node.factor = base_factor * props.blur_scale
        blur_node.samples = props.samples
        blur_node.use_curved = props.use_curved
        
        # Set mix factor
        mix_node.inputs[0].default_value = props.mix_factor
        
        # Set depth range
        map_range.inputs[1].default_value = props.depth_min  # From Min
        map_range.inputs[2].default_value = props.depth_max  # From Max
        map_range.inputs[3].default_value = 0.0  # To Min
        map_range.inputs[4].default_value = 1.0  # To Max
        
        # Create links
        links = tree.links
        
        # Store original output connections if they exist
        original_image_links = []
        composite_node = None
        
        if 'Image' in render_layers.outputs:
            for link in render_layers.outputs['Image'].links:
                if link.to_node != blur_node and link.to_node != mix_node:
                    if link.to_node.type == 'COMPOSITE':
                        composite_node = link.to_node
                    else:
                        original_image_links.append((link.to_socket, link.to_node))
        
        # Find or create Composite node
        if not composite_node:
            for node in tree.nodes:
                if node.type == 'COMPOSITE':
                    composite_node = node
                    break
            
            if not composite_node:
                composite_node = tree.nodes.new('CompositorNodeComposite')
                composite_node.location = (base_x + 1300, base_y)
        
        # Image and Vector connections
        links.new(render_layers.outputs['Image'], blur_node.inputs['Image'])
        links.new(render_layers.outputs['Image'], mix_node.inputs[1])
        links.new(render_layers.outputs['Vector'], blur_node.inputs['Speed'])
        
        # Z pass processing chain
        links.new(render_layers.outputs['Depth'], normalize.inputs[0])
        links.new(normalize.outputs[0], invert.inputs[1])
        links.new(invert.outputs[0], map_range.inputs[0])
        links.new(map_range.outputs[0], blur_node.inputs['Z'])
        
        # Connect blur output to mix node
        links.new(blur_node.outputs[0], mix_node.inputs[2])
        
        # Connect mix node to Composite node
        links.new(mix_node.outputs[0], composite_node.inputs[0])
        
        # Reconnect original image connections to the mix node output (except Composite)
        for to_socket, to_node in original_image_links:
            links.new(mix_node.outputs[0], to_socket)
        
        # Force an update of all properties
        update_motion_blur(props, context)

    def execute(self, context):
        self.create_node_setup(context)
        return {'FINISHED'}

class NODE_OT_motion_blur_test(Operator):
    bl_idname = "node.motion_blur_test"
    bl_label = "Add Test Animation"
    bl_description = "Adds a rotating cube to test curved vs linear motion blur"
    bl_options = {'REGISTER', 'UNDO'}
    
    def execute(self, context):
        # Create a cube if it doesn't exist
        if 'Motion Blur Test Cube' not in bpy.data.objects:
            bpy.ops.mesh.primitive_cube_add(size=2.0)
            cube = context.active_object
            cube.name = 'Motion Blur Test Cube'
        else:
            cube = bpy.data.objects['Motion Blur Test Cube']
        
        # Clear existing animation
        cube.animation_data_clear()
        
        # Set up rotation animation
        cube.rotation_euler = (0, 0, 0)
        cube.keyframe_insert(data_path="rotation_euler", frame=1)
        
        cube.rotation_euler = (0, 0, 6.28319)  # 360 degrees in radians
        cube.keyframe_insert(data_path="rotation_euler", frame=24)
        
        # Set interpolation to linear for better demonstration
        for fc in cube.animation_data.action.fcurves:
            for kf in fc.keyframe_points:
                kf.interpolation = 'LINEAR'
        
        # Set frame range
        context.scene.frame_start = 1
        context.scene.frame_end = 24
        
        # Set up camera if it doesn't exist
        if 'Motion Blur Test Camera' not in bpy.data.objects:
            bpy.ops.object.camera_add(location=(0, -6, 0), rotation=(1.5708, 0, 0))  # 90 degrees in radians
            camera = context.active_object
            camera.name = 'Motion Blur Test Camera'
            context.scene.camera = camera
        
        self.report({'INFO'}, "Test setup created! Compare curved vs linear motion at frame 12")
        return {'FINISHED'}

class NODE_PT_motion_blur(Panel):
    bl_label = "Motion Blur Compositor"
    bl_space_type = 'NODE_EDITOR'
    bl_region_type = 'UI'
    bl_category = 'Motion Blur'
    
    @classmethod
    def poll(cls, context):
        return context.scene.node_tree and context.scene.node_tree.type == 'COMPOSITING'
    
    def draw(self, context):
        layout = self.layout
        props = context.scene.motion_blur_props
        
        # Main settings
        main_box = layout.box()
        main_box.label(text="Motion Blur Settings")
        main_box.prop(props, "preset")
        row = main_box.row(align=True)
        row.prop(props, "blur_scale", slider=True)
        row.prop(props, "mix_factor", slider=True)
        
        # Quality settings
        quality_box = layout.box()
        quality_box.label(text="Quality Settings")
        quality_box.prop(props, "samples")
        quality_box.prop(props, "use_curved")
        
        # Depth settings
        depth_box = layout.box()
        depth_box.label(text="Depth Settings")
        depth_box.prop(props, "depth_min")
        depth_box.prop(props, "depth_max")
        
        # Setup button
        layout.operator("node.setup_motion_blur")
        
        # Add test setup button
        box = layout.box()
        box.label(text="Testing:", icon='CAMERA_DATA')
        box.operator("node.motion_blur_test", icon='CUBE')
        box.label(text="1. Add test setup", icon='TRIA_RIGHT')
        box.label(text="2. Go to frame 12", icon='TRIA_RIGHT')
        box.label(text="3. Toggle Curved Motion", icon='TRIA_RIGHT')
        box.label(text="4. Render to see difference", icon='TRIA_RIGHT')

classes = (
    MotionBlurProperties,
    NODE_OT_motion_blur_setup,
    NODE_OT_motion_blur_test,
    NODE_PT_motion_blur,
)

def register():
    for cls in classes:
        bpy.utils.register_class(cls)
    bpy.types.Scene.motion_blur_props = PointerProperty(type=MotionBlurProperties)

def unregister():
    for cls in reversed(classes):
        bpy.utils.unregister_class(cls)
    del bpy.types.Scene.motion_blur_props

if __name__ == "__main__":
    register() 