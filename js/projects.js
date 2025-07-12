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

// Setup auto-scrolling for ALL metrics on mobile
function setupMetricsAutoScroll() {
    // Only on mobile/touch devices
    const isMobile = window.innerWidth <= 768;
    if (!isMobile) return;
    
    // Find all metrics grids
    const metricsGrids = document.querySelectorAll('.metrics-grid');
    
    metricsGrids.forEach(metricsGrid => {
        const grid = metricsGrid.querySelector('.grid');
        const metricBoxes = metricsGrid.querySelectorAll('.metric-box');
        
        if (grid && metricBoxes.length > 0) {
            // Clone metrics for seamless loop
            const clonedMetrics = Array.from(metricBoxes).map(box => box.cloneNode(true));
            clonedMetrics.forEach(clone => grid.appendChild(clone));
            
            let isUserScrolling = false;
            let scrollTimeout;
            
            // Detect user scroll
            metricsGrid.addEventListener('scroll', () => {
                if (!isUserScrolling) {
                    isUserScrolling = true;
                    metricsGrid.classList.add('user-scrolling');
                }
                
                // Clear existing timeout
                clearTimeout(scrollTimeout);
                
                // Resume animation after 5 seconds of no scrolling
                scrollTimeout = setTimeout(() => {
                    isUserScrolling = false;
                    metricsGrid.classList.remove('user-scrolling');
                    // Reset scroll position for smooth continuation
                    if (metricsGrid.scrollLeft >= metricsGrid.scrollWidth / 2) {
                        metricsGrid.scrollLeft = 0;
                    }
                }, 5000);
            });
            
            // Touch events for better control
            let touchStartX = 0;
            
            metricsGrid.addEventListener('touchstart', (e) => {
                touchStartX = e.touches[0].clientX;
                metricsGrid.classList.add('user-scrolling');
            });
            
            metricsGrid.addEventListener('touchend', () => {
                // Animation will resume after timeout set in scroll event
            });
            
            // Ensure smooth infinite scroll
            metricsGrid.addEventListener('scroll', () => {
                // If scrolled to the end, reset to beginning
                if (metricsGrid.scrollLeft >= metricsGrid.scrollWidth - metricsGrid.clientWidth) {
                    metricsGrid.scrollLeft = 1;
                } else if (metricsGrid.scrollLeft <= 0) {
                    metricsGrid.scrollLeft = metricsGrid.scrollWidth / 2 - metricsGrid.clientWidth - 1;
                }
            });
        }
    });
}