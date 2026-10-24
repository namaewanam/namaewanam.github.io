import type { Post } from '@/lib/markdown';

export const SITE_NAME = process.env.NEXT_PUBLIC_SITE_NAME || 'nam';
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://namaewanam.github.io';
export const STATUS_LINE = process.env.NEXT_PUBLIC_STATUS_LINE || 'building boring systems';
export const SITE_DESCRIPTION =
	process.env.NEXT_PUBLIC_SITE_DESCRIPTION ||
	'Notes, articles and thoughts from a backend developer';
export const HOME_SIGNATURE = 'I build backend systems that are boring in production.';
export const HOME_RECRUITING_NOTE = 'Open to backend, systems, and platform roles.';
export const CONTACT_EMAIL = process.env.NEXT_PUBLIC_CONTACT_EMAIL || 'namisme16052004@gmail.com';
export const GITHUB_USERNAME = process.env.NEXT_PUBLIC_GITHUB_USERNAME || 'ntnam1605';
export const GITHUB_REPO_OWNER = process.env.NEXT_PUBLIC_GITHUB_OWNER || 'namaewanam';
export const GITHUB_REPO_NAME = process.env.NEXT_PUBLIC_GITHUB_REPO || 'namaewanam.github.io';
export const BUTTONDOWN_USERNAME = process.env.NEXT_PUBLIC_BUTTONDOWN_USERNAME || 'namisme16052004';
export const GITHUB_PROFILE_URL = `https://github.com/${GITHUB_USERNAME}`;

export const SITE_HOSTNAME = (() => {
	try {
		return new URL(SITE_URL).hostname;
	} catch {
		return 'namaewanam.github.io';
	}
})();

export const GISCUS_REPO =
	process.env.NEXT_PUBLIC_GISCUS_REPO || `${GITHUB_REPO_OWNER}/${GITHUB_REPO_NAME}`;
export const GISCUS_REPO_ID = process.env.NEXT_PUBLIC_GISCUS_REPO_ID || '';
export const GISCUS_CATEGORY = process.env.NEXT_PUBLIC_GISCUS_CATEGORY || 'Announcements';
export const GISCUS_CATEGORY_ID = process.env.NEXT_PUBLIC_GISCUS_CATEGORY_ID || '';

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

export const getStackGroups = (lang: string) => [
	{
		title: lang === 'vi' ? 'công cụ mặc định' : 'reach for',
		description:
			lang === 'vi'
				? 'Những công cụ tôi ưu tiên lựa chọn khi cần xây dựng hệ thống backend tin cậy và dễ bảo trì.'
				: 'The tools I default to when I need reliable, maintainable backend systems.',
		items: ['Java', 'Spring Boot', 'PostgreSQL', 'Redis', 'Docker', 'Linux'],
	},
	{
		title: lang === 'vi' ? 'sử dụng thành thạo' : 'comfortable with',
		description:
			lang === 'vi'
				? 'Các công cụ tôi có thể triển khai nhanh chóng khi bài toán yêu cầu.'
				: 'Tools I can move quickly with once the problem calls for them.',
		items: ['Python', 'FastAPI', 'Apache Kafka', 'Keycloak / OAuth2', 'Jenkins CI/CD', 'GitLab CI'],
	},
	{
		title: lang === 'vi' ? 'đang nghiên cứu' : 'exploring now',
		description:
			lang === 'vi'
				? 'Chủ đề đang đào sâu: rèn luyện tư duy thiết kế hệ thống thay vì chạy theo từ khóa công nghệ.'
				: 'Current rabbit holes: sharpening system design instincts, not collecting buzzwords.',
		items: [
			'Event sourcing / CQRS',
			'Distributed tracing',
			'Observability patterns',
			'Microservices resilience',
		],
	},
];

export const getInterestGroups = (lang: string) => [
	{
		title: lang === 'vi' ? 'Hệ thống vận hành êm ái' : 'systems that stay calm',
		description:
			lang === 'vi'
				? 'Tôi thích các hệ thống phân tán có khả năng dự đoán trước lỗi, tự phục hồi rõ ràng và dễ dàng nắm bắt kể cả dưới áp lực lớn.'
				: 'I like distributed systems that fail predictably, recover cleanly, and stay readable under pressure.',
		items:
			lang === 'vi'
				? ['mô hình phục hồi', 'hàng đợi', 'thời gian chờ (timeouts)', 'backpressure']
				: ['resilience patterns', 'queues', 'timeouts', 'backpressure'],
	},
	{
		title: lang === 'vi' ? 'Khả năng quan sát (observability)' : 'observability with signal',
		description:
			lang === 'vi'
				? 'Tracing, logs, dashboards, và các chính sách lưu trữ sẽ thú vị hơn khi chúng giảm bớt sự nhầm lẫn thay vì tạo thêm tiếng ồn.'
				: 'Tracing, logs, dashboards, and retention policies are more interesting to me when they reduce confusion instead of adding more noise.',
		items:
			lang === 'vi'
				? ['distributed tracing', 'chiến lược logging', 'chất lượng cảnh báo', 'incident timelines']
				: ['distributed tracing', 'logging strategy', 'alert quality', 'incident timelines'],
	},
	{
		title: lang === 'vi' ? 'Học hỏi công khai' : 'learning in public',
		description:
			lang === 'vi'
				? 'Tôi thích chuyển các ghi chép trên lớp, bài học từ production và các nghiên cứu sâu về backend thành các bài viết dễ tra cứu lại sau này.'
				: 'I enjoy turning class notes, production lessons, and backend rabbit holes into writeups that are easier to revisit later.',
		items:
			lang === 'vi'
				? [
						'viết kỹ thuật',
						'ghi chép machine learning',
						'ghi chép backend',
						'dạy thông qua viết lại',
					]
				: [
						'technical writing',
						'machine learning notes',
						'backend field notes',
						'teaching by rewriting',
					],
	},
];

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
