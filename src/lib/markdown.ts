import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import matter from 'gray-matter';
import { getCategoryDescription, getCategoryStartHerePath } from '@/lib/site';

const postsDirectory = path.join(process.cwd(), 'docs');
const SERIES_FILENAME = '_series.md';
const SERIES_FILE_PATTERN = /^_series(?:\.([a-z]{2}))?\.md$/i;

function isSeriesFile(filename: string): boolean {
	return SERIES_FILE_PATTERN.test(filename);
}

function parseSeriesFilename(filename: string): { isSeries: boolean; lang?: string } {
	const match = SERIES_FILE_PATTERN.exec(filename);
	if (!match) return { isSeries: false };
	const lang = match[1]?.toLowerCase();
	return {
		isSeries: true,
		...(lang ? { lang } : {}),
	};
}
const postMetadataManifestPath = path.join(
	process.cwd(),
	'public',
	'_content',
	'post-metadata.json'
);

export interface Post {
	slug: string;
	category: string;
	categoryName: string;
	subcategory?: string;
	title: string;
	date?: string;
	description?: string;
	content: string;
	order?: number;
	fullPath: string;
	filePath: string;
	tags?: string[];
	readingTimeMin: number;
	codePercent: number;
	lastUpdated?: string;
	difficulty?: 'beginner' | 'intermediate' | 'advanced';
	featured?: boolean;
	lang: string;
	type?: 'theory' | 'practice';
	practice?: string;
	practiceFor?: string;
}

export interface Category {
	slug: string;
	name: string;
	count: number;
	description: string;
	startHere?: {
		title: string;
		fullPath: string;
	};
}

export interface BlogSearchPost {
	slug: string;
	category: string;
	categoryName: string;
	title: string;
	description?: string;
	date?: string;
	fullPath: string;
	tags: string[];
	searchText: string;
	lang: string;
}

export interface SeriesMetadata {
	title?: string;
	description?: string;
	content?: string;
	startHere?: string;
	nextRecommended?: string;
	difficulty?: string;
	prerequisites?: string[];
	youWillUnderstand?: string[];
	useItFor?: string[];
	lang?: string;
}

export interface AdjacentPosts {
	previous: Post | null;
	next: Post | null;
}

interface ContentIndex {
	allPosts: Post[];
	blogSearchPosts: BlogSearchPost[];
	categories: Category[];
	postsByCategory: Map<string, Post[]>;
	postByKey: Map<string, Post>;
	seriesByCategory: Map<string, Map<string, SeriesMetadata>>;
	allTags: { tag: string; count: number }[];
}

/** Words per minute for reading time calculation */
const WPM = 200;
let cachedContentIndex: ContentIndex | null = null;
let cachedLastUpdatedMap: Map<string, string> | null = null;

function shouldUseInMemoryCache(): boolean {
	return process.env.NODE_ENV === 'production';
}

function computeReadingTime(content: string): number {
	const words = content.trim().split(/\s+/).length;
	return Math.max(1, Math.ceil(words / WPM));
}

function computeCodePercent(content: string): number {
	const codeBlockRegex = /```[\s\S]*?```/g;
	const matches = content.match(codeBlockRegex);
	if (!matches || content.length === 0) return 0;
	const codeChars = matches.reduce((sum, block) => sum + block.length, 0);
	return Math.round((codeChars / content.length) * 100);
}

function getGitLastUpdated(filePath: string): string | undefined {
	try {
		const result = execFileSync('git', ['log', '-1', '--format=%cI', '--', filePath], {
			encoding: 'utf8',
			stdio: ['pipe', 'pipe', 'ignore'],
		}).trim();
		return result || undefined;
	} catch {
		return undefined;
	}
}

function isPracticePost(post: Post): boolean {
	return post.type === 'practice' || Boolean(post.practiceFor);
}

function sortPosts(posts: Post[]): Post[] {
	return [...posts].sort((a, b) => {
		if (a.order !== undefined && b.order !== undefined) {
			if (a.order !== b.order) {
				return a.order - b.order;
			}
			const aIsPractice = isPracticePost(a);
			const bIsPractice = isPracticePost(b);
			if (aIsPractice && !bIsPractice) return 1;
			if (!aIsPractice && bIsPractice) return -1;
		}
		if (a.date && b.date) {
			return new Date(b.date).getTime() - new Date(a.date).getTime();
		}
		return 0;
	});
}

function buildTags(posts: Post[]): { tag: string; count: number }[] {
	const tagMap = new Map<string, number>();

	posts.forEach((post) => {
		if (post.tags) {
			post.tags.forEach((tag) => {
				tagMap.set(tag, (tagMap.get(tag) ?? 0) + 1);
			});
		}
		tagMap.set(post.category, (tagMap.get(post.category) ?? 0) + 1);
	});

	return Array.from(tagMap.entries())
		.map(([tag, count]) => ({ tag, count }))
		.sort((a, b) => b.count - a.count);
}

function buildSearchText(post: {
	title: string;
	description?: string;
	categoryName: string;
	tags?: string[];
	content: string;
}) {
	// Strip fenced code blocks and limit prose excerpt to prevent bloating HTML/RSC payload
	const proseContent = post.content
		.replace(/```[\s\S]*?```/g, '')
		.replace(/\s+/g, ' ')
		.slice(0, 1500);

	return [
		post.title,
		post.description,
		post.categoryName,
		(post.tags ?? []).join(' '),
		proseContent,
	]
		.filter(Boolean)
		.join(' ')
		.replace(/[`#>*_[\]-]/g, ' ')
		.toLowerCase();
}

function loadLastUpdatedMap(): Map<string, string> {
	if (shouldUseInMemoryCache() && cachedLastUpdatedMap) {
		return cachedLastUpdatedMap;
	}

	let nextMap: Map<string, string>;

	try {
		const raw = fs.readFileSync(postMetadataManifestPath, 'utf8');
		const parsed = JSON.parse(raw) as { posts?: Record<string, { lastUpdated?: string }> };
		nextMap = new Map(
			Object.entries(parsed.posts ?? {})
				.filter(([, value]) => Boolean(value?.lastUpdated))
				.map(([key, value]) => [key, value.lastUpdated as string])
		);
	} catch {
		nextMap = new Map();
	}

	if (shouldUseInMemoryCache()) {
		cachedLastUpdatedMap = nextMap;
	}

	return nextMap;
}

function trimSlashes(str: string): string {
	let start = 0;
	while (start < str.length && str[start] === '/') start++;
	let end = str.length;
	while (end > start && str[end - 1] === '/') end--;
	return str.slice(start, end);
}

function normalizePostReference(reference: string): string {
	return trimSlashes(reference.replace(/\.(en|vi)\.md$/i, '').replace(/\.md$/i, '')).toLowerCase();
}

function resolvePostReference(posts: Post[], reference?: string): Post | null {
	if (!reference) return null;

	const normalized = normalizePostReference(reference);
	return (
		posts.find(
			(post) =>
				post.fullPath.toLowerCase() === normalized ||
				post.slug.toLowerCase() === normalized ||
				`${post.category}/${post.fullPath}`.toLowerCase() === normalized
		) ?? null
	);
}

function parseStringList(value: unknown): string[] | undefined {
	if (Array.isArray(value)) {
		return value.map((item) => String(item).trim()).filter(Boolean);
	}
	if (typeof value === 'string') {
		return value
			.split(',')
			.map((item) => item.trim())
			.filter(Boolean);
	}
	return undefined;
}

function parseDifficulty(value: unknown): 'beginner' | 'intermediate' | 'advanced' | undefined {
	const str = String(value).toLowerCase();
	if (str === 'beginner' || str === 'intermediate' || str === 'advanced') {
		return str;
	}
	return undefined;
}

function readSeriesMetadata(seriesPath: string): SeriesMetadata | null {
	if (!fs.existsSync(seriesPath)) return null;

	try {
		const fileContents = fs.readFileSync(seriesPath, 'utf8');
		const { data, content } = matter(fileContents);
		const trimmedContent = content.trim();
		const metadata: SeriesMetadata = {};

		if (data.title) metadata.title = String(data.title);
		if (data.description) metadata.description = String(data.description);
		if (data.startHere) metadata.startHere = normalizePostReference(String(data.startHere));
		if (data.nextRecommended) {
			metadata.nextRecommended = normalizePostReference(String(data.nextRecommended));
		}
		if (data.difficulty) metadata.difficulty = String(data.difficulty);

		const prerequisites = parseStringList(data.prerequisites);
		if (prerequisites) metadata.prerequisites = prerequisites;

		const youWillUnderstand = parseStringList(data.youWillUnderstand);
		if (youWillUnderstand) metadata.youWillUnderstand = youWillUnderstand;

		const useItFor = parseStringList(data.useItFor);
		if (useItFor) metadata.useItFor = useItFor;

		if (trimmedContent) metadata.content = trimmedContent;

		return metadata;
	} catch (error) {
		console.error(`Error reading series metadata: ${seriesPath}`, error);
		return null;
	}
}

function getPostByPath(category: string, relativePath: string): Post | null {
	const categoryPath = path.join(postsDirectory, category);
	const fullPath = path.join(categoryPath, relativePath);

	if (!fs.existsSync(fullPath)) {
		return null;
	}

	try {
		const fileContents = fs.readFileSync(fullPath, 'utf8');
		const { data, content } = matter(fileContents);

		const langMatch = /\.(en|vi)\.md$/.exec(relativePath);
		const lang = (langMatch ? langMatch[1] : 'en') ?? 'en';
		const cleanRelativePath = relativePath.replace(/\.(en|vi)\.md$/, '.md');

		const pathParts = cleanRelativePath.replace(/\.md$/, '').split(path.sep);
		const slug = pathParts.at(-1) ?? '';
		const subcategory = pathParts.length > 1 ? pathParts.slice(0, -1).join('/') : undefined;
		const urlPath = cleanRelativePath
			.replace(/\.md$/, '')
			.split(path.sep)
			.map((part) => part.toLowerCase())
			.join('/');
		const postKey = `${category.toLowerCase()}/${urlPath}`;

		const tags = parseStringList(data.tags)?.map((t) => t.toLowerCase()) ?? [];
		const readingTimeMin = computeReadingTime(content);
		const codePercent = computeCodePercent(content);
		const lastUpdated = loadLastUpdatedMap().get(postKey) ?? getGitLastUpdated(fullPath);

		const post: Post = {
			category: category.toLowerCase(),
			categoryName: category,
			slug: slug.toLowerCase(),
			title: (data.title as string | undefined) ?? slug.replace(/-/g, ' '),
			content,
			fullPath: urlPath,
			filePath: `${category}/${relativePath}`,
			tags,
			readingTimeMin,
			codePercent,
			lang,
		};

		if (subcategory !== undefined) post.subcategory = subcategory;
		if (data.date) post.date = String(data.date);
		if (data.description) post.description = String(data.description);
		if (data.order !== undefined) post.order = Number(data.order);
		if (lastUpdated) post.lastUpdated = lastUpdated;
		const difficulty = parseDifficulty(data.difficulty);
		if (difficulty) post.difficulty = difficulty;
		if (data.featured) post.featured = Boolean(data.featured);
		if (data.practice) post.practice = String(data.practice).trim();
		if (data.practiceFor) post.practiceFor = String(data.practiceFor).trim();
		if (data.type) {
			const typeStr = String(data.type).toLowerCase();
			if (typeStr === 'practice' || typeStr === 'theory') {
				post.type = typeStr;
			}
		} else if (post.practiceFor) {
			post.type = 'practice';
		}

		return post;
	} catch (error) {
		console.error(`Error reading post: ${fullPath}`, error);
		return null;
	}
}

function collectPostsFromDirectory(dir: string, category: string, filesList: Post[] = []): Post[] {
	const files = fs.readdirSync(dir);

	files.forEach((file) => {
		const filePath = path.join(dir, file);
		const stat = fs.statSync(filePath);

		if (stat.isDirectory()) {
			collectPostsFromDirectory(filePath, category, filesList);
			return;
		}

		if (!file.endsWith('.md') || isSeriesFile(file)) return;

		const categoryPath = path.join(postsDirectory, category);
		const relativePath = path.relative(categoryPath, filePath);
		const post = getPostByPath(category, relativePath);
		if (post) filesList.push(post);
	});

	return filesList;
}

function buildCategoryStartHere(
	posts: Post[],
	categorySlug: string
): Category['startHere'] | undefined {
	const configuredPath = getCategoryStartHerePath(categorySlug);
	const startHerePost = resolvePostReference(posts, configuredPath) ?? posts[0] ?? null;

	if (!startHerePost) {
		return undefined;
	}

	return {
		title: startHerePost.title,
		fullPath: startHerePost.fullPath,
	};
}

function buildContentIndex(): ContentIndex {
	const categoryDirs = fs.readdirSync(postsDirectory).filter((entry) => {
		if (entry.startsWith('.') || entry === 'superpowers') return false;
		return fs.statSync(path.join(postsDirectory, entry)).isDirectory();
	});
	const allPosts: Post[] = [];
	const categories: Category[] = [];
	const postsByCategory = new Map<string, Post[]>();
	const postByKey = new Map<string, Post>();
	const seriesByCategory = new Map<string, Map<string, SeriesMetadata>>();

	categoryDirs.forEach((categoryDir) => {
		const categoryPath = path.join(postsDirectory, categoryDir);
		const categorySlug = categoryDir.toLowerCase();
		const posts = sortPosts(collectPostsFromDirectory(categoryPath, categoryDir));

		postsByCategory.set(categorySlug, posts);
		posts.forEach((post) => {
			allPosts.push(post);
			postByKey.set(`${post.lang}/${post.category}/${post.fullPath}`, post);
		});

		if (posts.length > 0) {
			const startHere = buildCategoryStartHere(posts, categorySlug);
			categories.push({
				name: categoryDir,
				slug: categorySlug,
				count: posts.length,
				description: getCategoryDescription(categoryDir),
				...(startHere ? { startHere } : {}),
			});
		}

		const categorySeriesMap = new Map<string, SeriesMetadata>();
		const defaultSeries = readSeriesMetadata(path.join(categoryPath, SERIES_FILENAME));
		if (defaultSeries) {
			categorySeriesMap.set('default', defaultSeries);
		}

		// Scan for localized series files (e.g., _series.vi.md, _series.en.md)
		const categoryEntries = fs.readdirSync(categoryPath);
		categoryEntries.forEach((entry) => {
			const parsed = parseSeriesFilename(entry);
			if (parsed.isSeries && parsed.lang) {
				const localizedSeries = readSeriesMetadata(path.join(categoryPath, entry));
				if (localizedSeries) {
					categorySeriesMap.set(parsed.lang, {
						...defaultSeries,
						...localizedSeries,
						lang: parsed.lang,
					});
				}
			}
		});

		if (categorySeriesMap.size > 0) {
			seriesByCategory.set(categorySlug, categorySeriesMap);
		}
	});

	const sortedPosts = sortPosts(allPosts);
	const blogSearchPosts = sortedPosts.map((post) => ({
		slug: post.slug,
		category: post.category,
		categoryName: post.categoryName,
		title: post.title,
		fullPath: post.fullPath,
		tags: post.tags ?? [],
		lang: post.lang,
		searchText: buildSearchText({
			title: post.title,
			categoryName: post.categoryName,
			tags: post.tags ?? [],
			content: post.content,
			...(post.description ? { description: post.description } : {}),
		}),
		...(post.description ? { description: post.description } : {}),
		...(post.date ? { date: post.date } : {}),
	}));

	return {
		allPosts: sortedPosts,
		blogSearchPosts,
		categories,
		postsByCategory,
		postByKey,
		seriesByCategory,
		allTags: buildTags(sortedPosts),
	};
}

function getContentIndex(): ContentIndex {
	if (!shouldUseInMemoryCache()) {
		return buildContentIndex();
	}

	if (!cachedContentIndex) {
		cachedContentIndex = buildContentIndex();
	}

	return cachedContentIndex;
}

function filterByLanguageWithFallback<
	T extends { lang: string; fullPath: string; category: string },
>(items: T[], requestedLang: string): T[] {
	const byPostKey = new Map<string, T[]>();
	for (const item of items) {
		const key = `${item.category}/${item.fullPath}`.toLowerCase();
		const list = byPostKey.get(key) ?? [];
		list.push(item);
		byPostKey.set(key, list);
	}

	const result: T[] = [];
	const fallbackLang = requestedLang === 'en' ? 'vi' : 'en';

	for (const group of byPostKey.values()) {
		// 1. Exact match for requested language
		const exact = group.find((item) => item.lang === requestedLang);
		if (exact) {
			result.push(exact);
			continue;
		}

		// 2. Try alternate supported language
		const fallback = group.find((item) => item.lang === fallbackLang);
		if (fallback) {
			result.push(fallback);
			continue;
		}

		// 3. Fall back to any available version
		if (group[0]) {
			result.push(group[0]);
		}
	}

	return result;
}

export function getAllPosts(lang: string = 'en'): Post[] {
	const all = getContentIndex().allPosts;
	return sortPosts(filterByLanguageWithFallback(all, lang));
}

export function getBlogSearchPosts(lang: string = 'en'): BlogSearchPost[] {
	const all = getContentIndex().blogSearchPosts;
	return filterByLanguageWithFallback(all, lang);
}

export function getPostsByCategory(category: string, lang: string = 'en'): Post[] {
	return getAllPosts(lang).filter((p) => p.category === category.toLowerCase());
}

export function getSeriesMetadata(category: string, lang: string = 'en'): SeriesMetadata | null {
	const categorySeries = getContentIndex().seriesByCategory.get(category.toLowerCase());
	if (!categorySeries) return null;

	const normalizedLang = lang.toLowerCase();

	// 1. Try exact requested language (e.g. 'vi', 'en')
	const target = categorySeries.get(normalizedLang);
	if (target) return target;

	// 2. Fall back to 'default' (_series.md)
	const defaultSeries = categorySeries.get('default');
	if (defaultSeries) return defaultSeries;

	// 3. Fall back to alternate language ('en' -> 'vi' or 'vi' -> 'en')
	const fallbackLang = normalizedLang === 'en' ? 'vi' : 'en';
	const fallbackSeries = categorySeries.get(fallbackLang);
	if (fallbackSeries) return fallbackSeries;

	// 4. Return any available series metadata
	return categorySeries.values().next().value ?? null;
}

export function getPostBySlug(category: string, slug: string, lang: string = 'en'): Post | null {
	const index = getContentIndex();
	const catKey = category.toLowerCase();
	const slugKey = slug.toLowerCase();
	const post = index.postByKey.get(`${lang}/${catKey}/${slugKey}`);
	if (post) return post;
	const fallbackLang = lang === 'en' ? 'vi' : 'en';
	const fallbackPost = index.postByKey.get(`${fallbackLang}/${catKey}/${slugKey}`);
	if (fallbackPost) return fallbackPost;
	return null;
}

export function getPracticePost(
	category: string,
	currentPost: Post,
	lang: string = 'en'
): Post | null {
	const posts = getPostsByCategory(category, lang);
	if (currentPost.practice) {
		const direct = resolvePostReference(posts, currentPost.practice);
		if (direct) return direct;
	}
	const currentNormalized = normalizePostReference(currentPost.fullPath);
	const currentSlugNormalized = normalizePostReference(currentPost.slug);
	const reverse = posts.find((p) => {
		if (!p.practiceFor) return false;
		const ref = normalizePostReference(p.practiceFor);
		return (
			ref === currentNormalized ||
			ref === currentSlugNormalized ||
			ref === `${currentPost.category}/${currentNormalized}`
		);
	});
	return reverse ?? null;
}

export function getTheoryPost(
	category: string,
	currentPost: Post,
	lang: string = 'en'
): Post | null {
	const posts = getPostsByCategory(category, lang);
	if (currentPost.practiceFor) {
		const direct = resolvePostReference(posts, currentPost.practiceFor);
		if (direct) return direct;
	}
	const currentNormalized = normalizePostReference(currentPost.fullPath);
	const currentSlugNormalized = normalizePostReference(currentPost.slug);
	const reverse = posts.find((p) => {
		if (!p.practice) return false;
		const ref = normalizePostReference(p.practice);
		return (
			ref === currentNormalized ||
			ref === currentSlugNormalized ||
			ref === `${currentPost.category}/${currentNormalized}`
		);
	});
	return reverse ?? null;
}

export function getAdjacentPosts(
	category: string,
	currentPost: Post,
	lang: string = 'en'
): AdjacentPosts {
	const posts = getPostsByCategory(category, lang);
	const relevantPosts = currentPost.subcategory
		? posts.filter((p) => p.subcategory === currentPost.subcategory)
		: posts;

	const isPractice = isPracticePost(currentPost);
	if (isPractice) {
		const theoryPost = getTheoryPost(category, currentPost, lang);
		if (theoryPost) {
			const theoryAdjacent = getAdjacentPosts(category, theoryPost, lang);
			return {
				previous: theoryPost,
				next: theoryAdjacent.next,
			};
		}
	}

	// Filter out practice posts from the sequential list so theory posts flow continuously
	const sequentialPosts = relevantPosts.filter((p) => !isPracticePost(p));
	const currentIndex = sequentialPosts.findIndex((p) => p.fullPath === currentPost.fullPath);

	if (currentIndex === -1) {
		const fallbackIndex = relevantPosts.findIndex((p) => p.fullPath === currentPost.fullPath);
		if (fallbackIndex === -1) {
			return { previous: null, next: null };
		}
		return {
			previous: fallbackIndex > 0 ? (relevantPosts[fallbackIndex - 1] ?? null) : null,
			next:
				fallbackIndex < relevantPosts.length - 1
					? (relevantPosts[fallbackIndex + 1] ?? null)
					: null,
		};
	}

	return {
		previous: currentIndex > 0 ? (sequentialPosts[currentIndex - 1] ?? null) : null,
		next:
			currentIndex < sequentialPosts.length - 1
				? (sequentialPosts[currentIndex + 1] ?? null)
				: null,
	};
}

export function getCategories(lang?: string): Category[] {
	const categories = getContentIndex().categories;
	if (!lang) return categories;
	return categories.map((cat) => {
		const posts = getPostsByCategory(cat.slug, lang);
		return {
			...cat,
			count: posts.length,
		};
	});
}

export function getRelatedPosts(currentPost: Post, limit = 3, lang: string = 'en'): Post[] {
	const allPosts = getAllPosts(lang).filter(
		(post) => !(post.category === currentPost.category && post.fullPath === currentPost.fullPath)
	);

	const currentTags = new Set(currentPost.tags ?? []);
	const ranked = allPosts
		.map((post) => {
			const sharedTags = (post.tags ?? []).filter((tag) => currentTags.has(tag));
			const sameCategory = post.category === currentPost.category ? 1 : 0;
			const sameSubcategory =
				currentPost.subcategory && post.subcategory === currentPost.subcategory ? 1 : 0;
			const score = sharedTags.length * 4 + sameSubcategory * 3 + sameCategory * 2;

			return {
				post,
				score,
				sharedTags: sharedTags.length,
				timestamp: post.date ? new Date(post.date).getTime() : 0,
			};
		})
		.filter((item) => item.score > 0)
		.sort((a, b) => {
			if (b.score !== a.score) return b.score - a.score;
			if (b.sharedTags !== a.sharedTags) return b.sharedTags - a.sharedTags;
			return b.timestamp - a.timestamp;
		})
		.map((item) => item.post);

	if (ranked.length >= limit) {
		return ranked.slice(0, limit);
	}

	const fallback = allPosts
		.filter(
			(post) =>
				!ranked.some(
					(candidate) =>
						candidate.category === post.category && candidate.fullPath === post.fullPath
				)
		)
		.sort((a, b) => {
			const sameCategoryA = a.category === currentPost.category ? 1 : 0;
			const sameCategoryB = b.category === currentPost.category ? 1 : 0;
			if (sameCategoryB !== sameCategoryA) return sameCategoryB - sameCategoryA;
			return (b.date ? new Date(b.date).getTime() : 0) - (a.date ? new Date(a.date).getTime() : 0);
		});

	return [...ranked, ...fallback].slice(0, limit);
}

export function getAllTags(lang: string = 'en'): { tag: string; count: number }[] {
	// Recompute tags for the specific language
	return buildTags(getAllPosts(lang));
}
