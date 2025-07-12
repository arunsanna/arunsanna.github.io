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
        
        // Initialize collapsible outcomes after projects are loaded
        setTimeout(() => {
            initializeCollapsibleOutcomes();
            setupHoverEffects();
            setupMetricsAutoScroll();
        }, 500);
    }
}

// Initialize all collapsible outcomes
function initializeCollapsibleOutcomes() {
    // Don't auto-expand any outcomes initially
}

// Setup hover effects for project cards (desktop only)
function setupHoverEffects() {
    // Skip hover effects on touch devices
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    if (isTouchDevice || window.innerWidth <= 768) {
        // Expand all outcomes on mobile by default
        const projectIds = ['dod', 'cms', 'oar', 'ai-ml', 'cloud', 'edge'];
        projectIds.forEach(projectId => {
            const outcomesList = document.querySelector(`#${projectId}-outcomes`);
            if (outcomesList) {
                // Expand outcomes on mobile
                outcomesList.style.maxHeight = '2000px';
                outcomesList.style.opacity = '1';
                outcomesList.style.visibility = 'visible';
                
                // Update icon to show expanded state
                const icon = document.querySelector(`#${projectId}-outcomes-icon`);
                if (icon) {
                    icon.style.transform = 'rotate(180deg)';
                }
            }
        });
        return;
    }
    
    const projectIds = ['dod', 'cms', 'oar', 'ai-ml', 'cloud', 'edge'];
    
    projectIds.forEach(projectId => {
        const outcomesList = document.querySelector(`#${projectId}-outcomes`);
        const projectCard = outcomesList?.closest('.project-card');
        
        if (projectCard && outcomesList) {
            projectCard.addEventListener('mouseenter', () => {
                window.expandOutcomes(`${projectId}-outcomes`);
            });
            
            projectCard.addEventListener('mouseleave', () => {
                window.collapseOutcomes(`${projectId}-outcomes`);
            });
            
            // Make sure initial state is correct
            outcomesList.style.maxHeight = '0';
            outcomesList.style.opacity = '0';
        }
    });
}

// Setup auto-scrolling for metrics on mobile
function setupMetricsAutoScroll() {
    // Only on mobile/touch devices
    const isMobile = window.innerWidth <= 768;
    if (!isMobile) return;
    
    // Find all project cards with many metrics (6+)
    const projectCards = document.querySelectorAll('.project-card');
    
    projectCards.forEach(card => {
        const metricBoxes = card.querySelectorAll('.metric-box');
        
        // Only apply to projects with 6+ metrics
        if (metricBoxes.length >= 6) {
            const metricsGrid = card.querySelector('.metrics-grid');
            const grid = card.querySelector('.grid');
            
            if (metricsGrid && grid) {
                // Clone metrics for seamless loop
                const clonedMetrics = Array.from(metricBoxes).map(box => box.cloneNode(true));
                clonedMetrics.forEach(clone => grid.appendChild(clone));
                
                // Pause animation on touch
                metricsGrid.addEventListener('touchstart', () => {
                    grid.style.animationPlayState = 'paused';
                });
                
                metricsGrid.addEventListener('touchend', () => {
                    setTimeout(() => {
                        grid.style.animationPlayState = 'running';
                    }, 3000); // Resume after 3 seconds
                });
            }
        }
    });
}