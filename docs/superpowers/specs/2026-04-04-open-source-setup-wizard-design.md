# Open-Source Readiness: Setup Wizard

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Provide a first-run setup experience so new users can configure their instance (create 2 user accounts) without touching code or config files.

**Context:** This is Sub-Project 2 of 4 in the open-source readiness initiative. Depends on Sub-Project 1 (Seed Cleanup) being complete — specifically, `docker-entrypoint.sh` no longer seeds users, and the app needs a way to detect "no users exist yet."

**Constraints:**
- UI stays German (app's default language)
- Exactly 2 users (pair/WG duo model)
- Minimal scope — just user creation, no task/category/reward customization in the wizard
- Default categories, achievements, and store items are seeded automatically on first setup completion

---

## 1. First-Run Detection

**Approach:** Instead of file-based markers, use the database directly. The login page already queries `prisma.user.findMany()`. If this returns 0 users, the app is in "setup mode."

**Detection flow:**
1. `docker-entrypoint.sh` runs migrations (no seed).
2. User opens the app → middleware redirects to `/login`.
3. Login page checks user count. If 0 users exist → redirect to `/setup`.
4. All other routes (except `/setup`, `/api/setup`, `/api/auth`, static assets) redirect to `/setup` when no users exist.

**Implementation:**
- Add `/setup` and `/api/setup` to the middleware matcher exclusion list.
- In the login page: if `users.length === 0`, redirect to `/setup`.
- Add a server-side check function `isSetupComplete()` that returns `prisma.user.count() > 0`.
- Protected pages (via the `(app)` layout or middleware) check `isSetupComplete()` and redirect to `/setup` if false.

---

## 2. Setup Page UI

**Route:** `/setup` (outside the `(app)` group, in the `(auth)` group or standalone)

**Design:** Single-page wizard, same visual style as login page (centered card, white bg, rounded corners).

**Steps (all on one page, sequential sections):**

### Step 1: Welcome
- Heading: "Willkommen bei Haushalt-Quest!"
- Short description: "Richte dein Duo ein, um zu starten."
- "Los geht's" button to reveal Step 2.

### Step 2: User 1
- Name input (required, min 2 chars)
- PIN input (required, 4-8 digits, numeric, masked)
- PIN confirmation input

### Step 3: User 2
- Same fields as User 1
- Validation: name must differ from User 1

### Step 4: Confirmation
- Summary showing both user names
- "Einrichtung abschließen" button

**Validation:**
- Names: required, 2-50 chars, must be different
- PINs: required, 4-8 digits, numeric only, confirmation must match
- Client-side validation with inline error messages
- Server-side validation in the API route

---

## 3. Setup API Route

**Route:** `POST /api/setup`

**Request body:**
```json
{
  "user1": { "name": "Alice", "pin": "1234" },
  "user2": { "name": "Bob", "pin": "5678" }
}
```

**Logic:**
1. Check if any users already exist → 409 Conflict if so (prevents re-running setup).
2. Validate inputs (names non-empty and different, PINs 4-8 digits).
3. Hash both PINs with bcrypt (salt rounds 10).
4. In a single transaction:
   - Create User 1 (auto-generated UUID).
   - Create User 2 (auto-generated UUID).
   - Seed default categories (same 5 as current seed.ts).
   - Seed default achievements (same 13 as current seed.ts).
   - Seed default store items (same 5 as current seed.ts).
   - Create StreakState for both users.
5. Return 201 with `{ success: true }`.

**Note:** No default tasks are seeded — users create their own tasks via the existing task creation flow. Categories are seeded because they're needed for task creation, and achievements/store items are part of the core game mechanics.

**Response codes:**
- 201: Setup complete
- 409: Users already exist (setup already done)
- 400: Validation error (with error message)

---

## 4. Post-Setup Redirect

After successful setup:
1. API returns success.
2. Client redirects to `/login`.
3. Login page now shows the two created users.
4. Normal login flow takes over.

---

## 5. Setup Guard

**Prevent access to setup after completion:**
- The `/setup` page checks `isSetupComplete()`. If users already exist, redirect to `/login`.
- The `/api/setup` endpoint rejects POST if users exist (409).
- No "reset" or "re-setup" functionality — this is intentional. To reset, delete the database file.

**Prevent app access before setup:**
- The middleware or login page already handles this (redirects to `/setup` when 0 users).

---

## 6. Default Seed Data (created by Setup API)

The setup API seeds the following alongside the 2 users:

**Categories** (5): Küche, Bad, Allgemein, Wäsche, Draußen — same as current seed.ts.

**Achievements** (13): Same as current seed.ts. These are game mechanics, not user-customizable content.

**Store Items** (5): Same as current seed.ts. These are examples that users can modify via the existing settings page.

**Not seeded:** Tasks. Users create their own tasks via the task creation flow. This is deliberate — different households have different needs.

---

## Summary of File Changes

| File | Action |
|------|--------|
| `src/app/(auth)/setup/page.tsx` | New: Setup page (server component, redirect guard) |
| `src/app/(auth)/setup/setup-form.tsx` | New: Setup form (client component) |
| `src/app/api/setup/route.ts` | New: POST endpoint for setup |
| `src/lib/setup.ts` | New: `isSetupComplete()` helper, default seed data constants |
| `src/middleware.ts` | Update: Add `/setup` and `/api/setup` to matcher exclusions |
| `src/app/(auth)/login/page.tsx` | Update: Redirect to `/setup` when no users exist |

## Out of Scope

- Task creation wizard (users use existing task creation)
- Category/achievement/store item customization in wizard
- Multi-language support
- "Reset app" functionality
