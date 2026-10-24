'use client';

import { Bookmark, BookmarkCheck } from 'lucide-react';
import { useReadingList } from '@/lib/useReadingList';

interface BookmarkButtonProps {
	slug: string;
	size?: 'sm' | 'md';
}

function getBookmarkAriaLabel(active: boolean, isMd: boolean): string {
	if (active) {
		return isMd ? 'Remove saved bookmark' : 'Remove bookmark';
	}
	return isMd ? 'Save bookmark' : 'Add bookmark';
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
			className={`inline-flex min-h-[36px] items-center gap-1.5 rounded border px-2.5 py-1 font-mono text-xs transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
				active
					? 'border-primary text-primary'
					: 'border-border text-muted-foreground hover:border-primary hover:text-foreground'
			}`}
			aria-pressed={active}
			aria-label={getBookmarkAriaLabel(active, size === 'md')}
		>
			<Icon className={sizeClasses} />
			{size === 'md' && (active ? 'saved' : 'save')}
		</button>
	);
}
