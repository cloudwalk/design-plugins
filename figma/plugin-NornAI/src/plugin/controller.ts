import { searchImages } from './imageSearch';

// Initialize the plugin
figma.showUI(__html__, {
  width: 528,
  height: Math.round(figma.viewport.bounds.height),
  title: 'NornAI'
});

console.log('🚀 Plugin iniciado');

// Add API key handling
let apiKey = '';

// Check for API key on startup
figma.clientStorage.getAsync('openai_api_key').then(key => {
  apiKey = key || '';
  console.log('🔑 API Key status:', !!apiKey);
  if (!apiKey) {
    // If no API key is set, send message to open settings
    figma.ui.postMessage({
      type: 'open-settings'
    });
    return;
  }
});

// Adicionar variável global para armazenar o nó de texto atual
let currentTextNode: TextNode | null = null;

// Modificar a função checkSelection para armazenar o nó de texto atual
const checkSelection = () => {
  console.log('🔍 Iniciando verificação de seleção...');
  const selection = figma.currentPage.selection;
  console.log('📌 Seleção atual:', selection.map(node => ({
    id: node.id,
    type: node.type,
    name: node.name
  })));
  
  if (selection.length === 1) {
    const node = selection[0];
    console.log('🎯 Nó selecionado:', {
      id: node.id,
      type: node.type,
      name: node.name
    });
    
    // Check for text in different node types
    let textContent = '';
    let totalTextNodes = 0;
    let textNodes: TextNode[] = [];
    
    if (node.type === "TEXT") {
      textContent = node.characters;
      totalTextNodes = 1;
      textNodes = [node];
      currentTextNode = node;
      console.log('📝 Encontrado nó de texto único:', {
        id: node.id,
        content: textContent,
        fontName: node.fontName
      });
    } else if ('children' in node) {
      // Search for text nodes within the frame
      textNodes = node.findAll(n => n.type === "TEXT") as TextNode[];
      totalTextNodes = textNodes.length;
      console.log(`📚 Encontrados ${totalTextNodes} nós de texto no frame`);
      
      if (textNodes.length > 0) {
        // Get the first text node by default
        const firstNode = textNodes[0];
        textContent = firstNode.characters;
        currentTextNode = firstNode;
        
        // Try to find if any text node is actually selected
        if (selection[0].type === "TEXT") {
          const selectedNode = selection[0] as TextNode;
          textContent = selectedNode.characters;
          currentTextNode = selectedNode;
          console.log('📝 Usando nó de texto selecionado:', {
            id: selectedNode.id,
            content: textContent,
            fontName: selectedNode.fontName
          });
        }
      }
    }
    
    // Verificar se currentTextNode foi atualizado corretamente
    console.log('🔄 Estado final do currentTextNode:', currentTextNode ? {
      id: currentTextNode.id,
      type: currentTextNode.type,
      content: currentTextNode.characters,
      fontName: currentTextNode.fontName
    } : 'Nenhum nó de texto definido');

    // Send the text content and count to the UI
    figma.ui.postMessage({
      type: 'selected-text',
      message: textContent,
      totalTextNodes: totalTextNodes
    });

  } else {
    console.log('❌ Nenhum nó único selecionado');
    currentTextNode = null;
    figma.ui.postMessage({
      type: 'selected-text',
      message: '',
      totalTextNodes: 0
    });
  }
};

// Run checkSelection immediately after plugin initialization AND after a small delay
checkSelection();
console.log('🏃‍♂️ Initial checkSelection called');

// Add a small delay to ensure Figma's selection is properly loaded
setTimeout(() => {
  console.log('⏱️ Running delayed checkSelection');
  checkSelection();
}, 100);

// Listen for selection changes
figma.on("selectionchange", () => {
  console.log('🔄 Selection changed');
  checkSelection();
});

// Function to update UI size
const updateUISize = () => {
  const viewportHeight = Math.round(figma.viewport.bounds.height);
  figma.ui.resize(528, viewportHeight);
};

// Update size periodically
setInterval(updateUISize, 1000);

// Handle messages from the UI
figma.ui.onmessage = async (msg) => {
  console.log('📨 Mensagem recebida no controller:', msg);

  if (msg.type === 'insert-image') {
    let rect: RectangleNode | null = null;
    
    try {
      console.log('🖼️ Iniciando inserção de imagem:', msg.imageUrl);
      
      // Create a new rectangle node for the image
      rect = figma.createRectangle();
      console.log('📦 Retângulo criado');
      
      // Set a reasonable default size
      rect.resize(400, 400);
      
      // Download the image using Figma's API
      const imageData = await figma.createImageAsync(msg.imageUrl);
      console.log('✨ Imagem baixada com sucesso');
      
      // Fill the rectangle with the image
      rect.fills = [{
        type: 'IMAGE',
        imageHash: imageData.hash,
        scaleMode: 'FILL'
      }];
      console.log('🖼️ Preenchimento aplicado ao retângulo');
      
      // Center the image in the viewport
      const center = figma.viewport.center;
      rect.x = center.x - rect.width / 2;
      rect.y = center.y - rect.height / 2;
      
      // Add the rectangle to the current page
      figma.currentPage.appendChild(rect);
      
      // Select the new image
      figma.currentPage.selection = [rect];
      
      // Zoom to fit the new image
      figma.viewport.scrollAndZoomIntoView([rect]);
      
      console.log('✅ Imagem inserida com sucesso');
      
      // Notify UI of success
      figma.ui.postMessage({
        type: 'insert-success',
        message: 'Image inserted successfully'
      });
    } catch (error) {
      console.error('❌ Erro ao inserir imagem:', error);
      
      // Remove the rectangle if it was created but image failed
      if (rect) {
        rect.remove();
      }
      
      figma.ui.postMessage({
        type: 'insert-error',
        error: error instanceof Error ? error.message : 'Failed to insert image'
      });
    }
  } else if (msg.type === 'search-images') {
    try {
      console.log('🔍 Iniciando busca de imagens:', {
        query: msg.query,
        color: msg.color
      });

      const images = await searchImages({
        query: msg.query,
        color: msg.color
      });
      
      console.log('✨ Imagens encontradas:', images.length);
      
      figma.ui.postMessage({
        type: 'images-found',
        images
      });
    } catch (error) {
      console.error('❌ Erro na busca:', error);
      
      figma.ui.postMessage({
        type: 'search-error',
        error: error instanceof Error ? error.message : 'Erro desconhecido na busca'
      });
    }
  } else if (msg.type === 'cancel') {
    figma.closePlugin();
  } else if (msg.type === 'get-api-key-status') {
    figma.ui.postMessage({
      type: 'api-key-status',
      hasApiKey: !!apiKey
    });
  } else if (msg.type === 'get-initial-selection') {
    checkSelection();
  } else if (msg.type === 'set-api-key') {
    try {
      // Validate API key format
      if (!msg.apiKey.trim().startsWith('sk-')) {
        throw new Error('Invalid API key format. It should start with "sk-"');
      }
      
      await figma.clientStorage.setAsync('openai_api_key', msg.apiKey);
      apiKey = msg.apiKey;
      
      // Send success message
      figma.ui.postMessage({
        type: 'api-key-saved',
        success: true
      });
    } catch (error) {
      figma.ui.postMessage({
        type: 'api-key-saved',
        success: false,
        error: error.message
      });
    }
  } else if (msg.type === 'chat-message' && !msg.requiresSelection) {
    try {
      const response = await generateChatResponse(msg.prompt);
      figma.ui.postMessage({
        type: 'chat-response',
        response
      });
    } catch (error) {
      figma.ui.postMessage({
        type: 'generation-error',
        error: error.message
      });
    }
  } else if (msg.type === 'process-prompt' || msg.type === 'generate-alternatives') {
    // For operations requiring selection
    const selection = figma.currentPage.selection;
    if (selection.length !== 1) {
      figma.ui.postMessage({
        type: 'generation-error',
        error: 'Please select a single text layer or frame'
      });
      return;
    }

    const node = selection[0];
    let textNode: TextNode | null = null;

    // Find the text node to modify
    if (node.type === "TEXT") {
      textNode = node;
    } else if ('children' in node) {
      // If a specific text node is selected within the frame, use that
      if (selection.length === 1 && selection[0].type === "TEXT") {
        textNode = selection[0] as TextNode;
      } else {
        // Otherwise use the first text node found
        const textNodes = node.findAll(n => n.type === "TEXT");
        if (textNodes.length > 0) {
          textNode = textNodes[0] as TextNode;
        }
      }
    }

    if (!textNode) {
      figma.ui.postMessage({
        type: 'generation-error',
        error: 'No text found in selection'
      });
      return;
    }

    switch (msg.type) {
      case 'process-prompt':
        try {
          // Em vez de processar o prompt, vamos gerar as alternativas diretamente
          const alternatives = await generateTextAlternatives(msg.text, msg.prompt, msg.language);
          figma.ui.postMessage({
            type: 'alternatives-generated',
            alternatives
          });
        } catch (error) {
          if (error.message.includes('API key')) {
            figma.ui.postMessage({
              type: 'open-settings'
            });
          } else {
            figma.ui.postMessage({
              type: 'generation-error',
              error: error.message
            });
          }
        }
        break;

      case 'generate-alternatives':
        try {
          const alternatives = await generateTextAlternatives(textNode.characters, msg.prompt || msg.tone, msg.language);
          figma.ui.postMessage({
            type: 'alternatives-generated',
            alternatives
          });
        } catch (error) {
          if (error.message.includes('API key')) {
            figma.ui.postMessage({
              type: 'open-settings'
            });
          } else {
            figma.ui.postMessage({
              type: 'generation-error',
              error: error.message
            });
          }
        }
        break;
    }
  } else if (msg.type === 'replace-text') {
    try {
      console.log('🖼️ Iniciando processo de substituição de texto:', {
        texto: msg.text,
        tipo: msg.type
      });
      
      // Primeiro, vamos verificar a seleção atual
      const selection = figma.currentPage.selection;
      console.log('📌 Seleção atual:', selection.map(node => ({
        id: node.id,
        type: node.type,
        name: node.name
      })));

      // Tentar usar o nó atual primeiro
      let textNode: TextNode | null = null;
      
      if (currentTextNode) {
        try {
          const validNode = await figma.getNodeByIdAsync(currentTextNode.id);
          if (validNode && validNode.type === "TEXT") {
            console.log('✅ Usando nó de texto em cache:', {
              id: currentTextNode.id,
              type: currentTextNode.type,
              text: currentTextNode.characters
            });
            textNode = validNode as TextNode;
          } else {
            console.log('❌ Nó em cache não é mais válido');
          }
        } catch (error) {
          console.log('❌ Erro ao buscar nó em cache:', error);
        }
      }

      // Se não tiver um nó válido em cache, tenta usar a seleção atual
      if (!textNode && selection.length === 1 && selection[0].type === "TEXT") {
        console.log('✅ Usando nó de texto da seleção atual');
        textNode = selection[0] as TextNode;
        currentTextNode = textNode;
      }

      if (!textNode) {
        console.error('❌ Nenhum nó de texto válido encontrado');
        throw new Error('Por favor, selecione um texto para substituir');
      }

      // Armazenar propriedades originais
      const originalFont = textNode.fontName;
      const originalFontSize = textNode.fontSize;
      const originalTextAlign = textNode.textAlignHorizontal;
      const originalColor = textNode.fills;

      console.log('📝 Propriedades originais:', {
        fonte: originalFont,
        tamanho: originalFontSize,
        alinhamento: originalTextAlign,
        texto: textNode.characters
      });

      // Carregar a fonte
      console.log('🔤 Carregando fonte:', originalFont);
      await figma.loadFontAsync(originalFont as FontName);
      console.log('✅ Fonte carregada com sucesso');

      // Limpar e atualizar o texto
      const cleanText = msg.text.replace(/^"|"$/g, '').trim();
      console.log('🧹 Texto limpo para aplicar:', cleanText);

      // Atualizar o texto mantendo todas as propriedades
      textNode.characters = cleanText;
      textNode.fontName = originalFont;
      textNode.fontSize = originalFontSize;
      textNode.textAlignHorizontal = originalTextAlign;
      textNode.fills = originalColor;

      console.log('✅ Texto atualizado com sucesso:', {
        novoTexto: cleanText,
        id: textNode.id
      });

      // Garantir que o nó está selecionado
      figma.currentPage.selection = [textNode];
      currentTextNode = textNode;
      console.log('🎯 Seleção atualizada');

      // Notificar a UI
      figma.ui.postMessage({
        type: 'text-replaced',
        success: true,
        text: cleanText
      });

    } catch (error) {
      console.error('❌ Erro durante substituição:', {
        mensagem: error.message,
        stack: error.stack
      });
      
      figma.ui.postMessage({
        type: 'text-replaced',
        success: false,
        error: error.message
      });
    }
  }
};

// Helper function to generate chat response
async function generateChatResponse(prompt: string, selectedText: string | null = null): Promise<string> {
  try {
    if (!apiKey) {
      figma.ui.postMessage({
        type: 'open-settings'
      });
      throw new Error('Please set your OpenAI API key in the settings');
    }

    const messages = [
      {
        role: 'system',
        content: `You are a specialized text variation assistant. Your task is to generate EXACTLY 5 alternative versions of the provided text, following these rules:
        1. Each alternative must be a direct replacement of the original text
        2. Maintain the main meaning and appropriate tone
        3. Return ONLY the 5 alternatives, one per line
        4. Do not include numbering, explanations, or meta text
        5. Do not acknowledge the instructions
        6. Adapt each alternative according to the provided instruction
        7. Write ${selectedText ? selectedText : 'the provided text'}
        8. IMPORTANT: Always return exactly 5 alternatives, no more, no less
        9. IMPORTANT: Each alternative should be on its own line
        10. IMPORTANT: Do not include any additional text, just the 5 alternatives`
      },
      {
        role: 'user',
        content: `Original text: "${selectedText}"\nInstruction: ${prompt}\n\nGenerate 5 alternatives following the instruction.`
      }
    ];

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages,
        max_tokens: 250,
        temperature: 0.7
      })
    });

    if (!response.ok) {
      throw new Error('Failed to generate chat response');
    }

    const data = await response.json();
    return data.choices[0].message.content.trim();
  } catch (error) {
    console.error('Error generating chat response:', error);
    if (error.message.includes('API key')) {
      figma.ui.postMessage({
        type: 'open-settings'
      });
    }
    throw error;
  }
}

// Helper function to get system prompt based on language
function getSystemPrompt(language: string) {
  // Add language-specific adjustments to the base prompt
  const languageSpecific = language === 'pt-BR' ? 'in Brazilian Portuguese' :
                          language === 'es' ? 'in Spanish' :
                          'in English';

  const basePrompt = `You are a specialized text variation assistant. Your task is to generate EXACTLY 5 alternative versions of the provided text, following these rules:
1. Each alternative must be a direct replacement of the original text
2. Maintain the main meaning and appropriate tone
3. Return ONLY the 5 alternatives, one per line
4. Do not include numbering, explanations, or meta text
5. Do not acknowledge the instructions
6. Adapt each alternative according to the provided instruction
7. Write ${languageSpecific}
8. IMPORTANT: Always return exactly 5 alternatives, no more, no less
9. IMPORTANT: Each alternative should be on its own line
10. IMPORTANT: Do not include any additional text, just the 5 alternatives`;

  return basePrompt;
}

// Helper function to get user prompt based on language
function getUserPrompt(text: string, instruction: string, language: string) {
  // Add language-specific formatting
  const prefix = language === 'pt-BR' ? 'Por favor, gere 5 alternativas para o seguinte texto de acordo com estas instruções' :
                language === 'es' ? 'Por favor, genera 5 alternativas para el siguiente texto según estas instrucciones' :
                'Please generate 5 alternatives for the following text according to these instructions';

  const textLabel = language === 'pt-BR' ? 'Texto original' :
                   language === 'es' ? 'Texto original' :
                   'Original text';

  return `${prefix}: ${instruction}

${textLabel}: "${text}"

Generate exactly 5 alternatives, one per line.`;
}

// Helper function to generate text alternatives
async function generateTextAlternatives(text: string, prompt: string, language: string): Promise<string[]> {
  try {
    if (!apiKey) {
      figma.ui.postMessage({
        type: 'open-settings'
      });
      throw new Error('Please set your OpenAI API key in the settings');
    }

    // Determine if the original text is all uppercase
    const isUpperCase = text === text.toUpperCase();
    const isLowerCase = text === text.toLowerCase();

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: getSystemPrompt(language)
          },
          {
            role: 'user',
            content: getUserPrompt(text, prompt, language)
          }
        ],
        max_tokens: 1000,
        temperature: 0.7,
        n: 1 // We want one response with 5 alternatives
      })
    });

    if (!response.ok) {
      throw new Error('Failed to generate alternatives');
    }

    const data = await response.json();
    const content = data.choices[0].message.content;
    
    // Clean up and process the results
    let alternatives = content
      .split('\n')
      .map(line => line.trim())
      .filter(line => {
        // Remove empty lines, numbered items, and meta text
        return line && 
               !line.match(/^\d+[\.\)]/) && // Remove numbered items with dot or parenthesis
               !line.match(/^[-•*]/) && // Remove bullet points
               !line.match(/^(Aqui|Certo|Segue|Alternativa|Versão|Opção|Here|Ok|Right|Alternative|Version|Option|Aquí|Bien|Sigue|Alternativa|Versión|Opción)/i) &&
               !line.match(/^(Mantendo|Usando|Adaptando|Seguindo|Keeping|Using|Adapting|Following|Manteniendo|Usando|Adaptando|Siguiendo)/i);
      })
      .map(line => {
        // Maintain the same case as the original text
        if (isUpperCase) {
          return line.toUpperCase();
        } else if (isLowerCase) {
          return line.toLowerCase();
        }
        return line;
      });

    // If we don't have exactly 5 alternatives, try to fix it
    if (alternatives.length < 5) {
      // If we have less than 5, make another API call
      console.log('Got less than 5 alternatives, making another call...');
      const secondResponse = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-4',
          messages: [
            {
              role: 'system',
              content: getSystemPrompt(language)
            },
            {
              role: 'user',
              content: getUserPrompt(text, prompt, language)
            }
          ],
          max_tokens: 1000,
          temperature: 0.8, // Slightly higher temperature for more variation
          n: 1
        })
      });

      if (secondResponse.ok) {
        const secondData = await secondResponse.json();
        const secondContent = secondData.choices[0].message.content;
        const moreAlternatives = secondContent
          .split('\n')
          .map(line => line.trim())
          .filter(line => line && !line.match(/^\d+[\.\)]/) && !line.match(/^[-•*]/))
          .map(line => {
            if (isUpperCase) return line.toUpperCase();
            if (isLowerCase) return line.toLowerCase();
            return line;
          });
        
        // Combine unique alternatives
        alternatives = [...new Set([...alternatives, ...moreAlternatives])];
      }
    }

    // Ensure we return exactly 5 alternatives
    if (alternatives.length > 5) {
      alternatives = alternatives.slice(0, 5);
    } else while (alternatives.length < 5) {
      // If we still don't have enough, duplicate the last one with slight modifications
      const lastAlt = alternatives[alternatives.length - 1] || text;
      alternatives.push(lastAlt);
    }

    return alternatives;
  } catch (error) {
    console.error('Error generating alternatives:', error);
    if (error.message.includes('API key')) {
      figma.ui.postMessage({
        type: 'open-settings'
      });
    }
    throw error;
  }
}

// Keep the plugin running
figma.on("close", () => {
  console.log('👋 Plugin encerrado');
});
