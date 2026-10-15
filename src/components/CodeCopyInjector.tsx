'use client';

import { useEffect, useRef } from 'react';
import { getPlantUmlSvgUrl } from '@/lib/plantuml';

const COPY_ICON =
	'<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>';
const COPY_ICON_SMALL =
	'<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>';
const CHECK_ICON =
	'<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>';
const CHECK_ICON_SMALL =
	'<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>';
const DOWNLOAD_ICON =
	'<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>';
const ACTION_BUTTON_STYLE =
	'display:inline-flex;align-items:center;gap:0.3rem;padding:0.2rem 0.55rem;border-radius:0.25rem;background:hsl(var(--card));border:1px solid hsl(var(--border));color:hsl(var(--muted-foreground));cursor:pointer;font-size:11px;font-family:var(--font-mono),monospace;transition:color 0.15s,border-color 0.15s;text-decoration:none;';

const PLAY_ICON =
	'<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="5 3 19 12 5 21 5 3"/></svg>';

/** Playground URLs for supported languages. */
const PLAYGROUND_URLS: Record<string, string> = {
	java: 'https://www.jdoodle.com/online-java-compiler/',
	python: 'https://www.programiz.com/python-programming/online-compiler/',
	javascript: 'https://playcode.io/new',
	js: 'https://playcode.io/new',
	typescript: 'https://www.typescriptlang.org/play',
	ts: 'https://www.typescriptlang.org/play',
	go: 'https://go.dev/play/',
	golang: 'https://go.dev/play/',
	rust: 'https://play.rust-lang.org/',
	sql: 'https://www.db-fiddle.com/',
	bash: 'https://www.onlinegdb.com/online_bash_shell',
	shell: 'https://www.onlinegdb.com/online_bash_shell',
	sh: 'https://www.onlinegdb.com/online_bash_shell',
	c: 'https://www.onlinegdb.com/online_c_compiler',
	cpp: 'https://www.onlinegdb.com/online_c++_compiler',
	'c++': 'https://www.onlinegdb.com/online_c++_compiler',
};

function createActionButton(icon: string, label: string, ariaLabel: string): HTMLButtonElement {
	const button = document.createElement('button');
	button.type = 'button';
	button.style.cssText = ACTION_BUTTON_STYLE;
	button.setAttribute('aria-label', ariaLabel);
	button.innerHTML = `${icon} ${label}`;
	return button;
}

function createActionLink(
	icon: string,
	label: string,
	ariaLabel: string,
	href: string
): HTMLAnchorElement {
	const link = document.createElement('a');
	link.href = href;
	link.target = '_blank';
	link.rel = 'noopener noreferrer';
	link.style.cssText = ACTION_BUTTON_STYLE;
	link.setAttribute('aria-label', ariaLabel);
	link.innerHTML = `${icon} ${label}`;
	return link;
}

/**
 * Client-side component that enhances server-rendered HTML:
 * 1. Wraps code blocks with copy button + language label
 * 2. Renders Mermaid and PlantUML blocks as diagrams
 * 3. Adds copyable anchor links to h2/h3 headings
 */
export interface PostMetaPreview {
	url: string;
	title: string;
	description?: string | undefined;
	readingTimeMin: number;
}

function escapeHtml(str: string): string {
	return str.replace(
		/[&<>"']/g,
		(m) =>
			({
				'&': '&amp;',
				'<': '&lt;',
				'>': '&gt;',
				'"': '&quot;',
				"'": '&#39;',
			})[m] ?? m
	);
}

export default function CodeCopyInjector({
	html,
	postsMeta,
}: Readonly<{ html: string; postsMeta?: PostMetaPreview[] }>) {
	const containerRef = useRef<HTMLDivElement>(null);
	const previewTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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

			const dismiss = () => {
				overlay.remove();
				document.removeEventListener('keydown', onKey);
			};
			const onKey = (event: KeyboardEvent) => {
				if (event.key === 'Escape') dismiss();
			};

			overlay.addEventListener('click', dismiss);
			close.addEventListener('click', (event) => {
				event.stopPropagation();
				dismiss();
			});
			overlay.appendChild(close);
			document.addEventListener('keydown', onKey);
			document.body.appendChild(overlay);

			const buildSvgWrap = (svgEl: SVGSVGElement) => {
				// Read natural dimensions before removing attributes
				const naturalW =
					parseFloat(svgEl.getAttribute('width') ?? '0') || svgEl.viewBox?.baseVal?.width || 800;
				const naturalH =
					parseFloat(svgEl.getAttribute('height') ?? '0') || svgEl.viewBox?.baseVal?.height || 600;

				// Ensure viewBox is set so the browser can scale correctly
				if (!svgEl.getAttribute('viewBox')) {
					svgEl.setAttribute('viewBox', `0 0 ${naturalW} ${naturalH}`);
				}
				svgEl.setAttribute('preserveAspectRatio', 'xMidYMid meet');

				// Compute scale to fit within 88vh × 92vw, with a minimum scale of 1
				// so small diagrams display at least at their natural size
				const maxW = window.innerWidth * 0.86;
				const maxH = window.innerHeight * 0.82;
				const scale = Math.min(1, maxW / naturalW, maxH / naturalH);
				const displayW = Math.round(naturalW * scale);
				const displayH = Math.round(naturalH * scale);

				svgEl.setAttribute('width', String(displayW));
				svgEl.setAttribute('height', String(displayH));
				svgEl.style.cssText = 'display:block;max-width:100%;';

				const wrap = document.createElement('div');
				wrap.style.cssText =
					'display:flex;align-items:center;justify-content:center;' +
					'background:hsl(var(--card) / 0.4);padding:2rem;border-radius:8px;' +
					'border:1px solid hsl(var(--border));overflow:auto;' +
					`max-width:92vw;max-height:88vh;`;
				wrap.appendChild(svgEl);
				wrap.addEventListener('click', (e) => e.stopPropagation());
				overlay.insertBefore(wrap, close);
			};

			if (content instanceof HTMLImageElement) {
				// PlantUML diagrams are <img src="…/plantuml/svg/…">
				// Fetch and inline the SVG so it scales to fill the lightbox.
				const isPlantUml = !!content.closest('.plantuml-diagram');
				if (isPlantUml && content.src) {
					const placeholder = document.createElement('div');
					placeholder.style.cssText =
						'color:hsl(var(--muted-foreground));font-size:13px;' +
						'font-family:var(--font-mono),monospace;padding:2rem;';
					placeholder.textContent = 'Loading…';
					overlay.insertBefore(placeholder, close);

					fetch(content.src)
						.then((r) => r.text())
						.then((svgText) => {
							const parser = new DOMParser();
							const doc = parser.parseFromString(svgText, 'image/svg+xml');
							const svgEl = doc.querySelector('svg');
							if (!svgEl) throw new Error('no svg');
							const imported = document.importNode(svgEl, true) as SVGSVGElement;
							placeholder.remove();
							buildSvgWrap(imported);
						})
						.catch(() => {
							placeholder.remove();
							const img = document.createElement('img');
							img.src = content.src;
							img.alt = content.alt;
							img.style.cssText =
								'max-width:92vw;max-height:88vh;border-radius:6px;display:block;' +
								'box-shadow:0 25px 60px rgba(0,0,0,0.4);';
							img.addEventListener('click', (e) => e.stopPropagation());
							overlay.insertBefore(img, close);
						});
					return;
				}

				// Regular inline image
				const img = document.createElement('img');
				img.src = content.src;
				img.alt = content.alt;
				img.style.cssText =
					'max-width:92vw;max-height:88vh;border-radius:6px;display:block;' +
					'box-shadow:0 25px 60px rgba(0,0,0,0.4);';
				img.addEventListener('click', (e) => e.stopPropagation());
				overlay.insertBefore(img, close);
				return;
			}

			// SVGElement — Mermaid diagrams (already inline SVG)
			const clone = content.cloneNode(true) as SVGSVGElement;
			buildSvgWrap(clone);
		};

		const reRenderPlantUml = (dark: boolean) => {
			container.querySelectorAll<HTMLElement>('.plantuml-diagram[data-src]').forEach((wrapper) => {
				const source = wrapper.getAttribute('data-src');
				if (!source) return;

				const img = wrapper.querySelector<HTMLImageElement>('img');
				const svgLink = wrapper.querySelector<HTMLAnchorElement>('a[aria-label="Open SVG"]');
				const fallback = wrapper.querySelector<HTMLElement>('figcaption');

				void getPlantUmlSvgUrl(source, dark).then((nextUrl) => {
					if (img) {
						img.src = nextUrl;
					}
					if (svgLink) {
						svgLink.href = nextUrl;
					}
					if (fallback) {
						fallback.classList.add('hidden');
					}
				});
			});
		};

		// PlantUML diagrams: replace pre>code.language-plantuml / puml
		const plantUmlBlocks = container.querySelectorAll<HTMLElement>(
			'pre:has(code.language-plantuml), pre:has(code.language-puml)'
		);
		plantUmlBlocks.forEach((pre) => {
			const code = pre.querySelector<HTMLElement>('code.language-plantuml, code.language-puml');
			if (!code) return;

			const diagram = code.textContent?.trim() ?? '';
			if (!diagram) return;

			const wrapper = document.createElement('figure');
			wrapper.className =
				'plantuml-diagram relative group my-6 overflow-hidden rounded border border-border bg-card/40 p-4';
			wrapper.setAttribute('data-src', diagram);

			const langLabel = document.createElement('span');
			langLabel.className = 'code-lang-label';
			langLabel.textContent = code.classList.contains('language-puml') ? 'puml' : 'plantuml';
			wrapper.appendChild(langLabel);

			const img = document.createElement('img');
			img.alt = 'PlantUML diagram';
			img.loading = 'lazy';
			img.decoding = 'async';
			img.className = 'mx-auto block h-auto max-w-full rounded';

			const fallback = document.createElement('figcaption');
			fallback.className =
				'mt-3 hidden rounded border border-destructive/30 bg-destructive/5 px-3 py-2 font-mono text-xs text-destructive';
			fallback.textContent =
				'PlantUML render failed. Check syntax or configure NEXT_PUBLIC_PLANTUML_SERVER_URL.';

			img.addEventListener('error', () => {
				fallback.classList.remove('hidden');
			});

			wrapper.appendChild(img);
			wrapper.appendChild(fallback);

			const actions = document.createElement('div');
			actions.className = 'diagram-actions';

			const copyBtn = createActionButton(COPY_ICON_SMALL, 'copy', 'Copy PlantUML source');
			copyBtn.addEventListener('click', (event) => {
				event.stopPropagation();
				void navigator.clipboard.writeText(diagram).then(() => {
					copyBtn.innerHTML = `${CHECK_ICON_SMALL} copied`;
					showToast('copied source');
					setTimeout(() => {
						copyBtn.innerHTML = `${COPY_ICON_SMALL} copy`;
					}, 2000);
				});
			});

			const svgLink = createActionLink(DOWNLOAD_ICON, 'svg', 'Open SVG', '');
			svgLink.addEventListener('click', (event) => event.stopPropagation());

			void getPlantUmlSvgUrl(diagram, document.documentElement.classList.contains('dark')).then(
				(url) => {
					img.src = url;
					svgLink.href = url;
				}
			);

			actions.appendChild(copyBtn);
			actions.appendChild(svgLink);
			wrapper.appendChild(actions);

			pre.replaceWith(wrapper);
		});

		let plantUmlThemeObserver: MutationObserver | null = null;
		if (plantUmlBlocks.length > 0) {
			plantUmlThemeObserver = new MutationObserver(() => {
				reRenderPlantUml(document.documentElement.classList.contains('dark'));
			});
			plantUmlThemeObserver.observe(document.documentElement, {
				attributes: true,
				attributeFilter: ['class'],
			});
		}

		// Code blocks: wrap, label, copy, line numbers
		const preBlocks = container.querySelectorAll('pre');
		preBlocks.forEach((pre) => {
			if (pre.parentElement?.classList.contains('code-block-wrapper')) return;
			if (pre.querySelector('code.language-mermaid')) return;
			if (pre.querySelector('code.language-plantuml, code.language-puml')) return;

			const code = pre.querySelector('code');
			const langClass = Array.from(code?.classList ?? []).find((className) =>
				className.startsWith('language-')
			);
			const lang = langClass?.replace('language-', '') ?? '';

			const wrapper = document.createElement('div');
			wrapper.className = 'code-block-wrapper relative group';
			pre.parentNode?.insertBefore(wrapper, pre);
			wrapper.appendChild(pre);

			if (lang) {
				const label = document.createElement('span');
				label.className = 'code-lang-label';
				label.textContent = lang;
				wrapper.appendChild(label);
			}

			if (code) {
				const lines = code.innerHTML.split('\n');
				if (lines.length > 0 && lines[lines.length - 1]?.trim() === '') {
					lines.pop();
				}
				code.innerHTML = lines.map((line) => `<span class="code-line">${line}</span>`).join('\n');
				code.classList.add('code-numbered');
			}

			const button = document.createElement('button');
			button.className = 'code-copy-btn';
			button.setAttribute('aria-label', 'Copy code');
			button.innerHTML = COPY_ICON;
			button.addEventListener('click', () => {
				const text = code?.textContent ?? pre.textContent ?? '';
				navigator.clipboard.writeText(text).then(() => {
					button.innerHTML = CHECK_ICON;
					button.classList.add('copied');
					showToast('copied code');
					setTimeout(() => {
						button.innerHTML = COPY_ICON;
						button.classList.remove('copied');
					}, 2000);
				});
			});
			wrapper.appendChild(button);

			// Interactive code: add "try it" button for supported languages
			const playgroundUrl = lang ? PLAYGROUND_URLS[lang.toLowerCase()] : undefined;
			if (playgroundUrl) {
				const tryBtn = document.createElement('button');
				tryBtn.className = 'code-copy-btn code-try-btn';
				tryBtn.setAttribute('aria-label', `Try ${lang} code in playground`);
				tryBtn.innerHTML = PLAY_ICON;
				tryBtn.style.cssText = 'right:2.75rem;';
				tryBtn.addEventListener('click', () => {
					const text = code?.textContent ?? pre.textContent ?? '';
					navigator.clipboard.writeText(text).then(() => {
						showToast('code copied — paste in playground');
						window.open(playgroundUrl, '_blank', 'noopener,noreferrer');
					});
				});
				wrapper.appendChild(tryBtn);
			}
		});

		// Mermaid diagrams: replace pre>code.language-mermaid
		let mermaidThemeObserver: MutationObserver | null = null;
		const mermaidBlocks = container.querySelectorAll<HTMLElement>('pre:has(code.language-mermaid)');
		if (mermaidBlocks.length > 0) {
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

			let renderCounter = 0;

			const reRenderAll = async (dark: boolean) => {
				try {
					const mermaid = (await import('mermaid')).default;
					mermaid.initialize({
						startOnLoad: false,
						theme: 'base',
						themeVariables: getMermaidVars(dark),
						securityLevel: 'antiscript',
					});

					const wrappers = container.querySelectorAll<HTMLElement>('.mermaid-diagram[data-src]');
					for (const wrapper of wrappers) {
						const source = wrapper.getAttribute('data-src');
						if (!source) continue;
						const uid = `mermaid-rc-${++renderCounter}`;

						try {
							const { svg } = await mermaid.render(uid, source);
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
							}
						} catch (error) {
							console.warn('Mermaid re-render failed:', error);
						}
					}
				} catch (error) {
					console.warn('Mermaid not available:', error);
				}
			};

			void (async () => {
				try {
					const mermaid = (await import('mermaid')).default;
					const isDark = document.documentElement.classList.contains('dark');
					mermaid.initialize({
						startOnLoad: false,
						theme: 'base',
						themeVariables: getMermaidVars(isDark),
						securityLevel: 'antiscript',
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

							const langLabel = document.createElement('span');
							langLabel.className = 'code-lang-label';
							langLabel.textContent = 'mermaid';
							wrapper.appendChild(langLabel);

							const svgElement = wrapper.querySelector('svg');
							if (svgElement) {
								svgElement.style.cursor = 'zoom-in';
								svgElement.addEventListener('click', () => openLightbox(svgElement));
							}

							const actions = document.createElement('div');
							actions.className = 'diagram-actions';

							const sourceButton = createActionButton(
								COPY_ICON_SMALL,
								'copy',
								'Copy Mermaid source'
							);
							sourceButton.addEventListener('click', (event) => {
								event.stopPropagation();
								void navigator.clipboard.writeText(diagram).then(() => {
									sourceButton.innerHTML = `${CHECK_ICON_SMALL} copied`;
									showToast('copied source');
									setTimeout(() => {
										sourceButton.innerHTML = `${COPY_ICON_SMALL} copy`;
									}, 2000);
								});
							});

							const downloadButton = createActionButton(DOWNLOAD_ICON, 'svg', 'Download SVG');
							downloadButton.addEventListener('click', (event) => {
								event.stopPropagation();
								const svgNode = wrapper.querySelector('svg');
								if (!svgNode) return;
								const blob = new Blob(
									['<?xml version="1.0" encoding="UTF-8"?>\n', svgNode.outerHTML],
									{ type: 'image/svg+xml' }
								);
								const url = URL.createObjectURL(blob);
								const anchor = document.createElement('a');
								anchor.href = url;
								anchor.download = `diagram-${uid}.svg`;
								anchor.click();
								URL.revokeObjectURL(url);
								showToast('downloaded SVG');
							});

							actions.appendChild(sourceButton);
							actions.appendChild(downloadButton);
							wrapper.appendChild(actions);

							pre.replaceWith(wrapper);
						} catch (error) {
							console.warn('Mermaid render failed:', error);
						}
					}
				} catch (error) {
					console.warn('Mermaid not available:', error);
				}
			})();

			mermaidThemeObserver = new MutationObserver(() => {
				const dark = document.documentElement.classList.contains('dark');
				void reRenderAll(dark);
			});
			mermaidThemeObserver.observe(document.documentElement, {
				attributes: true,
				attributeFilter: ['class'],
			});
		}

		const headings = container.querySelectorAll('h2[id], h3[id]');
		headings.forEach((heading) => {
			if (heading.querySelector('.heading-anchor')) return;

			const anchor = document.createElement('a');
			anchor.className = 'heading-anchor';
			anchor.href = `#${heading.id}`;
			anchor.textContent = '#';
			anchor.setAttribute('aria-label', `Link to ${heading.textContent}`);
			anchor.addEventListener('click', (event) => {
				event.preventDefault();
				const url = `${window.location.origin}${window.location.pathname}#${heading.id}`;
				navigator.clipboard.writeText(url);
				heading.scrollIntoView({ behavior: 'smooth' });
				window.history.replaceState(null, '', `#${heading.id}`);
				showToast('copied permalink');
			});
			heading.appendChild(anchor);
		});

		container.querySelectorAll<HTMLImageElement>('img').forEach((img) => {
			if (img.closest('.lightbox-overlay')) return;
			if (img.dataset.zoomBound === 'true') return;
			img.dataset.zoomBound = 'true';
			img.style.cursor = 'zoom-in';
			img.addEventListener('click', () => openLightbox(img));
		});

		// Wikipedia-style Link Previews
		if (postsMeta && postsMeta.length > 0) {
			const internalLinks = container.querySelectorAll<HTMLAnchorElement>('a[href^="/blog/"]');

			let popover = document.getElementById('wiki-link-preview');
			if (!popover) {
				popover = document.createElement('div');
				popover.id = 'wiki-link-preview';
				popover.className =
					'absolute z-50 w-72 rounded-lg border border-border bg-card p-4 shadow-xl opacity-0 pointer-events-none transition-opacity duration-200';
				document.body.appendChild(popover);
			}

			internalLinks.forEach((link) => {
				const href = link.getAttribute('href');
				if (!href) return;

				// Extract the base URL without hashes
				const baseUrl = href.split('#')[0];
				if (!baseUrl) return;

				const post = postsMeta.find(
					(p) => baseUrl.toLowerCase().replace(/\/$/, '') === p.url.toLowerCase().replace(/\/$/, '')
				);
				if (!post) return;

				link.addEventListener('mouseenter', () => {
					if (previewTimeoutRef.current) {
						clearTimeout(previewTimeoutRef.current);
					}

					popover!.innerHTML = `
						<div class="space-y-2">
							<h4 class="font-semibold text-sm leading-tight text-foreground">${escapeHtml(post.title)}</h4>
							${post.description ? `<p class="text-xs text-muted-foreground line-clamp-3">${escapeHtml(post.description)}</p>` : ''}
							<div class="flex items-center gap-1.5 text-[10px] font-mono text-primary">
								<span>~${post.readingTimeMin} min read</span>
							</div>
						</div>
					`;

					popover!.style.display = 'block';

					const rect = link.getBoundingClientRect();
					let top = rect.top + window.scrollY - popover!.offsetHeight - 10;

					// Place below if not enough space above
					if (rect.top - popover!.offsetHeight < 60) {
						top = rect.bottom + window.scrollY + 10;
					}

					let left = rect.left + window.scrollX + rect.width / 2 - popover!.offsetWidth / 2;
					if (left < 10) left = 10;
					if (left + popover!.offsetWidth > window.innerWidth - 10) {
						left = window.innerWidth - popover!.offsetWidth - 10;
					}

					popover!.style.top = `${top}px`;
					popover!.style.left = `${left}px`;
					popover!.style.opacity = '1';
				});

				link.addEventListener('mouseleave', () => {
					previewTimeoutRef.current = setTimeout(() => {
						if (popover) popover.style.opacity = '0';
					}, 150);
				});
			});
		}

		return () => {
			plantUmlThemeObserver?.disconnect();
			mermaidThemeObserver?.disconnect();
			if (previewTimeoutRef.current) {
				clearTimeout(previewTimeoutRef.current);
			}
			const popover = document.getElementById('wiki-link-preview');
			popover?.remove();
		};
	}, [html, postsMeta]);

	return <div ref={containerRef} dangerouslySetInnerHTML={{ __html: html }} />;
}
