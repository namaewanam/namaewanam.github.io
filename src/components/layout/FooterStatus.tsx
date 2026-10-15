import Link from '@/components/LocalizedLink';
import ShortcutHelpButton from '@/components/layout/ShortcutHelpButton';
import { features } from '@/lib/features';
import { FEED_PATHS } from '@/lib/feed-paths';
import { RESUME_URL, STATUS_LINE } from '@/lib/site';
import { PRIMARY_SITEMAP_PATH } from '@/lib/sitemap';

/** Dot separator used between footer links. */
function Dot() {
	return <span className="text-border">·</span>;
}

import { Locale } from '@/lib/i18n/translations';
import { getDictionary } from '@/lib/i18n/server';
export default function FooterStatus({ lang }: { lang: Locale }) {
	const t = getDictionary(lang);
	return (
		<div className="space-y-2">
			<div className="flex flex-wrap items-center justify-center gap-3">
				<span>© {new Date().getFullYear()} nam</span>
				{features.feeds && (
					<>
						<Dot />
						<a href={FEED_PATHS.rss} className="transition-colors hover:text-primary">
							rss
						</a>
						<Dot />
						<a href={FEED_PATHS.atom} className="transition-colors hover:text-primary">
							atom
						</a>
						<Dot />
						<a href={FEED_PATHS.json} className="transition-colors hover:text-primary">
							json
						</a>
					</>
				)}
				<Dot />
				<a href={PRIMARY_SITEMAP_PATH} className="transition-colors hover:text-primary">
					sitemap
				</a>
				{features.stack && (
					<>
						<Dot />
						<Link href="/stack" className="transition-colors hover:text-primary">
							stack
						</Link>
					</>
				)}
				{features.snippets && (
					<>
						<Dot />
						<Link href="/snippets" className="transition-colors hover:text-primary">
							snippets
						</Link>
					</>
				)}
				{features.adr && (
					<>
						<Dot />
						<Link href="/adr" className="transition-colors hover:text-primary">
							adr
						</Link>
					</>
				)}
				{features.nowPage && (
					<>
						<Dot />
						<Link href="/now" className="transition-colors hover:text-primary">
							now
						</Link>
					</>
				)}
				{features.readingList && (
					<>
						<Dot />
						<Link href="/reading-list" className="transition-colors hover:text-primary">
							reading list
						</Link>
					</>
				)}
				{features.changelog && (
					<>
						<Dot />
						<Link href="/changelog" className="transition-colors hover:text-primary">
							changelog
						</Link>
					</>
				)}
				<Dot />
				<a
					href={RESUME_URL}
					target="_blank"
					rel="noopener noreferrer"
					className="transition-colors hover:text-primary"
				>
					resume ↗
				</a>
				{features.shortcutHelp && (
					<>
						<Dot />
						<ShortcutHelpButton />
					</>
				)}
			</div>
			<p className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground/60">
				{t('footer.status')}: {STATUS_LINE}
			</p>
		</div>
	);
}
