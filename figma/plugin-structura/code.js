figma.showUI(__html__, {
  width: 500,
  height: 640,
  themeColors: true
});

function getSimplifiedPages() {
  return figma.root.children.map(page => ({
    name: page.name,
    type: page.name.startsWith('---') ? 'separator' : 'page'
  }));
}

figma.ui.postMessage({
  type: 'update-pages',
  pages: getSimplifiedPages()
});

// Templates padrão que estarão disponíveis para todos os usuários
const DEFAULT_TEMPLATES = [
  {
    name: "UI/UX Feature",
    pages: [
      { name: "🖼️ Cover", type: "page" },
      { name: "⏱️ Changelog", type: "page" },
      { name: "---", type: "separator" },
      { name: "✅ In Production", type: "page" },
      { name: "     → Title", type: "page" },
      { name: "---", type: "separator" },
      { name: "⬇️ NOT TO BE SHARED ⬇️", type: "page" },
      { name: "🚀 Handoff", type: "page" },
      { name: "     → Title", type: "page" },
      { name: "---", type: "separator" },
      { name: "👨‍💻 Design - WIP", type: "page" },
      { name: "     → Prototype", type: "page" },
      { name: "     → Critique", type: "page" },
      { name: "     → Wireframe", type: "page" },
      { name: "---", type: "separator" },
      { name: "🕵️ Design QA", type: "page" },
      { name: "---", type: "separator" },
      { name: "🛠️ Local Components", type: "page" },
      { name: "---", type: "separator" },
      { name: "🔍 Research", type: "page" },
      { name: "---", type: "separator" },
      { name: "🏖️ Sandbox", type: "page" }
    ]
  },
  {
    name: "Design System",
    pages: [
      { name: "🏠 Home", type: "page" },
      { name: "🎨 Style Guide", type: "page" },
      { name: "🧩 Components", type: "page" },
      { name: "---", type: "separator" },
      { name: "📱 Mobile", type: "page" },
      { name: "💻 Desktop", type: "page" },
      { name: "---", type: "separator" },
      { name: "🧪 Playground", type: "page" }
    ]
  }
];

// Modificar a função getTemplates para incluir os templates padrão e do usuário
async function getTemplates() {
  const userTemplates = await figma.clientStorage.getAsync('pageTemplates') || [];
  return [...DEFAULT_TEMPLATES, ...userTemplates];
}

// Modificar a função saveTemplate para verificar templates com o mesmo nome
async function saveTemplate(template) {
  try {
    const userTemplates = await figma.clientStorage.getAsync('pageTemplates') || [];
    
    // Verificar se já existe um template com o mesmo nome
    const existingTemplateIndex = userTemplates.findIndex(t => t.name === template.name);
    
    if (existingTemplateIndex >= 0) {
      // Retornar um status especial para a UI mostrar o modal de confirmação
      return {
        status: 'duplicate',
        index: existingTemplateIndex
      };
    }
    
    // Se não existir, salvar normalmente
    userTemplates.push(template);
    await figma.clientStorage.setAsync('pageTemplates', userTemplates);
    console.log("Template saved successfully:", template.name);
    return {
      status: 'success'
    };
  } catch (error) {
    console.error("Error saving template:", error);
    figma.notify('Error saving template: ' + error.message);
    return {
      status: 'error',
      message: error.message
    };
  }
}

// Adicionar função para substituir um template existente
async function replaceTemplate(template, index) {
  try {
    const userTemplates = await figma.clientStorage.getAsync('pageTemplates') || [];
    
    // Substituir o template no índice especificado
    userTemplates[index] = template;
    await figma.clientStorage.setAsync('pageTemplates', userTemplates);
    console.log("Template replaced successfully:", template.name);
    return true;
  } catch (error) {
    console.error("Error replacing template:", error);
    figma.notify('Error replacing template: ' + error.message);
    return false;
  }
}

// Adicionar função para excluir template
async function deleteTemplate(templateIndex) {
  // Calcular o índice real no array de templates do usuário
  const userTemplateIndex = templateIndex - DEFAULT_TEMPLATES.length;
  
  // Verificar se é um template do usuário (não podemos excluir templates padrão)
  if (userTemplateIndex < 0) {
    figma.notify('Cannot delete default templates');
    return false;
  }
  
  const userTemplates = await figma.clientStorage.getAsync('pageTemplates') || [];
  
  // Verificar se o índice é válido
  if (userTemplateIndex >= userTemplates.length) {
    figma.notify('Template not found');
    return false;
  }
  
  // Remover o template
  userTemplates.splice(userTemplateIndex, 1);
  await figma.clientStorage.setAsync('pageTemplates', userTemplates);
  return true;
}

// Adicionar função para fazer backup dos templates
async function backupTemplates() {
  const templates = await figma.clientStorage.getAsync('pageTemplates') || [];
  await figma.clientStorage.setAsync('pageTemplatesBackup', templates);
  return templates;
}

// Adicionar função para restaurar templates do backup
async function restoreTemplatesFromBackup() {
  const backup = await figma.clientStorage.getAsync('pageTemplatesBackup') || [];
  await figma.clientStorage.setAsync('pageTemplates', backup);
  return backup;
}

// Função para gerar um nome de página único
function generateUniqueName() {
  // Obter todas as páginas atuais
  const currentPages = figma.root.children.map(page => page.name);
  
  // Verificar qual é o próximo número disponível
  let counter = 1;
  let newName = `New page ${counter}`;
  
  // Enquanto o nome já existir, incrementar o contador
  while (currentPages.includes(newName)) {
    counter++;
    newName = `New page ${counter}`;
  }
  
  return newName;
}

figma.ui.onmessage = async (msg) => {
  let shouldUpdate = true;

  try {
    switch (msg.type) {
      case 'apply-template':
        const templatesData = await getTemplates();
        const selectedTemplate = templatesData[msg.templateIndex];
        
        if (!selectedTemplate) return;
        
        // Remover todas as páginas exceto a primeira
        while (figma.root.children.length > 1) {
          figma.root.children[1].remove();
        }
        
        // Renomear a primeira página para o primeiro item do template
        if (selectedTemplate.pages.length > 0) {
          figma.root.children[0].name = selectedTemplate.pages[0].name;
          
          // Criar as páginas restantes do template (pulando a primeira)
          selectedTemplate.pages.slice(1).forEach(pageConfig => {
            const newPage = figma.createPage();
            newPage.name = pageConfig.name;
          });
        }
        
        figma.notify('Template applied successfully!');
        break;
        
      case 'create-page':
        const newPageName = generateUniqueName();
        figma.createPage().name = newPageName;
        break;
        
      case 'create-separator':
        figma.createPage().name = '---';
        break;
        
      case 'rename-page':
        const targetPage = figma.root.children[msg.index];
        if (targetPage) {
          targetPage.name = msg.name;
          shouldUpdate = false;
        }
        break;
        
      case 'reorder-pages':
        const { fromIndex, toIndex } = msg;
        const pageToMove = figma.root.children[fromIndex];
        if (pageToMove) {
          figma.root.insertChild(toIndex, pageToMove);
        }
        break;
        
      case 'delete-page':
        try {
          // Verificar se há mais de uma página no arquivo
          if (figma.root.children.length > 1) {
            const pageToDelete = figma.root.children[msg.index];
            
            if (pageToDelete) {
              // Verificar se a página é a página atual
              const isCurrentPage = pageToDelete.id === figma.currentPage.id;
              
              // Se for a página atual, mudar para outra página primeiro
              if (isCurrentPage) {
                // Encontrar outra página para mudar
                const nextPageIndex = msg.index === figma.root.children.length - 1 ? msg.index - 1 : msg.index + 1;
                figma.currentPage = figma.root.children[nextPageIndex];
              }
              
              // Agora tente remover a página
              pageToDelete.remove();
            }
          } else {
            // Não permitir excluir a última página
            figma.notify('Cannot delete the last page in the file');
          }
        } catch (error) {
          console.error('Error removing page:', error);
          figma.notify('Error removing page: ' + error.message);
        }
        break;
        
      case 'save-template':
        const saveResult = await saveTemplate(msg.template);
        
        if (saveResult.status === 'success') {
          figma.notify('Template saved successfully!');
          
          // Carregar templates atualizados e enviar para a UI
          const updatedTemplates = await getTemplates();
          figma.ui.postMessage({
            type: 'templates-loaded',
            templates: updatedTemplates,
            defaultTemplatesCount: DEFAULT_TEMPLATES.length
          });
        } else if (saveResult.status === 'duplicate') {
          // Enviar mensagem para a UI mostrar o modal de confirmação
          figma.ui.postMessage({
            type: 'template-duplicate',
            template: msg.template,
            existingIndex: saveResult.index
          });
        }
        break;
        
      case 'get-templates':
        const savedTemplates = await getTemplates();
        figma.ui.postMessage({
          type: 'templates-loaded',
          templates: savedTemplates,
          defaultTemplatesCount: DEFAULT_TEMPLATES.length
        });
        break;
        
      case 'delete-template':
        const success = await deleteTemplate(msg.templateIndex);
        if (success) {
          figma.notify('Template deleted successfully!');
          const updatedTemplates = await getTemplates();
          figma.ui.postMessage({
            type: 'templates-loaded',
            templates: updatedTemplates,
            defaultTemplatesCount: DEFAULT_TEMPLATES.length
          });
        }
        break;
        
      case 'replace-template':
        const replaceResult = await replaceTemplate(msg.template, msg.index);
        if (replaceResult) {
          figma.notify('Template updated successfully!');
          
          // Carregar templates atualizados e enviar para a UI
          const updatedTemplates = await getTemplates();
          figma.ui.postMessage({
            type: 'templates-loaded',
            templates: updatedTemplates,
            defaultTemplatesCount: DEFAULT_TEMPLATES.length
          });
        }
        break;
    }

    if (shouldUpdate) {
      figma.ui.postMessage({
        type: 'update-pages',
        pages: getSimplifiedPages()
      });
    }
  } catch (error) {
    console.error('Error:', error);
    figma.notify('Error: ' + error.message);
  }
}; 