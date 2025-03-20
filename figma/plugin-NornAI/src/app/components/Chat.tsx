import React, { useState, useEffect } from 'react';

interface ChatProps {
  onSelectContent: (text: string) => void;
  selectedText: string;
  onOpenSettings: () => void;
}

interface SuggestionChip {
  label: string;
  prompt: string;
}

export function Chat({ onSelectContent, selectedText, onOpenSettings }: ChatProps) {
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [alternatives, setAlternatives] = useState<string[]>([]);
  const [error, setError] = useState<React.ReactNode | null>(null);

  // Predefined suggestion chips
  const suggestionChips: SuggestionChip[] = [
    { label: 'Resumir', prompt: 'Resuma este texto de forma concisa' },
    { label: 'Reduzir', prompt: 'reduza este texto pela metade dele de forma que faça sentido' },
    { label: 'Expandir', prompt: 'Expanda este texto com mais detalhes' },
    { label: 'Mais persuasivo', prompt: 'Torne o texto mais persuasivo' },
    { label: 'Simplificar', prompt: 'Simplifique este texto mantendo a mensagem principal' },
    { label: 'Mais amigável', prompt: 'Reescreva em um tom mais amigável e acolhedor' },
    { label: 'Mais profissional', prompt: 'Adapte para um tom mais profissional e direto' }
  ];

  const handleChipClick = (chip: SuggestionChip) => {
    setInputText(chip.prompt);
    handleSendMessage(chip.prompt);
  };

  const handleSendMessage = async (promptText?: string) => {
    const textToSend = promptText || inputText;
    if (!textToSend.trim() || !selectedText) return;
    
    setIsLoading(true);
    
    // Send message to plugin controller
    parent.postMessage({ 
      pluginMessage: { 
        type: 'chat-message',
        prompt: textToSend,
        requiresSelection: true
      }
    }, '*');

    if (!promptText) {
      setInputText('');
    }
  };

  // Request initial selection on mount
  useEffect(() => {
    parent.postMessage({ 
      pluginMessage: { 
        type: 'get-initial-selection'
      }
    }, '*');
  }, []);

  // Listen for messages from the plugin controller
  useEffect(() => {
    const messageHandler = (event: MessageEvent) => {
      const { type, response, error, message } = event.data.pluginMessage;
      console.log('📨 Received message:', type, event.data.pluginMessage);
      
      if (type === 'selected-text') {
        console.log('📝 Received selected text:', message);
        onSelectContent(message);
      } else if (type === 'chat-response') {
        // Split response into alternatives (one per line)
        const options = response
          .split('\n')
          .map(line => line.trim())
          .filter(line => line && !line.match(/^\d+\./))
          .slice(0, 5);
        
        setAlternatives(options);
        setIsLoading(false);
      } else if (type === 'generation-error') {
        console.error('Error:', error);
        setIsLoading(false);
        if (error.includes('API key')) {
          setError(
            <div className="flex items-center justify-between">
              <span>{error}</span>
              <button
                onClick={onOpenSettings}
                className="flex items-center ml-4 px-3 py-1.5 text-sm bg-surface-secondary hover:bg-surface-tertiary text-text-primary rounded-lg transition-colors duration-150"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                </svg>
                Configurar API Key
              </button>
            </div>
          );
        }
      }
    };

    window.addEventListener('message', messageHandler);
    return () => window.removeEventListener('message', messageHandler);
  }, [onOpenSettings]);

  if (!selectedText) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <svg 
          className="w-16 h-16 text-text-tertiary mb-4" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth="1.5" 
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
        <h3 className="text-text-primary font-medium mb-1">
          Selecione um texto para começar
        </h3>
        <p className="text-text-tertiary text-sm">
          Por favor, selecione um texto no Figma para continuar
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Selected Text */}
      <div className="card mb-6">
        <h3 className="text-sm font-medium mb-3">Texto selecionado:</h3>
        <p className="text-text-primary">{selectedText}</p>
      </div>

      {/* Suggestion Chips */}
      <div className="mb-6">
        <h3 className="text-sm font-medium mb-3">Sugestões rápidas:</h3>
        <div className="flex flex-wrap gap-2">
          {suggestionChips.map((chip) => (
            <button
              key={chip.label}
              onClick={() => handleChipClick(chip)}
              className="px-4 py-2 bg-surface-secondary hover:bg-background-tertiary rounded-full text-sm text-text-secondary transition-colors"
            >
              {chip.label}
            </button>
          ))}
        </div>
      </div>

      {/* Input Area */}
      <div className="flex flex-col gap-3 mb-6">
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
            placeholder="Digite uma instrução (ex: 'Resuma este texto', 'Adicione mais detalhes')"
            className="w-full px-4 py-4 border border-border-primary rounded-lg bg-background-primary text-text-primary resize-none focus:border-border-focus focus:outline-none min-h-[120px]"
            disabled={isLoading}
          />
        <button
          onClick={() => handleSendMessage()}
          disabled={isLoading || !inputText.trim()}
          className="btn btn-primary w-full py-3 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Gerando...
            </span>
          ) : (
            'Enviar'
          )}
        </button>
      </div>

      {/* Alternatives */}
      {alternatives.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-sm font-medium mb-3">Opções geradas:</h3>
          {alternatives.map((text, index) => (
            <button
              key={index}
              onClick={() => onSelectContent(text)}
              className="card w-full text-left group transition-all duration-200 hover:border-border-focus p-4"
            >
              <p className="text-text-primary group-hover:text-brand-primary transition-colors">
                {text}
              </p>
            </button>
          ))}
        </div>
      )}

      {error && (
        <div className="mt-4 p-4 bg-surface-secondary rounded-lg">
          {error}
        </div>
      )}
    </div>
  );
}
