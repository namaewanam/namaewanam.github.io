import { formatPrompt, ROOT, type HistoryLine } from '@/lib/not-found-terminal';

function renderSegments(text: string) {
	return text.split(/(\s+)/).map((segment, index) => {
		if (!segment.trim()) {
			return <span key={index}>{segment}</span>;
		}

		if (segment.startsWith('/') || segment.startsWith('http') || segment.startsWith('mailto:')) {
			return (
				<span key={index} className="text-sky-400 dark:text-sky-300">
					{segment}
				</span>
			);
		}

		if (segment.endsWith('/')) {
			return (
				<span key={index} className="text-primary">
					{segment}
				</span>
			);
		}

		if (segment.startsWith('[warn]')) {
			return (
				<span key={index} className="text-amber-500 dark:text-amber-300">
					{segment}
				</span>
			);
		}

		if (segment.startsWith('[info]')) {
			return (
				<span key={index} className="text-cyan-600 dark:text-cyan-300">
					{segment}
				</span>
			);
		}

		return <span key={index}>{segment}</span>;
	});
}

export default function TerminalHistory({
	history,
}: Readonly<{
	history: HistoryLine[];
}>) {
	return (
		<div className="space-y-1.5">
			{history.map((line) => (
				<p
					key={line.id}
					className={
						line.tone === 'command'
							? 'text-emerald-700 dark:text-emerald-300'
							: line.tone === 'error'
								? 'text-destructive'
								: line.tone === 'system'
									? 'text-amber-700 dark:text-amber-200'
									: line.tone === 'hint'
										? 'text-muted-foreground/70'
										: 'text-foreground'
					}
				>
					{line.tone === 'command' ? (
						<>
							<span className="text-primary">{formatPrompt(line.cwd ?? ROOT)}</span>{' '}
							{renderSegments(line.text)}
						</>
					) : (
						renderSegments(line.text)
					)}
				</p>
			))}
		</div>
	);
}
