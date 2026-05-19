'use client';

import { useEffect, useRef } from 'react';

/**
 * Client-side component (~2 kB) that enhances server-rendered HTML:
 * 1. Wraps <pre> blocks with copy button + language label
 * 2. Adds line numbers to code blocks
 * 3. Adds copyable anchor links to h2/h3 headings
 */
export default function CodeCopyInjector({ html }: Readonly<{ html: string }>) {
	const containerRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const container = containerRef.current;
		if (!container) return;

		const showToast = (message: string) => {
			const existing = document.querySelector('.copy-feedback-toast');
			if (existing) existing.remove();

			const toast = document.createElement('div');
			toast.className = 'copy-feedback-toast';
			toast.textContent = message;
			document.body.appendChild(toast);

			requestAnimationFrame(() => {
				toast.classList.add('visible');
			});

			setTimeout(() => {
				toast.classList.remove('visible');
				setTimeout(() => toast.remove(), 180);
			}, 1400);
		};

		// ── Code blocks: wrap, label, copy, line numbers ────────────
		const preBlocks = container.querySelectorAll('pre');
		preBlocks.forEach((pre) => {
			if (pre.parentElement?.classList.contains('code-block-wrapper')) return;

			const code = pre.querySelector('code');
			const langClass = Array.from(code?.classList ?? []).find((c) => c.startsWith('language-'));
			const lang = langClass?.replace('language-', '') ?? '';

			// Wrap <pre>
			const wrapper = document.createElement('div');
			wrapper.className = 'code-block-wrapper relative group';
			pre.parentNode?.insertBefore(wrapper, pre);
			wrapper.appendChild(pre);

			// Language label
			if (lang) {
				const label = document.createElement('span');
				label.className = 'code-lang-label';
				label.textContent = lang;
				wrapper.appendChild(label);
			}

			// Line numbers: wrap each line in a span
			if (code) {
				const lines = code.innerHTML.split('\n');
				// Remove trailing empty line (common in code blocks)
				if (lines.length > 0 && lines[lines.length - 1]?.trim() === '') {
					lines.pop();
				}
				code.innerHTML = lines.map((line) => `<span class="code-line">${line}</span>`).join('\n');
				code.classList.add('code-numbered');
			}

			// Copy button
			const copyIcon = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>`;
			const checkIcon = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`;

			const btn = document.createElement('button');
			btn.className = 'code-copy-btn';
			btn.setAttribute('aria-label', 'Copy code');
			btn.innerHTML = copyIcon;
			btn.addEventListener('click', () => {
				const text = code?.textContent ?? pre.textContent ?? '';
				navigator.clipboard.writeText(text).then(() => {
					btn.innerHTML = checkIcon;
					btn.classList.add('copied');
					showToast('copied code');
					setTimeout(() => {
						btn.innerHTML = copyIcon;
						btn.classList.remove('copied');
					}, 2000);
				});
			});
			wrapper.appendChild(btn);
		});

		// ── Heading anchors: add # link to h2/h3 ────────────────────
		const headings = container.querySelectorAll('h2[id], h3[id]');
		headings.forEach((heading) => {
			if (heading.querySelector('.heading-anchor')) return;

			const anchor = document.createElement('a');
			anchor.className = 'heading-anchor';
			anchor.href = `#${heading.id}`;
			anchor.textContent = '#';
			anchor.setAttribute('aria-label', `Link to ${heading.textContent}`);
			anchor.addEventListener('click', (e) => {
				e.preventDefault();
				const url = `${window.location.origin}${window.location.pathname}#${heading.id}`;
				navigator.clipboard.writeText(url);
				heading.scrollIntoView({ behavior: 'smooth' });
				window.history.replaceState(null, '', `#${heading.id}`);
				showToast('copied permalink');
			});
			heading.appendChild(anchor);
		});
	}, [html]);

	return <div ref={containerRef} dangerouslySetInnerHTML={{ __html: html }} />;
}
