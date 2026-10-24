import type { Metadata } from 'next';
import { SITE_NAME, SITE_URL } from '@/lib/site';
import { getDictionary } from '@/lib/i18n/server';
import { Locale } from '@/lib/i18n/translations';

export const metadata: Metadata = {
	metadataBase: new URL(SITE_URL),
	title: `now · ${SITE_NAME}`,
	description: 'What I am doing right now.',
};

export function generateStaticParams() {
	return [{ lang: 'en' }, { lang: 'vi' }];
}

export default async function NowPage({ params }: Readonly<{ params: Promise<{ lang: Locale }> }>) {
	const { lang } = await params;
	const isVi = lang === 'vi';
	const t = getDictionary(lang);

	return (
		<div className="mx-auto w-full max-w-2xl space-y-12">
			<section className="space-y-4">
				<div className="space-y-2">
					<p className="font-mono text-xs uppercase tracking-widest text-primary">
						{t('now.title')}
					</p>
					<h1 className="text-2xl font-bold text-foreground">{t('now.doingNow')}</h1>
					<p className="text-sm leading-relaxed text-muted-foreground">
						{isVi ? (
							<>
								(Đây là một{' '}
								<a
									href="https://nownownow.com/about"
									target="_blank"
									rel="noopener noreferrer"
									className="text-foreground underline underline-offset-2 transition-colors hover:text-primary"
								>
									now page
								</a>
								, và nếu bạn có website cá nhân, bạn cũng nên tạo một trang như thế này.)
							</>
						) : (
							<>
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
							</>
						)}
					</p>
				</div>
			</section>

			<section className="space-y-6">
				<div className="space-y-2">
					<p className="font-mono text-xs uppercase tracking-widest text-primary">
						{t('now.workingOn')}
					</p>
					<div className="rounded border border-border/70 bg-card/40 px-5 py-4 text-sm leading-relaxed text-foreground/80">
						{isVi
							? 'Phát triển các microservice thanh toán tại Endava Việt Nam. Spring Boot, PostgreSQL, structured logging.'
							: 'Building payment microservices at Endava Vietnam. Spring Boot, PostgreSQL, structured logging.'}
					</div>
				</div>

				<div className="space-y-2">
					<p className="font-mono text-xs uppercase tracking-widest text-primary">
						{t('now.learning')}
					</p>
					<div className="rounded border border-border/70 bg-card/40 px-5 py-4 text-sm leading-relaxed text-foreground/80">
						{isVi
							? 'Kiến trúc hệ thống phân tán, event sourcing, xử lý đồng thời trong Go.'
							: 'Distributed systems patterns, event sourcing, Go concurrency.'}
					</div>
				</div>

				<div className="space-y-2">
					<p className="font-mono text-xs uppercase tracking-widest text-primary">
						{t('now.reading')}
					</p>
					<div className="rounded border border-border/70 bg-card/40 px-5 py-4 text-sm leading-relaxed text-foreground/80">
						Designing Data-Intensive Applications (Martin Kleppmann)
					</div>
				</div>

				<div className="space-y-2">
					<p className="font-mono text-xs uppercase tracking-widest text-primary">
						{t('now.sideProjects')}
					</p>
					<div className="rounded border border-border/70 bg-card/40 px-5 py-4 text-sm leading-relaxed text-foreground/80">
						{isVi
							? 'Blog cá nhân này, nền tảng tài chính Bainansu.'
							: 'This blog, Bainansu financial platform.'}
					</div>
				</div>

				<div className="space-y-2">
					<p className="font-mono text-xs uppercase tracking-widest text-primary">
						{t('now.location')}
					</p>
					<div className="rounded border border-border/70 bg-card/40 px-5 py-4 text-sm leading-relaxed text-foreground/80">
						{isVi ? 'Thành phố Hồ Chí Minh, Việt Nam' : 'Ho Chi Minh City, Vietnam'}
					</div>
				</div>
			</section>

			<hr className="border-border" />
			<p className="font-mono text-[11px] text-muted-foreground">
				{isVi
					? 'Đây là một now page. Cập nhật tháng 9, 2026.'
					: 'This is a now page. Updated September 2026.'}
			</p>
		</div>
	);
}
