'use client';

import { useCallback, useEffect, useState } from 'react';

const REACTIONS = [
	{ emoji: '🔥', label: 'fire' },
	{ emoji: '👍', label: 'thumbs up' },
	{ emoji: '🧠', label: 'mind-blown' },
	{ emoji: '💡', label: 'lightbulb' },
] as const;

type ReactionKey = (typeof REACTIONS)[number]['label'];

function getStorageKey(slug: string) {
	return `post-reactions:${slug}`;
}

function getReactionData(slug: string): {
	counts: Record<ReactionKey, number>;
	voted?: ReactionKey;
} {
	if (typeof window === 'undefined') return { counts: {} as Record<ReactionKey, number> };
	try {
		const raw = localStorage.getItem(getStorageKey(slug));
		return raw ? JSON.parse(raw) : { counts: {} as Record<ReactionKey, number> };
	} catch {
		return { counts: {} as Record<ReactionKey, number> };
	}
}

function setReactionData(
	slug: string,
	data: { counts: Record<string, number>; voted?: ReactionKey }
) {
	localStorage.setItem(getStorageKey(slug), JSON.stringify(data));
}

/**
 * Emoji reactions for blog posts, persisted in localStorage.
 */
export default function PostReactions({ slug }: Readonly<{ slug: string }>) {
	const [data, setData] = useState<{ counts: Record<string, number>; voted?: ReactionKey }>({
		counts: {},
	});
	const [animating, setAnimating] = useState<string | null>(null);

	useEffect(() => {
		setData(getReactionData(slug));
	}, [slug]);

	const handleClick = useCallback(
		(key: ReactionKey) => {
			setAnimating(key);
			setTimeout(() => setAnimating(null), 300);

			setData((prev) => {
				const counts = { ...prev.counts };
				const wasVoted = prev.voted === key;

				if (prev.voted && prev.voted !== key) {
					// Switch vote
					counts[prev.voted] = Math.max(0, (counts[prev.voted] || 0) - 1);
					counts[key] = (counts[key] || 0) + 1;
				} else if (wasVoted) {
					// Un-vote
					counts[key] = Math.max(0, (counts[key] || 0) - 1);
				} else {
					// New vote
					counts[key] = (counts[key] || 0) + 1;
				}

				const next: { counts: Record<string, number>; voted?: ReactionKey } = { counts };
				if (!wasVoted) next.voted = key;

				setReactionData(slug, next);
				return next;
			});
		},
		[slug]
	);

	return (
		<div className="flex items-center gap-2">
			<span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
				react
			</span>
			{REACTIONS.map(({ emoji, label }) => {
				const count = data.counts[label] || 0;
				const isActive = data.voted === label;
				return (
					<button
						key={label}
						type="button"
						onClick={() => handleClick(label)}
						className={`inline-flex min-h-[36px] min-w-[36px] items-center justify-center gap-1.5 rounded border px-2.5 py-1.5 text-sm transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
							isActive ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/50'
						} ${animating === label ? 'scale-110' : ''}`}
						aria-pressed={isActive}
						aria-label={`React with ${label}, ${count} reaction${count !== 1 ? 's' : ''}`}
						style={{
							transition: 'all 0.15s ease',
						}}
					>
						<span>{emoji}</span>
						{count > 0 && (
							<span className="font-mono text-[10px] text-muted-foreground">{count}</span>
						)}
					</button>
				);
			})}
		</div>
	);
}
