import { Octokit } from 'octokit';

export interface GitHubUser {
	login: string;
	avatar_url: string;
	name: string;
}

export const DEFAULT_OWNER = process.env.NEXT_PUBLIC_GITHUB_OWNER || 'namaewanam';
export const DEFAULT_REPO = process.env.NEXT_PUBLIC_GITHUB_REPO || 'namaewanam.github.io';

/**
 * Validates that an operation's file path is safely confined to markdown files inside docs/.
 * Prevents accidental or malicious modification of repository root files or workflows.
 */
export function validateDocsPath(path: string): void {
	const normalized = path.replace(/\\/g, '/').trim();
	if (!normalized.startsWith('docs/') || normalized.includes('..') || !normalized.endsWith('.md')) {
		throw new Error(
			`Security boundary check failed: '${path}' is outside docs/ or not a markdown file.`
		);
	}
}

/**
 * Safely converts any UTF-8 string (including Vietnamese and emojis) to base64.
 * Uses 32KB chunks to prevent call-stack overflows and GC thrashing.
 */
export function toBase64Unicode(str: string): string {
	const bytes = new TextEncoder().encode(str);
	const chunkSize = 0x8000;
	let binary = '';
	for (let i = 0; i < bytes.length; i += chunkSize) {
		const chunk = bytes.subarray(i, i + chunkSize);
		binary += String.fromCharCode.apply(null, chunk as unknown as number[]);
	}
	return btoa(binary);
}

/**
 * Safely decodes a base64 string back to a UTF-8 string.
 */
export function fromBase64Unicode(base64: string): string {
	const binary = atob(base64);
	const bytes = new Uint8Array(binary.length);
	for (let i = 0; i < binary.length; i++) {
		bytes[i] = binary.charCodeAt(i);
	}
	return new TextDecoder().decode(bytes);
}

/**
 * Returns an authenticated Octokit instance.
 */
function getOctokit(token: string): Octokit {
	return new Octokit({ auth: token.trim() });
}

/**
 * Verifies a GitHub PAT using official Octokit REST client.
 */
export async function verifyGitHubToken(
	token: string,
	owner: string = DEFAULT_OWNER,
	repo: string = DEFAULT_REPO
): Promise<{ user: GitHubUser; canPush: boolean }> {
	const octokit = getOctokit(token);

	const { data: user } = await octokit.rest.users.getAuthenticated();
	const { data: repoData } = await octokit.rest.repos.get({ owner, repo });

	const canPush = Boolean(repoData.permissions?.push) || Boolean(repoData.permissions?.admin);

	return {
		user: {
			login: user.login,
			avatar_url: user.avatar_url,
			name: user.name || user.login,
		},
		canPush,
	};
}

/**
 * Fetches all markdown file paths under docs/ on the main branch via Octokit.
 */
export async function fetchDocsTree(
	token: string,
	owner: string = DEFAULT_OWNER,
	repo: string = DEFAULT_REPO
): Promise<string[]> {
	const octokit = getOctokit(token);

	const { data } = await octokit.rest.git.getTree({
		owner,
		repo,
		tree_sha: 'main',
		recursive: '1',
	});

	if (!Array.isArray(data.tree)) return [];

	return data.tree
		.filter(
			(item) => item.type === 'blob' && item.path?.startsWith('docs/') && item.path.endsWith('.md')
		)
		.map((item) => item.path as string)
		.sort();
}

/**
 * Fetches content and sha for an existing file in the repository via Octokit.
 */
export async function fetchFileContent(
	token: string,
	path: string,
	owner: string = DEFAULT_OWNER,
	repo: string = DEFAULT_REPO
): Promise<{ content: string; sha: string }> {
	validateDocsPath(path);
	const octokit = getOctokit(token);

	const { data } = await octokit.rest.repos.getContent({
		owner,
		repo,
		path,
	});

	if ('content' in data && typeof data.content === 'string') {
		const cleanBase64 = data.content.replace(/\s+/g, '');
		const content = fromBase64Unicode(cleanBase64);
		return {
			content,
			sha: data.sha,
		};
	}

	throw new Error(`File at ${path} has unexpected content structure.`);
}

/**
 * Commits a file creation or update to the main branch via Octokit.
 */
export async function commitFile(
	token: string,
	path: string,
	content: string,
	message: string,
	sha?: string,
	owner: string = DEFAULT_OWNER,
	repo: string = DEFAULT_REPO
): Promise<{ commitSha: string; commitUrl: string }> {
	validateDocsPath(path);
	const octokit = getOctokit(token);

	const { data } = await octokit.rest.repos.createOrUpdateFileContents({
		owner,
		repo,
		path,
		message,
		content: toBase64Unicode(content),
		branch: 'main',
		...(sha ? { sha } : {}),
	});

	const commitSha = data.commit.sha || '';
	const commitUrl =
		data.commit.html_url || `https://github.com/${owner}/${repo}/commit/${commitSha}`;

	return { commitSha, commitUrl };
}

/**
 * Deletes an existing file on the main branch via Octokit.
 */
export async function deleteFile(
	token: string,
	path: string,
	message: string,
	sha: string,
	owner: string = DEFAULT_OWNER,
	repo: string = DEFAULT_REPO
): Promise<{ commitSha: string; commitUrl: string }> {
	validateDocsPath(path);
	const octokit = getOctokit(token);

	const { data } = await octokit.rest.repos.deleteFile({
		owner,
		repo,
		path,
		message,
		sha,
		branch: 'main',
	});

	const commitSha = data.commit.sha || '';
	const commitUrl =
		data.commit.html_url || `https://github.com/${owner}/${repo}/commit/${commitSha}`;

	return { commitSha, commitUrl };
}
