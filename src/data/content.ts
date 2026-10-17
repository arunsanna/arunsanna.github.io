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
  { href: "/research", label: "Research" },
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
    "slug": "pdf-conversion-evidence-survival",
    "title": "A Successful PDF Conversion Can Still Lose the Evidence",
    "summary": "Six-document observations, their limits, and a practical design for checking what survives extraction.",
    "date": "2026-10-07",
    "readingTime": "7 min",
    "tags": [
      "AI Systems",
      "Document Extraction"
    ]
  },
  {
    "slug": "permission-laundering-original-grant",
    "title": "Permission Laundering: Verify the Grant Behind the Handoff",
    "summary": "A forwarded approval claim can reach an agent with real privileges. Authorization must follow the original actor and actual grant to the action boundary.",
    "date": "2026-10-07",
    "readingTime": "6 min",
    "tags": [
      "AI Security",
      "Agents"
    ]
  },
  {
    slug: "rogue-agents-dsewiki-vs-moltbook",
    title: "Rogue Agents Had an Agent Internet Waiting. They Chose a Dead German Wiki Anyway.",
    summary:
      "Escaped OpenAI evaluation agents turned a dormant German wiki into a covert message board — 15,000 edits over two months — while a purpose-built agent social network existed the whole time. Why the dark channel won, and what it means for agent infrastructure.",
    date: "2026-09-07",
    readingTime: "9 min",
    tags: ["AI Security", "Agents"],
  },
  {
    slug: "building-an-aibom",
    title: "What's actually inside your AI? A plain-English guide to the AIBOM",
    summary:
      "AI bills-of-materials are moving from nice-to-have to non-negotiable. What an AIBOM is, why August 2026 makes it urgent, and how to generate your first one with OWASP-aligned tooling.",
    date: "2026-06-16",
    readingTime: "5 min",
    tags: ["AI Security", "Supply Chain"],
  },
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

// --- Research (mock data for the research surface) ---

export interface ResearchArea {
  id: string;
  title: string;
  status: "active" | "ongoing" | "completed";
  summary: string;
  focus: string[];
  artifacts: {
    label: string;
    type: "paper" | "benchmark" | "tool" | "dataset" | "report";
  }[];
}

export const RESEARCH: ResearchArea[] = [
  {
    id: "agent-security",
    title: "Agent Runtime Security",
    status: "active",
    summary:
      "Adversarial evaluation of tool-using AI agents over MCP — prompt injection, jailbreaking, and supply-chain attack paths against agent runtimes.",
    focus: [
      "Prompt injection",
      "Tool-use sandboxing",
      "MCP protocol security",
      "Defense benchmarks",
    ],
    artifacts: [
      {
        label: "AgentDefense-Bench: Security benchmarks for MCP agents",
        type: "benchmark",
      },
      {
        label: "Cross-LLM backdoor detection across model families",
        type: "paper",
      },
      { label: "AgentDefense-Bench (open source)", type: "tool" },
    ],
  },
  {
    id: "ai-supply-chain",
    title: "AI Supply-Chain Transparency",
    status: "active",
    summary:
      "Machine-readable AI bill-of-materials (AIBOM) generation aligned with OWASP — making model provenance, dependencies, and risk traceable.",
    focus: [
      "AIBOM standards",
      "Model provenance",
      "OWASP alignment",
      "Supply-chain risk",
    ],
    artifacts: [
      {
        label: "Building an AIBOM: AI supply-chain transparency",
        type: "paper",
      },
      { label: "AIBOM Generator (open source)", type: "tool" },
      { label: "OWASP AIBOM working-group contribution", type: "report" },
    ],
  },
  {
    id: "memory-systems",
    title: "Graph-Enhanced Memory for AI",
    status: "ongoing",
    summary:
      "Structured knowledge graphs for long-running agent memory — entities, temporal relationships, contradiction handling, and retrieval-aware recall.",
    focus: [
      "Temporal knowledge graphs",
      "Contradiction resolution",
      "RAG + graph hybrid",
      "Agent persistence",
    ],
    artifacts: [
      {
        label: "A graph-enhanced memory system for AI assistants",
        type: "paper",
      },
      { label: "Jarvis Cortex (open source)", type: "tool" },
    ],
  },
  {
    id: "federal-platform-ai",
    title: "Federal AI Platform Engineering",
    status: "ongoing",
    summary:
      "Patterns for running AI workloads in regulated environments — continuous ATO for AI, FedRAMP-aligned model deployment, and zero-trust agent infrastructure.",
    focus: [
      "cATO for AI",
      "FedRAMP + ML pipelines",
      "Zero-trust agents",
      "Compliance automation",
    ],
    artifacts: [
      { label: "cATO on Platform One: years to weeks", type: "paper" },
      { label: "Aegis: Federal AI proposal stack", type: "tool" },
    ],
  },
];

// --- Awards (elevated from sidebar bullets to structured data) ---

export interface Award {
  title: string;
  org: string;
  year: string;
  significance: string;
  icon: string;
}

export const AWARDS: Award[] = [
  {
    title: "Project of the Year",
    org: "SECAF",
    year: "2024",
    significance:
      "Won for DoD Platform One PartyBus — recognized as the top small-business defense project nationally.",
    icon: "fas fa-trophy",
  },
  {
    title: "Platform One Selection",
    org: "USAF / DoD",
    year: "2021",
    significance:
      "The only non-US citizen selected into the merit-based Platform One engineering team.",
    icon: "fas fa-flag-usa",
  },
  {
    title: "Operation Allies Refuge",
    org: "Federal Mission",
    year: "2021",
    significance:
      "Led platform operations supporting 124,334 evacuations — the largest evacuation in U.S. history — with zero incidents.",
    icon: "fas fa-plane-departure",
  },
  {
    title: "Employee of the Year",
    org: "REAN Cloud",
    year: "2017",
    significance:
      "Recognized for performance and innovation after delivering 30–40% cost savings for enterprise clients.",
    icon: "fas fa-star",
  },
  {
    title: "Organizational Growth",
    org: "VivSoft Technologies",
    year: "2024",
    significance:
      "Drove company growth from 35 to 115 employees through technical leadership and federal contract wins ($15.6M).",
    icon: "fas fa-users",
  },
  {
    title: "Chief Architect Forum",
    org: "IASA Global",
    year: "2024–",
    significance:
      "Selected member of the global Chief Architect Forum — a community of distinguished enterprise architects.",
    icon: "fas fa-globe",
  },
];
