# Design

## Context

See `proposal.md` for motivation and background. The repository is initialized with Next.js 16 App Router, React 19, Tailwind CSS v4, and shadcn (`base-nova` style configuration with Lucide icons).

## Goals / Non-Goals

**Goals:**
- Deliver a modern, visually stunning Job Hunt Command Center dashboard with dark/light mode theming.
- Implement a 5-stage Kanban board (`Wishlist`, `Applied`, `Interviewing`, `Offer`, `Archived`) with real-time stage updates, search, and skill filtering.
- Implement an intelligent parsing utility for extracting salaries and technical skill badges from raw job postings.
- Build a slide-over/modal detail drawer for viewing full job specs, managing personal notes, and direct job links.
- Implement end-to-end Playwright tests covering theming, job pipeline flows, and filtering.

**Non-Goals:**
- Backend database or external cloud sync (state is persisted via reactive local storage and initialized with realistic sample data).
- Chrome Web Store packaging or Manifest V3 build bundle (scoped for browser extension companion phase).

## Decisions

### 1. Theming Architecture
- **Decision**: Use `next-themes` with `attribute="class"` and CSS variable tokens.
- **Rationale**: Provides SSR-safe, zero-flicker dark/light toggling that seamlessly works with Tailwind v4 `@theme` and shadcn tokens.
- **Alternatives Considered**: Custom React context with manual DOM manipulation (prone to hydration mismatches).

### 2. State & Persistence Architecture
- **Decision**: Client-side Job Store Provider with `localStorage` persistence and rich seed data.
- **Rationale**: Enables instant latency-free UI updates, offline usability, and deterministic Playwright test automation without requiring external database dependencies.
- **Alternatives Considered**: In-memory state only (loses data on page reload).

### 3. Smart Extraction Engine
- **Decision**: Heuristic rule-based token and pattern parser for compensation ($Xk–$Yk, hourly, annual ranges) and tech skills (languages, frameworks, cloud tools).
- **Rationale**: Fast, private, client-side capable, and deterministic without requiring external paid API calls or latency.

### 4. End-to-End Testing with Playwright
- **Decision**: Dedicated E2E test suite in `tests/` asserting critical user paths: theme toggle, job creation, stage progression, detail inspection, and search filtering.
- **Rationale**: Validates complete user experience in realistic browser environments.

## Risks / Trade-offs

- *[Risk]* Next.js 16 / React 19 hydration mismatch with theme or localStorage → *Mitigation*: Mount guard pattern in theme switcher and state initialization hooks.
- *[Risk]* Complex Kanban drag-and-drop mobile quirks → *Mitigation*: Support both drag interactions and accessible single-click stage selector dropdowns on cards.
