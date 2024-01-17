import {useOnChange} from "@bladl/react-hooks"
import {useEffect, useState} from "react"
import getWindowScroll from "./getWindowScroll"
import {restoreScroll} from "./restoreScroll"
import {getScroll, setScroll} from "./storage"
import {ScrollPos} from "./types"
import usePageHref from "./usePageHref"
export type ScrollRestorerOptions = {
    unsafeDelay?:number
}
const getRealHref = () => window.location.href
const useScrollRestorer = ({unsafeDelay}:ScrollRestorerOptions= {}): void => {
    const [scrollToRestore, setScrollToRestore] = useState<ScrollPos | null>(null)
    const appPageHref = usePageHref()
    useOnChange(() => {
        if (null !== scrollToRestore) {

            setScrollToRestore(null)
            if (unsafeDelay) {
                const timeout = setTimeout(()=>{
                    restoreScroll(scrollToRestore)
                },unsafeDelay)
                return ()=>{
                    clearTimeout(timeout)
                }
            } 
                restoreScroll(scrollToRestore)

            
        }
        return undefined
    }, appPageHref)//Such a weird construction is important
    useEffect(() => {
        window.history.scrollRestoration = 'manual'
        const listener = () => {
            const scroll = getWindowScroll()
            setScroll(window.location.href, scroll)
        }
        const popstate = () => {
            setScrollToRestore(getScroll(getRealHref()))
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
