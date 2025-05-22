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
const getScrollY = (page: Page) => page.evaluate((): number => window.scrollY)

const expectScrollToBe = async (page: Page, value: number) => {
    await resolveTimeout(50)
    await expect(getScrollY(page)).resolves.toBeGreaterThanOrEqual(value - 2)
    await expect(getScrollY(page)).resolves.toBeLessThanOrEqual(value + 2)
}
const scrollPage = (page: Page, scrollY: number) => {
    return page.evaluate(async (value) => {
        return await new Promise((resolve) => {
            if (window.scrollY === value) {
                resolve(true)
                return
            }
            const timeout = setTimeout(() => {
                window.scrollTo({
                    top: value,
                    left: 0,
                    behavior: "smooth",
                })
            }, 500)//There are lags 3with smooth scroll behavior. THis is workaround to trigger scroll again.
            const listener = () => {
                const diff = (value - window.scrollY)
                if (-2 < diff && diff < 2) {
                    window.removeEventListener('scroll', listener)
                    resolve(true)
                    clearTimeout(timeout)
                }

            }
            window.addEventListener('scroll', listener, {
                passive: true
            })
            window.scrollTo({
                top: value,
                left: 0,
                behavior: "smooth",
            })

        })
    }, scrollY)
}
const initTests = async (page: Page) => {

    await page.goto('/')
    // Default behavior to start.
    const el = page.getByText('Lets-go to low-page')
    await expectScrollToBe(page, 0)
    await el.scrollIntoViewIfNeeded()
    await expectScrollToBe(page, mainPage)
    await el.click()
    await expect(page).toHaveURL('/low-page')
    await expect(page.locator('h1')).toContainText('This is the low page')
    await expectScrollToBe(page, 0)
    await page.goBack()
}
test('End to end testing of scroll restorer', async ({page, browserName}) => {

    await initTests(page)
    await expect(page).toHaveURL('/')
    await resolveTimeout(1000) //Check if Next.js does not brake scroll position later
    await expectScrollToBe(page, mainPage)
    await page.goForward()
    await expectScrollToBe(page, 0)
    //A little bit of stress for app
    await page.goBack()

    await expectScrollToBe(page, mainPage)
    for (let i = 0; i < 10; i++) {
        await page.goForward()
        await resolveTimeout(10)//Sometimes browsers struggle to restore the same millisecond
        await page.goBack()
    }

    await expectScrollToBe(page, mainPage)
    await page.goForward()

    await expectScrollToBe(page, 0)
    await page.goBack()
    await expectScrollToBe(page, mainPage)

//End of a little bit of stress for app

    //Test when both pages are high
    await page.goto('/high')
    await expectScrollToBe(page, 0)

    const mainEl = page.getByText('Lets-go to main')
    await mainEl.scrollIntoViewIfNeeded()
    await page.waitForURL('/high')
    await expectScrollToBe(page, highPage)
    await mainEl.click()
    await expectScrollToBe(page, 0)
    await page.waitForURL('/')


    await page.getByText('Lets-go to low-page').scrollIntoViewIfNeeded()
    await expectScrollToBe(page, mainPage)

    await page.getByText('Lets-go to low-page').click()

    await expectScrollToBe(page, 0)
    await page.waitForURL('/low-page')

    await page.goBack()

    await expectScrollToBe(page, mainPage)
    await page.waitForURL('/')
    await page.goBack()
    await expectScrollToBe(page, highPage)
    await page.waitForURL('/high')
    await page.goForward()
    await page.waitForURL('/')
    await expectScrollToBe(page, mainPage)


    await page.reload()
    if (browserName === "firefox") {
        await page.goBack() //Firefox pushed new history entry history after reload https://github.com/microsoft/playwright/issues/22640
    }
    await resolveTimeout(1000)//Sometimes browsers struggle to restore the same millisecond
    await expectScrollToBe(page, mainPage)



    await page.getByText('Lets-go without scroll').scrollIntoViewIfNeeded()
    await expectScrollToBe(page, mainPage)
    await page.getByText('Lets-go without scroll').click()
    await page.waitForURL('/?fff=fff')
    await expectScrollToBe(page, mainPage)

})

test('Safari scroll reset bug simulation', async ({page}) => {
    await initTests(page)
    await page.goForward()
    await expectScrollToBe(page, 0)
    await page.goBack()
    await page.evaluate(() => {
        window.scrollTo({
            top: 0,
            behavior: 'instant'
        })
    })//This is actual bug behaviour

    await resolveTimeout(500) //Webkit does it not immediately
    await expectScrollToBe(page, mainPage)
    await page.evaluate(() => {
        window.scrollTo({
            top: 0,
            behavior: 'instant'
        })
    })//Test second time, it should allow scroll

    await resolveTimeout(500) //Webkit does it not immediately
    await expectScrollToBe(page, 0)


})
//I keep this test to have amount of test
test('Some random behaviour 1',async ({page})=>{
    await page.goto('/')
    await expectScrollToBe(page, 0)

    await page.goto('/high')
    await page.waitForURL('/high')
    await expectScrollToBe(page, 0)
    
    await scrollPage(page,highPage)
    await expectScrollToBe(page, highPage)

    await page.goto('/low-page')
    await page.waitForURL('/low-page')
    await expectScrollToBe(page, 0)

    await resolveTimeout(400)
    await expectScrollToBe(page, 0)


   
})
test('Some random behaviour 2',async ({page})=>{
    await page.goto('/')
    await expectScrollToBe(page, 0)
    await scrollPage(page,mainPage)
    await page.goto('/high')
    await page.waitForURL('/high')
    await expectScrollToBe(page, 0)
    
    await resolveTimeout(500)
    await expectScrollToBe(page, 0)


   
})
test('Some random behaviour 3 (bug fix)',async ({page})=>{
    await page.goto('/')
    await expectScrollToBe(page, 0)
    await scrollPage(page,highPage/2)
    await page.goto('/high-with-loading')
    await page.waitForURL('/high-with-loading')
    await expectScrollToBe(page, 0)
    
    await resolveTimeout(1002)
    await expectScrollToBe(page, 0)


   
})
test('Smooth scrolling', async ({page}) => {
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
        await scrollPage(page, 0)
        await expectScrollToBe(page, 0)
    }
    const smoothScrollBottom = async () => {
        console.log('Scrolling to bottom.')

        await scrollPage(page, mainPage)

        await expectScrollToBe(page, mainPage)
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
