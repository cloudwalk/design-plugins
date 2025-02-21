// Listener para quando a extensão é instalada ou atualizada
chrome.runtime.onInstalled.addListener(() => {
  console.log('QA Design Feedback extension installed');
});

// Listener para mensagens
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'captureScreen') {
    // Mantém a conexão viva
    const keepAlive = true;

    // Captura a tela e envia de volta
    chrome.tabs.captureVisibleTab(
      sender.tab.windowId,
      { format: 'png' },
      (dataUrl) => {
        // Envia a imagem capturada de volta para o content script
        chrome.tabs.sendMessage(
          sender.tab.id,
          {
            action: 'processScreenshot',
            screenshot: dataUrl
          },
          (response) => {
            if (chrome.runtime.lastError) {
              console.error('Error sending screenshot:', chrome.runtime.lastError);
            }
            sendResponse({ status: 'success' });
          }
        );
      }
    );

    return keepAlive; // Mantém o canal de mensagem aberto
  }
}); 