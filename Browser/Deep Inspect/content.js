class QADesignFeedback {
  constructor() {
    this.selectionMode = false;
    this.comments = [];
    this.currentHoveredElement = null;
    this.activeCommentBubble = null;
    this.activeMarkers = new Set();
    this.categoryColors = {
      'ui': '#0066ff',       // Blue
      'ux': '#9933cc',       // Purple
      'bug': '#ff3333',      // Red
      'accessibility': '#ff9900', // Orange
      'responsive': '#00cc66'    // Green
    };
    this.ensureStylesInjected();
    this.setupEventListeners();
    console.log('QA Design Feedback initialized');
  }

  ensureStylesInjected() {
    // Add Poppins font if not present
    if (!document.querySelector('link[href*="Poppins"]')) {
      const poppinsLink = document.createElement('link');
      poppinsLink.href = 'https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600&display=swap';
      poppinsLink.rel = 'stylesheet';
      document.head.appendChild(poppinsLink);
    }

    // Add Material Icons if not present
    if (!document.querySelector('link[href*="Material+Icons"]')) {
      const materialLink = document.createElement('link');
      materialLink.href = 'https://fonts.googleapis.com/icon?family=Material+Icons';
      materialLink.rel = 'stylesheet';
      document.head.appendChild(materialLink);
    }

    // Remove any existing QA Design styles
    const existingStyles = document.querySelectorAll('style[data-qa-design]');
    existingStyles.forEach(style => style.remove());

    // Inject CSS variables into the page
    const styleVars = document.createElement('style');
    styleVars.setAttribute('data-qa-design', 'variables');
    styleVars.textContent = `
      :root {
        --qa-min-width: 400px;
        --qa-max-width: 800px;
        --qa-primary-color: #404040;
        --qa-primary-hover: #666666;
        --qa-bg-color: #000000;
        --qa-text-color: #FFFFFF;
        --qa-text-secondary: #999999;
        --qa-border-color: #333333;
        --qa-input-bg: #1A1A1A;
        --qa-box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        --qa-result-box-bg: #1A1A1A;
        --qa-hover-bg: #262626;
      }
    `;
    document.head.appendChild(styleVars);

    // Create a style element for the extension's styles
    fetch(chrome.runtime.getURL('styles.css'))
      .then(response => response.text())
      .then(css => {
        const style = document.createElement('style');
        style.setAttribute('data-qa-design', 'main');
        style.textContent = css;
        document.head.appendChild(style);
      })
      .catch(error => {
        console.error('Error loading styles:', error);
      });
  }

  setupEventListeners() {
    // Listener para mensagens do popup
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      console.log('Message received:', request);
      
      // Handler para ping
      if (request.action === 'ping') {
        sendResponse({ status: 'alive' });
        return true;
      }

      // Handler para processamento de screenshot
      if (request.action === 'processScreenshot') {
        this.processScreenshot(request.screenshot)
          .then(() => sendResponse({ status: 'success' }))
          .catch(error => {
            console.error('Error processing screenshot:', error);
            sendResponse({ status: 'error', message: error.message });
          });
        return true;
      }

      try {
        switch (request.action) {
          case 'toggleSelection':
            this.toggleSelectionMode(request.state);
            break;
          case 'viewComments':
            this.showAllComments();
            break;
          case 'exportFeedback':
            this.exportFeedback()
              .then(() => sendResponse({ status: 'success' }))
              .catch(error => sendResponse({ status: 'error', message: error.message }));
            return true;
        }
        sendResponse({ status: 'success' });
      } catch (error) {
        console.error('Error handling message:', error);
        sendResponse({ status: 'error', message: error.message });
      }
      return true;
    });
  }

  toggleSelectionMode(state) {
    this.selectionMode = state;
    
    if (this.selectionMode) {
      document.addEventListener('mouseover', this.handleMouseOver.bind(this), true);
      document.addEventListener('mouseout', this.handleMouseOut.bind(this), true);
      document.addEventListener('click', this.handleClick.bind(this), true);
    } else {
      document.removeEventListener('mouseover', this.handleMouseOver.bind(this), true);
      document.removeEventListener('mouseout', this.handleMouseOut.bind(this), true);
      document.removeEventListener('click', this.handleClick.bind(this), true);
      // Remover qualquer bubble ativo ao desativar o modo de seleção
      if (this.activeCommentBubble) {
        this.activeCommentBubble.remove();
        this.activeCommentBubble = null;
      }
    }
  }

  handleMouseOver(event) {
    if (!this.selectionMode || this.activeCommentBubble) return;
    
    if (this.isOwnElement(event.target)) return;
    
    event.stopPropagation();
    const element = event.target;
    
    this.currentHoveredElement = element;
    element.style.outline = '2px solid #0066ff';
    element.style.cursor = 'pointer';
  }

  handleMouseOut(event) {
    if (!this.selectionMode || this.activeCommentBubble) return;
    
    if (this.isOwnElement(event.target)) return;
    
    event.stopPropagation();
    const element = event.target;
    
    if (this.currentHoveredElement === element) {
      this.currentHoveredElement = null;
      element.style.outline = '';
      element.style.cursor = '';
    }
  }

  handleClick(event) {
    if (!this.selectionMode) return;
    
    // Se já existe um bubble ativo e o clique foi fora dele, feche-o
    if (this.activeCommentBubble) {
      const clickedInside = event.target.closest('.qa-design-comment-bubble');
      if (!clickedInside) {
        this.activeCommentBubble.remove();
        this.activeCommentBubble = null;
      }
      return;
    }
    
    // Não processar cliques em elementos do nosso próprio UI
    if (this.isOwnElement(event.target)) return;
    
    event.preventDefault();
    event.stopPropagation();
    
    const element = event.target;
    this.createCommentBubble(element);
  }

  calculatePosition(elementRect, bubbleWidth, bubbleHeight) {
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const scrollY = window.scrollY;
    const scrollX = window.scrollX;

    // Posição inicial (à direita do elemento)
    let left = elementRect.right + 10;
    let top = elementRect.top + scrollY;

    // Verifica se o bubble vai ultrapassar a largura da viewport
    if (left + bubbleWidth > viewportWidth + scrollX) {
      // Posiciona à esquerda do elemento
      left = elementRect.left - bubbleWidth - 10;
      
      // Se ainda estiver fora da viewport, alinha com a margem
      if (left < scrollX) {
        left = scrollX + 10;
      }
    }

    // Verifica se o bubble vai ultrapassar a altura da viewport
    if (top + bubbleHeight > viewportHeight + scrollY) {
      // Ajusta para cima mantendo dentro da viewport
      top = Math.max(scrollY + 10, viewportHeight + scrollY - bubbleHeight - 10);
    }

    // Garante que o top nunca seja menor que o scroll
    top = Math.max(scrollY + 10, top);

    return { left, top };
  }

  createCommentBubble(element) {
    if (this.activeCommentBubble) {
      this.activeCommentBubble.remove();
    }

    const bubble = document.createElement('div');
    bubble.className = 'qa-design-comment-bubble';
    
    const form = document.createElement('form');
    form.innerHTML = `
      <div class="result-box">
        <div class="result-label">Comment</div>
        <textarea placeholder="Type your comment about this element..."></textarea>
      </div>
      
      <div class="result-box">
        <div class="result-label">Category</div>
        <select>
          <option value="ui">User Interface</option>
          <option value="ux">User Experience</option>
          <option value="bug">Visual Bug</option>
          <option value="accessibility">Accessibility</option>
          <option value="responsive">Responsiveness</option>
        </select>
      </div>

      <div class="button-group">
        <button type="submit">Save</button>
      </div>
    `;

    bubble.appendChild(form);
    document.body.appendChild(bubble);
    this.activeCommentBubble = bubble;

    const rect = element.getBoundingClientRect();
    const bubbleWidth = Math.min(300, window.innerWidth - 40);
    const bubbleHeight = Math.min(400, window.innerHeight - 40);
    const position = this.calculatePosition(rect, bubbleWidth, bubbleHeight);

    bubble.style.left = `${position.left}px`;
    bubble.style.top = `${position.top}px`;

    // Prevent event propagation on the bubble
    bubble.addEventListener('click', (e) => e.stopPropagation(), true);
    bubble.addEventListener('mouseover', (e) => e.stopPropagation(), true);
    bubble.addEventListener('mouseout', (e) => e.stopPropagation(), true);

    // Handle form submission
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      e.stopPropagation();
      
      const category = form.querySelector('select').value;
      const comment = {
        element: element,
        text: form.querySelector('textarea').value,
        category: category,
        color: this.categoryColors[category],
        position: { top: rect.top, left: rect.right }
      };
      
      this.comments.push(comment);
      this.activeCommentBubble = null;
      bubble.remove();
      element.style.outline = '';
      element.style.cursor = '';
      this.createCommentMarker(comment);
    });

    // Focus textarea
    setTimeout(() => {
      const textarea = form.querySelector('textarea');
      if (textarea) {
        textarea.focus();
      }
    }, 100);
  }

  createCommentMarker(comment) {
    const marker = document.createElement('div');
    marker.className = 'qa-design-comment-marker';
    marker.style.backgroundColor = comment.color;
    marker.style.position = 'absolute';
    
    // Store the target element reference
    marker.targetElement = comment.element;
    
    // Calculate initial position
    const elementRect = comment.element.getBoundingClientRect();
    const markerTop = elementRect.top + window.scrollY;
    const markerLeft = elementRect.right + 10;

    marker.style.top = `${markerTop}px`;
    marker.style.left = `${markerLeft}px`;
    
    // Add comment number to marker
    const commentNumber = this.comments.length; // Use length directly as the number
    marker.textContent = commentNumber;
    
    marker.addEventListener('click', (e) => {
      e.stopPropagation();
      this.showCommentDetails(comment, marker);
    });

    document.body.appendChild(marker);

    // Update position when page is scrolled or resized
    const updatePosition = () => {
      if (marker.targetElement && document.body.contains(marker.targetElement)) {
        const updatedRect = marker.targetElement.getBoundingClientRect();
        marker.style.top = `${updatedRect.top + window.scrollY}px`;
        marker.style.left = `${updatedRect.right + 10}px`;
      }
    };

    window.addEventListener('scroll', updatePosition);
    window.addEventListener('resize', updatePosition);
    
    // Store update function for cleanup
    marker.updatePosition = updatePosition;
    
    // Add to active markers set
    this.activeMarkers.add(marker);
    
    return marker;
  }

  showCommentDetails(comment, marker) {
    // Remove any existing details before creating new ones
    const existingDetails = document.querySelector('.qa-design-comment-details');
    if (existingDetails) {
      existingDetails.remove();
    }

    const details = document.createElement('div');
    details.className = 'qa-design-comment-details';
    
    // Get updated position from the marker's target element
    const elementRect = marker.targetElement.getBoundingClientRect();
    
    details.innerHTML = `
      <div class="comment-arrow"></div>
      <div class="result-box">
        <div class="comment-header">
          <span class="category">${this.getCategoryFullName(comment.category)}</span>
          <button class="close">
            <span class="material-icons">close</span>
          </button>
        </div>
        <div class="comment-body">
          ${comment.text}
        </div>
      </div>
    `;

    document.body.appendChild(details);

    // Position details next to the marker
    const markerRect = marker.getBoundingClientRect();
    const detailsWidth = Math.min(300, window.innerWidth - 40);
    
    // Calculate initial position (right of marker)
    let left = markerRect.right + 10;
    let top = markerRect.top + window.scrollY;

    // If no space on right, position on left
    if (left + detailsWidth > window.innerWidth) {
      left = markerRect.left - detailsWidth - 10;
      details.classList.add('arrow-right');
    } else {
      details.classList.add('arrow-left');
    }

    // Adjust vertical position if needed
    const detailsHeight = details.offsetHeight;
    if (top + detailsHeight > window.innerHeight + window.scrollY) {
      top = window.innerHeight + window.scrollY - detailsHeight - 10;
    }

    details.style.left = `${left}px`;
    details.style.top = `${top}px`;

    // Update position when page is scrolled or resized
    const updatePosition = () => {
      const updatedMarkerRect = marker.getBoundingClientRect();
      let newLeft = updatedMarkerRect.right + 10;
      let newTop = updatedMarkerRect.top + window.scrollY;

      if (newLeft + detailsWidth > window.innerWidth) {
        newLeft = updatedMarkerRect.left - detailsWidth - 10;
      }

      if (newTop + detailsHeight > window.innerHeight + window.scrollY) {
        newTop = window.innerHeight + window.scrollY - detailsHeight - 10;
      }

      details.style.left = `${newLeft}px`;
      details.style.top = `${newTop}px`;
    };

    window.addEventListener('scroll', updatePosition);
    window.addEventListener('resize', updatePosition);

    details.querySelector('.close').addEventListener('click', () => {
      details.remove();
      window.removeEventListener('scroll', updatePosition);
      window.removeEventListener('resize', updatePosition);
    });
  }

  showAllComments() {
    // Remove existing markers first
    this.clearAllMarkers();
    
    // Create new markers for all comments
    this.comments.forEach(comment => {
      if (comment.element && document.body.contains(comment.element)) {
        this.createCommentMarker(comment);
      }
    });
  }

  clearAllMarkers() {
    // Remove all existing markers and their event listeners
    this.activeMarkers.forEach(marker => {
      if (marker.updatePosition) {
        window.removeEventListener('scroll', marker.updatePosition);
        window.removeEventListener('resize', marker.updatePosition);
      }
      marker.remove();
    });
    this.activeMarkers.clear();

    // Remove any existing comment details
    const existingDetails = document.querySelector('.qa-design-comment-details');
    if (existingDetails) {
      existingDetails.remove();
    }
  }

  async exportFeedback() {
    try {
      // Primeiro, vamos mostrar todos os comentários
      this.showAllComments();

      // Aguarda um momento para garantir que todos os comentários foram renderizados
      await new Promise(resolve => setTimeout(resolve, 100));

      // Solicita a captura de tela e aguarda a resposta
      return new Promise((resolve, reject) => {
        chrome.runtime.sendMessage(
          { action: 'captureScreen' },
          (response) => {
            if (chrome.runtime.lastError) {
              console.error('Error capturing screen:', chrome.runtime.lastError);
              reject(chrome.runtime.lastError);
            } else {
              resolve(response);
            }
          }
        );
      });
    } catch (error) {
      console.error('Error in exportFeedback:', error);
      alert('Ocorreu um erro ao exportar o feedback. Por favor, tente novamente.');
    }
  }

  async processScreenshot(screenshotUrl) {
    if (!screenshotUrl) {
      throw new Error('Screenshot URL is missing');
    }

    try {
      // Store current markers state
      const currentMarkers = Array.from(document.querySelectorAll('.qa-design-comment-marker'));
      
      // Temporarily hide existing markers for the screenshot
      currentMarkers.forEach(marker => marker.style.display = 'none');

      // Get current URL path and date for filename
      const urlPath = window.location.pathname.split('/').pop() || 'home';
      const date = new Date();
      const day = date.getDate();
      const month = date.toLocaleString('pt-BR', { month: 'short' }).replace('.', '');
      const filename = `${urlPath}-${day}${month}`;

      // Create two canvases: one for markers and one for comments
      const markerCanvas = document.createElement('canvas');
      const commentCanvas = document.createElement('canvas');
      const markerCtx = markerCanvas.getContext('2d');
      const commentCtx = commentCanvas.getContext('2d');
      const img = new Image();

      // Load the screenshot
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
        img.src = screenshotUrl;
      });

      // Set canvas dimensions
      markerCanvas.width = img.width;
      markerCanvas.height = img.height;
      commentCanvas.width = Math.min(800, img.width);
      commentCanvas.height = this.comments.length * 150 + 100;

      // Draw screenshot on marker canvas
      markerCtx.drawImage(img, 0, 0);

      // Draw markers on the screenshot
      this.comments.forEach((comment, index) => {
        if (comment.element && document.body.contains(comment.element)) {
          const rect = comment.element.getBoundingClientRect();
          const x = rect.right + 10;
          const y = rect.top;
          const number = index + 1;

          // Draw marker circle
          markerCtx.beginPath();
          markerCtx.arc(x, y + 15, 15, 0, Math.PI * 2);
          markerCtx.fillStyle = comment.color;
          markerCtx.fill();

          // Draw marker number
          markerCtx.fillStyle = 'white';
          markerCtx.font = 'bold 16px Arial';
          markerCtx.textAlign = 'center';
          markerCtx.textBaseline = 'middle';
          markerCtx.fillText(number.toString(), x, y + 15);
        }
      });

      // Draw comments on separate canvas
      commentCtx.fillStyle = '#000000';
      commentCtx.fillRect(0, 0, commentCanvas.width, commentCanvas.height);

      // Draw title
      commentCtx.fillStyle = 'white';
      commentCtx.font = 'bold 24px Arial';
      commentCtx.fillText('Design Feedback Comments', 30, 40);

      // Draw comments
      let currentY = 100;
      this.comments.forEach((comment, index) => {
        const number = index + 1; // Start numbering from 1
        const boxHeight = 120;
        const boxWidth = commentCanvas.width - 60;
        
        // Draw comment box
        commentCtx.fillStyle = '#1A1A1A';
        commentCtx.beginPath();
        commentCtx.roundRect(30, currentY, boxWidth, boxHeight, 8);
        commentCtx.fill();
        
        // Draw marker number
        commentCtx.beginPath();
        commentCtx.arc(60, currentY + 30, 15, 0, Math.PI * 2);
        commentCtx.fillStyle = comment.color;
        commentCtx.fill();
        commentCtx.fillStyle = 'white';
        commentCtx.font = 'bold 16px Arial';
        commentCtx.textAlign = 'center';
        commentCtx.fillText(number.toString(), 60, currentY + 30);

        // Draw category
        commentCtx.fillStyle = comment.color;
        commentCtx.font = 'bold 14px Arial';
        commentCtx.textAlign = 'left';
        commentCtx.fillText(this.getCategoryFullName(comment.category), 90, currentY + 30);

        // Draw comment text
        commentCtx.fillStyle = '#999999';
        commentCtx.font = '14px Arial';
        
        // Word wrap the comment text
        const words = comment.text.split(' ');
        let line = '';
        let lineY = currentY + 60;
        const maxWidth = boxWidth - 80;

        words.forEach(word => {
          const testLine = line + word + ' ';
          const metrics = commentCtx.measureText(testLine);
          
          if (metrics.width > maxWidth) {
            commentCtx.fillText(line, 90, lineY);
            line = word + ' ';
            lineY += 20;
          } else {
            line = testLine;
          }
        });
        commentCtx.fillText(line, 90, lineY);

        currentY += boxHeight + 20;
      });

      // Convert canvases to PNG data
      const markerPngUrl = markerCanvas.toDataURL('image/png');
      const commentPngUrl = commentCanvas.toDataURL('image/png');

      // Create ZIP file
      const zip = new JSZip();
      
      // Convert base64 data URLs to binary
      const markerData = atob(markerPngUrl.split(',')[1]);
      const commentData = atob(commentPngUrl.split(',')[1]);
      
      // Convert binary string to Uint8Array
      const markerArray = new Uint8Array(markerData.length);
      const commentArray = new Uint8Array(commentData.length);
      
      for (let i = 0; i < markerData.length; i++) {
        markerArray[i] = markerData.charCodeAt(i);
      }
      for (let i = 0; i < commentData.length; i++) {
        commentArray[i] = commentData.charCodeAt(i);
      }

      // Add files to ZIP
      zip.file(`${filename}-markers.png`, markerArray);
      zip.file(`${filename}-comments.png`, commentArray);

      // Generate ZIP file
      const zipContent = await zip.generateAsync({type: 'blob'});
      
      // Create download link for ZIP
      const downloadLink = document.createElement('a');
      downloadLink.href = URL.createObjectURL(zipContent);
      downloadLink.download = `${filename}.zip`;
      downloadLink.click();

      // Cleanup
      URL.revokeObjectURL(downloadLink.href);

      // Restore markers visibility
      currentMarkers.forEach(marker => marker.style.display = '');

    } catch (error) {
      console.error('Error processing screenshot:', error);
      // Ensure markers are visible again even if there's an error
      document.querySelectorAll('.qa-design-comment-marker')
        .forEach(marker => marker.style.display = '');
      throw error;
    }
  }

  // Função para obter o nome completo da categoria
  getCategoryFullName(category) {
    const categories = {
      'ui': 'User Interface',
      'ux': 'User Experience',
      'bug': 'Visual Bug',
      'accessibility': 'Accessibility',
      'responsive': 'Responsiveness'
    };
    return categories[category] || category;
  }

  getElementPath(element) {
    const path = [];
    while (element && element.nodeType === Node.ELEMENT_NODE) {
      let selector = element.nodeName.toLowerCase();
      if (element.id) {
        selector += `#${element.id}`;
      } else if (element.className) {
        selector += `.${element.className.replace(/\s+/g, '.')}`;
      }
      path.unshift(selector);
      element = element.parentNode;
    }
    return path.join(' > ');
  }

  isOwnElement(element) {
    // Implemente a lógica para determinar se o elemento pertence ao nosso próprio UI
    // Esta é uma implementação básica e pode ser melhorada com base nas suas necessidades
    return false; // Retorna falso por padrão, implemente a lógica adequada
  }
}

// Inicializar a extensão e guardar a instância globalmente
try {
  window.qaDesignFeedback = new QADesignFeedback();
  console.log('QA Design Feedback loaded successfully');
} catch (error) {
  console.error('Error initializing QA Design Feedback:', error);
} 