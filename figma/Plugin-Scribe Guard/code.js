// Configuração inicial da UI do plugin
figma.showUI(__html__, {
  width: 450,
  height: 600
});

// Função para verificar se um nó é válido
function isValidNode(node) {
  return node && typeof node === 'object' && 'type' in node && 'name' in node;
}

// Função para verificar se um nó é um texto válido
function isValidTextNode(node) {
  return isValidNode(node) && 
         node.type === 'TEXT' && 
         typeof node.characters === 'string' &&
         typeof node.fontSize === 'number';
}

// Função para obter o caminho do nó no documento
function getNodePath(node) {
  if (!isValidNode(node)) return 'Unknown Location';
  
  let path = [node.name];
  let parent = node.parent;
  
  while (parent && isValidNode(parent) && parent.type !== 'PAGE') {
    path.unshift(parent.name);
    parent = parent.parent;
  }
  
  return path.join(' > ');
}

// Função para serializar o objeto fontName
function serializeFontName(fontName) {
  if (!fontName || typeof fontName !== 'object') return 'Unknown Font';
  return `${fontName.family} ${fontName.style}`;
}

// Função para extrair todo o texto do arquivo do Figma
function getAllTexts(node) {
  if (!isValidNode(node) || node.type === 'DISCLOSURE_ARROW') {
    console.error('Invalid node provided to getAllTexts or node is a Disclosure Arrow');
    return [];
  }

  let texts = [];
  let id = 0;

  function processNode(node) {
    // Verificar se o nó é um texto válido
    if (isValidTextNode(node)) {
      try {
        texts.push({
          id: id++,
          content: node.characters || '',
          location: getNodePath(node),
          characterCount: (node.characters || '').length,
          wordCount: (node.characters || '').split(/\s+/).filter(word => word.length > 0).length,
          styleName: node.name,
          fontSize: node.fontSize,
          fontFamily: serializeFontName(node.fontName)
        });
      } catch (error) {
        console.error('Error processing text node:', error);
      }
    }

    // Verificar se o nó tem filhos válidos
    if ('children' in node && Array.isArray(node.children)) {
      for (const child of node.children) {
        if (isValidNode(child) && child.type !== 'DISCLOSURE_ARROW') {
          processNode(child);
        }
      }
    }
  }

  processNode(node);
  return texts;
}

// Função para processar estilos de texto
function getTextStyles() {
  try {
    const styles = figma.getLocalTextStyles();
    if (!Array.isArray(styles)) return [];

    return styles.map(style => {
      if (!style || typeof style !== 'object') return null;

      return {
        id: style.id || 'unknown',
        name: style.name || 'Unnamed Style',
        description: style.description || '',
        fontSize: typeof style.fontSize === 'number' ? style.fontSize : 0,
        fontFamily: serializeFontName(style.fontName)
      };
    }).filter(style => style !== null);
  } catch (error) {
    console.error('Error getting text styles:', error);
    return [];
  }
}

// Function to save API key to client storage
async function saveApiKey(apiKey) {
  try {
    await figma.clientStorage.setAsync('apiKey', apiKey);
    console.log('API key saved successfully');
  } catch (error) {
    console.error('Error saving API key:', error);
  }
}

// Function to load API key from client storage
async function loadApiKey() {
  try {
    const apiKey = await figma.clientStorage.getAsync('apiKey');
    console.log('API key loaded:', apiKey);
    return apiKey;
  } catch (error) {
    console.error('Error loading API key:', error);
    return null;
  }
}

// Function to remove API key from client storage
async function removeApiKey() {
  try {
    await figma.clientStorage.setAsync('apiKey', null);
    console.log('API key removed successfully');
  } catch (error) {
    console.error('Error removing API key:', error);
  }
}

// Load API key when plugin starts
figma.ui.on('message', async (msg) => {
  if (msg.type === 'plugin-ready') {
    const apiKey = await loadApiKey();
    if (apiKey) {
      figma.ui.postMessage({ type: 'load-api-key', apiKey });
    }
  }
});

// Listener para mensagens da UI
figma.ui.onmessage = async (msg) => {
  if (!msg || typeof msg !== 'object' || !msg.type) {
    console.error('Invalid message received');
    return;
  }

  if (msg.type === 'save-api-key') {
    await saveApiKey(msg.apiKey);
  }

  if (msg.type === 'remove-api-key') {
    await removeApiKey();
  }

  if (msg.type === 'get-text-content') {
    try {
      // Obter página atual
      const currentPage = figma.currentPage;
      if (!isValidNode(currentPage)) {
        throw new Error('Invalid current page');
      }
      
      // Extrair todos os textos
      const texts = getAllTexts(currentPage);
      
      // Obter estilos de texto
      const textStyles = getTextStyles();
      
      // Enviar textos e estilos processados de volta para a UI
      figma.ui.postMessage({
        type: 'text-content',
        texts: texts,
        styles: textStyles
      });
    } catch (error) {
      console.error('Error:', error);
      figma.ui.postMessage({
        type: 'error',
        message: error.message
      });
    }
  } else if (msg.type === 'update-text') {
    if (!msg.nodeId || !msg.newText) {
      console.error('Invalid update-text message');
      return;
    }

    try {
      const node = figma.getNodeById(msg.nodeId);
      if (!isValidTextNode(node)) {
        throw new Error('Invalid text node for update');
      }

      await figma.loadFontAsync(node.fontName);
      node.characters = msg.newText;
      
      figma.ui.postMessage({
        type: 'text-updated',
        nodeId: msg.nodeId,
        success: true
      });
    } catch (error) {
      figma.ui.postMessage({
        type: 'error',
        message: 'Error updating text: ' + error.message
      });
    }
  }
};