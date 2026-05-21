import Link from 'next/link';
import ShortcutHelpButton from '@/components/layout/ShortcutHelpButton';
import { FEED_PATHS } from '@/lib/feed-paths';
import { RESUME_URL, STATUS_LINE } from '@/lib/site';
import { PRIMARY_SITEMAP_PATH } from '@/lib/sitemap';

export default function FooterStatus() {
	return (
		<div className="space-y-2">
			<div className="flex flex-wrap items-center justify-center gap-3">
				<span>© {new Date().getFullYear()} nam</span>
				<span className="text-border">·</span>
				<a
					href={FEED_PATHS.rss}
					className="transition-colors hover:text-primary"
					aria-label="RSS Feed"
				>
					rss
				</a>
				<span className="text-border">·</span>
				<a href={FEED_PATHS.atom} className="transition-colors hover:text-primary">
					atom
				</a>
				<span className="text-border">·</span>
				<a href={FEED_PATHS.json} className="transition-colors hover:text-primary">
					json
				</a>
				<span className="text-border">·</span>
				<a href={PRIMARY_SITEMAP_PATH} className="transition-colors hover:text-primary">
					sitemap
				</a>
				<span className="text-border">·</span>
				<Link href="/stack" className="transition-colors hover:text-primary">
					stack
				</Link>
				<span className="text-border">·</span>
				<a
					href={RESUME_URL}
					target="_blank"
					rel="noopener noreferrer"
					className="transition-colors hover:text-primary"
				>
					resume ↗
				</a>
				<span className="text-border">·</span>
				<ShortcutHelpButton />
			</div>
			<p className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground/60">
				status: {STATUS_LINE}
			</p>
		</div>
	);
}
