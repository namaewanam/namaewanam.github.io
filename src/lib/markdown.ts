import fs from "fs";
import path from "path";
import matter from "gray-matter";

const postsDirectory = path.join(process.cwd(), "docs");

export interface Post {
	slug: string;
	category: string;
	categoryName: string;
	title: string;
	date?: string;
	description?: string;
	content: string;
}

export interface Category {
	slug: string;
	name: string;
	count: number;
}

export function getAllPosts(): Post[] {
	const categories = fs.readdirSync(postsDirectory);
	const allPosts: Post[] = [];

	categories.forEach((categoryDir) => {
		const categoryPath = path.join(postsDirectory, categoryDir);
		if (fs.statSync(categoryPath).isDirectory()) {
			const files = fs.readdirSync(categoryPath);

			files.forEach((fileName) => {
				if (fileName.endsWith(".md")) {
					const slug = fileName.replace(/\.md$/, "");
					const post = getPostBySlug(categoryDir, slug);
					if (post) {
						allPosts.push(post);
					}
				}
			});
		}
	});

	// Sort posts by date in descending order
	return allPosts.sort((a, b) => {
		if (a.date && b.date) {
			return new Date(b.date).getTime() - new Date(a.date).getTime();
		}
		return 0;
	});
}

export function getPostsByCategory(category: string): Post[] {
	// Find the original cased directory name to read files from
	const categoryDirs = fs.readdirSync(postsDirectory);
	const originalCategoryDir = categoryDirs.find(
		(dir) => dir.toLowerCase() === category.toLowerCase()
	);

	if (!originalCategoryDir) {
		return [];
	}

	const categoryPath = path.join(postsDirectory, originalCategoryDir);
	const files = fs.readdirSync(categoryPath);

	const posts = files
		.map((fileName) => {
			if (fileName.endsWith(".md")) {
				const slug = fileName.replace(/\.md$/, "");
				return getPostBySlug(originalCategoryDir, slug);
			}
			return null;
		})
		.filter((post): post is Post => post !== null);

	return posts.sort((a, b) => {
		if (a.date && b.date) {
			return new Date(b.date).getTime() - new Date(a.date).getTime();
		}
		return 0;
	});
}

export function getPostBySlug(category: string, slug: string): Post | null {
	// Find the original cased directory and file names to read from disk
	const categoryDirs = fs.readdirSync(postsDirectory);
	const originalCategoryDir = categoryDirs.find(
		(dir) => dir.toLowerCase() === category.toLowerCase()
	);

	if (!originalCategoryDir) return null;

	const categoryPath = path.join(postsDirectory, originalCategoryDir);
	const filesInDir = fs.readdirSync(categoryPath);
	const originalFileName = filesInDir.find(
		(file) => file.replace(/\.md$/, "").toLowerCase() === slug.toLowerCase()
	);

	if (!originalFileName) return null;

	const fullPath = path.join(categoryPath, originalFileName);

	try {
		const fileContents = fs.readFileSync(fullPath, "utf8");
		const { data, content } = matter(fileContents);

		return {
			category: category.toLowerCase(),
			categoryName: originalCategoryDir,
			slug: slug.toLowerCase(),
			title: data.title || slug.replace(/-/g, " "),
			date: data.date || null,
			description: data.description || "",
			content,
		};
	} catch (error) {
		console.error(`Error reading post: ${fullPath}`, error);
		return null;
	}
}

export function getCategories(): Category[] {
	const categories = fs.readdirSync(postsDirectory);
	const categoryList: Category[] = [];

	categories.forEach((categoryDir) => {
		const categoryPath = path.join(postsDirectory, categoryDir);
		if (fs.statSync(categoryPath).isDirectory()) {
			const files = fs
				.readdirSync(categoryPath)
				.filter((file) => file.endsWith(".md"));
			categoryList.push({
				name: categoryDir,
				slug: categoryDir.toLowerCase(),
				count: files.length,
			});
		}
	});

	return categoryList;
}
