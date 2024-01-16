import {test, expect} from '@playwright/test'

test('End to end testing of scroll restorer', async ({page}) => {
    // Start from the index page (the baseURL is set via the webServer in the playwright.config.ts)
    await page.goto('/')
    // Find an element with the text 'About' and click on it
    const el = page.getByText('Lets-go to low-page')
    const getScrollY = () => page.evaluate((): number => window.scrollY);

    expect(await getScrollY()).toEqual(0)
    await el.scrollIntoViewIfNeeded()
    expect(await getScrollY()).toBeGreaterThan(2599)
    await el.click()

    // The new URL should be "/about" (baseURL is used there)
    await expect(page).toHaveURL('/low-page')
    // The new page should contain an h1 with "About"
    await expect(page.locator('h1')).toContainText('This is the low page')
    expect(await getScrollY()).toEqual(0)

    await page.goBack()
    await expect(page).toHaveURL('/')

    expect(await getScrollY()).toBeGreaterThan(2599)
    await page.goForward()

    expect(await getScrollY()).toEqual(0)
//A little bit of stress for app
    await page.goBack()
    expect(await getScrollY()).toBeGreaterThan(2599)
    await page.goForward()
    await page.goBack()
    await page.goForward()

    expect(await getScrollY()).toEqual(0)
    await page.goBack()
    expect(await getScrollY()).toBeGreaterThan(2599)

//End of a little bit of stress for app


})
