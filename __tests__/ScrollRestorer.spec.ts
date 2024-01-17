import {test, expect} from '@playwright/test'

const highPage = 1300
const mainPage = 2600
test('End to end testing of scroll restorer', async ({page}) => {
    // Start from the index page (the baseURL is set via the webServer in the playwright.config.ts)
    page.on('console', (msg) => {
        console.log(msg)
    })

    await page.goto('/')
    // Find an element with the text 'About' and click on it
    const el = page.getByText('Lets-go to low-page')
    const getScrollY = () => page.evaluate((): number => window.scrollY)
    const expectScrollToBe = async (value: number) => {
        await expect(getScrollY()).resolves.toBeGreaterThan(value - 1.1)
        await expect(getScrollY()).resolves.toBeLessThan(value + 1.1)
    }
    await expectScrollToBe(0)
    await el.scrollIntoViewIfNeeded()
    await expectScrollToBe(mainPage)
    await el.click()

    // The new URL should be "/about" (baseURL is used there)
    await expect(page).toHaveURL('/low-page')
    // The new page should contain an h1 with "About"
    await expect(page.locator('h1')).toContainText('This is the low page')
    await expectScrollToBe(0)
    await page.goBack()
    await expect(page).toHaveURL('/')
    await (async () => {
        return new Promise(resolve => {
            setTimeout(() => {
                resolve(1)
            }, 1000)
        })
    })() //Check if Next.js does not brake scroll position later
    await expectScrollToBe(mainPage)
    await page.goForward()
    await expectScrollToBe(0)
//A little bit of stress for app
    await page.goBack()
    await expectScrollToBe(mainPage)
    for (let i = 0; i < 10; i++) {
        await page.goForward()
        await page.goBack()
    }
    await expectScrollToBe(mainPage)
    await page.goForward()

    await expectScrollToBe(0)
    await page.goBack()
    await expectScrollToBe(mainPage)

//End of a little bit of stress for app

    //Test when both pages are high
    await page.goto('/high')
    await expectScrollToBe(0)

    const mainEl = page.getByText('Lets-go to main')
    await mainEl.scrollIntoViewIfNeeded()
    await expectScrollToBe(highPage)
    await mainEl.click()
    await expectScrollToBe(0)

    await page.getByText('Lets-go to low-page').scrollIntoViewIfNeeded()
    await page.getByText('Lets-go to low-page').click()
    await expectScrollToBe(0)
    await page.goBack()
    await expectScrollToBe(mainPage)

    await page.reload()
    await expectScrollToBe(mainPage)

})
