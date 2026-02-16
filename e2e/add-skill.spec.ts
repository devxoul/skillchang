import { expect, test } from '@playwright/test'

test('dialog opens from detail page', async ({ page }) => {
  // given
  await page.goto('/skill/find-skills')
  await expect(page.getByRole('heading', { level: 1, name: 'find-skills' })).toBeVisible()

  // when
  await page.getByRole('button', { name: /Add/ }).click()

  // then
  await expect(page.getByRole('dialog')).toBeVisible()
  await expect(page.getByRole('heading', { name: /Add find-skills/i })).toBeVisible()
})

test('agent checkboxes render', async ({ page }) => {
  // given
  await page.goto('/skill/find-skills')
  await expect(page.getByRole('heading', { level: 1, name: 'find-skills' })).toBeVisible()
  await page.getByRole('button', { name: /Add/ }).click()

  // then
  const dialog = page.getByRole('dialog')
  await expect(dialog).toBeVisible()
  await expect(dialog.locator('span', { hasText: 'OpenCode' }).first()).toBeVisible()
  await expect(dialog.locator('span', { hasText: 'Claude Code' }).first()).toBeVisible()
  await expect(dialog.locator('span', { hasText: 'Cursor' }).first()).toBeVisible()
  await expect(dialog.locator('span', { hasText: 'Cline' }).first()).toBeVisible()
  await expect(dialog.locator('span', { hasText: 'Windsurf' }).first()).toBeVisible()
})

test('add button disabled without selection', async ({ page }) => {
  // given
  await page.goto('/skill/find-skills')
  await expect(page.getByRole('heading', { level: 1, name: 'find-skills' })).toBeVisible()
  await page.getByRole('button', { name: /Add/ }).click()

  // when
  const dialog = page.getByRole('dialog')
  await expect(dialog).toBeVisible()
  await dialog.getByText('Global').click()

  // then
  const addButton = dialog.getByRole('button', { name: /^Add$/ })
  await expect(addButton).toBeDisabled()
})

test('dialog can be cancelled', async ({ page }) => {
  // given
  await page.goto('/skill/find-skills')
  await expect(page.getByRole('heading', { level: 1, name: 'find-skills' })).toBeVisible()
  await page.getByRole('button', { name: /Add/ }).click()
  await expect(page.getByRole('dialog')).toBeVisible()

  // when
  await page.getByRole('button', { name: /Cancel/ }).click()

  // then
  await expect(page.getByRole('dialog')).not.toBeVisible()
})
