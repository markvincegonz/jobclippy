# JobClippy — Master Product Roadmap & Feature Progress Tracker

> **Vision:** A browser extension and intelligent job-search command center that lets candidates save jobs from anywhere on the web, automatically organizes important attributes, and visually tracks every application from discovery to offer.
>
> **Maintenance Protocol:** This document serves as the single source of truth for overall app development progress. Every time a new feature, workflow, or architectural change is implemented, this checklist **must be updated** with completion timestamps, references to specs/tests, and updated progress counters.

---

## Overall Build Progress

| Phase | Category | Status | Specs & Tests |
| :--- | :--- | :---: | :--- |
| **Phase 1** | Foundation & Linear Design System | **Completed** (100%) | [design-system](openspec/specs/design-system/spec.md), [theme-system](openspec/specs/theme-system/spec.md) |
| **Phase 2** | Core Kanban Board & Job Lifecycle | **Completed** (100%) | [job-board](openspec/specs/job-board/spec.md), [smart-extractor](openspec/specs/smart-extractor/spec.md) |
| **Phase 3** | Admin Shell & Power Navigation | **Completed** (100%) | [admin-navigation](openspec/specs/admin-navigation/spec.md) |
| **Phase 4** | High-Density Interactive Applications Table | **Completed** (100%) | [applications-table](openspec/specs/applications-table/spec.md) |
| **Phase 5** | Browser Extension (MV3 Universal Clipper) | **Completed** (100%) | [browser-extension](openspec/specs/browser-extension/spec.md), [extension-test](tests/browser-extension.spec.ts) |
| **Phase 6** | Dockerized PostgreSQL & Prisma Backend | **Completed** (100%) | [database-persistence](openspec/specs/database-persistence/spec.md), [jobs-database-test](tests/jobs-database.spec.ts) |
| **Phase 7** | Pipeline Velocity & Funnel Analytics | **Planned** | MVP Week 3 |
| **Phase 8** | AI Resume Matcher & Skill Gap Analyzer | **Planned** | Premium Layer |
| **Phase 9** | Interview Workspace & Follow-Up Reminders | **Planned** | Assistant Layer |
| **Phase 10** | Backend, Auth & Full Page Suite (Login/Signup/Account) | **Planned** | MVP Week 4 |
| **Phase 11** | SaaS Monetization, Landing Page & Launch | **Planned** | Launch Week |

**Current Test Health:** 50/52 Playwright E2E tests passing (2 theme-toggle tests skipped in CI).

---

## Detailed Feature Checklist

### Phase 1: Foundation & Linear Design System
- [x] **Next.js 16 + React 19 + TypeScript Setup**
  - Turbopack dev server, Strict TypeScript mode.
  - Path alias `@/*` configured.
- [x] **Linear Design Aesthetics**
  - Dark Canvas (`#08090a`), dark elevated surfaces (`#101114`, `#16171a`, `#1c1d21`).
  - Light mode inverse tokens (`#fcfcfd`, `#f4f5f6`).
  - 1px hairline borders (`rgba(255,255,255,0.08)` / `rgba(0,0,0,0.08)`).
  - Subtle interactive micro-transitions (150ms ease).
- [x] **Theme Switcher**
  - Zero-flicker SSR hydration with `next-themes`.
  - Floating and top-bar toggle controls with persistent local storage.
- [x] **Clippy Mascot & Emotional Delight**
  - Animated SVG paperclip mascot with mood states (idle, encouraging, celebration).

---

### Phase 2: Core Kanban Pipeline & Job Lifecycle
- [x] **5-Stage Kanban Workflow**
  - Columns: `Wishlist` -> `Applied` -> `Interviewing` -> `Offer` -> `Archived`.
  - Column header count badges with stage color accents.
- [x] **HTML5 Drag-and-Drop**
  - Reorder and move cards across columns with smooth drag states.
  - Automatic celebratory confetti explosion when dropping a card into `Offer`.
- [x] **Keyboard-Only Spatial Navigation**
  - `]` advances active card to the next stage.
  - `[` moves active card to the previous stage.
- [x] **Quick Add Modal & Smart Extraction**
  - Heuristic parser extracting: Job Title, Company, Location, Salary Range, and Skill Chips.
  - Instant job creation with immediate store reflection.
- [x] **Job Detail Slide-Over Sheet**
  - Detailed view showing full job description, parsed skills, compensation, and link.
  - Editable rich personal notes with timestamped updates.
- [x] **Error Safeguards & Safety**
  - Undo toast on card deletion with 5-second restore window.
  - Destructive delete confirmation modal in Detail Sheet.
  - Confirmation dialog before resetting demo state.

---

### Phase 3: Admin Shell & Power Navigation
- [x] **Linear-Grade Collapsible Sidebar**
  - Expand/collapse toggle preserving icon rail in collapsed state.
  - Persistent sidebar state stored in `localStorage` without hydration mismatch.
  - Global keyboard shortcut `[` or `Cmd+B` / `Ctrl+B` to toggle sidebar.
- [x] **Responsive Mobile Navigation**
  - Full slide-over drawer for screens under 1024px.
  - Accessible hamburger trigger with auto-closing on view selection.
- [x] **Streamlined Top Context Bar**
  - Real-time global search query filtering across Title, Company, and Skills.
  - Active view breadcrumbs and active stage filter chip with clear button.
  - Quick "+ New Job" action button.
- [x] **Stage Filter Shortcuts**
  - Clickable stage items in sidebar highlighting and filtering corresponding board column or table view.
- [x] **Data Backup & Demo Reset**
  - JSON data export downloading full opportunities database.
  - Demonstration reset restoring curated sample dataset.

---

### Phase 4: High-Density Interactive Applications Table
- [x] **High-Density Linear Tabular Layout**
  - Clean table presenting Title, Company, Stage, Compensation, Location, Skills, and Actions.
  - Subtle row hover highlights and hairline dividers.
- [x] **Multi-Column Sorting**
  - Three-state sorting (asc, desc, neutral) across Role, Company, Stage, and Salary.
  - Visual sort indicator icons with active column highlighting.
- [x] **In-line Stage Selector Dropdown**
  - Portaled dropdown menu directly in each table row.
  - Instant stage transition with matching badge styling and toast confirmation.
  - No horizontal scrolling regression or layout overflow.
- [x] **Multi-Row Batch Actions**
  - Row checkboxes and "Select All" header checkbox.
  - Floating batch action toolbar for bulk transitioning selected jobs to any stage.
  - Selection count and bulk clear trigger.
- [x] **Responsive Mobile Stacked Card-List**
  - Automatic transformation into touch-friendly stacked card list on mobile screens (<768px).
  - Retains in-row stage dropdown and click-to-open sheet trigger.
- [x] **Row Click Detail Sheet**
  - Clicking any table row opens the slide-over `JobDetailSheet`.

---

### Phase 5: Browser Extension (MV3 Universal Clipper)
- [x] **Manifest V3 Chrome Extension Package (`extension/`)**
  - Background service worker, popup HTML/CSS/JS, top-frame isolation, and manifest declaration.
- [x] **Site-Specific Job DOM Parsers**
  - LinkedIn Job Posting extractor (Title, Company, Location, Description, Salary).
  - Indeed Job Posting extractor with two-pane preview scoping (`#jobsearch-ViewjobPaneWrapper`), international currency recognition (`PHP`, `₱`, `£`, `€`, `₹`, `$`), and direct viewjob URL resolution.
  - Safe description normalization avoiding destructive regex cuts on legitimate requirements.
- [x] **Universal "Highlight-to-Clip" Fallback**
  - Right-click context menu "Save Highlighted Job to JobClippy".
  - Content script extraction of user-highlighted text on any company career page.
- [x] **Ultra-Minimalist Clipper UI & Emoji Purge**
  - Removal of pregathered form inputs (Title, Company, Location, Salary, Skills) for a focused Stage & Personal Note layout.
  - Complete elimination of casual emojis (`⚡`, `✨`, `🏢`, `📍`, `💰`), styled with clean Linear typography and SVG icons.
  - On-demand AI extraction executed only upon clicking "Clip to JobClippy" (zero background requests on popup open).
  - Scoped Indeed feed extraction targeting `vjk` parameter and same-origin viewjob retrieval, completely preventing "Job Search" page-title leakage.
  - Validated in [browser-extension.spec.ts](tests/browser-extension.spec.ts) and [minimalist-clipper-indeed-fix](openspec/changes/archive/2026-10-03-minimalist-clipper-indeed-fix/proposal.md).
- [x] **JobStreet, Seek & Universal Semantic Reading Pane Extractor**
  - First-class extraction for JobStreet (`ph.jobstreet.com`, `jobstreet.com.*`), Seek (`seek.com.*`), and JobsDB targeting `data-automation` attributes across 2-pane search views (`/web-jobs?jobId=...`) and direct opportunity URLs (`/job/...`).
  - Canonical URL normalization standardizing split-view and tracked links to clean `/job/{jobId}` paths.
  - Same-origin `/job/{jobId}` HTML fetch fallback in content script when split-view preview panes are unmounted or delayed.
  - Universal Semantic Reading Pane Scorer (`findActiveJobContainer`) dynamically isolating the active reading view on arbitrary multi-column job boards and discarding search card sidebars.
  - AI prompt URL and section disambiguation in `/api/extract` directing models to prioritize active URL and expanded description panes.
  - Validated in [browser-extension.spec.ts](tests/browser-extension.spec.ts), [cache-canonicalize.spec.ts](tests/cache-canonicalize.spec.ts), and [jobstreet-and-universal-section-extractor](openspec/changes/archive/2026-10-03-jobstreet-and-universal-section-extractor/proposal.md).
- [x] **Data Sync Bridge**
  - Web message / Chrome Storage sync to JobClippy web application (`jobclippy_jobs_v1`).
  - Instant reactive store update without requiring page reload.
- [x] **AI-Powered 3-Tier Extraction Pipeline**
  - Layer 1: Client DOM pre-cleaning and token budgeting (~1,200 tokens) with optimistic preview.
  - Layer 2: Canonical URL normalization, SHA-256 hashing, and persistent extraction cache.
  - Layer 3: Server-side Next.js API route (`/api/extract`) with strict JSON schema LLM extraction and graceful fallback.

---

### Phase 6: Dockerized PostgreSQL & Prisma Backend
- [x] **Docker Compose PostgreSQL 16 Service**
  - Isolated `postgres:16-alpine` container with persistent named volume (`jobclippy_pgdata`).
  - Safe port allocation (mapped to `5433:5432`) avoiding conflicts with host PostgreSQL daemons.
  - Health check verification script.
- [x] **Prisma ORM & Relational Schema**
  - Strongly typed models: `Job`, `JobNote`, and `ExtractionCache`.
  - Automated database push and migration workflows.
  - Curated opportunity seed script (`prisma/seed.ts`).
- [x] **Jobs REST API Engine**
  - Full CRUD operations via `/api/jobs` and `/api/jobs/[id]`.
  - Cascading deletion for personal notes.
  - Two-way optimistic sync in web app store (`src/lib/job-store.tsx`) preserving instantaneous UI feedback.
- [x] **Server-Side DeepSeek AI & Extension Key Cleanup**
  - Elimination of client-side key drawer in extension popup for frictionless UX.
  - Server environment key enforcement (`.env.local`).
  - DeepSeek `json_object` format support (`deepseek-chat`).
- [x] **Direct Database Persistence & Centralized Environment Configuration**
  - Direct `POST /api/jobs` extension save pipeline into PostgreSQL with offline retry fallback.
  - Centralized `extension/config.js` resolving `NEXT_PUBLIC_API_URL` without hardcoded URLs.
  - Database-first web application store (`src/lib/job-store.tsx`) eliminating temporary storage divergence.
  - PostgreSQL-backed extraction cache (`src/lib/cache/prisma-store.ts`) via Prisma replacing ephemeral disk file cache.
  - Full automated validation in [extension-db-direct.spec.ts](tests/extension-db-direct.spec.ts).
- [x] **Continuous Integration & Automated Testing Pipeline (GitHub Actions)**
  - Fully containerized PostgreSQL service (`postgres:16-alpine`) in GitHub Actions workflow with health checks.
  - Automated Prisma schema synchronization (`npx prisma db push`) and seed population (`npm run db:seed`) prior to test execution.
  - Complete 52/52 Playwright E2E test suite execution with web server timeout safeguards, safe API body parsing, and explicit hydration synchronization in CI.

---

### Phase 7: Pipeline Velocity & Funnel Analytics View
- [ ] **Interactive Conversion Funnel**
  - Visual funnel graph: Wishlist -> Applied -> Screening -> Interviewing -> Offer.
  - Conversion percentage calculation between each stage.
- [ ] **Pipeline Velocity & Bottleneck Detection**
  - Average days spent in each stage (e.g., "Avg 14 days in Applied").
  - Stale application alerts (roles inactive for >14 days).
- [ ] **Salary Distribution & Benchmark Metrics**
  - Distribution visualizer showing user's target compensation vs market postings.
  - Highest, median, and average salary across active opportunities.
- [ ] **Skills Demand Breakdown**
  - Top 10 most demanded skills across all saved jobs.
  - Visual frequency chips (e.g. React: 80%, TypeScript: 75%, AWS: 50%).

---

### Phase 8: AI Resume Matcher & Skill Gap Analyzer
- [ ] **Resume Ingestion & Parsing**
  - Upload PDF/DOCX or paste resume raw text in Command Center Settings.
  - Extraction of candidate's skills, experience, and keywords into local profile.
- [ ] **Job-to-Resume Keyword Match Score**
  - Real-time compatibility score (0–100%) displayed on Job Cards and Detail Sheet.
  - "Strong Matches" list vs "Missing / Weakly Represented" list.
- [ ] **AI Tailored Bullet Point Generator**
  - Suggested resume bullet points tailored to the specific job description's keywords.
- [ ] **Cover Letter Outline Assistant**
  - Generates a customized 3-paragraph draft aligning candidate's skills with job requirements.

---

### Phase 9: Interview Workspace & Follow-Up Reminders
- [ ] **Interview Scheduler & Calendar Export**
  - Date and time picker for upcoming interviews in `JobDetailSheet`.
  - One-click `.ics` calendar file download for Google Calendar / Apple Calendar.
- [ ] **Automated Follow-Up Reminders**
  - 7-day rule reminder for applications sitting in `Applied` stage.
  - Post-interview thank-you note reminder (24 hours after scheduled interview).
- [ ] **Interview Workspace Tab**
  - Dedicated questions-to-ask-the-interviewer checklist.
  - Company research notes and interviewer background scratchpad.

---

### Phase 10: Multi-Tenant Cloud Auth, User Management & Complete Page Suite
- [ ] **Complete User Pages & Route Inventory**
  - **`/signup` (Sign Up Page):** Google OAuth, Email/Password registration, input validation, password strength indicator, and terms acceptance.
  - **`/login` (Sign In Page):** Google OAuth, Email/Password credentials, Magic Link option, "Remember Me", and links to `/forgot-password` and `/signup`.
  - **`/forgot-password` (Password Recovery Page):** Email input for reset token request, rate-limiting, and success confirmation state.
  - **`/reset-password` (New Password Page):** Secure token verification and new password confirmation form.
  - **`/verify-email` (Email Confirmation Page):** Verification status state for magic links and email confirmation links.
  - **`/onboarding` (Guided Welcome Wizard):** 2-step setup asking for target job roles and work arrangement (remote/hybrid/onsite) before routing to dashboard.
  - **`/account` & `/settings` (User Account Page):** Personal profile (name, avatar, email), password change form, target salary preferences, and account deletion safeguard.
  - **`/settings/billing` (Subscription & Billing Portal):** Current tier status (Free vs Pro), payment methods, and invoice history via Stripe.
  - **`/privacy` & `/terms` (Legal & Compliance Pages):** Privacy Policy and Terms of Service (mandatory for Google OAuth verification and Chrome Web Store publication).
- [ ] **Database Schema & ORM Setup**
  - PostgreSQL / Supabase schema (Users, Jobs, Stages, Skills, Notes, Activities).
  - Row Level Security (RLS) policies ensuring users only query and mutate their own opportunities.
- [ ] **Authentication Middleware & Session Management**
  - Next.js Edge Middleware route guarding (`/dashboard`, `/account`, `/settings` require authenticated session).
  - Secure HTTP-only cookies, JWT rotation, and session invalidation.
- [ ] **Extension-to-Backend Authentication Bridge**
  - Personal API token / session sharing so the Chrome Extension clips jobs straight into the authenticated user's cloud account.

---

### Phase 11: SaaS Monetization, Landing Page & Public Launch
- [ ] **Subscription & Tier Management (Stripe)**
  - Free Tier limits enforcement (up to 15 active jobs, basic clipper).
  - Premium Tier ($9–$14/month) checkout via Stripe Customer Portal.
  - Unlimited active jobs, AI resume matching, and deep analytics unlocks.
- [ ] **Public SaaS Marketing Landing Page**
  - Hero section featuring value proposition and interactive mini-board demonstration.
  - Feature highlights (One-Click Clipper, High-Density Table, Heuristic Parser).
  - Transparent pricing table and FAQ section.
- [ ] **SEO, Social Cards & Launch Readiness**
  - OpenGraph / Twitter preview cards and metadata.
  - Lighthouse performance & accessibility score of 95+.

---

## Update Protocol

Whenever you implement a feature or complete an OpenSpec change:
1. Mark the corresponding checkbox `[x]`.
2. Add links to relevant specification files or test files.
3. Update the **Overall Build Progress** summary table at the top.
4. If a new sub-requirement emerges, append it to the appropriate phase.
