interface QuickAction {
	label: string;
	command: string;
}

const QUICK_ACTIONS: QuickAction[] = [
	{ label: 'help', command: 'help' },
	{ label: 'man grep', command: 'man grep' },
	{ label: 'whoami', command: 'whoami' },
	{ label: 'fastfetch', command: 'fastfetch' },
	{ label: 'tree /blog', command: 'tree /blog' },
	{ label: 'help open', command: 'help open' },
	{ label: 'ls /blog', command: 'ls /blog' },
	{ label: 'open /blog', command: 'open /blog' },
	{ label: 'open github', command: 'open /links/github' },
];

export default function TerminalQuickActions({
	onSelect,
}: Readonly<{
	onSelect: (command: string) => void;
}>) {
	return (
		<div className="mt-4 flex flex-wrap gap-2 text-[11px] text-muted-foreground/70">
			{QUICK_ACTIONS.map((action) => (
				<button
					key={action.label}
					type="button"
					onClick={() => onSelect(action.command)}
					className="rounded border border-border px-2 py-0.5 transition-colors hover:border-primary hover:text-primary"
				>
					{action.label}
				</button>
			))}
		</div>
	);
}
