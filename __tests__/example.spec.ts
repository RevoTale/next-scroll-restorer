import { test, expect } from '@playwright/test'

test('should navigate to low page', async ({ page }) => {
  // Start from the index page (the baseURL is set via the webServer in the playwright.config.ts)
  await page.goto('/')
  // Find an element with the text 'About' and click on it
  await page.getByText('Lets-go to low-page').click()
  // The new URL should be "/about" (baseURL is used there)
  await expect(page).toHaveURL('/low-page')
  // The new page should contain an h1 with "About"
  await expect(page.locator('h1')).toContainText('This is the low page')
})
