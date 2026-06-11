// Editorial content + navigation for the multi-page site. Separated from
// site.ts (brand/contact constants) so the "what's on the pages" data has one
// home. Project case studies + OSS come from assets/projects.json.

export interface NavLink {
  href: string;
  label: string;
}

// Primary multi-page navigation. Real routes, not hash anchors.
export const NAV: NavLink[] = [
  { href: "/work", label: "Work" },
  { href: "/projects", label: "Projects" },
  { href: "/writing", label: "Writing" },
  { href: "/speaking", label: "Speaking" },
  { href: "/about", label: "About" },
];

// Animated proof marquee — orgs delivered for, then the stack. Quiet motion,
// real signal.
export const MARQUEE: string[] = [
  "DoD Platform One",
  "CMS",
  "USAF",
  "VivSoft",
  "Hitachi Vantara",
  "REAN Cloud",
  "Kubernetes",
  "Istio",
  "AWS",
  "Terraform",
  "NIST 800-53",
  "FedRAMP High",
  "cATO",
  "MCP",
  "RAG",
  "Zero Trust",
];

// IDs of professional case studies featured on the home "Selected work" grid,
// in display order. Pulled from projects.json by id.
export const FEATURED_WORK: string[] = [
  "dod-platform-one",
  "cms-healthcare-modernization",
  "enterprise-ai-transformation",
  "operation-allies-refuge",
];

// IDs of OSS repos featured on the home "Open source" grid. `stars` is a
// placeholder until the live GitHub endpoint lands (Phase C) — shown as "~".
export interface FeaturedRepo {
  id: string;
  stars: number;
  language: string;
}

export const FEATURED_REPOS: FeaturedRepo[] = [
  { id: "agentdefense-bench", stars: 128, language: "Python" },
  { id: "jarvis-cortex", stars: 96, language: "Python" },
  { id: "microeks", stars: 74, language: "HCL" },
  { id: "gemini-diagram-mcp", stars: 61, language: "TypeScript" },
  { id: "openclaw", stars: 53, language: "Python" },
  { id: "k8s-sherlock", stars: 47, language: "Shell" },
];

export interface Post {
  slug: string;
  title: string;
  summary: string;
  date: string;
  readingTime: string;
  tags: string[];
}

// Launch set for the blog (Phase 2 content). Real theses, drafts pending —
// these render the Writing surface so the design is reviewable now.
export const POSTS: Post[] = [
  {
    slug: "defending-mcp-agents-prompt-injection",
    title: "Defending MCP agents from prompt injection",
    summary:
      "A threat model for tool-using agents over the Model Context Protocol, and the layered defenses that actually hold up under adversarial testing.",
    date: "2026-05-20",
    readingTime: "12 min",
    tags: ["AI Security", "Agents"],
  },
  {
    slug: "building-an-aibom",
    title: "Building an AIBOM: supply-chain transparency for AI systems",
    summary:
      "Why an AI bill-of-materials matters, what belongs in one, and how the OWASP-aligned generator produces machine-readable artifacts teams can act on.",
    date: "2026-04-28",
    readingTime: "8 min",
    tags: ["AI Security", "Supply Chain"],
  },
  {
    slug: "cato-on-platform-one",
    title: "cATO on Platform One: compressing ATO from years to weeks",
    summary:
      "How continuous Authority to Operate reframes compliance as an engineering problem — and the platform patterns that made a 4-week ATO cycle real.",
    date: "2026-03-30",
    readingTime: "10 min",
    tags: ["Federal", "Platform"],
  },
  {
    slug: "graph-enhanced-memory-for-agents",
    title: "A graph-enhanced memory system for AI assistants",
    summary:
      "Entities, relationships, and time: designing assistant memory that survives long-running operations, handles contradictions, and recalls with intent.",
    date: "2026-03-04",
    readingTime: "11 min",
    tags: ["AI Systems", "Memory"],
  },
];

export interface Recognition {
  label: string;
  detail: string;
  year?: string;
}

// EB-1A signal strip — awards, selective membership, judging, contributions.
export const RECOGNITION: Recognition[] = [
  {
    label: "SECAF Project of the Year",
    detail: "Small & Emerging Contractors Advisory Forum",
    year: "2024",
  },
  {
    label: "Platform One",
    detail: "Only non-US citizen selected onto the team",
    year: "",
  },
  { label: "IEEE", detail: "Professional member & volunteer leadership" },
  { label: "ACM", detail: "Certified reviewer — conference paper review" },
  { label: "OWASP", detail: "AIBOM working-group contributor" },
  { label: "Employee of the Year", detail: "REAN Cloud", year: "2017" },
];

// Speaking / publications surface (EB-1A). Seeded; expand as engagements land.
export interface Engagement {
  kind: "Talk" | "Paper" | "Service" | "Review";
  title: string;
  venue: string;
  year: string;
}

export const ENGAGEMENTS: Engagement[] = [
  {
    kind: "Service",
    title: "IEEE volunteer leadership",
    venue: "IEEE",
    year: "2025–",
  },
  {
    kind: "Review",
    title: "Conference paper review",
    venue: "ACM (Certified Reviewer)",
    year: "2025–",
  },
  {
    kind: "Service",
    title: "AIBOM working group",
    venue: "OWASP",
    year: "2025–",
  },
  {
    kind: "Service",
    title: "Global Chief Architect Forum",
    venue: "IASA",
    year: "2024–",
  },
];
