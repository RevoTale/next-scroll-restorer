import {useEffect} from "react"
import getWindowScroll from "./getWindowScroll"
import {restoreScroll} from "./restoreScroll"
import {getScroll, setScroll} from "./storage"
import usePageHref from "./usePageHref"

const useScrollRestorer = (): void => {

    const triggerStringForScrollRestore = usePageHref() //We rely on thing instead of 'popstate' event because seems like it fires later
    useEffect(() => {
        window.history.scrollRestoration = 'manual'
        const scroll = getScroll( window.location.href)
        if (null !== scroll) {
            restoreScroll(scroll)
        }
    }, [triggerStringForScrollRestore])
    useEffect(() => {

        const listener = () => {
            const scroll = getWindowScroll()
            setScroll(window.location.href, scroll)
        }

        window.addEventListener('scroll', listener)
        return () => {
            window.removeEventListener('scroll', listener)
        }
    }, [])
}
export default useScrollRestorer
