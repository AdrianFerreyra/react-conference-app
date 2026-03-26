import { test, expect } from '@playwright/test'

test('displays the conference title', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('heading', { name: /React\.js Conf 2015/i })).toBeVisible()
})

test('loads schedule data', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByText(/2 day\(s\) loaded/i)).toBeVisible()
})
