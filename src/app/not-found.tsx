import type { Metadata } from 'next';
import NotFoundTerminal from '@/components/NotFoundTerminal';
import { getAllPosts, getCategories } from '@/lib/markdown';
import { createNotFoundEntries } from '@/lib/not-found-terminal';
import { SITE_NAME, SITE_URL } from '@/lib/site';
import './globals.css';

export const metadata: Metadata = {
	metadataBase: new URL(SITE_URL),
	title: `404 · ${SITE_NAME}`,
	description: 'Page not found',
};

export default function NotFound() {
	const categories = getCategories();
	const posts = getAllPosts();
	const entries = createNotFoundEntries(categories, posts);

	return (
		<html lang="en">
			<body className="min-h-screen bg-background font-sans text-foreground antialiased selection:bg-foreground selection:text-background">
				<div className="mx-auto flex min-h-screen w-full max-w-2xl flex-col items-start justify-center space-y-6 px-4 py-20">
					<NotFoundTerminal entries={entries} />
					<p className="font-mono text-xs uppercase tracking-widest text-muted-foreground/50">
						404 · page not found
					</p>
				</div>
			</body>
		</html>
	);
}
