// Central site content constants. One canonical tagline, one source of truth for
// brand/contact data so we never drift across <title>, hero, and about again.
export const SITE = {
  name: "Arun Sanna",
  // The canonical positioning line — used in <title>, hero, and structured data.
  tagline: "Enterprise AI Architect & Forward Deployed Engineer",
  valueProp:
    "I build secure AI platforms for the DoD, federal, and frontier teams — from agent security to platform engineering at scale.",
  description:
    "Enterprise AI Architect & Forward Deployed Engineer building secure AI platforms for the DoD, federal, and frontier teams — DoD Platform One, CMS modernization, and open-source AI security tooling.",
  url: "https://arunsanna.com",
  email: "arun.sanna@outlook.com",
  resume: "/resume.pdf",
  social: {
    github: "https://github.com/arunsanna",
    githubHandle: "arunsanna",
    linkedin: "https://linkedin.com/in/arunsanna",
    linkedinHandle: "in/arunsanna",
  },
  // Quantified proof shown in the hero (kept short and verifiable from the content).
  stats: [
    { value: "10+", label: "Years" },
    { value: "400+", label: "Apps on Platform One" },
    { value: "124K", label: "Lives supported" },
  ],
  // Organizations delivered for — the hero proof bar.
  shippedAt: [
    "Platform One",
    "CMS",
    "USAF",
    "VivSoft",
    "Hitachi Vantara",
    "REAN Cloud",
  ],
} as const;

export type SiteStat = (typeof SITE.stats)[number];
