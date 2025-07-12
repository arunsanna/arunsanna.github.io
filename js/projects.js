export async function initializeProjects() {
    const projects = ['dod', 'cms', 'oar', 'ai-ml', 'cloud', 'edge'];
    const projectsContainer = document.querySelector('.projects-container');

    if (projectsContainer) {
        for (const project of projects) {
            try {
                const response = await fetch(`components/projects/${project}.html`);
                if (response.ok) {
                    const html = await response.text();
                    projectsContainer.innerHTML += html;
                } else {
                    console.error(`Failed to load project: ${project}`);
                }
            } catch (error) {
                console.error(`Error loading project ${project}:`, error);
            }
        }
    }
}