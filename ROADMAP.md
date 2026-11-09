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
| **Phase 7** | Pipeline Velocity & Funnel Analytics | **Completed** (100%) | [pipeline-analytics](src/components/pipeline-analytics.tsx), [analytics-test](tests/pipeline-analytics.spec.ts) |
| **Phase 8** | AI Resume Matcher & Skill Gap Analyzer | **Planned** | Premium Layer |
| **Phase 9** | Interview Workspace & Follow-Up Reminders | **In Progress** (65%) | [interview-workspace](src/components/job-detail-sheet.tsx), [interview-test](tests/interview-workspace.spec.ts) |
| **Phase 10** | Backend, Auth & Full Page Suite (Login/Signup/Account) | **Planned** | MVP Week 4 |
| **Phase 11** | SaaS Monetization, Landing Page & Launch | **Planned** | Launch Week |

**Current Test Health:** 84/86 Playwright E2E tests passing (2 theme-toggle tests skipped in CI).

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
- [x] **HTML5 Drag-and-Drop & Same-Column Card Reordering**
  - Reorder and move cards across columns or within the same column with smooth drag states.
  - Precise insertion line indicators (`drop-indicator-before` / `drop-indicator-after`) showing exact drop position when dragging cards from bottom to top or top to bottom.
  - Automatic celebratory confetti explosion when dropping a card into `Offer`.
  - Validated in [drag-and-drop.spec.ts](tests/drag-and-drop.spec.ts).
- [x] **Keyboard-Only Spatial Navigation**
  - `]` advances active card to the next stage.
  - `[` moves active card to the previous stage.
- [x] **Card Hover Quick-Actions & Inline Quick Notes**
  - Linear-style action pill revealed on card hover/focus: 1-click stage advancement (`→`), direct link opening (`↗`), quick note editor (`✎`), and options dropdown (`⋮`).
  - Advancing cards to `Offer` via clicking advance button (`→`), keyboard shortcuts (`]`), or dropdown options triggers the unified milestone celebration: animated confetti burst and the personalized celebratory toast (`🎉 Huge Milestone: Offer Received! Congratulations on [Title] at [Company]!`), eliminating duplicate toast handlers.
  - Inline note input expands directly on the card with autofocus, <kbd>Enter</kbd> to save and <kbd>Esc</kbd> to dismiss without opening the slide-over sheet.
  - Validated in [drag-and-drop.spec.ts](tests/drag-and-drop.spec.ts).
- [x] **Quick Add Modal & Smart Extraction**
  - Heuristic parser extracting: Job Title, Company, Location, Salary Range, and Skill Chips.
  - Instant job creation with immediate store reflection.
- [x] **Desktop Kanban Horizontal Scroller (>= 1024px Viewport Safeguard)**
  - Dedicated horizontal scroll container (`data-testid="kanban-board-scroll-container"`) with custom subtle scrollbar styling (`custom-scrollbar`).
  - Enforces `min-w-[1300px]` across 5 columns (>= 240px per column) at `lg` breakpoint when the desktop sidebar is mounted, preventing squished cards, text clipping, and item overflow.
  - Seamless auto-centering via `scrollIntoView` when selecting stage filters/shortcuts.
  - Clean responsive stacking maintained on mobile/tablet viewports (< 1024px).
  - Drag-over clearance padding (`pt-3 -mt-3 px-1 -mx-1`) providing headroom inside the scroll container so columns scaling up and displaying highlight rings on drag-hover never clip at the top edge.
  - Validated in [url-routing-and-source-badges.spec.ts](tests/url-routing-and-source-badges.spec.ts).
- [x] **Job Detail Slide-Over Sheet (1.5× Expanded Width)**
  - Detailed view showing full job description, parsed skills, compensation, and link.
  - Widened drawer container (`max-w-3xl`, 768px, ~1.5× wider) for comfortable multi-paragraph reading with responsive mobile constraints.
  - Editable rich personal notes with timestamped updates.
- [x] **Job Source Brand Indicators & Minimalist Favicons**
  - Dynamic hostname-to-brand derivation (`src/lib/job-source.ts`) identifying platforms like LinkedIn, Indeed, JobStreet, Seek, Glassdoor, and custom career portals.
  - Minimalist favicon + brand text label (not a colored pill) integrated into JobCard footers, ApplicationsTable rows, and JobDetailSheet header.
  - Validated in [job-source.spec.ts](tests/job-source.spec.ts) and [url-routing-and-source-badges.spec.ts](tests/url-routing-and-source-badges.spec.ts).
- [x] **Error Safeguards & Safety**
  - Undo toast on card deletion with 5-second restore window.
  - Destructive delete confirmation modal in Detail Sheet.
  - Confirmation dialog before resetting demo state.

---

### Phase 3: Admin Shell & Power Navigation
- [x] **URL-Based View Routing & Deep Linking**
  - Dedicated App Router routes: `/board` (Pipeline Board), `/applications` (All Applications), `/analytics` (Funnel Analytics), and `/settings` (Command Center Settings), with root `/` redirecting to `/board`.
  - Next.js `<Link>` navigation with active view highlighting derived from `usePathname()`.
  - URL search parameter synchronization for query search (`q`) and stage filtering (`stage`), enabling shareable filtered URLs, bookmarking, and native browser back/forward history.
  - Validated in [admin-navigation.spec.ts](tests/admin-navigation.spec.ts) and [url-routing-and-source-badges.spec.ts](tests/url-routing-and-source-badges.spec.ts).
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
  - Clickable stage items in sidebar highlighting and filtering corresponding board column or table view via URL `stage` search parameter.
- [x] **Global Keyboard Shortcuts Cheatsheet Modal (`?` hotkey)**
  - Pressing `?` anywhere outside input fields opens the Linear-styled `<KeyboardShortcutsModal>`.
  - Structured keycap guide categorizing navigation (`/`, `?`, `[`, `]`, `Esc`), pipeline accelerators (`C`, `[`, `]`, drag-and-drop), and table triage controls.
  - Dedicated shortcuts trigger buttons in both TopContextBar and Sidebar footer for accessible non-keyboard discovery.
  - Fully validated in [keyboard-shortcuts.spec.ts](tests/keyboard-shortcuts.spec.ts).
- [x] **Data Backup & Demo Reset**
  - JSON data export downloading full opportunities database.
  - Demonstration reset restoring curated sample dataset.
- [x] **Linear-Grade Command Palette (<kbd>⌘K</kbd> / <kbd>Ctrl+K</kbd>)**
  - Spotlight modal with real-time fuzzy filtering across navigation routes, high-priority actions, and tracked job opportunities.
  - Full keyboard control (<kbd>↑</kbd> / <kbd>↓</kbd> / <kbd>Enter</kbd> / <kbd>Esc</kbd>) with looping selection and mouse hover synchronization.
  - Direct deep-links to slide-over `JobDetailSheet` for any matched role, instant view switching (`/board`, `/applications`, `/analytics`, `/settings`), theme toggling, quick add opening, and data backup triggers.
  - Dedicated trigger button in TopContextBar displaying `<kbd>⌘K</kbd>`.
  - Fully validated in [command-palette.spec.ts](tests/command-palette.spec.ts).

---

### Phase 4: High-Density Interactive Applications Table
- [x] **High-Density Linear Tabular Layout**
  - Clean table presenting Title, Company, dedicated Source column (with brand favicon & label), Stage, Compensation, Location, Skills, and Actions.
  - Subtle row hover highlights and hairline dividers.
- [x] **Multi-Column Sorting**
  - Three-state sorting (asc, desc, neutral) across Role, Company, Source, Stage, and Salary.
  - Visual sort indicator icons with active column highlighting.
- [x] **In-line Stage Selector Dropdown**
  - Portaled dropdown menu directly in each table row.
  - Instant stage transition with matching badge styling and toast confirmation.
  - No horizontal scrolling regression or layout overflow.
- [x] **Multi-Row Batch Actions**
  - Row checkboxes and "Select All" header checkbox.
  - Floating batch action toolbar for bulk transitioning selected jobs to any stage.
  - Selection count and bulk clear trigger.
  - Destructive batch delete action with Linear-styled `<Dialog>` confirmation and 6-second Undo toast restoration.
- [x] **Responsive Mobile Stacked Card-List**
  - Automatic transformation into touch-friendly stacked card list on mobile screens (<768px).
  - Retains in-row stage dropdown and click-to-open sheet trigger.
- [x] **Row Click Detail Sheet**
  - Clicking any table row opens the slide-over `JobDetailSheet`.
- [x] **Full-Width Viewport Container Expansion (`w-full`)**
  - Removed artificial page-width constraints (`max-w-7xl`, `max-w-[1600px]`, `max-w-4xl`) across `/applications`, `/analytics`, `/board`, and `/settings`.
  - Page content containers now span the full viewport width (`w-full`) with balanced padding (`p-4 sm:p-6`), eliminating awkward gutters and enabling high-density data display on large displays.
- [x] **Table J/K Keyboard Navigation & Quick Selection**
  - Linear-grade keyboard spatial navigation across `/applications`: `J` / `ArrowDown` and `K` / `ArrowUp` to navigate rows with automatic smooth scrolling into view.
  - Distinct active row visual indicator (`data-focused`, primary focus bar and subtle surface lift).
  - Quick multi-row selection via `X` or `Space`, instantly invoking the floating batch action toolbar.
  - `Enter` accelerator to immediately open the 1.5× wide `JobDetailSheet` for the focused role.
  - Full keyboard shortcuts discovery integration in `KeyboardShortcutsModal` (`?` cheatsheet) and header badge cues.
  - Validated in [applications-table.spec.ts](tests/applications-table.spec.ts) and [keyboard-shortcuts.spec.ts](tests/keyboard-shortcuts.spec.ts).

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
  - Full automated validation in [extension-db-direct.spec.ts](tests/extension-db-direct.spec.ts).
- [x] **Continuous Integration & Automated Testing Pipeline (GitHub Actions)**
  - Fully containerized PostgreSQL service (`postgres:16-alpine`) in GitHub Actions workflow with health checks.
  - Automated Prisma schema synchronization (`npx prisma db push`) and seed population (`npm run db:seed`) prior to test execution.
  - Complete 52/52 Playwright E2E test suite execution with web server timeout safeguards, safe API body parsing, and explicit hydration synchronization in CI.
- [x] **Pure PostgreSQL Database-Driven Data Layer (Elimination of Mock Data)**
  - Completely purged hardcoded client mock job dataset (`SEED_JOBS`) from [job-store.tsx](src/lib/job-store.tsx).
  - Web application pages (`/board`, `/applications`, `/analytics`, `/settings`) now load authoritatively from PostgreSQL via `/api/jobs` without client-side mock fallbacks.
  - Initial/unhydrated state defaults cleanly to an empty set (`EMPTY_JOBS`), rendering native Linear empty states when the database is empty.
  - Local optimistic state and clipper sync events (`jobclippy:synced`) cleanly merge with incoming database payloads without data wiping or race conditions.
  - Database re-seeding handled strictly through PostgreSQL Prisma seeder ([seed.ts](prisma/seed.ts)) and dedicated seeder endpoint ([reset/route.ts](src/app/api/jobs/reset/route.ts)).
  - Validated across all 76 E2E tests including [extension-db-direct.spec.ts](tests/extension-db-direct.spec.ts) and [drag-and-drop.spec.ts](tests/drag-and-drop.spec.ts).
- [x] **Database-Backed Card Ordering & Pure In-Memory Single Source of Truth (Ghost Job Purge)**
  - Added `position Float @default(0)` with index `[stage, position]` in `prisma/schema.prisma` and updated `prisma/seed.ts` and `reset/route.ts` with spaced initial positions (`index * 1000.0`).
  - Completely eliminated `localStorage` caching of jobs (`STORAGE_KEY = "jobclippy_jobs_v1"`), removing the local-only resurrection loop that caused ghost jobs and cross-browser divergence.
  - Updated [job-store.tsx](src/lib/job-store.tsx) to maintain jobs strictly in React in-memory state initialized directly from `GET /api/jobs`.
  - Implemented fractional position calculations in `reorderJob`, persisting stage and card position to `PATCH /api/jobs/[id]`.
  - Decoupled [bridge.js](extension/content/bridge.js) from `localStorage` to notify the dashboard via in-memory events without writing to client storage.
  - Preserved non-job UI preferences (`jobclippy_sidebar_collapsed_v1` and dark/light mode) in `localStorage`.
  - Validated with cross-browser multi-session isolation tests in [extension-db-direct.spec.ts](tests/extension-db-direct.spec.ts) and [drag-and-drop.spec.ts](tests/drag-and-drop.spec.ts).

---

### Phase 7: Pipeline Velocity & Funnel Analytics View
- [x] **Interactive Stepped Conversion Funnel**
  - Visual funnel graph: `Wishlist (Saved)` -> `Applied (Submitted)` -> `Interviewing (Screens & Loops)` -> `Offer (Negotiations)`.
  - Proportional stage width bars colored with Linear stage tokens.
  - Step-by-step through-rates and drop-off diagnosis connectors between stages.
  - Direct deep-link filtering into `/applications?stage={stageId}` from each funnel step.
- [x] **Executive Conversion & Velocity Metrics**
  - High-impact KPI tiles: Wishlist Conversion Rate, Screen & Loop Rate, Offers Received, and Total Offer Yield.
  - Overall pipeline velocity percentage tracker.
- [x] **Channel Attribution & Source Yield Breakdown**
  - Aggregation by job board/platform (LinkedIn, Indeed, JobStreet, Seek, Direct Portals).
  - Minimalist brand favicons, volume shares, and active offer count per source.
- [x] **Candidate Momentum & Pipeline Health Checklist**
  - Contextual advice cards for active negotiations, in-review follow-ups, and target wishlist triage.
  - Fully validated in [pipeline-analytics.spec.ts](tests/pipeline-analytics.spec.ts).

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
- [x] **Interview Scheduler, Countdown Badges & 1-Click Calendar Sync**
  - Native datetime picker for upcoming technical screens and round schedules in `JobDetailSheet`.
  - Dynamic countdown badges on Kanban card footers (`JobCard`) and Applications Table rows (`ApplicationsTable`) indicating interview proximity ("Today", "Tomorrow", "In X days", or scheduled date).
  - 1-Click Google Calendar event generator with pre-filled title, location, and description query parameters.
  - RFC 5545 standard `.ics` calendar file download (`downloadICalFile`) for Apple Calendar, Outlook, and Google Calendar.
  - Fully validated in [interview-workspace.spec.ts](tests/interview-workspace.spec.ts).
- [x] **Opportunity Activity Timeline & Audit Trail**
  - Chronological vertical hairline audit trail in `JobDetailSheet` tracking lifecycle milestones (`Opportunity Saved`, `Application Submitted`, `Interview Scheduled`, `Offer Received`, and `Archived`).
  - Milestone icons, timestamp formatting, and event counter badge.
  - Seamless real-time personal note logging appended directly to the top of the timeline.
  - Fully validated in [interview-workspace.spec.ts](tests/interview-workspace.spec.ts).
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
