'use client';

import { useEffect, useState, useRef } from 'react';
import { SHORTCUT_HELP_EVENT } from '@/lib/shortcut-help';

const SHORTCUT_GROUPS = [
	{
		title: 'vim motions',
		items: [
			{ keys: ['j'], description: 'scroll down line/section' },
			{ keys: ['k'], description: 'scroll up line/section' },
			{ keys: ['ctrl', 'd'], description: 'half-page down (50vh)' },
			{ keys: ['ctrl', 'u'], description: 'half-page up (50vh)' },
			{ keys: ['g', 'g'], description: 'jump to top of page' },
			{ keys: ['G'], description: 'jump to bottom of page' },
			{ keys: ['z', 'z'], description: 'center viewport' },
			{ keys: ['}'], description: 'next section heading (h2/h3)' },
			{ keys: ['{'], description: 'previous section heading' },
			{ keys: [']', 'c'], description: 'next code snippet' },
			{ keys: ['[', 'c'], description: 'previous code snippet' },
		],
	},
	{
		title: 'navigation',
		items: [
			{ keys: ['g', 'h'], description: 'go to home page' },
			{ keys: ['g', 'b'], description: 'go to blog' },
			{ keys: ['g', 's'], description: 'go to stack' },
			{ keys: ['g', 'a'], description: 'go to ADR' },
			{ keys: ['g', 'm'], description: 'go to guestbook' },
			{ keys: ['g', 'n'], description: 'go to now page' },
			{ keys: ['g', 'c'], description: 'go to changelog' },
			{ keys: ['g', 'e'], description: 'go to markdown editor' },
			{ keys: ['r'], description: 'jump to random article' },
			{ keys: ['.'], description: 'open source code on GitHub' },
			{ keys: ['['], description: 'previous article' },
			{ keys: [']'], description: 'next article' },
		],
	},
	{
		title: 'actions & reading',
		items: [
			{ keys: ['y'], description: 'yank (copy) page URL' },
			{ keys: ['y', 'c'], description: 'yank nearest code block' },
			{ keys: ['m'], description: 'bookmark post to reading list' },
			{ keys: ['t'], description: 'toggle dark/light theme' },
			{ keys: ['l'], description: 'switch language (en / vi)' },
			{ keys: ['z'], description: 'toggle zen focus mode' },
			{ keys: ['+'], description: 'increase font size (+10%)' },
			{ keys: ['-'], description: 'decrease font size (-10%)' },
			{ keys: ['0'], description: 'reset font size to 100%' },
			{ keys: ['p'], description: 'audio narration (play/pause TTS)' },
		],
	},
	{
		title: 'commands & search',
		items: [
			{ keys: [':'], description: 'open Vim ex-command bar (:w, :q, :e, :help...)' },
			{ keys: ['/'], description: 'open search & command palette' },
			{ keys: ['cmd', 'k'], description: 'open search & command palette' },
			{ keys: ['?'], description: 'show this shortcut help' },
			{ keys: ['esc'], description: 'close dialogs and command bar' },
		],
	},
] as const;

function isTypingField(target: EventTarget | null) {
	return (
		target instanceof HTMLInputElement ||
		target instanceof HTMLTextAreaElement ||
		(target instanceof HTMLElement && target.isContentEditable)
	);
}

function ShortcutKey({ value }: Readonly<{ value: string }>) {
	return (
		<span className="rounded border border-border bg-background/80 px-2 py-0.5 font-mono text-[10px] text-foreground">
			{value}
		</span>
	);
}

export default function ShortcutHelp() {
	const [isOpen, setIsOpen] = useState(false);
	const isOpenRef = useRef(false);
	const contentRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		isOpenRef.current = isOpen;
	}, [isOpen]);

	useEffect(() => {
		function openHelp() {
			setIsOpen(true);
		}

		function handleKeydown(event: KeyboardEvent) {
			if (!isOpenRef.current) {
				if (event.defaultPrevented || isTypingField(event.target)) return;
				if (event.metaKey || event.ctrlKey || event.altKey) return;
				if (event.key !== '?') return;

				event.preventDefault();
				setIsOpen(true);
				return;
			}

			// Modal is OPEN:
			if (event.key === 'Escape') {
				event.preventDefault();
				setIsOpen(false);
				return;
			}

			// Scroll inside modal with j/k, Ctrl+d/u, arrows, G
			if (event.key === 'j' || event.key === 'ArrowDown') {
				event.preventDefault();
				event.stopPropagation();
				contentRef.current?.scrollBy({ top: 140, behavior: 'smooth' });
				return;
			}
			if (event.key === 'k' || event.key === 'ArrowUp') {
				event.preventDefault();
				event.stopPropagation();
				contentRef.current?.scrollBy({ top: -140, behavior: 'smooth' });
				return;
			}
			if (event.ctrlKey && event.key === 'd') {
				event.preventDefault();
				event.stopPropagation();
				contentRef.current?.scrollBy({ top: 260, behavior: 'smooth' });
				return;
			}
			if (event.ctrlKey && event.key === 'u') {
				event.preventDefault();
				event.stopPropagation();
				contentRef.current?.scrollBy({ top: -260, behavior: 'smooth' });
				return;
			}
			if (event.key === 'G' && event.shiftKey) {
				event.preventDefault();
				event.stopPropagation();
				contentRef.current?.scrollTo({ top: contentRef.current.scrollHeight, behavior: 'smooth' });
			}
		}

		window.addEventListener(SHORTCUT_HELP_EVENT, openHelp);
		window.addEventListener('keydown', handleKeydown, { capture: true });
		return () => {
			window.removeEventListener(SHORTCUT_HELP_EVENT, openHelp);
			window.removeEventListener('keydown', handleKeydown, { capture: true });
		};
	}, []);

	useEffect(() => {
		if (!isOpen) return;
		const previousOverflow = document.body.style.overflow;
		document.body.style.overflow = 'hidden';
		return () => {
			document.body.style.overflow = previousOverflow;
		};
	}, [isOpen]);

	if (!isOpen) return null;

	return (
		<div
			className="animate-in fade-in fixed inset-0 z-[81] flex items-center justify-center overflow-y-auto bg-background/80 p-4 backdrop-blur-sm sm:p-6"
			onClick={() => setIsOpen(false)}
			role="dialog"
			aria-modal="true"
			aria-label="Keyboard Shortcuts"
		>
			<div
				className="animate-in zoom-in-95 flex max-h-[85vh] w-full max-w-xl flex-col overflow-hidden rounded-xl border border-border bg-card shadow-2xl"
				onClick={(event) => event.stopPropagation()}
			>
				{/* Fixed Header */}
				<div className="shrink-0 border-b border-border bg-muted/20 px-4 py-3">
					<div className="flex items-center justify-between gap-3">
						<div>
							<p className="font-mono text-[10px] uppercase tracking-widest text-primary">
								keyboard shortcuts // :help
							</p>
							<h2 className="mt-1 text-sm font-semibold text-foreground">
								Vim motions &amp; quick commands
							</h2>
						</div>
						<button
							type="button"
							onClick={() => setIsOpen(false)}
							className="rounded border border-border px-2 py-1 font-mono text-[10px] text-muted-foreground transition-colors hover:text-foreground active:scale-95"
						>
							esc
						</button>
					</div>
				</div>

				{/* Scrollable Body */}
				<div ref={contentRef} className="flex-1 space-y-6 overflow-y-auto p-4 sm:p-5">
					{SHORTCUT_GROUPS.map((group) => (
						<section key={group.title} className="space-y-2">
							<p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground/70">
								{group.title}
							</p>
							<div className="space-y-2">
								{group.items.map((item) => (
									<div
										key={`${group.title}-${item.description}`}
										className="flex items-center justify-between gap-4 rounded-lg border border-border/70 bg-background/40 px-3 py-2"
									>
										<div className="flex flex-wrap items-center gap-1.5">
											{item.keys.map((key) => (
												<ShortcutKey key={`${item.description}-${key}`} value={key} />
											))}
										</div>
										<p className="text-right text-xs text-muted-foreground">{item.description}</p>
									</div>
								))}
							</div>
						</section>
					))}
				</div>

				{/* Footer with Hint */}
				<div className="flex shrink-0 items-center justify-between border-t border-border bg-muted/10 px-4 py-2 font-mono text-[11px] text-muted-foreground">
					<span>
						Scroll with <kbd className="text-foreground">j</kbd>/
						<kbd className="text-foreground">k</kbd>, <kbd className="text-foreground">^d</kbd>/
						<kbd className="text-foreground">^u</kbd> or mousewheel
					</span>
					<span>
						<kbd className="text-foreground">Esc</kbd> to close
					</span>
				</div>
			</div>
		</div>
	);
}
