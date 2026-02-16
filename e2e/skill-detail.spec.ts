import { expect, test } from '@playwright/test'

test('detail page loads with skill info', async ({ page }) => {
  // given
  await page.goto('/skill/find-skills')

  // then
  await expect(page.getByRole('heading', { level: 1, name: 'find-skills' })).toBeVisible()
  await expect(page.getByText(/^\d+(\.\d+)?K? installs$/).first()).toBeVisible()
  await expect(page.getByRole('button', { name: /vercel-labs/ })).toBeVisible()
})

test('README content renders', async ({ page }) => {
  // given
  await page.goto('/skill/find-skills')

  // then
  await expect(page.locator('.prose')).toBeVisible()
})

test('back button navigates back', async ({ page }) => {
  // given
  await page.goto('/')
  await expect(page.getByRole('link').first()).toBeVisible()
  await page
    .getByRole('link')
    .filter({ hasText: /skills/ })
    .first()
    .click()
  await expect(page).toHaveURL(/\/skill\//)

  // when
  await page.getByRole('button', { name: 'Go back' }).click()

  // then
  await expect(page).toHaveURL('/')
})

test('not found state', async ({ page }) => {
  // given
  await page.goto('/skill/nonexistent-skill-xyz-000')

  // then
  await expect(page.getByText(/Could not find skill/)).toBeVisible()
})
