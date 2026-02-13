import type { Page } from '@playwright/test'
import { mockReadme, mockSkills } from './fixtures'

export async function mockApiRoutes(page: Page): Promise<void> {
  await page.route('https://skills.sh/api/search*', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(mockSkills),
    })
  })

  await page.route('https://raw.githubusercontent.com/**', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'text/plain',
      body: mockReadme,
    })
  })
}
