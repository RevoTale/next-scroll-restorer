'use client';
import type { FunctionComponent } from 'react';
import useScrollRestorer from './useScrollRestorer';

const ScrollRestoration: FunctionComponent = () => {
	useScrollRestorer();
	return null;
};
export default ScrollRestoration;
