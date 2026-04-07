import { test, expect } from '@playwright/test'

// Don't use stored auth — we're testing the login flow itself
test.use({ storageState: { cookies: [], origins: [] } })

test('successful login with correct PIN', async ({ page }) => {
  await page.goto('/login')

  // Page shows the app title
  await expect(page.getByRole('heading', { name: /Chore-Quest/ })).toBeVisible()

  // Select Alice
  await page.getByRole('button', { name: /Alice/ }).click()

  // PIN input appears
  await page.getByPlaceholder('Enter PIN').fill('1234')

  // Click login
  await page.getByRole('button', { name: 'Log in' }).click()

  // Should redirect to dashboard
  await expect(page.getByText('Dashboard')).toBeVisible({ timeout: 10000 })
})

test('shows error with wrong PIN', async ({ page }) => {
  await page.goto('/login')

  // Select Alice
  await page.getByRole('button', { name: /Alice/ }).click()

  // Enter wrong PIN
  await page.getByPlaceholder('Enter PIN').fill('9999')

  // Click login
  await page.getByRole('button', { name: 'Log in' }).click()

  // Should show error message
  await expect(page.getByText('Wrong PIN')).toBeVisible({ timeout: 5000 })
})
