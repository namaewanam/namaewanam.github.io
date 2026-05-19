import NotFoundTerminal from '@/components/NotFoundTerminal';
import { getAllPosts, getCategories } from '@/lib/markdown';
import { createNotFoundEntries } from '@/lib/not-found-terminal';

export default function NotFound() {
	const categories = getCategories();
	const posts = getAllPosts();
	const entries = createNotFoundEntries(categories, posts);

	return (
		<div className="mx-auto flex w-full max-w-2xl flex-col items-start justify-center space-y-6 py-20">
			<NotFoundTerminal entries={entries} />
			<p className="font-mono text-xs uppercase tracking-widest text-muted-foreground/50">
				404 · page not found
			</p>
		</div>
	);
}
