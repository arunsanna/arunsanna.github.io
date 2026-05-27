const TRACKS = ['professional', 'opensource', 'cooking'];
const DEFAULT_TAB = 'professional';

let allProjects = [];
let allGroups = new Map();
let activeTab = DEFAULT_TAB;
let activeFilter = 'all';

export async function initializeProjects() {
    const { projects, groups } = await loadProjectsData();
    allProjects = projects;

    if (groups) {
        groups.forEach((g) => allGroups.set(g.id, g));
    }

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
        const payload = await fetchProjectsPayload();
        if (!payload || !Array.isArray(payload.projects)) {
            throw new Error('Invalid projects payload format');
        }

        const projects = payload.projects
            .filter((project) => TRACKS.includes(project.track))
            .map(normalizeProject);

        return { projects, groups: payload.groups || [] };
    } catch (error) {
        console.error('Error loading project data:', error);
        return { projects: [], groups: [] };
    }
}

async function fetchProjectsPayload() {
    const endpoints = ['/api/projects', 'assets/projects.json'];

    for (const endpoint of endpoints) {
        try {
            const response = await fetch(endpoint, { cache: 'no-store' });
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.warn(`Unable to load ${endpoint}:`, error);
        }
    }

    throw new Error('No project data endpoint available');
}

function normalizeProject(project) {
    const id = project.id || slugify(project.title || 'project');
    const tags = Array.isArray(project.tags) ? project.tags.map(normalizeTag).filter(Boolean) : [];

    return {
        id,
        track: project.track,
        group: project.group || '',
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

        container.innerHTML = buildHierarchicalHtml(trackProjects);
    });
}

function buildHierarchicalHtml(projects) {
    const grouped = new Map();
    const standalone = [];

    projects.forEach((project) => {
        if (project.group) {
            if (!grouped.has(project.group)) {
                grouped.set(project.group, []);
            }
            grouped.get(project.group).push(project);
        } else {
            standalone.push(project);
        }
    });

    const parts = [];
    let cardIndex = 0;

    standalone.forEach((project) => {
        parts.push(createProjectCard(project, cardIndex++));
    });

    grouped.forEach((groupProjects, groupId) => {
        const meta = allGroups.get(groupId);
        const contradictions = detectContradictions(groupProjects);
        parts.push(createGroupHeader(groupId, meta, groupProjects, contradictions));
        groupProjects.forEach((project) => {
            parts.push(createProjectCard(project, cardIndex++, { level: 1, groupId }));
        });
    });

    return parts.join('');
}

function createGroupHeader(groupId, meta, projects, contradictions) {
    const label = meta ? meta.label : prettyTag(groupId);
    const icon = meta ? meta.icon : 'fas fa-layer-group';
    const desc = meta ? meta.description : '';
    const count = projects.length;
    const tags = collectGroupTags(projects);

    const tagChips = tags.slice(0, 6).map((t) =>
        `<span class="group-tag-chip">${escapeHtml(t)}</span>`
    ).join('');

    const contradictionHtml = contradictions.length
        ? contradictions.map((c) =>
            `<div class="contradiction-item">
                <i class="fas fa-code-branch"></i>
                <span>${escapeHtml(c.label)}</span>
                <span class="contradiction-overlap">${escapeHtml(c.items.join(', '))}</span>
            </div>`
        ).join('')
        : '';

    return `
        <div class="project-group-header" data-group="${escapeAttribute(groupId)}">
            <div class="group-header-top">
                <div class="group-icon-wrap">
                    <i class="${escapeAttribute(icon)}"></i>
                </div>
                <div class="group-header-text">
                    <h3 class="group-title">${escapeHtml(label)}</h3>
                    ${desc ? `<p class="group-desc">${escapeHtml(desc)}</p>` : ''}
                </div>
                <span class="group-count">${count} project${count !== 1 ? 's' : ''}</span>
            </div>
            <div class="group-header-tags">${tagChips}</div>
            ${contradictionHtml ? `<div class="contradiction-banner"><div class="contradiction-label"><i class="fas fa-shuffle"></i> Overlapping scope</div>${contradictionHtml}</div>` : ''}
        </div>
    `;
}

function collectGroupTags(projects) {
    const tagSet = new Set();
    projects.forEach((p) => p.tags.forEach((t) => tagSet.add(t)));
    return Array.from(tagSet).sort();
}

function detectContradictions(projects) {
    if (projects.length < 2) return [];

    const contradictions = [];

    const allTags = projects.flatMap((p) => p.tags);
    const allTech = projects.flatMap((p) => p.tech);
    const tagOverlap = findOverlaps(allTags);
    const techOverlap = findOverlaps(allTech);

    if (tagOverlap.length) {
        contradictions.push({
            label: 'Shared tags',
            items: tagOverlap
        });
    }

    if (techOverlap.length) {
        contradictions.push({
            label: 'Shared tech',
            items: techOverlap
        });
    }

    const statuses = projects.map((p) => p.status);
    const uniqueStatuses = new Set(statuses);
    if (uniqueStatuses.size > 1 && statuses.length > 1) {
        contradictions.push({
            label: 'Mixed statuses',
            items: Array.from(uniqueStatuses)
        });
    }

    return contradictions;
}

function findOverlaps(items) {
    const counts = new Map();
    items.forEach((item) => {
        counts.set(item, (counts.get(item) || 0) + 1);
    });
    return Array.from(counts.entries())
        .filter(([, count]) => count > 1)
        .map(([item]) => item);
}

function buildContextInjection(project) {
    if (!project.group || !allGroups.has(project.group)) return '';

    const siblings = allProjects.filter(
        (p) => p.group === project.group && p.id !== project.id
    );
    if (!siblings.length) return '';

    const sharedTech = project.tech.filter((t) =>
        siblings.some((s) => s.tech.includes(t))
    );
    const sharedTags = project.tags.filter((t) =>
        siblings.some((s) => s.tags.includes(t))
    );

    const siblingLinks = siblings.slice(0, 4).map((s) =>
        `<span class="context-sibling">${escapeHtml(s.title)}</span>`
    ).join('');

    const overlapItems = [];
    if (sharedTech.length) {
        overlapItems.push(`<span class="context-overlap-label">Shared tech:</span> ${sharedTech.slice(0, 4).map((t) => `<span class="context-overlap-tag">${escapeHtml(t)}</span>`).join('')}`);
    }
    if (sharedTags.length) {
        overlapItems.push(`<span class="context-overlap-label">Shared scope:</span> ${sharedTags.slice(0, 4).map((t) => `<span class="context-overlap-tag">${escapeHtml(prettyTag(t))}</span>`).join('')}`);
    }

    const overlapHtml = overlapItems.length
        ? `<div class="context-overlap">${overlapItems.join('<span class="context-divider">|</span>')}</div>`
        : '';

    return `
        <div class="context-injection">
            <div class="context-row">
                <i class="fas fa-diagram-project context-icon"></i>
                <span class="context-label">Related:</span>
                ${siblingLinks}
            </div>
            ${overlapHtml}
        </div>
    `;
}

function sortProjects(a, b) {
    const aHasGroup = Boolean(a.group);
    const bHasGroup = Boolean(b.group);
    if (aHasGroup !== bHasGroup) return aHasGroup ? -1 : 1;
    if (a.group && b.group && a.group !== b.group) return a.group.localeCompare(b.group);
    if (a.featured !== b.featured) return a.featured ? -1 : 1;
    return a.title.localeCompare(b.title);
}

function createProjectCard(project, index, hierarchy = {}) {
    const outcomesId = `${project.id}-outcomes`;
    const iconId = `${outcomesId}-icon`;
    const tagList = project.tags.join(',');
    const delay = ['0', '0.2', '0.4', '0.6', '0.8', '1.0'][index % 6];
    const { level = 0, groupId = '' } = hierarchy;
    const indentClass = level > 0 ? ` project-card--level-${level}` : '';
    const groupAttr = groupId ? ` data-group="${escapeAttribute(groupId)}"` : '';

    const contextHtml = buildContextInjection(project);

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
        <article class="project-card card-gradient${indentClass}" data-project-id="${escapeAttribute(project.id)}" data-tags="${escapeAttribute(tagList)}" data-animation-delay="${delay}"${groupAttr}>
            <div class="card-content space-y-6">
                <div class="project-header">
                    <div class="flex items-center gap-4">
                        ${level > 0 ? '<span class="hierarchy-indicator" aria-hidden="true"><i class="fas fa-turn-up"></i></span>' : ''}
                        <div class="icon-container p-3 rounded-lg bg-primary-10 border-primary-20">
                            <i class="${escapeAttribute(project.icon)} text-primary h-6 w-6"></i>
                        </div>
                        <div>
                            <h3 class="text-xl">${escapeHtml(project.title)}</h3>
                            <div class="project-meta-row">
                                <span class="badge-category text-xs">${escapeHtml(project.category)}</span>
                                <span class="project-status-pill text-xs">${escapeHtml(project.status)}</span>
                                ${project.featured ? '<span class="project-featured-pill text-xs">Featured</span>' : ''}
                                ${project.group && allGroups.has(project.group) ? `<span class="badge-group text-xs">${escapeHtml(allGroups.get(project.group).label)}</span>` : ''}
                            </div>
                        </div>
                    </div>
                    ${githubHtml}
                </div>

                <p class="text-muted-foreground">${escapeHtml(project.description)}</p>

                ${contextHtml}

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
    const groupHeaders = container.querySelectorAll('.project-group-header');
    let visibleCount = 0;

    const visibleGroups = new Set();

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
            if (card.dataset.group) {
                visibleGroups.add(card.dataset.group);
            }
        } else {
            card.classList.add('is-hidden');
            card.setAttribute('aria-hidden', 'true');
        }
    });

    groupHeaders.forEach((header) => {
        const gid = header.dataset.group;
        if (gid && visibleGroups.has(gid)) {
            header.classList.remove('is-hidden');
        } else {
            header.classList.add('is-hidden');
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
