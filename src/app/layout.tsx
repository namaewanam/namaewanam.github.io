import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import Link from 'next/link';
import { getCategories } from '@/lib/markdown';
import { ThemeProvider, ThemeScript } from '@/components/ThemeProvider';
import ThemeToggle from '@/components/ThemeToggle';
import MobileMenu from '@/components/MobileMenu';
import './globals.css';
import { CodeThemeProvider, CodeThemeScript } from '@/contexts/CodeThemeContext';
import GitHubButton from '@/components/GitHubButton';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
	title: `Nam&apos; Blog`,
	description: 'A modern blog about programming and technology',
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	const categories = getCategories();

	return (
		<html lang="en" suppressHydrationWarning>
			<body className={inter.className}>
				<ThemeScript />
				<CodeThemeScript />
				<CodeThemeProvider>
					<ThemeProvider>
						<div className="flex min-h-screen flex-col">
							{/* Header */}
							<header className="sticky top-0 z-50 border-b border-border bg-card/80 backdrop-blur-sm">
								<div className="container mx-auto px-4 py-3 md:py-4">
									<div className="flex items-center justify-between">
										<Link
											href="/"
											className="text-xl font-bold text-primary transition-colors hover:text-accent md:text-2xl"
										>
											Playground
										</Link>

										{/* Desktop Navigation */}
										<div className="hidden items-center gap-6 md:flex">
											<nav className="flex gap-6">
												<Link
													href="/"
													className="font-medium text-foreground/80 transition-colors hover:text-primary"
												>
													Home
												</Link>
												{categories.slice(0, 5).map((category) => (
													<Link
														key={category.slug}
														href={`/blog/${category.slug}`}
														className="font-medium text-foreground/80 transition-colors hover:text-primary"
													>
														{category.name.replaceAll('-', ' ')}
													</Link>
												))}
											</nav>
											<ThemeToggle />
											<GitHubButton />
										</div>

										{/* Mobile Navigation */}
										<div className="flex items-center gap-2 md:hidden">
											<ThemeToggle />
											<GitHubButton />
											<MobileMenu categories={categories} />
										</div>
									</div>
								</div>
							</header>

							{/* Main Content */}
							<main className="container mx-auto flex-1 px-4 py-6 md:py-8">{children}</main>

							{/* Footer */}
							<footer className="mt-auto border-t border-border bg-card/80 backdrop-blur-sm">
								<div className="container mx-auto px-4 py-4 text-center text-sm text-muted-foreground md:py-6 md:text-base">
									<p>
										© {new Date().getFullYear()} Nam's Blog. Built with AI & Next.js & TypeScript
									</p>
								</div>
							</footer>
						</div>
					</ThemeProvider>
				</CodeThemeProvider>
			</body>
		</html>
	);
}
