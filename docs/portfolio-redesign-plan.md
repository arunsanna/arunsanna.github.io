# arunsanna.com — Portfolio Redesign Plan & Backlog

> Status: **DRAFT for review** · Prepared 2026-06-03 · Owner: Arun
> Purpose: full analysis of the current site, a UI grade, a target-state wireframe set, an
> architecture decision, a content + EB-1A strategy, measurable success criteria, and a **phased
> roadmap** to grow from a single-page portfolio into a full portfolio + blog + code hub on Forge/k3s.
> Review and refine, then promote agreed items into AI Memory project `website`.

**Reading order for review:** §0 TL;DR → §6 architecture decision (needs your call) → §10 phased
roadmap (the plan) → §11 open questions. §1–5 are the supporting analysis; §7–9 are strategy.

---

## 0. TL;DR

- **Current grade: C+ / B-.** Strong, quantified content trapped in a slow, un-shareable, single-page
  shell with generic "AI-cyber" design tells. Bones are good; the shell is the problem.
- **Three things hurt right now:** (1) 100% client-side render → Google + LinkedIn/Twitter previews see
  a blank page (no meta/OG/favicon); (2) ~6,800 lines of CSS over 40 files via nested `@import` + 8
  sequential fetches → slow first paint; (3) no IA room for blog/code/writing — the stated goal.
- **Reframe the goal:** the site doesn't need to be "dynamic." It needs to be **statically generated**
  (fixes SEO + perf + blog) with a **thin 2–3 endpoint API** kept on the existing Forge/Fastify service
  for the genuinely dynamic bits (contact form, live GitHub stats). ~95% of the site is static.
- **The plan is phased** (§10): **Phase 0** decide+scaffold → **Phase 1 = Relaunch MVP** (live on Forge,
  SEO/a11y fixed, real HTML) → **Phase 2** content backbone (blog + IA) → **Phase 3** depth & polish →
  **Phase 4** growth & ops. Phase 1 is the cut line that removes today's pain.
- **One decision unblocks everything (§6):** static-gen (Astro) + thin API **[recommended]**, vs full
  Astro-SSR, vs incremental vanilla.

---

## 1. Current State

### 1.1 Architecture

| Aspect        | Current                                                                                                                                             |
| ------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| Stack         | Vanilla HTML + CSS + ES-module JS. No framework, no build step.                                                                                     |
| Rendering     | `index.html` ships an **empty `<main>`**; `js/main.js` `fetch()`es 8 fragments (`components/*.html`) and `innerHTML +=` them on `DOMContentLoaded`. |
| Styling       | `styles/main.css` → nested `@import` chain → **~6,773 lines across ~40 files**. Render-blocking.                                                    |
| JS            | ~1,094 lines across 9 ES modules.                                                                                                                   |
| Data          | `assets/projects.json` (30 projects, 6 groups, 3 tracks) — clean content/render separation.                                                         |
| Backend (new) | `server.mjs` — Fastify, serves static + `/healthz`, `/api/status`, `/api/projects`. Good CSP/security headers.                                      |
| Hosting       | Migrating GitHub Pages → Forge k3s (`deploy/forge/arunsanna-site/`). DNS still on Pages; **not cut over**.                                          |

### 1.2 Content inventory (single page, hash-anchored)

Hero · About · Projects (3 tabs: Professional / Open Source / Cooking) · Skills · Experience
(timeline + education + awards) · Certifications (10, hardcoded) · Contact (mailto only) · Footer.

### 1.3 Design language

Dark glassmorphic, cyan accent (`hsl(188 95% 55%)`), JetBrains Mono for code/logo, system font for body.
"Cyber" motifs: particle field, grid, glow, heavy `backdrop-filter` blur.

### 1.4 What's genuinely good (keep)

- **Projects module** (`js/projects.js`): role=tablist, full keyboard nav, `aria-selected`,
  XSS-escaped templating, `/api/projects` → JSON fallback, empty states, filter chips. Best code here.
- **Professional narrative**: specific and quantified (400+ apps, 20K+ containers, $44M/$15.6M
  contracts, SECAF Project of the Year, "only non-US citizen selected into Platform One").
- **Content/data separation** for projects (JSON-driven). **Security headers** in `server.mjs`.
- Coherent (if generic) dark visual system.

---

## 2. UI / UX Grade

| Dimension                |   Grade   | Notes                                                                                                               |
| ------------------------ | :-------: | ------------------------------------------------------------------------------------------------------------------- |
| Content quality          |  **A-**   | Strongest asset. Specific, credible, quantified. Underused in the layout.                                           |
| Visual design            |  **B-**   | Coherent, but generic AI tells: particles/glow/gradients, two header systems, Inter loaded-but-unused.              |
| Information architecture |   **C**   | Everything on one scroll. No room for blog/code/writing growth. No deep pages.                                      |
| Accessibility            |  **C+**   | Tablist is excellent; but duplicate heading text, hover-only "Key Highlights", no skip link, unverified contrast.   |
| Performance              |  **C-**   | 40-file nested `@import`, 8 sequential fetches, particle/blur GPU cost (crashed a headless browser).                |
| SEO / shareability       |   **D**   | No meta description, no OG/Twitter cards, no favicon (404), no sitemap. Client-render = blank to crawlers.          |
| Code maintainability     |  **C+**   | Clean projects module + data; but ~6.8k CSS lines, dead test code shipped, certs hardcoded while projects are JSON. |
| Mobile / responsive      |   **?**   | Not visually verified this pass (WEBS-001). Needs a real device/viewport sweep.                                     |
| **Overall**              | **C+/B-** | Strong content, weak shell. Fix rendering/SEO, expand IA, sharpen visuals.                                          |

### 2.1 Blockers (cheap, fix first)

1. **No SEO/social metadata** — add description, canonical, OG + Twitter cards, favicon, `og:image`.
2. **Client-only render = invisible to crawlers** — statically generate real HTML per route.
3. **Duplicate heading text (a11y)** — `aria-hidden` on the decorative `data-text` layer.
4. **favicon.ico 404** — add favicon + app icons.
5. **Positioning inconsistency** — title="Full Stack Developer & Cloud Architect", hero="Enterprise AI
   Architect / Forward Deployed Engineer", about="Enterprise Architect". Pick **one**.
6. **Footer © 2024** — auto-generate the year.

### 2.2 Secondary

Hover-only "Key Highlights" · dead test code (`window.testExpand`) in `index.html` · two section-header
systems · certs hardcoded vs JSON projects · Inter loaded but unused · mailto-only contact · render-blocking `@import`.

### 2.3 Keep / don't break

Projects tablist + keyboard nav · JSON data model · security headers · quantified copy · the cyan accent
as a recognizable brand token (sharpen, don't discard).

---

## 3. Target State

A fast, shareable, content-forward home for Arun as **Enterprise AI Architect / Forward Deployed
Engineer** that serves four jobs:

1. **Convince frontier-AI hiring managers** he's a builder _and_ architect (work + code + writing).
2. **Act as EB-1A evidence surface** (awards, talks, publications, judging, contributions — see §8).
3. **Establish thought leadership** via a real blog (AI security, agents, platform eng, federal AI).
4. **Be a credible artifact** — a platform/security engineer's site must itself be fast, accessible, polished.

**Design north star:** sharp, fast, technical-editorial. Less particle-field, more "serious engineer who
ships" (reference feel: Linear / Vercel / antfu.me — not glassmorphic-AI-template). Keep cyan as one
disciplined accent; lead with typography, whitespace, and real content over effects.

---

## 4. Information Architecture (proposed)

```
/                 Home          hero · selected work · latest writing · featured OSS · recognition
/work             Work          full professional case studies (the "Delivered" track)
/work/:slug       Case study    deep dive: problem → approach → impact, metrics, stack
/projects         Open Source   the OSS + cooking tracks, live GitHub data, filters
/projects/:slug   Project       README-style detail, stars/activity, links
/blog             Writing       index, tags, RSS
/blog/:slug       Article       markdown post, TOC, code blocks, share/OG image
/about            About         full bio · experience timeline · education · certs · awards
/speaking         Talks/Pubs    conference talks, papers, IEEE/ACM service, reviewing (EB-1A)
/uses             Uses          tools/hardware/stack (optional)
/now              Now           current focus (optional)
/resume           Resume        link/embed the PDF
```

Primary nav: `Work · Writing · Projects · About` + a `Resume` button. Everything else in footer.

---

## 5. Wireframes (low-fi)

### 5.1 Home

```
┌──────────────────────────────────────────────────────────────┐
│ AS_           Work   Writing   Projects   About      [Resume] │ sticky, real <a> nav
├──────────────────────────────────────────────────────────────┤
│  Enterprise AI Architect & Forward Deployed Engineer          │ ONE positioning line
│  I build secure AI platforms for the DoD, federal, and        │ 1–2 line value prop
│  frontier teams. 10+ yrs · 400+ apps · 120K lives supported.  │
│  [ View Work ]   Read Writing →        gh · in · email        │ 1 primary CTA + links
│  shipped at:  Platform One · CMS · USAF · VivSoft · Hitachi   │ proof bar
├──────────────────────────────────────────────────────────────┤
│  SELECTED WORK                                      See all → │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐               │ 3 featured case studies
│  │ DoD P1     │  │ CMS Modern │  │ Allies     │               │
│  │ 400+ apps →│  │ 40% cost  →│  │ 120K lives→│               │
│  └────────────┘  └────────────┘  └────────────┘               │
├──────────────────────────────────────────────────────────────┤
│  WRITING                                           See all → │
│  ▸ Defending MCP agents from prompt injection         2026   │ 3 latest posts
│  ▸ Building an AIBOM: AI supply-chain transparency    2026   │
│  ▸ From years to weeks: cATO on Platform One          2026   │
├──────────────────────────────────────────────────────────────┤
│  OPEN SOURCE                                        See all → │
│  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐   ★ live stars/lang      │ 4 featured repos
│  │Agent │ │Micro │ │Gemini│ │ DocQ │                          │
│  └──────┘ └──────┘ └──────┘ └──────┘                          │
├──────────────────────────────────────────────────────────────┤
│  RECOGNITION   SECAF Project of the Year · Only non-US        │ EB-1A signal strip
│  citizen in Platform One · IEEE · ACM reviewer · OWASP AIBOM  │
├──────────────────────────────────────────────────────────────┤
│  Footer:  nav · social · RSS · © {year} · built with …        │
└──────────────────────────────────────────────────────────────┘
```

### 5.2 Blog index `/blog`

```
┌──────────────────────────────────────────────────────────────┐
│ Writing — notes on AI security, agents, platform eng, fed AI  │
│ [All] [AI Security] [Agents] [Platform] [Federal]     ⟂ RSS   │ tag filter + RSS
├──────────────────────────────────────────────────────────────┤
│ 2026-05  Defending MCP agents from prompt injection           │
│          12 min · AI Security, Agents                      →  │ scannable rows
│ 2026-04  Building an AIBOM   · 8 min · Security             → │
│ 2026-03  cATO on Platform One: years → weeks                  │
└──────────────────────────────────────────────────────────────┘
```

### 5.3 Article `/blog/:slug`

```
┌───────────────────────────────┬──────────────┐
│ Defending MCP agents …        │  On this page│ TOC (sticky)
│ 2026-05-20 · 12 min · A.Sanna │  • Threat    │
│ #ai-security #agents          │  • Defenses  │
├───────────────────────────────┤  • Results   │
│  Prose, H2/H3, code blocks,   │  • Refs      │
│  callouts, images …           │              │
│  [ ← Writing ]  share         │              │
└───────────────────────────────┴──────────────┘
real <title> + meta desc + OG image per post
```

### 5.4 Project / case-study detail

```
┌──────────────────────────────────────────────────────────────┐
│ ◀ icon  AgentDefense-Bench        ★ 124 · Python · Active     │ live GitHub header
│ Security benchmark for MCP-based AI agents.    [GitHub ↗]     │
├──────────────────────────────────────────────────────────────┤
│  ┌ MCP ┐ ┌ Security ┐ ┌ Benchmark ┐ ┌ 2026 ┐                 │ metric row
│  Problem → Approach → Results (prose)                         │
│  Key highlights (visible, not hover-gated)                    │
│  Related in AI Security Suite: Cross-LLM… · AIBOM…            │ sibling links
└──────────────────────────────────────────────────────────────┘
```

### 5.5 About `/about` (EB-1A-dense)

```
Bio (sharp, 1st person) → Experience timeline → Education → Certifications (data-driven)
→ Awards & recognition → Memberships (IEEE/ACM/IASA) → Press/mentions → [Download Resume]
```

---

## 6. Architecture decision (DECIDE FIRST — gates Phase 0)

**Reframed question:** not "how do we make it dynamic" but **"what's the least machinery that gives us
SEO + speed + a blog pipeline, while preserving the Forge work?"** Audit of what actually needs a server:

| Surface                            | Needs a server at request time?                                             |
| ---------------------------------- | --------------------------------------------------------------------------- |
| Blog, work, about, speaking, home  | No — static HTML built ahead of time                                        |
| Projects list                      | No — `assets/projects.json` is committed; render at build                   |
| Live GitHub stars/activity         | Optional — can be fetched at build (daily rebuild) **or** a cached endpoint |
| Contact form submit                | Yes — one POST endpoint (or a third-party form service)                     |
| Future admin/content refresh, auth | Yes — but not real yet                                                      |

→ **~95% static.** That points away from full SSR.

### Options

- **Option A — Static generation (Astro) + thin Fastify API · RECOMMENDED.**
  Astro builds static HTML/CSS/JS at CI time into `dist/`. Forge serves `dist/` (via the existing
  Fastify static layer or nginx). Keep `server.mjs` for **only** `/healthz`, `/api/status`, and a future
  `/api/contact` + cached `/api/github`. The projects tablist becomes an Astro **island** (the one piece
  of interactive JS). _Pros:_ best SEO + perf, blog via content collections, markdown/MDX native, reuses
  existing CSS incrementally, lowest runtime complexity, **keeps the Forge investment.** _Cons:_ one-time
  migration + a build step.
- **Option B — Astro SSR (Node adapter).** Astro renders per request on a Node server on Forge, replacing
  the static-serving role of `server.mjs`. _Only worth it_ if you need per-request personalization/auth
  (the "admin content refresh" idea). More runtime surface for ~zero portfolio benefit today. **Defer.**
- **Option C — Incremental vanilla.** Keep the stack; hand-add HTML templating + a markdown build script
  in Fastify. _Pros:_ no framework. _Cons:_ you re-build RSS, content collections, OG images, TOC, syntax
  highlighting by hand. Highest long-run cost for the blog goal.

### What changes under Option A (migration reality, so this is concrete)

- **`server.mjs`:** drops to a thin API. Static-serving role moves to serving Astro's `dist/`. Keep the
  security-headers `onRequest` hook (or push headers to the istio gateway). `/api/projects` becomes
  optional (projects render statically); keep it if you want a runtime data source later.
- **Dockerfile:** add `npm run build` (Astro) → serve `dist/` + thin API. Multi-stage to keep the image small.
- **Forge manifests** (`deployment`, `service`, `pdb`, `virtualservice`): essentially unchanged — same
  container, same ports; only the container's build/run command changes.
- **Existing CSS:** ported into Astro layouts/components incrementally; no big-bang rewrite required.

**Recommendation: Option A.** Pick **Astro** over 11ty for content collections + islands (the tablist) +
first-class TypeScript, which matches your "small components, low ceremony" preference.

---

## 7. Content strategy (the blog is the goal, so it gets its own section)

- **Engine:** Astro content collections. Posts live as markdown/MDX in `src/content/blog/*.md` with a
  typed frontmatter schema: `title, date, updated?, tags[], summary, draft, ogImage?, canonical?`.
- **Source pipeline:** Research Lab `70_WIKI` / `20_RESEARCH` notes → curate → promote to a post. A lot of
  raw material already exists (AI security, AIBOM, design reviews, this migration). Keep a lightweight
  "promote a note to a post" step rather than writing from scratch each time.
- **Authoring model:** Arun owns the thesis; AI-assisted drafting/editing; **human-reviewed, never
  auto-published** (`draft: true` until you approve). Matches your existing workflow.
- **Cadence (realistic):** launch with **3–5 backfilled posts** (an empty blog is worse than no blog),
  then **1–2 posts/month.** Don't over-commit; consistency > volume.
- **Topic pillars:** (1) AI security & agents — AgentDefense-Bench, Cross-LLM backdoors, OWASP AIBOM;
  (2) Platform/federal AI — Platform One, cATO, DoD delivery; (3) AI memory systems — Jarvis Cortex;
  (4) build-in-public of these tools.
- **Concrete launch set:**
  1. _Defending MCP agents from prompt injection_ (← AgentDefense-Bench)
  2. _Building an AIBOM: AI supply-chain transparency_ (← OWASP AIBOM work)
  3. _cATO on Platform One: compressing ATO from years to weeks_ (← DoD)
  4. _A graph-enhanced memory system for AI assistants_ (← Jarvis Cortex)
  5. _(optional, build-in-public)_ _Moving my site off GitHub Pages onto k3s_

---

## 8. EB-1A evidence map (site section → criterion)

> Not legal advice — this maps how the site can **surface** evidence; your attorney owns the petition.
> USCIS lists 8 criteria; a petition needs ≥3. The site can credibly surface ~6.

| EB-1A criterion                                | Site surface                             | Evidence already in hand                                                                 |
| ---------------------------------------------- | ---------------------------------------- | ---------------------------------------------------------------------------------------- |
| Awards / prizes                                | Home recognition strip · `/about` awards | SECAF Project of the Year (2024); Employee of the Year (2017)                            |
| Membership (requires outstanding achievement)  | `/about` memberships · `/speaking`       | IEEE; ACM; IASA Global Chief Architect Forum                                             |
| Published material _about_ you (media)         | `/about` press/mentions strip            | _gap — collect press/podcasts/interviews_                                                |
| Judging others' work                           | `/speaking`                              | ACM reviewer; paper review; competition judging                                          |
| Original contributions of major significance   | `/work` · `/projects` · `/blog`          | Platform One contributions; Operation Allies Refuge; OSS (AgentDefense, AIBOM, MicroEKS) |
| Authorship of scholarly articles               | `/speaking` (papers) · `/blog`           | Conference papers; thought-leadership posts                                              |
| Leading / critical role for distinguished orgs | `/work`                                  | DoD Platform One; CMS; USAF; $44M/$15.6M programs                                        |
| High remuneration                              | _not a public surface_                   | (private)                                                                                |

**Implication for the build:** `/speaking` and the About recognition/press sections aren't "nice to have"
— they're the EB-1A surface. Prioritized accordingly in Phase 3. The one visible **gap is "media about
you"** — start collecting links now.

---

## 9. Success criteria (the bar — each phase has a Definition of Done)

**Global targets (measured at relaunch and after each phase):**

- **Performance:** Lighthouse Performance ≥ 95 (mobile); LCP < 2.0s; CLS < 0.05; content-page JS < 100 KB.
- **SEO:** Lighthouse SEO = 100; valid OG (LinkedIn Post Inspector + Twitter Card Validator render
  correctly); `sitemap.xml` + RSS present; every page has a unique title + meta description.
- **Accessibility:** Lighthouse a11y ≥ 95; axe 0 critical issues; full keyboard path; visible focus;
  text contrast ≥ AA (4.5:1).
- **Brand:** exactly one tagline across all pages; resume reachable in ≤ 1 click.
- **Content:** blog launches with ≥ 3 posts + valid RSS; ≥ 1 new post in the first 30 days.

Per-phase Definitions of Done are inline in §10.

---

## 10. Phased roadmap

Priority **P0/P1/P2** · Effort **S** <½d / **M** 1–2d / **L** >2d. Existing tasks mapped (WEBS-###).
Per-phase effort is a rough sum of its items.

### Phase 0 — Decide & scaffold · ~½–1 day · gates everything

- P0 · S — **Resolve §6** (Option A recommended). _(maps WEBS-002)_
- P0 · M — Scaffold the chosen stack (Astro project, port `base.css` tokens, CI build to `dist/`).
- P0 · S — Stand up CI (build + Lighthouse smoke) so every later phase is measured.
- **DoD:** chosen stack builds in CI; a "hello" page deploys to the private Forge URL.

### Phase 1 — Relaunch MVP · ~1 week · **THE CUT LINE — ship this first**

_Smallest set that makes the site meaningfully better, correct, and shareable. Goes live as v2.0._

- P0 · M — Forge image build/push on host; verify pod/PDB/service/healthz. _(WEBS-002)_
- P0 · M — Edge prereqs: cert-manager DNS-01 for `arunsanna.com`, `arunsanna-com-tls`, gateway SNI,
  authz `notHosts`. _(partly drafted in `deploy/forge/…`)_
- P0 · S — Validate end-to-end on private `arunsanna.arunlabs.com` (VPN).
- P0 · S — **DNS cutover** Pages → Forge; verify TLS + apex/www redirects. _(WEBS-005)_
- P0 · L — Static-generate real HTML for the existing sections (kills the client-render SEO hole).
- P0 · S — SEO meta + OG/Twitter cards + favicon set + `og:image`.
- P0 · S — Fix duplicate-heading a11y bug; add skip-to-content link.
- P0 · S — Unify the tagline (title/hero/about); auto-generate footer year; strip dead test code.
- **DoD:** live on `arunsanna.com` via Forge; Lighthouse SEO = 100, Perf ≥ 90; OG previews render on
  LinkedIn/Twitter; zero console errors; one consistent tagline.

### Phase 2 — Content backbone · ~1–2 weeks · delivers the actual goal

- P1 · M — IA routes (`/work`, `/projects`, `/blog`, `/about`) + new nav + active states + mobile menu.
- P1 · M — Home redesign per §5.1 (selected work + writing + OSS + recognition).
- P1 · M — Blog: content collection + post schema + index + tag filter + article template (TOC, code). _(WEBS-003)_
- P1 · S — RSS + `sitemap.xml` + per-post OG image generation.
- P1 · M — Seed the 3–5 launch posts (§7).
- P1 · M — Project detail pages (`/projects/:slug`) from the JSON model; wire live data source.
- **DoD:** `/blog` live with ≥ 3 posts + valid RSS; multi-page nav works; home shows work + writing + OSS;
  each page has unique title/meta.

### Phase 3 — Depth, design & EB-1A · ~1–2 weeks

- P1 · M — Design tokens pass (spacing/type scale, single header pattern, disciplined accent).
- P1 · M — Implement the sharper editorial direction (less cyber, more "ships real systems").
- P1 · M — `/speaking` — talks, papers, IEEE/ACM service, reviewing (EB-1A surface, §8). _(WEBS-001 lineage)_
- P1 · M — Responsive + a11y sweep with **real device/viewport screenshots**; fix breakpoints. _(WEBS-001)_
- P1 · S — Contrast audit (cyan-on-dark, glass) + non-color-only status cues; keyboard walkthrough.
- P2 · S — Certifications → data-driven JSON; show "Key Highlights" by default (kill hover-only).
- **DoD:** Lighthouse ≥ 95 across Perf/A11y/SEO on home, blog post, project, about; `/speaking` live;
  verified on a real phone + tablet + desktop.

### Phase 4 — Growth & ops · ongoing

- P2 · M — Live GitHub stats via cached `/api/github` (or build-time fetch).
- P2 · S — Privacy-friendly analytics (reconcile the existing Vercel Analytics note — pick one).
- P2 · S — Lighthouse/CI budget gate on PRs (perf/a11y/SEO regression guard).
- P2 · M — Contact form via `/api/contact` (+ spam protection) replacing mailto.
- P2 · S — `/uses`, `/now`, press/mentions strip; motion polish + `prefers-reduced-motion`.
- **DoD:** CI blocks perf/a11y/SEO regressions; contact form delivers; analytics reporting.

### Effort summary

| Phase | Theme                 | Rough effort | Outcome                                  |
| ----- | --------------------- | ------------ | ---------------------------------------- |
| 0     | Decide & scaffold     | ½–1 day      | Stack chosen, CI building                |
| 1     | **Relaunch MVP**      | ~1 week      | Live on Forge, SEO/a11y fixed, shareable |
| 2     | Content backbone      | ~1–2 weeks   | Blog + multi-page IA live                |
| 3     | Depth, design & EB-1A | ~1–2 weeks   | Polished, accessible, `/speaking`        |
| 4     | Growth & ops          | ongoing      | Live data, contact form, CI guards       |

---

## 11. Open questions for Arun

1. **Architecture (§6):** Option A (static-gen + thin API) — yes? Astro the right pick?
2. **Tagline:** "Enterprise AI Architect & Forward Deployed Engineer" — confirm the canonical line?
3. **Blog scope at launch:** technical only, or also research/EB-1A artifacts?
4. **Palette:** keep cyan as the single accent, or rebrand while we're in here?
5. **"Cooking" track:** how much experimental work stays public vs. private?
6. **EB-1A "media about you":** do you have press/podcast/interview links to seed that section (§8 gap)?

---

_Not yet verified this pass: pixel-level visual QA across viewports (headless browser crashed on the
particle/blur-heavy full-page render). Graded from rendered accessibility tree + code + design tokens.
Visual sweep is Phase 3._
