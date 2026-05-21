'use client';

import { useEffect, useState } from 'react';
import { SHORTCUT_HELP_EVENT } from '@/lib/shortcut-help';

const SHORTCUT_GROUPS = [
	{
		title: 'global',
		items: [
			{ keys: ['?'], description: 'show keyboard shortcuts' },
			{ keys: ['/'], description: 'open command palette' },
			{ keys: ['cmd', 'k'], description: 'open command palette' },
			{ keys: ['esc'], description: 'close dialogs and overlays' },
		],
	},
	{
		title: 'palette',
		items: [
			{ keys: ['↑', '↓'], description: 'move through results' },
			{ keys: ['enter'], description: 'open the selected result' },
		],
	},
	{
		title: 'blog',
		items: [{ keys: ['/'], description: 'focus article search on the blog page' }],
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
