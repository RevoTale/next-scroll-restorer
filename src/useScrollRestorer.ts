import {useEffect} from "react"
import getWindowScroll from "./getWindowScroll"
import {restoreScroll} from "./restoreScroll"
import {getCurrentScrollHistory, HistoryState, setCurrentScrollHistory} from "./storage"

const useScrollRestorer = (): void => {

    useEffect(() => {
        window.history.scrollRestoration = 'manual'
        const listener = () => {
            const scroll = getWindowScroll()
            setCurrentScrollHistory(window.history.state as HistoryState, scroll)
        }
        const popstate = () => {
            const scroll = getCurrentScrollHistory(window.history.state as HistoryState)
            if (scroll) {
                restoreScroll(scroll)
            }
        }
        window.addEventListener('popstate', popstate)
        window.addEventListener('scroll', listener)
        return () => {
            window.removeEventListener('popstate', popstate)
            window.removeEventListener('scroll', listener)
        }
    }, [])
}
export default useScrollRestorer
