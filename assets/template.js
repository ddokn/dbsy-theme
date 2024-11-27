const cache = new Map();

document.addEventListener("DOMContentLoaded", async () => {
    const loadingEl = document.createElement('div');
    loadingEl.className = 'loading-indicator';
    document.body.prepend(loadingEl);
    
    try {
        const sections = document.querySelectorAll('[data-section]');
        const snippets = document.querySelectorAll('[data-snippet]');
        
        await Promise.all([
            loadComponents(sections, 'section'),
            loadComponents(snippets, 'snippet')
        ]);
        
        loadingEl.remove();
    } catch (error) {
        console.error('컴포넌트 로딩 실패:', error);
        loadingEl.remove();
    }
});

async function loadComponents(elements, type) {
    const basePath = type === 'section' ? '/sections' : '/snippets';
    
    return Promise.all(
        Array.from(elements).map(async element => {
            const name = element.getAttribute(`data-${type}`);
            const path = `${basePath}/${name}.html`;
            
            try {
                if (type === 'section') {
                    await insertSection(path, element);
                } else {
                    await insertSnippet(path, element);
                }
            } catch (error) {
                element.innerHTML = `<div class="error">${name} 로딩 실패</div>`;
            }
        })
    );
}

async function insertSection(path, element) {
    const html = await loadHTML(path);
    element.innerHTML = html;
    
    const snippetsInSection = element.querySelectorAll('[data-snippet]');
    if (snippetsInSection.length > 0) {
        await loadComponents(snippetsInSection, 'snippet');
    }
}

async function insertSnippet(path, element) {
    const html = await loadHTML(path);
    element.innerHTML = html;
}

async function loadHTML(path) {
    if (cache.has(path)) {
        return cache.get(path);
    }
    
    const response = await fetch(path);
    const html = await response.text();
    cache.set(path, html);
    return html;
}
