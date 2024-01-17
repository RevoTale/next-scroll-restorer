import {test, expect} from '@playwright/test'

test('End to end testing of scroll restorer', async ({page}) => {
    // Start from the index page (the baseURL is set via the webServer in the playwright.config.ts)
    page.on('console', (msg) => {
        console.log(msg)
    })
    
    await page.goto('/')
    // Find an element with the text 'About' and click on it
    const el = page.getByText('Lets-go to low-page')
    const getScrollY = () => page.evaluate((): number => window.scrollY)

    await expect( getScrollY()).resolves.toEqual(0)
    await el.scrollIntoViewIfNeeded()
    await expect( getScrollY()).resolves.toBeGreaterThan(2599)
    await el.click()

    // The new URL should be "/about" (baseURL is used there)
    await expect(page).toHaveURL('/low-page')
    // The new page should contain an h1 with "About"
    await expect(page.locator('h1')).toContainText('This is the low page')
    await expect( getScrollY()).resolves.toEqual(0)
    await page.goBack()
    await expect(page).toHaveURL('/')
    console.log('sffsdsdf')
    await expect( getScrollY()).resolves.toBeGreaterThan(2599)
    await page.goForward()

    await  expect( getScrollY()).resolves.toEqual(0)
//A little bit of stress for app
    await page.goBack()
    console.log('sffsdsdf 2')

    await  expect( getScrollY()).resolves.toBeGreaterThan(2599)
    for (let i= 0;i<10;i++) {
        console.log(`Navigation ${i}`)
        await page.goForward()
        await page.goBack()
    }
    await expect( getScrollY()).resolves.toBeGreaterThan(2599)
    await page.goForward()

    await expect( getScrollY()).resolves.toEqual(0)
    await page.goBack()
    await expect( getScrollY()).resolves.toBeGreaterThan(2599)

//End of a little bit of stress for app


})
