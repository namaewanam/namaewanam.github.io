const fs = require('node:fs');
const path = require('node:path');
const matter = require('gray-matter');

const postsDirectory = path.join(process.cwd(), 'docs');
const outputFile = path.join(process.cwd(), 'public', 'posts.json');

function getAllMarkdownFiles(dir, category, filesList = []) {
	const files = fs.readdirSync(dir);

	files.forEach((file) => {
		const filePath = path.join(dir, file);
		const stat = fs.statSync(filePath);

		if (stat.isDirectory()) {
			getAllMarkdownFiles(filePath, category, filesList);
		} else if (file.endsWith('.md')) {
			const categoryPath = path.join(postsDirectory, category);
			const relativePath = path.relative(categoryPath, filePath);

			try {
				const fileContents = fs.readFileSync(filePath, 'utf8');
				const { data } = matter(fileContents);

				const pathParts = relativePath.replace(/\.md$/, '').split(path.sep);
				const slug = pathParts[pathParts.length - 1];
				const subcategory = pathParts.length > 1 ? pathParts.slice(0, -1).join('/') : undefined;

				// Generate lowercase URL path
				const urlPath = relativePath
					.replace(/\.md$/, '')
					.split(path.sep)
					.map((part) => part.toLowerCase())
					.join('/');

				filesList.push({
					category: category.toLowerCase(),
					categoryName: category,
					subcategory,
					slug: slug.toLowerCase(),
					title: data.title || slug.replaceAll('-', ' '),
					date: data.date || null,
					description: data.description || '',
					order: data.order,
					fullPath: urlPath,
				});
			} catch (error) {
				console.error(`Error reading post: ${filePath}`, error);
			}
		}
	});

	return filesList;
}

function generatePostsJson() {
	const categories = fs.readdirSync(postsDirectory);
	const allPosts = [];

	categories.forEach((categoryDir) => {
		const categoryPath = path.join(postsDirectory, categoryDir);
		if (fs.statSync(categoryPath).isDirectory()) {
			const posts = getAllMarkdownFiles(categoryPath, categoryDir);
			allPosts.push(...posts);
		}
	});

	// Sort posts by order (if specified), then by date
	allPosts.sort((a, b) => {
		if (a.order !== undefined && b.order !== undefined) {
			return a.order - b.order;
		}
		if (a.date && b.date) {
			return new Date(b.date).getTime() - new Date(a.date).getTime();
		}
		return 0;
	});

	// Ensure public directory exists
	const publicDir = path.join(process.cwd(), 'public');
	if (!fs.existsSync(publicDir)) {
		fs.mkdirSync(publicDir, { recursive: true });
	}

	// Write to file
	fs.writeFileSync(outputFile, JSON.stringify(allPosts, null, 2));
	console.log(`Generated ${outputFile} with ${allPosts.length} posts`);
}

// Run if called directly
if (require.main === module) {
	generatePostsJson();
}

module.exports = { generatePostsJson };
