import { test, expect } from '@playwright/test'

test('store page loads and shows items from seed', async ({ page }) => {
  await page.goto('/store')

  // Store heading
  await expect(page.getByRole('heading', { name: 'Store' })).toBeVisible({ timeout: 10000 })

  // Section heading for rewards
  await expect(page.getByText('Belohnungen')).toBeVisible()

  // At least one seed store item should be visible
  await expect(page.getByText('Pizza-Abend aussuchen')).toBeVisible()
})
