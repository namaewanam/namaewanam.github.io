import { FEED_PATHS } from '@/lib/feed-paths';

export default function BlogRssBadge() {
	return (
		<a
			href={FEED_PATHS.rss}
			className="inline-flex items-center gap-1 rounded border border-border px-2 py-0.5 font-mono text-[11px] text-muted-foreground transition-all hover:border-primary hover:text-primary"
			aria-label="Subscribe via RSS"
		>
			<span className="text-primary">~</span>
			subscribe via rss
		</a>
	);
}
