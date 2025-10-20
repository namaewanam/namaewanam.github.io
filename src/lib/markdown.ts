import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';

const postsDirectory = path.join(process.cwd(), 'docs');

export interface Post {
	slug: string;
	category: string;
	categoryName: string;
	subcategory?: string; // For nested folders
	title: string;
	date?: string;
	description?: string;
	content: string;
	order?: number; // For series ordering
	fullPath: string; // For navigation
}

export interface Category {
	slug: string;
	name: string;
	count: number;
}

// Helper function to recursively get all markdown files
function getAllMarkdownFiles(dir: string, category: string, filesList: Post[] = []): Post[] {
	const files = fs.readdirSync(dir);

	files.forEach((file) => {
		const filePath = path.join(dir, file);
		const stat = fs.statSync(filePath);

		if (stat.isDirectory()) {
			// Recursively search subdirectories
			getAllMarkdownFiles(filePath, category, filesList);
		} else if (file.endsWith('.md')) {
			// Get relative path from category directory
			const categoryPath = path.join(postsDirectory, category);
			const relativePath = path.relative(categoryPath, filePath);

			const post = getPostByPath(category, relativePath);
			if (post) {
				filesList.push(post);
			}
		}
	});

	return filesList;
}

export function getAllPosts(): Post[] {
	const categories = fs.readdirSync(postsDirectory);
	const allPosts: Post[] = [];

	categories.forEach((categoryDir) => {
		const categoryPath = path.join(postsDirectory, categoryDir);
		if (fs.statSync(categoryPath).isDirectory()) {
			const posts = getAllMarkdownFiles(categoryPath, categoryDir);
			allPosts.push(...posts);
		}
	});

	// Sort posts by order (if specified), then by date
	return allPosts.sort((a, b) => {
		// First sort by order if both have it
		if (a.order !== undefined && b.order !== undefined) {
			return a.order - b.order;
		}
		// Then by date
		if (a.date && b.date) {
			return new Date(b.date).getTime() - new Date(a.date).getTime();
		}
		return 0;
	});
}

export function getPostsByCategory(category: string): Post[] {
	const categoryDirs = fs.readdirSync(postsDirectory);
	const originalCategoryDir = categoryDirs.find(
		(dir) => dir.toLowerCase() === category.toLowerCase()
	);

	if (!originalCategoryDir) {
		return [];
	}

	const categoryPath = path.join(postsDirectory, originalCategoryDir);
	const posts = getAllMarkdownFiles(categoryPath, originalCategoryDir);

	return posts.sort((a, b) => {
		// Sort by order if both have it
		if (a.order !== undefined && b.order !== undefined) {
			return a.order - b.order;
		}
		// Then by date
		if (a.date && b.date) {
			return new Date(b.date).getTime() - new Date(a.date).getTime();
		}
		return 0;
	});
}

// New function to get post by relative path
function getPostByPath(category: string, relativePath: string): Post | null {
	const categoryPath = path.join(postsDirectory, category);
	const fullPath = path.join(categoryPath, relativePath);

	if (!fs.existsSync(fullPath)) {
		return null;
	}

	try {
		const fileContents = fs.readFileSync(fullPath, 'utf8');
		const { data, content } = matter(fileContents);

		const pathParts = relativePath.replace(/\.md$/, '').split(path.sep);
		const slug = pathParts[pathParts.length - 1];
		const subcategory = pathParts.length > 1 ? pathParts.slice(0, -1).join('/') : undefined;

		// Generate lowercase URL path
		const urlPath = relativePath
			.replace(/\.md$/, '')
			.split(path.sep)
			.map((part) => part.toLowerCase())
			.join('/');

		return {
			category: category.toLowerCase(),
			categoryName: category,
			subcategory,
			slug: slug.toLowerCase(),
			title: data.title || slug.replaceAll('-', ' '),
			date: data.date || null,
			description: data.description || '',
			content,
			order: data.order,
			fullPath: urlPath, // Lowercase URL path
		};
	} catch (error) {
		console.error(`Error reading post: ${fullPath}`, error);
		return null;
	}
}

export function getPostBySlug(category: string, slug: string): Post | null {
	const categoryDirs = fs.readdirSync(postsDirectory);
	const originalCategoryDir = categoryDirs.find(
		(dir) => dir.toLowerCase() === category.toLowerCase()
	);

	if (!originalCategoryDir) return null;

	const categoryPath = path.join(postsDirectory, originalCategoryDir);

	// Get all posts and find the one matching the lowercase slug
	const allPosts = getAllMarkdownFiles(categoryPath, originalCategoryDir);
	const post = allPosts.find((p) => {
		// Compare lowercase fullPath with lowercase slug
		return p.fullPath === slug.toLowerCase();
	});

	return post || null;
}

// New function to get previous and next posts
export function getAdjacentPosts(
	category: string,
	currentPost: Post
): {
	previous: Post | null;
	next: Post | null;
} {
	const posts = getPostsByCategory(category);

	// If post has subcategory, filter to same subcategory
	const relevantPosts = currentPost.subcategory
		? posts.filter((p) => p.subcategory === currentPost.subcategory)
		: posts;

	const currentIndex = relevantPosts.findIndex((p) => p.fullPath === currentPost.fullPath);

	if (currentIndex === -1) {
		return { previous: null, next: null };
	}

	return {
		previous: currentIndex > 0 ? relevantPosts[currentIndex - 1] : null,
		next: currentIndex < relevantPosts.length - 1 ? relevantPosts[currentIndex + 1] : null,
	};
}

export function getCategories(): Category[] {
	const categories = fs.readdirSync(postsDirectory);
	const categoryList: Category[] = [];

	categories.forEach((categoryDir) => {
		const categoryPath = path.join(postsDirectory, categoryDir);
		if (fs.statSync(categoryPath).isDirectory()) {
			const posts = getAllMarkdownFiles(categoryPath, categoryDir);
			categoryList.push({
				name: categoryDir,
				slug: categoryDir.toLowerCase(),
				count: posts.length,
			});
		}
	});

	return categoryList;
}
