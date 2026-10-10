import { execSync } from 'child_process';

export interface Commit {
	hash: string;
	message: string;
	author: string;
	date: string;
}

export interface ChangelogGroup {
	date: string;
	commits: Commit[];
}

export function getChangelog(): ChangelogGroup[] {
	try {
		const output = execSync('git log --no-merges --pretty=format:"%H|||%s|||%an|||%aI" -50', {
			encoding: 'utf-8',
			cwd: process.cwd(),
			stdio: ['pipe', 'pipe', 'ignore'],
		});

		const lines = output.trim().split('\n');
		const groups = new Map<string, Commit[]>();

		for (const line of lines) {
			if (!line) continue;
			const [hash, message, author, dateStr] = line.split('|||');
			if (!hash || !message || !dateStr) continue;
			if (message.startsWith('Merge ')) continue;

			const dateKey = new Date(dateStr).toISOString().split('T')[0]!;
			const commit: Commit = { hash: hash!, message: message!, author: author!, date: dateStr! };

			if (!dateKey) continue;

			if (!groups.has(dateKey)) {
				groups.set(dateKey, []);
			}
			groups.get(dateKey)?.push(commit);
		}

		return Array.from(groups.entries()).map(([date, commits]) => ({ date, commits }));
	} catch {
		return [];
	}
}
