'use client';

import { forwardRef } from 'react';
import { KNOWN_COMMANDS } from '@/lib/not-found-terminal';

/**
 * Terminal input colors (same palette as TerminalHistory)
 */
const C = {
	gold: '#fccb26', // prompt (in parent), directories
	cmd: '#6ee7b7', // known command name — emerald, fish-shell "valid cmd" style
	orange: '#f18231', // flags --flag -n
	sky: '#7dd3fc', // paths, URLs
	cyan: '#67e8f9', // numbers
	red: '#f87171', // unknown command
	cream: '#f0ead6', // default arg text
	dim: 'rgba(240,234,214,0.35)', // placeholder
} as const;

/**
 * Tokenize and colorize the current input value.
 * Returns an array of <span> elements for the overlay div.
 *
 * Highlighting rules (matching fish-shell style):
 *   - First word: known command → gold, unknown → red
 *   - Flags (--flag, -n) → orange
 *   - Paths (/...) and URLs → sky blue
 *   - Numbers → cyan
 *   - Everything else → cream
 */
function highlightTokens(value: string): React.ReactNode[] {
	if (!value) return [];

	// Split preserving whitespace runs so the overlay aligns with the input
	const parts = value.split(/(\s+)/);
	let isFirstWord = true;

	return parts.map((part, i) => {
		// Whitespace — render as-is (white-space: pre keeps it visible)
		if (!part.trim()) {
			return <span key={i}>{part}</span>;
		}

		// ── First word = command name ──────────────────────────────────
		if (isFirstWord) {
			isFirstWord = false;
			const isKnown = KNOWN_COMMANDS.has(part.toLowerCase());
			return (
				<span key={i} style={{ color: isKnown ? C.cmd : C.red }}>
					{part}
				</span>
			);
		}

		// ── Paths / URLs ───────────────────────────────────────────────
		if (part.startsWith('/') || part.startsWith('http') || part.startsWith('mailto:')) {
			return (
				<span key={i} style={{ color: C.sky }}>
					{part}
				</span>
			);
		}

		// ── Flags (--flag or -n) ────────────────────────────────────────
		if (/^--?[a-zA-Z]/.test(part)) {
			return (
				<span key={i} style={{ color: C.orange }}>
					{part}
				</span>
			);
		}

		// ── Numbers ────────────────────────────────────────────────────
		if (/^\d+(\.\d+)?$/.test(part)) {
			return (
				<span key={i} style={{ color: C.cyan }}>
					{part}
				</span>
			);
		}

		// ── Default ────────────────────────────────────────────────────
		return (
			<span key={i} style={{ color: C.cream }}>
				{part}
			</span>
		);
	});
}

interface HighlightedInputProps {
	value: string;
	onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
	onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
	placeholder?: string;
}

/**
 * Syntax-highlighting terminal input using the overlay technique:
 * - A real <input> sits on top (handles focus, cursor, selection)
 * - A mirror <div> behind it shows colorized spans
 * - Input text is transparent, caret is gold
 *
 * Both share identical font metrics so text aligns pixel-perfectly.
 */
const HighlightedInput = forwardRef<HTMLInputElement, HighlightedInputProps>(
	({ value, onChange, onKeyDown, placeholder }, ref) => {
		return (
			<div
				className="relative min-w-0 flex-1"
				style={{ fontFamily: 'inherit', fontSize: 'inherit' }}
			>
				{/* Highlight overlay — rendered behind the real input */}
				<div
					aria-hidden="true"
					style={{
						position: 'absolute',
						inset: 0,
						pointerEvents: 'none',
						whiteSpace: 'pre',
						overflow: 'hidden',
						fontFamily: 'inherit',
						fontSize: 'inherit',
						lineHeight: 'inherit',
						letterSpacing: 'inherit',
						// Placeholder dim when empty
						color: value ? 'transparent' : C.dim,
					}}
				>
					{value ? highlightTokens(value) : placeholder}
				</div>

				{/* Real input — transparent text so the overlay shows through */}
				<input
					ref={ref}
					type="text"
					value={value}
					onChange={onChange}
					onKeyDown={onKeyDown}
					className="relative w-full bg-transparent outline-none"
					style={{
						color: 'transparent',
						caretColor: C.gold,
						fontFamily: 'inherit',
						fontSize: 'inherit',
						lineHeight: 'inherit',
						letterSpacing: 'inherit',
					}}
					autoComplete="off"
					autoCapitalize="off"
					autoCorrect="off"
					spellCheck={false}
				/>
			</div>
		);
	}
);

HighlightedInput.displayName = 'HighlightedInput';

export default HighlightedInput;
