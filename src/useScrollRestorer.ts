/* eslint-disable no-console -- console required for debugging. Its dropped with bundler on production. */
import {usePathname, useSearchParams} from "next/navigation"
import {useEffect, useLayoutEffect, useRef,} from "react"
import {
    getIsNavigatingHistory, getKey, getPopstateTimestamp,
    getScrollFromState,
    getScrollTimestamp,
    type HistoryState,
    type ScrollPos,
    setCurrentScrollHistory
} from "./storage"
import { isRecord } from "./util"

const getWindowScroll = (): ScrollPos => [window.scrollX, window.scrollY]
const memoizationIntervalLimit = 601//100 times per 30 seconds
const safariBugWorkaroundTimeThreshold = 2000 //Safari reset scroll position to 0 0 after popstate for some reason.

const getState = ():HistoryState => {
    const state = window.history.state as unknown
    return isRecord(state)?state:null
}
const restoreScrollFromState = (state: HistoryState):void => {
    const scroll = getScrollFromState(state)
    console.log(`Found scroll ${scroll?.toString()}. ${window.location.href}`)
    if (scroll !== null) {
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
const restoreCurrentScrollPosition = ():void => {
    console.log(`Restoring current scroll position. ${window.location.href}`)
    restoreScrollFromState(getState())
}
const defaultMemoInterval = 0
const numericTrue = 1
const defaultX = 0
const defaultY = 0
const useScrollRestorer = (): void => {
    const pathname = usePathname()
    const searchparams = useSearchParams()


    useLayoutEffect(() => {
        console.log('Restoring based on hooks.')
        restoreCurrentScrollPosition()
    }, [pathname, searchparams])
    const scrollMemoTimeoutRef = useRef<ReturnType<typeof setTimeout>>(undefined)
    const scrollMemoCountInInterval = useRef<number>(defaultMemoInterval)//Used to workaround instant scrollTo() calls.It's used to work around immediate scroll in tests and possible real world behaviour.
    const isSafariWorkaroundAllowedRef = useRef(false)
    useEffect(() => {
        window.history.scrollRestoration = 'manual'

        const navigationListener = ({state:eState}: PopStateEvent):void => {
            console.log('Popstate started.')
            cancelDelayedScrollMemoization()

            isSafariWorkaroundAllowedRef.current = true
            const state = (isRecord(eState)?eState:null) ?? {}
            window.history.replaceState({
                ...state,
                [getKey('is_navigating_history')]: numericTrue,
                [getKey('popstate_timestamp')]: (new Date()).getTime()
            }, '')
        }


        /**
         * This is important to run as late as possible after navigation.
         * We could use something like `setTimeout(restoreCurrentScroll,500)`, but this is not a reactive approach.
         * useLayoutEffect + usePageHref hook is the latest reactive thing Next.js app can provide to use.
         * In Safari even with `window.history.scrollRestoration = 'manual'` scroll position is reset.
         */
        const workaroundSafariBreaksScrollRestoration = ([x, y]: ScrollPos):boolean => {
            const state = getState()


            // Sometimes Safari scroll to the start because of unique behavior We restore it back.
            // This case cannot be tested with Playwright, or any other testing library.
            if ((x === defaultX && y === defaultY) &&  isSafariWorkaroundAllowedRef.current) {
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
        const rememberScrollPosition = (pos: ScrollPos):void => {
            // eslint-disable-next-line @typescript-eslint/no-magic-numbers -- it's stale index
            console.log(`Remember history scroll to ${pos[0]} ${pos[1]}. Href ${window.location.href}.`)
            cancelDelayedScrollMemoization()
            setCurrentScrollHistory(pos)
        }
        const unmountNavigationListener = () :void=> {
            console.log('Unmount popstate.')

            window.removeEventListener('popstate', navigationListener)
        }
        const mountNavigationListener = ():void => {
            console.log('Mount popstate.')

            window.addEventListener('popstate', navigationListener, {
                passive: true
            })
        }

        const cancelDelayedScrollMemoization = ():void => {
            if (scrollMemoTimeoutRef.current !== undefined) {
                console.log(`Cancelled delayed memoization.`)
                clearTimeout(scrollMemoTimeoutRef.current)
                scrollMemoTimeoutRef.current = undefined
            }

        }

        const scrollMemoizationHandler = (pos: ScrollPos):void => {
            const isScrollMemoAllowedNow = ():boolean => {
                const timestamp = getScrollTimestamp(getState())
                if (timestamp === null) {
                    return true
                }
                return (new Date()).getTime() - timestamp > memoizationIntervalLimit
            }

            const isAllowedNow = isScrollMemoAllowedNow()
            console.log(`Handle scroll event. Memo allowed: ${isAllowedNow}.`)
            if (isAllowedNow) {
                scrollMemoCountInInterval.current = defaultMemoInterval
            }
            if (isAllowedNow || scrollMemoCountInInterval.current < scrollMemoIntervalCountLimit) {
                scrollMemoCountInInterval.current++
                rememberScrollPosition(pos)
            } else {
                console.log(`Scroll memoization is not allowed. ${window.location.href}`)
                if (scrollMemoTimeoutRef.current === undefined) {
                    // eslint-disable-next-line @typescript-eslint/no-magic-numbers -- it's just a fixed index
                    console.log(`Set delayed memoization ${pos[0]} ${pos[1]}`)
                    scrollMemoTimeoutRef.current = setTimeout(() => {
                        rememberScrollPosition(pos)
                        scrollMemoCountInInterval.current = defaultMemoInterval
                        scrollMemoTimeoutRef.current = undefined
                    }, memoizationIntervalLimit)
                }

            }
        }
        const scrollListener = ():void => {
            cancelDelayedScrollMemoization()
            const scroll = getWindowScroll()

            console.log(`Scroll event ${scroll.toString()}. ${window.location.href}`)
            workaroundSafariBreaksScrollRestoration(scroll)

            scrollMemoizationHandler(scroll)


        }
        const mountScrollListener = () :void=> {
            console.log('Scroll listener mounted.')
            window.addEventListener('scroll', scrollListener, {
                passive: true
            })
        }
        const unmountScrollListener = ():void => {
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
