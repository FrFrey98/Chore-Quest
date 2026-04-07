import { test as setup, expect } from '@playwright/test'

setup('authenticate as Alice', async ({ page }) => {
  await page.goto('/login')

  // Select Alice (first user button with text "Alice")
  await page.getByRole('button', { name: /Alice/ }).click()

  // Enter PIN
  await page.getByPlaceholder('Enter PIN').fill('1234')

  // Click login button
  await page.getByRole('button', { name: 'Log in' }).click()

  // Wait for redirect to dashboard
  await expect(page.getByText('Dashboard')).toBeVisible({ timeout: 10000 })

  // Save auth state
  await page.context().storageState({ path: 'e2e/.auth/user.json' })
})
