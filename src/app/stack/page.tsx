import type { Metadata } from 'next';
import StackGroup from '@/components/stack/StackGroup';
import { STACK_GROUPS, SITE_NAME } from '@/lib/site';
import Link from 'next/link';

export const metadata: Metadata = {
	title: `Stack · ${SITE_NAME}`,
	description:
		'My personal tech radar — technologies I adopt, trial, assess, and consciously hold.',
	openGraph: {
		title: `Stack · ${SITE_NAME}`,
		description: 'Personal tech radar: Adopt / Trial / Assess / Hold.',
		type: 'website',
		url: '/stack',
	},
};

type Ring = 'adopt' | 'trial' | 'assess' | 'hold';
type Quadrant = 'languages' | 'frameworks' | 'infrastructure' | 'practices';

interface Tech {
	name: string;
	ring: Ring;
	quadrant: Quadrant;
	note?: string;
}

const RADAR: Tech[] = [
	// Languages
	{
		name: 'Java 21',
		ring: 'adopt',
		quadrant: 'languages',
		note: 'Daily driver. Virtual threads + records.',
	},
	{
		name: 'Python',
		ring: 'adopt',
		quadrant: 'languages',
		note: 'FastAPI services, scripting, data pipelines.',
	},
	{ name: 'SQL', ring: 'adopt', quadrant: 'languages', note: 'PostgreSQL is my default database.' },
	{
		name: 'TypeScript',
		ring: 'adopt',
		quadrant: 'languages',
		note: 'All frontend and tooling work.',
	},
	{
		name: 'Go',
		ring: 'trial',
		quadrant: 'languages',
		note: 'Excellent for CLI tools and high-throughput services.',
	},
	{ name: 'Bash', ring: 'adopt', quadrant: 'languages', note: 'Automation and CI scripts.' },

	// Frameworks & Libraries
	{
		name: 'Spring Boot 3',
		ring: 'adopt',
		quadrant: 'frameworks',
		note: 'Production-proven for payment microservices.',
	},
	{
		name: 'Spring Security',
		ring: 'adopt',
		quadrant: 'frameworks',
		note: 'OAuth2/OIDC + Keycloak integration.',
	},
	{
		name: 'FastAPI',
		ring: 'adopt',
		quadrant: 'frameworks',
		note: 'Async Python services. Excellent DX.',
	},
	{
		name: 'Next.js',
		ring: 'adopt',
		quadrant: 'frameworks',
		note: 'This site. App Router + static export.',
	},
	{
		name: 'Axon Framework',
		ring: 'trial',
		quadrant: 'frameworks',
		note: 'CQRS/ES for event-driven systems.',
	},
	{
		name: 'Hibernate',
		ring: 'adopt',
		quadrant: 'frameworks',
		note: 'JPA standard. Use projections liberally.',
	},
	{
		name: 'Celery',
		ring: 'trial',
		quadrant: 'frameworks',
		note: 'Async task queue for Python services.',
	},

	// Infrastructure
	{
		name: 'Docker',
		ring: 'adopt',
		quadrant: 'infrastructure',
		note: 'Every project. Compose for local dev.',
	},
	{
		name: 'PostgreSQL',
		ring: 'adopt',
		quadrant: 'infrastructure',
		note: 'Default RDBMS. Extensions: pgcrypto, uuid-ossp.',
	},
	{
		name: 'Redis',
		ring: 'adopt',
		quadrant: 'infrastructure',
		note: 'Caching, session, rate limiting, pub/sub.',
	},
	{
		name: 'Apache Kafka',
		ring: 'adopt',
		quadrant: 'infrastructure',
		note: 'Event streaming for microservices.',
	},
	{
		name: 'Keycloak',
		ring: 'adopt',
		quadrant: 'infrastructure',
		note: 'IAM. OIDC + fine-grained permissions.',
	},
	{
		name: 'RabbitMQ',
		ring: 'trial',
		quadrant: 'infrastructure',
		note: 'Good for task queues; Kafka for streaming.',
	},
	{
		name: 'GitHub Actions',
		ring: 'adopt',
		quadrant: 'infrastructure',
		note: 'CI/CD for all personal and work projects.',
	},
	{
		name: 'Grafana + Prometheus',
		ring: 'trial',
		quadrant: 'infrastructure',
		note: 'Metrics + dashboards. Spring Actuator + Micrometer.',
	},
	{
		name: 'Kubernetes',
		ring: 'assess',
		quadrant: 'infrastructure',
		note: 'Valuable at scale; overkill below ~50 services.',
	},

	// Practices
	{
		name: 'Domain-Driven Design',
		ring: 'adopt',
		quadrant: 'practices',
		note: 'Bounded contexts, aggregates, value objects.',
	},
	{
		name: 'Outbox Pattern',
		ring: 'adopt',
		quadrant: 'practices',
		note: 'Reliable event publishing without 2PC.',
	},
	{
		name: 'Event Sourcing',
		ring: 'trial',
		quadrant: 'practices',
		note: 'Powerful + complex. Use only when audit trail is core.',
	},
	{
		name: 'TDD',
		ring: 'adopt',
		quadrant: 'practices',
		note: 'Red-green-refactor for domain logic.',
	},
	{
		name: 'Testcontainers',
		ring: 'adopt',
		quadrant: 'practices',
		note: 'Integration tests with real DB/Kafka/Redis.',
	},
	{ name: 'ADR', ring: 'adopt', quadrant: 'practices', note: 'Document decisions as they happen.' },
	{
		name: 'Feature Flags',
		ring: 'trial',
		quadrant: 'practices',
		note: 'Decouple deploy from release.',
	},
	{
		name: 'Microservices',
		ring: 'assess',
		quadrant: 'practices',
		note: 'Start monolith. Extract when bounded contexts are clear.',
	},
	{
		name: 'GraphQL',
		ring: 'hold',
		quadrant: 'practices',
		note: 'REST + OpenAPI is simpler for most use cases.',
	},
];

const RINGS: {
	id: Ring;
	label: string;
	desc: string;
	color: string;
	dot: string;
	border: string;
}[] = [
	{
		id: 'adopt',
		label: 'Adopt',
		desc: 'Use in production.',
		color: 'text-emerald-600 dark:text-emerald-400',
		dot: 'bg-emerald-500',
		border: 'border-emerald-500/30',
	},
	{
		id: 'trial',
		label: 'Trial',
		desc: 'Worth pursuing on new projects.',
		color: 'text-blue-600 dark:text-blue-400',
		dot: 'bg-blue-500',
		border: 'border-blue-500/30',
	},
	{
		id: 'assess',
		label: 'Assess',
		desc: 'Worth a PoC.',
		color: 'text-amber-600 dark:text-amber-400',
		dot: 'bg-amber-500',
		border: 'border-amber-500/30',
	},
	{
		id: 'hold',
		label: 'Hold',
		desc: 'Avoid for new projects.',
		color: 'text-red-600 dark:text-red-400',
		dot: 'bg-red-500',
		border: 'border-red-500/30',
	},
];

const QUADRANTS: { id: Quadrant; label: string; icon: string }[] = [
	{ id: 'languages', label: 'Languages', icon: '⌨' },
	{ id: 'frameworks', label: 'Frameworks & Libraries', icon: '⚙' },
	{ id: 'infrastructure', label: 'Infrastructure & Tools', icon: '🏗' },
	{ id: 'practices', label: 'Practices & Patterns', icon: '📐' },
];

export default function StackPage() {
	return (
		<div className="mx-auto w-full max-w-4xl space-y-14">
			{/* Original stack groups section */}
			<div className="space-y-8">
				<div className="space-y-2">
					<p className="font-mono text-xs uppercase tracking-widest text-primary">stack</p>
					<h1 className="text-2xl font-bold text-foreground">Tools, but with opinions attached</h1>
					<p className="max-w-xl text-sm leading-relaxed text-muted-foreground">
						Not a giant badge wall. Just the tools I default to, the ones I can rely on, and the
						areas I am actively pushing deeper into.
					</p>
				</div>
				<div className="space-y-4">
					{STACK_GROUPS.map((group) => (
						<StackGroup
							key={group.title}
							title={group.title}
							description={group.description}
							items={group.items}
						/>
					))}
				</div>
			</div>

			<hr className="border-border" />

			{/* Tech Radar */}
			<div className="space-y-10">
				<div className="space-y-3">
					<p className="font-mono text-xs uppercase tracking-widest text-primary">tech radar</p>
					<h2 className="text-xl font-bold text-foreground sm:text-2xl">
						Adopt / Trial / Assess / Hold
					</h2>
					<p className="max-w-2xl text-sm leading-relaxed text-foreground/70">
						My personal take on technology. Inspired by{' '}
						<a
							href="https://www.thoughtworks.com/radar"
							target="_blank"
							rel="noopener noreferrer"
							className="text-accent underline-offset-2 hover:underline"
						>
							ThoughtWorks Technology Radar
						</a>
						.
					</p>
					{/* Legend */}
					<div className="flex flex-wrap gap-x-5 gap-y-1.5 pt-1">
						{RINGS.map((r) => (
							<div key={r.id} className="flex items-center gap-1.5">
								<span className={`h-2 w-2 rounded-full ${r.dot}`} />
								<span className="text-xs">
									<span className="font-semibold text-foreground">{r.label}</span>
									<span className="text-muted-foreground"> — {r.desc}</span>
								</span>
							</div>
						))}
					</div>
				</div>

				{/* Quadrants */}
				{QUADRANTS.map((q) => {
					const techs = RADAR.filter((t) => t.quadrant === q.id);
					const byRing = RINGS.map((r) => ({
						...r,
						items: techs.filter((t) => t.ring === r.id),
					})).filter((r) => r.items.length > 0);

					return (
						<section key={q.id} id={q.id} className="space-y-3">
							<h3 className="flex items-center gap-2 text-sm font-semibold text-foreground sm:text-base">
								<span aria-hidden="true">{q.icon}</span>
								{q.label}
							</h3>
							<div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
								{byRing.map((r) => (
									<div
										key={r.id}
										className={`space-y-2.5 rounded border ${r.border} bg-card/30 p-4`}
									>
										<p
											className={`font-mono text-[10px] font-bold uppercase tracking-widest ${r.color}`}
										>
											{r.label}
										</p>
										<ul className="space-y-2">
											{r.items.map((tech) => (
												<li key={tech.name} className="space-y-0.5">
													<p className="text-sm font-medium leading-tight text-foreground">
														{tech.name}
													</p>
													{tech.note && (
														<p className="text-[11px] leading-relaxed text-muted-foreground">
															{tech.note}
														</p>
													)}
												</li>
											))}
										</ul>
									</div>
								))}
							</div>
						</section>
					);
				})}

				{/* Flat tag view */}
				<section className="space-y-3 border-t border-border pt-6">
					<p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
						all · flat view
					</p>
					<div className="flex flex-wrap gap-2">
						{RADAR.sort((a, b) => {
							const order: Ring[] = ['adopt', 'trial', 'assess', 'hold'];
							return order.indexOf(a.ring) - order.indexOf(b.ring);
						}).map((tech) => {
							const r = RINGS.find((r) => r.id === tech.ring)!;
							return (
								<span
									key={`${tech.quadrant}-${tech.name}`}
									title={tech.note}
									className={`inline-flex items-center gap-1.5 rounded border ${r.border} bg-card/40 px-2 py-1 font-mono text-[11px] text-foreground/80 transition-colors hover:border-primary/40`}
								>
									<span className={`h-1.5 w-1.5 rounded-full ${r.dot}`} />
									{tech.name}
								</span>
							);
						})}
					</div>
				</section>
			</div>

			<div className="flex gap-4 border-t border-border pt-6">
				<Link
					href="/"
					className="font-mono text-xs text-muted-foreground transition-colors hover:text-foreground"
				>
					← home
				</Link>
				<Link
					href="/adr"
					className="font-mono text-xs text-muted-foreground transition-colors hover:text-foreground"
				>
					→ architecture decisions
				</Link>
			</div>
		</div>
	);
}
