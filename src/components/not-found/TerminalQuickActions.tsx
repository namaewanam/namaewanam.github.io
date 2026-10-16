interface QuickAction {
	label: string;
	command: string;
}

const QUICK_ACTIONS: QuickAction[] = [
	{ label: 'help', command: 'help' },
	{ label: 'suggest', command: 'suggest' },
	{ label: 'tree /', command: 'tree /' },
	{ label: 'open /blog', command: 'open /blog' },
	{ label: 'open /stack', command: 'open /stack' },
	{ label: 'open /guestbook', command: 'open /guestbook' },
	{ label: 'open /snippets', command: 'open /snippets' },
	{ label: 'open /adr', command: 'open /adr' },
	{ label: 'open /now', command: 'open /now' },
	{ label: 'lang vi', command: 'lang vi' },
	{ label: 'whoami', command: 'whoami' },
	{ label: 'fastfetch', command: 'fastfetch' },
	{ label: 'open github', command: 'open /links/github' },
];

export default function TerminalQuickActions({
	onSelect,
}: Readonly<{
	onSelect: (command: string) => void;
}>) {
	return (
		<div className="mt-4 flex flex-wrap gap-2 text-[11px]">
			{QUICK_ACTIONS.map((action) => (
				<button
					key={action.label}
					type="button"
					onClick={() => onSelect(action.command)}
					className="rounded px-2 py-0.5 transition-colors"
					style={{
						border: '1px solid rgba(118,80,35,0.45)',
						color: 'rgba(203,213,225,0.6)',
						background: 'transparent',
					}}
					onMouseEnter={(e) => {
						(e.currentTarget as HTMLButtonElement).style.borderColor = '#fccb26';
						(e.currentTarget as HTMLButtonElement).style.color = '#fccb26';
					}}
					onMouseLeave={(e) => {
						(e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(118,80,35,0.45)';
						(e.currentTarget as HTMLButtonElement).style.color = 'rgba(203,213,225,0.6)';
					}}
				>
					{action.label}
				</button>
			))}
		</div>
	);
}
