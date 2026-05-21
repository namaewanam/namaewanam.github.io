'use client';

import { openShortcutHelp } from '@/lib/shortcut-help';

export default function ShortcutHelpButton() {
	return (
		<button
			type="button"
			onClick={openShortcutHelp}
			className="transition-colors hover:text-primary"
			aria-label="Open keyboard shortcuts help"
		>
			help ?
		</button>
	);
}
