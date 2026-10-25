'use client';

import { useEffect, useState } from 'react';
import { ArrowUp } from 'lucide-react';

/**
 * Back-to-top button. Appears after scrolling past 400px.
 */
export default function BackToTop() {
	const [visible, setVisible] = useState(false);

	useEffect(() => {
		const onScroll = () => setVisible(window.scrollY > 400);
		window.addEventListener('scroll', onScroll, { passive: true });
		return () => window.removeEventListener('scroll', onScroll);
	}, []);

	return (
		<button
			type="button"
			onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
			className={`back-to-top ${visible ? 'visible' : ''}`}
			aria-label="Back to top"
		>
			<ArrowUp className="h-4 w-4" aria-hidden="true" />
		</button>
	);
}
