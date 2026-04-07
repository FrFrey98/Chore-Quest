import { test, expect } from '@playwright/test'

test('store page loads and shows items from seed', async ({ page }) => {
  await page.goto('/store')

  // Store heading
  await expect(page.getByRole('heading', { name: 'Store' })).toBeVisible({ timeout: 10000 })

  // Section heading for rewards
  await expect(page.getByText('Rewards')).toBeVisible()

  // At least one seed store item should be visible (seed data title)
  await expect(page.getByText('Pizza-Abend aussuchen')).toBeVisible()
})
