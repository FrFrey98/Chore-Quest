import { test, expect } from '@playwright/test'

/**
 * Spec 3: LLM skill extension import
 *
 * Preconditions (assumed from Spec 1 or existing test DB):
 *   - dog training feature is enabled
 *   - at least one dog exists
 */

const KNOWN_GOOD_JSON = JSON.stringify({
  skills: [
    {
      id: 'test_e2e_skill',
      categoryId: 'tricks',
      nameDe: 'E2E Test Skill',
      nameEn: 'E2E Test Skill',
      descriptionDe: 'Dies ist eine ausreichend lange Beschreibung für den E2E Test des Imports.',
      descriptionEn: 'This is a sufficiently long description for the E2E test of the import.',
      difficulty: 'intermediate',
      phase: 'adult',
      prerequisiteIds: [],
    },
  ],
})

test.describe('Dog training skill extension import', () => {
  test('open extension sheet, verify prompt, navigate to import, paste JSON and import', async ({ page }) => {
    // Navigate to /hunde
    await page.goto('/hunde')

    // If redirected away (feature disabled / no dogs), skip gracefully
    const currentUrl = page.url()
    if (!currentUrl.includes('/hunde')) {
      test.skip(true, 'Redirected away from /hunde — feature may be disabled or no dogs exist')
      return
    }

    // Wait for the page content to settle
    await expect(page.locator('main')).toBeVisible({ timeout: 10000 })

    // 1. Click "Extend skills via AI" button
    const extensionBtn = page.getByRole('button', { name: 'Extend skills via AI' })
    await expect(extensionBtn).toBeVisible({ timeout: 5000 })
    await extensionBtn.click()

    // 2. Expect sheet to open with step 1 (Generate prompt) visible
    await expect(page.getByText('Extend skills via AI').first()).toBeVisible({ timeout: 5000 })

    // Verify the step 1 button is active / visible
    await expect(page.getByRole('button', { name: /1\. Generate prompt/i })).toBeVisible()

    // 3. Verify the prompt preview contains "positive Hundeerziehung"
    //    (The prompt generator always writes German system instructions)
    const promptPreview = page.locator('textarea[readonly]')
    await expect(promptPreview).toBeVisible({ timeout: 5000 })
    const promptText = await promptPreview.inputValue()
    expect(promptText).toContain('positive Hundeerziehung')

    // 4. Click "Go to import →" to navigate to step 2
    await page.getByRole('button', { name: /Go to import/i }).click()

    // Step 2 should now be visible
    await expect(page.getByRole('button', { name: /2\. Import response/i })).toBeVisible()
    await expect(page.getByLabel(/Paste response/i)).toBeVisible()

    // 5. Paste the known-good JSON into the textarea
    const importTextarea = page.locator('#import-json')
    await importTextarea.fill(KNOWN_GOOD_JSON)

    // 6. Click "Validate and import"
    await page.getByRole('button', { name: 'Validate and import' }).click()

    // 7. Expect success toast "1 new skills imported"
    await expect(
      page.getByText(/1 new skills imported/i),
    ).toBeVisible({ timeout: 8000 })
  })
})
