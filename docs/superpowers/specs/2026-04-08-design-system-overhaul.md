# Design System Overhaul — BMW-Inspired

> **For agentic workers:** This spec defines a visual redesign of Haushalt Quest, applying BMW CI2020 design principles adapted for a gamified household app.

**Goal:** Replace the current ad-hoc styling (hardcoded Tailwind colors, inconsistent component usage, Inter font) with a cohesive, BMW-inspired design system built on CSS variables, Space Grotesk, and strict visual hierarchy.

**Approach:** Adapt BMW principles (precision typography, single-accent strategy, minimal shadows, tight spacing) while preserving the gamification personality (emojis, semantic colors for health/streaks/achievements).

---

## 1. Typography

### Font

**Space Grotesk** from Google Fonts, loaded via `next/font/google`. Replaces Inter. Remove unused Geist font files.

Weights loaded: **300** (Light), **400** (Regular), **700** (Bold).

### Hierarchy

| Role | Size | Weight | Line-Height | Extras |
|------|------|--------|-------------|--------|
| Display (page titles) | 28px / 1.75rem | 300 | 1.20 | `text-transform: uppercase`, `letter-spacing: 0.5px` |
| Section Heading | 18px / 1.125rem | 700 | 1.30 | — |
| Nav Active | 13–14px | 700 | 1.30 | Accent color |
| Body | 15–16px / 1rem | 400 | 1.15 | — |
| Button | 13–14px | 700 | 1.20 | — |
| Label / Meta | 11px / 0.6875rem | 400 | 1.30 | `text-transform: uppercase`, `letter-spacing: 1px`, Meta Gray |
| Small | 12–13px | 400 | 1.15 | Secondary text |

### Principles

- Weight 300 for display headlines — "whispered authority"
- Weight 700 for navigation, buttons, and key data — clear hierarchy
- Tight line-heights (1.15–1.30) throughout
- Uppercase labels/meta text with letter-spacing as structural elements
- Single font family handles everything — unity through weight contrast

---

## 2. Color Palette

All colors defined as CSS custom properties in `globals.css`. No more hardcoded Tailwind color classes (e.g. `text-indigo-600`, `bg-green-50`). Every color reference in components uses `var(--token)` via Tailwind's semantic classes (`text-accent`, `bg-card`, etc.).

### Accent

| Token | Light | Dark | Use |
|-------|-------|------|-----|
| `--accent` | `#2563eb` (Blue 600) | `#2563eb` | Interactive elements: buttons, links, active nav, progress bars, focus rings |
| `--accent-hover` | `#1d4ed8` (Blue 700) | `#1d4ed8` | Hover/active states |
| `--accent-foreground` | `#ffffff` | `#ffffff` | Text on accent backgrounds |

### Neutral Scale

| Token | Light | Dark | Use |
|-------|-------|------|-----|
| `--background` | `#ffffff` | `#0a0a0a` | Page background |
| `--foreground` | `#262626` | `#f0f0f0` | Primary text |
| `--card` | `#ffffff` | `#1e1e1e` | Card/surface background |
| `--card-foreground` | `#262626` | `#f0f0f0` | Text on cards |
| `--muted` | `#f5f5f5` | `#262626` | Muted backgrounds, progress bar tracks |
| `--muted-foreground` | `#757575` | `#757575` | Secondary text, meta info |
| `--border` | `#e5e5e5` | `#2a2a2a` | Borders |
| `--ring` | `#2563eb` | `#2563eb` | Focus rings (= accent) |
| `--nav-bg` | `#171717` | `#0a0a0a` | Navigation background (dark in both modes) |
| `--nav-border` | `#333333` | `#262626` | Navigation border |

### Semantic Colors

| Token | Light | Dark | Use |
|-------|-------|------|-----|
| `--success` | `#16a34a` (Green 600) | `#22c55e` (Green 500) | Completed tasks, healthy health bar |
| `--success-muted` | `#f0fdf4` (Green 50) | `rgba(22,163,74,0.1)` | Success backgrounds |
| `--warning` | `#d97706` (Amber 600) | `#f59e0b` (Amber 500) | Warnings, vacation banner |
| `--warning-muted` | `#fffbeb` (Amber 50) | `rgba(217,119,6,0.1)` | Warning backgrounds |
| `--danger` | `#dc2626` (Red 600) | `#ef4444` (Red 500) | Errors, critical health bar |
| `--danger-muted` | `#fef2f2` (Red 50) | `rgba(220,38,38,0.1)` | Danger backgrounds |

### Rules

- Accent color only for interactive elements — never decorative or as large surfaces
- Semantic colors only for their designated purpose
- Emojis retained as visual support where contextually meaningful (streaks, achievements, store items, quests, etc.)
- No other colors allowed outside this palette

---

## 3. Components

### Border Radius

`3px` uniformly — buttons, cards, inputs, badges, progress bars. Defined as `--radius: 3px` in CSS.

Tailwind config derived values:
- `--radius-lg`: `3px` (cards, dialogs)
- `--radius-md`: `3px` (buttons, inputs)
- `--radius-sm`: `2px` (badges, small elements)

### Shadows

One level only:
- Light: `0 1px 2px rgba(0,0,0,0.05)`
- Dark: `0 1px 2px rgba(0,0,0,0.2)`

Applied to cards and elevated containers. Everything else is flat.

### Buttons

All buttons must use the shadcn `Button` component. No more inline `<button className="bg-indigo-600 ...">`.

| Variant | Background | Text | Border |
|---------|-----------|------|--------|
| `default` (primary) | `var(--accent)` | `var(--accent-foreground)` | none |
| `outline` | transparent | `var(--foreground)` | `var(--border)` |
| `ghost` | transparent | `var(--foreground)` | none, hover `var(--muted)` |
| `destructive` | `var(--danger-muted)` | `var(--danger)` | none |
| `link` | transparent | `var(--accent)` | none, underline on hover |

All: 13–14px, weight 700, 3px radius.

### Cards

All cards must use the shadcn `Card` component. No more inline `<div className="bg-card border ...">`.

- Background: `var(--card)`
- Border: `1px solid var(--border)`
- Shadow: `shadow-sm`
- Radius: `3px`
- Section labels above card groups: 11px uppercase, letter-spacing 1px, `var(--muted-foreground)`

### Inputs

- Border: `var(--border)`
- Radius: `3px`
- Focus ring: `var(--ring)` (= accent)
- Placeholder: `var(--muted-foreground)`

### Badges

- Radius: `3px`
- Font: 12px, weight 700
- Variants: Default (accent bg), Success (green), Warning (amber), Neutral (dark grey), Destructive (red)

### Progress Bars

- Height: 3–4px
- Radius: `3px`
- Track: `var(--muted)`
- Fill color by context: `var(--accent)` for XP/level, `var(--success)` for healthy, `var(--warning)` for medium, `var(--danger)` for critical

### Tabs

- Active tab: accent color, weight 700, bottom border
- Inactive tab: `var(--muted-foreground)`, no border

---

## 4. Navigation

Structure unchanged: mobile bottom-bar, desktop sidebar.

### Mobile Bottom-Bar

- Background: `var(--nav-bg)` (dark in both modes)
- Active item: `var(--accent)`, weight 700
- Inactive: `var(--muted-foreground)` on dark bg (approximately `#888`)
- Icons + labels, same layout as current

### Desktop Sidebar

- Background: `var(--nav-bg)` (dark in both modes)
- Width: `w-56` (unchanged)
- Brand name: uppercase, weight 700, white, letter-spacing 0.5px
- Active item: `var(--accent)`, weight 700
- Inactive: muted text (`#888`), hover subtle background
- Footer: LocaleSwitcher + ThemeToggle (unchanged)

---

## 5. Layout & Spacing

### Structure (unchanged)

- Mobile: single-column, `p-4 pb-24`, bottom-bar
- Desktop: sidebar + content, `max-w-2xl mx-auto`

### Spacing (8px base)

| Size | Use |
|------|-----|
| `4px` | Within badges, label-to-value gap |
| `8px` | Between closely related elements |
| `12px` | Standard flex/grid gap |
| `16px` | Card padding, gap between cards |
| `20px` | Section spacing within a page |
| `28–32px` | Large section gaps, content padding |

### Page Titles

- Display weight 300, uppercase, 28px
- Subtitle in `var(--muted-foreground)`, 14px, 4px gap below title

### Principles

- Compressed content layout (BMW-style): tight line-heights, minimal line spacing
- Generous spacing between sections — breathing room between logical blocks
- Section labels (11px uppercase) as visual structural elements above groups

---

## 6. Migration Strategy

This redesign touches every page and component. The migration must be systematic:

1. **Foundation:** Replace font, update `globals.css` with new CSS variables, update `tailwind.config.ts` with new radius/shadow tokens
2. **shadcn Components:** Update `Button`, `Card`, `Badge`, `Input`, `Tabs` component styles to match new design
3. **Navigation:** Restyle sidebar and bottom-bar with dark backgrounds and new typography
4. **Page-by-page:** Update each page to use shadcn components instead of inline styles, replace all hardcoded color classes with CSS variable references
5. **Cleanup:** Remove unused Geist font files, remove any remaining hardcoded color classes

### Key Constraint

The app must remain functional throughout migration. Each step produces a working state. No big-bang rewrite.

---

## 7. Scope Boundaries

### In Scope

- All CSS variables and theming tokens
- Font replacement (Inter → Space Grotesk)
- All shadcn component style updates
- Navigation restyling
- All page updates to use new design tokens
- Removal of hardcoded Tailwind color classes
- Removal of unused font files

### Out of Scope

- No new features or functionality changes
- No layout structure changes (sidebar/bottom-bar stay)
- No new pages or routes
- No API changes
- No database changes
