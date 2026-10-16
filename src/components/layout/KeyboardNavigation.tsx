'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useTheme } from '@/components/ThemeProvider';
import { useReadingList } from '@/lib/useReadingList';
import { openShortcutHelp } from '@/lib/shortcut-help';
import { GITHUB_REPO_OWNER, GITHUB_REPO_NAME } from '@/lib/site';
import VimCommandBar from '@/components/layout/VimCommandBar';

interface KeyboardNavigationProps {
	postPaths?: string[];
}

function isTypingField(target: EventTarget | null): boolean {
	return (
		target instanceof HTMLInputElement ||
		target instanceof HTMLTextAreaElement ||
		(target instanceof HTMLElement && target.isContentEditable) ||
		(target instanceof HTMLElement && target.closest('[role="dialog"] input')) !== null
	);
}

export default function KeyboardNavigation({ postPaths = [] }: KeyboardNavigationProps) {
	const pathname = usePathname();
	const router = useRouter();
	const isVi = pathname?.startsWith('/vi');
	const lang = isVi ? 'vi' : 'en';

	const { theme, toggleTheme } = useTheme();
	const { toggle: toggleBookmark, isBookmarked } = useReadingList();

	const [pendingKey, setPendingKey] = useState<string | null>(null);
	const [toast, setToast] = useState<string | null>(null);
	const [isCommandBarOpen, setIsCommandBarOpen] = useState(false);
	const [, setIsZenMode] = useState(false);
	const [, setFontSizeMultiplier] = useState(1);
	const [, setIsSpeaking] = useState(false);

	const timerRef = useRef<NodeJS.Timeout | null>(null);
	const toastTimerRef = useRef<NodeJS.Timeout | null>(null);

	const showToast = useCallback((msg: string) => {
		setToast(msg);
		if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
		toastTimerRef.current = setTimeout(() => {
			setToast(null);
		}, 2000);
	}, []);

	const localize = useCallback(
		(path: string) => {
			return `/${lang}${path === '/' ? '' : path}`;
		},
		[lang]
	);

	// Extract article slug from pathname if on an article page
	const currentArticleSlug = (() => {
		if (!pathname) return null;
		const match = pathname.match(/^\/(?:en|vi)\/blog\/([^/]+)\/(.+)$/);
		if (match && match[1] && match[2]) {
			return `${match[1]}/${match[2]}`;
		}
		return null;
	})();

	// Toggle Language
	const handleToggleLanguage = useCallback(() => {
		if (!pathname) return;
		let nextPath = pathname;
		if (pathname.startsWith('/vi')) {
			nextPath = pathname.replace(/^\/vi/, '/en');
		} else if (pathname.startsWith('/en')) {
			nextPath = pathname.replace(/^\/en/, '/vi');
		} else {
			nextPath = `/vi${pathname}`;
		}
		router.push(nextPath);
		showToast(`Language switched: ${nextPath.startsWith('/vi') ? 'vi' : 'en'}`);
	}, [pathname, router, showToast]);

	// Jump to Random Article
	const handleRandomArticle = useCallback(() => {
		if (postPaths.length === 0) {
			showToast('No articles found');
			return;
		}
		const randomPath = postPaths[Math.floor(Math.random() * postPaths.length)];
		if (randomPath) {
			router.push(localize(randomPath));
			showToast('Jumping to random article...');
		}
	}, [postPaths, localize, router, showToast]);

	// Toggle Zen Mode
	const handleToggleZenMode = useCallback(() => {
		setIsZenMode((prev) => {
			const next = !prev;
			if (next) {
				document.body.classList.add('zen-mode');
				showToast('Zen Mode: ON (press z to exit)');
			} else {
				document.body.classList.remove('zen-mode');
				showToast('Zen Mode: OFF');
			}
			return next;
		});
	}, [showToast]);

	// Adjust Page & Article Font Size
	const handleAdjustFontSize = useCallback(
		(deltaOrTarget: number | 'reset', isAbsolute = false) => {
			setFontSizeMultiplier((prev) => {
				let next: number;
				if (deltaOrTarget === 'reset' || deltaOrTarget === 0) {
					next = 1;
				} else if (isAbsolute) {
					next = Math.max(0.7, Math.min(1.8, Math.round(Number(deltaOrTarget) * 10) / 10));
				} else {
					next = Math.max(0.7, Math.min(1.8, Math.round((prev + Number(deltaOrTarget)) * 10) / 10));
				}

				if (typeof document !== 'undefined') {
					const percent = Math.round(next * 100);
					if (next === 1) {
						document.documentElement.style.fontSize = '';
						document.documentElement.removeAttribute('data-font-scale');
						document.documentElement.style.removeProperty('--font-scale');
						const article = (document.querySelector('article .prose') ||
							document.querySelector('article')) as HTMLElement | null;
						if (article) {
							article.style.zoom = '';
						}
						showToast('Font size reset: 100%');
					} else {
						document.documentElement.style.fontSize = `${percent}%`;
						document.documentElement.setAttribute('data-font-scale', next.toString());
						document.documentElement.style.setProperty('--font-scale', next.toString());
						const article = (document.querySelector('article .prose') ||
							document.querySelector('article')) as HTMLElement | null;
						if (article) {
							article.style.zoom = next.toString();
						}
						showToast(`Font size: ${percent}%`);
					}
				}
				return next;
			});
		},
		[showToast]
	);

	// Text-to-Speech (Audio Play/Pause)
	const handleToggleSpeech = useCallback(() => {
		if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
			showToast('Speech synthesis not supported in this browser');
			return;
		}

		if (window.speechSynthesis.speaking) {
			window.speechSynthesis.cancel();
			setIsSpeaking(false);
			showToast('⏸ Audio narration paused');
			return;
		}

		const article = document.querySelector('article');
		if (!article || !article.textContent?.trim()) {
			showToast('No article text found to read');
			return;
		}

		const textToRead = article.textContent.replace(/\s+/g, ' ').slice(0, 4000); // Read comfortable first chunk

		const utterance = new SpeechSynthesisUtterance(textToRead);
		utterance.lang = lang === 'vi' ? 'vi-VN' : 'en-US';
		utterance.rate = 1.0;
		utterance.onend = () => setIsSpeaking(false);
		utterance.onerror = () => setIsSpeaking(false);

		window.speechSynthesis.speak(utterance);
		setIsSpeaking(true);
		showToast('▶ Playing audio narration (press p to pause)');
	}, [lang, showToast]);

	// Heading Navigation (} / {)
	const handleHeadingJump = useCallback(
		(direction: 'next' | 'prev') => {
			const headings = Array.from(document.querySelectorAll('article h2, article h3'));
			if (headings.length === 0) {
				showToast('No headings in this article');
				return;
			}

			if (direction === 'next') {
				const target = headings.find((h) => h.getBoundingClientRect().top > 30);
				if (target) {
					target.scrollIntoView({ behavior: 'smooth' });
				} else {
					showToast('Already at the last heading');
				}
			} else {
				const reversed = [...headings].reverse();
				const target = reversed.find((h) => h.getBoundingClientRect().top < -30);
				if (target) {
					target.scrollIntoView({ behavior: 'smooth' });
				} else {
					window.scrollTo({ top: 0, behavior: 'smooth' });
				}
			}
		},
		[showToast]
	);

	// Code Snippet Navigation (]c / [c)
	const handleCodeSnippetJump = useCallback(
		(direction: 'next' | 'prev') => {
			const snippets = Array.from(document.querySelectorAll('article pre'));
			if (snippets.length === 0) {
				showToast('No code snippets in this article');
				return;
			}

			if (direction === 'next') {
				const target = snippets.find((s) => s.getBoundingClientRect().top > 30);
				if (target) {
					target.scrollIntoView({ behavior: 'smooth', block: 'center' });
				} else {
					showToast('Already at the last code snippet');
				}
			} else {
				const reversed = [...snippets].reverse();
				const target = reversed.find((s) => s.getBoundingClientRect().top < -30);
				if (target) {
					target.scrollIntoView({ behavior: 'smooth', block: 'center' });
				} else {
					showToast('Already at the first code snippet');
				}
			}
		},
		[showToast]
	);

	// Yank Nearest Code Block (y c)
	const handleYankNearestCode = useCallback(async () => {
		const snippets = Array.from(document.querySelectorAll('article pre'));
		if (snippets.length === 0) {
			showToast('No code snippets found');
			return;
		}

		// Find code snippet closest to viewport center
		const viewportCenter = window.innerHeight / 2;
		let closest = snippets[0];
		let minDiff = Infinity;

		snippets.forEach((snippet) => {
			const rect = snippet.getBoundingClientRect();
			const snippetCenter = rect.top + rect.height / 2;
			const diff = Math.abs(snippetCenter - viewportCenter);
			if (diff < minDiff) {
				minDiff = diff;
				closest = snippet;
			}
		});

		if (closest && closest.textContent) {
			try {
				await navigator.clipboard.writeText(closest.textContent.trim());
				showToast('✓ Nearest code block yanked (copied)!');
			} catch {
				showToast('Failed to copy code');
			}
		}
	}, [showToast]);

	// Execute Vim Ex-Command
	const handleExecuteVimCommand = useCallback(
		(rawCmd: string) => {
			const clean = rawCmd.trim();
			if (!clean) return;

			const parts = clean.split(' ');
			const cmd = parts[0]?.toLowerCase();
			const arg = parts.slice(1).join(' ').trim();

			switch (cmd) {
				case 'w':
					if (currentArticleSlug) {
						toggleBookmark(currentArticleSlug);
						const saved = isBookmarked(currentArticleSlug);
						showToast(saved ? 'Removed from reading list' : '★ Saved to reading list');
					} else {
						showToast('No article to save on this page');
					}
					break;

				case 'q':
				case 'exit':
					router.push(localize('/'));
					break;

				case 'e':
				case 'edit':
					if (!arg) {
						showToast('Usage: :e <page> (e.g. :e blog, :e stack)');
						return;
					}
					switch (arg.toLowerCase()) {
						case 'home':
							router.push(localize('/'));
							break;
						case 'blog':
							router.push(localize('/blog'));
							break;
						case 'stack':
							router.push(localize('/stack'));
							break;
						case 'adr':
							router.push(localize('/adr'));
							break;
						case 'guestbook':
							router.push(localize('/guestbook'));
							break;
						case 'now':
							router.push(localize('/now'));
							break;
						case 'changelog':
							router.push(localize('/changelog'));
							break;
						case 'editor':
							router.push(localize('/editor'));
							break;
						default:
							router.push(localize(`/${arg.replace(/^\//, '')}`));
							break;
					}
					break;

				case 'theme':
					if (arg.toLowerCase() === 'dark' || arg.toLowerCase() === 'light') {
						if (theme !== arg.toLowerCase()) toggleTheme();
						showToast(`Theme: ${arg.toLowerCase()}`);
					} else {
						toggleTheme();
						showToast(`Theme toggled to ${theme === 'dark' ? 'light' : 'dark'}`);
					}
					break;

				case 'lang':
					if (arg.toLowerCase() === 'en' || arg.toLowerCase() === 'vi') {
						if (lang !== arg.toLowerCase()) handleToggleLanguage();
					} else {
						handleToggleLanguage();
					}
					break;

				case 'zen':
					handleToggleZenMode();
					break;

				case 'words': {
					const article = document.querySelector('article');
					if (article?.textContent) {
						const words = article.textContent.trim().split(/\s+/).length;
						const estTime = Math.ceil(words / 200);
						showToast(`Article stats: ~${words} words · ~${estTime} min read`);
					} else {
						showToast('No article on this page');
					}
					break;
				}

				case 'random':
					handleRandomArticle();
					break;

				case 'source':
					if (currentArticleSlug) {
						const url = `https://github.com/${GITHUB_REPO_OWNER}/${GITHUB_REPO_NAME}/blob/main/docs/${currentArticleSlug}.md`;
						window.open(url, '_blank', 'noopener,noreferrer');
					} else {
						window.open(
							`https://github.com/${GITHUB_REPO_OWNER}/${GITHUB_REPO_NAME}`,
							'_blank',
							'noopener,noreferrer'
						);
					}
					break;

				case 'toc': {
					const toc = document.querySelector('[aria-label="Table of contents"]');
					if (toc) {
						toc.scrollIntoView({ behavior: 'smooth' });
						showToast('Scrolled to Table of Contents');
					} else {
						showToast('No Table of Contents on this page');
					}
					break;
				}

				case 'h':
				case 'help':
					openShortcutHelp();
					break;

				case 'font':
				case 'size': {
					if (!arg || arg === 'reset' || arg === '100' || arg === '100%') {
						handleAdjustFontSize(0);
					} else if (arg === '+' || arg === 'up' || arg === 'more') {
						handleAdjustFontSize(0.1);
					} else if (arg === '-' || arg === 'down' || arg === 'less') {
						handleAdjustFontSize(-0.1);
					} else {
						const parsed = parseFloat(arg.replace('%', ''));
						if (!isNaN(parsed)) {
							const scale = parsed > 5 ? parsed / 100 : parsed;
							handleAdjustFontSize(scale, true);
						} else {
							showToast('Usage: :font [+ | - | reset | 120%]');
						}
					}
					break;
				}

				default:
					showToast(`Unknown command: :${cmd}. Type :help`);
					break;
			}
		},
		[
			currentArticleSlug,
			toggleBookmark,
			isBookmarked,
			showToast,
			router,
			localize,
			theme,
			toggleTheme,
			lang,
			handleToggleLanguage,
			handleToggleZenMode,
			handleRandomArticle,
			handleAdjustFontSize,
		]
	);

	// Main Keyboard Listener
	useEffect(() => {
		function handleKeyDown(event: KeyboardEvent) {
			if (event.defaultPrevented) return;
			if (isTypingField(event.target)) return;

			// Vim Ex-Command Bar trigger: `:`
			if (event.key === ':' && !event.ctrlKey && !event.metaKey && !event.altKey) {
				event.preventDefault();
				setIsCommandBarOpen(true);
				return;
			}

			// Half-page down/up: Ctrl+d, Ctrl+u
			if (event.ctrlKey && !event.metaKey && !event.altKey) {
				if (event.key === 'd') {
					event.preventDefault();
					window.scrollBy({ top: window.innerHeight * 0.5, behavior: 'smooth' });
					return;
				}
				if (event.key === 'u') {
					event.preventDefault();
					window.scrollBy({ top: -window.innerHeight * 0.5, behavior: 'smooth' });
					return;
				}
			}

			if (event.metaKey || event.ctrlKey || event.altKey) return;

			// Handle multi-key pending sequences
			if (pendingKey === 'g') {
				if (timerRef.current) clearTimeout(timerRef.current);
				setPendingKey(null);

				switch (event.key.toLowerCase()) {
					case 'h':
						event.preventDefault();
						router.push(localize('/'));
						return;
					case 'b':
						event.preventDefault();
						router.push(localize('/blog'));
						return;
					case 's':
						event.preventDefault();
						router.push(localize('/stack'));
						return;
					case 'a':
						event.preventDefault();
						router.push(localize('/adr'));
						return;
					case 'm':
						event.preventDefault();
						router.push(localize('/guestbook'));
						return;
					case 'n':
						event.preventDefault();
						router.push(localize('/now'));
						return;
					case 'c':
						event.preventDefault();
						router.push(localize('/changelog'));
						return;
					case 'e':
						event.preventDefault();
						router.push(localize('/editor'));
						return;
					case 'g':
						event.preventDefault();
						window.scrollTo({ top: 0, behavior: 'smooth' });
						return;
					default:
						break;
				}
			}

			if (pendingKey === 'y') {
				if (timerRef.current) clearTimeout(timerRef.current);
				setPendingKey(null);

				if (event.key.toLowerCase() === 'c') {
					event.preventDefault();
					handleYankNearestCode();
					return;
				}
			}

			if (pendingKey === ']') {
				if (timerRef.current) clearTimeout(timerRef.current);
				setPendingKey(null);

				if (event.key.toLowerCase() === 'c') {
					event.preventDefault();
					handleCodeSnippetJump('next');
					return;
				}
			}

			if (pendingKey === '[') {
				if (timerRef.current) clearTimeout(timerRef.current);
				setPendingKey(null);

				if (event.key.toLowerCase() === 'c') {
					event.preventDefault();
					handleCodeSnippetJump('prev');
					return;
				}
			}

			// Single-Key Triggers & Multi-key Prefixes
			if (event.key === 'g' && !event.shiftKey) {
				event.preventDefault();
				setPendingKey('g');
				if (timerRef.current) clearTimeout(timerRef.current);
				timerRef.current = setTimeout(() => setPendingKey(null), 1500);
				return;
			}

			if (event.key === 'y' && !event.shiftKey) {
				// If not followed by 'c' within 800ms, yank current URL
				setPendingKey('y');
				if (timerRef.current) clearTimeout(timerRef.current);
				timerRef.current = setTimeout(() => {
					setPendingKey(null);
					if (typeof window !== 'undefined') {
						navigator.clipboard.writeText(window.location.href);
						showToast('✓ Page URL yanked (copied)!');
					}
				}, 600);
				return;
			}

			if (event.key === ']') {
				setPendingKey(']');
				if (timerRef.current) clearTimeout(timerRef.current);
				timerRef.current = setTimeout(() => {
					setPendingKey(null);
					const nextLink = document.getElementById('post-nav-next');
					if (nextLink) {
						nextLink.click();
					}
				}, 400);
				return;
			}

			if (event.key === '[') {
				setPendingKey('[');
				if (timerRef.current) clearTimeout(timerRef.current);
				timerRef.current = setTimeout(() => {
					setPendingKey(null);
					const prevLink = document.getElementById('post-nav-prev');
					if (prevLink) {
						prevLink.click();
					}
				}, 400);
				return;
			}

			// Shift + G (Bottom of page)
			if (event.key === 'G' && event.shiftKey) {
				event.preventDefault();
				window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
				return;
			}

			// Basic scrolling
			if (event.key === 'j') {
				event.preventDefault();
				window.scrollBy({ top: 260, behavior: 'smooth' });
				return;
			}
			if (event.key === 'k') {
				event.preventDefault();
				window.scrollBy({ top: -260, behavior: 'smooth' });
				return;
			}

			// Center Viewport: zz
			if (event.key === 'z') {
				if (pendingKey === 'z') {
					if (timerRef.current) clearTimeout(timerRef.current);
					setPendingKey(null);
					window.scrollBy({ top: 120, behavior: 'smooth' });
					showToast('zz: viewport centered');
					return;
				}
				// Set pending for zz or single z toggle for zen mode
				setPendingKey('z');
				if (timerRef.current) clearTimeout(timerRef.current);
				timerRef.current = setTimeout(() => {
					setPendingKey(null);
					handleToggleZenMode();
				}, 400);
				return;
			}

			// Next / Prev Heading: } / {
			if (event.key === '}') {
				event.preventDefault();
				handleHeadingJump('next');
				return;
			}
			if (event.key === '{') {
				event.preventDefault();
				handleHeadingJump('prev');
				return;
			}

			// Bookmark Post: m
			if (event.key === 'm') {
				if (currentArticleSlug) {
					event.preventDefault();
					toggleBookmark(currentArticleSlug);
					const saved = isBookmarked(currentArticleSlug);
					showToast(saved ? 'Removed from reading list' : '★ Saved to reading list');
				}
				return;
			}

			// Toggle Theme: t
			if (event.key === 't') {
				event.preventDefault();
				toggleTheme();
				showToast(`Theme: ${theme === 'dark' ? 'light' : 'dark'}`);
				return;
			}

			// Toggle Language: l
			if (event.key === 'l') {
				event.preventDefault();
				handleToggleLanguage();
				return;
			}

			// Random Article: r
			if (event.key === 'r') {
				event.preventDefault();
				handleRandomArticle();
				return;
			}

			// Open GitHub Repo: .
			if (event.key === '.') {
				event.preventDefault();
				const target = currentArticleSlug
					? `https://github.com/${GITHUB_REPO_OWNER}/${GITHUB_REPO_NAME}/blob/main/docs/${currentArticleSlug}.md`
					: `https://github.com/${GITHUB_REPO_OWNER}/${GITHUB_REPO_NAME}`;
				window.open(target, '_blank', 'noopener,noreferrer');
				showToast('Opening GitHub source...');
				return;
			}

			// Font Size: + / = (increase) or - / _ (decrease) or 0 (reset)
			if (
				event.key === '+' ||
				event.key === '=' ||
				event.code === 'NumpadAdd' ||
				(event.code === 'Equal' && !event.ctrlKey && !event.metaKey && !event.altKey)
			) {
				event.preventDefault();
				handleAdjustFontSize(0.1);
				return;
			}
			if (
				event.key === '-' ||
				event.key === '_' ||
				event.code === 'NumpadSubtract' ||
				(event.code === 'Minus' && !event.ctrlKey && !event.metaKey && !event.altKey)
			) {
				event.preventDefault();
				handleAdjustFontSize(-0.1);
				return;
			}
			if (
				(event.key === '0' || event.code === 'Digit0' || event.code === 'Numpad0') &&
				!pendingKey
			) {
				event.preventDefault();
				handleAdjustFontSize(0);
				return;
			}

			// Audio TTS Read-Aloud: p
			if (event.key === 'p') {
				event.preventDefault();
				handleToggleSpeech();
				return;
			}
		}

		window.addEventListener('keydown', handleKeyDown);
		return () => {
			window.removeEventListener('keydown', handleKeyDown);
			if (timerRef.current) clearTimeout(timerRef.current);
		};
	}, [
		pendingKey,
		lang,
		router,
		localize,
		theme,
		toggleTheme,
		currentArticleSlug,
		toggleBookmark,
		isBookmarked,
		showToast,
		handleToggleLanguage,
		handleRandomArticle,
		handleToggleZenMode,
		handleAdjustFontSize,
		handleToggleSpeech,
		handleHeadingJump,
		handleCodeSnippetJump,
		handleYankNearestCode,
	]);

	return (
		<>
			{/* Vim Ex-Command Bar */}
			<VimCommandBar
				isOpen={isCommandBarOpen}
				onClose={() => setIsCommandBarOpen(false)}
				onExecute={handleExecuteVimCommand}
			/>

			{/* Multi-key sequence indicator badge */}
			{pendingKey && (
				<div className="animate-in fade-in slide-in-from-bottom-2 fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-lg border border-border bg-card/95 px-3 py-1.5 font-mono text-xs text-foreground shadow-2xl backdrop-blur-md">
					<span className="flex h-2 w-2 animate-ping rounded-full bg-primary" />
					<span>
						<strong className="font-bold text-primary">{pendingKey}</strong>
						{pendingKey === 'g' && ' → [h]ome [b]log [s]tack [a]dr [m]guest [g]top'}
						{pendingKey === 'y' && ' → [c]ode / wait for URL yank'}
						{pendingKey === ']' && ' → [c]ode / wait for next post'}
						{pendingKey === '[' && ' → [c]ode / wait for prev post'}
						{pendingKey === 'z' && ' → [z]center / wait for zen mode'}
					</span>
				</div>
			)}

			{/* Toast Notification */}
			{toast && (
				<div className="animate-in fade-in slide-in-from-bottom-2 fixed bottom-6 left-6 z-50 flex items-center gap-2 rounded-lg border border-primary/50 bg-card/95 px-3.5 py-2 font-mono text-xs text-foreground shadow-2xl backdrop-blur-md">
					<span className="font-bold text-primary">»</span>
					<span>{toast}</span>
				</div>
			)}
		</>
	);
}
