// This script runs in the context of the web page
function getPageMetadata() {
    return {
        url: window.location.href,
        title: document.title,
        metaDescription: document.querySelector('meta[name="description"]')?.content || '',
        h1: document.querySelector('h1')?.textContent || '',
        mainContent: Array.from(document.querySelectorAll('main, article, [role="main"], .content, #content'))
            .map(el => el.textContent.trim())
            .join(' '),
        headings: Array.from(document.querySelectorAll('h1, h2, h3'))
            .map(h => h.textContent.trim())
            .join(' | '),
        meta: Object.fromEntries(
            Array.from(document.querySelectorAll('meta'))
                .map(meta => [meta.getAttribute('name') || meta.getAttribute('property'), meta.getAttribute('content')])
                .filter(([name, content]) => name && content)
        ),
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

// Listen for messages from the popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'getPageInfo') {
        sendResponse(getPageMetadata());
    }
    return true; // Required to use sendResponse asynchronously
}); 