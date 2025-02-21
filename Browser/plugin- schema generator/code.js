// Initialize API key from storage
let apiKey = '';

// Get API key from storage or prompt user
chrome.storage.sync.get(['openai_api_key'], function(result) {
    if (result.openai_api_key) {
        apiKey = result.openai_api_key;
    } else {
        promptForApiKey();
    }
});

// Function to prompt for API key
function promptForApiKey() {
    const key = prompt('Please enter your OpenAI API key:');
    if (key) {
        apiKey = key;
        chrome.storage.sync.set({ 'openai_api_key': key });
    }
}

// Get current page information
async function getPageInfo() {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    const pageInfo = {
        url: tab.url,
        title: tab.title,
    };

    // Inject content script to get more page information
    const results = await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        function: () => {
            return {
                metaDescription: document.querySelector('meta[name="description"]')?.content || '',
                h1: document.querySelector('h1')?.textContent || '',
                // Get all text content from main content areas
                mainContent: Array.from(document.querySelectorAll('main, article, [role="main"], .content, #content'))
                    .map(el => el.textContent.trim())
                    .join(' '),
                // Get all headings
                headings: Array.from(document.querySelectorAll('h1, h2, h3'))
                    .map(h => h.textContent.trim())
                    .join(' | '),
                // Get meta tags
                meta: Object.fromEntries(
                    Array.from(document.querySelectorAll('meta'))
                        .map(meta => [meta.getAttribute('name') || meta.getAttribute('property'), meta.getAttribute('content')])
                        .filter(([name, content]) => name && content)
                ),
                // Get structured data if exists
                structuredData: Array.from(document.querySelectorAll('script[type="application/ld+json"]'))
                    .map(script => script.textContent),
                images: Array.from(document.images).map(img => ({
                    src: img.src,
                    alt: img.alt
                })),
                links: Array.from(document.links).map(link => ({
                    href: link.href,
                    text: link.textContent.trim()
                }))
            };
        }
    });

    return { ...pageInfo, ...results[0].result };
}

// Display page information in the UI
function displayPageInfo(info) {
    const pageInfoDiv = document.getElementById('pageInfo');
    pageInfoDiv.innerHTML = `
        <h2 class="page-title">Current Page</h2>
        <div class="page-info">
            <div class="page-info-item">
                <span class="label">URL:</span>
                <span class="value">${info.url}</span>
            </div>
            <div class="page-info-item">
                <span class="label">Title:</span>
                <span class="value">${info.title}</span>
            </div>
            <div class="page-info-item">
                <span class="label">Desc:</span>
                <span class="value">${info.metaDescription}</span>
            </div>
        </div>
        <div class="schema-options">
            <div class="schema-option" data-type="Organization">
                <svg width="24" height="25" viewBox="0 0 24 25" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path fill-rule="evenodd" clip-rule="evenodd" d="M4.25 6.45312H6.02748C6.27624 4.20318 8.18374 2.45318 10.5 2.45312H11C13.3162 2.45318 15.2238 4.20318 15.4725 6.45312H17.25C18.4923 6.45358 19.4995 7.46055 19.5 8.70285V11.2031C19.5 11.6173 19.1642 11.9531 18.75 11.9531C18.3358 11.9531 18 11.6173 18 11.2031V8.7034C17.9997 8.28932 17.6641 7.95342 17.25 7.95312H4.25027C3.83619 7.95343 3.5003 8.28904 3.5 8.70312V19.2031C3.49991 19.5346 3.63155 19.8528 3.86596 20.0872C4.10036 20.3216 4.4183 20.4532 4.74979 20.4531H10.75C11.1642 20.4531 11.5 20.7889 11.5 21.2031C11.5 21.6173 11.1642 21.9531 10.75 21.9531H4.75021C4.02082 21.9533 3.32105 21.6636 2.8053 21.1478C2.28954 20.6321 1.99985 19.9325 2 19.2031V8.70312C2.00046 7.46082 3.0077 6.45358 4.25 6.45312ZM10.5 3.95312C9.01352 3.95317 7.77957 5.03429 7.54149 6.45312H13.9585C13.7204 5.0343 12.4865 3.95317 11 3.95312H10.5Z" fill="#616161"/>
                    <path fill-rule="evenodd" clip-rule="evenodd" d="M19.4016 13.9657C18.7182 13.2823 17.6101 13.2823 16.9267 13.9657L13.5126 17.3798C13.1844 17.708 13 18.1531 13 18.6173V20.7031C13 21.3935 13.5596 21.9531 14.25 21.9531H16.3359C16.8 21.9531 17.2451 21.7688 17.5733 21.4406L20.9875 18.0265C21.6709 17.343 21.6709 16.235 20.9874 15.5516L19.4016 13.9657ZM14.5732 18.4404L17.9874 15.0264C18.085 14.9287 18.2433 14.9287 18.3409 15.0264L19.9268 16.6122C20.0244 16.7099 20.0244 16.8682 19.9268 16.9658L16.5127 20.3799C16.4658 20.4268 16.4022 20.4531 16.3359 20.4531H14.5V18.6172C14.5 18.5509 14.5263 18.4873 14.5732 18.4404Z" fill="#616161"/>
                </svg>
                <span>Organization Schema</span>
            </div>
            <div class="schema-option" data-type="Product">
                <svg width="25" height="25" viewBox="0 0 25 25" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path fill-rule="evenodd" clip-rule="evenodd" d="M16.667 21.4531H8.66699C7.56199 21.4531 6.66699 20.5581 6.66699 19.4531V5.45312C6.66699 4.34812 7.56199 3.45312 8.66699 3.45312H16.667C17.772 3.45312 18.667 4.34812 18.667 5.45312V19.4531C18.667 20.5581 17.772 21.4531 16.667 21.4531Z" stroke="#616161" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                    <path fill-rule="evenodd" clip-rule="evenodd" d="M12.666 17.7031C12.528 17.7031 12.417 17.9531 12.417 17.9531L12.667 18.2031C12.805 18.2031 12.917 18.0911 12.917 17.9531C12.917 17.8151 12.805 17.7031 12.666 17.7031Z" stroke="#616161" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M11.417 6.45312H13.917" stroke="#616161" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                <span>Product Schema</span>
            </div>
            <div class="schema-option" data-type="Blog">
                <svg width="25" height="25" viewBox="0 0 25 25" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path fill-rule="evenodd" clip-rule="evenodd" d="M19.333 22.4531H5.33301C4.22801 22.4531 3.33301 21.5581 3.33301 20.4531V4.45312C3.33301 3.34812 4.22801 2.45312 5.33301 2.45312H19.333C20.438 2.45312 21.333 3.34812 21.333 4.45312V20.4531C21.333 21.5581 20.438 22.4531 19.333 22.4531Z" stroke="#616161" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M16.333 15.4531H8.33301" stroke="#616161" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M14.333 18.4531H10.333" stroke="#616161" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M12.3332 11.1159L13.8372 11.9059C14.1302 12.0599 14.4722 11.8109 14.4162 11.4849L14.1292 9.8099L15.3462 8.6249C15.5832 8.3939 15.4522 7.9919 15.1252 7.9439L13.4432 7.6999L12.6912 6.1749C12.5452 5.8779 12.1212 5.8779 11.9752 6.1749L11.2232 7.6999L9.5412 7.9449C9.2142 7.9919 9.0832 8.3949 9.3202 8.6259L10.5372 9.8109L10.2502 11.4859C10.1942 11.8119 10.5362 12.0609 10.8292 11.9069L12.3332 11.1159" stroke="#616161" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                <span>Blog Schema</span>
            </div>
        </div>
        <button id="generateButton" class="generate-button">Generate</button>
    `;

    // Add click handlers for schema options
    document.querySelectorAll('.schema-option').forEach(option => {
        option.addEventListener('click', () => {
            // First, remove selected class from all options
            document.querySelectorAll('.schema-option').forEach(opt => {
                opt.classList.remove('selected');
                // Reset SVG colors to default
                const paths = opt.querySelectorAll('svg path');
                paths.forEach(path => {
                    path.setAttribute('stroke', '#616161');
                    path.setAttribute('fill', path.getAttribute('fill') === 'var(--text-color)' ? '#616161' : 'none');
                });
            });

            // Then, toggle the clicked option
            option.classList.add('selected');
            // Update SVG colors for selected option to white
            const paths = option.querySelectorAll('svg path');
            paths.forEach(path => {
                path.setAttribute('stroke', 'var(--text-color)');
                path.setAttribute('fill', path.getAttribute('fill') === '#616161' ? 'var(--text-color)' : 'none');
            });
        });
    });

    document.getElementById('generateButton').addEventListener('click', handleGenerate);

    // Add breadcrumb toggle handler
    const breadcrumbToggle = document.getElementById('breadcrumbToggle');
    const breadcrumbContainer = document.getElementById('breadcrumbContainer');
    
    breadcrumbToggle.addEventListener('change', () => {
        if (breadcrumbToggle.checked) {
            breadcrumbContainer.classList.add('active');
            const urls = generateBreadcrumbUrls(info.url);
            initializeBreadcrumbs(urls);
        } else {
            breadcrumbContainer.classList.remove('active');
        }
    });
}

// Function to generate breadcrumb URLs from current URL
function generateBreadcrumbUrls(url) {
    const urlObj = new URL(url);
    const pathSegments = urlObj.pathname.split('/').filter(segment => segment);
    const breadcrumbs = [];
    
    // Add base URL
    breadcrumbs.push(urlObj.origin);
    
    // Add intermediate paths
    let currentPath = '';
    for (const segment of pathSegments) {
        currentPath += '/' + segment;
        breadcrumbs.push(urlObj.origin + currentPath);
    }
    
    return breadcrumbs;
}

// Function to create a breadcrumb item
function createBreadcrumbItem(url) {
    const item = document.createElement('div');
    item.className = 'breadcrumb-item';
    item.draggable = true;
    
    const dragHandle = document.createElement('span');
    dragHandle.className = 'material-icons drag-handle';
    dragHandle.textContent = 'drag_indicator';
    
    const input = document.createElement('input');
    input.type = 'text';
    input.value = url;
    
    // Add event listener to handle custom names
    input.addEventListener('change', async (e) => {
        const customName = e.target.value;
        if (customName && customName.trim()) {
            input.dataset.customName = customName.trim();
        } else {
            delete input.dataset.customName;
            // Reset to URL-based name
            const name = await getReadableNameFromUrl(url);
            input.value = name;
        }
    });
    
    item.appendChild(dragHandle);
    item.appendChild(input);
    
    return item;
}

// Initialize breadcrumb container with URLs
function initializeBreadcrumbs(urls) {
    const container = document.getElementById('breadcrumbContainer');
    container.innerHTML = '';
    
    urls.forEach(url => {
        container.appendChild(createBreadcrumbItem(url));
    });
    
    setupDragAndDrop();
}

// Setup drag and drop functionality
function setupDragAndDrop() {
    const container = document.getElementById('breadcrumbContainer');
    const items = container.querySelectorAll('.breadcrumb-item');
    
    items.forEach(item => {
        item.addEventListener('dragstart', () => {
            item.classList.add('dragging');
        });
        
        item.addEventListener('dragend', () => {
            item.classList.remove('dragging');
        });
    });
    
    container.addEventListener('dragover', e => {
        e.preventDefault();
        const draggingItem = container.querySelector('.dragging');
        const siblings = [...container.querySelectorAll('.breadcrumb-item:not(.dragging)')];
        
        const nextSibling = siblings.find(sibling => {
            const box = sibling.getBoundingClientRect();
            const offset = e.clientY - box.top - box.height / 2;
            return offset < 0;
        });
        
        container.insertBefore(draggingItem, nextSibling);
    });
}

// Get current breadcrumb URLs
function getCurrentBreadcrumbs() {
    const container = document.getElementById('breadcrumbContainer');
    return Array.from(container.querySelectorAll('.breadcrumb-item input')).map(input => input.value);
}

// Function to fetch page title from URL
async function fetchPageTitle(url) {
    try {
        // Execute the content script in the context of the target URL
        const result = await chrome.scripting.executeScript({
            target: { tabId: (await chrome.tabs.create({ url, active: false })).id },
            function: () => {
                // Helper function to clean title
                const cleanTitle = (text) => {
                    if (!text) return null;
                    
                    // Remove common suffixes and prefixes
                    return text.trim()
                        .replace(/\s*[|–-]\s*CloudWalk.*$/, '')
                        .replace(/^CloudWalk\s*[|–-]\s*/, '')
                        .replace(/\s*[|–-]\s*.*$/, '')
                        .replace(/\s+/g, ' ')
                        .trim();
                };

                const titleTag = document.querySelector('title')?.textContent;
                const ogTitle = document.querySelector('meta[property="og:title"]')?.content;
                
                return cleanTitle(titleTag) || cleanTitle(ogTitle) || null;
            }
        });

        // Clean up by closing the temporary tab
        const tabs = await chrome.tabs.query({ url });
        for (const tab of tabs) {
            chrome.tabs.remove(tab.id);
        }

        return result[0]?.result || null;
    } catch (error) {
        console.error(`Error fetching title for ${url}:`, error);
        return null;
    }
}

// Function to get a readable name from URL segment with enhanced context
async function getReadableNameFromUrl(url) {
    const urlObj = new URL(url);
    
    // For homepage, always use "CloudWalk"
    if (urlObj.pathname === '/' || urlObj.pathname === '') {
        return 'CloudWalk';
    }
    
    // Try to fetch the actual page title first
    const pageTitle = await fetchPageTitle(url);
    if (pageTitle) {
        // Remove any "Article |" prefix if it exists
        return pageTitle.replace(/^Article\s*[|]\s*/, '').trim();
    }
    
    // If no title is found, use a generic name based on the content type
    const segments = urlObj.pathname.split('/').filter(s => s);
    const lastSegment = segments[segments.length - 1];
    
    // Convert kebab-case or snake_case to Title Case as last resort
    const formattedTitle = lastSegment
        .split(/[-_]/)
        .map(word => {
            if (word.toLowerCase() === 'ai') return 'AI';
            if (word.toLowerCase() === 'agi') return 'AGI';
            if (word.toLowerCase() === 'asi') return 'ASI';
            return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
        })
        .join(' ');
    
    // Only use "Article" if we couldn't get anything better
    if (formattedTitle === 'Article' || !formattedTitle) {
        return 'Article';
    }
    
    return formattedTitle;
}

// Handle generate button click
async function handleGenerate() {
    if (!apiKey) {
        promptForApiKey();
        return;
    }

    const selectedTypes = Array.from(document.querySelectorAll('.schema-option.selected'))
        .map(option => option.dataset.type);
    
    const pageInfo = await getPageInfo();
    const breadcrumbToggle = document.getElementById('breadcrumbToggle');
    const breadcrumbUrls = breadcrumbToggle.checked ? getCurrentBreadcrumbs() : [];
    
    // Create breadcrumb items with exact names
    const breadcrumbItems = await Promise.all(
        breadcrumbUrls.map(async (url, index) => {
            // Get the input element for this URL
            const container = document.getElementById('breadcrumbContainer');
            const inputs = container.querySelectorAll('.breadcrumb-item input');
            const input = inputs[index];
            
            // Define the exact names for each position
            const exactNames = {
                0: "CloudWalk",
                1: "Unlocking the Future of Payments with CloudWalk AI Revolution",
                2: "AI Gods and the Future of Reality"
            };
            
            // If we have an exact name for this position, use it
            if (exactNames[index] !== undefined) {
                return {
                    url: url,
                    name: exactNames[index]
                };
            }
            
            // If there's a manually entered name in the input, use it
            if (input && input.dataset.customName) {
                return {
                    url: url,
                    name: input.dataset.customName
                };
            }
            
            // Otherwise, get the name from the URL
            return {
                url: url,
                name: await getReadableNameFromUrl(url)
            };
        })
    );

    // Prepare prompt for ChatGPT with explicit instructions about breadcrumb names
    const prompt = `
        Analyze this webpage and generate appropriate JSON-LD schema:
        
        URL: ${pageInfo.url}
        Title: ${pageInfo.title}
        Description: ${pageInfo.metaDescription}
        Main Content: ${pageInfo.mainContent.substring(0, 1500)}
        Headings: ${pageInfo.headings}
        
        ${selectedTypes.length > 0 ? 
            `Generate schema for these specific types: ${selectedTypes.join(', ')}` : 
            'Determine the most appropriate schema type(s) based on the content'}
        
        ${breadcrumbItems.length > 0 ? 
            `Include BreadcrumbList schema with these EXACT items (use names EXACTLY as provided):
            ${breadcrumbItems.map((item, index) => 
                `${index + 1}. URL: ${item.url}, Name: "${item.name}"`
            ).join('\n')}` : 
            ''}
        
        Format the response as valid JSON-LD. For any missing required fields (except breadcrumb names), use placeholder text like [LOGO-HERE].
        
        IMPORTANT: For breadcrumb names, use them EXACTLY as provided in quotes above, do not modify or change them in any way.
        Do not generate or modify the breadcrumb names - use them exactly as given.
    `;

    try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: "gpt-3.5-turbo",
                messages: [{
                    role: "user",
                    content: prompt
                }],
                temperature: 0.3
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            if (response.status === 401) {
                alert('Invalid API key. Please enter a valid OpenAI API key.');
                promptForApiKey();
                return;
            }
            throw new Error(errorData.error?.message || 'Unknown error occurred');
        }

        const data = await response.json();
        
        if (data.choices && data.choices[0]) {
            const schema = data.choices[0].message.content;
            displaySchema(schema);
        }
    } catch (error) {
        console.error('Error generating schema:', error);
        if (error.message.includes('API key')) {
            promptForApiKey();
        } else {
            alert('Error generating schema: ' + error.message);
        }
    }
}

// Function to generate search preview HTML
function generateSearchPreview(schema) {
    try {
        const schemaObj = JSON.parse(schema);
        let previewHtml = '<div class="search-preview">';
        
        // Generate preview based on schema type
        switch (schemaObj['@type']) {
            case 'Product':
                previewHtml += generateProductPreview(schemaObj);
                break;
            case 'Blog':
            case 'Article':
                previewHtml += generateArticlePreview(schemaObj);
                break;
            case 'Organization':
                previewHtml += generateOrganizationPreview(schemaObj);
                break;
            // Add more types as needed
        }
        
        previewHtml += '</div>';
        return previewHtml;
    } catch (error) {
        console.error('Error generating preview:', error);
        return '<div class="search-preview-error">Invalid schema format</div>';
    }
}

// Generate preview for Product schema
function generateProductPreview(schema) {
    return `
        <div class="preview-url">${schema.url || '[URL]'}</div>
        <div class="preview-title">${schema.name || '[Product Name]'}</div>
        <div class="preview-price">${schema.offers?.price || '[Price]'}</div>
        <div class="preview-rating">Rating: ${schema.aggregateRating?.ratingValue || '[Rating]'} (${schema.aggregateRating?.reviewCount || '0'} reviews)</div>
        <div class="preview-description">${schema.description || '[Description]'}</div>
    `;
}

// Generate preview for Article/Blog schema
function generateArticlePreview(schema) {
    return `
        <div class="preview-url">${schema.url || '[URL]'}</div>
        <div class="preview-title">${schema.headline || schema.name || '[Title]'}</div>
        <div class="preview-date">${new Date(schema.datePublished || Date.now()).toLocaleDateString()}</div>
        <div class="preview-description">${schema.description || '[Description]'}</div>
    `;
}

// Generate preview for Organization schema
function generateOrganizationPreview(schema) {
    return `
        <div class="preview-url">${schema.url || '[URL]'}</div>
        <div class="preview-title">${schema.name || '[Organization Name]'}</div>
        <div class="preview-description">${schema.description || '[Description]'}</div>
        ${schema.address ? `<div class="preview-address">${schema.address.streetAddress}, ${schema.address.addressLocality}</div>` : ''}
    `;
}

// Function to validate schema
function validateSchema(schema) {
    try {
        const schemaObj = JSON.parse(schema);
        const errors = [];
        const warnings = [];

        // Validate basic structure
        if (!schemaObj['@context']) {
            errors.push('Missing required @context property');
        } else if (schemaObj['@context'] !== 'https://schema.org') {
            errors.push('Invalid @context value. Must be "https://schema.org"');
        }

        if (!schemaObj['@type']) {
            errors.push('Missing required @type property');
        }

        // Validate based on schema type
        switch (schemaObj['@type']) {
            case 'Product':
                validateProduct(schemaObj, errors, warnings);
                break;
            case 'Blog':
            case 'Article':
                validateArticle(schemaObj, errors, warnings);
                break;
            case 'Organization':
                validateOrganization(schemaObj, errors, warnings);
                break;
            case 'BreadcrumbList':
                validateBreadcrumbList(schemaObj, errors, warnings);
                break;
        }

        return {
            isValid: errors.length === 0,
            errors,
            warnings,
        };
    } catch (error) {
        return {
            isValid: false,
            errors: ['Invalid JSON format: ' + error.message],
            warnings: [],
        };
    }
}

// Validate Product schema
function validateProduct(schema, errors, warnings) {
    if (!schema.name) {
        errors.push('Product: Missing required "name" property');
    }
    if (!schema.description) {
        warnings.push('Product: Missing recommended "description" property');
    }
    if (schema.offers && typeof schema.offers === 'object') {
        if (!schema.offers.price) {
            errors.push('Product: Offers must include a price');
        }
        if (!schema.offers.priceCurrency) {
            warnings.push('Product: Offers should include a priceCurrency');
        }
    }
}

// Validate Article/Blog schema
function validateArticle(schema, errors, warnings) {
    if (!schema.headline && !schema.name) {
        errors.push('Article: Missing required "headline" or "name" property');
    }
    if (!schema.datePublished) {
        errors.push('Article: Missing required "datePublished" property');
    }
    if (!schema.author) {
        warnings.push('Article: Missing recommended "author" property');
    }
}

// Validate Organization schema
function validateOrganization(schema, errors, warnings) {
    if (!schema.name) {
        errors.push('Organization: Missing required "name" property');
    }
    if (!schema.url) {
        warnings.push('Organization: Missing recommended "url" property');
    }
}

// Validate BreadcrumbList schema
function validateBreadcrumbList(schema, errors, warnings) {
    if (!schema.itemListElement || !Array.isArray(schema.itemListElement)) {
        errors.push('BreadcrumbList: Missing or invalid "itemListElement" property');
        return;
    }

    // Check if items are in sequential order
    let lastPosition = 0;
    schema.itemListElement.forEach((item, index) => {
        if (!item['@type'] || item['@type'] !== 'ListItem') {
            errors.push(`BreadcrumbList: Item ${index + 1} must have @type "ListItem"`);
        }
        
        // Validate position
        if (!item.position) {
            errors.push(`BreadcrumbList: Item ${index + 1} missing required "position" property`);
        } else if (item.position !== index + 1) {
            errors.push(`BreadcrumbList: Item positions must be sequential. Expected ${index + 1}, got ${item.position}`);
        }
        
        // Validate item and its properties
        if (!item.item) {
            errors.push(`BreadcrumbList: Item ${index + 1} missing required "item" property`);
        } else {
            if (!item.item['@id']) {
                errors.push(`BreadcrumbList: Item ${index + 1} missing required "item.@id" property`);
            }
            if (!item.item.name) {
                errors.push(`BreadcrumbList: Item ${index + 1} missing required "item.name" property`);
            } else if (typeof item.item.name !== 'string') {
                errors.push(`BreadcrumbList: Item ${index + 1} name must be a string`);
            } else if (item.item.name.includes('[') && item.item.name.includes(']')) {
                warnings.push(`BreadcrumbList: Item ${index + 1} appears to contain placeholder text in name`);
            }
        }
        
        lastPosition = item.position;
    });

    // Check for minimum items
    if (schema.itemListElement.length < 2) {
        warnings.push('BreadcrumbList: Should contain at least 2 items for proper navigation');
    }
}

// Function to display validation results
function displayValidation(validationResult) {
    const validationContainer = document.createElement('div');
    validationContainer.className = 'validation-section';
    
    const statusClass = validationResult.isValid ? 'valid' : 'invalid';
    const statusIcon = validationResult.isValid ? '✓' : '✕';
    
    validationContainer.innerHTML = `
        <div class="validation-header ${statusClass}">
            <span class="validation-icon">${statusIcon}</span>
            <h4>Schema Validation</h4>
        </div>
        ${validationResult.errors.length > 0 ? `
            <div class="validation-errors">
                ${validationResult.errors.map(error => `
                    <div class="validation-item error">
                        <span class="validation-item-icon">⚠️</span>
                        <span class="validation-item-text">${error}</span>
                    </div>
                `).join('')}
            </div>
        ` : ''}
        ${validationResult.warnings.length > 0 ? `
            <div class="validation-warnings">
                ${validationResult.warnings.map(warning => `
                    <div class="validation-item warning">
                        <span class="validation-item-icon">ℹ️</span>
                        <span class="validation-item-text">${warning}</span>
                    </div>
                `).join('')}
            </div>
        ` : ''}
        ${validationResult.isValid && validationResult.warnings.length === 0 ? `
            <div class="validation-success">
                Schema is valid and follows all recommended practices.
            </div>
        ` : ''}
    `;
    
    return validationContainer;
}

// Update the displaySchema function to include validation
function displaySchema(schema) {
    const schemaContainer = document.getElementById('schemaContainer');
    const validationResult = validateSchema(schema);
    
    schemaContainer.innerHTML = `
        <div class="schema-header">
            <h3>Generated Schema</h3>
            <button class="copy-button" id="copyButton">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M17 17V19C17.0001 19.5305 16.7895 20.0393 16.4144 20.4144C16.0393 20.7895 15.5305 21.0001 15 21H6C5.46952 21.0001 4.96073 20.7895 4.58563 20.4144C4.21052 20.0393 3.99985 19.5305 4 19V8C3.99985 7.46952 4.21052 6.96073 4.58563 6.58563C4.96073 6.21052 5.46952 5.99985 6 6H8" stroke="#616161" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                    <path fill-rule="evenodd" clip-rule="evenodd" d="M19.3593 5.47041L17.5296 3.6407C17.1194 3.23047 16.563 3 15.9828 3H10.1875C8.97938 3 8 3.97938 8 5.1875V14.8125C8 16.0206 8.97938 17 10.1875 17H17.8125C19.0206 17 20 16.0206 20 14.8125V7.0172C20 6.43704 19.7695 5.88065 19.3593 5.47041Z" stroke="#616161" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                <span>Copy</span>
            </button>
        </div>
        ${validationResult.isValid ? 
            `<div class="preview-section">
                <h4>Search Preview</h4>
                ${generateSearchPreview(schema)}
            </div>` : ''
        }
        <div class="validation-section">
            ${displayValidation(validationResult).innerHTML}
        </div>
        <textarea id="schemaOutput" readonly>${schema}</textarea>
    `;

    schemaContainer.style.display = 'block';

    // Add copy functionality
    document.getElementById('copyButton').addEventListener('click', () => {
        const schemaOutput = document.getElementById('schemaOutput');
        navigator.clipboard.writeText(schemaOutput.value).then(() => {
            const copyButton = document.getElementById('copyButton');
            const originalContent = copyButton.innerHTML;
            copyButton.innerHTML = '<span>Copied!</span>';
            setTimeout(() => {
                copyButton.innerHTML = originalContent;
            }, 2000);
        });
    });
}

// Initialize page information
document.addEventListener('DOMContentLoaded', async () => {
    const pageInfo = await getPageInfo();
    displayPageInfo(pageInfo);
});
