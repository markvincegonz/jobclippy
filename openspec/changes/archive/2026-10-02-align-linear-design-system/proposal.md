# Proposal

## Why

The current web app UI uses a mix of default Tailwind and shadcn styling tokens, ad-hoc font sizes (such as `text-[11px]`), uncalibrated padding spacings, and mismatched color accents. To establish a world-class, premium user experience, the entire website must strictly conform to the official Linear design specification defined in `design.md`. Adhering to these exact color tokens, surface elevation ladder, typography hierarchy, and spacing constraints ensures visual cohesion and eliminates arbitrary design leaks across all components, starting with the core Kanban job card and extending through the complete dashboard shell.

## What Changes

- **Strict Token Foundation**: Configure Tailwind CSS variables to strictly map to Linear's color tokens (`canvas`, `surface-1` through `surface-4`, `hairline` variants, `ink` scales, and `primary` lavender-blue `#5e6ad2`) and spacing scale (4px base unit).
- **Responsive Kanban Card Overhaul**: Re-architect `JobCard` to strictly use `{colors.surface-1}`, `{colors.surface-2}` for hover, `{colors.hairline}`, approved typography, and exact padding (`{spacing.lg}` / 24px or compact card metrics) with zero unauthorized styles.
- **Site-Wide Component Alignment**: Audit and align all interactive components (`Button`, `Badge`, `Card`, `Dialog`, `Sheet`, `DropdownMenu`, `Input`) to match Linear's button variants (`button-primary`, `button-secondary`, `button-tertiary`), input specs, and chip rules.
- **Dashboard Shell & Kanban Board Cleanup**: Replace hardcoded column border accents (e.g. `border-t-sky-500`, `border-t-amber-500`) with approved surface/hairline treatments, status badges, and typography scales.
- **Strict Prohibition of Off-Spec Values**: Disallow arbitrary color hexes, unapproved font sizes, atmospheric gradients, and padding values not defined in `design.md`.

## Capabilities

### New Capabilities
- `design-system`: Defines and enforces the Linear design system tokens, surface ladder, typography hierarchy, spacing scale, and component constraints across the application.

### Modified Capabilities
<!-- None: no existing root specs are in openspec/specs -->

## Impact

- **Affected Code**: `src/app/globals.css`, `src/components/job-card.tsx`, `src/components/kanban-board.tsx`, `src/components/quick-add-modal.tsx`, `src/components/job-detail-sheet.tsx`, `src/components/theme-toggle.tsx`, and `src/components/ui/*` primitives.
- **Dependencies**: Uses Tailwind CSS v4 and existing font setup (`SF Pro Display` / `Inter` fallback).
- **Visual & Layout Breaking Changes**: Eliminates saturated multi-color borders and bright ambient gradients in favor of the dark-canvas four-step surface ladder and lavender-blue accent.
