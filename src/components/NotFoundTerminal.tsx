'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import TerminalHistory from '@/components/not-found/TerminalHistory';
import TerminalQuickActions from '@/components/not-found/TerminalQuickActions';
import HighlightedInput from '@/components/not-found/HighlightedInput';
import {
	COMMAND_HELP,
	PROMPT_USER,
	ROOT,
	buildTerminalIndex,
	createInitialHistory,
	formatPrompt,
	getInitialLocale,
	getTabCompletion,
	isExternalHref,
	isNonLocalizedRoute,
	localizeHref,
	normalizePath,
	renderFetch,
	renderGrep,
	renderCommandHelp,
	renderManual,
	renderTree,
	renderWhoAmI,
	resolveCommand,
	suggestCommand,
	type HistoryLine,
	type TerminalEntry,
} from '@/lib/not-found-terminal';

export default function NotFoundTerminal({
	entries,
}: Readonly<{
	entries: TerminalEntry[];
}>) {
	const pathname = usePathname() ?? '/missing';
	const router = useRouter();
	const inputRef = useRef<HTMLInputElement>(null);
	const endRef = useRef<HTMLDivElement>(null);
	const nextIdRef = useRef(100);
	const [cwd, setCwd] = useState(ROOT);
	const [lang, setLang] = useState<'en' | 'vi'>(() => getInitialLocale(pathname));
	const [input, setInput] = useState('');
	const [history, setHistory] = useState<HistoryLine[]>(() =>
		createInitialHistory(pathname, getInitialLocale(pathname))
	);
	const [commandHistory, setCommandHistory] = useState<string[]>([]);
	const [historyCursor, setHistoryCursor] = useState<number | null>(null);
	const [historyDraft, setHistoryDraft] = useState('');

	const index = useMemo(() => buildTerminalIndex(entries), [entries]);

	useEffect(() => {
		endRef.current?.scrollIntoView({ behavior: 'smooth' });
	}, [history]);

	useEffect(() => {
		inputRef.current?.focus();
	}, []);

	useEffect(() => {
		if (typeof window !== 'undefined') {
			const path = window.location.pathname;
			if (path.startsWith('/vi')) {
				setLang('vi');
			} else if (path.startsWith('/en')) {
				setLang('en');
			} else if (document.documentElement.lang === 'vi') {
				setLang('vi');
			}
		}
	}, [pathname]);

	function appendHistory(lines: Omit<HistoryLine, 'id'>[]) {
		setHistory((current) => [
			...current,
			...lines.map((line) => ({ ...line, id: nextIdRef.current++ })),
		]);
	}

	function navigateTo(href: string, localeOverride?: 'en' | 'vi') {
		const targetLang = localeOverride ?? lang;
		if (isExternalHref(href)) {
			window.open(href, '_blank', 'noopener,noreferrer');
			return;
		}
		const localized = localizeHref(href, targetLang);
		router.push(localized);
	}

	function handleCommand(rawCommand: string) {
		const trimmed = rawCommand.trim();
		if (!trimmed) return;

		appendHistory([{ text: trimmed, tone: 'command', cwd }]);
		setCommandHistory((current) => [...current, trimmed]);
		setHistoryCursor(null);
		setHistoryDraft('');

		const resolved = resolveCommand(trimmed);
		const { command, argsText } = resolved;
		if (resolved.aliasUsed) {
			appendHistory([
				{
					text: `alias: ${resolved.aliasUsed.alias} -> ${resolved.aliasUsed.expansion}`,
					tone: 'hint',
				},
			]);
		}

		switch (command) {
			case 'help': {
				if (argsText) {
					appendHistory(renderCommandHelp(argsText));
					break;
				}

				appendHistory(
					Object.entries(COMMAND_HELP).map(([, details]) => ({
						text: `${details.usage.padEnd(16, ' ')} ${details.summary}`,
						tone: 'output' as const,
					}))
				);
				appendHistory([
					{
						text: 'tip: use help <command> for usage and examples',
						tone: 'hint',
					},
				]);
				break;
			}
			case 'man': {
				if (!argsText) {
					appendHistory([{ text: 'usage: man <command>', tone: 'error' }]);
					break;
				}
				appendHistory(renderManual(argsText));
				break;
			}
			case 'lang': {
				const targetLang = argsText.trim().toLowerCase();
				if (!targetLang) {
					appendHistory([
						{
							text: `current language: ${lang} (${lang === 'vi' ? 'Tiếng Việt' : 'English'})`,
							tone: 'output',
						},
						{
							text: "usage: lang <en|vi>  (e.g. 'lang vi' or 'lang en')",
							tone: 'hint',
						},
					]);
					break;
				}

				if (targetLang === 'vi' || targetLang === 'en') {
					setLang(targetLang);
					appendHistory([
						{
							text: `language switched to: ${targetLang} (${targetLang === 'vi' ? 'Tiếng Việt' : 'English'})`,
							tone: 'hint',
						},
						{
							text: `navigation commands will now target /${targetLang}/* routes`,
							tone: 'hint',
						},
					]);
				} else {
					appendHistory([
						{
							text: `invalid language: '${argsText}'. Supported: 'en', 'vi'`,
							tone: 'error',
						},
					]);
				}
				break;
			}
			case 'suggest': {
				appendHistory([
					{ text: '/            home', tone: 'hint' },
					{ text: '/blog        all articles', tone: 'hint' },
					{ text: '/stack       tech stack & tools radar', tone: 'hint' },
					{ text: '/guestbook   interactive terminal guestbook', tone: 'hint' },
					{ text: '/adr         architecture decision records', tone: 'hint' },
					{ text: '/snippets    code snippets & recipes', tone: 'hint' },
					{ text: '/reading-list saved bookmarks & articles', tone: 'hint' },
					{ text: '/now         what I am doing now', tone: 'hint' },
					{ text: '/changelog   recent git commits', tone: 'hint' },
					{ text: '/editor      markdown post editor', tone: 'hint' },
					{ text: '/resume      curriculum vitae', tone: 'hint' },
					{ text: '/contact     contact section on home', tone: 'hint' },
					{ text: '/links       external profiles', tone: 'hint' },
					{ text: 'lang [en|vi] switch navigation language', tone: 'hint' },
					{ text: 'gh           alias for GitHub profile', tone: 'hint' },
					{ text: 'docs         alias for /blog', tone: 'hint' },
				]);
				break;
			}
			case 'pwd': {
				appendHistory([{ text: cwd, tone: 'output' }]);
				break;
			}
			case 'ls': {
				let target = argsText ? normalizePath(argsText, cwd) : cwd;
				if (!index.dirPaths.has(target)) {
					const clean = target.replace(/^\/(?:en|vi)(?=\/|$)/, '') || '/';
					if (index.dirPaths.has(clean)) {
						target = clean;
					}
				}
				if (!index.dirPaths.has(target)) {
					appendHistory([
						{
							text: `ls: cannot access '${argsText || target}': No such directory`,
							tone: 'error',
						},
					]);
					break;
				}

				const children = index.listChildren(target);
				if (children.length === 0) {
					appendHistory([{ text: '(empty)', tone: 'hint' }]);
					break;
				}

				appendHistory(
					children.map((child) => {
						if (child.type === 'dir') {
							return { text: `${child.name}/`, tone: 'output' as const };
						}
						if (child.type === 'link') {
							return {
								text: `${child.name} -> ${index.entryMap.get(child.path)?.href ?? child.path}`,
								tone: 'output' as const,
							};
						}
						const suffix = child.description ? `  # ${child.description}` : '';
						return { text: `${child.name}${suffix}`, tone: 'output' as const };
					})
				);
				break;
			}
			case 'cd': {
				let target = argsText ? normalizePath(argsText, cwd) : ROOT;
				if (!index.dirPaths.has(target)) {
					const clean = target.replace(/^\/(?:en|vi)(?=\/|$)/, '') || '/';
					if (index.dirPaths.has(clean)) {
						if (target.startsWith('/vi')) setLang('vi');
						if (target.startsWith('/en')) setLang('en');
						target = clean;
					}
				}
				if (!index.dirPaths.has(target)) {
					appendHistory([
						{
							text: `cd: no such file or directory: ${argsText || target}`,
							tone: 'error',
						},
					]);
					break;
				}
				setCwd(target);
				appendHistory([{ text: `cwd -> ${target}`, tone: 'hint' }]);
				break;
			}
			case 'tree': {
				const target = argsText ? normalizePath(argsText, cwd) : cwd;
				appendHistory(renderTree(target, index));
				break;
			}
			case 'cat': {
				if (!argsText) {
					appendHistory([{ text: 'usage: cat <path>', tone: 'error' }]);
					break;
				}
				let target = normalizePath(argsText, cwd);
				let entry = index.entryMap.get(target);
				if (!entry) {
					const clean = target.replace(/^\/(?:en|vi)(?=\/|$)/, '') || '/';
					entry = index.entryMap.get(clean);
					if (entry) target = clean;
				}

				if (entry) {
					const localized =
						isExternalHref(entry.href) || isNonLocalizedRoute(entry.href)
							? entry.href
							: localizeHref(entry.href, lang);
					appendHistory([
						{ text: `${entry.path}`, tone: 'output' },
						{ text: `${entry.label} · ${entry.description}`, tone: 'hint' },
						{ text: `target -> ${localized}`, tone: 'hint' },
					]);
					break;
				}

				if (index.dirPaths.has(target)) {
					appendHistory([
						{ text: `${target}/`, tone: 'output' },
						{ text: `${index.listChildren(target).length} child item(s)`, tone: 'hint' },
						{ text: `hint: ls ${target} or open ${target}`, tone: 'hint' },
					]);
					break;
				}

				appendHistory([{ text: 'cat: no such file or directory', tone: 'error' }]);
				break;
			}
			case 'grep': {
				const [term = '', maybePath = ''] = argsText.split(/\s+/, 2);
				if (!term) {
					appendHistory([{ text: 'usage: grep <term> [path]', tone: 'error' }]);
					break;
				}
				const target = maybePath ? normalizePath(maybePath, cwd) : cwd;
				appendHistory(renderGrep(term, target, index));
				break;
			}
			case 'open': {
				const target = argsText ? normalizePath(argsText, cwd) : cwd;
				const cleanTarget = target.replace(/^\/(?:en|vi)(?=\/|$)/, '') || '/';
				let specifiedLocale: 'vi' | 'en' | undefined;
				if (target.startsWith('/vi')) {
					specifiedLocale = 'vi';
				} else if (target.startsWith('/en')) {
					specifiedLocale = 'en';
				}

				if (specifiedLocale && specifiedLocale !== lang) {
					setLang(specifiedLocale);
				}

				const effectiveLocale = specifiedLocale ?? lang;
				const entry = index.entryMap.get(target) ?? index.entryMap.get(cleanTarget);

				if (entry) {
					const destination = localizeHref(entry.href, effectiveLocale);
					appendHistory([{ text: `opening ${destination} ...`, tone: 'hint' }]);
					navigateTo(entry.href, effectiveLocale);
					break;
				}

				if (index.routeableDirs.has(target) || index.routeableDirs.has(cleanTarget)) {
					const routeTarget = index.routeableDirs.has(target) ? target : cleanTarget;
					const destination = localizeHref(routeTarget, effectiveLocale);
					appendHistory([{ text: `opening ${destination} ...`, tone: 'hint' }]);
					navigateTo(routeTarget, effectiveLocale);
					break;
				}

				if (target === '/en' || target === '/vi') {
					const chosen = target.slice(1) as 'en' | 'vi';
					setLang(chosen);
					appendHistory([{ text: `opening /${chosen} ...`, tone: 'hint' }]);
					navigateTo(`/${chosen}`, chosen);
					break;
				}

				appendHistory([{ text: `open: cannot resolve ${target}`, tone: 'error' }]);
				break;
			}
			case 'whoami': {
				appendHistory(renderWhoAmI());
				break;
			}
			case 'fastfetch':
			case 'neofetch': {
				appendHistory(renderFetch());
				break;
			}
			case 'clear': {
				setHistory([]);
				break;
			}
			case 'sudo': {
				appendHistory([
					{
						text: `[sudo] password for ${PROMPT_USER}: ********`,
						tone: 'system',
					},
					{
						text: `${PROMPT_USER} is not in the sudoers file. This incident will be reported.`,
						tone: 'error',
					},
				]);
				break;
			}
			case 'rm': {
				if (argsText === '-rf /' || argsText === '-rf / --no-preserve-root') {
					appendHistory([
						{ text: 'rm: refusing to remove reality root', tone: 'error' },
						{ text: 'nice try. maybe `open /` instead.', tone: 'hint' },
					]);
					break;
				}
				appendHistory([{ text: 'rm: write access disabled in 404 shell', tone: 'error' }]);
				break;
			}
			case 'vim': {
				appendHistory([
					{ text: '"404.txt" [New File]', tone: 'system' },
					{ text: 'E32: No file name', tone: 'error' },
				]);
				break;
			}
			case ':q': {
				appendHistory([{ text: 'You are not in vim. Yet.', tone: 'hint' }]);
				break;
			}
			case 'exit': {
				appendHistory([
					{ text: 'logout', tone: 'system' },
					{ text: 'Connection to 404-shell closed. Reopening automatically...', tone: 'hint' },
				]);
				break;
			}
			case 'systemctl': {
				if (argsText === 'status life') {
					appendHistory([
						{ text: 'life.service - Nam Developer Runtime', tone: 'output' },
						{ text: 'Loaded: loaded (/etc/systemd/system/life.service; enabled)', tone: 'hint' },
						{ text: 'Active: active (running) since 2022-10-01', tone: 'hint' },
						{ text: 'Docs: /blog  /contact  /links/github', tone: 'hint' },
					]);
					break;
				}
				appendHistory([{ text: 'systemctl: unsupported unit in 404 shell', tone: 'error' }]);
				break;
			}
			default: {
				const suggestion = suggestCommand(command);
				appendHistory([
					{
						text: `${command}: command not found`,
						tone: 'error',
					},
					{
						text: suggestion ? `did you mean: ${suggestion}?` : 'try `help` or `suggest`',
						tone: 'hint',
					},
				]);
			}
		}
	}

	return (
		<div
			style={{
				background: 'hsl(var(--terminal-bg))',
				color: '#f0ead6',
				borderColor: 'rgba(118,80,35,0.45)',
				borderTopColor: '#fccb26',
			}}
			className="w-full rounded border border-t-2 p-6 font-mono text-sm shadow-lg"
			onClick={() => inputRef.current?.focus()}
			role="presentation"
		>
			<div
				className="mb-4 flex flex-wrap items-center gap-2 text-[10px] uppercase tracking-[0.2em]"
				style={{ color: 'rgba(203,213,225,0.45)' }}
			>
				<span
					className="rounded px-2 py-0.5 text-[10px]"
					style={{ border: '1px solid rgba(118,80,35,0.45)', color: '#fccb26' }}
				>
					404 shell
				</span>
				<span>cwd {cwd}</span>
				<span
					className="ml-auto flex items-center gap-1.5 text-[10px] lowercase"
					style={{ color: 'rgba(203,213,225,0.6)' }}
				>
					<span>locale:</span>
					<button
						type="button"
						onClick={(e) => {
							e.stopPropagation();
							const next = lang === 'vi' ? 'en' : 'vi';
							setLang(next);
							appendHistory([
								{
									text: `language switched to: ${next} (${next === 'vi' ? 'Tiếng Việt' : 'English'})`,
									tone: 'hint',
								},
							]);
						}}
						className="cursor-pointer font-bold tracking-wider underline-offset-2 hover:underline"
						style={{ color: '#fccb26' }}
						title="Click to toggle language (en/vi)"
					>
						{lang}
					</button>
					<span>({lang === 'vi' ? 'Tiếng Việt' : 'English'})</span>
				</span>
			</div>

			<TerminalHistory history={history} />

			<form
				className="mt-5 flex items-center gap-2 border-t pt-4"
				style={{ borderColor: 'rgba(118,80,35,0.35)' }}
				onSubmit={(e) => {
					e.preventDefault();
					handleCommand(input);
					setInput('');
				}}
			>
				<span style={{ color: '#fccb26' }}>{formatPrompt(cwd)}</span>
				<HighlightedInput
					ref={inputRef}
					value={input}
					onChange={(e) => {
						setInput(e.target.value);
						setHistoryCursor(null);
					}}
					onKeyDown={(e) => {
						if (e.key === 'ArrowUp') {
							e.preventDefault();
							if (commandHistory.length === 0) return;

							if (historyCursor === null) {
								setHistoryDraft(input);
								const nextCursor = commandHistory.length - 1;
								setHistoryCursor(nextCursor);
								setInput(commandHistory[nextCursor] ?? '');
								return;
							}

							const nextCursor = Math.max(0, historyCursor - 1);
							setHistoryCursor(nextCursor);
							setInput(commandHistory[nextCursor] ?? '');
							return;
						}

						if (e.key === 'ArrowDown') {
							e.preventDefault();
							if (historyCursor === null) return;

							if (historyCursor >= commandHistory.length - 1) {
								setHistoryCursor(null);
								setInput(historyDraft);
								return;
							}

							const nextCursor = historyCursor + 1;
							setHistoryCursor(nextCursor);
							setInput(commandHistory[nextCursor] ?? '');
							return;
						}

						if (e.key === 'Tab') {
							e.preventDefault();

							const completion = getTabCompletion(input, cwd, index);
							if (completion.nextInput !== input) {
								setInput(completion.nextInput);
							}

							if (completion.suggestions.length > 1) {
								appendHistory([
									{
										text: completion.suggestions.join('    '),
										tone: 'hint',
									},
								]);
							}
						}
					}}
					placeholder="type a command and press enter"
				/>
			</form>

			<TerminalQuickActions onSelect={setInput} />
			<p className="mt-3 font-mono text-[10px]" style={{ color: 'rgba(203,213,225,0.35)' }}>
				Tab to complete · ↑↓ command history
			</p>

			<div ref={endRef} />
		</div>
	);
}
