export interface GitHubUser {
	login: string;
	avatar_url: string;
	name: string;
}

export const DEFAULT_REPO = 'namaewanam/namaewanam.github.io';

/**
 * Safely converts any UTF-8 string (including Vietnamese and emojis) to base64.
 */
export function toBase64Unicode(str: string): string {
	const bytes = new TextEncoder().encode(str);
	let binary = '';
	const len = bytes.byteLength;
	for (let i = 0; i < len; i++) {
		binary += String.fromCharCode(bytes[i] ?? 0);
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
 * Verifies a GitHub PAT by checking user identity and repository push access.
 */
export async function verifyGitHubToken(
	token: string,
	repo: string = DEFAULT_REPO
): Promise<{ user: GitHubUser; canPush: boolean }> {
	const headers = {
		Authorization: `Bearer ${token.trim()}`,
		Accept: 'application/vnd.github+json',
	};

	const userRes = await fetch('https://api.github.com/user', { headers });
	if (!userRes.ok) {
		throw new Error(
			userRes.status === 401
				? 'Invalid Personal Access Token.'
				: `Failed to authenticate: ${userRes.statusText}`
		);
	}
	const user = (await userRes.json()) as GitHubUser;

	const repoRes = await fetch(`https://api.github.com/repos/${repo}`, { headers });
	if (!repoRes.ok) {
		throw new Error(
			`Cannot access repository ${repo} (${repoRes.status}): verify token repository scope.`
		);
	}
	const repoData = (await repoRes.json()) as {
		permissions?: { push?: boolean; admin?: boolean };
	};
	const canPush = Boolean(repoData.permissions?.push) || Boolean(repoData.permissions?.admin);

	return { user, canPush };
}

/**
 * Fetches all markdown file paths under docs/ on the main branch.
 */
export async function fetchDocsTree(token: string, repo: string = DEFAULT_REPO): Promise<string[]> {
	const headers = {
		Authorization: `Bearer ${token.trim()}`,
		Accept: 'application/vnd.github+json',
	};

	const res = await fetch(`https://api.github.com/repos/${repo}/git/trees/main?recursive=1`, {
		headers,
	});
	if (!res.ok) {
		throw new Error(`Failed to fetch file tree: ${res.statusText}`);
	}

	const data = (await res.json()) as {
		tree?: Array<{ path?: string; type?: string }>;
	};
	if (!Array.isArray(data.tree)) return [];

	return data.tree
		.filter(
			(item) => item.type === 'blob' && item.path?.startsWith('docs/') && item.path.endsWith('.md')
		)
		.map((item) => item.path as string)
		.sort();
}

/**
 * Fetches content and sha for an existing file in the repository.
 */
export async function fetchFileContent(
	token: string,
	path: string,
	repo: string = DEFAULT_REPO
): Promise<{ content: string; sha: string }> {
	const headers = {
		Authorization: `Bearer ${token.trim()}`,
		Accept: 'application/vnd.github+json',
	};

	const res = await fetch(`https://api.github.com/repos/${repo}/contents/${path}`, {
		headers,
	});
	if (!res.ok) {
		throw new Error(`Failed to fetch ${path}: ${res.statusText}`);
	}

	const data = (await res.json()) as { content?: string; sha?: string };
	const cleanBase64 = (data.content || '').replace(/\s+/g, '');
	const content = fromBase64Unicode(cleanBase64);

	return {
		content,
		sha: data.sha || '',
	};
}

/**
 * Commits a file creation or update to the main branch via the GitHub contents API.
 */
export async function commitFile(
	token: string,
	path: string,
	content: string,
	message: string,
	sha?: string,
	repo: string = DEFAULT_REPO
): Promise<{ commitSha: string; commitUrl: string }> {
	const headers = {
		Authorization: `Bearer ${token.trim()}`,
		Accept: 'application/vnd.github+json',
		'Content-Type': 'application/json',
	};

	const body: Record<string, unknown> = {
		message,
		content: toBase64Unicode(content),
		branch: 'main',
	};
	if (sha) {
		body.sha = sha;
	}

	const res = await fetch(`https://api.github.com/repos/${repo}/contents/${path}`, {
		method: 'PUT',
		headers,
		body: JSON.stringify(body),
	});

	if (!res.ok) {
		const errJson = (await res.json().catch(() => ({}))) as { message?: string };
		throw new Error(errJson.message || `Failed to commit ${path}: ${res.statusText}`);
	}

	const data = (await res.json()) as {
		commit?: { sha?: string; html_url?: string };
	};
	const commitSha = data.commit?.sha || '';
	const commitUrl = data.commit?.html_url || `https://github.com/${repo}/commit/${commitSha}`;

	return { commitSha, commitUrl };
}
