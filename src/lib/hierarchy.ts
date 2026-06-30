// Canonical site content hierarchy — the single source of truth for where every
// page sits in the tree. Consumed by Breadcrumbs.astro (human-facing nav) and by
// structured-data.ts (machine-facing JSON-LD BreadcrumbList). Kept data-only and
// pure so the trail logic is unit-testable without pulling in Astro.

export interface HierarchyNode {
  /** Stable id, also used as the parent reference key. */
  id: string;
  /** Human label shown in breadcrumbs and the JSON-LD BreadcrumbList. */
  label: string;
  /** URL path, no trailing slash. The root is '/'. */
  path: string;
  /** Parent node id, or null for the root. */
  parent: string | null;
}

/** One resolved step in a breadcrumb trail (root → … → current page). */
export interface Crumb {
  label: string;
  path: string;
  /** True for the last item — the current page. */
  current: boolean;
}

/** Id of the tree root. */
export const ROOT_ID = "home";

// The static section tree. Dynamic leaves (/work/:slug, /writing/:slug) are NOT
// registered here — they are appended at resolve time from a page-supplied label,
// because their human title differs from the URL slug.
export const SECTIONS: Record<string, HierarchyNode> = {
  home: { id: "home", label: "Home", path: "/", parent: null },
  work: { id: "work", label: "Work", path: "/work", parent: "home" },
  projects: {
    id: "projects",
    label: "Projects",
    path: "/projects",
    parent: "home",
  },
  research: {
    id: "research",
    label: "Research",
    path: "/research",
    parent: "home",
  },
  writing: {
    id: "writing",
    label: "Writing",
    path: "/writing",
    parent: "home",
  },
  speaking: {
    id: "speaking",
    label: "Speaking & Service",
    path: "/speaking",
    parent: "home",
  },
  about: { id: "about", label: "About", path: "/about", parent: "home" },
};

/**
 * Normalize a pathname: drop any query/hash, strip the `.html` extension that
 * Astro's `file` build format leaks into `Astro.url.pathname` at build time
 * (and a trailing `/index`), strip trailing slashes, map '' → '/'. This keeps
 * canonical URLs, the JSON-LD graph, and breadcrumb items on the extensionless
 * paths the site is actually linked and served at.
 */
export function normalizePath(path: string): string {
  if (!path) return "/";
  const clean = path
    .split("?")[0]
    .split("#")[0]
    .replace(/\.html$/, "")
    .replace(/\/index$/, "")
    .replace(/\/+$/, "");
  return clean === "" ? "/" : clean;
}

/** Find the registered section node whose path matches exactly. */
function sectionByPath(path: string): HierarchyNode | undefined {
  return Object.values(SECTIONS).find((n) => n.path === path);
}

/** Walk a node up to the root, returning [root, …, node]. Guards against cycles. */
function ancestors(node: HierarchyNode): HierarchyNode[] {
  const chain: HierarchyNode[] = [];
  const seen = new Set<string>();
  let current: HierarchyNode | undefined = node;
  while (current && !seen.has(current.id)) {
    seen.add(current.id);
    chain.unshift(current);
    current = current.parent ? SECTIONS[current.parent] : undefined;
  }
  return chain;
}

/** Humanize a URL slug for a fallback label ("dod-platform-one" → "Dod Platform One"). */
export function humanizeSlug(slug: string): string {
  return slug
    .split(/[-_]/)
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

/**
 * Resolve the breadcrumb trail for any path.
 *
 * - Registered section path  → its full ancestor chain.
 * - Deeper dynamic path      → the parent section's chain + a leaf built from
 *   `leafLabel` (falling back to a humanized last segment).
 * - Unknown top-level path   → [root, leaf] so there is always usable context.
 *
 * The last entry always has `current: true`.
 */
export function resolveTrail(rawPath: string, leafLabel?: string): Crumb[] {
  const path = normalizePath(rawPath);

  const exact = sectionByPath(path);
  if (exact) {
    const chain = ancestors(exact);
    return chain.map((n, i) => ({
      label: n.label,
      path: n.path,
      current: i === chain.length - 1,
    }));
  }

  const segments = path.split("/").filter(Boolean);
  if (segments.length === 0) return []; // '/' is registered and handled above

  const last = segments[segments.length - 1];
  const parentPath = "/" + segments.slice(0, -1).join("/");
  const leaf: Crumb = {
    label: leafLabel?.trim() || humanizeSlug(last),
    path,
    current: true,
  };

  const parentSection = sectionByPath(parentPath);
  if (!parentSection) {
    const root = SECTIONS[ROOT_ID];
    return [{ label: root.label, path: root.path, current: false }, leaf];
  }

  const parentTrail = ancestors(parentSection).map((n) => ({
    label: n.label,
    path: n.path,
    current: false,
  }));
  return [...parentTrail, leaf];
}
