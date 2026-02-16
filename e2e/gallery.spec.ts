import { expect, test } from '@playwright/test'

test('gallery loads and displays skills', async ({ page }) => {
  // given
  await page.goto('/')

  // then
  await expect(page.getByRole('heading', { name: 'Skills Directory' })).toBeVisible()
  await expect(page.getByRole('link').first()).toBeVisible()
})

test('search filters skills', async ({ page }) => {
  // given
  await page.goto('/')
  await expect(page.getByRole('link').first()).toBeVisible()

  // when
  const searchInput = page.getByPlaceholder('Search skills...')
  await searchInput.fill('frontend')

  // then
  await expect(page.getByRole('link', { name: /frontend/ }).first()).toBeVisible()

  // when
  await searchInput.fill('nonexistent-skill-xyz')

  // then
  await expect(page.getByText('No skills match your search')).toBeVisible()
})

test('click skill card navigates to detail', async ({ page }) => {
  // given
  await page.goto('/')
  await expect(page.getByRole('link').first()).toBeVisible()

  // when
  await page
    .getByRole('link')
    .filter({ hasText: /skills/ })
    .first()
    .click()

  // then
  await expect(page).toHaveURL(/\/skill\//)
})
