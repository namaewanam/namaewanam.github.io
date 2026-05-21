export const COMMAND_PALETTE_EVENT = 'command-palette:open';

export interface CommandPaletteItem {
	id: string;
	label: string;
	href: string;
	section: 'jump' | 'topics' | 'featured' | 'series';
	description?: string;
	meta?: string;
	keywords?: string[];
	external?: boolean;
}

export function openCommandPalette() {
	window.dispatchEvent(new Event(COMMAND_PALETTE_EVENT));
}
