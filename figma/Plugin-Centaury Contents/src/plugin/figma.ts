/// <reference types="@figma/plugin-typings" />

export {};

// Initialize plugin UI
figma.showUI(__html__, {
  width: 375,
  height: 812,
  themeColors: true,
  title: "Centaury Contents"
});

// Tipos
type MessageType = {
  type: string;
  items?: string[];
  text?: string;
};

// Utilitários
const shuffleArray = <T>(array: T[]): T[] => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};

const handleUserInfo = async (msg: MessageType) => {
  const textNodes = figma.currentPage.selection
    .filter((node): node is TextNode => node.type === "TEXT")
    .filter(node => !node.removed);

  if (textNodes.length === 0) {
    figma.notify('Selecione um texto para atualizar');
    return;
  }

  try {
    // Load fonts for all text nodes
    await Promise.all(textNodes.flatMap(node => 
      node.getRangeAllFontNames(0, node.characters.length)
        .map(figma.loadFontAsync)
    ));

    // Update text
    textNodes.forEach(node => {
      if (msg.text) {
        node.characters = msg.text;
      }
    });

    figma.notify('Texto atualizado com sucesso');
  } catch (error) {
    console.error('Error updating text:', error);
    figma.notify('Erro ao atualizar o texto');
  }
};

const handleMultipleTexts = async (msg: MessageType, isPayment: boolean = false) => {
  const textNodes = figma.currentPage.selection
    .filter((node): node is TextNode => node.type === "TEXT")
    .filter(node => !node.removed);

  if (textNodes.length === 0) {
    figma.notify('Selecione um ou mais textos para atualizar');
    return;
  }

  try {
    // Load fonts for all text nodes
    await Promise.all(textNodes.flatMap(node => 
      node.getRangeAllFontNames(0, node.characters.length)
        .map(figma.loadFontAsync)
    ));

    // Update the text nodes with the items
    if (msg.items && msg.items.length > 0) {
      // Se não for pagamento, embaralha os itens
      const itemsToUse = isPayment ? msg.items : shuffleArray([...msg.items]);
      
      textNodes.forEach((node, index) => {
        const itemIndex = index % itemsToUse.length;
        node.characters = itemsToUse[itemIndex];
      });

      figma.notify('Textos atualizados com sucesso');
    }
  } catch (error) {
    console.error('Error updating text nodes:', error);
    figma.notify('Erro ao atualizar os textos');
  }
};

// Handle messages from the UI
figma.ui.onmessage = async (msg: MessageType) => {
  console.log('Main controller received message:', msg);
  console.log('Message type:', msg.type);
  console.log('Message content:', msg);

  try {
    if (msg.type === 'update-text') {
      await handleUserInfo(msg);
    } else if (msg.type === 'update-multiple-texts') {
      // Check if the message is coming from the PaymentInfo component
      const isPaymentInfo = msg.items?.some(item => 
        item.includes('R$') || 
        item.includes('x') || 
        item.includes('Cartão') || 
        item.includes('Pix') ||
        item.includes('Boleto')
      );

      await handleMultipleTexts(msg, isPaymentInfo);
    }
  } catch (error) {
    console.error('Error in message handler:', error);
    figma.notify('Erro ao processar a mensagem');
  }
}; 