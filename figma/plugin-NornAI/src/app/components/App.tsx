import React, { useState, useEffect } from 'react';
import { Settings } from './Settings';
import { LanguageDropdown } from './LanguageDropdown';
import { Images } from './Images';
import toneDefinitions from './toneDefinitions.json';

type Tab = 'text-gpt' | 'images';

interface ToneOption {
  label: string;
  instructions: string;
}

type SelectedOptionType = {
  type: 'tone' | 'suggestion';
  value: string;
  instructions?: string;
};

interface LanguageInterface {
  emptyStateTitle: string;
  emptyStateDesc: string;
  toneLabel: string;
  generateButton: string;
  generating: string;
  alternativesTitle: string;
  suggestionCount: string;
  selectedTexts: string;
  chat: string;
  title: string;
}

interface LanguageOption {
  label: string;
  icon: string;
  instructions: string;
  interface: LanguageInterface;
}

const toneOptions: Record<string, Record<string, ToneOption>> = toneDefinitions.toneOptions;
const suggestionOptions: Record<string, Record<string, ToneOption>> = toneDefinitions.suggestionOptions;
const languageOptions: Record<string, LanguageOption> = toneDefinitions.languageOptions;

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('text-gpt');
  const [selectedText, setSelectedText] = useState('');
  const [totalTextNodes, setTotalTextNodes] = useState(0);
  const [generatedTexts, setGeneratedTexts] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [language, setLanguage] = useState('en-US');
  const [showSettings, setShowSettings] = useState(false);
  const [customPrompt, setCustomPrompt] = useState('');
  const [selectedOption, setSelectedOption] = useState<SelectedOptionType>({ 
    type: 'tone', 
    value: 'standard',
    instructions: toneOptions['en-US'].standard.instructions
  });

  const handleToneSelect = (key: string) => {
    setSelectedOption({ 
      type: 'tone', 
      value: key,
      instructions: toneOptions[language][key].instructions
    });
    setCustomPrompt('');
    generateText(toneOptions[language][key].instructions);
  };

  const handleSuggestionSelect = (key: string) => {
    setSelectedOption({ 
      type: 'suggestion', 
      value: key,
      instructions: suggestionOptions[language][key].instructions
    });
    generateText(suggestionOptions[language][key].instructions);
  };

  // Get current language interface texts
  const i18n = {
    ...languageOptions[language].interface,
    quickSuggestions: language === 'pt-BR' ? 'Sugestões rápidas' : 
                     language === 'en-US' ? 'Quick suggestions' : 
                     'Sugerencias rápidas',
    customPromptPlaceholder: language === 'pt-BR' ? 'Digite uma instrução personalizada (ex: "Torne o texto mais formal", "Adicione mais exemplos")' :
                            language === 'en-US' ? 'Type a custom instruction (e.g., "Make the text more formal", "Add more examples")' :
                            'Escribe una instrucción personalizada (ej: "Haz el texto más formal", "Agrega más ejemplos")',
    sendButton: language === 'pt-BR' ? 'Enviar' :
                language === 'en-US' ? 'Send' :
                'Enviar'
  };

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      const { type, message, totalTextNodes, alternatives, error: errorMsg, success, text } = event.data.pluginMessage;
      console.log('📨 Received message:', type, event.data.pluginMessage);
      
      switch (type) {
        case 'selected-text':
          console.log('📝 Setting selected text:', message);
          setSelectedText(message);
          setTotalTextNodes(totalTextNodes);
          setGeneratedTexts([]);
          setError(null);
          break;
        case 'alternatives-generated':
          console.log('✨ Setting alternatives:', alternatives);
          setGeneratedTexts(alternatives);
          setIsLoading(false);
          setError(null);
          break;
        case 'text-replaced':
          console.log('🔄 Text replaced:', { success, text });
          if (success && text) {
            setSelectedText(text);
            setGeneratedTexts([]); // Clear alternatives after successful replacement
            setError(null);
            // Force a selection check to update the UI with the new text
            parent.postMessage({ 
              pluginMessage: { 
                type: 'get-initial-selection'
              }
            }, '*');
          } else if (!success && errorMsg) {
            console.error('❌ Error replacing text:', errorMsg);
            setError(errorMsg);
          }
          break;
        case 'generation-error':
          console.error('❌ Generation error:', errorMsg);
          if (errorMsg.includes('API key')) {
            setShowSettings(true);
          } else {
            setError(errorMsg);
          }
          setIsLoading(false);
          break;
        case 'open-settings':
          setShowSettings(true);
          break;
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  const getCaseInstruction = (lang: string) => {
    switch (lang) {
      case 'en-US':
        return 'Maintain the same case (uppercase/lowercase) as the original text.';
      case 'es':
        return 'Mantén el mismo caso (mayúsculas/minúsculas) que el texto original.';
      default: // pt-BR
        return 'Mantenha o mesmo caso (maiúsculas/minúsculas) do texto original.';
    }
  };

  const generateText = (promptText?: string) => {
    if (!selectedText) return;
    
    setIsLoading(true);
    setError(null);
    
    // Get the final prompt - either from parameter or from selected tone
    const finalPrompt = promptText || 
      (selectedOption.type === 'tone' ? toneOptions[language][selectedOption.value].instructions : '');

    if (!finalPrompt) return;

    // Add case instruction in the correct language
    const promptWithCase = `${finalPrompt} ${getCaseInstruction(language)}`;
    
    parent.postMessage({
      pluginMessage: {
        type: 'process-prompt',
        prompt: promptWithCase,
        text: selectedText,
        language: language
      }
    }, '*');
  };

  const handleCustomPrompt = async () => {
    // Check if we have either a tone selected or custom prompt
    if (selectedOption.type === 'tone' || customPrompt.trim()) {
      console.log('Sending prompt:', selectedOption.type === 'tone' ? selectedOption.instructions : customPrompt.trim());
      
      // Get prompt text from either tone or custom input
      const promptText = selectedOption.type === 'tone' 
        ? toneOptions[language][selectedOption.value].instructions
        : customPrompt.trim();
      
      // Generate text with the prompt
      generateText(promptText);
      
      // Update selected option if using custom prompt
      if (selectedOption.type !== 'tone') {
        setSelectedOption({ type: 'suggestion', value: promptText });
      }
      
      // Clear custom prompt after response
      if (customPrompt.trim()) {
        const handleResponse = (event: MessageEvent) => {
          const { type } = event.data.pluginMessage;
          if (type === 'alternatives-generated') {
            setCustomPrompt('');
            window.removeEventListener('message', handleResponse);
          }
        };
        
        window.addEventListener('message', handleResponse);
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey && customPrompt.trim()) {
      e.preventDefault();
      handleCustomPrompt();
    }
  };

  return (
    <div className="main-container">
      {/* Header */}
      <header>
        <div className="flex items-center justify-between">
          {/* Tabs */}
          <nav className="flex space-x-2">
            <button
              onClick={() => setActiveTab('text-gpt')}
              className={`tab-button ${activeTab === 'text-gpt' ? 'active' : ''}`}
            >
              Text
            </button>
            <button
              onClick={() => setActiveTab('images')}
              className={`tab-button ${activeTab === 'images' ? 'active' : ''}`}
            >
              Images
            </button>
          </nav>

          <div className="flex items-center space-x-2">
            {/* Language Switcher */}
            <LanguageDropdown
              options={languageOptions}
              value={language}
              onChange={setLanguage}
            />

            {/* Settings Button */}
            <button
              onClick={() => setShowSettings(true)}
              className="settings-button"
              title="Settings"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="content-area">
        {activeTab === 'images' ? (
          <Images onSelectImage={(imageUrl) => {
            parent.postMessage({ 
              pluginMessage: { 
                type: 'insert-image',
                imageUrl
              }
            }, '*');
          }} />
        ) : (
          <>
            {/* Selected Text Card */}
            <div className="card">
              {selectedText ? (
                <div className="space-y-2">
                  <p className="text-text-primary">{selectedText}</p>
                  {totalTextNodes > 1 && (
                    <p className="text-text-tertiary text-sm">
                      +{totalTextNodes - 1} {i18n.selectedTexts}
                    </p>
                  )}
                </div>
              ) : (
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
                    {i18n.emptyStateTitle}
                  </h3>
                  <p className="text-text-tertiary text-sm">
                    {i18n.emptyStateDesc}
                  </p>
                </div>
              )}
            </div>

            {selectedText && (
              <>
                {/* Tone Selection */}
                <div className="card mt-4">
                  <h3 className="text-sm font-medium mb-3">{i18n.toneLabel}</h3>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(toneOptions[language]).map(([key, option]) => (
                      <button
                        key={key}
                        onClick={() => handleToneSelect(key)}
                        className={`tone-button ${
                          selectedOption.type === 'tone' && selectedOption.value === key ? 'active' : ''
                        }`}
                        disabled={isLoading}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Quick Suggestions */}
                <div className="card mt-4">
                  <h3 className="text-sm font-medium mb-3">{i18n.quickSuggestions}</h3>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(suggestionOptions[language]).map(([key, option]) => (
                      <button
                        key={key}
                        onClick={() => handleSuggestionSelect(key)}
                        className={`suggestion-button ${
                          selectedOption.type === 'suggestion' && selectedOption.value === key
                            ? 'active'
                            : ''
                        }`}
                        disabled={isLoading}
                        style={{ textTransform: 'none' }}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Custom Prompt */}
                <div className="card mt-4">
                  <div className="flex flex-col gap-3">
                    <textarea
                      value={customPrompt}
                      onChange={(e) => setCustomPrompt(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder={i18n.customPromptPlaceholder}
                      className="w-full px-4 py-4 border border-border-primary rounded-lg bg-background-primary text-text-primary resize-none focus:border-border-focus focus:outline-none min-h-[120px]"
                      disabled={isLoading}
                    />
                    <button
                      onClick={handleCustomPrompt}
                      disabled={isLoading}
                      className="btn btn-primary w-full py-3 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isLoading ? (
                        <span className="flex items-center justify-center">
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          {i18n.generating}
                        </span>
                      ) : (
                        i18n.sendButton
                      )}
                    </button>
                  </div>
                </div>

                {error && (
                  <div className="card mt-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <svg 
                          className="w-5 h-5 text-red-500" 
                          fill="none" 
                          stroke="currentColor" 
                          viewBox="0 0 24 24"
                        >
                          <path 
                            strokeLinecap="round" 
                            strokeLinejoin="round" 
                            strokeWidth="1.5" 
                            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        <p className="text-text-primary text-sm flex-1">{error}</p>
                      </div>
                      {error.toLowerCase().includes('api key') && (
                        <button
                          onClick={() => setShowSettings(true)}
                          className="flex items-center ml-4 px-3 py-1.5 text-sm bg-brand-primary hover:bg-brand-secondary text-white rounded-lg transition-colors duration-150"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                          </svg>
                          Configurar API Key
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {/* Generated Texts */}
                {generatedTexts.length > 0 && (
                  <div className="card mt-4">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-text-primary font-medium">{i18n.alternativesTitle}</h3>
                      <span className="text-text-tertiary text-sm">
                        {generatedTexts.length} {i18n.suggestionCount}
                      </span>
                    </div>
                    <div className="space-y-3">
                      {generatedTexts.map((text, index) => (
                        <button
                          key={index}
                          onClick={() => {
                            const cleanText = text.replace(/^"|"$/g, '').trim();
                            console.log('🖱️ Clicked on alternative:', cleanText);
                            // Send message to replace text in Figma
                            parent.postMessage({ 
                              pluginMessage: { 
                                type: 'replace-text', 
                                text: cleanText
                              }
                            }, '*');
                          }}
                          className="w-full text-left p-4 rounded-lg border border-border-primary hover:border-border-focus group transition-all duration-200 cursor-pointer"
                        >
                          <p className="text-text-primary group-hover:text-brand-primary" style={{ textTransform: 'none' }}>
                            {text}
                          </p>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </>
        )}
      </div>

      {/* Settings Modal */}
      {showSettings && <Settings onClose={() => setShowSettings(false)} language={language} />}
    </div>
  );
};

export default App;
