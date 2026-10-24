'use client';

import { useState, useEffect, useRef } from 'react';
import initialEntries from '@/data/guestbook.json';
import { useRouter } from 'next/navigation';
import { GITHUB_REPO_OWNER, GITHUB_REPO_NAME } from '@/lib/site';

interface GuestbookEntry {
	id: string;
	name: string;
	handle?: string;
	message: string;
	date: string;
	verified?: boolean;
}

interface TerminalLine {
	id: number;
	type: 'input' | 'output' | 'error' | 'success' | 'system';
	text: string;
	url?: string;
}

const STORAGE_KEY = 'namaewanam_guestbook_local_v1';

export default function GuestbookTerminal() {
	const router = useRouter();
	const [entries, setEntries] = useState<GuestbookEntry[]>(initialEntries);
	const [lines, setLines] = useState<TerminalLine[]>([]);
	const [input, setInput] = useState('');
	const [history, setHistory] = useState<string[]>([]);
	const [historyIndex, setHistoryIndex] = useState<number | null>(null);
	const [viewMode, setViewMode] = useState<'terminal' | 'wall'>('terminal');

	const terminalEndRef = useRef<HTMLDivElement>(null);
	const inputRef = useRef<HTMLInputElement>(null);
	const lineIdRef = useRef(1);

	// Load local storage entries on mount
	useEffect(() => {
		try {
			const saved = localStorage.getItem(STORAGE_KEY);
			if (saved) {
				const parsed = JSON.parse(saved) as GuestbookEntry[];
				// Merge initial entries with local additions (avoid duplicate IDs)
				const existingIds = new Set(parsed.map((e) => e.id));
				const merged = [...parsed, ...initialEntries.filter((e) => !existingIds.has(e.id))];
				setEntries(merged);
			}
		} catch {
			// Ignore localStorage errors
		}

		// Initial banner
		setLines([
			{
				id: lineIdRef.current++,
				type: 'system',
				text: '┌────────────────────────────────────────────────────────────┐',
			},
			{
				id: lineIdRef.current++,
				type: 'system',
				text: "│  Nam's CLI Guestbook (Terminal v1.0.0)                     │",
			},
			{
				id: lineIdRef.current++,
				type: 'system',
				text: '│  Type "help" for commands, or "sign <name> | <msg>" to post│',
			},
			{
				id: lineIdRef.current++,
				type: 'system',
				text: '└────────────────────────────────────────────────────────────┘',
			},
			{
				id: lineIdRef.current++,
				type: 'output',
				text: 'Type "list" to view all signatures.',
			},
		]);
	}, []);

	// Auto-scroll terminal to bottom
	useEffect(() => {
		if (viewMode === 'terminal') {
			terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
		}
	}, [lines, viewMode]);

	const addLine = (type: TerminalLine['type'], text: string, url?: string) => {
		setLines((prev) => [...prev, { id: lineIdRef.current++, type, text, ...(url ? { url } : {}) }]);
	};

	const executeCommand = (cmd: string) => {
		const trimmed = cmd.trim();
		if (!trimmed) return;

		// Record input line
		addLine('input', `$ ${trimmed}`);
		setHistory((prev) => [...prev, trimmed]);
		setHistoryIndex(null);

		const parts = trimmed.split(' ');
		const root = parts[0]?.toLowerCase();
		const args = parts.slice(1).join(' ').trim();

		switch (root) {
			case 'help':
				addLine('output', 'Available Commands:');
				addLine('output', '  list, read              Display recent guestbook signatures');
				addLine(
					'output',
					'  sign <name> | <msg>     Sign the guestbook (e.g. sign Linus | cool blog)'
				);
				addLine('output', '  stats                   Show visitor & signatures telemetry');
				addLine('output', '  whoami                  Inspect client environment & user agent');
				addLine('output', '  clear                   Clear terminal window');
				addLine('output', '  wall                    Switch to visual card-wall mode');
				addLine('output', '  home, exit              Return to home page');
				break;

			case 'list':
			case 'read':
			case 'ls':
				addLine('output', `--- Guestbook Signatures (${entries.length} total) ---`);
				entries.forEach((entry, i) => {
					const badge = entry.verified ? ' [verified]' : '';
					addLine('output', `[#${i + 1}] ${entry.date} · @${entry.name}${badge}`);
					addLine('output', `     "${entry.message}"`);
				});
				addLine('output', '---------------------------------------------------');
				break;

			case 'sign': {
				if (!args.includes('|')) {
					addLine('error', 'Usage: sign <your name> | <your message>');
					addLine('error', 'Example: sign Alex | Great read on database transactions!');
					return;
				}

				const [rawName, ...rawMsgParts] = args.split('|');
				const name = (rawName ?? '').trim();
				const message = rawMsgParts.join('|').trim();

				if (!name || !message) {
					addLine('error', 'Both name and message are required.');
					return;
				}

				const newEntry: GuestbookEntry = {
					id: `entry-${Date.now()}`,
					name: name.slice(0, 30),
					message: message.slice(0, 200),
					date: new Date().toISOString().split('T')[0] ?? '2026-10-16',
				};

				const updated = [newEntry, ...entries];
				setEntries(updated);

				try {
					localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
				} catch {
					// Ignore localStorage quota errors
				}

				addLine('success', `✓ Successfully recorded signature from @${newEntry.name}!`);
				addLine('success', `  "${newEntry.message}"`);

				// Provide GitHub Discussion link so it can be preserved permanently
				const titleParam = encodeURIComponent(`Guestbook: ${newEntry.name}`);
				const bodyParam = encodeURIComponent(
					`### Guestbook Signature\n\n- **Name:** ${newEntry.name}\n- **Message:** ${newEntry.message}\n- **Date:** ${newEntry.date}`
				);
				const ghIssueUrl = `https://github.com/${GITHUB_REPO_OWNER}/${GITHUB_REPO_NAME}/discussions/new?category=general&title=${titleParam}&body=${bodyParam}`;
				addLine(
					'system',
					'→ Want to persist your signature permanently on GitHub Discussions? [Click here to submit]',
					ghIssueUrl
				);
				break;
			}

			case 'stats':
				addLine('output', '--- System & Guestbook Telemetry ---');
				addLine('output', `Signatures Count:    ${entries.length}`);
				addLine('output', 'Hosting Provider:    GitHub Pages (Fastly CDN)');
				addLine('output', 'Runtime Engine:      Next.js 16 Static Export');
				addLine('output', 'Database:            Local Cache + GitHub Discussions');
				addLine('output', 'Status:              Healthy · 0 incidents');
				break;

			case 'whoami': {
				const userAgent = typeof navigator !== 'undefined' ? navigator.userAgent : 'Unknown';
				const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
				addLine('output', `Client:    ${userAgent.slice(0, 50)}...`);
				addLine('output', `Timezone:  ${tz}`);
				addLine(
					'output',
					`Platform:  ${typeof navigator !== 'undefined' ? navigator.platform : 'Unknown'}`
				);
				break;
			}

			case 'clear':
				setLines([]);
				break;

			case 'wall':
				setViewMode('wall');
				break;

			case 'home':
			case 'exit':
			case ':q':
				router.push('/');
				break;

			default:
				addLine('error', `Command not found: "${root}". Type "help" for a list of commands.`);
				break;
		}
	};

	const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
		if (e.key === 'Enter') {
			executeCommand(input);
			setInput('');
		} else if (e.key === 'ArrowUp') {
			e.preventDefault();
			if (history.length === 0) return;
			const nextIdx = historyIndex === null ? history.length - 1 : Math.max(0, historyIndex - 1);
			setHistoryIndex(nextIdx);
			setInput(history[nextIdx] ?? '');
		} else if (e.key === 'ArrowDown') {
			e.preventDefault();
			if (historyIndex === null) return;
			const nextIdx = historyIndex + 1;
			if (nextIdx >= history.length) {
				setHistoryIndex(null);
				setInput('');
			} else {
				setHistoryIndex(nextIdx);
				setInput(history[nextIdx] ?? '');
			}
		}
	};

	return (
		<div className="w-full space-y-4">
			{/* Mode Switcher */}
			<div className="flex items-center justify-between">
				<div className="flex items-center gap-2">
					<span className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" />
					<span className="font-mono text-xs text-muted-foreground">
						{entries.length} signatures recorded
					</span>
				</div>
				<div className="flex items-center gap-1 rounded border border-border bg-card p-0.5 font-mono text-xs">
					<button
						type="button"
						onClick={() => setViewMode('terminal')}
						className={`rounded px-2.5 py-1 transition-colors ${
							viewMode === 'terminal'
								? 'bg-primary font-semibold text-primary-foreground'
								: 'text-muted-foreground hover:text-foreground'
						}`}
					>
						terminal
					</button>
					<button
						type="button"
						onClick={() => setViewMode('wall')}
						className={`rounded px-2.5 py-1 transition-colors ${
							viewMode === 'wall'
								? 'bg-primary font-semibold text-primary-foreground'
								: 'text-muted-foreground hover:text-foreground'
						}`}
					>
						cards
					</button>
				</div>
			</div>

			{viewMode === 'terminal' ? (
				/* Terminal Window */
				<div
					className="overflow-hidden rounded-xl border border-border bg-card/95 shadow-2xl backdrop-blur-md"
					onClick={() => inputRef.current?.focus()}
				>
					{/* Terminal Title Bar */}
					<div className="flex items-center justify-between border-b border-border bg-muted/40 px-4 py-2.5">
						<div className="flex items-center gap-2">
							<span className="inline-block h-3 w-3 rounded-full bg-red-500/80" />
							<span className="inline-block h-3 w-3 rounded-full bg-amber-500/80" />
							<span className="inline-block h-3 w-3 rounded-full bg-emerald-500/80" />
						</div>
						<div className="select-none font-mono text-xs text-muted-foreground">
							guestbook@namaewanam:~ (bash)
						</div>
						<div className="w-12" />
					</div>

					{/* Terminal Output Area */}
					<div className="max-h-[480px] min-h-[340px] space-y-1 overflow-y-auto p-4 font-mono text-xs leading-relaxed sm:text-sm">
						{lines.map((line) => (
							<div key={line.id} className="whitespace-pre-wrap break-all">
								{line.type === 'input' && (
									<span className="font-semibold text-emerald-400">{line.text}</span>
								)}
								{line.type === 'system' && (
									<span className="text-muted-foreground/80">{line.text}</span>
								)}
								{line.type === 'output' && <span className="text-foreground/90">{line.text}</span>}
								{line.type === 'error' && <span className="text-red-400">{line.text}</span>}
								{line.type === 'success' && <span className="text-emerald-400">{line.text}</span>}
								{line.url && (
									<a
										href={line.url}
										target="_blank"
										rel="noopener noreferrer"
										className="ml-1 text-primary underline underline-offset-4 hover:text-primary/80"
									>
										[open link ↗]
									</a>
								)}
							</div>
						))}
						<div ref={terminalEndRef} />
					</div>

					{/* Command Prompt Input */}
					<div className="flex items-center gap-2 border-t border-border bg-background/50 px-4 py-2.5 font-mono text-xs sm:text-sm">
						<span className="font-bold text-emerald-400">$</span>
						<input
							ref={inputRef}
							type="text"
							value={input}
							onChange={(e) => setInput(e.target.value)}
							onKeyDown={handleKeyDown}
							placeholder="Type 'help' or 'sign YourName | Hello world!'"
							className="flex-1 bg-transparent text-foreground outline-none placeholder:text-muted-foreground/50"
							autoCapitalize="off"
							autoComplete="off"
							spellCheck="false"
						/>
					</div>

					{/* Quick Actions Footer */}
					<div className="flex flex-wrap items-center gap-1.5 border-t border-border/50 bg-muted/20 px-4 py-2 font-mono text-[11px] text-muted-foreground">
						<span>quick:</span>
						<button
							type="button"
							onClick={() => executeCommand('list')}
							className="rounded border border-border px-1.5 py-0.5 transition-colors hover:border-primary hover:text-primary"
						>
							list
						</button>
						<button
							type="button"
							onClick={() => executeCommand('stats')}
							className="rounded border border-border px-1.5 py-0.5 transition-colors hover:border-primary hover:text-primary"
						>
							stats
						</button>
						<button
							type="button"
							onClick={() => executeCommand('whoami')}
							className="rounded border border-border px-1.5 py-0.5 transition-colors hover:border-primary hover:text-primary"
						>
							whoami
						</button>
						<button
							type="button"
							onClick={() => executeCommand('clear')}
							className="rounded border border-border px-1.5 py-0.5 transition-colors hover:border-primary hover:text-primary"
						>
							clear
						</button>
					</div>
				</div>
			) : (
				/* Card Wall View */
				<div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
					{entries.map((entry) => (
						<div
							key={entry.id}
							className="space-y-2 rounded-lg border border-border bg-card p-4 transition-all hover:border-primary/50"
						>
							<div className="flex items-center justify-between text-xs">
								<div className="flex items-center gap-1.5 font-mono font-semibold text-foreground">
									<span>@{entry.name}</span>
									{entry.verified && (
										<span className="py-0.2 rounded bg-primary/10 px-1 text-[10px] text-primary">
											author
										</span>
									)}
								</div>
								<span className="font-mono text-[11px] text-muted-foreground">{entry.date}</span>
							</div>
							<p className="font-sans text-sm leading-relaxed text-foreground/80">
								&ldquo;{entry.message}&rdquo;
							</p>
						</div>
					))}
				</div>
			)}
		</div>
	);
}
