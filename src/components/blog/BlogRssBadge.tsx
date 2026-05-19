export default function BlogRssBadge() {
	return (
		<a
			href="/feed.xml"
			className="inline-flex items-center gap-1 rounded border border-border px-2 py-0.5 font-mono text-[11px] text-muted-foreground transition-all hover:border-primary hover:text-primary"
			aria-label="Subscribe via RSS"
		>
			<span className="text-primary">~</span>
			subscribe via rss
		</a>
	);
}
