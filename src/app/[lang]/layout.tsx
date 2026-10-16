import { Locale } from '@/lib/i18n/translations';
import { i18n } from '@/lib/i18n/server';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import type { Metadata } from 'next';
import { IBM_Plex_Sans, JetBrains_Mono } from 'next/font/google';
import Link from '@/components/LocalizedLink';
import { getAllPosts, getCategories } from '@/lib/markdown';
import { ThemeProvider, ThemeScript } from '@/components/ThemeProvider';
import ThemeToggle from '@/components/ThemeToggle';
import MobileMenu from '@/components/MobileMenu';
import ReadingProgress from '@/components/ReadingProgress';
import BackToTop from '@/components/BackToTop';
import WebVitals from '@/components/WebVitals';
import CommandPaletteButton from '@/components/layout/CommandPaletteButton';
import FooterStatus from '@/components/layout/FooterStatus';
import GlobalCommandPalette from '@/components/layout/GlobalCommandPalette';
import PageTransition from '@/components/layout/PageTransition';
import ShortcutHelp from '@/components/layout/ShortcutHelp';
import KeyboardNavigation from '@/components/layout/KeyboardNavigation';
import type { CommandPaletteItem } from '@/lib/command-palette';
import { features } from '@/lib/features';
import Analytics from '@/components/analytics/Analytics';
import { FEED_PATHS } from '@/lib/feed-paths';
import {
	buildMailtoHref,
	getFeaturedPosts,
	RESUME_URL,
	SITE_DESCRIPTION,
	SITE_NAME,
	SITE_URL,
} from '@/lib/site';
import '../globals.css';

const sans = IBM_Plex_Sans({
	subsets: ['latin'],
	weight: ['400', '600'],
	display: 'swap',
	variable: '--font-sans',
});

const mono = JetBrains_Mono({
	subsets: ['latin'],
	weight: ['400', '500', '600', '700'],
	display: 'swap',
	variable: '--font-mono',
});

export const metadata: Metadata = {
	title: `${SITE_NAME} · backend dev`,
	description: SITE_DESCRIPTION,
	metadataBase: new URL(SITE_URL),
	keywords: ['backend', 'developer', 'golang', 'java', 'spring boot', 'engineering'],
	openGraph: {
		title: `${SITE_NAME} · backend dev`,
		description: SITE_DESCRIPTION,
		siteName: SITE_NAME,
		type: 'website',
		url: '/',
		images: [
			{
				url: `${SITE_URL}/opengraph-image`,
				width: 1200,
				height: 630,
				alt: SITE_NAME,
			},
		],
	},
	twitter: {
		card: 'summary_large_image',
		title: `${SITE_NAME} · backend dev`,
		description: SITE_DESCRIPTION,
		images: [`${SITE_URL}/opengraph-image`],
	},
	alternates: {
		canonical: '/',
		languages: {
			en: '/en',
			vi: '/vi',
			'x-default': '/en',
		},
		types: {
			'application/rss+xml': FEED_PATHS.rss,
			'application/atom+xml': FEED_PATHS.atom,
			'application/feed+json': FEED_PATHS.json,
		},
	},
	verification: {
		google: 'OzYwJVC2pmlxYSycufnEWK1nNSL4YPvFlaTa4RdGfZU',
	},
};

export function generateStaticParams() {
	return [{ lang: 'en' }, { lang: 'vi' }];
}

export default async function RootLayout({
	children,
	params,
}: Readonly<{
	children: React.ReactNode;
	params: Promise<{ lang: string }>;
}>) {
	const resolvedParams = await params;
	const rawLang = resolvedParams?.lang;
	const lang: Locale = i18n.locales.includes(rawLang as Locale)
		? (rawLang as Locale)
		: i18n.defaultLocale;
	const posts = getAllPosts(lang);
	const categories = getCategories();
	const featuredPosts = getFeaturedPosts(posts);
	const debugWebVitals = process.env.NEXT_PUBLIC_DEBUG_WEB_VITALS === '1';
	const enableWebVitals =
		features.webVitals && (process.env.NODE_ENV === 'production' || debugWebVitals);
	const commandPaletteItems: CommandPaletteItem[] = [
		{
			id: 'home',
			label: '~/',
			href: '/',
			section: 'jump' as const,
			description: 'home, hero, contact, recent writing',
			keywords: ['home', 'about', 'contact'],
		},
		{
			id: 'blog',
			label: '/blog',
			href: '/blog',
			section: 'jump' as const,
			description: 'all articles and search',
			keywords: ['writing', 'posts', 'articles'],
		},
		...(features.stack
			? [
					{
						id: 'stack',
						label: '/stack',
						href: '/stack',
						section: 'jump' as const,
						description: 'tools, defaults, and current rabbit holes',
						keywords: ['tech stack', 'tools'],
					},
				]
			: []),
		{
			id: 'contact',
			label: '/#contact',
			href: '/#contact',
			section: 'jump' as const,
			description: 'email, socials, and copyable handles',
			keywords: ['mail', 'linkedin', 'discord'],
		},
		{
			id: 'resume',
			label: 'resume ↗',
			href: RESUME_URL,
			section: 'jump' as const,
			description: 'latest PDF resume',
			keywords: ['cv', 'pdf'],
			external: true,
		},
		{
			id: 'recruiter',
			label: 'recruiter mail',
			href: buildMailtoHref('recruiter'),
			section: 'jump' as const,
			description: 'backend / systems / platform roles',
			keywords: ['hiring', 'roles', 'opportunity'],
			external: true,
		},
		...(features.snippets
			? [
					{
						id: 'snippets',
						label: '/snippets',
						href: '/snippets',
						section: 'jump' as const,
						description: 'code snippets and patterns',
						keywords: ['snippets', 'code', 'boilerplates'],
					},
				]
			: []),
		...(features.adr
			? [
					{
						id: 'adr',
						label: '/adr',
						href: '/adr',
						section: 'jump' as const,
						description: 'architecture decision records',
						keywords: ['adr', 'architecture', 'decisions'],
					},
				]
			: []),
		...(features.nowPage
			? [
					{
						id: 'now',
						label: '/now',
						href: '/now',
						section: 'jump' as const,
						description: 'what I am doing right now',
						keywords: ['now', 'status', 'current'],
					},
				]
			: []),
		...(features.changelog
			? [
					{
						id: 'changelog',
						label: '/changelog',
						href: '/changelog',
						section: 'jump' as const,
						description: 'site updates and commits',
						keywords: ['changelog', 'commits', 'updates'],
					},
				]
			: []),
		...(features.readingList
			? [
					{
						id: 'reading-list',
						label: '/reading-list',
						href: '/reading-list',
						section: 'jump' as const,
						description: 'saved bookmarks for later',
						keywords: ['bookmarks', 'saved', 'reading list'],
					},
				]
			: []),
		{
			id: 'guestbook',
			label: '/guestbook',
			href: '/guestbook',
			section: 'jump' as const,
			description: 'interactive terminal guestbook',
			keywords: ['guestbook', 'terminal', 'sign', 'feedback', 'cli'],
		},
		...(features.tagsBrowsing
			? [
					{
						id: 'tags',
						label: '/blog/tags',
						href: '/blog/tags',
						section: 'jump' as const,
						description: 'browse all tags',
						keywords: ['tags', 'categories', 'browse'],
					},
				]
			: []),
		...categories.map((category) => ({
			id: `topic-${category.slug}`,
			label: `/${category.slug}`,
			href: `/blog/${category.slug}`,
			section: 'topics' as const,
			description: category.description,
			meta: `${category.count} ${category.count === 1 ? 'post' : 'posts'}`,
			keywords: ['category', category.name, category.slug],
		})),
		...featuredPosts.map((post) => ({
			id: `featured-${post.category}-${post.fullPath}`,
			label: post.title,
			href: `/blog/${post.category}/${post.fullPath}`,
			section: 'featured' as const,
			description: post.description ?? `${post.categoryName} featured writeup`,
			meta: `/${post.category}`,
			keywords: ['featured', post.categoryName, ...(post.tags ?? [])],
		})),
		...categories
			.filter((category) => category.startHere)
			.map((category) => {
				const startHere = category.startHere!;
				return {
					id: `start-${category.slug}`,
					label: `${category.name} start here`,
					href: `/blog/${category.slug}/${startHere.fullPath}`,
					section: 'series' as const,
					description: startHere.title,
					meta: `/${category.slug}`,
					keywords: ['start here', 'series', category.name, category.slug],
				};
			}),
	];

	return (
		<html
			lang={resolvedParams?.lang || 'en'}
			suppressHydrationWarning
			className={`${sans.variable} ${mono.variable} antialiased`}
		>
			<body suppressHydrationWarning className="font-sans antialiased">
				<ThemeScript />

				<ThemeProvider>
					{enableWebVitals ? <WebVitals debug={debugWebVitals} /> : null}
					{features.commandPalette && <GlobalCommandPalette items={commandPaletteItems} />}
					{features.shortcutHelp && <ShortcutHelp />}
					<KeyboardNavigation />
					{features.readingProgress && <ReadingProgress />}
					<div className="flex min-h-screen flex-col">
						{/* Header */}
						<header className="sticky top-0 z-50 border-b border-border bg-card/70 backdrop-blur-md">
							<div className="mx-auto max-w-3xl px-4 py-3 sm:px-6">
								<div className="flex items-center justify-between">
									{/* Logo */}
									<Link
										href="/"
										className="font-mono text-sm font-bold tracking-tight text-foreground transition-colors hover:text-primary"
									>
										<span className="text-primary">~/</span>nam
									</Link>

									{/* Desktop Navigation */}
									<div className="hidden items-center gap-6 md:flex">
										<nav className="flex gap-5">
											<Link
												href="/"
												className="text-sm text-muted-foreground transition-colors hover:text-foreground"
											>
												home
											</Link>
											<Link
												href="/blog"
												className="text-sm text-muted-foreground transition-colors hover:text-foreground"
											>
												blog
											</Link>
										</nav>
										{features.commandPalette && <CommandPaletteButton />}
										<ThemeToggle />
										{features.i18n && <LanguageSwitcher />}
									</div>

									{/* Mobile Navigation */}
									<div className="flex items-center gap-2 md:hidden">
										{features.i18n && <LanguageSwitcher />}
										<ThemeToggle />
										{features.commandPalette && <CommandPaletteButton shortLabel />}
										<MobileMenu categories={categories} />
									</div>
								</div>
							</div>
						</header>

						{/* Main Content */}
						<main className="w-full flex-1 px-4 py-8 sm:px-6 md:py-12">
							<PageTransition>{children}</PageTransition>
						</main>

						{/* Footer */}
						<footer className="mt-auto border-t border-border">
							<div className="mx-auto max-w-3xl px-4 py-5 text-center font-mono text-xs text-muted-foreground sm:px-6">
								<FooterStatus lang={lang as Locale} />
							</div>
						</footer>
					</div>
					{features.backToTop && <BackToTop />}
				</ThemeProvider>
				<Analytics />
			</body>
		</html>
	);
}
