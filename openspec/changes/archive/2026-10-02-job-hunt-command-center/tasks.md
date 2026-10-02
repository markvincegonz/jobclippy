# Tasks

## 1. Setup & Theming Foundation

- [x] 1.1 Install `next-themes` and configure ThemeProvider in root layout with dark/light CSS variables and verify server build succeeds
- [x] 1.2 Build ThemeToggle component with Lucide sun/moon indicators and verify theme switches seamlessly between light and dark


## 2. Smart Extractor & State Persistence

- [x] 2.1 Implement salary detection and skill extraction heuristic parser in `src/lib/extractor.ts` and verify with sample job postings
- [x] 2.2 Create job store context with `localStorage` persistence and realistic seed data in `src/lib/job-store.tsx`


## 3. UI Components & Command Center Dashboard

- [x] 3.1 Scaffold required shadcn UI components (Card, Badge, Dialog, Sheet, DropdownMenu, Tabs, Input, Textarea, Tooltip) in `src/components/ui/`
- [x] 3.2 Build `JobCard` component displaying title, company, location, salary badge, skill chips, and stage action menu
- [x] 3.3 Build 5-column Kanban board (`Wishlist`, `Applied`, `Interviewing`, `Offer`, `Archived`) with summary metrics bar, search, and skill filtering
- [x] 3.4 Build `JobDetailSheet` component with full job description, extracted skills, notes log, and direct job link
- [x] 3.5 Build `QuickAddModal` / Job Capture dialog utilizing the smart extractor for instant capture simulation


## 4. Playwright End-to-End Testing

- [x] 4.1 Create Playwright E2E test in `tests/theme.spec.ts` verifying theme switching and persistence
- [x] 4.2 Create Playwright E2E test in `tests/job-lifecycle.spec.ts` validating adding a job, moving stages, editing notes, and search filtering
- [x] 4.3 Run full test suite with `npm run test:e2e` and verify all tests pass

