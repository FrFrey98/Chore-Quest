import { test, expect } from '@playwright/test'

test('dashboard loads and shows content', async ({ page }) => {
  await page.goto('/')

  // Dashboard heading is visible
  await expect(page.getByText('Dashboard')).toBeVisible({ timeout: 10000 })

  // Stat pills or some dashboard content should be present
  await expect(page.locator('main')).toBeVisible()
})

test('can navigate to tasks page', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByText('Dashboard')).toBeVisible({ timeout: 10000 })

  // Click tasks link in navigation (nav bar has "Aufgaben" label)
  await page.getByRole('link', { name: /Aufgaben/i }).first().click()

  // Tasks page should load
  await expect(page).toHaveURL(/\/tasks/)
})
