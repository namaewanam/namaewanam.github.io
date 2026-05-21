'use client';

import { useEffect, useState } from 'react';

export default function CopyableContactValue({
	displayValue,
	copyValue,
	href,
	secondaryLinks,
}: Readonly<{
	displayValue: string;
	copyValue: string;
	href?: string;
	secondaryLinks?: Array<{
		label: string;
		href: string;
	}>;
}>) {
	const [copied, setCopied] = useState(false);
	const statusId = `copy-status-${copyValue.replace(/[^a-z0-9]+/gi, '-').toLowerCase()}`;

	useEffect(() => {
		if (!copied) return;
		const timeout = window.setTimeout(() => setCopied(false), 1200);
		return () => window.clearTimeout(timeout);
	}, [copied]);

	async function handleCopy() {
		try {
			await navigator.clipboard.writeText(copyValue);
			setCopied(true);
		} catch {
			setCopied(false);
		}
	}

	return (
		<div className="flex items-baseline gap-2">
			{href ? (
				<a
					href={href}
					target={href.startsWith('mailto') ? undefined : '_blank'}
					rel={href.startsWith('mailto') ? undefined : 'noopener noreferrer'}
					className="break-all text-xs text-foreground underline underline-offset-2 transition-colors hover:text-primary"
				>
					{displayValue}
				</a>
			) : (
				<span className="text-xs text-foreground">{displayValue}</span>
			)}
			<button
				type="button"
				onClick={handleCopy}
				className="shrink-0 rounded border border-border px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground transition-colors hover:text-foreground"
				aria-label={`Copy ${copyValue}`}
				aria-describedby={statusId}
			>
				{copied ? 'copied' : 'copy'}
			</button>
			{secondaryLinks && secondaryLinks.length > 0 && (
				<div className="flex flex-wrap items-center gap-1">
					{secondaryLinks.map((link) => (
						<a
							key={link.label}
							href={link.href}
							target={link.href.startsWith('mailto') ? undefined : '_blank'}
							rel={link.href.startsWith('mailto') ? undefined : 'noopener noreferrer'}
							className="rounded border border-border px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground transition-colors hover:text-foreground"
						>
							{link.label}
						</a>
					))}
				</div>
			)}
			<span id={statusId} className="sr-only" aria-live="polite" role="status">
				{copied ? `${displayValue} copied to clipboard` : ''}
			</span>
		</div>
	);
}
