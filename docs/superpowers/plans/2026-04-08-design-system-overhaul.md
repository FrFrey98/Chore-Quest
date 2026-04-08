# Design System Overhaul Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the current ad-hoc styling with a BMW-inspired design system built on CSS variables, Space Grotesk, and strict visual hierarchy.

**Architecture:** Update the foundation (CSS variables, Tailwind config, font) first, then update shadcn components, then migrate every page file-by-file from hardcoded Tailwind color classes to CSS variable references. The app must remain functional after each task.

**Tech Stack:** Next.js 15, Tailwind CSS, shadcn/ui (radix-nova style), next-themes, next/font/google (Space Grotesk)

**Spec:** `docs/superpowers/specs/2026-04-08-design-system-overhaul.md`

---

### Important Context

**Current state:** The app uses Inter font, `oklch`-based achromatic CSS variables for neutrals, and hardcoded Tailwind color classes (indigo, green, amber, red, pink) scattered across ~50 files. shadcn components exist but are often bypassed with inline styles.

**Color migration rules:**
- `indigo-*` → `var(--accent)` / `var(--accent-hover)` / `var(--accent-foreground)` via Tailwind classes `text-accent`, `bg-accent`, etc.
- `green-*` → `var(--success)` / `var(--success-muted)` via `text-success`, `bg-success-muted`, etc.
- `amber-*` → `var(--warning)` / `var(--warning-muted)` via `text-warning`, `bg-warning-muted`, etc.
- `red-*` → `var(--danger)` / `var(--danger-muted)` via `text-danger`, `bg-danger-muted`, etc. (Note: shadcn `destructive` already exists for some of these)
- `pink-*` → `var(--partner)` / `var(--partner-muted)` via `text-partner`, `bg-partner`, etc. (partner/other-user color)

**Duplicate files:** Several files have " 2" suffix duplicates (e.g. `challenges-widget 2.tsx`). These are exact copies. Delete the duplicates in the cleanup task.

---

### Task 1: Foundation — CSS Variables, Tailwind Config, Font

**Files:**
- Modify: `src/app/globals.css`
- Modify: `tailwind.config.ts`
- Modify: `src/app/[locale]/layout.tsx`
- Delete: `src/app/fonts/GeistVF.woff`
- Delete: `src/app/fonts/GeistMonoVF.woff`

- [ ] **Step 1: Update `src/app/globals.css` with new color tokens**

Replace the entire `@layer base` block:

```css
@layer base {
  :root {
    --background: #ffffff;
    --foreground: #262626;
    --card: #ffffff;
    --card-foreground: #262626;
    --popover: #ffffff;
    --popover-foreground: #262626;
    --primary: #262626;
    --primary-foreground: #f0f0f0;
    --secondary: #f5f5f5;
    --secondary-foreground: #262626;
    --muted: #f5f5f5;
    --muted-foreground: #757575;
    --accent: #2563eb;
    --accent-hover: #1d4ed8;
    --accent-foreground: #ffffff;
    --destructive: #dc2626;
    --border: #e5e5e5;
    --input: #e5e5e5;
    --ring: #2563eb;
    --radius: 3px;

    --success: #16a34a;
    --success-muted: #f0fdf4;
    --warning: #d97706;
    --warning-muted: #fffbeb;
    --danger: #dc2626;
    --danger-muted: #fef2f2;

    --partner: #db2777;
    --partner-muted: #fdf2f8;

    --nav-bg: #171717;
    --nav-border: #333333;
    --nav-foreground: #ffffff;
    --nav-muted: #888888;

    --shadow: 0 1px 2px rgba(0,0,0,0.05);
  }
  .dark {
    --background: #0a0a0a;
    --foreground: #f0f0f0;
    --card: #1e1e1e;
    --card-foreground: #f0f0f0;
    --popover: #1e1e1e;
    --popover-foreground: #f0f0f0;
    --primary: #f0f0f0;
    --primary-foreground: #0a0a0a;
    --secondary: #262626;
    --secondary-foreground: #f0f0f0;
    --muted: #262626;
    --muted-foreground: #757575;
    --accent: #2563eb;
    --accent-hover: #1d4ed8;
    --accent-foreground: #ffffff;
    --destructive: #ef4444;
    --border: #2a2a2a;
    --input: #2a2a2a;
    --ring: #2563eb;

    --success: #22c55e;
    --success-muted: rgba(22,163,74,0.1);
    --warning: #f59e0b;
    --warning-muted: rgba(217,119,6,0.1);
    --danger: #ef4444;
    --danger-muted: rgba(220,38,38,0.1);

    --partner: #ec4899;
    --partner-muted: rgba(219,39,119,0.1);

    --nav-bg: #0a0a0a;
    --nav-border: #262626;
    --nav-foreground: #ffffff;
    --nav-muted: #666666;

    --shadow: 0 1px 2px rgba(0,0,0,0.2);
  }
  * {
    border-color: var(--border);
  }
  body {
    background-color: var(--background);
    color: var(--foreground);
  }
}
```

- [ ] **Step 2: Update `tailwind.config.ts` with new color tokens and font**

```ts
import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: 'class',
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-space-grotesk)'],
      },
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        card: "var(--card)",
        "card-foreground": "var(--card-foreground)",
        popover: "var(--popover)",
        "popover-foreground": "var(--popover-foreground)",
        primary: "var(--primary)",
        "primary-foreground": "var(--primary-foreground)",
        secondary: "var(--secondary)",
        "secondary-foreground": "var(--secondary-foreground)",
        muted: "var(--muted)",
        "muted-foreground": "var(--muted-foreground)",
        accent: "var(--accent)",
        "accent-hover": "var(--accent-hover)",
        "accent-foreground": "var(--accent-foreground)",
        destructive: "var(--destructive)",
        border: "var(--border)",
        input: "var(--input)",
        ring: "var(--ring)",
        success: "var(--success)",
        "success-muted": "var(--success-muted)",
        warning: "var(--warning)",
        "warning-muted": "var(--warning-muted)",
        danger: "var(--danger)",
        "danger-muted": "var(--danger-muted)",
        partner: "var(--partner)",
        "partner-muted": "var(--partner-muted)",
        "nav-bg": "var(--nav-bg)",
        "nav-border": "var(--nav-border)",
        "nav-foreground": "var(--nav-foreground)",
        "nav-muted": "var(--nav-muted)",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "var(--radius)",
        sm: "2px",
      },
      boxShadow: {
        sm: "var(--shadow)",
      },
    },
  },
  plugins: [],
};
export default config;
```

- [ ] **Step 3: Swap font in `src/app/[locale]/layout.tsx`**

Replace Inter with Space Grotesk:

```tsx
import { Space_Grotesk } from 'next/font/google'
import { NextIntlClientProvider, hasLocale } from 'next-intl'
import { getMessages, setRequestLocale } from 'next-intl/server'
import { notFound } from 'next/navigation'
import { routing } from '@/i18n/routing'
import { Providers } from '@/components/providers'

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  weight: ['300', '400', '700'],
  variable: '--font-space-grotesk',
})

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }))
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  if (!hasLocale(routing.locales, locale)) {
    notFound()
  }
  setRequestLocale(locale)
  const messages = await getMessages()
  return (
    <html lang={locale} suppressHydrationWarning>
      <body className={`${spaceGrotesk.variable} font-sans`}>
        <Providers>
          <NextIntlClientProvider messages={messages}>
            {children}
          </NextIntlClientProvider>
        </Providers>
      </body>
    </html>
  )
}
```

- [ ] **Step 4: Delete unused Geist font files**

```bash
rm src/app/fonts/GeistVF.woff src/app/fonts/GeistMonoVF.woff
rmdir src/app/fonts 2>/dev/null || true
```

- [ ] **Step 5: Verify the app starts without errors**

Run: `npm run dev`
Expected: App loads with Space Grotesk font, new neutral colors visible, no build errors. The app will look broken because hardcoded colors still reference old Tailwind classes — that's expected at this stage.

- [ ] **Step 6: Commit**

```bash
git add src/app/globals.css tailwind.config.ts src/app/[locale]/layout.tsx
git rm src/app/fonts/GeistVF.woff src/app/fonts/GeistMonoVF.woff
git commit -m "feat: design system foundation — Space Grotesk, new CSS variables, 3px radius"
```

---

### Task 2: Update shadcn UI Components

**Files:**
- Modify: `src/components/ui/button.tsx`
- Modify: `src/components/ui/card.tsx`
- Modify: `src/components/ui/badge.tsx`
- Modify: `src/components/ui/input.tsx`
- Modify: `src/components/ui/tabs.tsx`

- [ ] **Step 1: Update Button component**

Replace the `buttonVariants` cva definition in `src/components/ui/button.tsx`. Key changes: `rounded-lg` → `rounded-md`, add `font-bold` (weight 700), update focus ring to use `ring`:

```ts
const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center rounded-md border border-transparent bg-clip-padding text-sm font-bold whitespace-nowrap transition-all outline-none select-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 active:not-aria-[haspopup]:translate-y-px disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default: "bg-accent text-accent-foreground hover:bg-accent-hover",
        outline:
          "border-border bg-background hover:bg-muted hover:text-foreground aria-expanded:bg-muted aria-expanded:text-foreground",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80 aria-expanded:bg-secondary aria-expanded:text-secondary-foreground",
        ghost:
          "hover:bg-muted hover:text-foreground aria-expanded:bg-muted aria-expanded:text-foreground dark:hover:bg-muted/50",
        destructive:
          "bg-danger-muted text-danger hover:bg-danger/20 focus-visible:border-danger/40 focus-visible:ring-danger/20",
        link: "text-accent underline-offset-4 hover:underline font-medium",
      },
      size: {
        default:
          "h-8 gap-1.5 px-2.5 has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2",
        xs: "h-6 gap-1 rounded-sm px-2 text-xs has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&_svg:not([class*='size-'])]:size-3",
        sm: "h-7 gap-1 rounded-sm px-2.5 text-[0.8rem] has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&_svg:not([class*='size-'])]:size-3.5",
        lg: "h-9 gap-1.5 px-2.5 has-data-[icon=inline-end]:pr-3 has-data-[icon=inline-start]:pl-3",
        icon: "size-8",
        "icon-xs":
          "size-6 rounded-sm [&_svg:not([class*='size-'])]:size-3",
        "icon-sm":
          "size-7 rounded-sm",
        "icon-lg": "size-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)
```

- [ ] **Step 2: Update Card component**

In `src/components/ui/card.tsx`, update the `Card` component className. Key changes: `rounded-xl` → `rounded-md`, `ring-1 ring-foreground/10` → `border border-border shadow-sm`:

```tsx
function Card({
  className,
  size = "default",
  ...props
}: React.ComponentProps<"div"> & { size?: "default" | "sm" }) {
  return (
    <div
      data-slot="card"
      data-size={size}
      className={cn(
        "group/card flex flex-col gap-4 overflow-hidden rounded-md border border-border bg-card py-4 shadow-sm text-sm text-card-foreground has-data-[slot=card-footer]:pb-0 has-[>img:first-child]:pt-0 data-[size=sm]:gap-3 data-[size=sm]:py-3 data-[size=sm]:has-data-[slot=card-footer]:pb-0",
        className
      )}
      {...props}
    />
  )
}
```

Also update `CardHeader` to remove `rounded-t-xl`:

```tsx
function CardHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-header"
      className={cn(
        "group/card-header @container/card-header grid auto-rows-min items-start gap-1 px-4 group-data-[size=sm]/card:px-3 has-data-[slot=card-action]:grid-cols-[1fr_auto] has-data-[slot=card-description]:grid-rows-[auto_auto] [.border-b]:pb-4 group-data-[size=sm]/card:[.border-b]:pb-3",
        className
      )}
      {...props}
    />
  )
}
```

Update `CardTitle` — remove `font-heading`, use `font-bold`:

```tsx
function CardTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-title"
      className={cn(
        "text-base leading-snug font-bold group-data-[size=sm]/card:text-sm",
        className
      )}
      {...props}
    />
  )
}
```

Update `CardFooter` — remove `rounded-b-xl`:

```tsx
function CardFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-footer"
      className={cn(
        "flex items-center border-t bg-muted/50 p-4 group-data-[size=sm]/card:p-3",
        className
      )}
      {...props}
    />
  )
}
```

- [ ] **Step 3: Update Badge component**

In `src/components/ui/badge.tsx`, update `badgeVariants`. Key changes: `rounded-4xl` → `rounded-sm`, add success/warning/danger variants:

```ts
const badgeVariants = cva(
  "group/badge inline-flex h-5 w-fit shrink-0 items-center justify-center gap-1 overflow-hidden rounded-sm border border-transparent px-2 py-0.5 text-xs font-bold whitespace-nowrap transition-all focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 [&>svg]:pointer-events-none [&>svg]:size-3!",
  {
    variants: {
      variant: {
        default: "bg-accent text-accent-foreground",
        secondary:
          "bg-secondary text-secondary-foreground",
        destructive:
          "bg-danger-muted text-danger",
        success:
          "bg-success-muted text-success",
        warning:
          "bg-warning-muted text-warning",
        outline:
          "border-border text-foreground",
        ghost:
          "hover:bg-muted hover:text-muted-foreground dark:hover:bg-muted/50",
        link: "text-accent underline-offset-4 hover:underline",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)
```

- [ ] **Step 4: Update Input component**

In `src/components/ui/input.tsx`, change `rounded-lg` → `rounded-md`:

```tsx
function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "h-8 w-full min-w-0 rounded-md border border-input bg-transparent px-2.5 py-1 text-base transition-colors outline-none file:inline-flex file:h-6 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-input/50 disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 md:text-sm dark:bg-input/30 dark:disabled:bg-input/80 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40",
        className
      )}
      {...props}
    />
  )
}
```

- [ ] **Step 5: Update Tabs component**

In `src/components/ui/tabs.tsx`, update `tabsListVariants` — change `rounded-lg` → `rounded-md`:

```ts
const tabsListVariants = cva(
  "group/tabs-list inline-flex w-fit items-center justify-center rounded-md p-[3px] text-muted-foreground group-data-horizontal/tabs:h-8 group-data-vertical/tabs:h-fit group-data-vertical/tabs:flex-col data-[variant=line]:rounded-none",
  {
    variants: {
      variant: {
        default: "bg-muted",
        line: "gap-1 bg-transparent",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)
```

Update `TabsTrigger` — change `rounded-md` → `rounded-sm`:

Replace the className in `TabsTrigger`:
```ts
className={cn(
  "relative inline-flex h-[calc(100%-1px)] flex-1 items-center justify-center gap-1.5 rounded-sm border border-transparent px-1.5 py-0.5 text-sm font-bold whitespace-nowrap text-foreground/60 transition-all group-data-vertical/tabs:w-full group-data-vertical/tabs:justify-start hover:text-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-1 focus-visible:outline-ring disabled:pointer-events-none disabled:opacity-50 dark:text-muted-foreground dark:hover:text-foreground group-data-[variant=default]/tabs-list:data-active:shadow-sm group-data-[variant=line]/tabs-list:data-active:shadow-none [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  "group-data-[variant=line]/tabs-list:bg-transparent group-data-[variant=line]/tabs-list:data-active:bg-transparent dark:group-data-[variant=line]/tabs-list:data-active:border-transparent dark:group-data-[variant=line]/tabs-list:data-active:bg-transparent",
  "data-active:bg-background data-active:text-foreground dark:data-active:border-input dark:data-active:bg-input/30 dark:data-active:text-foreground",
  "after:absolute after:bg-accent after:opacity-0 after:transition-opacity group-data-horizontal/tabs:after:inset-x-0 group-data-horizontal/tabs:after:bottom-[-5px] group-data-horizontal/tabs:after:h-0.5 group-data-vertical/tabs:after:inset-y-0 group-data-vertical/tabs:after:-right-1 group-data-vertical/tabs:after:w-0.5 group-data-[variant=line]/tabs-list:data-active:after:opacity-100",
  className
)}
```

Key change in the last line: `after:bg-foreground` → `after:bg-accent` (active tab indicator uses accent color).

- [ ] **Step 6: Verify and commit**

Run: `npm run dev`
Expected: Components now use 3px radius, accent colors, and bold weight.

```bash
git add src/components/ui/button.tsx src/components/ui/card.tsx src/components/ui/badge.tsx src/components/ui/input.tsx src/components/ui/tabs.tsx
git commit -m "feat: update shadcn components — 3px radius, accent colors, BMW typography"
```

---

### Task 3: Navigation Restyling

**Files:**
- Modify: `src/components/nav/navigation.tsx`

- [ ] **Step 1: Update navigation styles**

Replace the entire `Navigation` component in `src/components/nav/navigation.tsx`:

```tsx
'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, CheckSquare, ShoppingBag, Trophy, User, Swords, Scroll, type LucideIcon } from 'lucide-react'
import { useSession } from 'next-auth/react'
import { useTranslations } from 'next-intl'
import { getVisibleNavItems } from '@/lib/permissions'
import { LocaleSwitcher } from '@/components/locale-switcher'
import { ThemeToggle } from '@/components/theme-toggle'

function isActive(pathname: string, href: string): boolean {
  if (href === '/') return pathname === '/'
  return pathname === href || pathname.startsWith(href + '/')
}

const ICON_MAP: Record<string, LucideIcon> = {
  Home,
  CheckSquare,
  ShoppingBag,
  Trophy,
  User,
  Swords,
  Scroll,
}

export function Navigation() {
  const pathname = usePathname()
  const { data: session } = useSession()
  const t = useTranslations('nav')
  const role = session?.user?.role ?? 'child'
  const navItems = getVisibleNavItems(role)

  return (
    <>
      {/* Mobile bottom bar */}
      <nav aria-label={t('mainNav')} className="fixed bottom-0 left-0 right-0 bg-nav-bg border-t border-nav-border flex md:hidden z-50">
        {navItems.map(({ href, icon, labelKey }) => {
          const Icon = ICON_MAP[icon] ?? Home
          return (
            <Link
              key={href}
              href={href}
              aria-current={isActive(pathname, href) ? 'page' : undefined}
              className={`flex-1 flex flex-col items-center py-2 text-xs gap-1 transition-colors ${
                isActive(pathname, href) ? 'text-accent font-bold' : 'text-nav-muted'
              }`}
            >
              <Icon size={20} />
              <span>{t(labelKey)}</span>
            </Link>
          )
        })}
      </nav>

      {/* Desktop sidebar */}
      <nav aria-label={t('sidebar')} className="hidden md:flex flex-col w-56 min-h-screen bg-nav-bg border-r border-nav-border p-4 gap-1">
        <div className="text-sm font-bold mb-6 px-3 uppercase tracking-wide text-nav-foreground">{t('brand')}</div>
        {navItems.map(({ href, icon, labelKey }) => {
          const Icon = ICON_MAP[icon] ?? Home
          return (
            <Link
              key={href}
              href={href}
              aria-current={isActive(pathname, href) ? 'page' : undefined}
              className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors ${
                isActive(pathname, href)
                  ? 'text-accent font-bold'
                  : 'text-nav-muted hover:text-nav-foreground hover:bg-white/5'
              }`}
            >
              <Icon size={18} />
              {t(labelKey)}
            </Link>
          )
        })}
        <div className="mt-auto pt-4 px-3 flex items-center gap-2">
          <LocaleSwitcher />
          <ThemeToggle />
        </div>
      </nav>
    </>
  )
}
```

Key changes:
- `bg-card` → `bg-nav-bg` (dark in both modes)
- `border-border` → `border-nav-border`
- `text-indigo-600` → `text-accent font-bold`
- `bg-indigo-50 text-indigo-700` → `text-accent font-bold`
- `text-muted-foreground` → `text-nav-muted`
- Brand name: added `uppercase tracking-wide text-nav-foreground`
- Hover on desktop: `hover:bg-white/5` for subtle effect on dark background

- [ ] **Step 2: Verify and commit**

Run: `npm run dev`
Expected: Navigation is dark in both light and dark mode, active items use blue accent, brand name is uppercase.

```bash
git add src/components/nav/navigation.tsx
git commit -m "feat: restyle navigation — dark background, accent active state, BMW typography"
```

---

### Task 4: Utility Files and Shared Components

**Files:**
- Modify: `src/lib/health.ts` — replace hardcoded color classes
- Modify: `src/components/toast-provider.tsx` — replace green/red
- Modify: `src/components/nav/approval-banner.tsx` — replace indigo
- Modify: `src/components/pwa/install-prompt.tsx` — replace indigo
- Modify: `src/components/pwa/sw-register.tsx` — replace indigo
- Modify: `src/components/pwa/offline-indicator.tsx` — replace amber
- Modify: `src/components/ui/emoji-picker.tsx` — replace indigo

- [ ] **Step 1: Update `src/lib/health.ts`**

Find the `getHealthColor` function and replace the hardcoded Tailwind color returns:

```ts
export function getHealthColor(health: number): string {
  if (health > 0.5) return 'bg-success'
  if (health > 0.25) return 'bg-warning'
  if (health > 0.1) return 'bg-danger'
  return 'bg-danger'
}
```

The original returns `bg-green-500`, `bg-yellow-500`, `bg-red-500`, `bg-red-600`. Replace with `bg-success`, `bg-warning`, `bg-danger`, `bg-danger`.

- [ ] **Step 2: Update `src/components/toast-provider.tsx`**

Replace `bg-green-600` → `bg-success` and `bg-red-600` → `bg-danger`.

- [ ] **Step 3: Update `src/components/nav/approval-banner.tsx`**

Replace `bg-indigo-50 border-indigo-200 text-indigo-700 hover:bg-indigo-100` → `bg-accent/10 border-accent/20 text-accent hover:bg-accent/15`.

- [ ] **Step 4: Update `src/components/pwa/install-prompt.tsx`**

Replace all indigo references:
- `bg-indigo-600` → `bg-accent`
- `text-indigo-200` → `text-accent-foreground/70`
- `text-indigo-600` → `text-accent`
- `hover:bg-indigo-50` → `hover:bg-accent/10`

- [ ] **Step 5: Update `src/components/pwa/sw-register.tsx`**

Replace:
- `bg-indigo-600` → `bg-accent`
- `text-indigo-600` → `text-accent`
- `hover:bg-indigo-50` → `hover:bg-accent/10`

- [ ] **Step 6: Update `src/components/pwa/offline-indicator.tsx`**

Replace `bg-amber-100 text-amber-800` → `bg-warning-muted text-warning`.

- [ ] **Step 7: Update `src/components/ui/emoji-picker.tsx`**

Replace:
- `hover:bg-indigo-50` → `hover:bg-accent/10`
- `bg-indigo-100 ring-indigo-300` → `bg-accent/10 ring-accent/30`

- [ ] **Step 8: Verify and commit**

Run: `npm run dev`

```bash
git add src/lib/health.ts src/components/toast-provider.tsx src/components/nav/approval-banner.tsx src/components/pwa/install-prompt.tsx src/components/pwa/sw-register.tsx src/components/pwa/offline-indicator.tsx src/components/ui/emoji-picker.tsx
git commit -m "feat: migrate utility files and shared components to CSS variables"
```

---

### Task 5: Dashboard Components

**Files:**
- Modify: `src/components/dashboard/stat-pills.tsx`
- Modify: `src/components/dashboard/today-section.tsx`
- Modify: `src/components/dashboard/yesterday-banner.tsx`
- Modify: `src/components/dashboard/week-chart.tsx`
- Modify: `src/components/dashboard/points-header.tsx`
- Modify: `src/components/dashboard/grouped-feed.tsx`
- Modify: `src/components/dashboard/feed-item.tsx`
- Modify: `src/components/dashboard/challenges-widget.tsx`
- Modify: `src/components/dashboard/quests-widget.tsx`
- Modify: `src/app/[locale]/(app)/page.tsx` (dashboard page)

- [ ] **Step 1: Update `stat-pills.tsx`**

Replace all hardcoded colors:
- `text-indigo-600` → `text-accent`
- `from-indigo-500 to-indigo-400` (gradient on progress bar) → `bg-accent` (solid fill, no gradient)
- `bg-amber-50 border-amber-300 hover:bg-amber-100` → `bg-warning-muted border-warning/30 hover:bg-warning/15`
- `text-amber-800` → `text-warning`
- `text-amber-600` → `text-warning`
- `text-amber-400` → `text-warning`

- [ ] **Step 2: Update `today-section.tsx`**

Replace:
- `bg-indigo-600 hover:bg-indigo-700` → `bg-accent hover:bg-accent-hover`
- `bg-green-50 text-green-700` → `bg-success-muted text-success`
- `bg-green-50 border-green-500` → `bg-success-muted border-success`
- `text-green-600` → `text-success`
- `bg-amber-100 text-amber-700` → `bg-warning-muted text-warning`
- `bg-amber-50 border-amber-400` → `bg-warning-muted border-warning`
- `text-amber-900` → `text-warning`
- `text-amber-600` → `text-warning`
- `text-red-600 hover:text-red-700` → `text-danger hover:text-danger`

- [ ] **Step 3: Update `yesterday-banner.tsx`**

Replace:
- `bg-amber-50 border-amber-200 hover:bg-amber-100` → `bg-warning-muted border-warning/20 hover:bg-warning/15`
- `text-amber-800` → `text-warning`
- `text-amber-400` → `text-warning`

- [ ] **Step 4: Update `week-chart.tsx`**

Replace:
- `bg-indigo-400` → `bg-accent` (current user bar color)
- `bg-pink-400` → `bg-partner` (partner bar color)

- [ ] **Step 5: Update `points-header.tsx`**

Replace:
- `bg-indigo-500` → `bg-accent`
- `bg-pink-500` → `bg-partner`

- [ ] **Step 6: Update `grouped-feed.tsx`**

Replace:
- `text-indigo-600` → `text-accent`
- `text-pink-600` → `text-partner`
- `text-amber-600` → `text-warning`

- [ ] **Step 7: Update `feed-item.tsx`**

Replace:
- `border-indigo-400 text-indigo-600` → `border-accent text-accent`
- `border-pink-400 text-pink-600` → `border-partner text-partner`

- [ ] **Step 8: Update `challenges-widget.tsx`**

Replace:
- `text-indigo-500 hover:text-indigo-700` → `text-accent hover:text-accent-hover`
- `border-indigo-400` → `border-accent`
- `bg-indigo-500` → `bg-accent`
- `bg-green-50 dark:bg-green-950 border-green-500` → `bg-success-muted border-success`
- `text-green-600` → `text-success`
- `bg-green-500` → `bg-success`

- [ ] **Step 9: Update `quests-widget.tsx`**

Replace:
- `text-indigo-500 hover:text-indigo-700` → `text-accent hover:text-accent-hover`
- `border-indigo-400` → `border-accent`
- `bg-indigo-500` → `bg-accent`

- [ ] **Step 10: Update dashboard page `src/app/[locale]/(app)/page.tsx`**

Replace:
- `text-indigo-500 hover:text-indigo-700` → `text-accent hover:text-accent-hover`
- `bg-amber-50 dark:bg-amber-950 border-amber-200 dark:border-amber-800` → `bg-warning-muted border-warning/20`
- `text-amber-800 dark:text-amber-200` → `text-warning`
- `text-amber-600 dark:text-amber-400` → `text-warning`

Also add BMW-style page title. Find the `<h1>` and update to: `<h1 className="text-[1.75rem] font-light uppercase tracking-wide leading-tight">`.

- [ ] **Step 11: Verify and commit**

Run: `npm run dev`, check dashboard in light and dark mode.

```bash
git add src/components/dashboard/ src/app/[locale]/(app)/page.tsx
git commit -m "feat: migrate dashboard components to design system variables"
```

---

### Task 6: Task Components

**Files:**
- Modify: `src/components/tasks/task-card.tsx`
- Modify: `src/components/tasks/create-task-dialog.tsx`
- Modify: `src/components/tasks/template-picker.tsx`
- Modify: `src/components/tasks/calendar-view.tsx`
- Modify: `src/components/tasks/yesterday-section.tsx`
- Modify: `src/app/[locale]/(app)/tasks/tasks-client.tsx`

- [ ] **Step 1: Update `task-card.tsx`**

Replace:
- `text-indigo-700 bg-indigo-50` → `text-accent bg-accent/10`
- `bg-indigo-600 hover:bg-indigo-700` → `bg-accent hover:bg-accent-hover`
- `bg-amber-100 text-amber-700` → `bg-warning-muted text-warning`

- [ ] **Step 2: Update `create-task-dialog.tsx`**

Replace:
- `bg-indigo-600 text-white` (active toggle state) → `bg-accent text-accent-foreground`
- `text-red-500` → `text-danger`

- [ ] **Step 3: Update `template-picker.tsx`**

Replace:
- `bg-indigo-600 text-white` → `bg-accent text-accent-foreground`

- [ ] **Step 4: Update `calendar-view.tsx`**

Replace:
- `ring-indigo-400 ring-indigo-500` → `ring-accent`
- `text-indigo-600` → `text-accent`
- `bg-indigo-600 hover:bg-indigo-700` → `bg-accent hover:bg-accent-hover`
- `text-indigo-600 hover:text-indigo-700` → `text-accent hover:text-accent-hover`
- `hover:bg-indigo-50` → `hover:bg-accent/10`
- `bg-green-500` → `bg-success`
- `bg-green-50` → `bg-success-muted`
- `text-green-600` → `text-success`
- `bg-red-400` → `bg-danger`
- `bg-red-50` → `bg-danger-muted`
- `text-red-400` → `text-danger`
- `hover:text-red-500 hover:bg-red-50` → `hover:text-danger hover:bg-danger-muted`

- [ ] **Step 5: Update `yesterday-section.tsx`**

Replace:
- `bg-green-50 border-green-500` → `bg-success-muted border-success`
- `text-green-600` → `text-success`
- `text-red-600 hover:text-red-700` → `text-danger hover:text-danger`
- `bg-amber-50 border-amber-400` → `bg-warning-muted border-warning`
- `bg-amber-100 text-amber-700` → `bg-warning-muted text-warning`
- `bg-amber-500 hover:bg-amber-600` → `bg-warning hover:bg-warning`

- [ ] **Step 6: Update `tasks-client.tsx`**

Replace:
- `text-indigo-600` → `text-accent`
- `text-indigo-500 hover:text-indigo-700` → `text-accent hover:text-accent-hover`

Add BMW page title style to the `<h1>`: `className="text-[1.75rem] font-light uppercase tracking-wide leading-tight"`.

- [ ] **Step 7: Verify and commit**

Run: `npm run dev`, check tasks page.

```bash
git add src/components/tasks/ src/app/[locale]/(app)/tasks/
git commit -m "feat: migrate task components to design system variables"
```

---

### Task 7: Store, Achievements, and Manage Components

**Files:**
- Modify: `src/components/store/store-item-card.tsx`
- Modify: `src/components/store/pending-rewards.tsx`
- Modify: `src/components/store/create-item-dialog.tsx`
- Modify: `src/components/approvals/approval-card.tsx`
- Modify: `src/components/manage/reward-row.tsx`
- Modify: `src/components/manage/task-row.tsx`
- Modify: `src/components/stats/scoreboard.tsx`
- Modify: `src/components/stats/top-tasks.tsx`
- Modify: `src/components/stats/task-filter.tsx`
- Modify: `src/app/[locale]/(app)/store/store-client.tsx`
- Modify: `src/app/[locale]/(app)/achievements/achievements-client.tsx`
- Modify: `src/app/[locale]/(app)/manage/manage-client.tsx`

- [ ] **Step 1: Update store components**

`store-item-card.tsx`:
- `text-indigo-700 bg-indigo-50` → `text-accent bg-accent/10`
- `text-green-600` → `text-success`
- `text-red-500` → `text-danger`

`pending-rewards.tsx`:
- `bg-amber-50 border-amber-200` → `bg-warning-muted border-warning/20`

`create-item-dialog.tsx`:
- `text-red-500` → `text-danger`

`store-client.tsx`:
- `text-indigo-600` → `text-accent`
- `text-indigo-500 hover:text-indigo-700` → `text-accent hover:text-accent-hover`

- [ ] **Step 2: Update approval components**

`approval-card.tsx`:
- `bg-indigo-50 text-indigo-700` → `bg-accent/10 text-accent`
- `bg-green-600 hover:bg-green-700` → `bg-success hover:bg-success`
- `border-red-200 text-red-600 hover:bg-red-50` → `border-danger/20 text-danger hover:bg-danger-muted`

- [ ] **Step 3: Update manage components**

`reward-row.tsx`:
- `border-indigo-200` → `border-accent/20`
- `hover:text-indigo-600 hover:bg-indigo-50` → `hover:text-accent hover:bg-accent/10`
- `text-green-600 hover:bg-green-50` → `text-success hover:bg-success-muted`
- `hover:text-red-600 hover:bg-red-50` → `hover:text-danger hover:bg-danger-muted`

`task-row.tsx`:
- `border-indigo-200` → `border-accent/20`
- `bg-indigo-600 text-white` (active state) → `bg-accent text-accent-foreground`
- `hover:text-indigo-600 hover:bg-indigo-50` → `hover:text-accent hover:bg-accent/10`
- `text-green-600 hover:bg-green-50` → `text-success hover:bg-success-muted`
- `hover:text-red-600 hover:bg-red-50` → `hover:text-danger hover:bg-danger-muted`
- `bg-amber-100 text-amber-700` → `bg-warning-muted text-warning`
- `bg-red-100 text-red-700` → `bg-danger-muted text-danger`

`manage-client.tsx`:
- `bg-indigo-500 text-white` (tab active) → `bg-accent text-accent-foreground`

- [ ] **Step 4: Update stats components**

`scoreboard.tsx`:
- `text-indigo-600` → `text-accent`
- `text-pink-600` → `text-partner`

`top-tasks.tsx`:
- `bg-indigo-400` (default bar color prop) → `bg-accent`

`task-filter.tsx`:
- `focus:ring-indigo-300` → `focus:ring-ring`

- [ ] **Step 5: Update achievements page**

`achievements-client.tsx`:
- `text-indigo-600` → `text-accent`
- `bg-indigo-400` → `bg-accent`
- `bg-indigo-500` → `bg-accent`

- [ ] **Step 6: Verify and commit**

Run: `npm run dev`, check store, achievements, manage pages.

```bash
git add src/components/store/ src/components/approvals/ src/components/manage/ src/components/stats/ src/app/[locale]/(app)/store/ src/app/[locale]/(app)/achievements/ src/app/[locale]/(app)/manage/
git commit -m "feat: migrate store, achievements, manage, stats to design system variables"
```

---

### Task 8: Challenges, Quests, Streak, Profile Pages

**Files:**
- Modify: `src/app/[locale]/(app)/challenges/challenges-client.tsx`
- Modify: `src/app/[locale]/(app)/quests/quests-client.tsx`
- Modify: `src/app/[locale]/(app)/streak/streak-client.tsx`
- Modify: `src/app/[locale]/(app)/profile/profile-client.tsx`
- Modify: `src/app/[locale]/(app)/stats/stats-client.tsx`

- [ ] **Step 1: Update `challenges-client.tsx`**

Replace:
- `bg-indigo-600 text-white` (tab active) → `bg-accent text-accent-foreground`
- `bg-indigo-500` (progress bar) → `bg-accent`
- `text-green-600` → `text-success`
- `bg-green-500` → `bg-success`

- [ ] **Step 2: Update `quests-client.tsx`**

Replace:
- `bg-indigo-600 text-white` (tab active) → `bg-accent text-accent-foreground`
- `bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-400 ring-indigo-200 dark:ring-indigo-800` → `bg-accent/10 text-accent ring-accent/20`
- `text-indigo-600 dark:text-indigo-400` → `text-accent`
- `bg-indigo-600 hover:bg-indigo-700` → `bg-accent hover:bg-accent-hover`
- `bg-indigo-500` → `bg-accent`
- `text-green-600` → `text-success`
- `bg-green-50 dark:bg-green-950 text-green-700 dark:text-green-400` → `bg-success-muted text-success`
- `text-green-500` → `text-success`

- [ ] **Step 3: Update `streak-client.tsx`**

Replace:
- `bg-indigo-200 bg-indigo-300 bg-indigo-400 bg-indigo-500` (heatmap scale) → `bg-accent/20 bg-accent/40 bg-accent/60 bg-accent`
- `text-indigo-500 hover:text-indigo-700` → `text-accent hover:text-accent-hover`
- `text-indigo-600` → `text-accent`
- `from-indigo-500 to-indigo-400` → `bg-accent`
- `bg-indigo-50 text-indigo-700` → `bg-accent/10 text-accent`
- `bg-amber-50 border-amber-300` → `bg-warning-muted border-warning/30`
- `text-amber-800` → `text-warning`
- `text-amber-600` → `text-warning`
- `bg-amber-500 hover:bg-amber-600` → `bg-warning hover:bg-warning`
- `text-red-600` → `text-danger`

- [ ] **Step 4: Update `profile-client.tsx`**

Replace:
- `bg-indigo-600 hover:bg-indigo-700` → `bg-accent hover:bg-accent-hover`
- `bg-indigo-100 text-indigo-700` → `bg-accent/10 text-accent`
- `text-indigo-700` → `text-accent`
- `text-indigo-600` → `text-accent`
- `bg-amber-50 dark:bg-amber-950 border-amber-200 dark:border-amber-800` → `bg-warning-muted border-warning/20`
- `text-amber-800 dark:text-amber-200` → `text-warning`
- `bg-amber-600 hover:bg-amber-700` → `bg-warning hover:bg-warning`
- `text-amber-500` → `text-warning`
- `text-green-600` → `text-success`

- [ ] **Step 5: Update `stats-client.tsx`**

Replace:
- `bg-indigo-500 text-white` (tab active) → `bg-accent text-accent-foreground`
- `focus:ring-indigo-300` → `focus:ring-ring`
- `bg-indigo-100 text-indigo-700` (metric toggle active) → `bg-accent/10 text-accent`
- `text-indigo-600` → `text-accent`
- `bg-indigo-400` (bar color prop) → `bg-accent`
- `text-pink-600` → `text-partner`
- `bg-pink-400` (bar color prop) → `bg-partner`

- [ ] **Step 6: Add BMW page title style to all pages**

For each page that has an `<h1>`, add the display style: `className="text-[1.75rem] font-light uppercase tracking-wide leading-tight"`.

Pages to update: `challenges-client.tsx`, `quests-client.tsx`, `streak-client.tsx`, `profile-client.tsx`, `stats-client.tsx`.

- [ ] **Step 7: Verify and commit**

Run: `npm run dev`, check all pages in both modes.

```bash
git add src/app/[locale]/(app)/challenges/ src/app/[locale]/(app)/quests/ src/app/[locale]/(app)/streak/ src/app/[locale]/(app)/profile/ src/app/[locale]/(app)/stats/
git commit -m "feat: migrate challenges, quests, streak, profile, stats pages to design system"
```

---

### Task 9: Settings Tabs

**Files:**
- Modify: `src/app/[locale]/(app)/settings/settings-client.tsx`
- Modify: `src/app/[locale]/(app)/settings/tabs/tasks-tab.tsx`
- Modify: `src/app/[locale]/(app)/settings/tabs/level-tab.tsx`
- Modify: `src/app/[locale]/(app)/settings/tabs/quests-tab.tsx`
- Modify: `src/app/[locale]/(app)/settings/tabs/backup-tab.tsx`
- Modify: `src/app/[locale]/(app)/settings/tabs/achievements-tab.tsx`
- Modify: `src/app/[locale]/(app)/settings/tabs/users-tab.tsx`
- Modify: `src/app/[locale]/(app)/settings/tabs/notifications-tab.tsx`
- Modify: `src/app/[locale]/(app)/settings/tabs/categories-tab.tsx`
- Modify: `src/app/[locale]/(app)/settings/tabs/store-tab.tsx`
- Modify: `src/app/[locale]/(app)/settings/tabs/bonus-tab.tsx`
- Modify: `src/app/[locale]/(app)/settings/tabs/streak-tab.tsx`

- [ ] **Step 1: Update `settings-client.tsx`**

Replace:
- `bg-indigo-600 text-white` (tab active) → `bg-accent text-accent-foreground`

- [ ] **Step 2: Update `tasks-tab.tsx`**

Replace:
- `bg-indigo-600 text-white` → `bg-accent text-accent-foreground`
- `text-indigo-500 hover:text-indigo-700` → `text-accent hover:text-accent-hover`
- `text-red-500` → `text-danger`

- [ ] **Step 3: Update `level-tab.tsx`**

Replace:
- `bg-indigo-100 text-indigo-700` → `bg-accent/10 text-accent`
- `text-red-400 hover:text-red-600` → `text-danger hover:text-danger`

- [ ] **Step 4: Update `quests-tab.tsx`**

Replace:
- `bg-indigo-600 hover:bg-indigo-700` → `bg-accent hover:bg-accent-hover`
- `focus:ring-indigo-500` → `focus:ring-ring`
- `text-indigo-600 hover:text-indigo-700` → `text-accent hover:text-accent-hover`
- `hover:text-red-600` → `hover:text-danger`
- `bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400` → `bg-success-muted text-success`

- [ ] **Step 5: Update `backup-tab.tsx`**

Replace:
- `bg-indigo-600 hover:bg-indigo-700` → `bg-accent hover:bg-accent-hover`
- `text-amber-600` → `text-warning`
- `bg-red-600 hover:bg-red-700` → `bg-danger hover:bg-danger`

- [ ] **Step 6: Update `achievements-tab.tsx`**

Replace:
- `border-indigo-200` → `border-accent/20`
- `text-red-400 hover:text-red-600` → `text-danger hover:text-danger`
- `bg-blue-50 text-blue-700` → `bg-accent/10 text-accent`

- [ ] **Step 7: Update `users-tab.tsx`**

Replace:
- `bg-indigo-100 text-indigo-700` (role badge) → `bg-accent/10 text-accent`
- `border-indigo-100` → `border-accent/10`
- `text-red-500` → `text-danger`
- `text-amber-600 dark:text-amber-400` → `text-warning`

- [ ] **Step 8: Update `notifications-tab.tsx`**

Replace:
- `text-indigo-600` → `text-accent`
- `bg-indigo-600` → `bg-accent`
- `text-amber-600` → `text-warning`
- `bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400` → `bg-success-muted text-success`
- `text-red-600` → `text-danger`

- [ ] **Step 9: Update `categories-tab.tsx`**

Replace:
- `bg-amber-50 text-amber-700` → `bg-warning-muted text-warning`
- `text-red-400 hover:text-red-600` → `text-danger hover:text-danger`

- [ ] **Step 10: Update `store-tab.tsx`**

Replace:
- `bg-green-100 text-green-700` → `bg-success-muted text-success`

- [ ] **Step 11: Update `bonus-tab.tsx` and `streak-tab.tsx`**

Both have `text-red-400 hover:text-red-600` → `text-danger hover:text-danger`.

- [ ] **Step 12: Verify and commit**

Run: `npm run dev`, check settings page and all tabs.

```bash
git add src/app/[locale]/(app)/settings/
git commit -m "feat: migrate all settings tabs to design system variables"
```

---

### Task 10: Auth Pages

**Files:**
- Modify: `src/app/[locale]/(auth)/login/login-form.tsx`
- Modify: `src/app/[locale]/(auth)/setup/setup-form.tsx`

- [ ] **Step 1: Update `login-form.tsx`**

Replace:
- `border-indigo-500 bg-indigo-50 text-indigo-700` (selected user) → `border-accent bg-accent/10 text-accent`
- `text-red-500` → `text-danger`

- [ ] **Step 2: Update `setup-form.tsx`**

Replace all occurrences:
- `text-red-500` → `text-danger` (validation errors, ~4 occurrences)
- `text-red-500 hover:underline` → `text-danger hover:underline`
- Any `bg-indigo-*` → `bg-accent` / `bg-accent/10`
- Any button styling to use the shadcn `Button` component where possible

- [ ] **Step 3: Verify and commit**

Run: `npm run dev`, check login and setup pages.

```bash
git add src/app/[locale]/(auth)/
git commit -m "feat: migrate auth pages to design system variables"
```

---

### Task 11: Cleanup — Duplicate Files and Verification

**Files:**
- Delete: All `" 2.tsx"` and `" 2.ts"` duplicate files
- Modify: Any remaining files with hardcoded color classes

- [ ] **Step 1: Delete duplicate files**

```bash
find src -name "* 2.tsx" -o -name "* 2.ts" | while read f; do rm "$f"; done
```

Expected duplicates:
- `src/components/dashboard/challenges-widget 2.tsx`
- `src/components/dashboard/quests-widget 2.tsx`
- `src/components/tasks/template-picker 2.tsx`
- `src/app/[locale]/(app)/challenges/challenges-client 2.tsx`
- `src/app/[locale]/(app)/quests/quests-client 2.tsx`
- `src/app/[locale]/(app)/settings/tabs/quests-tab 2.tsx`
- `src/lib/health 2.ts`

- [ ] **Step 2: Full audit for remaining hardcoded colors**

Run: `grep -rn "indigo\|text-green-\|bg-green-\|text-amber-\|bg-amber-\|text-red-\|bg-red-\|text-pink-\|bg-pink-\|text-yellow-\|bg-yellow-" src/ --include="*.tsx" --include="*.ts" | grep -v node_modules | grep -v " 2."`

Expected: Zero results. If any remain, fix them following the same patterns from previous tasks.

- [ ] **Step 3: Build check**

Run: `npm run build`
Expected: Build succeeds with no errors.

- [ ] **Step 4: Run existing tests**

Run: `npm test`
Expected: All tests pass. If health color tests exist, they may need updating to new class names.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "chore: remove duplicate files, verify clean color migration"
```

---

### Task 12: Page Title Typography Pass

**Files:**
- All page components that render `<h1>` tags

- [ ] **Step 1: Audit all h1 tags**

Run: `grep -rn "<h1" src/ --include="*.tsx" | grep -v " 2.tsx"`

For each `<h1>` found, ensure it uses the BMW display style:
```
className="text-[1.75rem] font-light uppercase tracking-wide leading-tight"
```

- [ ] **Step 2: Audit all section labels**

Check for section labels/headings above card groups. Where appropriate, apply the uppercase meta label style:
```
className="text-[0.6875rem] font-normal uppercase tracking-wider text-muted-foreground"
```

This is a judgment call per component — not every small heading needs this treatment. Apply it to structural labels that group content (e.g., "Heute fällig", "Streak", "Level").

- [ ] **Step 3: Verify and commit**

Run: `npm run dev`, visually check all pages for consistent typography.

```bash
git add -A
git commit -m "feat: apply BMW display typography to page titles and section labels"
```
