'use client';

import { useCallback, useEffect, useState } from 'react';

const STORAGE_KEY = 'reading-list';

function getBookmarks(): string[] {
	if (typeof window === 'undefined') return [];
	try {
		const raw = localStorage.getItem(STORAGE_KEY);
		return raw ? JSON.parse(raw) : [];
	} catch {
		return [];
	}
}

function setBookmarks(slugs: string[]) {
	localStorage.setItem(STORAGE_KEY, JSON.stringify(slugs));
}

/**
 * Custom hook for managing a reading list in localStorage.
 */
export function useReadingList() {
	const [bookmarks, setBookmarksState] = useState<string[]>([]);

	useEffect(() => {
		setBookmarksState(getBookmarks());
	}, []);

	const isBookmarked = useCallback((slug: string) => bookmarks.includes(slug), [bookmarks]);

	const toggle = useCallback((slug: string) => {
		setBookmarksState((prev) => {
			const next = prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug];
			setBookmarks(next);
			return next;
		});
	}, []);

	return { bookmarks, isBookmarked, toggle };
}
