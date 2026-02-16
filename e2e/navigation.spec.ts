import { expect, test } from '@playwright/test'

test('sidebar renders navigation items', async ({ page }) => {
  // given
  await page.goto('/')

  // then
  await expect(page.getByRole('link', { name: 'Skills Directory' })).toBeVisible()
  await expect(page.getByRole('link', { name: 'Global Skills' })).toBeVisible()
  await expect(page.getByText('Projects', { exact: true })).toBeVisible()
})

test('navigate to Skills Directory', async ({ page }) => {
  // given
  await page.goto('/global')

  // when
  await page.getByRole('link', { name: 'Skills Directory' }).click()

  // then
  await expect(page).toHaveURL('/')
  await expect(page.getByRole('heading', { name: 'Skills Directory' })).toBeVisible()
})

test('navigate to Global Skills', async ({ page }) => {
  // given
  await page.goto('/')

  // when
  await page.getByRole('link', { name: 'Global Skills' }).click()

  // then
  await expect(page).toHaveURL('/global')
  await expect(page.getByRole('heading', { name: 'Global Skills', level: 1 })).toBeVisible()
})

test('active state highlights current route', async ({ page }) => {
  // given
  await page.goto('/')

  // when
  await page.getByRole('link', { name: 'Global Skills' }).click()

  // then
  const globalLink = page.getByRole('link', { name: 'Global Skills' })
  await expect(globalLink).toHaveClass(/bg-overlay-12/)
  await expect(globalLink).toHaveClass(/font-medium/)
})

test('navigate back to gallery from detail', async ({ page }) => {
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
  await page.getByRole('link', { name: 'Skills Directory' }).click()

  // then
  await expect(page).toHaveURL('/')
  await expect(page.getByRole('heading', { name: 'Skills Directory' })).toBeVisible()
})
