import {usePathname, useSearchParams} from "next/navigation"
import {useEffect, useLayoutEffect, useRef,} from "react"
import {
    getIsNavigatingHistory, getKey, getPopstateTimestamp,
    getScrollFromState,
    getScrollTimestamp,
    HistoryState,
    ScrollPos,
    setCurrentScrollHistory
} from "./storage"

const getWindowScroll = (): ScrollPos => [window.scrollX, window.scrollY]
const memoizationIntervalLimit = 601//100 times per 30 seconds
const safariBugWorkaroundTimeThreshold = 2000 //Safari reset scroll position to 0 0 after popstate for some reason.
const getState = () => window.history.state as HistoryState
const restoreScrollFromState = (state: HistoryState) => {
    const scroll = getScrollFromState(state)
    console.log(`Found scroll ${scroll?.toString()}. ${window.location.href}`)
    if (scroll) {
        const [x, y] = scroll
        console.log(`Scroll restored to ${x} ${y}. Document height ${window.document.body.clientHeight}.`)
        window.scrollTo({
            behavior: 'instant',
            left: x,
            top: y
        })
        console.log(`Scroll is ${window.scrollX} ${window.scrollY} after restoring. ${window.innerHeight}`)
    }
}
const scrollMemoIntervalCountLimit = 2
const restoreCurrentScrollPosition = () => {
    console.log(`Restoring current scroll position. ${window.location.href}`)
    restoreScrollFromState(getState())
}
const useScrollRestorer = (): void => {
    const pathname = usePathname()
    const searchparams = useSearchParams()


    useLayoutEffect(() => {
        console.log('Restoring based on hooks.')
        restoreCurrentScrollPosition()
    }, [pathname, searchparams])
    const scrollMemoTimeoutRef = useRef<ReturnType<typeof setTimeout>>(undefined)
    const scrollMemoCountInInterval = useRef<number>(0)//Used to workaround instant scrollTo() calls.It's used to work around immediate scroll in tests and possible real world behaviour.
    const isSafariWorkaroundAllowedRef = useRef(false)
    useEffect(() => {
        window.history.scrollRestoration = 'manual'

        const navigationListener = (e: PopStateEvent) => {
            console.log('Popstate started.')
            cancelDelayedScrollMemoization()

            isSafariWorkaroundAllowedRef.current = true
            const state = e.state as HistoryState ?? {}
            window.history.replaceState({
                ...state,
                [getKey('is_navigating_history')]: 1,
                [getKey('popstate_timestamp')]: (new Date()).getTime()
            }, '')
        }


        /**
         * This is important to run as late as possible after navigation.
         * We could use something like `setTimeout(restoreCurrentScroll,500)`, but this is not a reactive approach.
         * useLayoutEffect + usePageHref hook is the latest reactive thing Next.js app can provide to use.
         * In Safari even with `window.history.scrollRestoration = 'manual'` scroll position is reset.
         */
        const workaroundSafariBreaksScrollRestoration = ([x, y]: ScrollPos) => {
            const state = getState()


            // Sometimes Safari scroll to the start because of unique behavior We restore it back.
            // This case cannot be tested with Playwright, or any other testing library.
            if ((x === 0 && y === 0) &&  isSafariWorkaroundAllowedRef.current) {
                const isWorkaroundAllowed = (() => {
                    const timeNavigated = getPopstateTimestamp(state)
                    if (timeNavigated === null) {
                        return false
                    }
                    return (((new Date()).getTime() - timeNavigated) < safariBugWorkaroundTimeThreshold)
                })() //Place here to prevent many computations
                const isNavHistory = getIsNavigatingHistory(state)
                console.log(`Check workaround for safari: ${x} ${y} ${isWorkaroundAllowed}. Is popstate ${isNavHistory}. ${window.location.href}`)
                if (isWorkaroundAllowed && isNavHistory) {
                    console.log(`Reverting back scroll because browser tried to brake it..`)
                    restoreCurrentScrollPosition()
                    isSafariWorkaroundAllowedRef.current = false //Safari bug appears only once
                    return true
                }
            }

            return false
        }
        const rememberScrollPosition = (pos: ScrollPos) => {
            console.log(`Remember history scroll to ${pos[0]} ${pos[1]}. Href ${window.location.href}.`)
            cancelDelayedScrollMemoization()
            setCurrentScrollHistory(pos)
        }
        const unmountNavigationListener = () => {
            console.log('Unmount popstate.')

            window.removeEventListener('popstate', navigationListener)
        }
        const mountNavigationListener = () => {
            console.log('Mount popstate.')

            window.addEventListener('popstate', navigationListener, {
                passive: true
            })
        }

        const cancelDelayedScrollMemoization = () => {
            if (scrollMemoTimeoutRef.current) {
                console.log(`Cancelled delayed memoization.`)
                clearTimeout(scrollMemoTimeoutRef.current)
                scrollMemoTimeoutRef.current = undefined
            }

        }

        const scrollMemoizationHandler = (pos: ScrollPos) => {
            const isScrollMemoAllowedNow = () => {
                const timestamp = getScrollTimestamp(getState())
                if (null === timestamp) {
                    return true
                }
                return (new Date()).getTime() - timestamp > memoizationIntervalLimit
            }

            const isAllowedNow = isScrollMemoAllowedNow()
            console.log(`Handle scroll event. Memo allowed: ${isAllowedNow}.`)
            if (isAllowedNow) {
                scrollMemoCountInInterval.current = 0
            }
            if (isAllowedNow || scrollMemoCountInInterval.current < scrollMemoIntervalCountLimit) {
                scrollMemoCountInInterval.current++
                rememberScrollPosition(pos)
            } else {
                console.log(`Scroll memoization is not allowed. ${window.location.href}`)
                if (!scrollMemoTimeoutRef.current) {
                    console.log(`Set delayed memoization ${pos[0]} ${pos[1]}`)
                    scrollMemoTimeoutRef.current = setTimeout(() => {
                        rememberScrollPosition(pos)
                        scrollMemoCountInInterval.current = 0
                        scrollMemoTimeoutRef.current = undefined
                    }, memoizationIntervalLimit)
                }

            }
        }
        const scrollListener = () => {
            cancelDelayedScrollMemoization()
            const scroll = getWindowScroll()

            console.log(`Scroll event ${scroll.toString()}. ${window.location.href}`)
            workaroundSafariBreaksScrollRestoration(scroll)

            scrollMemoizationHandler(scroll)


        }
        const mountScrollListener = () => {
            console.log('Scroll listener mounted.')
            window.addEventListener('scroll', scrollListener, {
                passive: true
            })
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
