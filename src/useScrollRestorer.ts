import {useEffect, useRef,} from "react"
import {getScrollFromState, HistoryState, ScrollPos, setCurrentScrollHistory} from "./storage"

const getWindowScroll = (): ScrollPos => [window.scrollX, window.scrollY]
const memoizationIntervalLimit = 300 as const
const scrollRestorationThreshold = memoizationIntervalLimit * 2
const scrollTo = ([left, top]: ScrollPos) => {
    console.log(`Scroll restored to ${left} ${top}.`)
    window.scroll({
        behavior: 'instant',
        left,
        top
    })
}
const useScrollRestorer = (): void => {


    const currentScroll = useRef<ScrollPos>([0, 0])


    const lastTimeScrollRememberOnThisPageRef = useRef<Date | undefined>()
    /**
     * This is important to run as late as possible after navigation.
     * We could use something like `setTimeout(restoreCurrentScroll,500)`, but this is not a reactive approach.
     * useLayoutEffect + usePageHref hook is the latest reactive thing Next.js app can provide to use.
     * In Safari even with `window.history.scrollRestoration = 'manual'` scroll position is reset.
     */
    const lastNavigationTime = useRef<Date >(new Date())
    const scrollMemoTimeoutRef = useRef<ReturnType<typeof setTimeout>>()
    useEffect(() => {
        window.history.scrollRestoration = 'manual'
        const isScrollMemoAllowed = () => !lastTimeScrollRememberOnThisPageRef.current ? true : (((new Date()).getTime() - lastTimeScrollRememberOnThisPageRef.current.getTime()) > memoizationIntervalLimit)

        const restoreScrollFromState = (state: HistoryState) => {
            const scroll = getScrollFromState(state)
            console.log(`Found scroll ${scroll?.toString()}. ${window.location.href}`)
            if (scroll) {
                scrollTo(scroll)
            }
        }
        const navigationListener = (e: PopStateEvent) => {
            console.log('Popstate started.')
            lastNavigationTime.current = new Date()
            cancelDelayedScrollMemoization()
            lastTimeScrollRememberOnThisPageRef.current = undefined
            restoreScrollFromState(e.state as HistoryState)
        }

        const restoreCurrentScrollPosition = () => {
            console.log(`Restoring current scroll position. ${window.location.href}`)
            restoreScrollFromState(window.history.state as HistoryState)
        }
        const workaroundSafariBreaksScrollRestoration = () => {
            const isScrollRestorationAllowed = () =>  (((new Date()).getTime() - lastNavigationTime.current.getTime()) < scrollRestorationThreshold)
            console.log(`Workaround for safari checker ${isScrollRestorationAllowed()}. ${window.location.href}`)

            const [x, y] = getWindowScroll()
            if (x === 0 && y === 0) {
                // Sometimes Safari scroll to the start because of unique behavior We restore it back.
                // This case cannot be tested with Playwright, or any other testing library.
                const prevScroll = getScrollFromState(window.history.state as HistoryState)
                if (null  !== prevScroll) {
                    const [prevX, prevY] = prevScroll

                    if ((prevX > 0 || prevY > 0) && isScrollRestorationAllowed()) {
                        console.log(`Reverting back scroll because browser tried to brake it. Previous scroll ${prevX} ${prevY}.`)
                        restoreCurrentScrollPosition()

                        return true
                    }
                }
            }
            return false
        }
        const rememberScrollPosition = () => {
            console.log(`Remember history scroll to ${currentScroll.current.toString()}. Href ${window.location.href}.`)
            cancelDelayedScrollMemoization()
            lastTimeScrollRememberOnThisPageRef.current = new Date()
            setCurrentScrollHistory(currentScroll.current)
        }
        const unmountNavigationListener = () => {
            console.log('Unmount popstate.')

            window.removeEventListener('popstate', navigationListener)
        }
        const mountNavigationListener = () => {
            console.log('Mount popstate.')

            window.addEventListener('popstate', navigationListener)
        }

        const cancelDelayedScrollMemoization = () => {
            console.log(`Cancel delayed memoization.`)

            if (scrollMemoTimeoutRef.current) {
                clearTimeout(scrollMemoTimeoutRef.current)
            }
        }
        const scrollMemoizationHandler = ()=>{
            const isAllowed = isScrollMemoAllowed()
            console.log(`Handle scroll event. ${isAllowed}`)

            if (isAllowed) {
                rememberScrollPosition()
            } else {
                console.log(`Scroll memoization is not allowed. ${window.location.href}`)
                scrollMemoTimeoutRef.current = setTimeout(() => {
                    rememberScrollPosition()
                }, memoizationIntervalLimit)
            }
        }
        const scrollListener = () => {
            const scroll = getWindowScroll()
            console.log(`Wrote scroll to ref ${scroll.toString()}.`)
            currentScroll.current = scroll
            
            workaroundSafariBreaksScrollRestoration()

            scrollMemoizationHandler()


        }
        const mountScrollListener = () => {
            console.log('Scroll listener mounted.')
            window.addEventListener('scroll', scrollListener)
        }
        const unmountScrollListener = () => {
            console.log('Scroll listener unmounted.')
            window.removeEventListener('scroll', scrollListener)

        }
        mountNavigationListener()
        mountScrollListener()
        return () => {
            unmountNavigationListener()
            unmountScrollListener()
            cancelDelayedScrollMemoization()
        }
    }, [])
}
export default useScrollRestorer
