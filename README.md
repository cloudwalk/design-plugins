# design-plugins

A repository for the team to develop and maintain plugins that enhance the design workflow, automate tasks, and improve efficiency.

## Rules

Please follow these rules. Plugins that do not comply will be deleted:

- **No plugin should contain or expose private company information**, such as API keys, secret keys, or internal data.
- Follow best practices for code quality and security.
- Ensure proper documentation for each plugin.

Contributions and improvements are always welcome! 🚀

## How to Structure a Plugin

Each plugin should follow a consistent folder structure. Below is an example based on Figma plugins:

```plaintext
plugin-name/
├── manifest.json  # Plugin metadata (name, ID, API permissions, etc.)
├── code.ts        # Main script (can be JavaScript or TypeScript)
├── ui.html        # UI for the plugin (if needed)
├── styles.css     # Optional: Styles for the UI
└── README.md      # Documentation for usage and setup


Submitting a Plugin using this repository 
	1.	Ensure your plugin follows the folder structure above.
	2.	Include a README.md explaining what the plugin does and how to use it.
	3.	Remove any private company information (e.g., API keys, secret keys).
	4.	Open a pull request with your plugin in its own folder inside the repository.
