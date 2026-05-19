import type { Category, Post } from '@/lib/markdown';

export type TerminalEntryKind = 'page' | 'link';
export type HistoryTone = 'command' | 'output' | 'error' | 'hint' | 'system';

export interface TerminalEntry {
	path: string;
	href: string;
	kind: TerminalEntryKind;
	label: string;
	description: string;
}

export interface HistoryLine {
	id: number;
	text: string;
	tone: HistoryTone;
	cwd?: string;
}

export interface IndexedChild {
	name: string;
	path: string;
	type: 'dir' | TerminalEntryKind;
	description?: string;
}

export interface TerminalIndex {
	entryMap: Map<string, TerminalEntry>;
	dirPaths: Set<string>;
	routeableDirs: Set<string>;
	listChildren: (dir: string) => IndexedChild[];
}

export interface CompletionResult {
	nextInput: string;
	suggestions: string[];
}

interface CommandHelp {
	usage: string;
	summary: string;
	examples: string[];
	aliases?: string[];
}

export const ROOT = '/';
export const PROMPT_USER = 'nam';
export const PROMPT_HOST = 'backend-dev';

export const ALIASES: Record<string, string> = {
	gh: 'open /links/github',
	docs: 'open /blog',
	home: 'open /',
	li: 'open /links/linkedin',
	fb: 'open /links/facebook',
	mail: 'open /links/email',
	fetch: 'fastfetch',
};

export const COMMAND_HELP: Record<string, CommandHelp> = {
	help: {
		usage: 'help [command]',
		summary: 'show all commands or detailed help for one command',
		examples: ['help', 'help ls', 'help open'],
	},
	suggest: {
		usage: 'suggest',
		summary: 'show a few quick destinations you can open right away',
		examples: ['suggest'],
	},
	man: {
		usage: 'man <command>',
		summary: 'show a fuller manual-style description for a command',
		examples: ['man grep', 'man open'],
	},
	pwd: {
		usage: 'pwd',
		summary: 'print the current working directory inside the 404 shell',
		examples: ['pwd'],
	},
	ls: {
		usage: 'ls [path]',
		summary: 'list folders, pages, and links inside the current path or a target path',
		examples: ['ls', 'ls /blog', 'ls ../links'],
	},
	cd: {
		usage: 'cd <dir>',
		summary: 'move to another directory in the virtual site tree',
		examples: ['cd /blog', 'cd csc14005', 'cd ..'],
	},
	tree: {
		usage: 'tree [path]',
		summary: 'render a directory tree from the current path or a target path',
		examples: ['tree', 'tree /blog', 'tree /links'],
	},
	cat: {
		usage: 'cat <path>',
		summary: 'inspect a page or link target without navigating to it',
		examples: ['cat /blog', 'cat /blog/csc14005/ml-lecture1-guide', 'cat /links/github'],
	},
	grep: {
		usage: 'grep <term> [path]',
		summary: 'search paths, titles, and descriptions under a target directory',
		examples: ['grep spring /blog', 'grep java', 'grep github /links'],
	},
	open: {
		usage: 'open <path>',
		summary: 'navigate to a local route or open an external link',
		examples: ['open /', 'open /blog/csc14005', 'open /links/linkedin'],
		aliases: ['gh', 'docs', 'home', 'li', 'fb', 'mail'],
	},
	whoami: {
		usage: 'whoami',
		summary: 'print a short backend-dev identity card',
		examples: ['whoami'],
	},
	fastfetch: {
		usage: 'fastfetch',
		summary: 'render a fake terminal profile card',
		examples: ['fastfetch', 'fetch'],
		aliases: ['fetch'],
	},
	neofetch: {
		usage: 'neofetch',
		summary: 'same profile card, because old habits die hard',
		examples: ['neofetch'],
	},
	clear: {
		usage: 'clear',
		summary: 'clear the terminal history',
		examples: ['clear'],
	},
};

const WHOAMI_LINES = ['nam', 'backend engineer', 'go · java · spring boot · distributed systems'];

const FETCH_LINES = [
	'        .--.              nam@backend-dev',
	'       |o_o |             ----------------',
	'       |:_/ |             OS: Arch-ish imagination',
	'      //   \\ \\            Shell: zsh',
	'     (|     | )           Editor: neovim + jetbrains',
	"    /'\\_   _/`\\\\          Stack: Go, Java, Spring Boot, Kafka, PostgreSQL",
	'    \\___)=(___/           Focus: event-driven systems, observability',
	'                          Uptime: still shipping',
];

export function normalizePath(input: string, cwd: string): string {
	const raw = input.trim();
	const candidate = raw.startsWith('/') ? raw : `${cwd === ROOT ? '' : cwd}/${raw}`;
	const parts = candidate.split('/');
	const stack: string[] = [];

	for (const part of parts) {
		if (!part || part === '.') continue;
		if (part === '..') {
			stack.pop();
			continue;
		}
		stack.push(part);
	}

	return stack.length === 0 ? ROOT : `/${stack.join('/')}`;
}

export function parentDirectory(path: string): string {
	if (path === ROOT) return ROOT;
	const parts = path.split('/').filter(Boolean);
	parts.pop();
	return parts.length === 0 ? ROOT : `/${parts.join('/')}`;
}

export function basename(path: string): string {
	if (path === ROOT) return ROOT;
	const parts = path.split('/').filter(Boolean);
	return parts[parts.length - 1] ?? ROOT;
}

export function isExternalHref(href: string): boolean {
	return href.startsWith('http://') || href.startsWith('https://') || href.startsWith('mailto:');
}

export function formatPrompt(cwd: string): string {
	return `${PROMPT_USER}@${PROMPT_HOST}:${cwd === ROOT ? '~' : cwd}$`;
}

function getSearchableText(entry: TerminalEntry): string {
	return `${entry.path} ${entry.label} ${entry.description}`.toLowerCase();
}

export function createInitialHistory(pathname: string): HistoryLine[] {
	return [
		{ id: 1, text: 'journalctl -u router -n 4', tone: 'command', cwd: ROOT },
		{ id: 2, text: `[warn] route lookup failed for ${pathname}`, tone: 'system' },
		{ id: 3, text: '[info] fallback handler engaged -> /404', tone: 'system' },
		{
			id: 4,
			text: '[info] interactive shell ready',
			tone: 'system',
		},
		{ id: 5, text: 'help', tone: 'command', cwd: ROOT },
		{
			id: 6,
			text: 'commands: help, man, suggest, ls, cd, tree, cat, grep, open, whoami, fastfetch, clear',
			tone: 'hint',
		},
		{
			id: 7,
			text: 'tip: use help <command> for details, e.g. help open or help ls',
			tone: 'hint',
		},
		{
			id: 8,
			text: 'try: tree /blog, grep spring /blog, whoami, gh, docs, fastfetch',
			tone: 'hint',
		},
	];
}

export function renderCommandHelp(command: string): Omit<HistoryLine, 'id'>[] {
	const aliasExpansion = ALIASES[command];
	if (aliasExpansion) {
		return [
			{ text: `${command} — alias`, tone: 'output' },
			{ text: `expands to: ${aliasExpansion}`, tone: 'hint' },
			{
				text: 'tip: aliases are shortcuts; use the expanded command for full control',
				tone: 'hint',
			},
		];
	}

	const details = COMMAND_HELP[command];
	if (!details) {
		return [
			{ text: `help: no help topic for '${command}'`, tone: 'error' },
			{ text: 'try `help` to see all available commands', tone: 'hint' },
		];
	}

	return [
		{ text: `${command} — ${details.summary}`, tone: 'output' },
		{ text: `usage: ${details.usage}`, tone: 'hint' },
		...(details.aliases?.length
			? [{ text: `aliases: ${details.aliases.join(', ')}`, tone: 'hint' as const }]
			: []),
		...details.examples.map((example) => ({
			text: `example: ${example}`,
			tone: 'hint' as const,
		})),
	];
}

export function renderManual(command: string): Omit<HistoryLine, 'id'>[] {
	const aliasExpansion = ALIASES[command];
	if (aliasExpansion) {
		return [
			{ text: `NAME`, tone: 'output' },
			{ text: `    ${command} - alias shortcut`, tone: 'hint' },
			{ text: `SYNOPSIS`, tone: 'output' },
			{ text: `    ${command}`, tone: 'hint' },
			{ text: `EXPANDS TO`, tone: 'output' },
			{ text: `    ${aliasExpansion}`, tone: 'hint' },
		];
	}

	const details = COMMAND_HELP[command];
	if (!details) {
		return [
			{ text: `man: no manual entry for ${command}`, tone: 'error' },
			{ text: 'try `help` to list available commands', tone: 'hint' },
		];
	}

	return [
		{ text: 'NAME', tone: 'output' },
		{ text: `    ${command} - ${details.summary}`, tone: 'hint' },
		{ text: 'SYNOPSIS', tone: 'output' },
		{ text: `    ${details.usage}`, tone: 'hint' },
		...(details.aliases?.length
			? [
					{ text: 'ALIASES', tone: 'output' as const },
					{ text: `    ${details.aliases.join(', ')}`, tone: 'hint' as const },
				]
			: []),
		{ text: 'EXAMPLES', tone: 'output' },
		...details.examples.map((example) => ({
			text: `    ${example}`,
			tone: 'hint' as const,
		})),
	];
}

function levenshtein(a: string, b: string): number {
	const matrix = Array.from({ length: a.length + 1 }, () =>
		new Array<number>(b.length + 1).fill(0)
	);

	for (let i = 0; i <= a.length; i += 1) matrix[i]![0] = i;
	for (let j = 0; j <= b.length; j += 1) matrix[0]![j] = j;

	for (let i = 1; i <= a.length; i += 1) {
		for (let j = 1; j <= b.length; j += 1) {
			const cost = a[i - 1] === b[j - 1] ? 0 : 1;
			matrix[i]![j] = Math.min(
				matrix[i - 1]![j]! + 1,
				matrix[i]![j - 1]! + 1,
				matrix[i - 1]![j - 1]! + cost
			);
		}
	}

	return matrix[a.length]![b.length]!;
}

export function suggestCommand(token: string): string | undefined {
	const candidates = [...Object.keys(COMMAND_HELP), ...Object.keys(ALIASES)];
	let best: { name: string; score: number } | undefined;

	for (const candidate of candidates) {
		const score = levenshtein(token, candidate);
		if (score > 2) continue;
		if (!best || score < best.score) {
			best = { name: candidate, score };
		}
	}

	return best?.name;
}

export function resolveCommand(input: string) {
	const [command = '', ...rest] = input.trim().split(/\s+/);
	const argsText = rest.join(' ');
	const aliasExpansion = ALIASES[command];

	if (!aliasExpansion) {
		return {
			command,
			argsText,
			effectiveInput: input.trim(),
			aliasUsed: undefined,
		};
	}

	const expanded = `${aliasExpansion}${argsText ? ` ${argsText}` : ''}`.trim();
	const [expandedCommand = '', ...expandedRest] = expanded.split(/\s+/);

	return {
		command: expandedCommand,
		argsText: expandedRest.join(' '),
		effectiveInput: expanded,
		aliasUsed: { alias: command, expansion: aliasExpansion },
	};
}

export function renderWhoAmI(): Omit<HistoryLine, 'id'>[] {
	return WHOAMI_LINES.map((line) => ({ text: line, tone: 'output' }));
}

export function renderFetch(): Omit<HistoryLine, 'id'>[] {
	return FETCH_LINES.map((line) => ({ text: line, tone: 'output' }));
}

export function renderTree(target: string, index: TerminalIndex): Omit<HistoryLine, 'id'>[] {
	if (!index.dirPaths.has(target)) {
		return [{ text: `tree: ${target}: No such directory`, tone: 'error' }];
	}

	const lines: Omit<HistoryLine, 'id'>[] = [
		{ text: `${target === ROOT ? '.' : target}`, tone: 'output' },
	];

	function visit(dir: string, prefix: string) {
		const children = index.listChildren(dir);
		children.forEach((child, childIndex) => {
			const isLast = childIndex === children.length - 1;
			const branch = `${prefix}${isLast ? '└── ' : '├── '}`;
			const label = child.type === 'dir' ? `${child.name}/` : child.name;
			lines.push({ text: `${branch}${label}`, tone: 'output' });

			if (child.type === 'dir') {
				visit(child.path, `${prefix}${isLast ? '    ' : '│   '}`);
			}
		});
	}

	visit(target, '');
	return lines;
}

export function renderGrep(
	term: string,
	target: string,
	index: TerminalIndex
): Omit<HistoryLine, 'id'>[] {
	const query = term.toLowerCase();
	const matches = Array.from(index.entryMap.values()).filter((entry) => {
		const inScope = target === ROOT || entry.path === target || entry.path.startsWith(`${target}/`);
		return inScope && getSearchableText(entry).includes(query);
	});

	if (matches.length === 0) {
		return [{ text: `grep: no matches for '${term}' under ${target}`, tone: 'hint' }];
	}

	return [
		...matches.map((entry) => ({
			text: `${entry.path}  # ${entry.description}`,
			tone: 'output' as const,
		})),
		{ text: `${matches.length} match(es)`, tone: 'hint' },
	];
}

function longestCommonPrefix(values: string[]): string {
	if (values.length === 0) return '';
	let prefix = values[0] ?? '';

	for (const value of values.slice(1)) {
		while (!value.startsWith(prefix) && prefix) {
			prefix = prefix.slice(0, -1);
		}
		if (!prefix) break;
	}

	return prefix;
}

function formatCompletionName(child: IndexedChild): string {
	return child.type === 'dir' ? `${child.name}/` : child.name;
}

function completeCommand(input: string): CompletionResult {
	const commands = [...Object.keys(COMMAND_HELP), ...Object.keys(ALIASES)].sort();
	const token = input.trimStart();
	const matches = commands.filter((command) => command.startsWith(token));

	if (matches.length === 0) {
		return { nextInput: input, suggestions: [] };
	}

	if (matches.length === 1) {
		return { nextInput: `${matches[0]} `, suggestions: [] };
	}

	const prefix = longestCommonPrefix(matches);
	return {
		nextInput: prefix.length > token.length ? prefix : input,
		suggestions: matches,
	};
}

function completeCommandHelp(input: string): CompletionResult {
	const [head, partial = ''] = input.split(/\s+/, 2);
	const commands = [...Object.keys(COMMAND_HELP), ...Object.keys(ALIASES)].sort();
	const matches = commands.filter((command) => command.startsWith(partial));

	if (matches.length === 0) {
		return { nextInput: input, suggestions: [] };
	}

	if (matches.length === 1) {
		return { nextInput: `${head} ${matches[0]}`, suggestions: [] };
	}

	const prefix = longestCommonPrefix(matches);
	return {
		nextInput: prefix.length > partial.length ? `${head} ${prefix}` : input,
		suggestions: matches,
	};
}

function completePathArgument(input: string, cwd: string, index: TerminalIndex): CompletionResult {
	const spaceIndex = input.indexOf(' ');
	if (spaceIndex === -1) return { nextInput: input, suggestions: [] };

	const command = input.slice(0, spaceIndex);
	const argRaw = input.slice(spaceIndex + 1);
	const trimmedArg = argRaw.trimStart();
	if (!trimmedArg) {
		const suggestions = index.listChildren(cwd).map(formatCompletionName);
		return { nextInput: input, suggestions };
	}

	const normalized = normalizePath(trimmedArg, cwd);
	const endsWithSlash = trimmedArg.endsWith('/');
	const baseDir = endsWithSlash ? normalized : parentDirectory(normalized);
	const partialName = endsWithSlash ? '' : basename(normalized);

	if (!index.dirPaths.has(baseDir)) {
		return { nextInput: input, suggestions: [] };
	}

	const children = index.listChildren(baseDir);
	const matches = children.filter((child) => child.name.startsWith(partialName));

	if (matches.length === 0) {
		return { nextInput: input, suggestions: [] };
	}

	const baseInput = `${command} `;
	const isAbsolute = trimmedArg.startsWith('/');
	const relativeBase =
		baseDir === cwd
			? ''
			: baseDir.startsWith(`${cwd}/`)
				? baseDir.slice(cwd.length + 1)
				: baseDir === ROOT
					? ''
					: baseDir;
	const prefixPath = isAbsolute ? (baseDir === ROOT ? '' : baseDir) : relativeBase;

	if (matches.length === 1) {
		const only = matches[0];
		if (!only) {
			return { nextInput: input, suggestions: [] };
		}
		const completedPath =
			prefixPath && prefixPath !== '/'
				? `${prefixPath}/${formatCompletionName(only)}`
				: trimmedArg.startsWith('/')
					? `/${formatCompletionName(only)}`
					: formatCompletionName(only);
		return {
			nextInput: `${baseInput}${completedPath}${only.type === 'dir' ? '' : ' '}`,
			suggestions: [],
		};
	}

	const formatted = matches.map(formatCompletionName);
	const prefix = longestCommonPrefix(formatted);
	const nextArg =
		prefix.length > partialName.length
			? prefixPath && prefixPath !== '/'
				? `${prefixPath}/${prefix}`
				: trimmedArg.startsWith('/')
					? `/${prefix}`
					: prefix
			: trimmedArg;

	return {
		nextInput: `${baseInput}${nextArg}`,
		suggestions: formatted,
	};
}

export function getTabCompletion(
	input: string,
	cwd: string,
	index: TerminalIndex
): CompletionResult {
	const trimmed = input.trim();
	if (!trimmed) {
		return {
			nextInput: input,
			suggestions: [...Object.keys(COMMAND_HELP), ...Object.keys(ALIASES)].sort(),
		};
	}

	if (!input.includes(' ')) {
		return completeCommand(input);
	}

	const [command = ''] = input.split(/\s+/, 1);
	if (command === 'help' || command === 'man') {
		return completeCommandHelp(input);
	}

	if (
		command === 'ls' ||
		command === 'cd' ||
		command === 'cat' ||
		command === 'open' ||
		command === 'tree'
	) {
		return completePathArgument(input, cwd, index);
	}

	if (command === 'grep') {
		const [, term = '', maybePath = ''] = input.split(/\s+/, 3);
		if (!term || !maybePath) return { nextInput: input, suggestions: [] };
		const completion = completePathArgument(`grep ${maybePath}`, cwd, index);
		return {
			nextInput:
				completion.nextInput !== `grep ${maybePath}`
					? `grep ${term} ${completion.nextInput.slice('grep '.length)}`
					: input,
			suggestions: completion.suggestions,
		};
	}

	return { nextInput: input, suggestions: [] };
}

export function buildTerminalIndex(entries: TerminalEntry[]): TerminalIndex {
	const entryMap = new Map<string, TerminalEntry>();
	const dirPaths = new Set<string>([ROOT]);
	const routeableDirs = new Set<string>([ROOT]);

	for (const entry of entries) {
		entryMap.set(entry.path, entry);

		if (!isExternalHref(entry.href)) {
			routeableDirs.add(entry.path);
		}

		let current = parentDirectory(entry.path);
		while (true) {
			dirPaths.add(current);
			if (current === ROOT) break;
			current = parentDirectory(current);
		}
	}

	const listChildren = (dir: string): IndexedChild[] => {
		const seen = new Map<string, IndexedChild>();

		for (const childDir of dirPaths) {
			if (childDir === dir) continue;
			if (parentDirectory(childDir) !== dir) continue;
			const name = basename(childDir);
			seen.set(name, { name, path: childDir, type: 'dir' });
		}

		for (const entry of entries) {
			if (entry.path === dir) continue;
			if (parentDirectory(entry.path) !== dir) continue;
			const name = basename(entry.path);
			if (seen.has(name)) continue;
			seen.set(name, {
				name,
				path: entry.path,
				type: entry.kind,
				description: entry.description,
			});
		}

		return Array.from(seen.values()).sort((a, b) => {
			if (a.type === 'dir' && b.type !== 'dir') return -1;
			if (a.type !== 'dir' && b.type === 'dir') return 1;
			return a.name.localeCompare(b.name);
		});
	};

	return { entryMap, dirPaths, routeableDirs, listChildren };
}

export function createNotFoundEntries(categories: Category[], posts: Post[]): TerminalEntry[] {
	return [
		{
			path: '/',
			href: '/',
			kind: 'page',
			label: 'home',
			description: 'landing page',
		},
		{
			path: '/blog',
			href: '/blog',
			kind: 'page',
			label: 'blog',
			description: 'all articles',
		},
		{
			path: '/about',
			href: '/#about',
			kind: 'page',
			label: 'about',
			description: 'about section on home',
		},
		{
			path: '/experience',
			href: '/#experience',
			kind: 'page',
			label: 'experience',
			description: 'experience section on home',
		},
		{
			path: '/contact',
			href: '/#contact',
			kind: 'page',
			label: 'contact',
			description: 'contact section on home',
		},
		{
			path: '/links/github',
			href: 'https://github.com/ntnam1605',
			kind: 'link',
			label: 'github',
			description: 'GitHub profile',
		},
		{
			path: '/links/linkedin',
			href: 'https://www.linkedin.com/in/ntnam',
			kind: 'link',
			label: 'linkedin',
			description: 'LinkedIn profile',
		},
		{
			path: '/links/facebook',
			href: 'https://www.facebook.com/nam.160504',
			kind: 'link',
			label: 'facebook',
			description: 'Facebook profile',
		},
		{
			path: '/links/email',
			href: 'mailto:namisme16052004@gmail.com',
			kind: 'link',
			label: 'email',
			description: 'send an email',
		},
		...categories.map((category) => ({
			path: `/blog/${category.slug}`,
			href: `/blog/${category.slug}`,
			kind: 'page' as const,
			label: category.name.toLowerCase(),
			description: `${category.count} ${category.count === 1 ? 'article' : 'articles'}`,
		})),
		...posts.map((post) => ({
			path: `/blog/${post.category}/${post.fullPath}`,
			href: `/blog/${post.category}/${post.fullPath}`,
			kind: 'page' as const,
			label: post.title,
			description: post.description ?? `article in ${post.categoryName}`,
		})),
	];
}
