import { test, expect } from '@playwright/test'

test('can navigate to settings page', async ({ page }) => {
  await page.goto('/settings')

  // Settings heading
  await expect(page.getByRole('heading', { name: 'Settings' })).toBeVisible({ timeout: 10000 })

  // Default tab "Users" should be visible
  await expect(page.getByRole('button', { name: 'Users' })).toBeVisible()
})

test('can navigate to manage page and see tabs', async ({ page }) => {
  await page.goto('/manage')

  // Manage heading
  await expect(page.getByRole('heading', { name: 'Manage' })).toBeVisible({ timeout: 10000 })

  // Two tabs: Tasks and Rewards
  await expect(page.getByRole('button', { name: 'Tasks' })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Rewards' })).toBeVisible()
})
