import { test, expect } from '@playwright/test'

test('can navigate to settings page', async ({ page }) => {
  await page.goto('/settings')

  // Settings heading (German)
  await expect(page.getByRole('heading', { name: 'Einstellungen' })).toBeVisible({ timeout: 10000 })

  // Default tab "Benutzer" should be visible
  await expect(page.getByRole('button', { name: 'Benutzer' })).toBeVisible()
})

test('can navigate to manage page and see tabs', async ({ page }) => {
  await page.goto('/manage')

  // Manage heading (German)
  await expect(page.getByRole('heading', { name: 'Verwalten' })).toBeVisible({ timeout: 10000 })

  // Two tabs: Aufgaben and Belohnungen
  await expect(page.getByRole('button', { name: 'Aufgaben' })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Belohnungen' })).toBeVisible()
})
