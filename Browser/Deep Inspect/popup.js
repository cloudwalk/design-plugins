document.addEventListener('DOMContentLoaded', function() {
  const toggleButton = document.getElementById('toggleSelection');
  const viewCommentsButton = document.getElementById('viewComments');
  const exportButton = document.getElementById('exportFeedback');
  const statusDiv = document.getElementById('status');
  
  let selectionMode = false;

  async function getCurrentTab() {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    return tab;
  }

  function isValidUrl(url) {
    return url && !url.startsWith('chrome://') && !url.startsWith('chrome-extension://') && !url.startsWith('edge://') && !url.startsWith('about:');
  }

  async function injectContentScriptIfNeeded(tab) {
    if (!isValidUrl(tab.url)) {
      throw new Error('This extension cannot be used on browser internal pages. Please try on a normal website.');
    }

    try {
      await chrome.tabs.sendMessage(tab.id, { action: 'ping' });
    } catch (error) {
      await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: ['content.js']
      });
      
      await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: () => {
          const existingStyles = document.querySelectorAll('link[href*="styles.css"], style[data-qa-design]');
          existingStyles.forEach(style => style.remove());
        }
      });
      
      await chrome.scripting.insertCSS({
        target: { tabId: tab.id },
        files: ['styles.css']
      });
    }
  }

  async function updateButtonStates() {
    const tab = await getCurrentTab();
    const isValid = isValidUrl(tab.url);
    
    toggleButton.disabled = !isValid;
    viewCommentsButton.disabled = !isValid;
    exportButton.disabled = !isValid;
    
    if (!isValid) {
      statusDiv.textContent = 'Status: This extension only works on normal web pages';
      statusDiv.style.color = '#ff4444';
    } else {
      statusDiv.textContent = 'Status: Ready to start';
      statusDiv.style.color = '';
    }
  }

  updateButtonStates();

  toggleButton.addEventListener('click', async () => {
    try {
      const tab = await getCurrentTab();
      await injectContentScriptIfNeeded(tab);

      selectionMode = !selectionMode;
      toggleButton.textContent = selectionMode ? 'Stop Selection' : 'Start Selection';
      
      await chrome.tabs.sendMessage(tab.id, {
        action: 'toggleSelection',
        state: selectionMode
      });
      
      statusDiv.textContent = `Status: ${selectionMode ? 'Selection mode active' : 'Selection mode inactive'}`;
      statusDiv.style.color = '';
    } catch (error) {
      console.error('Error:', error);
      statusDiv.textContent = `Status: ${error.message}`;
      statusDiv.style.color = '#ff4444';
      selectionMode = false;
      toggleButton.textContent = 'Start Selection';
    }
  });

  viewCommentsButton.addEventListener('click', async () => {
    try {
      const tab = await getCurrentTab();
      await injectContentScriptIfNeeded(tab);
      
      await chrome.tabs.sendMessage(tab.id, {
        action: 'viewComments'
      });
      statusDiv.style.color = '';
    } catch (error) {
      console.error('Error:', error);
      statusDiv.textContent = `Status: ${error.message}`;
      statusDiv.style.color = '#ff4444';
    }
  });

  exportButton.addEventListener('click', async () => {
    try {
      const tab = await getCurrentTab();
      await injectContentScriptIfNeeded(tab);
      
      await chrome.tabs.sendMessage(tab.id, {
        action: 'exportFeedback'
      });
      statusDiv.style.color = '';
    } catch (error) {
      console.error('Error:', error);
      statusDiv.textContent = `Status: ${error.message}`;
      statusDiv.style.color = '#ff4444';
    }
  });
}); 