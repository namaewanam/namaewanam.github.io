'use client';

import { Bookmark, BookmarkCheck } from 'lucide-react';
import { useReadingList } from '@/lib/useReadingList';

interface BookmarkButtonProps {
	slug: string;
	size?: 'sm' | 'md';
}

/**
 * Bookmark toggle button for saving posts to the reading list.
 */
export default function BookmarkButton({ slug, size = 'sm' }: Readonly<BookmarkButtonProps>) {
	const { isBookmarked, toggle } = useReadingList();
	const active = isBookmarked(slug);

	const Icon = active ? BookmarkCheck : Bookmark;
	const sizeClasses = size === 'sm' ? 'h-3.5 w-3.5' : 'h-4 w-4';

	return (
		<button
			type="button"
			onClick={(e) => {
				e.preventDefault();
				e.stopPropagation();
				toggle(slug);
			}}
			className={`inline-flex items-center gap-1 rounded border px-2 py-1 font-mono text-[11px] transition-all ${
				active
					? 'border-primary text-primary'
					: 'border-border text-muted-foreground hover:border-primary hover:text-foreground'
			}`}
			aria-label={
				active
					? size === 'md'
						? 'Remove saved bookmark'
						: 'Remove bookmark'
					: size === 'md'
						? 'Add save bookmark'
						: 'Add bookmark'
			}
		>
			<Icon className={sizeClasses} />
			{size === 'md' && (active ? 'saved' : 'save')}
		</button>
	);
}
