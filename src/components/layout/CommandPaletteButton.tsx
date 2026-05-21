'use client';

import { openCommandPalette } from '@/lib/command-palette';

export default function CommandPaletteButton({
	shortLabel = false,
}: Readonly<{
	shortLabel?: boolean;
}>) {
	return (
		<button
			type="button"
			onClick={openCommandPalette}
			className="inline-flex items-center gap-2 rounded border border-border px-2.5 py-1.5 font-mono text-[11px] text-muted-foreground transition-all hover:border-primary hover:text-foreground"
			aria-label="Open command palette"
		>
			<span className="text-primary">/</span>
			<span>{shortLabel ? 'jump' : 'command'}</span>
			<span className="rounded border border-border/80 px-1 py-0 text-[10px] text-muted-foreground/70">
				{shortLabel ? '⌘K' : 'cmd+k'}
			</span>
		</button>
	);
}
