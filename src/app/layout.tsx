import type { Metadata } from 'next';
import Link from 'next/link';
import { getCategories } from '@/lib/markdown';
import { ThemeProvider, ThemeScript } from '@/components/ThemeProvider';
import ThemeToggle from '@/components/ThemeToggle';
import MobileMenu from '@/components/MobileMenu';
import ReadingProgress from '@/components/ReadingProgress';
import BackToTop from '@/components/BackToTop';
import FooterStatus from '@/components/layout/FooterStatus';
import PageTransition from '@/components/layout/PageTransition';
import { SITE_DESCRIPTION, SITE_NAME, SITE_URL } from '@/lib/site';
import './globals.css';

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
			'application/rss+xml': '/feed.xml',
		},
	},
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	const categories = getCategories();

	return (
		<html lang="en" suppressHydrationWarning>
			<body className="font-sans antialiased">
				<ThemeScript />
				<ThemeProvider>
					<ReadingProgress />
					<div className="flex min-h-screen flex-col">
						{/* Header */}
						<header className="sticky top-0 z-50 border-b border-border bg-card/70 backdrop-blur-md">
							<div className="mx-auto max-w-2xl px-4 py-3 sm:px-6">
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
										<ThemeToggle />
									</div>

									{/* Mobile Navigation */}
									<div className="flex items-center gap-2 md:hidden">
										<ThemeToggle />
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
							<div className="mx-auto max-w-2xl px-4 py-5 text-center font-mono text-xs text-muted-foreground sm:px-6">
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
