# EvoXis'26 — Documentation Generation Prompt

> Use this file as a single structured prompt to generate three deliverables for the EvoXis'26 symposium website project: an **SRS (Software Requirements Specification)**, a **PRD (Product Requirements Document)**, and a **README.md**. Paste the whole file (or reference it) into your AI assistant / dev tool of choice.

---

## 0. Role & Instructions for the AI

You are a senior technical product manager and software architect. Using the project context below, produce **three separate, complete documents**:

1. `SRS.md` — Software Requirements Specification
2. `PRD.md` — Product Requirements Document
3. `README.md` — Repository README (unique, non-generic template)

Rules:
- Do not merge the three documents — output them as distinct, clearly headed sections (or separate files if the tool supports multi-file output).
- Use the exact tech stack, events list, and constraints given below — do not substitute or add technologies not listed.
- Keep the tone professional and production-ready, suitable for a college dev team to execute against.
- Number all functional requirements (FR-1, FR-2, …) and non-functional requirements (NFR-1, NFR-2, …) in the SRS.
- Flag any assumption you make explicitly as `> Assumption:` so it can be corrected later.

---

## 1. Project Context

**Project name:** EvoXis'26
**Type:** College symposium registration & promotion website
**Organizer:** Sriram Engineering College — jointly hosted by CSBS, CSE, AI&DS, AIML, and Cyber Security departments
**Tagline:** "Evolving Intelligence • Infinite Possibilities"
**Nature of site:** Fully static, CDN-hosted (no backend server required for core browsing/traffic)
**Expected concurrent load:** 100+ simultaneous users, CDN-first architecture so this is a non-issue

---

## 2. Confirmed Tech Stack

| Layer | Technology |
|---|---|
| UI Framework | React + Vite |
| Language | TypeScript |
| Styling | Tailwind CSS |
| UI Components | shadcn/ui |
| Animations | Framer Motion |
| Icons | Lucide React |
| Image formats | WebP / AVIF |
| Hosting | Cloudflare Pages |
| CDN / DNS | Cloudflare |
| Domain | Custom domain (TBD) |
| Source control | GitHub |
| Analytics | Google Analytics / Cloudflare Analytics |
| Dev environment | VS Code |

> Assumption: no traditional backend/API is in scope for this version. Registration form submissions, if included, should be handled via a static-friendly method (e.g., a form service, Cloudflare Worker/Pages Function, or Google Sheets integration) rather than a dedicated Node/Express server. Flag this decision point explicitly in the SRS/PRD as an open question for the team to confirm.

---

## 3. Events List (content to be represented on the site)

### Technical Events
1. Paper Presentation
2. Business Battle
3. Mind Sparks
4. EditoMania
5. Lego Build with AI
6. Cyber Investigation

### Non-Technical Events
1. Start Music
2. Indo Japanese Game
3. IPL Auction
4. Reel Rush
5. Squid Game
6. Clash of Talent

### Special Events
1. Box Cricket
2. Football
3. Fashion Walk
4. E-Sports

**Total: 16 events across 3 categories.**

Each event should have (at minimum) a dedicated card/section with: name, category badge, short description, rules/format, coordinator contact, and a registration CTA.

---

## 4. Core Site Sections (informs both SRS & PRD)

- Landing / Hero (symposium branding, tagline, countdown to event date)
- About EvoXis'26 (overview, host departments)
- Events (Technical / Non-Technical / Special — filterable grid)
- Individual event detail view/modal (rules, team size, prizes, coordinator)
- Registration flow (per-event or unified — to be defined in PRD)
- Schedule / Timeline
- Sponsors / Partners (if applicable)
- Gallery (optional, past-event photos)
- Contact / Location / Venue map
- Footer (social links, department credits)

---

## 5. Deliverable 1 — SRS.md Requirements

Generate an SRS with the following structure:

1. **Introduction**
   - Purpose, Scope, Definitions/Acronyms, References, Overview
2. **Overall Description**
   - Product perspective, product functions, user classes (visitor, participant, coordinator/admin if any), operating environment, constraints, assumptions
3. **Functional Requirements** (numbered FR-1, FR-2, …)
   - Cover: browsing events, viewing event details, registration submission, form validation, responsive navigation, countdown timer, analytics tracking, SEO metadata
4. **Non-Functional Requirements** (numbered NFR-1, NFR-2, …)
   - Performance (CDN caching, load time targets, image optimization), scalability (concurrent users), accessibility (WCAG basics), security (form spam protection, HTTPS), browser/device compatibility, maintainability
5. **System Architecture**
   - Static-site architecture diagram description matching: React+Vite build → Cloudflare Pages CDN → Users
   - Explicitly state why no backend server is used, and where the registration data–handling boundary sits
6. **Data Requirements**
   - Event data model (id, name, category, description, rules, coordinator, image, etc.)
   - Registration data model, if applicable
7. **External Interface Requirements**
   - Any third-party integrations (form service, analytics, WhatsApp/email if used)
8. **Appendix**
   - Full events list (from Section 3 above), glossary

---

## 6. Deliverable 2 — PRD.md Requirements

Generate a PRD with the following structure:

1. **Problem Statement** — why EvoXis'26 needs a dedicated site
2. **Goals & Success Metrics** — e.g., registration conversion rate, page load speed, mobile traffic share, bounce rate
3. **Target Users / Personas** — prospective participants, event coordinators, college visitors/sponsors
4. **Scope** — in-scope and explicitly out-of-scope items for this version (e.g., "no admin dashboard in v1" if that's the case)
5. **Feature List** — prioritized (P0/P1/P2) using MoSCoW or similar, covering the sections in Section 4 above
6. **User Flows** — key flows: discover event → view details → register; browse schedule; find venue
7. **Design Direction** — visual tone, responsiveness requirements, branding notes (tagline, department co-branding)
8. **Milestones / Timeline** — phased plan (setup → core pages → events content → registration → QA → launch)
9. **Risks & Open Questions** — explicitly list the backend/registration-handling decision as an open question
10. **Out of Scope (v1)** — anything deferred (e.g., admin panel, certificates, QR attendance) if not part of this static-site version

---

## 7. Deliverable 3 — README.md Requirements

Produce a **unique, non-boilerplate README template** (not a generic "npm install / npm run dev" README). It should include:

1. **Project banner/title block** — EvoXis'26 name, tagline, badges (build status, license, tech stack badges)
2. **One-paragraph pitch** — what the site is, who it's for
3. **Tech stack table** (reuse Section 2)
4. **Events snapshot** — condensed list/table of all 16 events by category (reuse Section 3)
5. **Project structure** — expected folder layout for a React+Vite+Tailwind+shadcn project (e.g., `src/components`, `src/pages`, `src/data/events.ts`, `src/assets`)
6. **Getting Started** — prerequisites, install, dev server, build, preview commands
7. **Environment/config notes** — anything needed for analytics or form integration
8. **Deployment** — step-by-step Cloudflare Pages deployment instructions (connect GitHub repo → build command → output directory)
9. **Contributing** — branch naming convention, PR process (useful since this is a college team project)
10. **Team / Credits** — placeholder section for department + contributor names
11. **License** — placeholder

Make the README visually organized with clear headers, tables, and a table of contents — it should feel like a polished open-source project README, not a default template.

---

## 8. Output Format Instructions

- Output the three documents in this order: SRS → PRD → README
- Use Markdown throughout with proper heading hierarchy (`#`, `##`, `###`)
- Use tables wherever structured/tabular data is described above
- Keep each document self-contained and readable independently
