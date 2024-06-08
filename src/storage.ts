export type ScrollPos = [number, number]
const uniq = 'revotale_nextjs_scroll_restoration'
type HistoryKeys = 'x' | 'y'| 'memo_timestamp' | 'is_navigating_history' | 'popstate_timestamp'

export const getKey = (pos:HistoryKeys ) => `${uniq}_${pos}`
export type HistoryState = Record<string, unknown> | null
export const setCurrentScrollHistory = ( [x, y]: ScrollPos) => {
    x = Math.max(x, 0)
    y = Math.max(y, 0) //Sometime browsers make negative scroll
    const newState: HistoryState = (window.history.state as HistoryState) ?? {}
    window.history.replaceState({
        ...newState,
        [getKey('x')]: x,
        [getKey('y')]: y,
        [getKey('memo_timestamp')]:(new Date()).getTime()
    }, '')
}
const retrieveNum = (name: HistoryKeys,state:HistoryState) => {

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
export const getScrollFromState = (state: HistoryState): ScrollPos | null => {


    const x = retrieveNum('x',state)
    const y = retrieveNum('y',state)
    return x !== null && y !== null ? [x, y] : null
}
export const getScrollTimestamp = (state: HistoryState):number|null=>retrieveNum('memo_timestamp',state)
export const getPopstateTimestamp = (state: HistoryState):number|null=>retrieveNum('popstate_timestamp',state)
export const getIsNavigatingHistory = (state: HistoryState):boolean=>state?Boolean(state[getKey('is_navigating_history')]):false
