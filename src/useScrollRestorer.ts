import {useEffect, useRef, useState} from "react"
import getWindowScroll from "./getWindowScroll"
import {restoreScroll} from "./restoreScroll"
import {getScroll, setScroll} from "./storage"
import {ScrollPos} from "./types"
import usePageHash from "./usePageHash";

const useScrollRestorer = (): void => {

    const pageHash = usePageHash()
    const isNavigatingNewPage = useRef(false)
    const skipNextZero = useRef(false)
    const [restoreWorkaround, setRestoreWorkaround] = useState<ScrollPos | null>(null)
    useEffect(() => {
        if (restoreWorkaround) {
            restoreScroll(restoreWorkaround)
        }
    }, [restoreWorkaround])//This is important because Next.js app dir currently does not respect lifecycle semantics
    useEffect(() => {
        window.history.scrollRestoration = 'manual'

        const existingScroll = getScroll(pageHash) ?? [0, 0]
        if (isNavigatingNewPage.current) {
            isNavigatingNewPage.current = false
            skipNextZero.current = true
            if (null !== existingScroll) {
                restoreScroll(existingScroll)
                setRestoreWorkaround(existingScroll)
            }
        }
    }, [pageHash])
    useEffect(() => {
        const listener = () => {
            isNavigatingNewPage.current = true
        }

        window.addEventListener('popstate', listener, {
            passive: false
        })
        return () => {
            window.removeEventListener('popstate', listener)
        }
    }, [])

    useEffect(() => {

        const listener = () => {
            const scroll = getWindowScroll()
            const [x, y] = scroll

            if (skipNextZero.current && x === 0 && y === 0) {
                skipNextZero.current = false
                return
            }
            setScroll(pageHash, scroll)
        }

        window.addEventListener('scroll', listener, {
            passive: false//This is IMPORTANT because passive listener does not respect synchronization and remembers the wrong state
        })
        return () => {
            window.removeEventListener('scroll', listener)
        }
    }, [pageHash])
}
export default useScrollRestorer
