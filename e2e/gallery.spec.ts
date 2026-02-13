import { expect, test } from '@playwright/test'
import { mockApiRoutes } from './helpers'

test.beforeEach(async ({ page }) => {
  await mockApiRoutes(page)
})

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

  // when - search for existing skill
  const searchInput = page.getByPlaceholder('Search skills...')
  await searchInput.fill('git')

  // then - filtered results shown
  await expect(page.getByRole('link', { name: /git-master/ })).toBeVisible()

  // when - search for non-existent skill
  await searchInput.fill('nonexistent-skill-xyz')

  // then - no match message shown
  await expect(page.getByText('No skills match your search')).toBeVisible()
})

test('click skill card navigates to detail', async ({ page }) => {
  // given
  await page.goto('/')

  // when
  await page.getByRole('link', { name: /git-master/ }).click()

  // then
  await expect(page).toHaveURL(/\/skill\/\d+/)
})
