'use client';
import { useEffect, useState } from 'react';

const SomeClient = () => {
	const [i, setI] = useState(0);
	useEffect(() => {
		const interval = setInterval(() => {
			setI((p) => p + 1);
		}, 1000);
		return () => {
			clearInterval(interval);
		};
	}, []);
	return <div>ddd {i}</div>;
};
export default SomeClient;
