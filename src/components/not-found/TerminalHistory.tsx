import {
	formatPrompt,
	KNOWN_COMMANDS,
	ROOT,
	type HistoryLine,
	type HistoryTone,
} from '@/lib/not-found-terminal';

/**
 * Terminal syntax color palette — fixed, always-dark-background.
 * Based on Shank warm palette + standard ANSI terminal colors.
 *
 * Background: hsl(27 65% 11%) warm brown
 * These colors are designed specifically for that background.
 */
const T = {
	cream: '#f0ead6', //     default output text
	hintDim: 'rgba(240,234,214,0.45)', // dim hint text
	gold: '#fccb26', //      prompt, directories
	cmd: '#6ee7b7', //       known command name — emerald (fish-shell style "valid cmd")
	orange: '#f18231', //    flags/options (-n, --flag), Shank orange
	green: '#86efac', //     command typed by user (base)
	red: '#f87171', //       errors, unknown commands
	amber: '#fcd34d', //     system/warning messages, [warn]
	cyan: '#67e8f9', //      numbers, [info]
	sky: '#7dd3fc', //       paths, URLs
	violet: '#c4b5fd', //    operators: →, ->, |, &&
	muted: 'rgba(240,234,214,0.3)', // very dim (separators, #)
} as const;

// Operators that get their own color
const OPERATORS = new Set(['→', '->', '|', '&&', ';', '||', '&']);

/**
 * Tokenize and syntax-color a single line of text.
 * @param text   The text to highlight
 * @param tone   The tone of the line (controls base color and highlighting rules)
 * @param isCmd  Whether this is the first word of a user command (highlight as command name)
 */
function renderTokens(text: string, tone: HistoryTone, isCmd = false): React.ReactNode[] {
	// Split by whitespace but preserve the whitespace tokens for layout
	const tokens = text.split(/(\s+)/);
	let isFirstWord = isCmd;

	return tokens.map((token, i) => {
		// Preserve whitespace as-is
		if (!token.trim()) {
			return <span key={i}>{token}</span>;
		}

		// ── First word of a typed command → gold command name ──────────
		if (isFirstWord) {
			isFirstWord = false;
			const isKnown = KNOWN_COMMANDS.has(token.toLowerCase());
			return (
				<span key={i} style={{ color: isKnown ? T.cmd : T.red }}>
					{token}
				</span>
			);
		}

		// ── Paths and URLs → sky blue ──────────────────────────────────
		if (token.startsWith('/') || token.startsWith('http') || token.startsWith('mailto:')) {
			return (
				<span key={i} style={{ color: T.sky }}>
					{token}
				</span>
			);
		}

		// ── Directory token (word ending with /) → gold ────────────────
		if (token.endsWith('/') && token.length > 1) {
			return (
				<span key={i} style={{ color: T.gold }}>
					{token}
				</span>
			);
		}

		// ── Bracket tags: [warn] [info] [error] [debug] ───────────────
		if (/^\[warn\]$/.test(token))
			return (
				<span key={i} style={{ color: T.amber }}>
					{token}
				</span>
			);
		if (/^\[info\]$/.test(token))
			return (
				<span key={i} style={{ color: T.cyan }}>
					{token}
				</span>
			);
		if (/^\[error\]$/.test(token))
			return (
				<span key={i} style={{ color: T.red }}>
					{token}
				</span>
			);
		if (/^\[debug\]$/.test(token))
			return (
				<span key={i} style={{ color: T.muted }}>
					{token}
				</span>
			);

		// ── Flags and options: -n --flag ───────────────────────────────
		if (/^--?[a-zA-Z]/.test(token)) {
			return (
				<span key={i} style={{ color: T.orange }}>
					{token}
				</span>
			);
		}

		// ── Standalone numbers ─────────────────────────────────────────
		if (/^\d+(\.\d+)?$/.test(token)) {
			return (
				<span key={i} style={{ color: T.cyan }}>
					{token}
				</span>
			);
		}

		// ── Operators ─────────────────────────────────────────────────
		if (OPERATORS.has(token)) {
			return (
				<span key={i} style={{ color: T.violet }}>
					{token}
				</span>
			);
		}

		// ── Comment/description separator: # ──────────────────────────
		if (token === '#') {
			return (
				<span key={i} style={{ color: T.muted }}>
					{token}
				</span>
			);
		}

		// ── Known command names in non-command lines (hints, output) ──
		if (tone !== 'command' && KNOWN_COMMANDS.has(token.toLowerCase())) {
			return (
				<span key={i} style={{ color: T.gold }}>
					{token}
				</span>
			);
		}

		// ── Quoted strings ─────────────────────────────────────────────
		if (
			(token.startsWith('"') && token.endsWith('"')) ||
			(token.startsWith("'") && token.endsWith("'"))
		) {
			return (
				<span key={i} style={{ color: T.green }}>
					{token}
				</span>
			);
		}

		// ── Default: inherit parent color ──────────────────────────────
		return <span key={i}>{token}</span>;
	});
}

/** Base color for each tone — applies to the <p> wrapper */
function toneColor(tone: HistoryTone): string {
	switch (tone) {
		case 'command':
			return T.green;
		case 'error':
			return T.red;
		case 'system':
			return T.amber;
		case 'hint':
			return T.hintDim;
		default:
			return T.cream; // 'output'
	}
}

export default function TerminalHistory({ history }: Readonly<{ history: HistoryLine[] }>) {
	return (
		<div className="space-y-1.5">
			{history.map((line) => (
				<p key={line.id} style={{ color: toneColor(line.tone) }}>
					{line.tone === 'command' ? (
						<>
							{/* Prompt: gold */}
							<span style={{ color: T.gold }}>{formatPrompt(line.cwd ?? ROOT)}</span>{' '}
							{renderTokens(line.text, line.tone, /* isCmd */ true)}
						</>
					) : (
						renderTokens(line.text, line.tone, false)
					)}
				</p>
			))}
		</div>
	);
}
