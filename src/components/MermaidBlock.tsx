'use client';

import { useEffect, useRef, useState } from 'react';

interface MermaidBlockProps {
	code: string;
	id: string;
}

export default function MermaidBlock({ code, id }: MermaidBlockProps) {
	const containerRef = useRef<HTMLDivElement>(null);
	const [error, setError] = useState<string | null>(null);
	const [rendered, setRendered] = useState(false);

	useEffect(() => {
		let cancelled = false;

		async function render() {
			try {
				const mermaid = (await import('mermaid')).default;

				mermaid.initialize({
					startOnLoad: false,
					theme: document.documentElement.classList.contains('dark') ? 'dark' : 'neutral',
					securityLevel: 'loose',
					fontFamily: 'var(--font-mono), monospace',
				});

				const { svg } = await mermaid.render(`mermaid-${id}`, code);

				if (!cancelled && containerRef.current) {
					containerRef.current.innerHTML = svg;
					setRendered(true);
				}
			} catch (err) {
				if (!cancelled) {
					setError(err instanceof Error ? err.message : 'Failed to render diagram');
				}
			}
		}

		void render();
		return () => {
			cancelled = true;
		};
	}, [code, id]);

	if (error) {
		return (
			<div className="border-destructive/40 bg-destructive/5 text-destructive rounded border p-4 font-mono text-sm">
				<p className="font-semibold">Mermaid error</p>
				<pre className="mt-1 text-xs opacity-75">{error}</pre>
			</div>
		);
	}

	return (
		<div
			ref={containerRef}
			className="my-6 flex justify-center overflow-x-auto rounded border border-border bg-card/40 p-4"
			role="img"
			aria-label="Diagram"
		>
			{!rendered && (
				<div className="animate-pulse text-xs text-muted-foreground">rendering diagram…</div>
			)}
		</div>
	);
}
