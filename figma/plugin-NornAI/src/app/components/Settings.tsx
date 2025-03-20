import React, { useState, useEffect } from 'react';

interface SettingsProps {
  onClose: () => void;
  language: string;
}

const translations = {
  'pt-BR': {
    title: 'Configurações',
    configured: 'Configurada',
    apiKeyLabel: 'OpenAI API Key',
    apiKeyConfigured: 'API key configurada. Insira uma nova chave para atualizar.',
    getApiKeyText: 'Obtenha sua chave API em',
    invalidFormat: 'Formato de API key inválido. Deve começar com "sk-"',
    saveError: 'Falha ao salvar API key',
    saveSuccess: 'API key salva com sucesso!',
    saving: 'Salvando...',
    save: 'Salvar',
    close: 'Fechar'
  },
  'en-US': {
    title: 'Settings',
    configured: 'Configured',
    apiKeyLabel: 'OpenAI API Key',
    apiKeyConfigured: 'API key configured. Enter a new key to update.',
    getApiKeyText: 'Get your API key at',
    invalidFormat: 'Invalid API key format. It should start with "sk-"',
    saveError: 'Failed to save API key',
    saveSuccess: 'API key saved successfully!',
    saving: 'Saving...',
    save: 'Save',
    close: 'Close'
  },
  'es': {
    title: 'Configuración',
    configured: 'Configurada',
    apiKeyLabel: 'OpenAI API Key',
    apiKeyConfigured: 'API key configurada. Ingrese una nueva clave para actualizar.',
    getApiKeyText: 'Obtenga su clave API en',
    invalidFormat: 'Formato de API key inválido. Debe comenzar con "sk-"',
    saveError: 'Error al guardar la API key',
    saveSuccess: '¡API key guardada con éxito!',
    saving: 'Guardando...',
    save: 'Guardar',
    close: 'Cerrar'
  }
};

export function Settings({ onClose, language }: SettingsProps) {
  const [apiKey, setApiKey] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isConfigured, setIsConfigured] = useState(false);

  const t = translations[language as keyof typeof translations];

  useEffect(() => {
    // Request current API key status when component mounts
    parent.postMessage({ 
      pluginMessage: { 
        type: 'get-api-key-status'
      }
    }, '*');
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!apiKey.trim().startsWith('sk-')) {
      setError(t.invalidFormat);
      return;
    }
    setIsSaving(true);
    setError(null);
    setSuccess(false);

    parent.postMessage({ 
      pluginMessage: { 
        type: 'set-api-key', 
        apiKey: apiKey.trim()
      }
    }, '*');
  };

  // Clear form after submission
  const resetForm = () => {
    setApiKey('');
    setError(null);
    setSuccess(false);
    setIsSaving(false);
  };

  // Handle messages from the plugin controller
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      const { type, success: isSuccess, error: errorMsg, hasApiKey } = event.data.pluginMessage;
      
      if (type === 'api-key-status') {
        setIsConfigured(hasApiKey);
      }
      
      if (type === 'api-key-saved') {
        setIsSaving(false);
        if (isSuccess) {
          setSuccess(true);
          setIsConfigured(true);
          resetForm();
          onClose();
        } else {
          setError(errorMsg || t.saveError);
        }
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [onClose, t]);

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center transition-all duration-300">
      <div className="bg-surface-primary border border-border-primary rounded-lg p-6 w-96 max-w-full mx-4 shadow-lg">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-medium text-text-primary">{t.title}</h2>
          {isConfigured && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-800/20 dark:text-green-400">
              <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
              </svg>
              {t.configured}
            </span>
          )}
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="apiKey" className="block text-sm font-medium text-text-primary mb-1">
              {t.apiKeyLabel}
            </label>
            <input
              type="password"
              id="apiKey"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="w-full px-3 py-2 bg-surface-secondary text-text-primary border border-border-primary rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-brand-primary transition-all duration-200"
              placeholder={isConfigured ? "••••••••" : "sk-..."}
              required
              pattern="sk-[A-Za-z0-9_\-\.]+"
              title={t.invalidFormat}
            />
            <p className="mt-1 text-sm text-text-secondary">
              {isConfigured ? (
                t.apiKeyConfigured
              ) : (
                <>
                  {t.getApiKeyText}{' '}
                  <a 
                    href="https://platform.openai.com/api-keys" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-brand-primary hover:text-brand-secondary transition-colors duration-200"
                  >
                    platform.openai.com
                  </a>
                </>
              )}
            </p>
          </div>

          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-600 dark:text-red-400 text-sm">
              {error}
            </div>
          )}

          {success && (
            <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg text-green-600 dark:text-green-400 text-sm">
              {t.saveSuccess}
            </div>
          )}

          <div className="flex justify-end space-x-3 pt-2">
            <button
              type="button"
              onClick={() => {
                resetForm();
                onClose();
              }}
              className="px-4 py-2 rounded-full text-text-primary hover:text-text-secondary transition-colors duration-200"
            >
              {t.close}
            </button>
            <button
              type="submit"
              disabled={isSaving || !apiKey.trim()}
              className={`px-4 py-2 rounded-full text-text-primary hover:text-green-400 disabled:text-gray-600 disabled:hover:text-gray-600 disabled:cursor-not-allowed transition-all duration-200 ${
                isSaving ? 'opacity-75' : ''
              }`}
            >
              {isSaving ? t.saving : t.save}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
