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

		// Code blocks: wrap, label, copy, line numbers
		const preBlocks = container.querySelectorAll('pre');
		preBlocks.forEach((pre) => {
			if (pre.parentElement?.classList.contains('code-block-wrapper')) return;
			// Mermaid blocks are handled separately — skip here
			if (pre.querySelector('code.language-mermaid')) return;

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

		// Mermaid diagrams: replace pre>code.language-mermaid
		const mermaidBlocks = container.querySelectorAll<HTMLElement>('pre:has(code.language-mermaid)');
		if (mermaidBlocks.length > 0) {
			// Build theme variables for a given mode
			const getMermaidVars = (dark: boolean) =>
				dark
					? {
							darkMode: true,
							background: 'transparent',
							primaryColor: '#3d2a18',
							secondaryColor: '#2e1e10',
							tertiaryColor: '#22140a',
							mainBkg: '#3d2a18',
							clusterBkg: '#2a1c0d',
							primaryBorderColor: '#6b4c30',
							nodeBorder: '#6b4c30',
							primaryTextColor: '#f0ead6',
							secondaryTextColor: '#f0ead6',
							tertiaryTextColor: '#f0ead6',
							textColor: '#f0ead6',
							titleColor: '#fccb26',
							lineColor: '#9c876a',
							edgeLabelBackground: '#2a1c0d',
							actorBkg: '#3d2a18',
							actorTextColor: '#f0ead6',
							actorLineColor: '#6b4c30',
							signalColor: '#9c876a',
							signalTextColor: '#f0ead6',
							labelBoxBkgColor: '#2e1e10',
							labelBoxBorderColor: '#6b4c30',
							labelTextColor: '#f0ead6',
							loopTextColor: '#f0ead6',
							noteBkgColor: '#2e1e10',
							noteBorderColor: '#fccb26',
							noteTextColor: '#f0ead6',
							activationBkgColor: '#2e1e10',
							activationBorderColor: '#fccb26',
							git0: '#fccb26',
							git1: '#f18231',
							git2: '#7dd3fc',
							git3: '#86efac',
							git4: '#c4b5fd',
							git5: '#f87171',
							gitBranchLabel0: '#1a0f06',
							gitBranchLabel1: '#1a0f06',
							gitBranchLabel2: '#1a0f06',
							gitBranchLabel3: '#1a0f06',
						}
					: {
							darkMode: false,
							background: 'transparent',
							primaryColor: '#fef3d8',
							secondaryColor: '#fde8b8',
							tertiaryColor: '#fdf5e8',
							mainBkg: '#fef3d8',
							primaryBorderColor: '#d48a20',
							nodeBorder: '#d48a20',
							primaryTextColor: '#2a1f0e',
							secondaryTextColor: '#2a1f0e',
							textColor: '#2a1f0e',
							titleColor: '#c27a1a',
							lineColor: '#6b5c44',
							edgeLabelBackground: '#fdf5e8',
							actorBkg: '#fef3d8',
							actorTextColor: '#2a1f0e',
							actorLineColor: '#d48a20',
							signalColor: '#6b5c44',
							signalTextColor: '#2a1f0e',
							noteBkgColor: '#fff8e8',
							noteBorderColor: '#d48a20',
							noteTextColor: '#2a1f0e',
							labelTextColor: '#2a1f0e',
							loopTextColor: '#2a1f0e',
							git0: '#d48a20',
							git1: '#c27a1a',
							git2: '#2563eb',
							git3: '#059669',
							git4: '#7c3aed',
							git5: '#dc2626',
						};

			// Re-render all .mermaid-diagram wrappers using stored source
			let renderCounter = 0;
			const reRenderAll = async (dark: boolean) => {
				try {
					const mermaid = (await import('mermaid')).default;
					mermaid.initialize({
						startOnLoad: false,
						theme: 'base',
						themeVariables: getMermaidVars(dark),
						securityLevel: 'loose',
					});
					const wrappers = container.querySelectorAll<HTMLElement>('.mermaid-diagram[data-src]');
					for (const wrapper of wrappers) {
						const src = wrapper.getAttribute('data-src');
						if (!src) continue;
						const uid = `mermaid-rc-${++renderCounter}`;
						try {
							const { svg } = await mermaid.render(uid, src);
							const oldSvg = wrapper.querySelector('svg');
							if (oldSvg) {
								const temp = document.createElement('div');
								temp.innerHTML = svg;
								const newSvg = temp.querySelector('svg');
								if (newSvg) {
									newSvg.style.cursor = 'zoom-in';
									newSvg.addEventListener('click', () => openLightbox(newSvg));
									oldSvg.replaceWith(newSvg);
								}
							} else {
								wrapper.innerHTML = svg;
							}
						} catch (err) {
							console.warn('Mermaid re-render failed:', err);
						}
					}
				} catch (err) {
					console.warn('Mermaid not available:', err);
				}
			};

			// Initial render — replace pre blocks with wrappers that store src
			void (async () => {
				try {
					const mermaid = (await import('mermaid')).default;
					const isDark = document.documentElement.classList.contains('dark');
					mermaid.initialize({
						startOnLoad: false,
						theme: 'base',
						themeVariables: getMermaidVars(isDark),
						securityLevel: 'loose',
					});

					let idx = 0;
					for (const pre of mermaidBlocks) {
						const code = pre.querySelector<HTMLElement>('code.language-mermaid');
						if (!code) continue;
						const diagram = code.textContent ?? '';
						const uid = `mermaid-init-${idx++}`;
						try {
							const { svg } = await mermaid.render(uid, diagram);
							const wrapper = document.createElement('div');
							wrapper.className =
								'mermaid-diagram relative group my-6 flex justify-center overflow-x-auto rounded border border-border bg-card/40 p-4';
							wrapper.setAttribute('role', 'img');
							wrapper.setAttribute('aria-label', 'Diagram');
							wrapper.setAttribute('data-src', diagram);
							wrapper.innerHTML = svg;

							// Language label — top right, same style as code blocks
							const langLabel = document.createElement('span');
							langLabel.className = 'code-lang-label';
							langLabel.textContent = 'mermaid';
							wrapper.appendChild(langLabel);

							// Lightbox: click SVG area to zoom (attach inline, after async render)
							const svgEl = wrapper.querySelector('svg');
							if (svgEl) {
								svgEl.style.cursor = 'zoom-in';
								svgEl.addEventListener('click', () => openLightbox(svgEl));
							}

							// Action buttons: download SVG + copy source (bottom-right)
							const actions = document.createElement('div');
							actions.className = 'mermaid-actions';
							const aBtnStyle =
								'display:inline-flex;align-items:center;gap:0.3rem;padding:0.2rem 0.55rem;border-radius:0.25rem;background:hsl(var(--card));border:1px solid hsl(var(--border));color:hsl(var(--muted-foreground));cursor:pointer;font-size:11px;font-family:var(--font-mono),monospace;transition:color 0.15s,border-color 0.15s;';
							const cpIcon =
								'<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>';
							const dlIcon =
								'<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>';
							const ckIcon =
								'<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>';

							// Copy source
							const srcBtn = document.createElement('button');
							srcBtn.style.cssText = aBtnStyle;
							srcBtn.setAttribute('aria-label', 'Copy Mermaid source');
							srcBtn.innerHTML = cpIcon + ' copy';
							srcBtn.addEventListener('click', (e) => {
								e.stopPropagation();
								void navigator.clipboard.writeText(diagram).then(() => {
									srcBtn.innerHTML = ckIcon + ' copied';
									showToast('copied source');
									setTimeout(() => {
										srcBtn.innerHTML = cpIcon + ' copy';
									}, 2000);
								});
							});

							// Download SVG
							const dlBtn = document.createElement('button');
							dlBtn.style.cssText = aBtnStyle;
							dlBtn.setAttribute('aria-label', 'Download SVG');
							dlBtn.innerHTML = dlIcon + ' svg';
							dlBtn.addEventListener('click', (e) => {
								e.stopPropagation();
								const s = wrapper.querySelector('svg');
								if (!s) return;
								const blob = new Blob(['<?xml version="1.0" encoding="UTF-8"?>\n', s.outerHTML], {
									type: 'image/svg+xml',
								});
								const url = URL.createObjectURL(blob);
								const a = document.createElement('a');
								a.href = url;
								a.download = `diagram-${uid}.svg`;
								a.click();
								URL.revokeObjectURL(url);
								showToast('downloaded SVG');
							});

							actions.appendChild(srcBtn);
							actions.appendChild(dlBtn);
							wrapper.appendChild(actions);

							pre.replaceWith(wrapper);
						} catch (err) {
							console.warn('Mermaid render failed:', err);
						}
					}
				} catch (err) {
					console.warn('Mermaid not available:', err);
				}
			})();

			// Re-render diagrams when site theme toggles
			const themeObserver = new MutationObserver(() => {
				const dark = document.documentElement.classList.contains('dark');
				void reRenderAll(dark);
			});
			themeObserver.observe(document.documentElement, {
				attributes: true,
				attributeFilter: ['class'],
			});
		}

		// Heading anchors: add # link to h2/h3
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

		// Image / Mermaid lightbox
		const openLightbox = (content: HTMLElement | SVGElement) => {
			const overlay = document.createElement('div');
			overlay.className = 'lightbox-overlay';
			overlay.setAttribute('role', 'dialog');
			overlay.setAttribute('aria-modal', 'true');
			overlay.setAttribute('aria-label', 'Image enlarged');

			const close = document.createElement('button');
			close.className = 'lightbox-close';
			close.textContent = '×';
			close.setAttribute('aria-label', 'Close');

			let inner: HTMLElement;
			if (content instanceof HTMLImageElement) {
				const img = document.createElement('img');
				img.src = content.src;
				img.alt = content.alt;
				inner = img;
			} else {
				// SVG clone for mermaid diagrams
				const clone = content.cloneNode(true) as SVGElement;
				// Remove inline dimensions so it scales up
				clone.removeAttribute('width');
				clone.removeAttribute('height');
				clone.style.width = '100%';
				clone.style.height = 'auto';
				clone.style.maxWidth = 'none';

				const wrap = document.createElement('div');
				wrap.style.cssText =
					'display:flex;align-items:center;justify-content:center;background:hsl(var(--card) / 0.4);padding:2rem;border-radius:8px;border:1px solid hsl(var(--border));max-width:92vw;max-height:88vh;overflow:auto;width:min(1200px, 92vw);';
				wrap.appendChild(clone);
				inner = wrap;
			}

			const dismiss = () => {
				overlay.remove();
				document.removeEventListener('keydown', onKey);
			};
			const onKey = (e: KeyboardEvent) => {
				if (e.key === 'Escape') dismiss();
			};
			overlay.addEventListener('click', dismiss);
			close.addEventListener('click', (e) => {
				e.stopPropagation();
				dismiss();
			});
			inner.addEventListener('click', (e) => e.stopPropagation());
			document.addEventListener('keydown', onKey);

			overlay.appendChild(inner);
			overlay.appendChild(close);
			document.body.appendChild(overlay);
		};

		// Zoomable images
		container.querySelectorAll<HTMLImageElement>('.prose img').forEach((img) => {
			img.style.cursor = 'zoom-in';
			img.addEventListener('click', () => openLightbox(img));
		});
	}, [html]);

	return <div ref={containerRef} dangerouslySetInnerHTML={{ __html: html }} />;
}
