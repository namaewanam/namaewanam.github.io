import Link from '@/components/LocalizedLink';
import { getAllPosts, getCategories } from '@/lib/markdown';
import FeaturedWriteups from '@/components/home/FeaturedWriteups';
import CopyableContactValue from '@/components/home/CopyableContactValue';
import PostStats from '@/components/home/PostStats';
import NewsletterForm from '@/components/layout/NewsletterForm';
import { features } from '@/lib/features';
import { getDictionary } from '@/lib/i18n/server';
import { Locale } from '@/lib/i18n/translations';
import {
	buildMailtoHref,
	CONTACT_EMAIL,
	getFeaturedPosts,
	HOME_RECRUITING_NOTE,
	HOME_SIGNATURE,
	getInterestGroups,
	RESUME_URL,
} from '@/lib/site';

export function generateStaticParams() {
	return [{ lang: 'en' }, { lang: 'vi' }];
}
export default async function Home({ params }: { params: Promise<{ lang: Locale }> }) {
	const { lang } = await params;
	const t = getDictionary(lang);
	const posts = getAllPosts();
	const categories = getCategories();
	const recentPosts = posts.slice(0, 5);
	const featuredPosts = getFeaturedPosts(posts);
	const contacts: Array<{
		label: string;
		value: string;
		copyValue?: string;
		href?: string;
		secondaryLinks?: Array<{ label: string; href: string }>;
	}> = [
		{
			label: 'mail',
			value: `<${CONTACT_EMAIL}>`,
			copyValue: CONTACT_EMAIL,
			href: buildMailtoHref('collab'),
			secondaryLinks: [
				{ label: 'recruiter', href: buildMailtoHref('recruiter') },
				{ label: 'collab', href: buildMailtoHref('collab') },
			],
		},
		{ label: 'github', value: '@ntnam1605', href: 'https://github.com/ntnam1605' },
		{
			label: 'linkedin',
			value: '/in/ntnam',
			copyValue: 'https://www.linkedin.com/in/ntnam',
			href: 'https://www.linkedin.com/in/ntnam',
		},
		{
			label: 'facebook',
			value: '/nam.160504',
			href: 'https://www.facebook.com/nam.160504',
		},
		{ label: 'discord', value: '::usbible', copyValue: 'usbible' },
		{ label: 'liqi', value: '~/namaewanam' },
	];

	return (
		<div className="mx-auto w-full max-w-3xl space-y-16">
			{/* Who Am I */}
			<section id="home" className="space-y-4">
				<div className="space-y-1">
					<p className="font-mono text-sm font-semibold uppercase tracking-widest text-primary">
						{t('home.whoami')}
					</p>
					<h1 className="text-2xl font-bold leading-tight text-foreground sm:text-3xl">Nam</h1>
					<p className="font-mono text-sm text-muted-foreground">{t('home.subtitle')}</p>
				</div>
				<p className="font-mono text-sm text-foreground sm:text-base">{t('home.signature')}</p>

				<p className="max-w-xl text-sm leading-relaxed text-foreground/80 sm:text-base">
					{t('home.aboutP3')}
				</p>

				<div className="inline-flex items-center gap-2 rounded border border-border/80 bg-card/50 px-3 py-2 font-mono text-[11px] text-foreground/85">
					<span className="text-primary">{t('footer.status')}</span>
					<span className="text-border">·</span>
					<span>{t('home.status')}</span>
				</div>

				<div className="flex flex-wrap gap-2 pt-1">
					<a
						href={buildMailtoHref('recruiter')}
						className="inline-flex items-center gap-1.5 rounded border border-border px-2.5 py-1 font-mono text-xs transition-all hover:border-primary hover:text-primary"
					>
						recruiter
					</a>
					<a
						href="https://github.com/ntnam1605"
						target="_blank"
						rel="noopener noreferrer"
						className="inline-flex items-center gap-1.5 rounded border border-border px-2.5 py-1 font-mono text-xs transition-all hover:border-primary hover:text-primary"
					>
						github
					</a>
					<a
						href={RESUME_URL}
						target="_blank"
						rel="noopener noreferrer"
						className="inline-flex items-center gap-1.5 rounded border border-border px-2.5 py-1 font-mono text-xs transition-all hover:border-primary hover:text-primary"
					>
						resume ↗
					</a>
					<Link
						href="/blog"
						className="inline-flex items-center gap-1.5 rounded bg-primary px-2.5 py-1 font-mono text-xs text-primary-foreground transition-all hover:bg-primary/90"
					>
						{t('nav.blog')} →
					</Link>
				</div>
			</section>

			<hr className="border-border" />

			{/* About Me */}
			<section id="about" className="space-y-4">
				<p className="font-mono text-sm font-semibold uppercase tracking-widest text-primary">
					{t('home.about')}
				</p>
				<div className="space-y-3 text-sm leading-relaxed text-foreground/80 sm:text-base">
					<p>
						{t('home.aboutP1').split('Java / Spring Boot')[0]}
						<span className="font-medium text-foreground">Java / Spring Boot</span>
						{t('home.aboutP1').split('Java / Spring Boot')[1]}
					</p>
					<p>{t('home.aboutP2')}</p>
				</div>

				<div className="flex flex-wrap gap-1.5 pt-1">
					{[
						'Java',
						'Spring Boot',
						'Python',
						'PostgreSQL',
						'Redis',
						'Kafka',
						'Docker',
						'Keycloak',
					].map((t) => (
						<span
							key={t}
							className="rounded bg-muted px-1.5 py-0.5 font-mono text-[11px] text-muted-foreground"
						>
							{t}
						</span>
					))}
				</div>
			</section>

			<hr className="border-border" />

			{/* Interests */}
			<section id="interests" className="space-y-4">
				<p className="font-mono text-sm font-semibold uppercase tracking-widest text-primary">
					{t('home.interests')}
				</p>
				<div className="grid gap-3">
					{getInterestGroups(lang).map((interest) => (
						<div
							key={interest.title}
							className="space-y-2 rounded border border-border/70 bg-card/40 px-4 py-3"
						>
							<div className="space-y-1">
								<h2 className="text-sm font-semibold text-foreground">{interest.title}</h2>
								<p className="text-sm leading-relaxed text-foreground/75">{interest.description}</p>
							</div>
							<div className="flex flex-wrap gap-1.5">
								{interest.items.map((item) => (
									<span
										key={item}
										className="rounded bg-muted px-1.5 py-0.5 font-mono text-[11px] text-muted-foreground"
									>
										{item}
									</span>
								))}
							</div>
						</div>
					))}
				</div>
			</section>

			<hr className="border-border" />

			{/* Experience */}
			<section id="experience" className="space-y-5">
				<p className="font-mono text-sm font-semibold uppercase tracking-widest text-primary">
					{t('home.experience')}
				</p>

				<div className="space-y-5">
					{[
						{
							role: lang === 'vi' ? 'Kỹ sư Phần mềm' : 'Junior Software Engineer',
							org: 'Endava Vietnam',
							period: lang === 'vi' ? 'Tháng 2, 2026 – Hiện tại' : 'Feb 2026 – Present',
							desc:
								lang === 'vi'
									? 'Phát triển và bảo trì các microservices MPGS (Mastercard Payment Gateway Services). Spring Boot + PostgreSQL, Jenkins CI/CD trên Linux, structured logging và monitoring để giám sát production.'
									: 'Developing and maintaining MPGS (Mastercard Payment Gateway Services) microservices. Spring Boot + PostgreSQL, Jenkins CI/CD on Linux, structured logging and monitoring for production observability.',
						},
						{
							role:
								lang === 'vi' ? 'Thực tập sinh Lập trình Java' : 'Java Software Developer Intern',
							org: 'Endava Vietnam',
							period: lang === 'vi' ? 'Tháng 11, 2025 – Tháng 1, 2026' : 'Nov 2025 – Jan 2026',
							desc:
								lang === 'vi'
									? 'Hệ thống quản lý tài chính nội bộ với Spring Boot, Keycloak, Apache POI, PostgreSQL. Thiết lập Docker Compose + GitLab CI/CD.'
									: 'Internal financial management system with Spring Boot, Keycloak, Apache POI, PostgreSQL. Docker Compose + GitLab CI/CD pipelines.',
						},
						{
							role:
								lang === 'vi'
									? 'Cử nhân CNTT · CPA 3.6/4.0'
									: 'B.Sc. Information Technology · CPA 3.6/4.0',
							org:
								lang === 'vi'
									? 'Trường Đại học Khoa học Tự nhiên, ĐHQG-HCM'
									: 'VNUHCM — University of Science',
							period: lang === 'vi' ? 'Tháng 10, 2022 – Tháng 10, 2026' : 'Oct 2022 – Oct 2026',
							desc:
								lang === 'vi'
									? 'Chuyên ngành Công nghệ Phần mềm. Môn học tiêu biểu: Kiến trúc Phần mềm, Cấu trúc Dữ liệu & Giải thuật, Hệ quản trị Cơ sở dữ liệu, Nhập môn DevOps.'
									: 'Software Engineering major. Coursework: Software Architecture, Data Structures & Algorithms, Database Systems, DevOps Fundamentals.',
						},
					].map((exp) => (
						<div
							key={exp.role}
							className="grid grid-cols-1 gap-1 sm:grid-cols-[160px_1fr] sm:gap-4"
						>
							<span className="shrink-0 font-mono text-[11px] text-foreground/60">
								{exp.period}
							</span>
							<div>
								<div className="flex flex-wrap items-baseline gap-1.5">
									<span className="text-sm font-semibold text-foreground">{exp.role}</span>
									<span className="text-xs text-muted-foreground">@ {exp.org}</span>
								</div>
								<p className="mt-0.5 text-xs leading-relaxed text-foreground/65 sm:text-sm">
									{exp.desc}
								</p>
							</div>
						</div>
					))}
				</div>
			</section>

			<hr className="border-border" />

			{/* Projects */}
			<section id="projects" className="space-y-5">
				<p className="font-mono text-sm font-semibold uppercase tracking-widest text-primary">
					{t('home.projects')}
				</p>
				<div className="space-y-3 rounded border border-border/70 bg-card/40 px-5 py-4">
					<div className="flex flex-wrap items-start justify-between gap-2">
						<div>
							<h2 className="text-sm font-semibold text-foreground">
								Bainansu —{' '}
								{lang === 'vi' ? 'Nền tảng Phân tích Tài chính' : 'Financial Analysis Platform'}
							</h2>
							<p className="mt-0.5 font-mono text-[11px] text-muted-foreground">
								{lang === 'vi' ? 'Kỹ sư Backend' : 'Lead Backend Developer'} · Jul 2025 – Sep 2025
							</p>
						</div>
						<a
							href="https://github.com/ntnam1605/bainansu"
							target="_blank"
							rel="noopener noreferrer"
							className="font-mono text-xs text-muted-foreground transition-colors hover:text-primary"
						>
							github ↗
						</a>
					</div>
					<p className="text-xs leading-relaxed text-foreground/70 sm:text-sm">
						{lang === 'vi'
							? 'Hơn 8 microservices (Spring Boot + FastAPI) cung cấp dữ liệu tài chính real-time qua Apache Kafka + WebSocket kết nối với Binance API. Hàng đợi tác vụ bất đồng bộ bằng Celery + RabbitMQ + Redis. Đầy đủ tính năng xác thực (Keycloak), thanh toán (VNPay, Stripe) trên hạ tầng Docker Compose.'
							: '8+ microservices (Spring Boot + FastAPI) with real-time financial data delivery via Apache Kafka + WebSocket connected to the Binance API. Celery + RabbitMQ + Redis async task queue. Full auth (Keycloak), payments (VNPay, Stripe), and Docker Compose infrastructure.'}
					</p>
					<div className="flex flex-wrap gap-1.5 pt-1">
						{['Spring Boot', 'FastAPI', 'Kafka', 'WebSocket', 'Redis', 'Keycloak', 'Docker'].map(
							(t) => (
								<span
									key={t}
									className="rounded bg-muted px-1.5 py-0.5 font-mono text-[11px] text-muted-foreground"
								>
									{t}
								</span>
							)
						)}
					</div>
				</div>
			</section>

			<hr className="border-border" />

			{/* Contact */}
			<section id="contact" className="space-y-4">
				<p className="font-mono text-sm font-semibold uppercase tracking-widest text-primary">
					{t('home.contact')}
				</p>
				<p className="text-sm leading-relaxed text-foreground/80">{t('home.contactDesc')}</p>
				<div className="space-y-1.5">
					{contacts.map((c) => (
						<div key={c.label} className="flex items-baseline gap-3 font-mono text-sm">
							<span className="w-16 shrink-0 text-xs text-muted-foreground">{c.label}</span>
							{c.copyValue ? (
								<CopyableContactValue
									displayValue={c.value}
									copyValue={c.copyValue}
									{...(c.href ? { href: c.href } : {})}
									{...(c.secondaryLinks ? { secondaryLinks: c.secondaryLinks } : {})}
								/>
							) : c.href ? (
								<a
									href={c.href}
									target={c.href.startsWith('mailto') ? undefined : '_blank'}
									rel={c.href.startsWith('mailto') ? undefined : 'noopener noreferrer'}
									className="break-all text-xs text-foreground underline underline-offset-2 transition-colors hover:text-primary"
								>
									{c.value}
								</a>
							) : (
								<span className="text-xs text-foreground">{c.value}</span>
							)}
						</div>
					))}
				</div>
			</section>

			<hr className="border-border" />

			{/* Recent Posts */}
			{features.postStats && (
				<>
					<section className="space-y-4">
						<PostStats />
					</section>
					<hr className="border-border" />
				</>
			)}

			<section className="space-y-4">
				<FeaturedWriteups posts={featuredPosts} />
			</section>

			<hr className="border-border" />

			<section className="space-y-4">
				<div className="flex items-baseline justify-between">
					<p className="font-mono text-sm font-semibold uppercase tracking-widest text-primary">
						{t('home.recentPosts')}
					</p>
					<Link
						href="/blog"
						className="font-mono text-xs text-muted-foreground transition-colors hover:text-foreground"
					>
						all →
					</Link>
				</div>

				<div className="divide-y divide-border">
					{recentPosts.map((post) => (
						<Link
							key={`${post.category}-${post.slug}`}
							href={`/blog/${post.category}/${post.fullPath}`}
							className="group flex items-baseline justify-between gap-4 py-2.5"
						>
							<span className="truncate text-sm text-foreground transition-colors group-hover:text-primary">
								{post.title}
							</span>
							<span className="shrink-0 font-mono text-[11px] text-muted-foreground">
								{post.date
									? new Date(post.date).toLocaleDateString('en-US', {
											year: 'numeric',
											month: 'short',
										})
									: post.categoryName}
							</span>
						</Link>
					))}
				</div>

				<div className="flex flex-wrap gap-1.5 pt-1">
					{categories.map((cat) => (
						<Link
							key={cat.slug}
							href={`/blog/${cat.slug}`}
							className="rounded border border-border px-2 py-0.5 font-mono text-[11px] transition-all hover:border-primary hover:text-primary"
						>
							#{cat.name.toLowerCase()}
							<span className="ml-1 text-muted-foreground">{cat.count}</span>
						</Link>
					))}
				</div>
			</section>

			{features.newsletter && (
				<>
					<hr className="border-border" />
					<section className="space-y-4">
						<NewsletterForm />
					</section>
				</>
			)}
		</div>
	);
}
