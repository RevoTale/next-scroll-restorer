export type ScrollPos = [number, number]
const uniq = 'revotale_nextjs_scroll_restoration' as const
const getKey = (pos: 'x' | 'y') => `${uniq}_${pos}`
export type HistoryState = Record<string, unknown> | null
export const setCurrentScrollHistory = ( [x, y]: ScrollPos) => {
    console.log(`Remember history scroll to ${x} ${y}. Href ${window.location.href}.`)
    x = Math.max(x, 0)
    y = Math.max(y, 0) //Sometime browsers make negative scroll
    const newState: HistoryState = (window.history.state as HistoryState) ?? {}
    window.history.replaceState({
        ...newState,
        [getKey('x')]: x,
        [getKey('y')]: y
    }, '')
}
export const getCurrentScrollHistory = (state: HistoryState): ScrollPos | null => {
    const retrieve = (name: 'x' | 'y') => {

        if (state === null) {
            return null
        }
        const key = getKey(name)
        const value = state[key]
        if (value === null) {
            return null
        }
        const num = Number(value)
        return isNaN(num) ? null : num
    }

    const x = retrieve('x')
    const y = retrieve('y')
    return x !== null && y !== null ? [x, y] : null
}
