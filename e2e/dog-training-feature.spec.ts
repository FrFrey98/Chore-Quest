import { test, expect } from '@playwright/test'

test.describe('Dog training happy path', () => {
  test('enable feature, add dog Betty, and log a training session', async ({ page }) => {
    // ── Step 1: Navigate to /settings ────────────────────────────────────────
    await page.goto('/settings')
    await expect(page.getByRole('heading', { name: 'Settings' })).toBeVisible({ timeout: 10000 })

    // ── Step 2: Open "Dogs" tab ───────────────────────────────────────────────
    await page.getByRole('button', { name: 'Dogs' }).click()

    // ── Step 3: Toggle "Enable dog training" if not already on ───────────────
    const toggle = page.locator('#dog-training-toggle')
    await expect(toggle).toBeVisible({ timeout: 5000 })
    const isEnabled = await toggle.isChecked()
    if (!isEnabled) {
      await toggle.click()
      await expect(page.getByText('Dog training enabled')).toBeVisible({ timeout: 6000 })
    }

    // ── Step 4: Navigate to /hunde ────────────────────────────────────────────
    await page.goto('/hunde')
    await page.waitForURL('**/hunde', { timeout: 10000 })
    await expect(page.locator('main')).toBeVisible()

    // ── Step 5: Add a dog if we're in empty state ─────────────────────────────
    const emptyTitle = page.getByText('No dogs yet')
    const isEmpty = await emptyTitle.isVisible().catch(() => false)

    if (isEmpty) {
      // Empty state — click "Add dog"
      await page.getByRole('button', { name: 'Add dog' }).click()

      // ── Step 6: Fill the dog form ───────────────────────────────────────────
      const sheetTitle = page.getByRole('heading', { name: 'Add Dog' })
      await expect(sheetTitle).toBeVisible({ timeout: 5000 })

      // Name: "Betty"
      await page.locator('#dog-name').fill('Betty')

      // Phase: "adult" is the default; explicitly select "Adult" from the Radix Select
      // Radix Select renders a button[role="combobox"] as the trigger
      const comboboxes = page.locator('[role="combobox"]')
      const count = await comboboxes.count()
      for (let i = 0; i < count; i++) {
        const text = await comboboxes.nth(i).textContent()
        if (text && /Puppy|Adolescent|Adult|Senior|Advanced/.test(text)) {
          await comboboxes.nth(i).click()
          await page.getByRole('option', { name: 'Adult' }).click()
          break
        }
      }

      // ── Step 7: Click "Save" ────────────────────────────────────────────────
      await page.getByRole('button', { name: 'Save' }).click()

      // Wait for save action to complete, then reload to pick up the new dog
      await page.waitForTimeout(2000)
      await page.goto('/hunde')

      // ── Step 8: Expect Betty to appear on the page ──────────────────────────
      await expect(page.getByText('Betty')).toBeVisible({ timeout: 10000 })
    } else {
      // A dog already exists — verify the training button is present
      await expect(page.getByRole('button', { name: 'Log training' })).toBeVisible({ timeout: 5000 })
    }

    // ── Step 9: Click "Log training" ─────────────────────────────────────────
    await page.getByRole('button', { name: 'Log training' }).click()

    // ── Verify training modal opens ───────────────────────────────────────────
    const dialog = page.getByRole('dialog')
    await expect(dialog).toBeVisible({ timeout: 5000 })
    await expect(dialog.getByText('Log training session')).toBeVisible()

    // ── Step 10: Select the first skill (ensure at least one checkbox checked) ─
    const checkboxes = dialog.locator('input[type="checkbox"]')
    await expect(checkboxes.first()).toBeVisible({ timeout: 5000 })
    const firstChecked = await checkboxes.first().isChecked()
    if (!firstChecked) {
      await checkboxes.first().click()
    }

    // ── Step 11: Select 10 min duration via ToggleGroup ───────────────────────
    // Radix ToggleGroupItem renders with role="radio"
    await dialog.getByRole('radio', { name: '10 min' }).click()

    // ── Step 12: Click "Save" ─────────────────────────────────────────────────
    await dialog.getByRole('button', { name: 'Save' }).click()

    // ── Step 13: Expect session summary (replaces toast after UI overhaul) ────
    // After saving, the modal shows a session summary with a "Continue" button
    await expect(dialog.getByRole('button', { name: 'Continue' })).toBeVisible({ timeout: 10000 })
  })
})
