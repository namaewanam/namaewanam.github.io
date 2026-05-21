import fs from 'fs';
import path from 'path';

const outDirectory = path.join(process.cwd(), 'out');

function collectHtmlFiles(dir: string, filesList: string[] = []): string[] {
	const entries = fs.readdirSync(dir, { withFileTypes: true });

	for (const entry of entries) {
		const fullPath = path.join(dir, entry.name);
		if (entry.isDirectory()) {
			collectHtmlFiles(fullPath, filesList);
			continue;
		}

		if (entry.isFile() && entry.name.endsWith('.html')) {
			filesList.push(fullPath);
		}
	}

	return filesList;
}

function isIgnoredLink(value: string): boolean {
	return (
		!value ||
		value.startsWith('#') ||
		value.startsWith('http://') ||
		value.startsWith('https://') ||
		value.startsWith('mailto:') ||
		value.startsWith('tel:') ||
		value.startsWith('data:') ||
		value.startsWith('blob:') ||
		value.startsWith('//')
	);
}

function extractLinkTargets(html: string): string[] {
	const matches = html.matchAll(/\b(?:href|src)=["']([^"'#][^"']*)["']/g);
	return [...matches].map((match) => match[1]).filter((value): value is string => Boolean(value));
}

function resolveLinkTarget(currentFile: string, href: string): string {
	const [withoutQuery = ''] = href.split('?');
	const [cleanHref = ''] = withoutQuery.split('#');
	const currentRelative = path.relative(outDirectory, currentFile).split(path.sep).join('/');
	const currentDirectory = path.posix.dirname(currentRelative);

	if (cleanHref.startsWith('/')) {
		return path.posix.normalize(cleanHref.slice(1));
	}

	return path.posix.normalize(
		path.posix.join(currentDirectory === '.' ? '' : currentDirectory, cleanHref)
	);
}

function candidatePaths(resolvedPath: string): string[] {
	if (!resolvedPath || resolvedPath === '.') {
		return ['index.html'];
	}

	if (resolvedPath.endsWith('/')) {
		return [path.posix.join(resolvedPath, 'index.html')];
	}

	const extension = path.posix.extname(resolvedPath);
	if (extension) {
		return [resolvedPath];
	}

	return [`${resolvedPath}.html`, path.posix.join(resolvedPath, 'index.html')];
}

function verifyInternalLinks(): string[] {
	if (!fs.existsSync(outDirectory)) {
		throw new Error(`Static export directory not found: ${outDirectory}`);
	}

	const htmlFiles = collectHtmlFiles(outDirectory);
	const failures: string[] = [];

	for (const htmlFile of htmlFiles) {
		const html = fs.readFileSync(htmlFile, 'utf8');
		const links = extractLinkTargets(html);

		for (const link of links) {
			if (isIgnoredLink(link)) continue;

			const resolved = resolveLinkTarget(htmlFile, link);
			if (!resolved || resolved.startsWith('../')) {
				failures.push(`${path.relative(process.cwd(), htmlFile)} -> ${link}`);
				continue;
			}

			const exists = candidatePaths(resolved).some((candidate) =>
				fs.existsSync(path.join(outDirectory, decodeURIComponent(candidate)))
			);

			if (!exists) {
				failures.push(`${path.relative(process.cwd(), htmlFile)} -> ${link}`);
			}
		}
	}

	return failures;
}

try {
	const failures = verifyInternalLinks();

	if (failures.length > 0) {
		console.error('Broken internal links detected in static export:');
		failures.forEach((failure) => console.error(`- ${failure}`));
		process.exit(1);
	}

	console.log('Static link check passed.');
} catch (error) {
	console.error(error instanceof Error ? error.message : error);
	process.exit(1);
}
