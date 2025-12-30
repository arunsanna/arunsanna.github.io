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

// Initialize project tabs with accessibility
function initializeProjectTabs() {
    const tabBtns = document.querySelectorAll('.tab-btn[role="tab"]');
    const tabContents = document.querySelectorAll('.projects-tab-content[role="tabpanel"]');

    function switchTab(targetBtn) {
        const targetTab = targetBtn.dataset.tab;

        // Update all buttons
        tabBtns.forEach(b => {
            b.classList.remove('active');
            b.setAttribute('aria-selected', 'false');
            b.setAttribute('tabindex', '-1');
        });

        // Activate clicked button
        targetBtn.classList.add('active');
        targetBtn.setAttribute('aria-selected', 'true');
        targetBtn.setAttribute('tabindex', '0');
        targetBtn.focus();

        // Update all tab panels
        tabContents.forEach(content => {
            content.classList.remove('active');
            content.setAttribute('hidden', '');
        });

        // Show target panel
        const targetContent = document.getElementById(`${targetTab}-projects`);
        if (targetContent) {
            targetContent.classList.add('active');
            targetContent.removeAttribute('hidden');
        }
    }

    // Click handlers
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => switchTab(btn));
    });

    // Keyboard navigation (Arrow keys)
    tabBtns.forEach((btn, index) => {
        btn.addEventListener('keydown', (e) => {
            let targetIndex = index;

            if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
                e.preventDefault();
                targetIndex = (index + 1) % tabBtns.length;
            } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
                e.preventDefault();
                targetIndex = (index - 1 + tabBtns.length) % tabBtns.length;
            } else if (e.key === 'Home') {
                e.preventDefault();
                targetIndex = 0;
            } else if (e.key === 'End') {
                e.preventDefault();
                targetIndex = tabBtns.length - 1;
            }

            if (targetIndex !== index) {
                switchTab(tabBtns[targetIndex]);
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