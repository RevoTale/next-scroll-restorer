import {ScrollPos} from "./types";

const getWindowScroll = (): ScrollPos => [window.scrollX, window.scrollY]

export default getWindowScroll
