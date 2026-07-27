import { test, expect } from '@playwright/test'

test.describe('Energy Market', () => {
  test('navigates to Energy Market and shows order book', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByRole('heading', { name: /Energy Dashboard/i })).toBeVisible({ timeout: 10000 })
    await page.getByRole('button', { name: /Energy Market/i }).click()
    await expect(page.getByRole('heading', { name: /Energy Market/i })).toBeVisible({ timeout: 5000 })
    await expect(page.getByText(/Order Book|Bids|Asks/i)).toBeVisible({ timeout: 5000 })
  })

  test('shows place order section and bid/ask toggle', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('button', { name: /Energy Market/i }).click()
    await expect(page.getByRole('heading', { name: /Place Order/i })).toBeVisible({ timeout: 5000 })
    await expect(page.getByRole('button', { name: /Buy \(Bid\)/i })).toBeVisible()
    await expect(page.getByRole('button', { name: /Sell \(Ask\)/i })).toBeVisible()
  })
})
