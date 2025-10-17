import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import Link from 'next/link';
import { getCategories } from '@/lib/markdown';
import { ThemeProvider, ThemeScript } from '@/components/ThemeProvider'
import ThemeToggle from '@/components/ThemeToggle'
import MobileMenu from '@/components/MobileMenu'
import './globals.css';
import { CodeThemeProvider, CodeThemeScript } from '@/contexts/CodeThemeContext';
import GitHubButton from '@/components/GitHubButton';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
	title: `Nam's Blog`,
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
						<div className="min-h-screen flex flex-col">
							{/* Header */}
							<header className="border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-50">
								<div className="container mx-auto px-4 py-3 md:py-4">
									<div className="flex items-center justify-between">
										<Link
											href="/"
											className="text-xl md:text-2xl font-bold text-primary hover:text-accent transition-colors"
										>
											Playground
										</Link>

										{/* Desktop Navigation */}
										<div className="hidden md:flex items-center gap-6">
											<nav className="flex gap-6">
												<Link
													href="/"
													className="text-foreground/80 hover:text-primary transition-colors font-medium"
												>
													Home
												</Link>
												{categories.slice(0, 5).map((category) => (
													<Link
														key={category.slug}
														href={`/blog/${category.slug}`}
														className="text-foreground/80 hover:text-primary transition-colors capitalize font-medium"
													>
														{category.name.replace("-", " ")}
													</Link>
												))}
											</nav>
											<ThemeToggle />
											<GitHubButton />
										</div>

										{/* Mobile Navigation */}
										<div className="flex md:hidden items-center gap-2">
											<ThemeToggle />
											<GitHubButton />
											<MobileMenu categories={categories} />
										</div>
									</div>
								</div>
							</header>

							{/* Main Content */}
							<main className="flex-1 container mx-auto px-4 py-6 md:py-8">
								{children}
							</main>

							{/* Footer */}
							<footer className="border-t border-border bg-card/80 backdrop-blur-sm mt-auto">
								<div className="container mx-auto px-4 py-4 md:py-6 text-center text-sm md:text-base text-muted-foreground">
									<p>© {new Date().getFullYear()} Nam's Blog. Built with AI & Next.js & TypeScript</p>
								</div>
							</footer>
						</div>
					</ThemeProvider>
				</CodeThemeProvider>
			</body>
		</html>
	);
}
