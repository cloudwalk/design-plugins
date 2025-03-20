interface SearchOptions {
  query: string;
  color?: string;
  limit?: number;
}

const PROXIES = [
  'https://api.allorigins.win/raw?url=',
  'https://api.allorigins.win/get?url=',
  'https://corsproxy.io/?'
];

async function fetchWithRetry(url: string, retries = 3): Promise<Response> {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url);
      if (response.ok) return response;
    } catch (error) {
      console.log(`⚠️ Tentativa ${i + 1} falhou, tentando novamente...`);
      if (i === retries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  throw new Error('Todas as tentativas falharam');
}

async function fetchWithProxies(url: string): Promise<{ text: string; isJson: boolean }> {
  for (const proxy of PROXIES) {
    try {
      console.log(`🔄 Tentando proxy: ${proxy}`);
      const proxyUrl = `${proxy}${encodeURIComponent(url)}`;
      const response = await fetchWithRetry(proxyUrl);
      
      // Se estamos usando o proxy get, precisamos extrair o conteúdo
      if (proxy.includes('/get?')) {
        const json = await response.json();
        return {
          text: json.contents,
          isJson: json.status?.http_code === 200 && 
                 json.status?.content_type?.includes('application/json')
        };
      }
      
      // Para outros proxies, pegamos o texto diretamente
      const text = await response.text();
      const contentType = response.headers?.get('content-type') || '';
      return {
        text,
        isJson: contentType.includes('application/json')
      };
    } catch (error) {
      console.log(`❌ Proxy falhou:`, error);
      continue;
    }
  }
  throw new Error('Todos os proxies falharam');
}

export async function searchImages({ query, color, limit = 100 }: SearchOptions): Promise<string[]> {
  try {
    console.log('🔍 Iniciando busca de imagens...');
    console.log('📝 Query:', query);
    console.log('🎨 Cor:', color || 'nenhuma');

    // Improve color search by adding color as a separate term
    let searchQuery = query;
    if (color) {
      // Map of basic colors to their search terms
      const colorMap: { [key: string]: string } = {
        'red': 'red vermelho',
        'blue': 'blue azul',
        'green': 'green verde',
        'yellow': 'yellow amarelo',
        'purple': 'purple roxo',
        'orange': 'orange laranja',
        'black': 'black preto',
        'white': 'white branco',
        'gray': 'gray grey cinza'
      };

      // Add the color term to the search query
      const colorTerm = colorMap[color.toLowerCase()] || color;
      searchQuery = `${colorTerm} ${query}`;
    }

    console.log('🎯 Query final:', searchQuery);

    // First step: Get the VQD token
    const initialUrl = `https://duckduckgo.com/?q=${encodeURIComponent(searchQuery)}&iax=images&ia=images`;
    console.log('🔗 URL inicial:', initialUrl);

    const initialResponse = await fetchWithProxies(initialUrl);
    const vqdMatch = initialResponse.text.match(/vqd=([\w-]+)/i) || 
                     initialResponse.text.match(/vqd='([\w-]+)'/i) || 
                     initialResponse.text.match(/vqd="([\w-]+)"/i);
    
    if (!vqdMatch) {
      console.log('⚠️ VQD não encontrado, tentando busca alternativa...');
      const alternativeUrl = `https://duckduckgo.com/i.js?q=${encodeURIComponent(searchQuery)}`;
      const alternativeResponse = await fetchWithProxies(alternativeUrl);
      
      let data;
      try {
        data = JSON.parse(alternativeResponse.text);
      } catch {
        console.log('⚠️ Falha ao parsear JSON da resposta alternativa');
        data = { results: [] };
      }
      
      return processSearchResults(data, limit);
    }

    const vqd = vqdMatch[1];
    console.log('✅ VQD encontrado:', vqd);

    // Second step: Get the images using the VQD
    const imageUrl = `https://duckduckgo.com/i.js?q=${encodeURIComponent(searchQuery)}&vqd=${vqd}`;
    console.log('🔍 Buscando imagens:', imageUrl);

    const imageResponse = await fetchWithProxies(imageUrl);
    let imageData;
    
    try {
      imageData = JSON.parse(imageResponse.text);
    } catch (error) {
      console.log('⚠️ Falha ao parsear JSON da resposta de imagens:', error);
      imageData = { results: [] };
    }

    return processSearchResults(imageData, limit);

  } catch (error) {
    console.error('❌ Erro na busca de imagens:', error);
    return [];
  }
}

function processSearchResults(responseData: any, limit: number): string[] {
  try {
    if (!responseData?.results?.length) {
      console.log('⚠️ Nenhum resultado encontrado');
      return [];
    }

    const uniqueUrls = new Set<string>();
    const images: string[] = [];

    for (const result of responseData.results) {
      if (images.length >= limit) break;

      // Only add images with valid URLs
      if (result.image?.startsWith('http') && !uniqueUrls.has(result.image)) {
        // Skip low quality or thumbnail images
        if (
          result.image.includes('thumb') || 
          result.image.includes('thumbnail') ||
          (result.width && result.height && (result.width < 400 || result.height < 400))
        ) {
          continue;
        }

        uniqueUrls.add(result.image);
        images.push(result.image);
      }
    }

    console.log('✅ Busca concluída!');
    console.log('🖼️ Total de imagens encontradas:', images.length);
    console.log('🖼️ Primeiras URLs:', images.slice(0, 3));

    return images;
  } catch (error) {
    console.error('❌ Erro ao processar resultados:', error);
    return [];
  }
} 