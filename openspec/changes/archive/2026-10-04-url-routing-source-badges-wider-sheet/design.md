# Design

## Context

The current JobClippy application renders all views (`board`, `table`, `analytics`, `settings`) in a single client component (`Home` in `src/app/page.tsx`) with an internal `useState` toggle. This prevents direct deep-linking, breaks browser history navigation (back/forward), and prevents filter bookmarking.

Additionally, jobs clipped from LinkedIn, Indeed, JobStreet, and other sources only display the raw URL (or none at all) inside the detail sheet, without immediate visual source identification on cards or table rows. Lastly, the job detail slide-over drawer is constrained to `max-w-xl` (576px), which is cramped for reading multi-paragraph job specifications and review notes.

See `proposal.md` for user context and motivation.

## Goals / Non-Goals

**Goals:**
- Implement Next.js App Router sub-routes (`/board`, `/applications`, `/analytics`, `/settings`) with root `/` redirecting to `/board`.
- Lift global providers (`JobStoreProvider`, `ToastProvider`) to the root layout so store cache and optimistic state persist seamlessly across page navigations.
- Store search query (`q`) and stage filter (`stage`) in URL search parameters to enable bookmarking, refreshing, and shareable filtered views.
- Extract job posting brand and favicon from the existing `url` field using a pure domain mapping utility (`src/lib/job-source.ts`).
- Render source indicators using a minimalist favicon + text label design pattern (avoiding loud/colored pills) across Kanban cards, Table rows, and the Detail sheet.
- Widen the slide-over detail drawer to 1.5× width (`max-w-3xl`, 768px) with mobile-responsive constraints.

**Non-Goals:**
- Adding backend database migrations or modifying the Prisma schema (the existing `url` string field is sufficient; brand is derived dynamically).
- Storing personal notes in URL params.
- Overhauling analytics or settings views beyond routing them to `/analytics` and `/settings`.

## Decisions

### Decision 1: Next.js App Router Structure & Shared Layout

- **Choice:** Maintain a shared shell layout (`src/components/admin-shell.tsx`) while distributing page contents into standard Next.js App Router directories:
  - `src/app/page.tsx` — Redirects immediately to `/board`.
  - `src/app/board/page.tsx` — Renders the Kanban Board.
  - `src/app/applications/page.tsx` — Renders the High-Density Table.
  - `src/app/analytics/page.tsx` — Renders Funnel & Velocity Analytics.
  - `src/app/settings/page.tsx` — Renders Settings & Backup.
- **Provider Placement:** `JobStoreProvider` and `ToastProvider` reside in a top-level client provider wrapper in `src/app/layout.tsx`. This avoids re-instantiating the store or dropping in-memory optimistic updates when navigating between `/board` and `/applications`.
- **Alternatives Considered:**
  - *Dynamic route `src/app/[view]/page.tsx`:* Rejected because static type-checking and distinct page metadata are cleaner with explicit route directories.
  - *Keep single page with Next.js shallow routing / hash routes (`/#board`):* Rejected because user explicitly requested real path routes (`/board`, `/applications`).

### Decision 2: URL Search Param Synchronization for Filters

- **Choice:** Synchronize `q` (search query) and `stage` (stage filter) using Next.js `useRouter()`, `usePathname()`, and `useSearchParams()`.
  - Reading: Views read `searchParams.get("q") || ""` and `searchParams.get("stage") || null`.
  - Writing: Navigating or changing search debounces/pushes or replaces the current URL query string using `router.replace(`${pathname}?${params.toString()}`)`.
  - Clear actions: Clicking clear stage filter removes the `stage` param while preserving `q`.
- **Alternatives Considered:**
  - *Storing filters in `localStorage`:* Rejected because local storage breaks browser back/forward history and shareable URLs.

### Decision 3: Job Source Derivation & Minimalist Favicon Display

- **Choice:** Create `src/lib/job-source.ts` with a domain mapping dictionary:
  - Known platforms:
    - LinkedIn: `linkedin.com`
    - Indeed: `indeed.com`, `*.indeed.com`
    - JobStreet: `jobstreet.com`, `*.jobstreet.com`
    - Seek: `seek.com`, `*.seek.com`, `seek.com.au`
    - Glassdoor: `glassdoor.com`, `*.glassdoor.com`
    - GitHub: `github.com`
    - Wellfound: `wellfound.com`, `angel.co`
  - Fallback: Any other valid domain extracts the root domain (e.g. `careers.google.com` → `google.com`).
  - Favicon resolution: `https://www.google.com/s2/favicons?domain=${domain}&sz=32` with an `onError` state falling back to a clean Lucide `Globe` icon.
  - Presentation: Clean 14×14 / 16×16 favicon with subtle brand text label (`text-xs text-ink-muted`), without loud colored backgrounds or pill borders, matching Linear's subdued dark-canvas typography.
- **Alternatives Considered:**
  - *Colored badge pills:* Explicitly rejected by user ("Not colored pill. Use favicon + textlabel").
  - *Bundled local SVG logos for every site:* Rejected due to maintenance overhead; Google's Favicon service automatically handles known and unknown company career domains with high reliability.

### Decision 4: Job Detail Drawer Expansion (1.5×)

- **Choice:** Update `src/components/ui/sheet.tsx` panel container from `max-w-xl` (36rem / 576px) to `max-w-3xl` (48rem / 768px), and ensure `w-screen max-w-3xl max-w-full` responsiveness.
- **Alternatives Considered:**
  - *Modal dialog instead of sheet:* Rejected because user explicitly specified widening the drawer/sheet.
  - *Resizable split pane:* Rejected as over-engineered for a drawer view; 1.5× flat width provides ample breathing room for notes, skills, and full markdown descriptions.

## Risks / Trade-offs

- **[Risk] Existing Playwright E2E tests expect `/` with internal view switching:**
  → *Mitigation:* Ensure `/` redirects cleanly to `/board` (status 307 or client redirect), and update tests to verify navigation to `/board` and `/applications`. Sidebar clicks will now perform Next.js client-side navigation.
- **[Risk] Favicon images failing to load or flashing broken image icons:**
  → *Mitigation:* Use an `<img onError={...} />` handler that toggles to a clean Lucide `Globe` fallback icon seamlessly.
- **[Risk] URL search param updates causing input lag during fast typing in search box:**
  → *Mitigation:* Keep local input state responsive in the search bar and update the router query params debounced or on blur/enter, or use React 19 `useTransition` when updating URL parameters.

## Migration Plan

1. Create `src/lib/job-source.ts` and `src/components/job-source-badge.tsx`.
2. Update `src/components/ui/sheet.tsx` width from `max-w-xl` to `max-w-3xl`.
3. Wrap providers (`JobStoreProvider`, `ToastProvider`) in a reusable client provider or in `src/app/layout.tsx`.
4. Create route folders:
   - `src/app/board/page.tsx`
   - `src/app/applications/page.tsx`
   - `src/app/analytics/page.tsx`
   - `src/app/settings/page.tsx`
5. Update `src/app/page.tsx` to redirect to `/board`.
6. Update `src/components/sidebar.tsx` and `src/components/admin-shell.tsx` to use Next.js `<Link>` elements and read active route from `usePathname()`.
7. Add `JobSourceBadge` to `JobCard`, `ApplicationsTable`, and `JobDetailSheet`.
8. Update and verify Playwright E2E tests.
