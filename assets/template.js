document.addEventListener("DOMContentLoaded", () => {
    // 모든 data-section 속성을 가진 요소를 찾고, 각 요소에 대해 data-section 속성 값을 이용해 섹션 파일을 로드
    const sections = document.querySelectorAll('[data-section]');
    sections.forEach(section => {
        const sectionName = section.getAttribute('data-section');
        const path = `/sections/${sectionName}.html`;
        insertSection(path, section); // 섹션 파일 삽입
    });

    // 모든 data-snippet 속성이 있는 요소를 찾아서 snippets 파일을 로드
    const snippets = document.querySelectorAll('[data-snippet]');
    snippets.forEach(snippet => {
        const snippetName = snippet.getAttribute('data-snippet');
        const snippetPath = `/snippets/${snippetName}.html`;
        insertSnippet(snippetPath, snippet);  // snippets 파일 삽입
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
    const html = await loadHTML(snippetPath);
    element.innerHTML = html;
}
