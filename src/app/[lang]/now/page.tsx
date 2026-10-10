import type { Metadata } from 'next';
import { SITE_NAME } from '@/lib/site';

export const metadata: Metadata = {
	title: `now · ${SITE_NAME}`,
	description: 'What I am doing right now.',
};

export function generateStaticParams() {
	return [{ lang: 'en' }, { lang: 'vi' }];
}
export default function NowPage() {
	return (
		<div className="mx-auto w-full max-w-2xl space-y-12">
			<section className="space-y-4">
				<div className="space-y-2">
					<p className="font-mono text-xs uppercase tracking-widest text-primary">now</p>
					<h1 className="text-2xl font-bold text-foreground">What I&apos;m doing now</h1>
					<p className="text-sm leading-relaxed text-muted-foreground">
						(This is a{' '}
						<a
							href="https://nownownow.com/about"
							target="_blank"
							rel="noopener noreferrer"
							className="text-foreground underline underline-offset-2 transition-colors hover:text-primary"
						>
							now page
						</a>
						, and if you have your own site, you should make one, too.)
					</p>
				</div>
			</section>

			<section className="space-y-6">
				<div className="space-y-2">
					<p className="font-mono text-xs uppercase tracking-widest text-primary">working on</p>
					<div className="rounded border border-border/70 bg-card/40 px-5 py-4 text-sm leading-relaxed text-foreground/80">
						Building payment microservices at Endava Vietnam. Spring Boot, PostgreSQL, structured
						logging.
					</div>
				</div>

				<div className="space-y-2">
					<p className="font-mono text-xs uppercase tracking-widest text-primary">learning</p>
					<div className="rounded border border-border/70 bg-card/40 px-5 py-4 text-sm leading-relaxed text-foreground/80">
						Distributed systems patterns, event sourcing, Go concurrency.
					</div>
				</div>

				<div className="space-y-2">
					<p className="font-mono text-xs uppercase tracking-widest text-primary">reading</p>
					<div className="rounded border border-border/70 bg-card/40 px-5 py-4 text-sm leading-relaxed text-foreground/80">
						Designing Data-Intensive Applications (Martin Kleppmann)
					</div>
				</div>

				<div className="space-y-2">
					<p className="font-mono text-xs uppercase tracking-widest text-primary">side projects</p>
					<div className="rounded border border-border/70 bg-card/40 px-5 py-4 text-sm leading-relaxed text-foreground/80">
						This blog, Bainansu financial platform
					</div>
				</div>

				<div className="space-y-2">
					<p className="font-mono text-xs uppercase tracking-widest text-primary">location</p>
					<div className="rounded border border-border/70 bg-card/40 px-5 py-4 text-sm leading-relaxed text-foreground/80">
						Ho Chi Minh City, Vietnam
					</div>
				</div>
			</section>

			<hr className="border-border" />
			<p className="font-mono text-[11px] text-muted-foreground">
				This is a now page. Updated September 2026.
			</p>
		</div>
	);
}
