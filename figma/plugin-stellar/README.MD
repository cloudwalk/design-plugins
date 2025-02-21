# Stellar

A Figma plugin that helps create identifiers and connectors to organize your design system documentation. This tool makes it easy to create visual documentation with consistent styling and clear navigation flows.

## Features

### Identifiers
- Frame Identifier: Create headers to identify individual frames
- Section Identifier: Create headers to group related frames
- Flow Identifier: Create headers for navigation flows
- Status indicators with customizable states:
  - Planning states (In progress, Highlight)
  - Design states (Prototype, Ready for development)
  - Review states (In review, Test, Need discussion)
  - Alert states (On hold, Attention, Don't)
  - Completion states (Completed, In production, Archived)

### Connectors
- Multiple connector styles:
  - Default Line
  - Success Line
  - Error Line
  - Dashed Line
- Automatic orthogonal routing between frames
- Optional text labels on connectors
- Light/Dark theme support
- Customizable stroke weight and opacity

## Installation

1. Open Figma and go to the Community tab
2. Search for "Stellar"
3. Click "Install"
4. The plugin will be available in your Figma plugins menu

## Usage

1. Select the frame(s) you want to work with
2. Open the Stellar plugin
3. Choose the type of identifier or connector you want to create
4. Configure the options as needed
5. Click "Apply" to create the element

### Creating Identifiers
- Select one or more frames
- Choose the identifier type (Frame, Section, or Flow)
- Enter title and subtitle
- Select status (for Section and Flow identifiers)
- Click Apply

### Creating Connectors
- Select exactly two frames to connect
- Choose the connector type
- Toggle dark/light mode as needed
- Enable/disable text node
- Click Apply

## Configuration

The plugin automatically adapts to your Figma theme and supports both light and dark modes. No additional configuration is required.

## Files
- `manifest.json`: Plugin configuration and permissions
- `code.js`: Main JavaScript code for the plugin
- `ui.html`: Plugin interface and styles

## Development

To modify the plugin:

1. Clone this repository
2. Make changes to the source files
3. Test the changes in Figma's development mode
4. Submit updates through the Figma plugin publishing process

## License

This project is available under the MIT License.
