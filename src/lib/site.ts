import type { Post } from '@/lib/markdown';

export const SITE_NAME = 'nam';
export const SITE_URL = 'https://namaewanam.github.io';
export const STATUS_LINE = 'building boring systems';
export const SITE_DESCRIPTION = 'Notes, articles and thoughts from a backend developer';
export const HOME_SIGNATURE = 'I build backend systems that are boring in production.';
export const HOME_RECRUITING_NOTE = 'Open to backend, systems, and platform roles.';
export const CONTACT_EMAIL = 'namisme16052004@gmail.com';

// Local CV PDF served from /public. Override with NEXT_PUBLIC_RESUME_URL env var
// to point to a Google Drive share link in production.
export const RESUME_URL = process.env.NEXT_PUBLIC_RESUME_URL ?? '/cv.pdf';

const MAIL_SUBJECTS = {
	recruiter: 'Nam | Backend Engineer Opportunity',
	collab: 'Nam | Collaboration Idea',
} as const;

const CATEGORY_GUIDES = {
	csc14005: {
		description: 'Lecture-backed machine learning notes, rewritten to be easier to revisit later.',
		startHere: 'ml-lecture1-guide',
	},
	golang: {
		description: 'Go notes for small, sharp backend building blocks and concurrency instincts.',
	},
	java: {
		description: 'Java from the backend trenches: APIs, streams, and production-friendly patterns.',
		startHere: 'java-streams',
	},
	logging: {
		description: 'Observability notes around logs, retention, and keeping signal over noise.',
		startHere: 'elk-ilm-strategy-guide',
	},
	'machine-learning': {
		description:
			'Machine learning concepts explained like systems work: assumptions, tradeoffs, behavior.',
		startHere: 'the-learning-problem',
	},
	oauth2: {
		description:
			'Auth and authorization notes without pretending the specs are simpler than they are.',
	},
	'production-notes': {
		description:
			'Short field notes for incidents, retries, dashboards, and the messy edges of production.',
		startHere: 'incident-timeline-before-fix',
	},
	'spring-boot': {
		description:
			'Spring Boot guides focused on clean APIs, service boundaries, and useful defaults.',
		startHere: 'spring-boot-intro',
	},
} as const;

export const FEATURED_WRITEUP_PATHS: readonly string[] = [
	'logging/elk-ilm-strategy-guide',
	'spring-boot/spring-boot-intro',
	'java/java-streams',
];

export const STACK_GROUPS = [
	{
		title: 'reach for',
		description: 'The tools I default to when I need reliable, maintainable backend systems.',
		items: ['Java', 'Spring Boot', 'PostgreSQL', 'Redis', 'Docker', 'Linux'],
	},
	{
		title: 'comfortable with',
		description: 'Tools I can move quickly with once the problem calls for them.',
		items: ['Python', 'FastAPI', 'Apache Kafka', 'Keycloak / OAuth2', 'Jenkins CI/CD', 'GitLab CI'],
	},
	{
		title: 'exploring now',
		description:
			'Current rabbit holes: sharpening system design instincts, not collecting buzzwords.',
		items: [
			'Event sourcing / CQRS',
			'Distributed tracing',
			'Observability patterns',
			'Microservices resilience',
		],
	},
] as const;

export const INTEREST_GROUPS = [
	{
		title: 'systems that stay calm',
		description:
			'I like distributed systems that fail predictably, recover cleanly, and stay readable under pressure.',
		items: ['resilience patterns', 'queues', 'timeouts', 'backpressure'],
	},
	{
		title: 'observability with signal',
		description:
			'Tracing, logs, dashboards, and retention policies are more interesting to me when they reduce confusion instead of adding more noise.',
		items: ['distributed tracing', 'logging strategy', 'alert quality', 'incident timelines'],
	},
	{
		title: 'learning in public',
		description:
			'I enjoy turning class notes, production lessons, and backend rabbit holes into writeups that are easier to revisit later.',
		items: [
			'technical writing',
			'machine learning notes',
			'backend field notes',
			'teaching by rewriting',
		],
	},
] as const;

export type MailSubjectKey = keyof typeof MAIL_SUBJECTS;

export function buildMailtoHref(kind: MailSubjectKey = 'collab'): string {
	const params = new URLSearchParams({ subject: MAIL_SUBJECTS[kind] });
	return `mailto:${CONTACT_EMAIL}?${params.toString()}`;
}

export function getCategoryDescription(categorySlug: string): string {
	return (
		CATEGORY_GUIDES[categorySlug.toLowerCase() as keyof typeof CATEGORY_GUIDES]?.description ??
		'Backend notes, engineering writeups, and ideas worth revisiting.'
	);
}

export function getCategoryStartHerePath(categorySlug: string): string | undefined {
	const guide = CATEGORY_GUIDES[categorySlug.toLowerCase() as keyof typeof CATEGORY_GUIDES];
	return guide && 'startHere' in guide ? guide.startHere : undefined;
}

export function toPostOgSlug(category: string, fullPath: string): string {
	return `${category}~${fullPath.replaceAll('/', '~')}`;
}

export function fromPostOgSlug(slug: string): { category: string; fullPath: string } {
	const [category = '', ...rest] = slug.split('~');
	return {
		category,
		fullPath: rest.join('/'),
	};
}

export function getFeaturedPosts(posts: Post[]): Post[] {
	const wanted = new Set(FEATURED_WRITEUP_PATHS);
	const featured = posts.filter((post) => wanted.has(`${post.category}/${post.fullPath}`));

	if (featured.length === FEATURED_WRITEUP_PATHS.length) {
		return FEATURED_WRITEUP_PATHS.map((path) =>
			featured.find((post) => `${post.category}/${post.fullPath}` === path)
		).filter((post): post is Post => Boolean(post));
	}

	return posts.filter((post) => post.codePercent >= 10 || post.readingTimeMin >= 4).slice(0, 3);
}
