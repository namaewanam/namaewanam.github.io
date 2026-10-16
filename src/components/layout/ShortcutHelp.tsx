'use client';

import { useEffect, useState } from 'react';
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
			{ keys: ['+'], description: 'increase article font size' },
			{ keys: ['-'], description: 'decrease article font size' },
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

	useEffect(() => {
		function openHelp() {
			setIsOpen(true);
		}

		function handleKeydown(event: KeyboardEvent) {
			if (event.key === 'Escape') {
				setIsOpen(false);
				return;
			}

			if (event.defaultPrevented || isTypingField(event.target)) return;
			if (event.metaKey || event.ctrlKey || event.altKey) return;
			if (event.key !== '?') return;

			event.preventDefault();
			setIsOpen(true);
		}

		window.addEventListener(SHORTCUT_HELP_EVENT, openHelp);
		window.addEventListener('keydown', handleKeydown);
		return () => {
			window.removeEventListener(SHORTCUT_HELP_EVENT, openHelp);
			window.removeEventListener('keydown', handleKeydown);
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
			className="bg-background/72 fixed inset-0 z-[81] backdrop-blur-sm"
			onClick={() => setIsOpen(false)}
		>
			<div className="mx-auto mt-24 w-full max-w-xl px-4 sm:px-6">
				<div
					className="overflow-hidden rounded-xl border border-border bg-card shadow-2xl"
					onClick={(event) => event.stopPropagation()}
				>
					<div className="border-b border-border px-4 py-3">
						<div className="flex items-center justify-between gap-3">
							<div>
								<p className="font-mono text-[10px] uppercase tracking-widest text-primary">
									keyboard shortcuts
								</p>
								<h2 className="mt-1 text-sm font-semibold text-foreground">
									Small commands for moving faster
								</h2>
							</div>
							<button
								type="button"
								onClick={() => setIsOpen(false)}
								className="rounded border border-border px-2 py-1 font-mono text-[10px] text-muted-foreground transition-colors hover:text-foreground"
							>
								esc
							</button>
						</div>
					</div>

					<div className="space-y-5 p-4">
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
				</div>
			</div>
		</div>
	);
}
