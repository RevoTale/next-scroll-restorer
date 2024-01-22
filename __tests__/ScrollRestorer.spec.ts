import {test, expect, Page,} from '@playwright/test'

const highPage = 1300
const mainPage = 2600
const resolveTimeout = (time: number) => (async () => {
    return new Promise(resolve => {
        setTimeout(() => {
            resolve(1)
        }, time)
    })
})()
const getScrollY = (page:Page) => page.evaluate((): number => window.scrollY)

const expectScrollToBe = async (page:Page,value: number) => {
    await resolveTimeout(50)
    await expect(getScrollY(page)).resolves.toBeGreaterThanOrEqual(value - 2)
    await expect(getScrollY(page)).resolves.toBeLessThanOrEqual(value + 2)
}
const initTests = async (page:Page)=>{
    // Start from the index page (the baseURL is set via the webServer in the playwright.config.ts)
    page.on('console', (msg) => {
        console.log(`${msg.type()}: ${msg.text()}`)
    })
    await page.goto('/')
    // Default behavior to start.
    const el = page.getByText('Lets-go to low-page')
    await expectScrollToBe(page,0)
    await el.scrollIntoViewIfNeeded()
    await expectScrollToBe(page,mainPage)
    await el.click()
    await expect(page).toHaveURL('/low-page')
    await expect(page.locator('h1')).toContainText('This is the low page')
    await expectScrollToBe(page,0)
    await page.goBack()
}
test('End to end testing of scroll restorer', async ({page, browserName}) => {

    await initTests(page)
    await expect(page).toHaveURL('/')
    await resolveTimeout(1000) //Check if Next.js does not brake scroll position later
    await expectScrollToBe(page,mainPage)
    await page.goForward()
    await expectScrollToBe(page,0)
    //A little bit of stress for app
    await page.goBack()

    await expectScrollToBe(page,mainPage)
    for (let i = 0; i < 10; i++) {
        await page.goForward()
        await resolveTimeout(10)//Sometimes browsers struggle to restore the same millisecond
        await page.goBack()
    }

    await expectScrollToBe(page,mainPage)
    await page.goForward()

    await expectScrollToBe(page,0)
    await page.goBack()
    await expectScrollToBe(page,mainPage)

//End of a little bit of stress for app

    //Test when both pages are high
    await page.goto('/high')
    await expectScrollToBe(page,0)

    const mainEl = page.getByText('Lets-go to main')
    await mainEl.scrollIntoViewIfNeeded()
    await page.waitForURL('/high')
    await expectScrollToBe(page,highPage)
    await mainEl.click()
    await expectScrollToBe(page,0)
    await page.waitForURL('/')


    await page.getByText('Lets-go to low-page').scrollIntoViewIfNeeded()
    await expectScrollToBe(page,mainPage)

    await page.getByText('Lets-go to low-page').click()

    await expectScrollToBe(page,0)
    await page.waitForURL('/low-page')

    await page.goBack()

    await expectScrollToBe(page,mainPage)
    await page.waitForURL('/')
    await page.goBack()
    await expectScrollToBe(page,highPage)
    await page.waitForURL('/high')
    await page.goForward()
    await page.waitForURL('/')
    await expectScrollToBe(page,mainPage)


    await page.reload()
    if (browserName === "firefox") {
        await page.goBack() //Firefox pushed new history entry history after reload https://github.com/microsoft/playwright/issues/22640
    }
    await resolveTimeout(1000)//Sometimes browsers struggle to restore the same millisecond
    await expectScrollToBe(page,mainPage)

})

test('Smooth scrolling',async ({page}) => {
    await initTests(page)

    //Test for a scroll to not produce any errors. Https://github.com/sveltejs/kit/issues/365
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
        await expectScrollToBe(page,0)
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

        await expectScrollToBe(page,mainPage)
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
