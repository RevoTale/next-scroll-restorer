import {ScrollPos} from "./types";


export const restoreScroll = ([left,top]:ScrollPos) => {
    window.scroll({
        behavior: 'instant',
        left,
        top
    })
    console.log(`Scroll restored`, left, top)
}
