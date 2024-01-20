import {useEffect, useRef,} from "react"
import {getScrollFromState, HistoryState, ScrollPos, setCurrentScrollHistory} from "./storage"

const getWindowScroll = (): ScrollPos => [window.scrollX, window.scrollY]
const memoizationIntervalLimit = 300 as const
const scrollRestorationLimit = memoizationIntervalLimit * 2
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


    const lastTimeScrollMemoRef = useRef<Date | undefined>()
    /**
     * This is important to run as late as possible after navigation.
     * We could use something like `setTimeout(restoreCurrentScroll,500)`, but this is not a reactive approach.
     * useLayoutEffect + usePageHref hook is the latest reactive thing Next.js app can provide to use.
     * In Safari even with `window.history.scrollRestoration = 'manual'` scroll position is reset.
     */
    const timePopstateRestored = useRef<Date | null>(null)
    const scrollMemoTimeoutRef = useRef<ReturnType<typeof setTimeout>>()
    useEffect(() => {
        window.history.scrollRestoration = 'manual'
        const isScrollRestorationAllowed = () => !timePopstateRestored.current ? true : (((new Date()).getTime() - timePopstateRestored.current.getTime()) < scrollRestorationLimit)
        const isScrollMemoAllowed = () => !lastTimeScrollMemoRef.current ? true : (((new Date()).getTime() - lastTimeScrollMemoRef.current.getTime()) > memoizationIntervalLimit)

        const restoreScrollFromState = (state: HistoryState) => {
            timePopstateRestored.current = new Date()
            const scroll = getScrollFromState(state)
            console.log(`Found scroll ${scroll?.toString()}. ${window.location.href}`)
            if (scroll) {
                scrollTo(scroll)
            }
        }
        const popstate = (e: PopStateEvent) => {
            console.log('Popstate started.')
            lastTimeScrollMemoRef.current = undefined
            restoreScrollFromState(e.state as HistoryState)
        }

        const restoreCurrentScroll = () => {
            console.log(`Restoring current scroll position. ${window.location.href}`)
            restoreScrollFromState(window.history.state as HistoryState)
        }
        const rememberScroll = () => {
            lastTimeScrollMemoRef.current = new Date()
            cancelMemoTimeout()
 
            const [x, y] = currentScroll.current
            console.log(`Remember history scroll to ${x} ${y}. Href ${window.location.href}.`)
            if (x === 0 && y === 0) {
                // Sometimes Safari scroll to the start because of unique behavior We restore it back.
                // This case cannot be tested with Playwright, or any other testing library.
                const [prevX, prevY] = getScrollFromState(window.history.state as HistoryState) ?? [0, 0]
                if ((prevX > 0 || prevY > 0) && isScrollRestorationAllowed()) {
                    console.log(`Reverting back scroll because browser tried to brake it. Previous scroll ${prevX} ${prevY}.`)
                    currentScroll.current = [prevX, prevY]
                    restoreCurrentScroll()
                    return
                }

            }
            setCurrentScrollHistory([x, y])
        }
        const unmountPop = () => {
            console.log('Unmount popstate.')

            window.removeEventListener('popstate', popstate)
        }
        const mountPop = () => {
            console.log('Mount popstate.')

            window.addEventListener('popstate', popstate)
        }

        const cancelMemoTimeout = () => {
            if (scrollMemoTimeoutRef.current) {
                clearTimeout(scrollMemoTimeoutRef.current)
            }
            scrollMemoTimeoutRef.current = undefined
        }
        const scrollListener = () => {
            const [x, y] = getWindowScroll()
            currentScroll.current = [x, y]

            console.log(`Wrote scroll to ref ${currentScroll.current[0]} ${currentScroll.current[1]}.`)
            if (((currentScroll.current[0] - x) + (currentScroll.current[1] - y)) > 100) {
                console.log('Workaround for instant scroll non-natural triggered by \'scrollTo\'')
                rememberScroll() //Workaround for instant scroll non-natural triggered by 'scrollTo'
                return
            }
            if (isScrollMemoAllowed()) {
                rememberScroll()
            } else {
                console.log(`Scroll memoization is not allowed. ${window.location.href}`)
                scrollMemoTimeoutRef.current = setTimeout(() => {
                    rememberScroll()
                }, memoizationIntervalLimit)
            }


        }
        const mountScroll = () => {
            console.log('Scroll listener mounted.')
            window.addEventListener('scroll', scrollListener)
        }
        const unmountScroll = () => {
            console.log('Scroll listener unmounted.')
            window.removeEventListener('scroll', scrollListener)

        }
        mountPop()
        mountScroll()
        return () => {
            unmountPop()
            unmountScroll()
            cancelMemoTimeout()
        }
    }, [])
}
export default useScrollRestorer
