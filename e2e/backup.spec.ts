import { test, expect } from '@playwright/test'

test('can access backup tab in settings', async ({ page }) => {
  await page.goto('/settings')

  await expect(page.getByRole('heading', { name: 'Settings' })).toBeVisible({ timeout: 10000 })

  // Click Backup tab
  await page.getByRole('button', { name: 'Backup' }).click()

  // Backup tab content should be visible
  await expect(page.getByText('Export all data as a JSON file')).toBeVisible()
})

test('can trigger backup export', async ({ page }) => {
  await page.goto('/settings')
  await expect(page.getByRole('heading', { name: 'Settings' })).toBeVisible({ timeout: 10000 })

  // Switch to Backup tab
  await page.getByRole('button', { name: 'Backup' }).click()
  await expect(page.getByText('Export backup')).toBeVisible()

  // Listen for download event
  const downloadPromise = page.waitForEvent('download')
  await page.getByRole('button', { name: 'Export backup' }).click()
  const download = await downloadPromise

  // Verify the download file name pattern
  expect(download.suggestedFilename()).toMatch(/haushalt-quest-backup-.*\.json/)
})
