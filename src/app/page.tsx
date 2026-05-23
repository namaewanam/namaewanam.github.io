import Link from 'next/link';
import { getAllPosts, getCategories } from '@/lib/markdown';
import FeaturedWriteups from '@/components/home/FeaturedWriteups';
import CopyableContactValue from '@/components/home/CopyableContactValue';
import {
	buildMailtoHref,
	CONTACT_EMAIL,
	getFeaturedPosts,
	HOME_RECRUITING_NOTE,
	HOME_SIGNATURE,
	INTEREST_GROUPS,
	RESUME_URL,
} from '@/lib/site';

export default function Home() {
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
			{/* ── Who Am I ── */}
			<section id="home" className="space-y-4">
				<div className="space-y-1">
					<p className="font-mono text-xs uppercase tracking-widest text-primary">whoami</p>
					<h1 className="text-2xl font-bold leading-tight text-foreground sm:text-3xl">Nam</h1>
					<p className="font-mono text-sm text-muted-foreground">
						junior backend engineer · ho chi minh city
					</p>
				</div>
				<p className="font-mono text-sm text-foreground sm:text-base">{HOME_SIGNATURE}</p>

				<p className="max-w-xl text-sm leading-relaxed text-foreground/80 sm:text-base">
					Mostly APIs, distributed services, and infra tooling. I care about clean architecture,
					observability, and systems that stay calm under production pressure.
				</p>

				<div className="inline-flex items-center gap-2 rounded border border-border/80 bg-card/50 px-3 py-2 font-mono text-[11px] text-foreground/85">
					<span className="text-primary">status</span>
					<span className="text-border">·</span>
					<span>{HOME_RECRUITING_NOTE}</span>
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
						blog →
					</Link>
				</div>
			</section>

			<hr className="border-border" />

			{/* ── About Me ── */}
			<section id="about" className="space-y-4">
				<p className="font-mono text-xs uppercase tracking-widest text-primary">about</p>
				<div className="space-y-3 text-sm leading-relaxed text-foreground/80 sm:text-base">
					<p>
						I&apos;m a backend developer who loves designing systems that are boring in the best way
						— predictable, observable, and maintainable. My stack leans toward{' '}
						<span className="font-medium text-foreground">Java / Spring Boot</span>, and whatever
						database fits the problem.
					</p>
					<p>
						Currently working on high-throughput payment microservices at Endava Vietnam,
						implementing structured logging, CI/CD pipelines, and distributed observability.
					</p>
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

			{/* ── Interests ── */}
			<section id="interests" className="space-y-4">
				<p className="font-mono text-xs uppercase tracking-widest text-primary">interests</p>
				<div className="grid gap-3">
					{INTEREST_GROUPS.map((interest) => (
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

			{/* ── Experience ── */}
			<section id="experience" className="space-y-5">
				<p className="font-mono text-xs uppercase tracking-widest text-primary">experience</p>

				<div className="space-y-5">
					{[
						{
							role: 'Junior Software Engineer',
							org: 'Endava Vietnam',
							period: 'Feb 2026 – Present',
							desc: 'Developing and maintaining MPGS (Mastercard Payment Gateway Services) microservices. Spring Boot + PostgreSQL, Jenkins CI/CD on Linux, structured logging and monitoring for production observability.',
						},
						{
							role: 'Java Software Developer Intern',
							org: 'Endava Vietnam',
							period: 'Nov 2025 – Jan 2026',
							desc: 'Internal financial management system with Spring Boot, Keycloak, Apache POI, PostgreSQL. Docker Compose + GitLab CI/CD pipelines.',
						},
						{
							role: 'B.Sc. Information Technology · CPA 3.57/4.0',
							org: 'VNUHCM — University of Science',
							period: 'Oct 2022 – Oct 2026',
							desc: 'Software Engineering major. Coursework: Software Architecture, Data Structures & Algorithms, Database Systems, DevOps Fundamentals.',
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

			{/* ── Projects ── */}
			<section id="projects" className="space-y-5">
				<p className="font-mono text-xs uppercase tracking-widest text-primary">projects</p>
				<div className="space-y-3 rounded border border-border/70 bg-card/40 px-5 py-4">
					<div className="flex flex-wrap items-start justify-between gap-2">
						<div>
							<h2 className="text-sm font-semibold text-foreground">
								Bainansu — Financial Analysis Platform
							</h2>
							<p className="mt-0.5 font-mono text-[11px] text-muted-foreground">
								Lead Backend Developer · Jul 2025 – Sep 2025
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
						8+ microservices (Spring Boot + FastAPI) with real-time financial data delivery via
						Apache Kafka + WebSocket connected to the Binance API. Celery + RabbitMQ + Redis async
						task queue. Full auth (Keycloak), payments (VNPay, Stripe), and Docker Compose
						infrastructure.
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

			{/* ── Contact ── */}
			<section id="contact" className="space-y-4">
				<p className="font-mono text-xs uppercase tracking-widest text-primary">contact</p>
				<p className="text-sm leading-relaxed text-foreground/80">
					Ping the inbox first. The side quests live below.
				</p>
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

			{/* ── Recent Posts ── */}
			<section className="space-y-4">
				<FeaturedWriteups posts={featuredPosts} />
			</section>

			<hr className="border-border" />

			<section className="space-y-4">
				<div className="flex items-baseline justify-between">
					<p className="font-mono text-xs uppercase tracking-widest text-primary">recent posts</p>
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
		</div>
	);
}
