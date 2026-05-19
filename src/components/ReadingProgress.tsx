'use client';

import { useEffect, useRef } from 'react';

/**
 * Thin reading progress bar fixed to top of viewport.
 * Uses CSS will-change for GPU compositing — no layout thrashing.
 */
export default function ReadingProgress() {
	const progressRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		let frame = 0;

		const update = () => {
			const scrollTop = window.scrollY;
			const docHeight = document.documentElement.scrollHeight - window.innerHeight;
			const progress = docHeight > 0 ? Math.min(100, (scrollTop / docHeight) * 100) : 0;
			if (progressRef.current) {
				progressRef.current.style.width = `${progress}%`;
				progressRef.current.setAttribute('aria-valuenow', String(Math.round(progress)));
			}
			frame = 0;
		};

		const scheduleUpdate = () => {
			if (frame) return;
			frame = window.requestAnimationFrame(update);
		};

		scheduleUpdate();
		window.addEventListener('scroll', scheduleUpdate, { passive: true });
		window.addEventListener('resize', scheduleUpdate, { passive: true });

		return () => {
			window.removeEventListener('scroll', scheduleUpdate);
			window.removeEventListener('resize', scheduleUpdate);
			if (frame) window.cancelAnimationFrame(frame);
		};
	}, []);

	return (
		<div
			ref={progressRef}
			className="reading-progress"
			style={{ width: '0%' }}
			role="progressbar"
			aria-valuenow={0}
			aria-valuemin={0}
			aria-valuemax={100}
		/>
	);
}
