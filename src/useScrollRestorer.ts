import {usePathname, useSearchParams} from "next/navigation";
import {useEffect, useRef, useState} from "react";
import getWindowScroll from "./getWindowScroll";
import {restoreScroll} from "./restoreScroll";
import {getScroll, setScroll} from "./storage";
import {ScrollPos} from "./types";

const useScrollRestorer = ():void=>{

    const pathname = usePathname()

    const params = useSearchParams()
    const hash = useRef('')
    hash.current = `${pathname}?${params.toString()}`
    const isPopState = useRef(false)
    const skipNextZero = useRef(false)
    const [restoreWorkaround,setRestoreWorkaround] = useState<ScrollPos|null>(null)
    useEffect(() => {
        if (restoreWorkaround) {
            restoreScroll(restoreWorkaround)
        }
    }, [restoreWorkaround])//This is important because Next.js app dir currently does not respect lifecycle semantics
    useEffect(() => {
        window.history.scrollRestoration = 'manual'

        const hash = `${pathname}?${params.toString()}`
        const existingScroll = getScroll(hash)??[0,0]
        if (isPopState.current) {
            isPopState.current = false
            skipNextZero.current = true
            if (null !== existingScroll) {
                restoreScroll(existingScroll)
                setRestoreWorkaround(existingScroll)
            }
        }
    }, [params, pathname])
    useEffect(() => {
        const listener = () => {
            isPopState.current = true
        }

        window.addEventListener('popstate', listener,{
            passive:false
        })
        return () => {
            window.removeEventListener('popstate', listener)
        }
    }, [])

    useEffect(() => {

        const listener =  ()=> {
            const scroll = getWindowScroll()
            const [x, y] = scroll

            if (skipNextZero.current && x === 0 && y === 0) {
                skipNextZero.current = false
                return
            }
            setScroll(hash.current, scroll)
        }

        window.addEventListener('scroll', listener, {
            passive: false//This is IMPORTANT because passive listener does not respect synchronization and remembers the wrong state
        })
        return () => {
            window.removeEventListener('scroll', listener)
        }
    }, [params, pathname])
}
export default useScrollRestorer
