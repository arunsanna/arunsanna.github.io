const TRACKS = ['professional', 'opensource', 'cooking'];
const DEFAULT_TAB = 'professional';

let allProjects = [];
let activeTab = DEFAULT_TAB;
let activeFilter = 'all';

export async function initializeProjects() {
    const projects = await loadProjectsData();
    allProjects = projects;

    if (!allProjects.length) {
        renderLoadError();
        return;
    }

    renderProjects(allProjects);
    updateTabCounts(allProjects);
    initializeProjectTabs();
    renderFilterChips();
    applyProjectFilter(activeFilter);

    setTimeout(() => {
        initializeCollapsibleOutcomes();
        setupHoverEffects();
        setupMetricsAutoScroll();
    }, 80);
}

async function loadProjectsData() {
    try {
        const response = await fetch('assets/projects.json', { cache: 'no-store' });
        if (!response.ok) {
            throw new Error(`Failed to fetch projects.json (${response.status})`);
        }

        const payload = await response.json();
        if (!payload || !Array.isArray(payload.projects)) {
            throw new Error('Invalid projects.json format');
        }

        return payload.projects
            .filter((project) => TRACKS.includes(project.track))
            .map(normalizeProject);
    } catch (error) {
        console.error('Error loading project data:', error);
        return [];
    }
}

function normalizeProject(project) {
    const id = project.id || slugify(project.title || 'project');
    const tags = Array.isArray(project.tags) ? project.tags.map(normalizeTag).filter(Boolean) : [];

    return {
        id,
        track: project.track,
        featured: Boolean(project.featured),
        status: project.status || 'Active',
        title: project.title || 'Untitled Project',
        category: project.category || 'Project',
        icon: sanitizeIcon(project.icon),
        github: project.github || '',
        description: project.description || '',
        metrics: normalizeMetrics(project.metrics),
        highlights: normalizeList(project.highlights),
        tech: normalizeList(project.tech),
        tags
    };
}

function normalizeMetrics(metrics) {
    if (!Array.isArray(metrics) || !metrics.length) {
        return [
            { value: 'Active', label: 'Status' },
            { value: 'Open', label: 'Source' },
            { value: 'Build', label: 'Stage' },
            { value: '2026', label: 'Cycle' }
        ];
    }

    return metrics
        .filter((item) => item && typeof item === 'object')
        .map((item) => ({
            value: String(item.value || '').trim() || '-',
            label: String(item.label || '').trim() || 'Metric'
        }))
        .slice(0, 8);
}

function normalizeList(items) {
    if (!Array.isArray(items)) return [];
    return items
        .map((item) => String(item || '').trim())
        .filter(Boolean)
        .slice(0, 12);
}

function renderProjects(projects) {
    TRACKS.forEach((track) => {
        const container = document.getElementById(`${track}-projects`);
        if (!container) return;

        const trackProjects = projects
            .filter((project) => project.track === track)
            .sort(sortProjects);

        container.innerHTML = trackProjects
            .map((project, index) => createProjectCard(project, index))
            .join('');
    });
}

function sortProjects(a, b) {
    if (a.featured !== b.featured) {
        return a.featured ? -1 : 1;
    }
    return a.title.localeCompare(b.title);
}

function createProjectCard(project, index) {
    const outcomesId = `${project.id}-outcomes`;
    const iconId = `${outcomesId}-icon`;
    const tagList = project.tags.join(',');
    const delay = ['0', '0.2', '0.4', '0.6', '0.8', '1.0'][index % 6];

    const metricsHtml = project.metrics
        .map((metric) => `
            <div class="metric-box bg-muted-20 rounded-lg p-4 text-center">
                <p class="text-2xl font-bold hero-text">${escapeHtml(metric.value)}</p>
                <p class="text-xs text-muted-foreground">${escapeHtml(metric.label)}</p>
            </div>
        `)
        .join('');

    const highlightsHtml = (project.highlights.length ? project.highlights : ['Details coming soon.'])
        .map((item) => `
            <li class="flex items-start gap-3">
                <span class="bullet-point bg-primary"></span>
                <span class="text-sm text-muted-foreground">${escapeHtml(item)}</span>
            </li>
        `)
        .join('');

    const techHtml = (project.tech.length ? project.tech : ['In Progress'])
        .map((item) => `<span class="badge-outline text-xs">${escapeHtml(item)}</span>`)
        .join('');

    const githubHtml = project.github
        ? `
            <a href="${escapeAttribute(project.github)}" target="_blank" rel="noopener noreferrer" class="github-link">
                <i class="fab fa-github"></i>
                <span>View on GitHub</span>
            </a>
          `
        : '';

    return `
        <article class="project-card card-gradient" data-project-id="${escapeAttribute(project.id)}" data-tags="${escapeAttribute(tagList)}" data-animation-delay="${delay}">
            <div class="card-content space-y-6">
                <div class="project-header">
                    <div class="flex items-center gap-4">
                        <div class="icon-container p-3 rounded-lg bg-primary-10 border-primary-20">
                            <i class="${escapeAttribute(project.icon)} text-primary h-6 w-6"></i>
                        </div>
                        <div>
                            <h3 class="text-xl">${escapeHtml(project.title)}</h3>
                            <div class="project-meta-row">
                                <span class="badge-category text-xs">${escapeHtml(project.category)}</span>
                                <span class="project-status-pill text-xs">${escapeHtml(project.status)}</span>
                                ${project.featured ? '<span class="project-featured-pill text-xs">Featured</span>' : ''}
                            </div>
                        </div>
                    </div>
                    ${githubHtml}
                </div>

                <p class="text-muted-foreground">${escapeHtml(project.description)}</p>

                <div class="metrics-grid grid grid-cols-2 md:grid-cols-4 gap-4">
                    ${metricsHtml}
                </div>

                <div class="outcomes-box">
                    <h4 class="font-medium mb-3 flex items-center gap-2 cursor-pointer" onclick="toggleOutcomes('${escapeAttribute(outcomesId)}')">
                        <span>Key Highlights</span>
                        <i class="fas fa-chevron-down text-primary text-sm transition-transform duration-300" id="${escapeAttribute(iconId)}"></i>
                    </h4>
                    <ul class="space-y-2 overflow-hidden transition-all duration-300" id="${escapeAttribute(outcomesId)}" style="max-height: 0; opacity: 0;">
                        ${highlightsHtml}
                    </ul>
                </div>

                <div class="tech-stack">
                    ${techHtml}
                </div>
            </div>
        </article>
    `;
}

function updateTabCounts(projects) {
    const counts = {
        professional: 0,
        opensource: 0,
        cooking: 0
    };

    projects.forEach((project) => {
        counts[project.track] += 1;
    });

    Object.entries(counts).forEach(([track, count]) => {
        const countEl = document.getElementById(`count-${track}`);
        if (countEl) {
            countEl.textContent = String(count);
        }
    });
}

function initializeProjectTabs() {
    const tabBtns = document.querySelectorAll('.tab-btn[role="tab"]');
    const tabContents = document.querySelectorAll('.projects-tab-content[role="tabpanel"]');

    function switchTab(targetBtn, focus = true) {
        const targetTab = targetBtn.dataset.tab;
        if (!targetTab || !TRACKS.includes(targetTab)) return;

        activeTab = targetTab;
        activeFilter = 'all';

        tabBtns.forEach((button) => {
            button.classList.remove('active');
            button.setAttribute('aria-selected', 'false');
            button.setAttribute('tabindex', '-1');
        });

        targetBtn.classList.add('active');
        targetBtn.setAttribute('aria-selected', 'true');
        targetBtn.setAttribute('tabindex', '0');

        if (focus) {
            targetBtn.focus();
        }

        tabContents.forEach((content) => {
            content.classList.remove('active');
            content.setAttribute('hidden', '');
        });

        const targetContent = document.getElementById(`${targetTab}-projects`);
        if (targetContent) {
            targetContent.classList.add('active');
            targetContent.removeAttribute('hidden');
        }

        renderFilterChips();
        applyProjectFilter(activeFilter);
        setupHoverEffects();
    }

    tabBtns.forEach((button) => {
        button.addEventListener('click', () => switchTab(button, true));
    });

    tabBtns.forEach((button, index) => {
        button.addEventListener('keydown', (event) => {
            let targetIndex = index;

            if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
                event.preventDefault();
                targetIndex = (index + 1) % tabBtns.length;
            } else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
                event.preventDefault();
                targetIndex = (index - 1 + tabBtns.length) % tabBtns.length;
            } else if (event.key === 'Home') {
                event.preventDefault();
                targetIndex = 0;
            } else if (event.key === 'End') {
                event.preventDefault();
                targetIndex = tabBtns.length - 1;
            }

            if (targetIndex !== index) {
                switchTab(tabBtns[targetIndex], true);
            }
        });
    });
}

function renderFilterChips() {
    const filtersContainer = document.getElementById('projects-filters');
    if (!filtersContainer) return;

    const trackProjects = allProjects.filter((project) => project.track === activeTab);
    const tagCounts = new Map();

    trackProjects.forEach((project) => {
        project.tags.forEach((tag) => {
            tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1);
        });
    });

    const topTags = Array.from(tagCounts.entries())
        .sort((a, b) => {
            if (b[1] !== a[1]) return b[1] - a[1];
            return a[0].localeCompare(b[0]);
        })
        .slice(0, 10)
        .map(([tag]) => tag);

    const chips = ['all', ...topTags];

    filtersContainer.innerHTML = chips
        .map((tag) => {
            const isAll = tag === 'all';
            const label = isAll ? 'All' : prettyTag(tag);
            const isActive = activeFilter === tag;

            return `
                <button
                    class="filter-chip${isActive ? ' active' : ''}"
                    type="button"
                    data-filter="${escapeAttribute(tag)}"
                    aria-pressed="${isActive ? 'true' : 'false'}"
                >
                    ${escapeHtml(label)}
                </button>
            `;
        })
        .join('');

    filtersContainer.querySelectorAll('.filter-chip').forEach((chip) => {
        chip.addEventListener('click', () => {
            activeFilter = chip.dataset.filter || 'all';
            renderFilterChips();
            applyProjectFilter(activeFilter);
            setupHoverEffects();
        });
    });
}

function applyProjectFilter(filter) {
    const container = document.getElementById(`${activeTab}-projects`);
    if (!container) return;

    const cards = container.querySelectorAll('.project-card');
    let visibleCount = 0;

    cards.forEach((card) => {
        const tags = (card.dataset.tags || '')
            .split(',')
            .map(normalizeTag)
            .filter(Boolean);

        const shouldShow = filter === 'all' || tags.includes(filter);

        if (shouldShow) {
            visibleCount += 1;
            card.classList.remove('is-hidden');
            card.removeAttribute('aria-hidden');
        } else {
            card.classList.add('is-hidden');
            card.setAttribute('aria-hidden', 'true');
        }
    });

    renderEmptyState(container, visibleCount === 0);
}

function renderEmptyState(container, shouldShow) {
    let emptyState = container.querySelector('.projects-empty-state');

    if (!emptyState) {
        emptyState = document.createElement('div');
        emptyState.className = 'projects-empty-state';
        emptyState.textContent = 'No projects match this filter yet.';
        container.appendChild(emptyState);
    }

    emptyState.style.display = shouldShow ? 'block' : 'none';
}

function renderLoadError() {
    TRACKS.forEach((track) => {
        const container = document.getElementById(`${track}-projects`);
        if (!container) return;
        container.innerHTML = '<div class="projects-empty-state" style="display:block;">Unable to load projects right now.</div>';
    });
}

function initializeCollapsibleOutcomes() {
    // Collapsed by default on desktop. Mobile behavior handled in setupHoverEffects.
}

function setupHoverEffects() {
    const cards = document.querySelectorAll('.projects-tab-content.active .project-card:not(.is-hidden)');
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

    cards.forEach((card) => {
        const outcomesList = card.querySelector('.outcomes-box ul[id$="-outcomes"]');
        if (!outcomesList) return;

        const icon = document.getElementById(`${outcomesList.id}-icon`);

        if (isTouchDevice || window.innerWidth <= 768) {
            outcomesList.style.maxHeight = '2000px';
            outcomesList.style.opacity = '1';
            outcomesList.style.visibility = 'visible';

            if (icon) {
                icon.style.transform = 'rotate(180deg)';
            }
            return;
        }

        outcomesList.style.maxHeight = '0';
        outcomesList.style.opacity = '0';

        card.onmouseenter = () => {
            if (typeof window.expandOutcomes === 'function') {
                window.expandOutcomes(outcomesList.id);
            }
        };

        card.onmouseleave = () => {
            if (typeof window.collapseOutcomes === 'function') {
                window.collapseOutcomes(outcomesList.id);
            }
        };
    });
}

function setupMetricsAutoScroll() {
    const isMobile = window.innerWidth <= 768;
    if (!isMobile) return;

    const metricsGrids = document.querySelectorAll('.metrics-grid');
    metricsGrids.forEach((grid) => {
        grid.style.display = 'flex';
        grid.style.flexWrap = 'nowrap';
        grid.style.overflowX = 'auto';
    });
}

function sanitizeIcon(icon) {
    if (typeof icon !== 'string') return 'fas fa-code';
    const trimmed = icon.trim();
    return /^[a-z0-9\-\s]+$/i.test(trimmed) ? trimmed : 'fas fa-code';
}

function slugify(input) {
    return String(input || '')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '') || 'project';
}

function normalizeTag(tag) {
    return String(tag || '')
        .trim()
        .toLowerCase()
        .replace(/\s+/g, '-');
}

function prettyTag(tag) {
    return tag
        .split('-')
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(' ');
}

function escapeHtml(value) {
    return String(value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function escapeAttribute(value) {
    return escapeHtml(value).replace(/`/g, '&#96;');
}
