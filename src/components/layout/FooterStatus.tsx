import Link from 'next/link';
import ShortcutHelpButton from '@/components/layout/ShortcutHelpButton';
import { RESUME_URL, STATUS_LINE } from '@/lib/site';

export default function FooterStatus() {
	return (
		<div className="space-y-2">
			<div className="flex flex-wrap items-center justify-center gap-3">
				<span>© {new Date().getFullYear()} nam</span>
				<span className="text-border">·</span>
				<a href="/feed.xml" className="transition-colors hover:text-primary" aria-label="RSS Feed">
					rss
				</a>
				<span className="text-border">·</span>
				<a href="/sitemap.xml" className="transition-colors hover:text-primary">
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
