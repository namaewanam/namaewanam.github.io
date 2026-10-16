import type { Metadata } from 'next';
import Link from '@/components/LocalizedLink';
import { GITHUB_REPO_OWNER, GITHUB_REPO_NAME, SITE_NAME, SITE_URL } from '@/lib/site';
import { getChangelog } from '@/lib/changelog';

export const metadata: Metadata = {
	metadataBase: new URL(SITE_URL),
	title: `changelog · ${SITE_NAME}`,
	description: 'Recent updates and changes to this site.',
};

export function generateStaticParams() {
	return [{ lang: 'en' }, { lang: 'vi' }];
}
export default function ChangelogPage() {
	const changelogGroups = getChangelog();

	return (
		<div className="mx-auto w-full max-w-2xl space-y-12">
			<section className="space-y-4">
				<div className="space-y-2">
					<p className="font-mono text-xs uppercase tracking-widest text-primary">changelog</p>
					<h1 className="text-2xl font-bold text-foreground">Recent changes</h1>
					<p className="text-sm leading-relaxed text-muted-foreground">
						Latest commits to this site, auto-generated from git history.
					</p>
				</div>
			</section>

			<div className="space-y-8">
				{changelogGroups.map((group) => (
					<section key={group.date} className="space-y-3">
						<h2 className="sticky top-14 z-10 bg-background/80 py-1 font-mono text-xs font-semibold text-foreground/80 backdrop-blur-sm">
							{new Date(group.date + 'T00:00:00').toLocaleDateString('en-US', {
								weekday: 'short',
								year: 'numeric',
								month: 'short',
								day: 'numeric',
							})}
						</h2>
						<div className="space-y-2 border-l border-border/50 pl-3">
							{group.commits.map((commit) => (
								<div
									key={commit.hash}
									className="flex flex-col gap-1 py-1 sm:flex-row sm:items-baseline sm:gap-3"
								>
									<a
										href={`https://github.com/${GITHUB_REPO_OWNER}/${GITHUB_REPO_NAME}/commit/${commit.hash}`}
										target="_blank"
										rel="noopener noreferrer"
										className="shrink-0 font-mono text-[11px] text-primary underline-offset-2 hover:underline"
									>
										{commit.hash.substring(0, 7)}
									</a>
									<span className="text-sm leading-snug text-foreground/80">{commit.message}</span>
								</div>
							))}
						</div>
					</section>
				))}
				{changelogGroups.length === 0 && (
					<p className="font-mono text-sm text-muted-foreground">No recent commits found.</p>
				)}
			</div>

			<hr className="border-border" />
			<Link
				href="/"
				className="font-mono text-xs text-muted-foreground transition-colors hover:text-foreground"
			>
				← home
			</Link>
		</div>
	);
}
