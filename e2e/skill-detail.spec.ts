import { expect, test } from '@playwright/test'
import { mockApiRoutes, mockApiRoutesWithFailedReadme, mockApiRoutesWithNoGallery } from './helpers'

test.describe('skill detail', () => {
  test.beforeEach(async ({ page }) => {
    await mockApiRoutes(page)
  })

  test('detail page loads with skill info', async ({ page }) => {
    // given
    await page.goto('/skill/git-master')

    // then
    await expect(page.getByRole('heading', { level: 1, name: 'git-master' })).toBeVisible()
    await expect(page.getByText('1.3K installs')).toBeVisible()
    await expect(page.getByRole('button', { name: /opencode\/skills/ })).toBeVisible()
  })

  test('README content renders', async ({ page }) => {
    // given
    await page.goto('/skill/git-master')

    // then
    await expect(page.getByText('Example Skill')).toBeVisible()
    await expect(page.getByText('A sample skill for testing purposes.')).toBeVisible()
  })

  test('back button navigates back', async ({ page }) => {
    // given
    await page.goto('/')
    await page.getByRole('link', { name: /git-master/ }).click()
    await expect(page).toHaveURL(/\/skill\//)

    // when
    await page.getByRole('button', { name: 'Go back' }).click()

    // then
    await expect(page).toHaveURL('/')
  })

  test('not found state', async ({ page }) => {
    // given
    await page.goto('/skill/nonexistent-skill')

    // then
    await expect(page.getByText('Could not find skill "nonexistent-skill"')).toBeVisible()
  })
})

test.describe('skill detail local fallback', () => {
  test('falls back to local SKILL.md when remote README fails', async ({ page }) => {
    // given - gallery works but GitHub raw content returns 404
    await mockApiRoutesWithFailedReadme(page)
    await page.goto('/skill/git-master')

    // then - should show local SKILL.md content from shell shim
    await expect(page.getByRole('heading', { level: 1, name: 'git-master' })).toBeVisible()
    await expect(page.getByText('Local Fallback Skill')).toBeVisible()
    await expect(page.getByText('Works offline')).toBeVisible()
  })

  test('renders local-only skill when not in gallery', async ({ page }) => {
    // given - gallery returns empty, but shell shim returns installed skills
    await mockApiRoutesWithNoGallery(page)
    await page.goto('/skill/git-master')

    // then - should show local skill info
    await expect(page.getByRole('heading', { level: 1, name: 'git-master' })).toBeVisible()
    await expect(page.getByText('installed locally')).toBeVisible()
    await expect(page.getByText('Local Fallback Skill')).toBeVisible()
  })

  test('hides installs badge and GitHub button for local-only skill', async ({ page }) => {
    // given
    await mockApiRoutesWithNoGallery(page)
    await page.goto('/skill/git-master')

    // then
    await expect(page.getByRole('heading', { level: 1, name: 'git-master' })).toBeVisible()
    await expect(page.getByText(/installs/)).not.toBeVisible()
    await expect(page.getByRole('button', { name: /opencode\/skills/ })).not.toBeVisible()
  })
})
