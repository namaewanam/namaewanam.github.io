'use client';

import { useState, useEffect } from 'react';
import Link from '@/components/LocalizedLink';
import { Bookmark, X } from 'lucide-react';
import { useReadingList } from '@/lib/useReadingList';

interface PostMeta {
	slug: string;
	title: string;
	category: string;
	categoryName: string;
	fullPath: string;
	date?: string | undefined;
	readingTimeMin: number;
}

export default function ReadingListClient({
	posts,
	lang,
}: Readonly<{ posts: PostMeta[]; lang?: string }>) {
	const [mounted, setMounted] = useState(false);
	const { bookmarks, toggle } = useReadingList();
	const isVi = lang === 'vi';

	useEffect(() => {
		setMounted(true);
	}, []);

	if (!mounted) {
		return (
			<div className="py-16 text-center font-mono text-xs text-muted-foreground/60">
				{isVi ? 'đang tải bài viết đã lưu...' : 'loading saved posts...'}
			</div>
		);
	}

	const savedPosts = posts.filter((p) => bookmarks.includes(`${p.category}/${p.fullPath}`));

	if (savedPosts.length === 0) {
		return (
			<div className="flex flex-col items-center gap-4 rounded-xl border border-dashed border-border/80 bg-card/30 px-6 py-16 text-center">
				<div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
					<Bookmark className="h-6 w-6" aria-hidden="true" />
				</div>
				<div className="space-y-1">
					<p className="text-sm font-medium text-foreground">
						{isVi ? 'Chưa có bài viết nào được lưu' : 'No saved posts yet'}
					</p>
					<p className="max-w-xs text-xs text-muted-foreground">
						{isVi
							? 'Nhấn biểu tượng đánh dấu ở bất kỳ bài viết nào để lưu và đọc lại tại đây.'
							: 'Click the bookmark icon on any article to save it here for later.'}
					</p>
				</div>
				<Link
					href="/blog"
					className="mt-2 inline-flex min-h-[40px] items-center justify-center rounded border border-border px-4 py-2 font-mono text-xs text-muted-foreground transition-all hover:border-primary hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
				>
					{isVi ? 'Khám phá bài viết →' : 'Browse articles →'}
				</Link>
			</div>
		);
	}

	return (
		<div className="divide-y divide-border">
			{savedPosts.map((post) => (
				<div key={`${post.category}-${post.slug}`} className="flex items-start gap-3 py-3">
					<Link
						href={`/blog/${post.category}/${post.fullPath}`}
						className="group flex-1 space-y-0.5"
					>
						<span className="block text-sm text-foreground transition-colors group-hover:text-primary">
							{post.title}
						</span>
						<span className="flex items-center gap-2 font-mono text-[10px] text-muted-foreground">
							<span>/{post.categoryName.toLowerCase()}</span>
							{post.date && (
								<>
									<span>·</span>
									<span>
										{new Date(post.date).toLocaleDateString('en-US', {
											month: 'short',
											year: 'numeric',
										})}
									</span>
								</>
							)}
							<span>·</span>
							<span>~{post.readingTimeMin} min</span>
						</span>
					</Link>
					<button
						type="button"
						onClick={() => toggle(`${post.category}/${post.fullPath}`)}
						className="mt-1 inline-flex min-h-[36px] min-w-[36px] items-center justify-center rounded border border-border p-2 text-muted-foreground transition-all hover:border-red-500/50 hover:text-red-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
						aria-label={`Remove ${post.title} from reading list`}
					>
						<X className="h-3 w-3" />
					</button>
				</div>
			))}
		</div>
	);
}
