import {useEffect} from "react"
import getWindowScroll from "./getWindowScroll"
import {restoreScroll} from "./restoreScroll"
import {getScroll, setScroll} from "./storage"
import usePageHref from "./usePageHref"

const useScrollRestorer = (): void => {

    const pageHref = usePageHref()
    useEffect(() => {
        window.history.scrollRestoration = 'manual'
        const scroll = getScroll( pageHref)
        if (null !== scroll) {
            restoreScroll(scroll)
        }
    }, [pageHref])
    useEffect(() => {

        const listener = () => {
            const scroll = getWindowScroll()
            setScroll(pageHref, scroll)
        }

        window.addEventListener('scroll', listener)
        return () => {
            window.removeEventListener('scroll', listener)
        }
    }, [pageHref])
}
export default useScrollRestorer
