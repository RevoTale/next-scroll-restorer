import {useEffect, useLayoutEffect,} from "react"
import {getScrollFromState, HistoryState, ScrollPos, setCurrentScrollHistory} from "./storage"
import usePageHref from "./usePageHref"

const browserInfluenceDetectorOffset = 80
const getWindowScroll = (): ScrollPos => [window.scrollX, window.scrollY]

const restoreScroll = ([left, top]: ScrollPos) => {
    console.log(`Scroll restored to ${left} ${top}.`)
    window.scroll({
        behavior: 'instant',
        left,
        top
    })
}


const popstate = (e: PopStateEvent) => {
    console.log('Popstate started.')
    console.log(e.state, window.history.state)
    const scroll = getScrollFromState(e.state as HistoryState)
    console.log(`Found scroll ${scroll?.toString()}.`)
    if (scroll) {
        restoreScroll(scroll)
    }
}
const unmountPop = () => {
    console.log('Unmount popstate.')

    window.removeEventListener('popstate', popstate)
}
const mountPop = () => {
    console.log('Mount popstate.')

    window.addEventListener('popstate', popstate)
}
const restoreCurrentScroll = () => {
    const scroll = getScrollFromState(window.history.state as HistoryState)
    console.log(`Restoring current scroll position. ${scroll?.toString()}`)

    if (scroll) {
        restoreScroll(scroll)
    }
}
const useScrollRestorer = (): void => {
    const appHref = usePageHref()
    useLayoutEffect(() => {
        /**
         * This is important to run as late as possible after navigation.
         * We could use something like `setTimeout(restoreCurrentScroll,500)`, but this is not a reactive approach.
         * useLayoutEffect + usePageHref hook is the latest reactive thing Next.js app can provide to use.
         * In Safari even with `window.history.scrollRestoration = 'manual'` scroll position is reset.
         */
        console.log(`Layout effect ${window.scrollY}`)
        restoreCurrentScroll()
    }, [appHref])
    /*useEffect(() => {
        window.addEventListener('load',()=>{
            console.log('Window loaded.')
            restoreCurrentScroll()
        })
    }, [])*/
    useEffect(() => {
        window.history.scrollRestoration = 'manual'

        const scrollListener = () => {
            const scroll = getWindowScroll()
            const [x,y] = scroll
            if (x === 0 && y === 0) {
                // Sometimes Safari scroll to the start because of weird behaviour We restore it back.
                const [prevX,prevY] = getScrollFromState(window.history.state as HistoryState)??[0,0]
                if ((prevX>0 || prevY>0) && (prevX>browserInfluenceDetectorOffset || prevY>browserInfluenceDetectorOffset)) {
                    console.log('Reverting back scroll because browser tried to brake it.')
                    restoreCurrentScroll()
                }
            }
            setCurrentScrollHistory(scroll)
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
        }
    }, [])
}
export default useScrollRestorer
