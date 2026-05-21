import type { Metadata } from 'next';
import { IBM_Plex_Sans, JetBrains_Mono } from 'next/font/google';
import Link from 'next/link';
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
import type { CommandPaletteItem } from '@/lib/command-palette';
import { FEED_PATHS } from '@/lib/feed-paths';
import {
	buildMailtoHref,
	getFeaturedPosts,
	RESUME_URL,
	SITE_DESCRIPTION,
	SITE_NAME,
	SITE_URL,
} from '@/lib/site';
import './globals.css';

const sans = IBM_Plex_Sans({
	subsets: ['latin'],
	weight: ['400', '500', '600', '700'],
	display: 'swap',
	variable: '--font-sans',
});

const mono = JetBrains_Mono({
	subsets: ['latin'],
	weight: ['400', '500', '700'],
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
	},
	twitter: {
		card: 'summary_large_image',
		title: `${SITE_NAME} · backend dev`,
		description: SITE_DESCRIPTION,
	},
	alternates: {
		types: {
			'application/rss+xml': FEED_PATHS.rss,
			'application/atom+xml': FEED_PATHS.atom,
			'application/feed+json': FEED_PATHS.json,
		},
	},
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	const posts = getAllPosts();
	const categories = getCategories();
	const featuredPosts = getFeaturedPosts(posts);
	const debugWebVitals = process.env.NEXT_PUBLIC_DEBUG_WEB_VITALS === '1';
	const enableWebVitals = process.env.NODE_ENV === 'production' || debugWebVitals;
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
		{
			id: 'stack',
			label: '/stack',
			href: '/stack',
			section: 'jump' as const,
			description: 'tools, defaults, and current rabbit holes',
			keywords: ['tech stack', 'tools'],
		},
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
		<html lang="en" suppressHydrationWarning className={`${sans.variable} ${mono.variable}`}>
			<body suppressHydrationWarning className="font-sans antialiased">
				<ThemeScript />
				<ThemeProvider>
					{enableWebVitals ? <WebVitals debug={debugWebVitals} /> : null}
					<GlobalCommandPalette items={commandPaletteItems} />
					<ShortcutHelp />
					<ReadingProgress />
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
										<CommandPaletteButton />
										<ThemeToggle />
									</div>

									{/* Mobile Navigation */}
									<div className="flex items-center gap-2 md:hidden">
										<ThemeToggle />
										<CommandPaletteButton shortLabel />
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
								<FooterStatus />
							</div>
						</footer>
					</div>
					<BackToTop />
				</ThemeProvider>
			</body>
		</html>
	);
}
