// Pure builders for the per-page JSON-LD `@graph`. This is the "machine-facing"
// half of hierarchical context injection: a set of @id-linked schema.org nodes
// that tell crawlers (and LLMs) how the current page relates to the site, the
// site's owner, and — on detail pages — the primary entity the page is about.
//
// Kept free of Astro imports so the whole graph can be unit-tested with plain Node.

import type { Crumb } from "./hierarchy";

/** schema.org WebPage subtypes we use across the site. */
export type WebPageType =
  | "WebPage"
  | "CollectionPage"
  | "AboutPage"
  | "ProfilePage"
  | "ItemPage";

/** A single JSON-LD node. */
export type GraphNode = Record<string, unknown>;

/** Owner/person facts — the subject the whole site is "about". */
export interface PersonInput {
  name: string;
  jobTitle: string;
  url: string;
  email: string;
  sameAs: string[];
  knowsAbout: string[];
  alumniOf: string;
}

export interface GraphInput {
  /** Absolute site origin, e.g. https://arunsanna.com (trailing slash optional). */
  siteUrl: string;
  /** Absolute canonical URL of the current page. */
  pageUrl: string;
  /** Page <title> / og:title. */
  title: string;
  /** Page meta description. */
  description: string;
  /** Resolved breadcrumb trail (root → current). */
  trail: Crumb[];
  /** WebPage subtype. Defaults to "WebPage". */
  pageType?: WebPageType;
  /** Owner facts. */
  person: PersonInput;
  /** BCP-47 language tag. Defaults to "en". */
  inLanguage?: string;
  /** When true, the page's mainEntity is the Person (home, about). */
  personIsMainEntity?: boolean;
  /** Optional primary entity node (article / creative work) for detail pages. */
  primaryEntity?: GraphNode | null;
}

const trimSlash = (u: string): string => u.replace(/\/+$/, "");

/** Stable @id for the site-wide Person node. */
export const personId = (siteUrl: string): string =>
  `${trimSlash(siteUrl)}/#person`;
/** Stable @id for the WebSite node. */
export const websiteId = (siteUrl: string): string =>
  `${trimSlash(siteUrl)}/#website`;

/** Join a site origin and a path into an absolute URL. */
export function absoluteUrl(siteUrl: string, path: string): string {
  const base = trimSlash(siteUrl);
  if (!path || path === "/") return `${base}/`;
  return `${base}${path.startsWith("/") ? path : `/${path}`}`;
}

export function buildPerson(siteUrl: string, p: PersonInput): GraphNode {
  return {
    "@type": "Person",
    "@id": personId(siteUrl),
    name: p.name,
    jobTitle: p.jobTitle,
    url: p.url,
    email: `mailto:${p.email}`,
    sameAs: p.sameAs,
    knowsAbout: p.knowsAbout,
    alumniOf: p.alumniOf,
  };
}

export function buildWebSite(
  siteUrl: string,
  name: string,
  inLanguage: string,
): GraphNode {
  return {
    "@type": "WebSite",
    "@id": websiteId(siteUrl),
    url: `${trimSlash(siteUrl)}/`,
    name,
    publisher: { "@id": personId(siteUrl) },
    inLanguage,
  };
}

export function buildBreadcrumbList(
  pageUrl: string,
  siteUrl: string,
  trail: Crumb[],
): GraphNode {
  return {
    "@type": "BreadcrumbList",
    "@id": `${pageUrl}#breadcrumb`,
    itemListElement: trail.map((c, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: c.label,
      item: absoluteUrl(siteUrl, c.path),
    })),
  };
}

export function buildWebPage(input: GraphInput): GraphNode {
  const {
    pageUrl,
    siteUrl,
    title,
    description,
    pageType = "WebPage",
    inLanguage = "en",
    personIsMainEntity,
    primaryEntity,
    trail,
  } = input;

  const node: GraphNode = {
    "@type": pageType,
    "@id": `${pageUrl}#webpage`,
    url: pageUrl,
    name: title,
    description,
    isPartOf: { "@id": websiteId(siteUrl) },
    about: { "@id": personId(siteUrl) },
    inLanguage,
  };

  // A single-item trail (the home page) carries no meaningful hierarchy, so we
  // omit the breadcrumb reference there to match buildGraph's node list.
  if (trail.length > 1) {
    node.breadcrumb = { "@id": `${pageUrl}#breadcrumb` };
  }

  const mainEntityId =
    primaryEntity && typeof primaryEntity["@id"] === "string"
      ? (primaryEntity["@id"] as string)
      : personIsMainEntity
        ? personId(siteUrl)
        : undefined;
  if (mainEntityId) node.mainEntity = { "@id": mainEntityId };

  return node;
}

/** Compose the full per-page `@graph`. */
export function buildGraph(input: GraphInput): GraphNode {
  const { siteUrl, person, trail, primaryEntity, inLanguage = "en" } = input;

  const nodes: GraphNode[] = [
    buildWebSite(siteUrl, person.name, inLanguage),
    buildPerson(siteUrl, person),
    buildWebPage(input),
  ];

  if (trail.length > 1) {
    nodes.push(buildBreadcrumbList(input.pageUrl, siteUrl, trail));
  }
  if (primaryEntity) nodes.push(primaryEntity);

  return {
    "@context": "https://schema.org",
    "@graph": nodes,
  };
}

// --- Detail-page entity builders -------------------------------------------------

export interface ArticleInput {
  url: string;
  title: string;
  description: string;
  datePublished: string;
  keywords?: string[];
}

export function buildArticle(siteUrl: string, a: ArticleInput): GraphNode {
  return {
    "@type": "BlogPosting",
    "@id": `${a.url}#article`,
    headline: a.title,
    description: a.description,
    datePublished: a.datePublished,
    author: { "@id": personId(siteUrl) },
    publisher: { "@id": personId(siteUrl) },
    mainEntityOfPage: { "@id": `${a.url}#webpage` },
    inLanguage: "en",
    ...(a.keywords && a.keywords.length ? { keywords: a.keywords } : {}),
  };
}

export interface CreativeWorkInput {
  url: string;
  title: string;
  description: string;
  keywords?: string[];
}

export function buildCreativeWork(
  siteUrl: string,
  c: CreativeWorkInput,
): GraphNode {
  return {
    "@type": "CreativeWork",
    "@id": `${c.url}#work`,
    name: c.title,
    description: c.description,
    creator: { "@id": personId(siteUrl) },
    mainEntityOfPage: { "@id": `${c.url}#webpage` },
    inLanguage: "en",
    ...(c.keywords && c.keywords.length ? { keywords: c.keywords } : {}),
  };
}

/**
 * Serialize a JSON-LD object for safe inlining inside an HTML <script> block.
 * Escapes the three characters that could otherwise break out of the element
 * (`<`, `>`, `&`) — a hardening over a bare JSON.stringify.
 */
export function serializeJsonLd(graph: unknown): string {
  return JSON.stringify(graph)
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e")
    .replace(/&/g, "\\u0026");
}
