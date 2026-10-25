'use client';

import { useEffect, useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

interface ZenModeToggleProps {
	isVi?: boolean;
	className?: string;
}

function getZenLabel(isZen: boolean, isVi?: boolean): string {
	if (isZen) {
		return isVi ? 'Thoát Zen' : 'Exit Zen';
	}
	return 'Zen Mode';
}

function getZenTitle(isZen: boolean, isVi?: boolean): string {
	if (isZen) {
		return isVi
			? 'Thoát chế độ tập trung (hoặc nhấn phím z)'
			: 'Exit distraction-free reading mode (or press z)';
	}
	return isVi
		? 'Chế độ đọc tập trung (hoặc nhấn phím z)'
		: 'Distraction-free reading mode (or press z)';
}

/**
 * Zen / Focus mode toggle button for distraction-free article reading.
 * Synchronizes with document.body 'zen-mode' class and keyboard shortcut 'z'.
 */
export default function ZenModeToggle({ isVi, className = '' }: Readonly<ZenModeToggleProps>) {
	const [isZen, setIsZen] = useState(false);

	useEffect(() => {
		setIsZen(document.body.classList.contains('zen-mode'));

		const observer = new MutationObserver(() => {
			setIsZen(document.body.classList.contains('zen-mode'));
		});

		observer.observe(document.body, {
			attributes: true,
			attributeFilter: ['class'],
		});

		return () => observer.disconnect();
	}, []);

	const toggleZen = () => {
		const next = !document.body.classList.contains('zen-mode');
		document.body.classList.toggle('zen-mode', next);
		setIsZen(next);
	};

	const label = getZenLabel(isZen, isVi);
	const title = getZenTitle(isZen, isVi);

	return (
		<button
			type="button"
			onClick={toggleZen}
			aria-pressed={isZen}
			title={title}
			aria-label={title}
			className={`inline-flex items-center gap-1.5 rounded border px-2 py-0.5 font-mono text-xs transition-all active:scale-95 ${
				isZen
					? 'border-primary bg-primary/10 text-primary shadow-sm'
					: 'border-border text-muted-foreground hover:border-primary hover:text-foreground'
			} ${className}`}
		>
			{isZen ? (
				<EyeOff className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
			) : (
				<Eye className="h-3.5 w-3.5" aria-hidden="true" />
			)}
			<span>{label}</span>
		</button>
	);
}
