import type { Post } from '@/lib/markdown';

export const SITE_NAME = 'nam';
export const SITE_URL = 'https://ntnam1605.github.io';
export const STATUS_LINE = 'building boring systems';
export const SITE_DESCRIPTION = 'Notes, articles and thoughts from a backend developer';
export const HOME_SIGNATURE = 'I build backend systems that are boring in production.';

// Replace with the public PDF share URL for the latest resume.
export const RESUME_URL =
	process.env.NEXT_PUBLIC_RESUME_URL ??
	'https://drive.google.com/file/d/your-resume-id/view?usp=sharing';

export const CATEGORY_DESCRIPTIONS = {
	csc14005: 'Lecture-backed machine learning notes, rewritten to be easier to revisit later.',
	golang: 'Go notes for small, sharp backend building blocks and concurrency instincts.',
	java: 'Java from the backend trenches: APIs, streams, and production-friendly patterns.',
	logging: 'Observability notes around logs, retention, and keeping signal over noise.',
	'machine-learning':
		'Machine learning concepts explained like systems work: assumptions, tradeoffs, behavior.',
	oauth2: 'Auth and authorization notes without pretending the specs are simpler than they are.',
	'spring-boot':
		'Spring Boot guides focused on clean APIs, service boundaries, and useful defaults.',
} as const;

export const FEATURED_WRITEUP_PATHS: readonly string[] = [
	'logging/elk-ilm-strategy-guide',
	'spring-boot/spring-boot-intro',
	'java/java-streams',
];

export const STACK_GROUPS = [
	{
		title: 'reach for',
		description:
			'The tools I default to when I want boring delivery and clear operational behavior.',
		items: ['Go', 'Java', 'Spring Boot', 'PostgreSQL', 'Redis', 'Docker'],
	},
	{
		title: 'comfortable with',
		description: 'Things I can move quickly with once the problem calls for them.',
		items: ['Kafka', 'REST APIs', 'Event-driven systems', 'CQRS / ES', 'Kubernetes', 'Tracing'],
	},
	{
		title: 'exploring now',
		description:
			'Current rabbit holes: sharpening system design instincts, not collecting buzzwords.',
		items: [
			'Axon Framework',
			'Distributed tracing',
			'Elasticsearch retention',
			'TypeScript ergonomics',
		],
	},
] as const;

export function getCategoryDescription(categorySlug: string): string {
	return (
		CATEGORY_DESCRIPTIONS[categorySlug.toLowerCase() as keyof typeof CATEGORY_DESCRIPTIONS] ??
		'Backend notes, engineering writeups, and ideas worth revisiting.'
	);
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
