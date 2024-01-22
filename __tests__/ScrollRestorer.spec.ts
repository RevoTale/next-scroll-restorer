import {test, expect,} from '@playwright/test'

const highPage = 1300
const mainPage = 2600
const resolveTimeout = (time: number) => (async () => {
    return new Promise(resolve => {
        setTimeout(() => {
            resolve(1)
        }, time)
    })
})()
test('End to end testing of scroll restorer', async ({page, browserName}) => {
    // Start from the index page (the baseURL is set via the webServer in the playwright.config.ts)
    page.on('console', (msg) => {
        console.log(`${msg.type()}: ${msg.text()}`)
    })

    await page.goto('/')
    // Find an element with the text 'About' and click on it
    const el = page.getByText('Lets-go to low-page')
    const getScrollY = () => page.evaluate((): number => window.scrollY)
    const expectScrollToBe = async (value: number) => {
        await resolveTimeout(50)
        await expect(getScrollY()).resolves.toBeGreaterThanOrEqual(value - 2)
        await expect(getScrollY()).resolves.toBeLessThanOrEqual(value + 2)
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
    await resolveTimeout(1000) //Check if Next.js does not brake scroll position later


    await expectScrollToBe(mainPage)
    await page.goForward()
    await expectScrollToBe(0)
    //A little bit of stress for app
    await page.goBack()

    await expectScrollToBe(mainPage)
    for (let i = 0; i < 10; i++) {
        await page.goForward()
        await resolveTimeout(10)//Sometimes browsers struggle to restore the same millisecond
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
    await page.waitForURL('/high')
    await expectScrollToBe(highPage)
    await mainEl.click()
    await expectScrollToBe(0)
    await page.waitForURL('/')


    await page.getByText('Lets-go to low-page').scrollIntoViewIfNeeded()
    await expectScrollToBe(mainPage)

    await page.getByText('Lets-go to low-page').click()

    await expectScrollToBe(0)
    await page.waitForURL('/low-page')

    await page.goBack()

    await expectScrollToBe(mainPage)
    await page.waitForURL('/')
    await page.goBack()
    await expectScrollToBe(highPage)
    await page.waitForURL('/high')
    await page.goForward()
    await page.waitForURL('/')
    await expectScrollToBe(mainPage)


    await page.reload()
    if (browserName === "firefox") {
        await page.goBack() //Firefox pushed new history entry history after reload https://github.com/microsoft/playwright/issues/22640
    }
    await resolveTimeout(1000)//Sometimes browsers struggle to restore the same millisecond
    await expectScrollToBe(mainPage)

    //Test for a scroll to not produce any errors. https://github.com/sveltejs/kit/issues/365
    let error: string | null = null
    page.on("console", (msg) => {
        if (msg.type() === 'error') {
            error = msg.text()
        }
    })
    await resolveTimeout(2000) // Timeout for safari scroll bug navigation workaround.

    const smoothScrollTop = async () => {
        console.log('Scrolling to top.')

        await page.evaluate(() => {
            window.scrollTo({
                top: 0,
                left: 0,
                behavior: "smooth",
            })
        })

        await page.waitForFunction(() => {
            return window.scrollY === 0
        }, '', {
            timeout: 10000,
            polling: 500

        })
        await expectScrollToBe(0)
    }
    const smoothScrollBottom = async () => {
        console.log('Scrolling to bottom.')
        await page.evaluate((top) => {
            window.scrollTo({
                top,
                left: 0,
                behavior: "smooth",
            })
        }, mainPage)
        await page.waitForFunction((top) => window.scrollY >= top - 2, mainPage, {
            timeout: 10000,
            polling: 500
        })

        await expectScrollToBe(mainPage)
    }
    //This is a very important test to stress out 'scroll' event
    // DO NOT CHANGE THIS TEST IN ANY WAY!
    for (let i = 0; i < 10; i++) {
        console.log(`Iteration ${i}.`)
        await smoothScrollTop()
        await smoothScrollBottom()
    }

    expect(error).toBe(null)

})
