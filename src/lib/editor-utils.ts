import matter from 'gray-matter';

export interface PostMetadata {
	title: string;
	date: string;
	category: string;
	tags: string[];
	description: string;
	lang: 'en' | 'vi';
	difficulty?: 'beginner' | 'intermediate' | 'advanced' | undefined;
	featured?: boolean | undefined;
	order?: number | undefined;
}

export const KNOWN_CATEGORIES = [
	'Backend',
	'Java',
	'Spring-Boot',
	'Logging',
	'Production-Notes',
	'Database-Internals-Book-Notes',
	'CSC14005',
	'Machine-Learning',
	'adr',
];

/**
 * Converts a string into a clean, URL-safe slug.
 * Handles Vietnamese characters and accents properly.
 */
export function slugify(text: string): string {
	return text
		.toLowerCase()
		.replace(/đ/g, 'd')
		.replace(/Đ/g, 'd')
		.normalize('NFD')
		.replace(/[\u0300-\u036f]/g, '') // remove diacritics
		.replace(/[^a-z0-9\s-]/g, '') // remove special characters
		.trim()
		.replace(/\s+/g, '-') // replace spaces with hyphens
		.replace(/-+/g, '-'); // collapse consecutive hyphens
}

/**
 * Constructs the canonical file path in docs/
 */
export function buildPostPath(category: string, slug: string, lang: 'en' | 'vi'): string {
	const cleanCategory = category.trim() || 'Backend';
	const cleanSlug = slugify(slug);
	const ext = lang === 'vi' ? '.vi.md' : '.en.md';
	return `docs/${cleanCategory}/${cleanSlug}${ext}`;
}

/**
 * Serializes post metadata and markdown body into a full document with YAML frontmatter.
 */
export function serializePost(metadata: PostMetadata, markdownBody: string): string {
	const frontmatterData: Record<string, unknown> = {
		title: metadata.title.trim(),
		date: metadata.date.trim() || new Date().toISOString().split('T')[0],
		category: metadata.category.trim() || 'Backend',
		lang: metadata.lang || 'en',
	};

	if (metadata.description?.trim()) {
		frontmatterData.description = metadata.description.trim();
	}

	if (metadata.tags && metadata.tags.length > 0) {
		frontmatterData.tags = metadata.tags.map((t) => t.trim().toLowerCase()).filter(Boolean);
	}

	if (metadata.difficulty) {
		frontmatterData.difficulty = metadata.difficulty;
	}

	if (metadata.featured !== undefined) {
		frontmatterData.featured = metadata.featured;
	}

	if (metadata.order !== undefined) {
		frontmatterData.order = metadata.order;
	}

	const cleanedBody = markdownBody.trimStart();
	return matter.stringify(cleanedBody ? `\n${cleanedBody}\n` : '\n', frontmatterData);
}

/**
 * Parses raw markdown file content, extracting frontmatter and body.
 */
export function parsePost(rawContent: string): {
	metadata: PostMetadata;
	markdownBody: string;
} {
	const parsed = matter(rawContent);
	const data = parsed.data || {};

	let tags: string[] = [];
	if (Array.isArray(data.tags)) {
		tags = data.tags.map(String);
	} else if (typeof data.tags === 'string') {
		tags = data.tags
			.split(',')
			.map((t: string) => t.trim())
			.filter(Boolean);
	}

	let lang: 'en' | 'vi' = 'en';
	if (data.lang === 'vi' || data.lang === 'en') {
		lang = data.lang;
	}

	const today = new Date().toISOString().split('T')[0] ?? '';
	const dateStr = data.date
		? typeof data.date === 'string'
			? data.date
			: (new Date(data.date).toISOString().split('T')[0] ?? today)
		: today;

	return {
		metadata: {
			title: String(data.title || ''),
			date: dateStr,
			category: String(data.category || ''),
			tags,
			description: String(data.description || ''),
			lang,
			difficulty: data.difficulty,
			featured: typeof data.featured === 'boolean' ? data.featured : undefined,
			order: typeof data.order === 'number' ? data.order : undefined,
		},
		markdownBody: parsed.content || '',
	};
}
