# PBR Render Layers Setup for Blender

A Blender addon that automatically sets up render passes in a clean, organized node group for PBR (Physically Based Rendering) workflows.

## Features

- Creates a node group that combines all PBR render passes
- Automatically enables and connects all necessary render passes
- Organizes passes in a clean, non-destructive way
- Combines passes using proper Add and Multiply operations
- Keeps your compositor clean by containing all operations in a node group

### Supported Passes
- Diffuse (Direct, Indirect, Color)
- Glossy (Direct, Indirect, Color)
- Transmission (Direct, Indirect, Color)
- Emission
- Environment

## Installation

1. Download the `render_layers_setup.py` file
2. Open Blender
3. Go to Edit > Preferences > Add-ons
4. Click "Install" and select the downloaded file
5. Enable the addon by checking the box

## Usage

There are two ways to use this addon:

### Method 1: Quick Setup (Recommended)
1. Go to Properties > Render
2. Find the "PBR Setup" panel
3. Click "Setup PBR Compositor"
   - This will automatically:
     - Enable all necessary render passes
     - Create the node group
     - Set up all connections
     - Create a composite output

### Method 2: Manual Node Group Creation
1. Open the Compositor (enable "Use Nodes" if needed)
2. Press Shift + A to open the Add menu
3. Navigate to Group > PBR Render Layers Setup
4. Connect your render layer outputs manually

## Customization

After setup, you can:
- Add color correction nodes between the render layer and group inputs
- Modify the node group internals if needed
- Add additional nodes after the group output

## Requirements

- Blender 3.0 or newer
- Cycles render engine (for all passes to work properly)

## License

Free to use

## Author

Dimitri Paiva

## Contributing

Feel free to submit issues and pull requests.
