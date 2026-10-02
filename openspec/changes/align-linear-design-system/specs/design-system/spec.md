# Spec Delta

## Purpose

Enforces the Linear design system tokens, surface elevation ladder, typography hierarchy, and spacing constraints across the entire application interface, guaranteeing zero off-spec styling values.

## ADDED Requirements

### Requirement: Surface Elevation and Color Tokens
The application SHALL render page backgrounds using Canvas (`#010102`) and elevated containers using the four-step surface ladder (`surface-1`, `surface-2`, `surface-3`, `surface-4`), with hairline borders (`#23252a` or approved hairline variants) and Linear lavender-blue (`#5e6ad2`) as the sole chromatic primary accent.

#### Scenario: Visual surface layering
- **WHEN** the dashboard page renders
- **THEN** the root background uses Canvas `#010102`, cards and panels use `surface-1`, hover and lifted states use `surface-2`, and borders use `hairline` `#23252a` without drop shadows

#### Scenario: Primary accent application
- **WHEN** interactive primary actions or focus outlines are displayed
- **THEN** primary buttons and focus rings render with lavender-blue `#5e6ad2`, hover states use `#828fff`, and focus rings use `#5e69d1`

### Requirement: Responsive Kanban Card Component
The Job Card component SHALL render strictly inside a `surface-1` container with `rounded.lg` (12px) corners, 1px `hairline` border, approved typography tokens (`card-title` 22px/500, `body-sm` 14px/400, `caption` 12px/400), and approved spacing without any unapproved fonts, colors, or padding values.

#### Scenario: Rendering Kanban Job Card
- **WHEN** a job is displayed on the Kanban board
- **THEN** the card renders within a `surface-1` background, 1px hairline border, 12px border radius, and approved typography and padding tokens

#### Scenario: Hovering Kanban Job Card
- **WHEN** user hovers over a job card
- **THEN** the card background lifts to `surface-2` with `hairline-strong` border transition and no drop shadow

### Requirement: Strict Spacing Scale and Border Radii
All layout containers, cards, buttons, badges, and form inputs SHALL strictly conform to the 4px base spacing scale (`xxs: 4px`, `xs: 8px`, `sm: 12px`, `md: 16px`, `lg: 24px`, `xl: 32px`, `xxl: 48px`, `section: 96px`) and the approved border radius scale (`xs: 4px`, `sm: 6px`, `md: 8px`, `lg: 12px`, `xl: 16px`, `pill: 9999px`).

#### Scenario: Spacing token verification
- **WHEN** any button, input, or card is styled
- **THEN** its padding, gap, and margins map exclusively to approved spacing tokens (e.g. 8px vertical / 14px horizontal for buttons, 8px vertical / 12px horizontal for inputs, 24px for card padding)

### Requirement: Site-Wide Prohibition of Off-Spec Values
The application SHALL NOT use any arbitrary color hex codes, atmospheric background gradients, spotlight card effects, saturated secondary chromatic accents (such as blue/green/amber/sky column borders), or ad-hoc typography sizes (e.g., `text-[11px]`, `text-[10px]`).

#### Scenario: Clean pipeline column styling
- **WHEN** the 5-column Kanban board renders
- **THEN** column headers and tracks use neutral hairline borders and ink hierarchy rather than saturated rainbow column top-borders
