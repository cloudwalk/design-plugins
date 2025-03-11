// Icon SVG Export Plugin v1.2
// Plugin for exporting frames and components as SVG files and editing fill rules

// Function to limit log messages during development
const DEBUG = true; // Set to false in production

function log(...args) {
  if (DEBUG) {
    console.log('[Icon SVG Export]', ...args);
  }
}

// Main function that runs when the plugin starts
figma.showUI(__html__, { width: 700, height: 600 });

// Add this line to indicate when the plugin is loaded
log('Plugin loaded successfully!');

// Current active tab
let activeTab = 'export-icon';

// Controle para pausar a aba do fill rule editor
let fillRuleEditorPaused = true;

// Variáveis para armazenar configurações do GitHub
let githubToken = '';
let githubRepo = '';
let githubPath = '';

// Function to check if the selection is valid (frames and components)
function validateSelection() {
  if (figma.currentPage.selection.length === 0) {
    figma.ui.postMessage({
      type: 'error',
      message: 'Please select at least one frame or component.'
    });
    return false;
  }

  // Check if all selected items are frames or components
  const invalidItems = figma.currentPage.selection.filter(node => 
    node.type !== 'FRAME' && node.type !== 'COMPONENT' && node.type !== 'COMPONENT_SET'
  );
  if (invalidItems.length > 0) {
    figma.ui.postMessage({
      type: 'error',
      message: 'Only frames and components can be exported. Please select only frames or components.'
    });
    return false;
  }

  return true;
}

// Function to validate selection for fill rule editing
function validateFillRuleSelection() {
  if (figma.currentPage.selection.length === 0) {
    figma.ui.postMessage({
      type: 'error',
      message: 'Please select at least one vector path.'
    });
    return false;
  }

  // Check if all selected items are vector paths
  const hasInvalidSelection = figma.currentPage.selection.some(node => !isVectorLike(node));
  if (hasInvalidSelection) {
    figma.ui.postMessage({
      type: 'error',
      message: 'Only vector paths can have fill rules edited. Please select only vector paths.'
    });
    return false;
  }
  
  // Verificar se o vetor tem regiões para editar
  const node = figma.currentPage.selection[0];
  if (!node.vectorNetwork || !node.vectorNetwork.regions || node.vectorNetwork.regions.length === 0) {
    figma.ui.postMessage({
      type: 'error',
      message: 'The selected vector does not have regions to edit. Please select a vector with filled regions.'
    });
    return false;
  }

  return true;
}

// Function to export frames and components as SVG
async function exportNodesAsSVG(returnSVGs = false) {
  try {
    log('Starting SVG export...');
    
    // Verificar se há seleção
    if (figma.currentPage.selection.length === 0) {
      log('Error: No nodes selected for export');
      figma.ui.postMessage({
        type: 'error',
        message: 'Please select at least one frame or component for export.'
      });
      return returnSVGs ? [] : undefined;
    }
    
    log(`Processing ${figma.currentPage.selection.length} selected nodes`);
    
    const exportedSVGs = [];
    
    // For each selected frame or component
    for (const node of figma.currentPage.selection) {
      try {
        log(`\n📄 Processing ${node.type === 'FRAME' ? 'frame' : 'component'}: "${node.name}"`);
        
        // Configure export settings for SVG
        const exportSettings = {
          format: 'SVG',
          svgOutlineText: true,
          svgIdAttribute: true,
          svgSimplifyStroke: true
        };

        log('⬇️ Exporting original SVG...');
        // Export the node as SVG
        const svgData = await node.exportAsync(exportSettings);
        
        if (!svgData || svgData.length === 0) {
          log(`⚠️ Warning: Failed to export SVG for node "${node.name}"`);
          continue;
        }
        
        // Convert bytes to string
        const svgString = String.fromCharCode.apply(null, svgData);
        log(`✅ SVG exported successfully! Size: ${svgString.length} characters`);
        
        // Verificar se o SVG é válido
        if (!svgString.includes('<svg') || !svgString.includes('</svg>')) {
          log(`⚠️ Warning: Exported SVG for "${node.name}" seems invalid`);
        }
        
        // Add the SVG to the exported list with the -light suffix
        log('💾 Saving light version...');
        exportedSVGs.push({
          name: `${node.name}-light`,
          svg: svgString
        });
        
        // Create the dark version by replacing black colors with white
        log('🌙 Creating dark version...');
        let darkSvgString = svgString;
        
        // Replace hexadecimal black colors with white
        darkSvgString = darkSvgString.replace(/#000000/gi, '#f5f5f5');
        darkSvgString = darkSvgString.replace(/#000/gi, '#f5f5f5');
        darkSvgString = darkSvgString.replace(/#111111/gi, '#f5f5f5');
        darkSvgString = darkSvgString.replace(/#111/gi, '#f5f5f5');
        darkSvgString = darkSvgString.replace(/#121212/gi, '#f5f5f5');
        darkSvgString = darkSvgString.replace(/#222222/gi, '#f5f5f5');
        darkSvgString = darkSvgString.replace(/#222/gi, '#f5f5f5');
        darkSvgString = darkSvgString.replace(/#333333/gi, '#f5f5f5');
        darkSvgString = darkSvgString.replace(/#333/gi, '#f5f5f5');
        
        // Also replace rgb(0,0,0) and variations
        darkSvgString = darkSvgString.replace(/fill="rgb\(\s*0\s*,\s*0\s*,\s*0\s*\)"/gi, 'fill="#f5f5f5"');
        darkSvgString = darkSvgString.replace(/stroke="rgb\(\s*0\s*,\s*0\s*,\s*0\s*\)"/gi, 'stroke="#f5f5f5"');
        darkSvgString = darkSvgString.replace(/fill:rgb\(\s*0\s*,\s*0\s*,\s*0\s*\)/gi, 'fill:#f5f5f5');
        darkSvgString = darkSvgString.replace(/stroke:rgb\(\s*0\s*,\s*0\s*,\s*0\s*\)/gi, 'stroke:#f5f5f5');
        
        // Add the dark version to the exported list
        log('💾 Saving dark version...');
        exportedSVGs.push({
          name: `${node.name}-dark`,
          svg: darkSvgString
        });
      } catch (nodeError) {
        log(`❌ Error processing node "${node.name}": ${nodeError.message}`);
        // Continue with the next node in case of error
      }
    }
    
    log(`✅ Export completed: ${exportedSVGs.length} SVGs exported (${figma.currentPage.selection.length} nodes processed)`);
    
    // Se não houver SVGs exportados, mostrar erro
    if (exportedSVGs.length === 0) {
      log('❌ Error: No SVGs were exported successfully');
      figma.ui.postMessage({
        type: 'error',
        message: 'No SVGs were exported successfully. Please check the selected nodes and try again.'
      });
      return returnSVGs ? [] : undefined;
    }
    
    // Se returnSVGs for true, retornar os SVGs em vez de enviá-los para a UI
    if (returnSVGs) {
      log(`Returning ${exportedSVGs.length} SVGs for additional processing`);
      return exportedSVGs;
    }
    
    // Enviar os SVGs para a UI
    log('Sending SVGs to UI...');
    figma.ui.postMessage({
      type: 'export-complete',
      svgs: exportedSVGs
    });
    
    log(`Message 'export-complete' sent to UI with ${exportedSVGs.length} SVGs`);
    
    return exportedSVGs;
  } catch (error) {
    log(`❌ Error during SVG export: ${error.message}`);
    log(`Stack trace: ${error.stack}`);
    
    figma.ui.postMessage({
      type: 'error',
      message: 'Error exporting SVGs: ' + error.message
    });
    
    return returnSVGs ? [] : undefined;
  }
}

// Function to send diagnostic message to UI
function sendDiagnostic(message) {
  log(message);
  figma.ui.postMessage({
    type: 'diagnostic',
    message: message
  });
}

// Function to get SVG preview for fill rule editing
async function getVectorPreview() {
  if (!validateFillRuleSelection()) return;
  
  try {
    const node = figma.currentPage.selection[0];
    log(`Getting preview for vector: "${node.name}"`);
    
    // Verificar se o nó é um vetor
    if (node.type !== 'VECTOR') {
      figma.ui.postMessage({
        type: 'error',
        message: 'The selected node is not a vector.'
      });
      return;
    }
    
    // Configurar as configurações de exportação para SVG
    const exportSettings = {
      format: 'SVG',
      svgOutlineText: true,
      svgIdAttribute: true,
      svgSimplifyStroke: true
    };
    
    // Exportar o nó como SVG
    const svgData = await node.exportAsync(exportSettings);
    
    // Converter bytes para string
    const svgString = String.fromCharCode.apply(null, svgData);
    
    // Obter dados da rede vetorial para edição interativa
    const vectorNetwork = node.vectorNetwork;
    
    // Enviar informações de diagnóstico para a UI
    const diagnosticMsg = `Vector: ${node.name}, Regions: ${vectorNetwork.regions ? vectorNetwork.regions.length : 0}, Paths: ${vectorNetwork.paths ? vectorNetwork.paths.length : 0}`;
    log(diagnosticMsg);
    sendDiagnostic(diagnosticMsg);
    
    // Enviar o preview SVG e os dados do vetor para a UI
    figma.ui.postMessage({
      type: 'fill-rule-preview',
      svgData: svgString,
      vectorData: {
        id: node.id,
        vectorNetwork: vectorNetwork
      }
    });
    
    log('Vector preview sent to UI');
  } catch (error) {
    console.error('Error getting vector preview:', error);
    figma.ui.postMessage({
      type: 'error',
      message: `Error getting vector preview: ${error.message}`
    });
  }
}

// Function to apply fill rule to selected vectors
async function applyFillRule(fillRule, pathIndex = -1) {
  if (!validateFillRuleSelection()) return;
  
  try {
    const nodes = figma.currentPage.selection;
    const node = nodes[0]; // Pegamos apenas o primeiro nó selecionado
    
    if (node.type !== 'VECTOR') {
      figma.ui.postMessage({
        type: 'error',
        message: 'The selected node is not a vector.'
      });
      return;
    }
    
    // Obter a rede vetorial atual
    const vectorNetwork = JSON.parse(JSON.stringify(node.vectorNetwork));
    
    // Enviar informações de diagnóstico para a UI
    sendDiagnostic(`Vector: ${node.name}, Regions: ${vectorNetwork.regions ? vectorNetwork.regions.length : 0}, Paths: ${vectorNetwork.paths ? vectorNetwork.paths.length : 0}`);
    
    if (pathIndex >= 0) {
      // Aplicar a uma região específica do vetor
      log(`Applying fill rule "${fillRule}" to path ${pathIndex} in vector`);
      
      // Verificar se o índice está dentro do intervalo válido
      if (!vectorNetwork.regions || pathIndex >= vectorNetwork.regions.length) {
        sendDiagnostic(`Path index ${pathIndex} is out of range. Total regions: ${vectorNetwork.regions ? vectorNetwork.regions.length : 0}`);
        figma.ui.postMessage({
          type: 'error',
          message: `Path index ${pathIndex} is out of range. Total regions: ${vectorNetwork.regions ? vectorNetwork.regions.length : 0}`
        });
        return;
      }
      
      // Aplicar a regra de preenchimento à região específica
      vectorNetwork.regions[pathIndex].windingRule = fillRule === 'evenodd' ? 'EVENODD' : 'NONZERO';
      
      // Aplicar a rede modificada de volta ao vetor
      node.vectorNetwork = vectorNetwork;
      
      // Enviar mensagem de sucesso para a UI
      figma.ui.postMessage({
        type: 'fill-rule-applied',
        message: `Fill rule "${fillRule}" successfully applied to path ${pathIndex + 1}!`
      });
      
      // Atualizar a visualização após aplicar as alterações
      await getVectorPreview();
    } else {
      // Aplicar a todas as regiões em todos os vetores selecionados
      log(`Applying fill rule "${fillRule}" to ${nodes.length} vectors`);
      
      // Contagem de vetores modificados com sucesso
      let modifiedCount = 0;
      
      for (const n of nodes) {
        if (n.type === 'VECTOR') {
          // Clonar a rede vetorial
          const vn = JSON.parse(JSON.stringify(n.vectorNetwork));
          
          // Modificar cada região para definir a regra de preenchimento
          if (vn.regions && vn.regions.length > 0) {
            vn.regions.forEach(region => {
              region.windingRule = fillRule === 'evenodd' ? 'EVENODD' : 'NONZERO';
            });
            
            // Aplicar a rede modificada de volta ao vetor
            n.vectorNetwork = vn;
            modifiedCount++;
          } else {
            log(`Vector ${n.name} does not have regions to modify`);
          }
        }
      }
      
      // Enviar mensagem de sucesso para a UI
      figma.ui.postMessage({
        type: 'fill-rule-applied',
        message: `Fill rule "${fillRule}" applied to ${modifiedCount} vectors successfully!`
      });
      
      // Atualizar a visualização
      await getVectorPreview();
    }
  } catch (error) {
    console.error('Error applying fill rule:', error);
    figma.ui.postMessage({
      type: 'error',
      message: `Error applying fill rule: ${error.message}`
    });
  }
}

// Function to reverse path direction
async function reversePathDirection(pathIndex) {
  if (!validateFillRuleSelection()) return;
  
  try {
    const node = figma.currentPage.selection[0];
    
    if (node.type === 'VECTOR') {
      log(`Reversing direction of path ${pathIndex} in vector "${node.name}"`);
      
      // Clone the vector network
      const vectorNetwork = JSON.parse(JSON.stringify(node.vectorNetwork));
      
      // Find the path and reverse its direction
      if (vectorNetwork.paths && pathIndex < vectorNetwork.paths.length) {
        // Reverse the path by reversing the segments array
        const path = vectorNetwork.paths[pathIndex];
        path.segments = path.segments.reverse();
        
        // We also need to swap the start and end points of each segment
        path.segments.forEach(segment => {
          const temp = segment.start;
          segment.start = segment.end;
          segment.end = temp;
          
          // If there are control points, they need to be swapped too
          if (segment.tangentStart && segment.tangentEnd) {
            const tempTangent = segment.tangentStart;
            segment.tangentStart = segment.tangentEnd;
            segment.tangentEnd = tempTangent;
          }
        });
        
        // Apply the modified network back to the vector
        node.vectorNetwork = vectorNetwork;
        
        // Send success message to UI
        figma.ui.postMessage({
          type: 'path-direction-reversed',
          message: `Direction of path ${pathIndex + 1} reversed successfully!`
        });
        
        // Update the preview
        await getVectorPreview();
      } else {
        figma.ui.postMessage({
          type: 'error',
          message: `Path index ${pathIndex} is out of range.`
        });
      }
    }
  } catch (error) {
    console.error('Error reversing path direction:', error);
    figma.ui.postMessage({
      type: 'error',
      message: `Error reversing path direction: ${error.message}`
    });
  }
}

// Check which tab is active and run the appropriate function
function handleTabChange(tab) {
  activeTab = tab;
  
  if (tab === 'export-icon') {
    // If export tab is active, start export automatically
    exportNodesAsSVG();
  } else if (tab === 'edit-fill-rule') {
    // Se a aba do fill rule editor estiver pausada, notificar o usuário
    if (fillRuleEditorPaused) {
      figma.ui.postMessage({
        type: 'error',
        message: 'The fill rule editor is paused. Please contact the developer to reactivate it.'
      });
      return;
    }
    
    // If fill rule tab is active, get vector preview
    getVectorPreview();
  } else if (tab === 'github-export') {
    // Se a aba do GitHub estiver ativa, carregar as configurações
    loadGithubSettings();
  }
}

// Start the export automatically when the plugin is opened (default tab)
exportNodesAsSVG();

// Listen for selection changes
figma.on('selectionchange', () => {
  if (activeTab === 'export-icon') {
    // Don't automatically export on selection change
  } else if (activeTab === 'edit-fill-rule' && !fillRuleEditorPaused) {
    // Update preview when selection changes (apenas se não estiver pausado)
    getVectorPreview();
  } else if (activeTab === 'fill-rule' && !fillRuleEditorPaused) {
    getVectorPreview();
  }
});

// Listen for messages from the UI
figma.ui.onmessage = async (msg) => {
  if (msg.type === 'export-frames') {
    await exportNodesAsSVG();
  } else if (msg.type === 'close-plugin') {
    figma.closePlugin();
  } else if (msg.type === 'tab-changed') {
    handleTabChange(msg.tab);
    
    // Se a aba atual for a do GitHub, carregar as configurações
    if (msg.tab === 'github-export') {
      loadGithubSettings();
    }
  } else if (msg.type === 'get-fill-rule-editor-status') {
    // Enviar o status atual do editor de regras de preenchimento
    figma.ui.postMessage({
      type: 'fill-rule-editor-status',
      isPaused: fillRuleEditorPaused
    });
  } else if (msg.type === 'apply-fill-rule') {
    // Verificar se o editor está pausado
    if (fillRuleEditorPaused) {
      figma.ui.postMessage({
        type: 'error',
        message: 'The fill rule editor is paused. Please contact the developer to reactivate it.'
      });
      return;
    }
    await applyFillRule(msg.fillRule, msg.pathIndex);
  } else if (msg.type === 'reverse-path-direction') {
    // Verificar se o editor está pausado
    if (fillRuleEditorPaused) {
      figma.ui.postMessage({
        type: 'error',
        message: 'The fill rule editor is paused. Please contact the developer to reactivate it.'
      });
      return;
    }
    await reversePathDirection(msg.pathIndex);
  } else if (msg.type === 'update-vector-network') {
    // Verificar se o editor está pausado
    if (fillRuleEditorPaused) {
      figma.ui.postMessage({
        type: 'error',
        message: 'The fill rule editor is paused. Please contact the developer to reactivate it.'
      });
      return;
    }
    await updateVectorNetwork(msg.vectorNetwork);
  } else if (msg.type === 'save-github-settings') {
    // Salvar configurações do GitHub
    await saveGithubSettings(msg.token, msg.repo, msg.path);
  } else if (msg.type === 'export-to-github') {
    // Exportar para o GitHub
    exportToGithub();
  }
};

// Função para salvar configurações do GitHub
async function saveGithubSettings(token, repo, path) {
  try {
    githubToken = token;
    githubRepo = repo;
    githubPath = path || '';
    
    // Salvar as configurações no armazenamento do cliente
    await figma.clientStorage.setAsync('githubToken', token);
    await figma.clientStorage.setAsync('githubRepo', repo);
    await figma.clientStorage.setAsync('githubPath', path);
    
    figma.ui.postMessage({
      type: 'github-settings-saved',
      success: true
    });
    
    log('GitHub settings saved successfully');
  } catch (error) {
    figma.ui.postMessage({
      type: 'github-settings-saved',
      success: false,
      error: error.message
    });
    
    log('Error saving GitHub settings: ' + error.message);
  }
}

// Função para carregar configurações do GitHub
async function loadGithubSettings() {
  try {
    // Carregar as configurações do armazenamento do cliente
    githubToken = await figma.clientStorage.getAsync('githubToken') || '';
    githubRepo = await figma.clientStorage.getAsync('githubRepo') || '';
    githubPath = await figma.clientStorage.getAsync('githubPath') || '';
    
    figma.ui.postMessage({
      type: 'github-settings-loaded',
      token: githubToken,
      repo: githubRepo,
      path: githubPath
    });
    
    log('GitHub settings loaded successfully');
  } catch (error) {
    figma.ui.postMessage({
      type: 'github-settings-loaded',
      token: '',
      repo: '',
      path: '',
      error: error.message
    });
    
    log('Error loading GitHub settings: ' + error.message);
  }
}

// Função para exportar para o GitHub
async function exportToGithub() {
  try {
    log('Starting GitHub export process');
    
    // Verificar se as configurações do GitHub estão definidas
    if (!githubToken || !githubRepo) {
      log('Error: GitHub token or repository not configured');
      figma.ui.postMessage({
        type: 'github-export-status',
        success: false,
        message: 'Please configure the GitHub token and repository first.'
      });
      return;
    }
    
    log(`GitHub settings: Repository: ${githubRepo}, Path: ${githubPath || 'not defined'}`);
    
    // Verificar se há seleção válida
    if (!validateSelection()) {
      log('Error: Invalid selection for export');
      figma.ui.postMessage({
        type: 'github-export-status',
        success: false,
        message: 'Please select at least one frame or component for export.'
      });
      return;
    }
    
    log(`Valid selection: ${figma.currentPage.selection.length} nodes selected`);
    
    // Exportar os nós como SVG
    log('Starting export of nodes as SVG...');
    const svgExports = await exportNodesAsSVG(true); // true para retornar os SVGs em vez de enviá-los para a UI
    
    if (!svgExports || svgExports.length === 0) {
      log('Error: No SVGs were exported');
      figma.ui.postMessage({
        type: 'github-export-status',
        success: false,
        message: 'No SVGs were exported.'
      });
      return;
    }
    
    log(`Export completed: ${svgExports.length} SVGs exported`);
    
    // Listar os nomes dos SVGs exportados para debug
    const svgNames = svgExports.map(svg => svg.name);
    log(`Exported SVGs: ${svgNames.join(', ')}`);
    
    // Verificar se os SVGs têm o formato correto
    const firstSvg = svgExports[0];
    log(`Example of exported SVG - Name: ${firstSvg.name}, Size: ${firstSvg.svg.length} characters`);
    log(`First 100 characters of SVG: ${firstSvg.svg.substring(0, 100)}...`);
    
    // Enviar os SVGs para a UI para upload
    log('Sending SVGs to UI for processing and upload...');
    figma.ui.postMessage({
      type: 'upload-to-github',
      svgExports: svgExports,
      token: githubToken,
      repo: githubRepo,
      path: githubPath
    });
    
    log('SVGs sent to processing and upload to GitHub');
  } catch (error) {
    log(`Error exporting to GitHub: ${error.message}`);
    log(`Stack trace: ${error.stack}`);
    
    figma.ui.postMessage({
      type: 'github-export-status',
      success: false,
      message: 'Error exporting to GitHub: ' + error.message
    });
  }
}

// Função para atualizar a rede vetorial
async function updateVectorNetwork(vectorNetwork) {
  // Update the entire vector network (for advanced editing)
  if (figma.currentPage.selection.length === 1) {
    const node = figma.currentPage.selection[0];
    if (node.type === 'VECTOR' && vectorNetwork) {
      node.vectorNetwork = vectorNetwork;
      await getVectorPreview();
    }
  }
}

// Inicializar o plugin
async function initPlugin() {
  // Carregar configurações do GitHub
  await loadGithubSettings();
}

// Chamar a função de inicialização
initPlugin();
