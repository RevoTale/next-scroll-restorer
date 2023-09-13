import {ScrollPos} from "./types"

const uniq = 'rusted_labs_nextjs_scroll_restoration'
const getKey = (hash: string, pos: 'x' | 'y' ) => `${uniq}_${hash}_${pos}`

export const setScroll = (hash: string, [x, y]: ScrollPos) => {
    x = Math.max(x,0)
    y = Math.max(y,0)
    console.log('Remember scroll', hash, x, y)
    if (x === 0 && y === 0) {
        return
    }
    sessionStorage.setItem(getKey(hash, 'x'), x.toString())
    sessionStorage.setItem(getKey(hash, 'y'), y.toString())
}
export const getScroll = (hash: string): ScrollPos | null => {
    const scrollX = sessionStorage.getItem(getKey(hash, 'x'))
    const scrollY = sessionStorage.getItem(getKey(hash, 'y'))
    if (null === scrollX || null === scrollY) {
        return null
    }
    return [Number(scrollX), Number(scrollY)]
}
