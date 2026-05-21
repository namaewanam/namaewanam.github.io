'use client';

import { openShortcutHelp } from '@/lib/shortcut-help';

export default function ShortcutHelpButton() {
	return (
		<button
			type="button"
			onClick={openShortcutHelp}
			className="transition-colors hover:text-primary"
		>
			help ?<span className="sr-only">Open keyboard shortcuts help</span>
		</button>
	);
}
