document.addEventListener("DOMContentLoaded", async () => {
    // 먼저 모든 섹션을 로드
    const sections = document.querySelectorAll('[data-section]');
    for (const section of sections) {
        const sectionName = section.getAttribute('data-section');
        const path = `/sections/${sectionName}.html`;
        await insertSection(path, section);
    }

    // 섹션 로드 후 스니펫 로드
    const snippets = document.querySelectorAll('[data-snippet]');
    console.log('Found snippets:', snippets.length);
    snippets.forEach(snippet => {
        const snippetName = snippet.getAttribute('data-snippet');
        const snippetPath = `/snippets/${snippetName}.html`;
        console.log('Loading snippet:', snippetPath);
        insertSnippet(snippetPath, snippet);
    });
});

async function loadHTML(filePath) {
    try {
        const response = await fetch(filePath);
        if (!response.ok) throw new Error(`Failed to load ${filePath}`);
        return await response.text();
    } catch (error) {
        console.error("Error loading HTML:", error);
        return `<div>Error loading ${filePath}</div>`;
    }
}

async function insertSection(sectionPath, element) {
    const html = await loadHTML(sectionPath);
    element.innerHTML = html;
}

async function insertSnippet(snippetPath, element) {
    try {
        const html = await loadHTML(snippetPath);
        console.log('Loaded snippet content:', html); // 로드된 내용 확인
        element.innerHTML = html;
    } catch (error) {
        console.error('Error in insertSnippet:', error);
    }
}
