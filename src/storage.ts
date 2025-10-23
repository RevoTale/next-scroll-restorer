import { isRecord } from "./util"

export type ScrollPos = [number, number]
const uniq = 'revotale_nextjs_scroll_restoration'
type HistoryKeys = 'x' | 'y'| 'memo_timestamp' | 'is_navigating_history' | 'popstate_timestamp'

export const getKey = (pos:HistoryKeys ):string => `${uniq}_${pos}`
export type HistoryState = Record<string, unknown> | null
const defaultX = 0
const defaultY = 0
export const setCurrentScrollHistory = ( [x, y]: ScrollPos):void => {
    const normX = Math.max(x, defaultX)
    const normY = Math.max(y, defaultY) //Sometime browsers make negative scroll
    const winState = window.history.state as unknown

    const newState: HistoryState = (isRecord(winState)?winState:null) ?? {}
    window.history.replaceState({
        ...newState,
        [getKey('x')]: normX,
        [getKey('y')]: normY,
        [getKey('memo_timestamp')]:(new Date()).getTime()
    }, '')
}
const retrieveNum = (name: HistoryKeys,state:HistoryState):number|null => {

    if (state === null) {
        return null
    }
    const key = getKey(name)
    const {[key]:value} = state
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
export const getIsNavigatingHistory = (state: HistoryState):boolean=>state === null?false:Boolean(state[getKey('is_navigating_history')])
