bl_info = {
    "name": "PBR Render Layers Setup",
    "author": "Assistant",
    "version": (1, 0),
    "blender": (3, 0, 0),
    "location": "Properties > Render > PBR Setup and Node Editor > Add > Group",
    "description": "Creates a PBR render layers setup with all passes",
    "category": "Render",
}

import bpy
from bpy.types import Operator, Panel
from bpy.utils import register_class, unregister_class

class SetupPBRCompositor(Operator):
    bl_idname = "render.setup_pbr_compositor"
    bl_label = "Setup PBR Compositor"
    bl_options = {'REGISTER', 'UNDO'}
    
    def execute(self, context):
        # Enable use_nodes for the scene
        context.scene.use_nodes = True
        
        # Enable all necessary render passes in the View Layer
        view_layer = context.view_layer
        # Diffuse
        view_layer.use_pass_diffuse_direct = True
        view_layer.use_pass_diffuse_indirect = True
        view_layer.use_pass_diffuse_color = True
        # Glossy
        view_layer.use_pass_glossy_direct = True
        view_layer.use_pass_glossy_indirect = True
        view_layer.use_pass_glossy_color = True
        # Transmission
        view_layer.use_pass_transmission_direct = True
        view_layer.use_pass_transmission_indirect = True
        view_layer.use_pass_transmission_color = True
        # Additional passes
        view_layer.use_pass_emit = True
        view_layer.use_pass_environment = True
        
        # Clear existing nodes
        context.scene.node_tree.nodes.clear()
        
        # Create render layer node
        rl = context.scene.node_tree.nodes.new('CompositorNodeRLayers')
        rl.location = (-600, 0)
        
        # Create the node group if it doesn't exist
        if 'PBR Render Layers Setup' not in bpy.data.node_groups:
            bpy.ops.node.create_pbr_setup()
        
        # Create group node
        group = context.scene.node_tree.nodes.new('CompositorNodeGroup')
        group.node_tree = bpy.data.node_groups['PBR Render Layers Setup']
        group.location = (-300, 0)
        
        # Create composite output
        composite = context.scene.node_tree.nodes.new('CompositorNodeComposite')
        composite.location = (0, 0)
        
        # Debug: Print all available outputs
        print("Available Render Layer outputs:", [o.name for o in rl.outputs])
        print("Available Group inputs:", [i.name for i in group.inputs])
        
        # Create links
        links = context.scene.node_tree.links
        
        try:
            # Connect all passes with error checking
            # Diffuse passes
            print("Connecting Diffuse passes...")
            links.new(rl.outputs['DiffDir'], group.inputs['Diffuse Direct'])
            links.new(rl.outputs['DiffInd'], group.inputs['Diffuse Indirect'])
            links.new(rl.outputs['DiffCol'], group.inputs['Diffuse Color'])
            
            # Glossy passes
            print("Connecting Glossy passes...")
            links.new(rl.outputs['GlossDir'], group.inputs['Glossy Direct'])
            links.new(rl.outputs['GlossInd'], group.inputs['Glossy Indirect'])
            links.new(rl.outputs['GlossCol'], group.inputs['Glossy Color'])
            
            # Transmission passes
            print("Connecting Transmission passes...")
            links.new(rl.outputs['TransDir'], group.inputs['Transmission Direct'])
            links.new(rl.outputs['TransInd'], group.inputs['Transmission Indirect'])
            links.new(rl.outputs['TransCol'], group.inputs['Transmission Color'])
            
            # Additional passes
            print("Connecting additional passes...")
            links.new(rl.outputs['Emit'], group.inputs['Emission'])
            links.new(rl.outputs['Env'], group.inputs['Environment'])
            
            # Connect output
            links.new(group.outputs['Combined'], composite.inputs[0])
            
        except Exception as e:
            print(f"Error connecting nodes: {str(e)}")
            return {'CANCELLED'}
        
        return {'FINISHED'}

class CreatePBRRenderLayersSetup(Operator):
    bl_idname = "node.create_pbr_setup"
    bl_label = "PBR Render Layers Setup"
    bl_options = {'REGISTER', 'UNDO'}

    def execute(self, context):
        # Check if the node group already exists and remove it
        if 'PBR Render Layers Setup' in bpy.data.node_groups:
            bpy.data.node_groups.remove(bpy.data.node_groups['PBR Render Layers Setup'])
        
        # Create new node group
        node_group = bpy.data.node_groups.new(type="CompositorNodeTree", name="PBR Render Layers Setup")
        
        # Create group input/output nodes first
        group_in = node_group.nodes.new('NodeGroupInput')
        group_in.location = (-800, 0)
        group_out = node_group.nodes.new('NodeGroupOutput')
        group_out.location = (400, 0)
        
        # Create input sockets
        input_names = [
            'Diffuse Direct', 'Diffuse Indirect', 'Diffuse Color',
            'Glossy Direct', 'Glossy Indirect', 'Glossy Color',
            'Transmission Direct', 'Transmission Indirect', 'Transmission Color',
            'Emission', 'Environment'
        ]
        
        for name in input_names:
            node_group.interface.new_socket(name=name, in_out='INPUT', socket_type='NodeSocketColor')
        
        # Create output socket
        node_group.interface.new_socket(name='Combined', in_out='OUTPUT', socket_type='NodeSocketColor')
        
        # Create nodes
        nodes = node_group.nodes
        
        # Diffuse nodes
        diffuse_add = nodes.new('CompositorNodeMixRGB')
        diffuse_add.blend_type = 'ADD'
        diffuse_add.location = (-400, 200)
        diffuse_add.inputs[0].default_value = 1
        
        diffuse_mult = nodes.new('CompositorNodeMixRGB')
        diffuse_mult.blend_type = 'MULTIPLY'
        diffuse_mult.location = (-200, 200)
        diffuse_mult.inputs[0].default_value = 1
        
        # Glossy nodes
        glossy_add = nodes.new('CompositorNodeMixRGB')
        glossy_add.blend_type = 'ADD'
        glossy_add.location = (-400, 0)
        glossy_add.inputs[0].default_value = 1
        
        glossy_mult = nodes.new('CompositorNodeMixRGB')
        glossy_mult.blend_type = 'MULTIPLY'
        glossy_mult.location = (-200, 0)
        glossy_mult.inputs[0].default_value = 1
        
        # Transmission nodes
        trans_add = nodes.new('CompositorNodeMixRGB')
        trans_add.blend_type = 'ADD'
        trans_add.location = (-400, -200)
        trans_add.inputs[0].default_value = 1
        
        trans_mult = nodes.new('CompositorNodeMixRGB')
        trans_mult.blend_type = 'MULTIPLY'
        trans_mult.location = (-200, -200)
        trans_mult.inputs[0].default_value = 1
        
        # Final combination nodes
        add1 = nodes.new('CompositorNodeMixRGB')
        add1.blend_type = 'ADD'
        add1.inputs[0].default_value = 1
        add1.location = (0, 0)
        
        add2 = nodes.new('CompositorNodeMixRGB')
        add2.blend_type = 'ADD'
        add2.inputs[0].default_value = 1
        add2.location = (100, 0)
        
        add3 = nodes.new('CompositorNodeMixRGB')
        add3.blend_type = 'ADD'
        add3.inputs[0].default_value = 1
        add3.location = (200, 0)
        
        final_add = nodes.new('CompositorNodeMixRGB')
        final_add.blend_type = 'ADD'
        final_add.inputs[0].default_value = 1
        final_add.location = (300, 0)
        
        # Create all links
        links = node_group.links
        
        # Connect Add nodes
        # Diffuse
        links.new(group_in.outputs['Diffuse Direct'], diffuse_add.inputs[1])
        links.new(group_in.outputs['Diffuse Indirect'], diffuse_add.inputs[2])
        
        # Glossy
        links.new(group_in.outputs['Glossy Direct'], glossy_add.inputs[1])
        links.new(group_in.outputs['Glossy Indirect'], glossy_add.inputs[2])
        
        # Transmission
        links.new(group_in.outputs['Transmission Direct'], trans_add.inputs[1])
        links.new(group_in.outputs['Transmission Indirect'], trans_add.inputs[2])
        
        # Connect to Multiply nodes
        # Diffuse
        links.new(diffuse_add.outputs[0], diffuse_mult.inputs[1])
        links.new(group_in.outputs['Diffuse Color'], diffuse_mult.inputs[2])
        
        # Glossy
        links.new(glossy_add.outputs[0], glossy_mult.inputs[1])
        links.new(group_in.outputs['Glossy Color'], glossy_mult.inputs[2])
        
        # Transmission
        links.new(trans_add.outputs[0], trans_mult.inputs[1])
        links.new(group_in.outputs['Transmission Color'], trans_mult.inputs[2])
        
        # Combine everything
        links.new(diffuse_mult.outputs[0], add1.inputs[1])
        links.new(glossy_mult.outputs[0], add1.inputs[2])
        
        links.new(add1.outputs[0], add2.inputs[1])
        links.new(trans_mult.outputs[0], add2.inputs[2])
        
        links.new(add2.outputs[0], add3.inputs[1])
        links.new(group_in.outputs['Emission'], add3.inputs[2])
        
        links.new(add3.outputs[0], final_add.inputs[1])
        links.new(group_in.outputs['Environment'], final_add.inputs[2])
        
        # Connect to output
        links.new(final_add.outputs[0], group_out.inputs[0])
        
        return {'FINISHED'}

class PBR_PT_SetupPanel(Panel):
    bl_label = "PBR Setup"
    bl_idname = "RENDER_PT_pbr_setup"
    bl_space_type = 'PROPERTIES'
    bl_region_type = 'WINDOW'
    bl_context = "render"
    
    def draw(self, context):
        layout = self.layout
        layout.operator(SetupPBRCompositor.bl_idname)

def menu_func(self, context):
    self.layout.operator(CreatePBRRenderLayersSetup.bl_idname)

def register():
    register_class(CreatePBRRenderLayersSetup)
    register_class(SetupPBRCompositor)
    register_class(PBR_PT_SetupPanel)
    bpy.types.NODE_MT_add.append(menu_func)

def unregister():
    unregister_class(PBR_PT_SetupPanel)
    unregister_class(SetupPBRCompositor)
    unregister_class(CreatePBRRenderLayersSetup)
    bpy.types.NODE_MT_add.remove(menu_func)

if __name__ == "__main__":
    register() 