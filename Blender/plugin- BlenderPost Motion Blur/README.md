# Motion Blur Compositor Add-on for Blender

This Blender add-on provides an easy way to add motion blur in post-production using the compositor nodes and vector pass. It includes several physically accurate presets for different scenarios.

## Features

- Easy setup of motion blur using vector pass
- Physical presets for common scenarios:
  - Cinematic (24 fps) - Standard motion blur with 180° shutter angle (1/48)
  - Cinematic (30 fps) - Standard motion blur with 180° shutter angle (1/60)
  - Fast Action - Reduced motion blur for fast-paced scenes (1/120)
  - Dreamy - Extended motion blur for artistic effect (1/24)
- Adjustable blur scale for fine-tuning
- Automatic vector pass setup

## Installation

1. Download the `motion_blur_compositor.py` file
2. Open Blender and go to Edit > Preferences
3. Click on the "Add-ons" tab
4. Click "Install..." and navigate to the downloaded file
5. Enable the add-on by checking the box next to "Node: Motion Blur Compositor"

## Usage

1. Switch to the Compositor workspace in Blender
2. Enable "Use Nodes" if not already enabled
3. In the sidebar (press N if not visible), find the "Motion Blur" tab
4. Select a preset from the dropdown menu
5. Adjust the blur scale if needed
6. Click "Setup Motion Blur" to create the node setup
7. Render your scene (the vector pass will be automatically enabled)

## Requirements

- Blender 3.0 or newer
- Scene must be set up for rendering

## Notes

- The add-on automatically enables the vector pass in your render layers
- Existing compositor nodes will be cleared when setting up the motion blur
- For best results, ensure your scene has moving objects or camera motion
- The blur scale can be adjusted to increase or decrease the effect intensity 