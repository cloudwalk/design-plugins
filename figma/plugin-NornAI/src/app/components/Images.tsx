import React, { useState, useEffect } from 'react';

// Custom styles for the color picker
import '../styles/color-picker.css';

interface ImagesProps {
  onSelectImage: (imageUrl: string) => void;
}

export const Images: React.FC<ImagesProps> = ({ onSelectImage }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [images, setImages] = useState<string[]>([]);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showColumnPicker, setShowColumnPicker] = useState(false);
  const [gridColumns, setGridColumns] = useState(3);
  const [error, setError] = useState<string | null>(null);
  const [validImages, setValidImages] = useState<Set<string>>(new Set());
  const [proxyAttempted, setProxyAttempted] = useState<Set<string>>(new Set());
  const [failedImages, setFailedImages] = useState<Set<string>>(new Set());
  const [alternativeImages, setAlternativeImages] = useState<{ [key: string]: string[] }>({});
  const [replacementAttempts, setReplacementAttempts] = useState<{ [key: string]: number }>({});
  const [usedImages, setUsedImages] = useState<Set<string>>(new Set());
  const [loadingTimeouts, setLoadingTimeouts] = useState<{ [key: string]: number }>({});
  const [totalAttempts, setTotalAttempts] = useState<number>(0);
  const TIMEOUT_DURATION = 5000; // 5 seconds timeout
  const MAX_REPLACEMENT_ATTEMPTS = 3;
  const LOADING_TIMEOUT = 10000; // 10 seconds max loading time
  const MAX_TOTAL_ATTEMPTS = 50; // Maximum number of total attempts

  const columnOptions = [
    { value: 1, label: '1 coluna' },
    { value: 2, label: '2 colunas' },
    { value: 3, label: '3 colunas' },
    { value: 4, label: '4 colunas' }
  ];

  const colorOptions = [
    { value: 'red', label: 'Vermelho', color: '#FF0000' },
    { value: 'blue', label: 'Azul', color: '#0000FF' },
    { value: 'green', label: 'Verde', color: '#00FF00' },
    { value: 'yellow', label: 'Amarelo', color: '#FFFF00' },
    { value: 'purple', label: 'Roxo', color: '#800080' },
    { value: 'orange', label: 'Laranja', color: '#FF8000' },
    { value: 'black', label: 'Preto', color: '#000000' },
    { value: 'white', label: 'Branco', color: '#FFFFFF' },
    { value: 'gray', label: 'Cinza', color: '#808080' }
  ];

  // Listen for messages from the plugin controller
  useEffect(() => {
    console.log('🎯 Configurando listener de mensagens...');
    
    const messageHandler = (event: MessageEvent) => {
      const { type, images: receivedImages, error: receivedError } = event.data.pluginMessage || {};
      console.log('📬 Mensagem recebida no componente:', type, event.data.pluginMessage);
      
      if (type === 'images-found') {
        console.log('🎬 Iniciando processamento de imagens no componente React');
        console.log('✨ Imagens encontradas:', receivedImages?.length || 0);
        
        // Helper function to get base name of image
        const getBaseName = (url: string): string => {
          try {
            const urlObj = new URL(url);
            const pathParts = urlObj.pathname.split('/');
            const fileName = pathParts[pathParts.length - 1];
            return fileName.split('.')[0].toLowerCase();
          } catch {
            return url;
          }
        };

        // Remove duplicates considering base names
        const uniqueUrls = new Set<string>();
        const baseNameMap = new Map<string, string>();
        const uniqueImages = (receivedImages || []).filter((url: string) => {
          const baseName = getBaseName(url);
          if (baseNameMap.has(baseName) || uniqueUrls.has(url)) {
            return false;
          }
          uniqueUrls.add(url);
          baseNameMap.set(baseName, url);
          return true;
        });

        console.log('📦 Atualizando estado com imagens únicas:', uniqueImages.length);
        setImages(uniqueImages);
        
        // Group similar images together for fallbacks, avoiding duplicates
        const imageGroups: { [key: string]: string[] } = {};
        uniqueImages.forEach((img: string) => {
          const baseName = getBaseName(img);
          imageGroups[img] = uniqueImages.filter(other => {
            const otherBaseName = getBaseName(other);
            return other !== img && otherBaseName !== baseName;
          });
        });
        setAlternativeImages(imageGroups);
        
        setIsLoading(false);
        setError(null);
      } else if (type === 'search-error') {
        console.error('❌ Erro recebido:', receivedError);
        setError(receivedError || 'Erro na busca de imagens');
        setIsLoading(false);
      }
    };

    window.addEventListener('message', messageHandler);
    return () => window.removeEventListener('message', messageHandler);
  }, []);

  // Clear image cache
  const clearImageCache = () => {
    // Clear all image-related states
    setImages([]);
    setValidImages(new Set());
    setProxyAttempted(new Set());
    setFailedImages(new Set());
    setAlternativeImages({});
    setReplacementAttempts({});
    setUsedImages(new Set());
    setLoadingTimeouts({});
    setTotalAttempts(0);
    
    // Clear browser's memory cache
    if ('caches' in window) {
      caches.keys().then(cacheNames => {
        cacheNames.forEach(cacheName => {
          if (cacheName.includes('image')) {
            caches.delete(cacheName);
          }
        });
      });
    }
  };

  const handleColorChange = (color: string) => {
    console.log('🎨 Cor selecionada:', color);
    
    // Não enviar null quando a cor for preta
    if (color === 'black') {
      setSelectedColor('black');
    } else if (color === 'white') {
      setSelectedColor('white');
    } else {
      // Set to null when clearing (empty string)
      setSelectedColor(color === '' ? null : color);
    }
    
    // Removido o clearImageCache() para manter as imagens anteriores
  };

  const handleSearch = () => {
    if (!searchQuery.trim()) return;
    
    console.log('🔍 Iniciando busca:', {
      query: searchQuery,
      color: selectedColor,
      limit: 100
    });
    
    // Clear cache before new search
    clearImageCache();
    setIsLoading(true);
    setError(null);
    
    try {
      parent.postMessage({ 
        pluginMessage: { 
          type: 'search-images',
          query: searchQuery,
          color: selectedColor,
          limit: 100
        }
      }, '*');
      
      console.log('📤 Mensagem enviada para o controller');
    } catch (error) {
      console.error('❌ Erro ao enviar mensagem:', error);
      setError('Erro ao iniciar a busca');
      setIsLoading(false);
    }
  };

  const getProxiedUrl = (url: string, _attempt = 0) => {
    if (url.startsWith('data:') || url.startsWith('blob:')) return url;
    
    // Only proxy the image without any resizing or modifications
    return `https://wsrv.nl/?url=${encodeURIComponent(url)}&n=-1`;
  };

  const loadImageWithTimeout = (imageUrl: string, attempt = 0) => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      
      const timeoutId = setTimeout(() => {
        img.src = ''; // Cancel image loading
        reject(new Error('Timeout'));
      }, TIMEOUT_DURATION);

      img.onload = () => {
        clearTimeout(timeoutId);
        resolve(img);
      };

      img.onerror = () => {
        clearTimeout(timeoutId);
        reject(new Error('Failed to load'));
      };

      img.src = getProxiedUrl(imageUrl, attempt);
    });
  };

  const handleImageLoad = (imageUrl: string, event: React.SyntheticEvent<HTMLImageElement>) => {
    const img = event.target as HTMLImageElement;
    
    console.log('📸 Imagem carregada:', {
        url: imageUrl,
        colunas: {
            total: document.querySelectorAll('.masonry-grid-column').length,
            larguras: Array.from(document.querySelectorAll('.masonry-grid-column'))
                .map(col => (col as HTMLElement).clientWidth)
        },
        imagem: {
            largura: img.width,
            altura: img.height
        }
    });
    
    // Ensure the image maintains its natural aspect ratio
    img.style.height = 'auto';
    
    setValidImages(prev => {
        const newSet = new Set([...prev, imageUrl]);
        return newSet;
    });
    
    setUsedImages(prev => new Set([...prev, imageUrl]));
    clearLoadingTimeout(imageUrl);
  };

  const tryLoadImage = (imageUrl: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      
      const timeoutId = setTimeout(() => {
        img.src = '';
        reject(new Error('Timeout'));
      }, TIMEOUT_DURATION);

      img.onload = () => {
        clearTimeout(timeoutId);
        resolve();
      };

      img.onerror = () => {
        clearTimeout(timeoutId);
        reject(new Error('Failed to load'));
      };

      img.src = imageUrl;
    });
  };

  const findNextValidAlternative = (imageUrl: string): string | null => {
    const alternatives = alternativeImages[imageUrl] || [];
    
    // Helper function to get base name of image
    const getBaseName = (url: string): string => {
      try {
        const urlObj = new URL(url);
        const pathParts = urlObj.pathname.split('/');
        const fileName = pathParts[pathParts.length - 1];
        return fileName.split('.')[0].toLowerCase();
      } catch {
        return url;
      }
    };

    // Get base names of all currently used images
    const usedBaseNames = new Set(
      Array.from(usedImages).map(url => getBaseName(url))
    );

    // Find first alternative that hasn't been used and doesn't share a base name
    return alternatives.find(alt => 
      !failedImages.has(alt) && 
      !usedImages.has(alt) &&
      !usedBaseNames.has(getBaseName(alt)) &&
      alt !== imageUrl && 
      (!replacementAttempts[alt] || replacementAttempts[alt] < MAX_REPLACEMENT_ATTEMPTS)
    ) || null;
  };

  const tryReplaceImage = async (imageUrl: string) => {
    // Stop if we've hit the total attempts limit
    if (totalAttempts >= MAX_TOTAL_ATTEMPTS) {
      setImages(prev => prev.filter(url => validImages.has(url)));
      return false;
    }

    const nextAlternative = findNextValidAlternative(imageUrl);
    
    if (nextAlternative) {
      setTotalAttempts(prev => prev + 1);
      
      setReplacementAttempts(prev => ({
        ...prev,
        [nextAlternative]: (prev[nextAlternative] || 0) + 1
      }));

      try {
        // Try with first proxy service
        await tryLoadImage(`https://wsrv.nl/?url=${encodeURIComponent(nextAlternative)}`);
        handleImageReplacement(imageUrl, nextAlternative);
        return true;
      } catch (error) {
        if (totalAttempts >= MAX_TOTAL_ATTEMPTS) return false;
        
        try {
          // Try second proxy service
          await tryLoadImage(`https://images.weserv.nl/?url=${encodeURIComponent(nextAlternative)}`);
          handleImageReplacement(imageUrl, nextAlternative);
          return true;
        } catch (error) {
          // Only try last proxy if we haven't hit the limit
          if (totalAttempts < MAX_TOTAL_ATTEMPTS) {
            try {
              await tryLoadImage(`https://api.allorigins.win/raw?url=${encodeURIComponent(nextAlternative)}`);
              handleImageReplacement(imageUrl, nextAlternative);
              return true;
            } catch (error) {
              setFailedImages(prev => new Set([...prev, nextAlternative]));
              return tryReplaceImage(imageUrl);
            }
          }
          return false;
        }
      }
    }
    return false;
  };

  const handleImageReplacement = (originalUrl: string, newUrl: string) => {
    console.log('✅ Successfully replaced image:', originalUrl, 'with:', newUrl);
    setImages(prev => prev.map(url => url === originalUrl ? newUrl : url));
    setValidImages(prev => new Set([...prev, newUrl]));
    setUsedImages(prev => new Set([...prev, newUrl]));
  };

  const handleImageError = async (imageUrl: string) => {
    // Ignore if already failed or being replaced
    if (failedImages.has(imageUrl) || totalAttempts >= MAX_TOTAL_ATTEMPTS) {
      clearLoadingTimeout(imageUrl);
      return;
    }
    
    // Try loading with different proxies first
    if (!proxyAttempted.has(imageUrl)) {
      setProxyAttempted(prev => new Set([...prev, imageUrl]));
      startLoadingTimeout(imageUrl);
      
      try {
        await loadImageWithTimeout(imageUrl, 1);
        handleImageLoad(imageUrl, null);
        return;
      } catch (error) {
        // Only try second proxy if we haven't hit the limit
        if (totalAttempts < MAX_TOTAL_ATTEMPTS) {
          try {
            await loadImageWithTimeout(imageUrl, 2);
            handleImageLoad(imageUrl, null);
            return;
          } catch (finalError) {
            // Mark as failed and remove from loading state
            setFailedImages(prev => new Set([...prev, imageUrl]));
            clearLoadingTimeout(imageUrl);
            setImages(prev => prev.filter(url => url !== imageUrl));
          }
        }
      }
    }
    
    // If all attempts fail, cleanup
    setValidImages(prev => {
      const newSet = new Set(prev);
      newSet.delete(imageUrl);
      return newSet;
    });
    setImages(prev => prev.filter(url => url !== imageUrl));
    clearLoadingTimeout(imageUrl);
  };

  // Cleanup loading images that are stuck
  useEffect(() => {
    const checkStuckImages = () => {
      if (totalAttempts >= MAX_TOTAL_ATTEMPTS) {
        // Limpar todas as imagens em loading
        const stuckImages = Object.keys(loadingTimeouts);
        stuckImages.forEach(imageUrl => {
          setImages(prev => prev.filter(url => url !== imageUrl));
          clearLoadingTimeout(imageUrl);
        });
        return;
      }

      const now = Date.now();
      const stuckImages = Object.entries(loadingTimeouts)
        .filter(([_, startTime]) => now - startTime > LOADING_TIMEOUT)
        .map(([url]) => url);

      if (stuckImages.length > 0) {
        stuckImages.forEach(imageUrl => {
          setImages(prev => prev.filter(url => url !== imageUrl));
          clearLoadingTimeout(imageUrl);
          setFailedImages(prev => new Set([...prev, imageUrl]));
        });
      }
    };

    const interval = setInterval(checkStuckImages, 5000);
    return () => clearInterval(interval);
  }, [loadingTimeouts, totalAttempts]);

  // When component mounts or images change, start loading timeouts
  useEffect(() => {
    // Limitar o número de imagens em loading simultaneamente
    const MAX_CONCURRENT_LOADING = 5;
    let loadingCount = 0;

    images.forEach(imageUrl => {
      if (loadingCount >= MAX_CONCURRENT_LOADING) return;
      
      if (!validImages.has(imageUrl) && !failedImages.has(imageUrl) && !loadingTimeouts[imageUrl]) {
        startLoadingTimeout(imageUrl);
        loadingCount++;
      }
    });
  }, [images]);

  // Reset states when new search starts
  useEffect(() => {
    if (isLoading) {
      setValidImages(new Set());
      setProxyAttempted(new Set());
      setFailedImages(new Set());
      setAlternativeImages({});
      setReplacementAttempts({});
      setUsedImages(new Set());
      setLoadingTimeouts({});
      setTotalAttempts(0);
    }
  }, [isLoading]);

  // Cleanup cache periodically (every 5 minutes)
  useEffect(() => {
    const cacheCleanupInterval = setInterval(() => {
      if (!isLoading) {
        clearImageCache();
      }
    }, 5 * 60 * 1000); // 5 minutes

    return () => clearInterval(cacheCleanupInterval);
  }, [isLoading]);

  // Clear cache when component unmounts
  useEffect(() => {
    return () => {
      clearImageCache();
    };
  }, []);

  const startLoadingTimeout = (imageUrl: string) => {
    setLoadingTimeouts(prev => ({
      ...prev,
      [imageUrl]: Date.now()
    }));
  };

  const clearLoadingTimeout = (imageUrl: string) => {
    setLoadingTimeouts(prev => {
      const newTimeouts = { ...prev };
      delete newTimeouts[imageUrl];
      return newTimeouts;
    });
  };

  // Keep only this simple column change effect
  useEffect(() => {
    console.log('📊 Colunas atualizadas:', {
      colunas: gridColumns,
      imagens: images.length
    });
  }, [gridColumns, images.length]);

  return (
    <div className="images-container">
      {/* Search Bar */}
      <div className="image-search">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          placeholder="Search for images..."
        />
        
        {/* Column Control */}
        <button
          onClick={() => setShowColumnPicker(!showColumnPicker)}
          className="column-control-button"
          style={{ right: '84px' }}
          title={`${gridColumns} colunas`}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            {gridColumns === 1 ? (
              <rect x="4" y="2" width="8" height="12" rx="1" fill="currentColor"/>
            ) : gridColumns === 2 ? (
              <>
                <rect x="2" y="2" width="5" height="12" rx="1" fill="currentColor"/>
                <rect x="9" y="2" width="5" height="12" rx="1" fill="currentColor"/>
              </>
            ) : gridColumns === 3 ? (
              <>
                <rect x="2" y="2" width="3" height="12" rx="1" fill="currentColor"/>
                <rect x="6.5" y="2" width="3" height="12" rx="1" fill="currentColor"/>
                <rect x="11" y="2" width="3" height="12" rx="1" fill="currentColor"/>
              </>
            ) : (
              <>
                <rect x="2" y="2" width="2" height="12" rx="1" fill="currentColor"/>
                <rect x="6" y="2" width="2" height="12" rx="1" fill="currentColor"/>
                <rect x="10" y="2" width="2" height="12" rx="1" fill="currentColor"/>
                <rect x="14" y="2" width="2" height="12" rx="1" fill="currentColor"/>
              </>
            )}
          </svg>
        </button>

        {showColumnPicker && (
          <div className="column-picker-modal">
            <div className="column-picker-overlay" onClick={() => setShowColumnPicker(false)} />
            <div className="column-picker-content">
              <div className="column-options">
                {columnOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => {
                      setGridColumns(option.value);
                      setShowColumnPicker(false);
                    }}
                    className={`column-option ${gridColumns === option.value ? 'active' : ''}`}
                    title={option.label}
                  >
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                      {option.value === 1 ? (
                        <rect x="4" y="2" width="8" height="12" rx="1" fill="currentColor"/>
                      ) : option.value === 2 ? (
                        <>
                          <rect x="2" y="2" width="5" height="12" rx="1" fill="currentColor"/>
                          <rect x="9" y="2" width="5" height="12" rx="1" fill="currentColor"/>
                        </>
                      ) : option.value === 3 ? (
                        <>
                          <rect x="2" y="2" width="3" height="12" rx="1" fill="currentColor"/>
                          <rect x="6.5" y="2" width="3" height="12" rx="1" fill="currentColor"/>
                          <rect x="11" y="2" width="3" height="12" rx="1" fill="currentColor"/>
                        </>
                      ) : (
                        <>
                          <rect x="2" y="2" width="2" height="12" rx="1" fill="currentColor"/>
                          <rect x="6" y="2" width="2" height="12" rx="1" fill="currentColor"/>
                          <rect x="10" y="2" width="2" height="12" rx="1" fill="currentColor"/>
                          <rect x="14" y="2" width="2" height="12" rx="1" fill="currentColor"/>
                        </>
                      )}
                    </svg>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Color Filter */}
        <button
          onClick={() => setShowColorPicker(!showColorPicker)}
          className="color-filter-button"
          style={{
            right: '44px',
            backgroundColor: selectedColor ? colorOptions.find(opt => opt.value === selectedColor)?.color : 'transparent',
            border: selectedColor ? 'none' : '1px solid var(--border-color)'
          }}
          title={selectedColor ? "Change color filter" : "Add color filter"}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M8 3.5C5.5 3.5 3.5 5.5 3.5 8C3.5 10.5 5.5 12.5 8 12.5C10.5 12.5 12.5 10.5 12.5 8C12.5 5.5 10.5 3.5 8 3.5Z" stroke="currentColor" strokeWidth="1.5"/>
          </svg>
        </button>

        {/* Search Button */}
        <button onClick={handleSearch} className="search-button">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M8.5 3.5C11.5376 3.5 14 5.96243 14 9C14 12.0376 11.5376 14.5 8.5 14.5C5.46243 14.5 3 12.0376 3 9C3 5.96243 5.46243 3.5 8.5 3.5ZM8.5 2C4.63401 2 1.5 5.13401 1.5 9C1.5 12.866 4.63401 16 8.5 16C10.4022 16 12.1316 15.2839 13.4615 14.1031L17.1464 17.7879C17.3417 17.9832 17.6583 17.9832 17.8536 17.7879C18.0488 17.5927 18.0488 17.2761 17.8536 17.0808L14.1687 13.396C15.2839 12.0932 16 10.3638 16 8.5C16 4.63401 12.866 1.5 9 1.5H8.5Z" fill="currentColor"/>
          </svg>
        </button>
      </div>

      {/* Color Picker Modal */}
      {showColorPicker && (
        <div className="color-picker-modal">
          <div className="color-picker-overlay" onClick={() => setShowColorPicker(false)} />
          <div className="color-picker-content">
            <h3>Select Color</h3>
            <div className="color-options">
              {colorOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => {
                    handleColorChange(option.value);
                    setShowColorPicker(false);
                  }}
                  className="color-option"
                  style={{ backgroundColor: option.color }}
                  title={option.label}
                >
                  {selectedColor === option.value && (
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M13.3332 4L5.99984 11.3333L2.6665 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  )}
                </button>
              ))}
            </div>
            <div className="color-picker-actions">
              {selectedColor && (
                <button
                  onClick={() => {
                    handleColorChange('');
                    setShowColorPicker(false);
                  }}
                  className="clear-color-button"
                >
                  Clear
                </button>
              )}
              <button
                onClick={() => setShowColorPicker(false)}
                className="ok-button"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="empty-state">
          <div className="loader" />
          <p className="empty-state-text">Searching for images...</p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="error-state">
          <p className="error-message">{error}</p>
        </div>
      )}

      {/* Results */}
      {!isLoading && !error && (
        images.length > 0 ? (
          <div 
            className="masonry-container"
            style={{ 
              '--grid-columns': gridColumns 
            } as React.CSSProperties}
          >
            {images
              .filter(imageUrl => !failedImages.has(imageUrl))
              .map((imageUrl, index) => (
                <div 
                  key={`${imageUrl}-${index}`}
                  className="image-item"
                >
                  {!validImages.has(imageUrl) && (
                    <div className="image-loading">
                      <div className="loader" />
                    </div>
                  )}
                  <img
                    src={getProxiedUrl(imageUrl)}
                    alt={`Search result ${index + 1}`}
                    onLoad={(e) => handleImageLoad(imageUrl, e)}
                    onError={() => handleImageError(imageUrl)}
                    style={{ 
                      opacity: validImages.has(imageUrl) ? 1 : 0
                    }}
                    crossOrigin="anonymous"
                  />
                  {validImages.has(imageUrl) && (
                    <button
                      onClick={() => onSelectImage(imageUrl)}
                      className="insert-button"
                    >
                      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M10 4V16M4 10H16" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                      </svg>
                    </button>
                  )}
                </div>
              ))}
          </div>
        ) : (
          <div className="empty-state">
            <div className="empty-state-icon">
              <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M25.3333 4H6.66667C5.19391 4 4 5.19391 4 6.66667V25.3333C4 26.8061 5.19391 28 6.66667 28H25.3333C26.8061 28 28 26.8061 28 25.3333V6.66667C28 5.19391 26.8061 4 25.3333 4Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M11.3333 13.3333C12.4379 13.3333 13.3333 12.4379 13.3333 11.3333C13.3333 10.2288 12.4379 9.33334 11.3333 9.33334C10.2288 9.33334 9.33334 10.2288 9.33334 11.3333C9.33334 12.4379 10.2288 13.3333 11.3333 13.3333Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M28 20L21.3333 13.3333L6.66666 28" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <h3 className="empty-state-title">No images yet</h3>
            <p className="empty-state-text">Search for images to get started</p>
          </div>
        )
      )}
    </div>
  );
}; 