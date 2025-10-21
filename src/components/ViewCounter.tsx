'use client';

import { Eye } from 'lucide-react';
import { useViewCounter } from '@/hooks/useViewCounter';

interface ViewCounterProps {
	postId: string;
	increment?: boolean;
	className?: string;
	initialViews?: number;
}

export default function ViewCounter({
	postId,
	increment = true,
	className = '',
	initialViews,
}: Readonly<ViewCounterProps>) {
	const { views, loading, error } = useViewCounter({ postId, increment, initialViews });

	if (error) {
		return null; // Silently fail - don't break the UI
	}

	return (
		<div className={`inline-flex items-center gap-1.5 text-muted-foreground ${className}`}>
			<Eye className="h-4 w-4" />
			<span className="text-sm">
				{loading ? '...' : views.toLocaleString()} {views === 1 ? 'view' : 'views'}
			</span>
		</div>
	);
}
