import { test, expect } from '@playwright/test'

test.describe('Dashboard', () => {
  test('loads and shows Energy Dashboard', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByRole('heading', { name: /Energy Dashboard/i })).toBeVisible({ timeout: 10000 })
  })

  test('sidebar navigation works', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByRole('heading', { name: /Energy Dashboard/i })).toBeVisible({ timeout: 10000 })
    await page.getByRole('button', { name: /Energy Market/i }).click()
    await expect(page.getByRole('heading', { name: /Energy Market/i })).toBeVisible({ timeout: 5000 })
  })
})
