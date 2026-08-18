<div align="center">

# ⚡ EvoXis'26 ⚡
### *"Evolving Intelligence • Infinite Possibilities"*

**National Level Inter-Collegiate Technical & Cultural Symposium**  
*Hosted Jointly by the Departments of CSBS, CSE, AI&DS, AIML, and Cyber Security*  
**Sriram Engineering College, Perumalpattu, Tiruvallur**

[![Build Status](https://img.shields.io/badge/build-passing-brightgreen?style=for-the-badge&logo=github-actions)](https://github.com)
[![React](https://img.shields.io/badge/React-18.x-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-5.x-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vite.dev/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-3.x-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![shadcn/ui](https://img.shields.io/badge/shadcn%2Fui-Components-000000?style=for-the-badge&logo=shadcnui&logoColor=white)](https://ui.shadcn.com/)
[![Cloudflare Pages](https://img.shields.io/badge/Cloudflare_Pages-Edge_Hosted-F38020?style=for-the-badge&logo=cloudflare&logoColor=white)](https://pages.cloudflare.com/)
[![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)](LICENSE)

---

</div>

## 📌 1. Project Overview

**EvoXis'26** is the official web portal for the grand annual national symposium jointly organized by five specialized computing departments at Sriram Engineering College. Engineered with a cutting-edge, mobile-first cybernetic design system, EvoXis'26 provides an ultra-fast, zero-friction hub for students across the nation to explore **16 flagship events** (across Technical, Non-Technical, and Special categories), review detailed rules and cash prize pools, coordinate directly with student event leads via WhatsApp, and register seamlessly in seconds. Built on a pure static Jamstack architecture and served via Cloudflare's global Anycast Edge Network, the portal delivers sub-second page loads, 100% uptime, and zero infrastructure maintenance costs.

---

## 🛠️ 2. Confirmed Tech Stack

| Layer / Concern | Technology | Description |
|---|---|---|
| **UI Framework** | [React 18 / 19](https://react.dev) | High-performance component-based client application |
| **Build Tooling & Bundler** | [Vite](https://vite.dev) | Next-generation frontend tooling with instant HMR |
| **Language** | [TypeScript](https://www.typescriptlang.org) | Strict type-safety across all components, models, and props |
| **Styling Engine** | [Tailwind CSS](https://tailwindcss.com) | Utility-first styling with custom cybernetic design tokens |
| **Component Primitives** | [shadcn/ui](https://ui.shadcn.com) | Accessible, unstyled Radix UI primitives with Tailwind styling |
| **Animation Library** | [Framer Motion](https://www.framer.com/motion/) | Smooth spring physics, scroll reveals, and modal transitions |
| **Icons** | [Lucide React](https://lucide.dev) | Modern, lightweight SVG iconography |
| **Image Compression** | WebP & AVIF | Next-gen image formats for instant mobile rendering |
| **Hosting & Edge Delivery** | [Cloudflare Pages](https://pages.cloudflare.com) | Global Anycast Edge distribution with automatic HTTPS & CDN caching |
| **Analytics & Telemetry** | Cloudflare Web Analytics / GA4 | Privacy-friendly telemetry and registration funnel tracking |
| **Version Control** | GitHub | Collaborative student development and CI/CD triggers |

---

## 🏆 3. Events Snapshot (16 Events across 3 Categories)

EvoXis'26 features 16 diverse competitions spanning core computer science, business innovation, pop culture, media arts, and athletic strategy:

```
========================================================================================================
                                      EVOXIS'26 EVENTS MATRIX
========================================================================================================
```

| Category | # | Event Name | Format & Team Size | Brief Description |
|---|---|---|---|---|
| **Technical** | 1 | **Paper Presentation** | Team (2–3) | Research presentation on AI, Web3, Cyber, Cloud, and IoT. |
| **Technical** | 2 | **Business Battle** | Team (2–4) | Startup pitching, revenue modeling, and venture case defense. |
| **Technical** | 3 | **Mind Sparks** | Team (1–2) | Rapid-fire technical quiz on algorithms, tech trivia, and puzzles. |
| **Technical** | 4 | **EditoMania** | Individual / Duo | High-stakes digital UI/UX design and video storytelling showdown. |
| **Technical** | 5 | **Lego Build with AI** | Team (2–3) | Modular physical build challenge enhanced with AI prompt logic. |
| **Technical** | 6 | **Cyber Investigation** | Team (2–3) | Digital forensics, OSINT investigations, and CTF puzzle solving. |
| **Non-Technical** | 7 | **Start Music** | Team (2–3) | Ultimate music identification, blind audio tracks, and rhythm trivia. |
| **Non-Technical** | 8 | **Indo Japanese Game** | Individual / Duo | Traditional Japanese & Indian cognitive dexterity mini-games. |
| **Non-Technical** | 9 | **IPL Auction** | Team (3–4) | Strategic cricket franchise auction with dynamic virtual purses. |
| **Non-Technical** | 10 | **Reel Rush** | Individual / Duo | On-spot viral cinematography and rapid Instagram reel creation. |
| **Non-Technical** | 11 | **Squid Game** | Individual | High-energy survival elimination rounds and obstacle challenges. |
| **Non-Technical** | 12 | **Clash of Talent** | Individual / Duo | Open stage variety spotlight for music, stand-up, beatbox, and magic. |
| **Special** | 13 | **Box Cricket** | Team (6–7) | Electrifying turf cricket tournament with fast-paced box rules. |
| **Special** | 14 | **Football** | Team (5 + 2 Sub) | 5-a-side knockout football championship testing speed and tactics. |
| **Special** | 15 | **Fashion Walk** | Individual / Duo | Thematic runway showcase highlighting haute couture & stage poise. |
| **Special** | 16 | **E-Sports** | Team (4) | Competitive battleground gaming tournament (BGMI / Free Fire). |

---

## 📂 4. Project Directory Structure

```text
evoxis-26/
├── public/                      # Static assets served at root
│   ├── favicon.svg              # Official EvoXis'26 vector favicon
│   ├── og-banner.png            # Open Graph social preview card (1200x630)
│   └── robots.txt               # Search engine crawler directives
├── src/
│   ├── assets/                  # Images, banners, and vector assets
│   │   ├── departments/         # Department crests & HOD photos
│   │   ├── gallery/             # Past symposium photo highlights
│   │   └── sponsors/            # Sponsor & partner corporate logos
│   ├── components/              # Modular UI components
│   │   ├── common/              # Navbar, Footer, MobileDrawer, SectionHeader
│   │   ├── countdown/           # Live countdown timer module
│   │   ├── events/              # EventCard, EventGrid, EventFilter, EventModal
│   │   ├── gallery/             # Lightbox photo gallery grid
│   │   ├── hero/                # Hero banner, 3D/ambient cyber glow background
│   │   ├── registration/        # RegistrationForm, SuccessDialog, FormValidation
│   │   ├── schedule/            # Interactive timeline tabs
│   │   └── ui/                  # Reusable shadcn/ui primitives (button, dialog, input, etc.)
│   ├── data/                    # Centralized, strictly-typed data stores
│   │   ├── departments.ts       # Co-hosting department details (CSBS, CSE, AI&DS, etc.)
│   │   ├── events.ts            # Complete 16 events catalog, rules, prizes, coordinators
│   │   ├── faqs.ts              # General symposium questions and guidelines
│   │   ├── gallery.ts           # Past event images metadata
│   │   └── schedule.ts          # Master day schedule and venue allocations
│   ├── hooks/                   # Custom React hooks (useCountdown, useScrollSpy, etc.)
│   ├── lib/                     # Utilities and Tailwind class merge helpers (cn)
│   ├── types/                   # Central TypeScript interface definitions
│   │   └── index.ts             # EventItem, RegistrationSubmission, Department, etc.
│   ├── App.tsx                  # Main single-page application layout
│   ├── index.css                # Tailwind directives, cybernetic CSS theme variables
│   └── main.tsx                 # React DOM entry point
├── .env.example                 # Template for environment variables
├── index.html                   # HTML entry point with rich SEO/OpenGraph tags
├── package.json                 # Project dependencies and script declarations
├── postcss.config.js            # PostCSS configuration for Tailwind CSS
├── tailwind.config.js           # Cyberpunk/Neon palette, glassmorphism utilities
├── tsconfig.json                # Strict TypeScript configuration
└── vite.config.ts               # Vite bundler plugins and path aliases (@/*)
```

---

## 🚀 5. Getting Started & Local Development

### Prerequisites
- **Node.js:** v18.0.0 or higher (LTS recommended)
- **Package Manager:** `npm`, `pnpm`, or `yarn`
- **Git:** Installed on local machine

### 1. Clone the Repository
```bash
git clone https://github.com/your-org/evoxis-26.git
cd evoxis-26
```

### 2. Install Dependencies
```bash
npm install
# or
pnpm install
```

### 3. Setup Environment Variables
Create your local `.env` file from the provided template:
```bash
cp .env.example .env
```

### 4. Start the Local Development Server
```bash
npm run dev
```
Open your browser at `http://localhost:5173` to explore the live application with Instant Hot Module Replacement (HMR).

### 5. Build for Production
```bash
npm run build
```
The optimized static bundle will be output to the `./dist` directory, fully prepared for Cloudflare Pages deployment.

### 6. Preview Production Build Locally
```bash
npm run preview
```

---

## ⚙️ 6. Environment Configuration

Edit your `.env` file with the relevant keys for telemetry and registration submission:

```env
# Symposium Configuration
VITE_APP_TITLE="EvoXis'26 — Sriram Engineering College"
VITE_EVENT_DATE="2026-09-26T09:00:00+05:30"

# Registration Intake Endpoint
# Enter your Cloudflare Pages Function, Google Apps Script Web App, or Formspree Webhook URL
VITE_REGISTRATION_WEBHOOK_URL="https://your-domain.pages.dev/api/register"

# Telemetry (Optional)
VITE_GA_MEASUREMENT_ID="G-XXXXXXXXXX"
```

---

## 🌐 7. Cloudflare Pages Deployment Guide

Deploying EvoXis'26 to Cloudflare Pages is automated and takes less than 2 minutes:

1. **Push your code to GitHub:**
   Ensure the latest working version is pushed to the `main` branch.
2. **Log into Cloudflare Dashboard:**
   Navigate to **Workers & Pages** > **Create application** > **Pages** > **Connect to Git**.
3. **Select Repository:**
   Choose your `evoxis-26` repository.
4. **Configure Build Settings:**
   - **Framework preset:** `Vite`
   - **Build command:** `npm run build`
   - **Build output directory:** `dist`
   - **Root directory:** `/` (or leave empty)
5. **Environment Variables:**
   Add any production environment variables (e.g. `VITE_REGISTRATION_WEBHOOK_URL`).
6. **Click Save and Deploy:**
   Cloudflare Pages will automatically build and distribute the site to 300+ global edge locations.
7. **Custom Domain:**
   Under project **Custom Domains**, connect your custom domain (e.g., `evoxis26.sriram.edu.in`) with automated zero-touch SSL certificate provisioning.

---

## 🤝 8. Contributing & Git Workflow

We welcome contributions from the student development teams of CSBS, CSE, AI&DS, AIML, and Cyber Security departments!

### Branch Naming Standards
- `feature/event-card-modal` — For new UI features or enhancements
- `fix/mobile-drawer-overflow` — For bug fixes or responsive layout corrections
- `data/update-event-rules` — For changes to event rules, timings, or coordinator contacts
- `refactor/registration-validation` — For code cleanup and optimizations

### Pull Request (PR) Process
1. Fork or branch from `main`.
2. Create a descriptive feature branch: `git checkout -b feature/your-feature-name`.
3. Ensure TypeScript passes without errors: `npm run build`.
4. Commit with clean messages following Conventional Commits: `git commit -m "feat(events): add whatsapp link to coordinator card"`.
5. Push to your branch and submit a Pull Request to `main` for review by the Technical Leads.

---

## 🏫 9. Host Departments & Leadership

**Sriram Engineering College**  
*Approved by AICTE, New Delhi & Affiliated to Anna University, Chennai*  
*Perumalpattu, Tiruvallur - 602 024, Tamil Nadu, India*

### Jointly Organized By:
1. **Department of Computer Science and Business Systems (CSBS)**
2. **Department of Computer Science and Engineering (CSE)**
3. **Department of Artificial Intelligence & Data Science (AI&DS)**
4. **Department of Artificial Intelligence & Machine Learning (AIML)**
5. **Department of Cyber Security**

---

## 📄 10. License & Credits

This project is licensed under the [MIT License](LICENSE).  
Designed and developed with 💜 by the **EvoXis'26 Student Technical Development Council**.
