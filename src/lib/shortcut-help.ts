export const SHORTCUT_HELP_EVENT = 'shortcut-help:open';

export function openShortcutHelp() {
	window.dispatchEvent(new Event(SHORTCUT_HELP_EVENT));
}
