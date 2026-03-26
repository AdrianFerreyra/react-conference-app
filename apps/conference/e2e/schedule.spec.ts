import { test, expect } from '@playwright/test'

test('displays the conference title', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('heading', { name: /React\.js Conf 2015/i })).toBeVisible()
})

test('loads schedule data', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByText(/2 day\(s\) loaded/i)).toBeVisible()
})

test('shows a current event when time-travelling to mid-Keynote', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByText(/2 day\(s\) loaded/i)).toBeVisible()

  await page.locator('[data-testid="time-travel-input"]').fill('2015-01-28T10:15')

  await expect(page.getByRole('heading', { name: 'Keynote' })).toBeVisible()
  await expect(page.getByText('Tom Occhino')).toBeVisible()
})

test('shows upcoming events when time-travelling to start of day', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByText(/2 day\(s\) loaded/i)).toBeVisible()

  await page.locator('[data-testid="time-travel-input"]').fill('2015-01-28T09:00')

  await expect(page.getByRole('region', { name: 'Upcoming events' })).toBeVisible()
  await expect(
    page.getByRole('region', { name: 'Upcoming events' }).getByText('Keynote'),
  ).toBeVisible()
})

test('time travel reset button returns to real-time state', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByText(/2 day\(s\) loaded/i)).toBeVisible()

  // Travel to mid-Keynote to reach a deterministic state
  await page.locator('[data-testid="time-travel-input"]').fill('2015-01-28T10:15')
  await expect(page.getByRole('heading', { name: 'Keynote' })).toBeVisible()

  // Travel to after the conference — no current event
  await page.locator('[data-testid="time-travel-input"]').fill('2015-01-30T10:00')
  await expect(page.getByText(/No ongoing event right now/i)).toBeVisible()

  // Reset and verify the page still renders without crashing
  await page.getByTestId('time-travel-reset').click()
  await expect(page.getByRole('heading', { name: /React\.js Conf 2015/i })).toBeVisible()
})
