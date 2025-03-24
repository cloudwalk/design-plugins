figma.showUI(__html__, { width: 800, height: 600 });

// Keep track of current screen
let currentScreen = 'home';

// Handle messages from UI
figma.ui.onmessage = async (msg) => {
  if (msg.type === 'screen-changed') {
    currentScreen = msg.screen;
    return;
  }

  if (msg.type === 'save-api-key') {
    await figma.clientStorage.setAsync('mercurius_api_key', msg.apiKey);
  }
  
  if (msg.type === 'get-api-key') {
    const apiKey = await figma.clientStorage.getAsync('mercurius_api_key');
    figma.ui.postMessage({ type: 'api-key-response', apiKey });
  }
  
  if (msg.type === 'remove-api-key') {
    await figma.clientStorage.deleteAsync('mercurius_api_key');
  }

  if (msg.type === 'notify') {
    figma.notify(msg.message, { error: msg.error });
  }

  if (msg.type === 'check-selection') {
    const selection = figma.currentPage.selection;
    
    if (selection.length === 0) {
      figma.notify('Please select an image first');
      figma.ui.postMessage({ type: 'no-selection' });
      return;
    }

    if (selection.length > 1) {
      figma.notify('Please select only one image at a time');
      figma.ui.postMessage({ type: 'no-selection' });
      return;
    }

    const node = selection[0];
    
    if (node.type !== 'RECTANGLE' && node.type !== 'FRAME' && node.type !== 'COMPONENT' && node.type !== 'INSTANCE' && node.type !== 'IMAGE') {
      figma.notify('Please select a valid image');
      figma.ui.postMessage({ type: 'no-selection' });
      return;
    }

    // If we got here, the selection is valid
    try {
      const width = Math.round(node.width);
      const height = Math.round(node.height);
      
      // Function to calculate GCD (Greatest Common Divisor)
      const calculateGCD = (a, b) => {
        return b === 0 ? a : calculateGCD(b, a % b);
      };
      
      // Calculate simplified aspect ratio
      const gcd = calculateGCD(width, height);
      const aspectRatioWidth = width / gcd;
      const aspectRatioHeight = height / gcd;

      const settings = {
        format: 'PNG',
        constraint: {
          type: 'SCALE',
          value: 1
        }
      };

      node.exportSettings = [settings];
      const bytes = await node.exportAsync(settings);
      
      // Send image for analysis with API key
      figma.ui.postMessage({
        type: 'analyze-image',
        bytes: bytes,
        apiKey: msg.apiKey,
        dimensions: {
          width: width,
          height: height,
          name: node.name,
          aspectRatio: `${aspectRatioWidth}:${aspectRatioHeight}`
        }
      });

    } catch (error) {
      figma.notify('Export error: ' + error.message);
      figma.ui.postMessage({ type: 'analyze-error', error: error.message });
    }
  }

  if (msg.type === 'check-selection-only') {
    const selection = figma.currentPage.selection;
    
    if (selection.length === 1) {
      const node = selection[0];
      if (node.type === 'FRAME' || node.type === 'COMPONENT' || node.type === 'INSTANCE' || 
          node.type === 'RECTANGLE' || node.type === 'IMAGE') {
        figma.ui.postMessage({
          type: 'selection-check-response',
          valid: true,
          dimensions: {
            width: node.width,
            height: node.height,
            aspectRatio: calculateAspectRatio(node.width, node.height),
            name: node.name
          }
        });

        // Export the image
        node.exportAsync({
          format: 'PNG',
          constraint: { type: 'SCALE', value: 1 }
        }).then(bytes => {
          figma.ui.postMessage({
            type: 'image-data',
            bytes: bytes
          });
        }).catch(error => {
          console.error('Error exporting image:', error);
          figma.notify('Error exporting image', { error: true });
          figma.ui.postMessage({
            type: 'image-data-error',
            error: error.message
          });
        });
        return;
      }
    }
    
    figma.ui.postMessage({ type: 'no-selection' });
  }

  if (msg.type === 'get-image-data') {
    const selection = figma.currentPage.selection;
    if (selection.length === 1) {
      const node = selection[0];
      try {
        const bytes = await node.exportAsync({
          format: 'PNG',
          constraint: { type: 'SCALE', value: 1 }
        });
        
        figma.ui.postMessage({
          type: 'image-data',
          bytes: bytes
        });
      } catch (error) {
        console.error('Error exporting image:', error);
        figma.notify('Error exporting image', { error: true });
        figma.ui.postMessage({
          type: 'image-data-error',
          error: error.message
        });
      }
    } else {
      figma.notify('Please select an element first', { error: true });
      figma.ui.postMessage({
        type: 'image-data-error',
        error: 'No selection'
      });
    }
  }

  if (msg.type === 'process-complete') {
    figma.notify('');
  }

  if (msg.type === 'back-to-home') {
    figma.notify('');
  }
};

function calculateAspectRatio(width, height) {
  const gcd = (a, b) => b === 0 ? a : gcd(b, a % b);
  const divisor = gcd(width, height);
  return `${width/divisor}:${height/divisor}`;
}