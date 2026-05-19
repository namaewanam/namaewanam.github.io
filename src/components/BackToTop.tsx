'use client';

import { useEffect, useState } from 'react';

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
			<svg
				width="16"
				height="16"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				strokeWidth="2"
				strokeLinecap="round"
				strokeLinejoin="round"
			>
				<path d="m18 15-6-6-6 6" />
			</svg>
		</button>
	);
}
