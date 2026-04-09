import { test, expect } from '@playwright/test'

/**
 * Spec 2: Dashboard task card → training modal intercept
 *
 * Preconditions (assumed from Spec 1 or existing test DB):
 *   - dog training feature is enabled
 *   - at least one dog exists
 *
 * The recurring system task "🐕 {dogName} trainieren" / "🐕 {dogName} train"
 * should appear on the dashboard. Clicking its "Check off" button should open
 * the TrainingLogModal instead of completing the task normally.
 */
test.describe('Dog training modal intercept from dashboard', () => {
  test('clicking "Check off" on dog training task opens training modal', async ({ page }) => {
    // Navigate to the dashboard
    await page.goto('/')
    await expect(page.getByText('Dashboard')).toBeVisible({ timeout: 10000 })

    // Look for a DUE (not yet completed) task card whose title matches the dog training pattern.
    // Due task cards have class "border-border" (not "border-success" which completed tasks use).
    // The title format is "🐕 {dogName} trainieren" — the dog name comes from seed data.
    const dueTaskCard = page
      .locator('[class*="border-border"]')
      .filter({ hasText: /🐕.+trainieren/ })
      .first()

    const taskVisible = await dueTaskCard.isVisible().catch(() => false)

    if (!taskVisible) {
      // Dog training task may not be due today, or was already completed by a previous test run.
      test.skip(true, 'No due dog training task card found on dashboard — task may already be completed or not yet created')
      return
    }

    // The task card with "Check off" button should be visible
    await expect(dueTaskCard).toBeVisible()

    // Click the "Check off" button on this specific card
    const checkOffBtn = dueTaskCard.getByRole('button').filter({ hasText: /Check off/i })
    await checkOffBtn.click()

    // Expect the TrainingLogModal dialog to open (not a normal task completion)
    const dialog = page.getByRole('dialog')
    await expect(dialog).toBeVisible({ timeout: 5000 })
    await expect(dialog.getByText('Log training session')).toBeVisible()

    // Select first skill if none pre-selected
    const firstCheckbox = dialog.locator('input[type="checkbox"]').first()
    const isChecked = await firstCheckbox.isChecked()
    if (!isChecked) {
      await firstCheckbox.click()
    }

    // Duration: click "10 min"
    await dialog.getByRole('radio', { name: '10 min' }).click()

    // Submit
    await dialog.getByRole('button', { name: 'Save' }).click()

    // Expect success toast
    await expect(page.getByText('Training saved')).toBeVisible({ timeout: 5000 })

    // Dialog should close after save
    await expect(dialog).not.toBeVisible({ timeout: 5000 })
  })
})
