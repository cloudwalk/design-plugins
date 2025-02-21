# Schema Generator Assistant

A Chrome extension that helps generate and validate JSON-LD schema markup for web pages. This tool makes it easy to create structured data for better SEO and rich search results.

## Features

- Automatically extracts page information (title, description, content)
- Supports multiple schema types:
  - Organization Schema
  - Product Schema
  - Blog/Article Schema
- Includes breadcrumb schema generation with drag-and-drop ordering
- Real-time schema validation
- Search result preview
- One-click copy functionality

## Installation

1. Clone this repository or download the files
2. Open Chrome and go to `chrome://extensions/`
3. Enable "Developer mode" in the top right
4. Click "Load unpacked" and select the folder containing these files

## Usage

1. Click the extension icon on any webpage
2. The extension will automatically extract page information
3. Select the desired schema type(s)
4. Toggle breadcrumb schema if needed
5. Click "Generate" to create the schema
6. Review the preview and validation results
7. Copy the generated schema to your clipboard

## Configuration

The extension requires an OpenAI API key for schema generation. You'll be prompted to enter your API key on first use. The key is stored securely in Chrome's storage.

## Files

- `manifest.json`: Extension configuration and permissions
- `code.js`: Main JavaScript code for the extension
- `ui.html`: Extension popup interface
- `styles.css`: CSS styles for the UI
- `content.js`: Content script for page information extraction

## Security

- API keys are stored securely using Chrome's storage API
- No sensitive data is transmitted outside of the extension
- All operations are performed locally except for OpenAI API calls

## Development

To modify the extension:
1. Make changes to the source files
2. Reload the extension in Chrome
3. Test the changes on various web pages

## License

This project is open source and available under the MIT License. 