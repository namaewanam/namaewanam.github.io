import { useEffect, useState } from 'react';
import { doc, getDoc, setDoc, updateDoc, increment } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface ViewCounterOptions {
	postId: string;
	increment?: boolean; // Whether to increment on mount (default: true)
	initialViews?: number;
}

export function useViewCounter({
	postId,
	increment: shouldIncrement = true,
	initialViews,
}: ViewCounterOptions) {
	// Use initialViews as the starting state, or 0 if not provided
	const [views, setViews] = useState<number>(initialViews ?? 0);

	// Only set loading to true IF initialViews was NOT provided
	const [loading, setLoading] = useState(initialViews === undefined);

	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		let isMounted = true;
		const storageKey = `viewed-${postId}`;

		async function trackView() {
			try {
				const viewDocRef = doc(db, 'pageViews', postId);
				let currentViews = initialViews ?? 0;
				let docExists = false;

				// Only fetch if we didn't get data from the server
				if (initialViews === undefined) {
					const viewDoc = await getDoc(viewDocRef);
					if (viewDoc.exists()) {
						docExists = true;
						currentViews = viewDoc.data().count || 0;
					}
					if (isMounted) {
						setViews(currentViews);
					}
				} else {
					// We have server data. We just need to check if doc exists
					// for the increment logic below.
					if (shouldIncrement) {
						const viewDoc = await getDoc(viewDocRef);
						docExists = viewDoc.exists();
					}
				}

				// Increment logic (only runs on client)
				const hasViewedThisSession = sessionStorage.getItem(storageKey);
				if (shouldIncrement && !hasViewedThisSession) {
					sessionStorage.setItem(storageKey, 'true');

					if (docExists) {
						// Document exists, increment it
						await updateDoc(viewDocRef, {
							count: increment(1),
							lastViewed: new Date().toISOString(),
						});
						if (isMounted) {
							// Update state to the incremented value
							setViews(currentViews + 1);
						}
					} else {
						// Document doesn't exist, create it
						await setDoc(viewDocRef, {
							count: 1,
							postId,
							createdAt: new Date().toISOString(),
							lastViewed: new Date().toISOString(),
						});
						if (isMounted) {
							setViews(1);
						}
					}
				}
			} catch (err) {
				console.error('Error tracking view:', err);
				if (isMounted) {
					setError(err instanceof Error ? err.message : 'Failed to track view');
				}
			} finally {
				if (isMounted) {
					setLoading(false); // Set loading to false after all logic
				}
			}
		}

		trackView();

		return () => {
			isMounted = false;
		};
		// Add initialViews to the dependency array
	}, [postId, shouldIncrement, initialViews]);

	return { views, loading, error };
}
