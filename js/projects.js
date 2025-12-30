export async function initializeProjects() {
    // Professional projects
    const professionalProjects = ['dod', 'cms', 'oar', 'cloud', 'edge'];
    // Open source GitHub projects
    const opensourceProjects = ['agentdefense', 'microeks', 'awssage', 'geminidiagram', 'docqueryai', 'brewtoken', 'crossllm', 'aidevbox'];

    const professionalContainer = document.getElementById('professional-projects');
    const opensourceContainer = document.getElementById('opensource-projects');

    // Load professional projects
    if (professionalContainer) {
        for (const project of professionalProjects) {
            try {
                const response = await fetch(`components/projects/${project}.html`);
                if (response.ok) {
                    const html = await response.text();
                    professionalContainer.innerHTML += html;
                } else {
                    console.error(`Failed to load project: ${project}`);
                }
            } catch (error) {
                console.error(`Error loading project ${project}:`, error);
            }
        }
    }

    // Load open source projects
    if (opensourceContainer) {
        for (const project of opensourceProjects) {
            try {
                const response = await fetch(`components/projects/${project}.html`);
                if (response.ok) {
                    const html = await response.text();
                    opensourceContainer.innerHTML += html;
                } else {
                    console.error(`Failed to load project: ${project}`);
                }
            } catch (error) {
                console.error(`Error loading project ${project}:`, error);
            }
        }
    }

    // Initialize collapsible outcomes after projects are loaded
    setTimeout(() => {
        initializeCollapsibleOutcomes();
        setupHoverEffects();
        setupMetricsAutoScroll();
        initializeProjectTabs();
    }, 500);
}

// Initialize all collapsible outcomes
function initializeCollapsibleOutcomes() {
    // Don't auto-expand any outcomes initially
}

// Setup hover effects for project cards (desktop only)
function setupHoverEffects() {
    // All project IDs (professional + open source)
    const allProjectIds = [
        'dod', 'cms', 'oar', 'cloud', 'edge', // professional
        'agentdefense', 'microeks', 'awssage', 'geminidiagram', 'docqueryai', 'brewtoken', 'crossllm', 'aidevbox' // open source
    ];

    // Skip hover effects on touch devices
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    if (isTouchDevice || window.innerWidth <= 768) {
        // Expand all outcomes on mobile by default
        allProjectIds.forEach(projectId => {
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

    allProjectIds.forEach(projectId => {
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

// Initialize project tabs
function initializeProjectTabs() {
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.projects-tab-content');

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const targetTab = btn.dataset.tab;

            // Remove active from all buttons
            tabBtns.forEach(b => b.classList.remove('active'));
            // Add active to clicked button
            btn.classList.add('active');

            // Hide all tab contents
            tabContents.forEach(content => {
                content.classList.remove('active');
            });

            // Show the target tab content
            const targetContent = document.getElementById(`${targetTab}-projects`);
            if (targetContent) {
                targetContent.classList.add('active');
            }
        });
    });
}

// Setup metrics for mobile - manual scroll for now
function setupMetricsAutoScroll() {
    // Only on mobile/touch devices
    const isMobile = window.innerWidth <= 768;
    if (!isMobile) return;
    
    // Ensure metrics are scrollable
    const metricsGrids = document.querySelectorAll('.metrics-grid');
    metricsGrids.forEach(grid => {
        // Just ensure proper flex layout
        grid.style.display = 'flex';
        grid.style.flexWrap = 'nowrap';
        grid.style.overflowX = 'auto';
    });
}