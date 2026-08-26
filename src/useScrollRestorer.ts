import { usePathname, useSearchParams } from 'next/navigation';
import { useEffect, useLayoutEffect, useRef } from 'react';
import {
	getIsNavigatingHistory,
	getKey,
	getPopstateTimestamp,
	getScrollFromState,
	getScrollTimestamp,
	type HistoryState,
	type ScrollPos,
	setCurrentScrollHistory,
} from './storage';
import { isRecord } from './util';

const getWindowScroll = (): ScrollPos => [window.scrollX, window.scrollY];
const memoizationIntervalLimit = 601; //100 times per 30 seconds
const safariBugWorkaroundTimeThreshold = 2000; //Safari reset scroll position to 0 0 after popstate for some reason.

const getState = (): HistoryState => {
	const state = window.history.state as unknown;
	return isRecord(state) ? state : null;
};
const restoreScrollFromState = (state: HistoryState): void => {
	const scroll = getScrollFromState(state);
	if (scroll !== null) {
		const [x, y] = scroll;
		window.scrollTo({
			behavior: 'instant',
			left: x,
			top: y,
		});
	}
};
const scrollMemoIntervalCountLimit = 2;
const restoreCurrentScrollPosition = (): void => {
	restoreScrollFromState(getState());
};
const defaultMemoInterval = 0;
const numericTrue = 1;
const defaultX = 0;
const defaultY = 0;
const useScrollRestorer = (): void => {
	const pathname = usePathname();
	const searchparams = useSearchParams();

	// biome-ignore lint/correctness/useExhaustiveDependencies: We need a trigger to remember the scrollposition on any url change
	useLayoutEffect(() => {
		restoreCurrentScrollPosition();
	}, [pathname, searchparams]);
	const scrollMemoTimeoutRef = useRef<ReturnType<typeof setTimeout>>(undefined);
	const scrollMemoCountInInterval = useRef<number>(defaultMemoInterval); //Used to workaround instant scrollTo() calls.It's used to work around immediate scroll in tests and possible real world behaviour.
	const isSafariWorkaroundAllowedRef = useRef(false);
	useEffect(() => {
		window.history.scrollRestoration = 'manual';

		const navigationListener = ({ state: eState }: PopStateEvent): void => {
			cancelDelayedScrollMemoization();

			isSafariWorkaroundAllowedRef.current = true;
			const state = (isRecord(eState) ? eState : null) ?? {};
			window.history.replaceState(
				{
					...state,
					[getKey('is_navigating_history')]: numericTrue,
					[getKey('popstate_timestamp')]: Date.now(),
				},
				'',
			);
		};

		/**
		 * This is important to run as late as possible after navigation.
		 * We could use something like `setTimeout(restoreCurrentScroll,500)`, but this is not a reactive approach.
		 * useLayoutEffect + usePageHref hook is the latest reactive thing Next.js app can provide to use.
		 * In Safari even with `window.history.scrollRestoration = 'manual'` scroll position is reset.
		 */
		const workaroundSafariBreaksScrollRestoration = ([
			x,
			y,
		]: ScrollPos): boolean => {
			const state = getState();

			// Sometimes Safari scroll to the start because of unique behavior We restore it back.
			// This case cannot be tested with Playwright, or any other testing library.
			if (
				x === defaultX &&
				y === defaultY &&
				isSafariWorkaroundAllowedRef.current
			) {
				const isWorkaroundAllowed = (() => {
					const timeNavigated = getPopstateTimestamp(state);
					if (timeNavigated === null) {
						return false;
					}
					return Date.now() - timeNavigated < safariBugWorkaroundTimeThreshold;
				})(); //Place here to prevent many computations
				const isNavHistory = getIsNavigatingHistory(state);
				if (isWorkaroundAllowed && isNavHistory) {
					restoreCurrentScrollPosition();
					isSafariWorkaroundAllowedRef.current = false; //Safari bug appears only once
					return true;
				}
			}

			return false;
		};
		const rememberScrollPosition = (pos: ScrollPos): void => {
			cancelDelayedScrollMemoization();
			setCurrentScrollHistory(pos);
		};
		const unmountNavigationListener = (): void => {
			window.removeEventListener('popstate', navigationListener);
		};
		const mountNavigationListener = (): void => {
			window.addEventListener('popstate', navigationListener, {
				passive: true,
			});
		};

		const cancelDelayedScrollMemoization = (): void => {
			if (scrollMemoTimeoutRef.current !== undefined) {
				clearTimeout(scrollMemoTimeoutRef.current);
				scrollMemoTimeoutRef.current = undefined;
			}
		};

		const scrollMemoizationHandler = (pos: ScrollPos): void => {
			const isScrollMemoAllowedNow = (): boolean => {
				const timestamp = getScrollTimestamp(getState());
				if (timestamp === null) {
					return true;
				}
				return Date.now() - timestamp > memoizationIntervalLimit;
			};

			const isAllowedNow = isScrollMemoAllowedNow();
			if (isAllowedNow) {
				scrollMemoCountInInterval.current = defaultMemoInterval;
			}
			if (
				isAllowedNow ||
				scrollMemoCountInInterval.current < scrollMemoIntervalCountLimit
			) {
				scrollMemoCountInInterval.current += 1;
				rememberScrollPosition(pos);
			} else {
				if (scrollMemoTimeoutRef.current === undefined) {
					scrollMemoTimeoutRef.current = setTimeout(() => {
						rememberScrollPosition(pos);
						scrollMemoCountInInterval.current = defaultMemoInterval;
						scrollMemoTimeoutRef.current = undefined;
					}, memoizationIntervalLimit);
				}
			}
		};
		const scrollListener = (): void => {
			cancelDelayedScrollMemoization();
			const scroll = getWindowScroll();

			workaroundSafariBreaksScrollRestoration(scroll);

			scrollMemoizationHandler(scroll);
		};
		const mountScrollListener = (): void => {
			window.addEventListener('scroll', scrollListener, {
				passive: true,
			});
		};
		const unmountScrollListener = (): void => {
			window.removeEventListener('scroll', scrollListener);
		};
		mountNavigationListener();
		mountScrollListener();
		return () => {
			unmountNavigationListener();
			unmountScrollListener();
			cancelDelayedScrollMemoization();
		};
	}, []);
};
export default useScrollRestorer;
