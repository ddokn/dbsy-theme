const cache = new Map();

document.addEventListener("DOMContentLoaded", async () => {
    try {
        const sections = document.querySelectorAll('[data-section]');
        const snippets = document.querySelectorAll('[data-snippet]');
        
        // [...sections, ...snippets].forEach(element => {
        //     element.innerHTML = '<div class="loading">로딩 중...</div>';
        // });

        await Promise.all([
            loadComponents(sections, 'section'),
            loadComponents(snippets, 'snippet')
        ]);
    } catch (error) {
        console.error('컴포넌트 로딩 실패:', error);
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
