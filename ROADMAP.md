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
| **Phase 5** | Browser Extension (MV3 Universal Clipper) | **Planned / Ready to Start** | MVP Week 2 |
| **Phase 6** | Pipeline Velocity & Funnel Analytics | **Planned** | MVP Week 3 |
| **Phase 7** | AI Resume Matcher & Skill Gap Analyzer | **Planned** | Premium Layer |
| **Phase 8** | Interview Workspace & Follow-Up Reminders | **Planned** | Assistant Layer |
| **Phase 9** | Backend Infrastructure, Auth & Onboarding | **Planned** | MVP Week 4 |
| **Phase 10** | SaaS Monetization, Landing Page & Launch | **Planned** | Launch Week |

**Current Test Health:** 22/22 Playwright E2E tests passing.

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

### Phase 5: Browser Extension (MV3 Universal Clipper) — Next Phase
- [ ] **Manifest V3 Chrome Extension Package (`extension/`)**
  - Background service worker, popup HTML/CSS/JS, and manifest declaration.
- [ ] **Site-Specific Job DOM Parsers**
  - LinkedIn Job Posting extractor (Title, Company, Location, Description, Salary).
  - Indeed Job Posting extractor.
- [ ] **Universal "Highlight-to-Clip" Fallback**
  - Right-click context menu "Save Highlighted Job to JobClippy".
  - Content script extraction of user-highlighted text on any company career page.
- [ ] **Quick Popup Interface**
  - Pre-filled preview card with detected attributes.
  - One-click "[ Save Job ]" button with instant checkmark feedback.
- [ ] **Data Sync Bridge**
  - Web message / Chrome Storage sync to JobClippy web application.
  - Optional clip import JSON endpoint / direct local store connection.

---

### Phase 6: Pipeline Velocity & Funnel Analytics View
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

### Phase 7: AI Resume Matcher & Skill Gap Analyzer
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

### Phase 8: Interview Workspace & Follow-Up Reminders
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

### Phase 9: Backend Infrastructure, Authentication & User Management
- [ ] **Database Schema & ORM Setup**
  - PostgreSQL / Supabase schema (Users, Jobs, Stages, Skills, Notes, Activities).
  - Row Level Security (RLS) policies ensuring users only query and mutate their own opportunities.
- [ ] **Authentication System (Login & Sign Up)**
  - Google OAuth integration ("Continue with Google").
  - Magic Link / Email & Password sign-up and login flows.
  - Session handling, JWT/refresh tokens, and protected dashboard middleware.
  - Password reset and account verification workflows.
- [ ] **Extension-to-Backend Authentication Bridge**
  - Personal API token / session sharing so the Chrome Extension clips jobs straight into the authenticated user's cloud account.
- [ ] **User Onboarding Flow (Fast 2-Step)**
  - Step 1: Target role selector (Software Engineering, Design, Product, Marketing, Sales, Data, etc.).
  - Step 2: Preferred work arrangement (Remote, Hybrid, On-site, Flexible).
  - Option to start with curated seed opportunities or an empty workspace.
  - Instant transition into the personalized dashboard.
- [ ] **User Profile & Account Settings**
  - Profile preferences (target compensation range, preferred locations).
  - Account security (change email, export all account data, delete account).

---

### Phase 10: SaaS Monetization, Landing Page & Public Launch
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
