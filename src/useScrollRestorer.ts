import {usePathname, useSearchParams} from "next/navigation"
import {useEffect, useRef, useState} from "react"
import getWindowScroll from "./getWindowScroll"
import {restoreScroll} from "./restoreScroll"
import {getScroll, setScroll} from "./storage"
import {ScrollPos} from "./types"
import usePageHref from "./usePageHref"
const getRealHref = ()=>window.location.href
const useScrollRestorer = (): void => {
    const appPaheHref = usePageHref()
    const isTransitioningRef = useRef<ScrollPos|null>(null)
    useEffect(() => {
        console.log('pathname')
        if (null !== isTransitioningRef.current) {
            restoreScroll(isTransitioningRef.current)
        }
        isTransitioningRef.current = null

    }, [appPaheHref])//The transition starts with popstate and is finished when usePathname in application changed
    useEffect(() => {
        window.history.scrollRestoration = 'manual'
        const listener = () => {
            const scroll = getWindowScroll()
            console.log('Remember',getRealHref(),scroll.toString())
            setScroll(window.location.href, scroll)
        }
        const popstate = () => {
            const scroll = getScroll(getRealHref())
            console.log('popstate ',getRealHref(), scroll?.toString())
            isTransitioningRef.current = scroll

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
