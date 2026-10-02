# Design

## Context

See `proposal.md` for motivation and background. The repository is built with Next.js 16 App Router, React 19, Tailwind CSS v4, and shadcn UI primitives. The root `design.md` establishes the authoritative Linear design specifications:
- Canvas: `{colors.canvas}` `#010102`
- Surface ladder: `{colors.surface-1}`, `{colors.surface-2}`, `{colors.surface-3}`, `{colors.surface-4}`
- Hairline borders: `{colors.hairline}` `#23252a`, `{colors.hairline-strong}`, `{colors.hairline-tertiary}`
- Accent: Lavender-Blue `{colors.primary}` `#5e6ad2`, Hover `#828fff`, Focus `#5e69d1`
- Text: Ink `#f7f8f8`, Ink Muted `#d0d6e0`, Ink Subtle `#8a8f98`, Ink Tertiary `#62666d`
- Semantic: Success Green `{colors.semantic-success}` `#27a644`
- Radius scale: `xs: 4px`, `sm: 6px`, `md: 8px`, `lg: 12px`, `xl: 16px`, `pill: 9999px`
- Spacing scale: 4px base (`xxs: 4px`, `xs: 8px`, `sm: 12px`, `md: 16px`, `lg: 24px`, `xl: 32px`, `xxl: 48px`, `section: 96px`)

## Goals / Non-Goals

**Goals:**
- Translate Linear's exact color tokens, surface ladder, spacing scale, and typography tokens into Tailwind v4 theme variables in `globals.css`.
- Rebuild `JobCard` to strictly use `{colors.surface-1}`, `{colors.surface-2}` on hover, 1px `{colors.hairline}`, 12px border radius, and approved typography/padding tokens without any unauthorized styling.
- Refactor all site-wide UI primitives (`Button`, `Badge`, `Input`, `Dialog`, `Sheet`, `DropdownMenu`) and layout wrappers (`KanbanBoard`, headers, stats) to adhere to the Linear design rules.
- Eliminate all ad-hoc arbitrary values (e.g. `text-[11px]`, `text-[10px]`, `p-[...]`, `border-t-sky-500`, etc.).

**Non-Goals:**
- Light mode redesign (as explicitly instructed in `design.md`: "Don't ship a light-mode marketing page. Canvas is #010102."). The dark canvas is the authoritative anchor surface.
- Adding arbitrary rainbow tag colors or atmospheric gradient backgrounds.

## Decisions

### 1. Tailwind v4 Theme Token Bridge
- **Decision**: Define CSS custom properties in `src/app/globals.css` that exactly map to Linear tokens:
  - `--canvas: #010102`
  - `--surface-1: #0f1015` (surface level 1)
  - `--surface-2: #181920` (surface level 2 / hover)
  - `--surface-3: #22242c` (surface level 3 / menus)
  - `--surface-4: #2c2e38` (deepest lifted surface)
  - `--hairline: #23252a`
  - `--hairline-strong: #32353e`
  - `--primary: #5e6ad2`
  - `--primary-hover: #828fff`
  - `--primary-focus: #5e69d1`
  - `--ink: #f7f8f8`
  - `--ink-muted: #d0d6e0`
  - `--ink-subtle: #8a8f98`
  - `--ink-tertiary: #62666d`
  - `--semantic-success: #27a644`
- **Rationale**: Bridges shadcn semantic variables (`--background`, `--card`, `--border`, `--primary`, `--foreground`) directly to Linear's tokens, ensuring consistency across all components.
- **Alternatives Considered**: Direct hardcoded hex codes in classNames (violates modularity and maintainability).

### 2. Kanban Card Structural Alignment
- **Decision**: Rebuild `JobCard` with:
  - Container: `bg-[var(--surface-1)] hover:bg-[var(--surface-2)] border border-[var(--hairline)] hover:border-[var(--hairline-strong)] rounded-[12px] p-6 (24px) or calibrated compact metrics`.
  - Title: `text-ink font-medium tracking-tight text-[16px]` or `card-title (22px, weight 500)`.
  - Meta/Subtext: `text-ink-muted text-sm` and `caption (12px)`.
  - Badges/Chips: `rounded-xs (4px)` or `rounded-sm (6px)` using `surface-2` or `semantic-success`.
  - No drop shadow (`shadow-none`), relying strictly on hairline borders and surface ladder lift.
- **Rationale**: Exactly mirrors Linear's card specifications and Do's/Don'ts.

### 3. Site-Wide Primitives Normalization
- **Decision**:
  - `button-primary`: `bg-primary hover:bg-primary-hover active:bg-primary-focus text-white px-3.5 py-2 rounded-md font-medium text-sm`.
  - `button-secondary`: `bg-surface-1 border border-hairline text-ink hover:bg-surface-2 px-3.5 py-2 rounded-md font-medium text-sm`.
  - `button-tertiary`: `bg-transparent text-ink hover:bg-surface-1 px-3.5 py-2 rounded-md font-medium text-sm`.
  - `text-input`: `bg-surface-1 border border-hairline focus:outline-primary-focus focus:outline-2 px-3 py-2 rounded-md text-ink text-sm`.
  - `status-badge`: `bg-surface-2 text-ink-muted px-2 py-0.5 rounded-full text-xs font-normal`.

## Risks / Trade-offs

- *[Risk]* Hardcoded saturated stage colors in Kanban board (`border-t-sky-500`, etc.) currently convey status at a glance.
  → *Mitigation*: Replace colored top-borders with Linear's subtle hairline styling and use Linear's status badge pattern (`status-badge` on `surface-2` with `ink-muted`/`semantic-success`) for stage indicators.
- *[Risk]* Existing Playwright tests might assert on old class names or color properties.
  → *Mitigation*: Maintain all `data-testid` attributes intact and verify test suite passes after the refactor.
