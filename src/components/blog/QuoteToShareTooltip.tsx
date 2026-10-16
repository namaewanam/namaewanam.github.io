'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { SITE_NAME } from '@/lib/site';

interface QuoteToShareTooltipProps {
	articleTitle: string;
}

export default function QuoteToShareTooltip({ articleTitle }: QuoteToShareTooltipProps) {
	const [selectedText, setSelectedText] = useState('');
	const [position, setPosition] = useState<{ top: number; left: number } | null>(null);
	const [copied, setCopied] = useState(false);
	const tooltipRef = useRef<HTMLDivElement>(null);

	const updateSelection = useCallback(() => {
		const selection = window.getSelection();
		if (!selection || selection.isCollapsed) {
			setPosition(null);
			setSelectedText('');
			return;
		}

		const text = selection.toString().trim();
		if (text.length < 5) {
			setPosition(null);
			setSelectedText('');
			return;
		}

		// Verify selection is inside an <article>
		const anchorNode = selection.anchorNode;
		const focusNode = selection.focusNode;
		const article = document.querySelector('article');
		if (!article || !anchorNode || !focusNode) {
			setPosition(null);
			return;
		}

		if (!article.contains(anchorNode) || !article.contains(focusNode)) {
			setPosition(null);
			return;
		}

		try {
			const range = selection.getRangeAt(0);
			const rect = range.getBoundingClientRect();
			if (rect.width === 0 || rect.height === 0) {
				setPosition(null);
				return;
			}

			// Position horizontally centered above the selection, clamped within viewport
			const tooltipWidth = 240;
			const tooltipHeight = 44;
			const horizontalCenter = rect.left + rect.width / 2;
			const clampedLeft = Math.max(
				16 + tooltipWidth / 2,
				Math.min(window.innerWidth - 16 - tooltipWidth / 2, horizontalCenter)
			);

			// If too close to top of viewport, position below the selection instead
			let top = rect.top - tooltipHeight - 8;
			if (top < 16) {
				top = rect.bottom + 8;
			}

			setPosition({ top, left: clampedLeft });
			setSelectedText(text);
		} catch {
			setPosition(null);
		}
	}, []);

	const positionRef = useRef(position);
	positionRef.current = position;

	useEffect(() => {
		function handleSelectionEnd() {
			const selection = window.getSelection();
			// Skip calculation if no text is selected and no tooltip is currently open
			if ((!selection || selection.isCollapsed) && !positionRef.current) {
				return;
			}
			window.requestAnimationFrame(updateSelection);
		}

		function handleScrollOrResize() {
			if (positionRef.current) {
				updateSelection();
			}
		}

		function handleKeyDown(e: KeyboardEvent) {
			if (e.key === 'Escape' && positionRef.current) {
				setPosition(null);
				window.getSelection()?.removeAllRanges();
			}
		}

		function handlePointerDown(e: MouseEvent | TouchEvent) {
			if (!positionRef.current) return;
			// If clicking inside the tooltip, don't dismiss immediately
			if (tooltipRef.current?.contains(e.target as Node)) {
				return;
			}
			window.requestAnimationFrame(updateSelection);
		}

		document.addEventListener('mouseup', handleSelectionEnd);
		document.addEventListener('touchend', handleSelectionEnd);
		document.addEventListener('keyup', handleSelectionEnd);
		document.addEventListener('mousedown', handlePointerDown);
		window.addEventListener('scroll', handleScrollOrResize, { passive: true });
		window.addEventListener('resize', handleScrollOrResize);
		window.addEventListener('keydown', handleKeyDown);

		return () => {
			document.removeEventListener('mouseup', handleSelectionEnd);
			document.removeEventListener('touchend', handleSelectionEnd);
			document.removeEventListener('keyup', handleSelectionEnd);
			document.removeEventListener('mousedown', handlePointerDown);
			window.removeEventListener('scroll', handleScrollOrResize);
			window.removeEventListener('resize', handleScrollOrResize);
			window.removeEventListener('keydown', handleKeyDown);
		};
	}, [updateSelection]);

	if (!position || !selectedText) return null;

	const currentUrl = typeof window !== 'undefined' ? window.location.href : '';

	const handleCopyQuote = async () => {
		const formatted = `> "${selectedText}"\n\n— ${SITE_NAME}, [${articleTitle}](${currentUrl})`;
		try {
			await navigator.clipboard.writeText(formatted);
			setCopied(true);
			setTimeout(() => setCopied(false), 2000);
		} catch {
			// Fallback copy if clipboard API blocked
			const textarea = document.createElement('textarea');
			textarea.value = formatted;
			document.body.appendChild(textarea);
			textarea.select();
			document.execCommand('copy');
			document.body.removeChild(textarea);
			setCopied(true);
			setTimeout(() => setCopied(false), 2000);
		}
	};

	const handleShareTwitter = () => {
		// Truncate quote so tweet fits within 280 chars
		const maxQuoteLen = 180;
		const snippet =
			selectedText.length > maxQuoteLen ? `${selectedText.slice(0, maxQuoteLen)}...` : selectedText;
		const tweetText = `"${snippet}"\n\nvia @${SITE_NAME}`;
		const tweetUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}&url=${encodeURIComponent(currentUrl)}`;
		window.open(tweetUrl, '_blank', 'noopener,noreferrer,width=600,height=400');
	};

	const handleShareLinkedIn = () => {
		const shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(currentUrl)}`;
		window.open(shareUrl, '_blank', 'noopener,noreferrer,width=600,height=500');
	};

	return (
		<aside
			ref={tooltipRef}
			aria-label="Quote options"
			style={{
				position: 'fixed',
				top: `${position.top}px`,
				left: `${position.left}px`,
				transform: 'translateX(-50%)',
			}}
			className="animate-in fade-in zoom-in-95 z-50 flex items-center gap-1 rounded-lg border border-border bg-card/95 px-2 py-1.5 font-mono text-xs text-foreground shadow-xl backdrop-blur-md transition-all"
		>
			<button
				type="button"
				onClick={handleCopyQuote}
				className="flex items-center gap-1.5 rounded px-2 py-1 transition-colors hover:bg-muted active:scale-95"
				title="Copy as Markdown quote"
				aria-label={copied ? 'Quote copied' : 'Copy quote'}
			>
				{copied ? (
					<>
						<svg
							className="h-3.5 w-3.5 text-primary"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							strokeWidth="2.5"
							strokeLinecap="round"
							strokeLinejoin="round"
						>
							<polyline points="20 6 9 17 4 12" />
						</svg>
						<span className="font-medium text-primary">copied!</span>
					</>
				) : (
					<>
						<svg
							className="h-3.5 w-3.5 text-muted-foreground"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							strokeWidth="2"
							strokeLinecap="round"
							strokeLinejoin="round"
						>
							<path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
							<rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
						</svg>
						<span>quote</span>
					</>
				)}
			</button>

			<div className="mx-0.5 h-3.5 w-px bg-border" />

			<button
				type="button"
				onClick={handleShareTwitter}
				className="flex items-center gap-1 rounded px-2 py-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground active:scale-95"
				title="Share quote to X / Twitter"
				aria-label="Share to X"
			>
				<svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="currentColor">
					<path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
				</svg>
				<span>x</span>
			</button>

			<button
				type="button"
				onClick={handleShareLinkedIn}
				className="flex items-center gap-1 rounded px-2 py-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground active:scale-95"
				title="Share on LinkedIn"
				aria-label="Share on LinkedIn"
			>
				<svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="currentColor">
					<path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 8.76c-.95 0-1.72-.78-1.72-1.73s.77-1.73 1.72-1.73c.95 0 1.73.78 1.73 1.73s-.78 1.73-1.73 1.73m1.4 9.74v-8.37H5.06v8.37h2.8z" />
				</svg>
			</button>
		</aside>
	);
}
