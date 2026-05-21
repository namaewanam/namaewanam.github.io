'use client';

import { useDeferredValue, useEffect, useMemo, useRef, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { COMMAND_PALETTE_EVENT, type CommandPaletteItem } from '@/lib/command-palette';

const SECTION_LABELS: Record<CommandPaletteItem['section'], string> = {
	jump: 'jump',
	topics: 'topics',
	featured: 'featured',
	series: 'start here',
};

function isTypingField(target: EventTarget | null) {
	return (
		target instanceof HTMLInputElement ||
		target instanceof HTMLTextAreaElement ||
		(target instanceof HTMLElement && target.isContentEditable)
	);
}

export default function GlobalCommandPalette({
	items,
}: Readonly<{
	items: CommandPaletteItem[];
}>) {
	const router = useRouter();
	const pathname = usePathname();
	const inputRef = useRef<HTMLInputElement>(null);
	const [isOpen, setIsOpen] = useState(false);
	const [query, setQuery] = useState('');
	const [selectedIndex, setSelectedIndex] = useState(0);
	const deferredQuery = useDeferredValue(query);

	useEffect(() => {
		function openPalette() {
			setIsOpen(true);
		}

		function handleKeydown(event: KeyboardEvent) {
			if (event.defaultPrevented) return;
			if (isTypingField(event.target)) return;

			if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
				event.preventDefault();
				setIsOpen(true);
				return;
			}

			if (!event.metaKey && !event.ctrlKey && !event.altKey && event.key === '/') {
				event.preventDefault();
				setIsOpen(true);
			}
		}

		window.addEventListener(COMMAND_PALETTE_EVENT, openPalette);
		window.addEventListener('keydown', handleKeydown);
		return () => {
			window.removeEventListener(COMMAND_PALETTE_EVENT, openPalette);
			window.removeEventListener('keydown', handleKeydown);
		};
	}, []);

	useEffect(() => {
		if (!isOpen) return;
		setSelectedIndex(0);
		const timeout = window.setTimeout(() => inputRef.current?.focus(), 0);
		const previousOverflow = document.body.style.overflow;
		document.body.style.overflow = 'hidden';
		return () => {
			window.clearTimeout(timeout);
			document.body.style.overflow = previousOverflow;
		};
	}, [isOpen]);

	useEffect(() => {
		setIsOpen(false);
	}, [pathname]);

	const filteredItems = useMemo(() => {
		const normalizedQuery = deferredQuery.trim().toLowerCase();
		if (!normalizedQuery) return items;

		return items.filter((item) =>
			[
				item.label,
				item.description,
				item.meta,
				...(item.keywords ?? []),
				SECTION_LABELS[item.section],
			]
				.filter(Boolean)
				.join(' ')
				.toLowerCase()
				.includes(normalizedQuery)
		);
	}, [deferredQuery, items]);

	const groupedItems = useMemo(() => {
		return (['jump', 'topics', 'featured', 'series'] as const)
			.map((section) => ({
				section,
				items: filteredItems.filter((item) => item.section === section),
			}))
			.filter((group) => group.items.length > 0);
	}, [filteredItems]);

	const flatItems = useMemo(() => groupedItems.flatMap((group) => group.items), [groupedItems]);

	useEffect(() => {
		if (selectedIndex >= flatItems.length) {
			setSelectedIndex(0);
		}
	}, [flatItems.length, selectedIndex]);

	function openItem(item: CommandPaletteItem) {
		setIsOpen(false);
		setQuery('');

		if (item.external) {
			window.open(item.href, '_blank', 'noopener,noreferrer');
			return;
		}

		router.push(item.href);
	}

	if (!isOpen) return null;

	return (
		<div
			className="fixed inset-0 z-[80] bg-background/70 backdrop-blur-sm"
			onClick={() => setIsOpen(false)}
		>
			<div className="mx-auto mt-20 w-full max-w-2xl px-4 sm:mt-24 sm:px-6">
				<div
					className="overflow-hidden rounded-xl border border-border bg-card shadow-2xl"
					onClick={(event) => event.stopPropagation()}
				>
					<div className="border-b border-border px-4 py-3">
						<div className="flex items-center gap-3">
							<span className="font-mono text-xs text-primary">~/jump</span>
							<input
								ref={inputRef}
								value={query}
								onChange={(event) => setQuery(event.target.value)}
								onKeyDown={(event) => {
									if (event.key === 'Escape') {
										event.preventDefault();
										setIsOpen(false);
										return;
									}

									if (event.key === 'ArrowDown') {
										event.preventDefault();
										setSelectedIndex((current) =>
											flatItems.length === 0 ? 0 : (current + 1) % flatItems.length
										);
										return;
									}

									if (event.key === 'ArrowUp') {
										event.preventDefault();
										setSelectedIndex((current) =>
											flatItems.length === 0
												? 0
												: (current - 1 + flatItems.length) % flatItems.length
										);
										return;
									}

									if (event.key === 'Enter' && flatItems[selectedIndex]) {
										event.preventDefault();
										openItem(flatItems[selectedIndex]);
									}
								}}
								placeholder="blog, stack, resume, contact, featured, start here..."
								className="w-full bg-transparent font-mono text-sm text-foreground outline-none placeholder:text-muted-foreground/60"
								aria-label="Command palette"
							/>
						</div>
						<p className="mt-2 font-mono text-[10px] text-muted-foreground/70">
							/ or cmd+k to open · enter to jump · esc to close
						</p>
					</div>

					<div className="max-h-[60vh] overflow-y-auto p-2">
						{groupedItems.length > 0 ? (
							groupedItems.map((group) => {
								const groupOffset = flatItems.findIndex((item) => item.section === group.section);

								return (
									<div key={group.section} className="pb-2">
										<p className="px-2 py-1 font-mono text-[10px] uppercase tracking-wider text-muted-foreground/60">
											{SECTION_LABELS[group.section]}
										</p>
										<div className="space-y-1">
											{group.items.map((item, index) => {
												const itemIndex = groupOffset + index;
												const isSelected = itemIndex === selectedIndex;

												return (
													<button
														key={item.id}
														type="button"
														onClick={() => openItem(item)}
														className={`flex w-full items-start justify-between gap-3 rounded-lg px-3 py-2 text-left transition-all ${
															isSelected
																? 'bg-primary text-primary-foreground'
																: 'hover:bg-background/80'
														}`}
													>
														<div className="min-w-0">
															<p className="truncate font-mono text-xs">{item.label}</p>
															{item.description && (
																<p
																	className={`mt-1 text-xs ${
																		isSelected
																			? 'text-primary-foreground/80'
																			: 'text-muted-foreground'
																	}`}
																>
																	{item.description}
																</p>
															)}
														</div>
														{item.meta && (
															<span
																className={`shrink-0 font-mono text-[10px] ${
																	isSelected
																		? 'text-primary-foreground/70'
																		: 'text-muted-foreground/70'
																}`}
															>
																{item.meta}
															</span>
														)}
													</button>
												);
											})}
										</div>
									</div>
								);
							})
						) : (
							<div className="px-3 py-10 text-center font-mono text-sm text-muted-foreground">
								no route matches that query
							</div>
						)}
					</div>
				</div>
			</div>
		</div>
	);
}
