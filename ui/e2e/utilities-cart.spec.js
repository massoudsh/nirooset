import { test, expect } from '@playwright/test'

test.describe('Utilities and Cart', () => {
  test('navigates to Utilities and shows products', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByRole('heading', { name: /Energy Dashboard/i })).toBeVisible({ timeout: 10000 })
    await page.getByRole('button', { name: /Utilities/i }).click()
    await expect(page.getByRole('heading', { name: /Green Energy Utilities/i })).toBeVisible({ timeout: 5000 })
    await expect(page.getByText(/Add to cart/i).first()).toBeVisible({ timeout: 5000 })
  })

  test('add to cart and open cart drawer', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('button', { name: /Utilities/i }).click()
    await expect(page.getByRole('heading', { name: /Green Energy Utilities/i })).toBeVisible({ timeout: 5000 })
    await page.getByRole('button', { name: /Add to cart/i }).first().click()
    await page.getByTitle('Cart').click()
    await expect(page.getByText(/Proceed to checkout/i)).toBeVisible({ timeout: 5000 })
  })

  test('cart icon in header is present', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByRole('button', { name: /Connect wallet/i })).toBeVisible({ timeout: 10000 })
    const cartButton = page.locator('button').filter({ has: page.locator('svg') }).first()
    await expect(cartButton).toBeVisible({ timeout: 5000 })
  })
})
