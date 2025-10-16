'use client';

import Link from 'next/link';
import MarkdownContent from '@/components/MarkdownContent';
import CodeThemeSelector from '@/components/CodeThemeSelector';

type Post = {
	slug: string;
	title: string;
	date?: string;
	description?: string;
	categoryName: string;
	content: string;
};

export default function PostLayout({ post }: Readonly<{ post: Post }>) {
	return (
		<div className="max-w-4xl mx-auto space-y-6 md:space-y-8">
			{/* Breadcrumb */}
			<nav className="flex items-center space-x-2 text-xs md:text-sm text-muted-foreground overflow-x-auto">
				<Link href="/" className="hover:text-primary transition-colors whitespace-nowrap">
					Home
				</Link>
				<span>/</span>
				<Link
					href={`/blog/${post.categoryName.toLowerCase()}`}
					className="hover:text-primary transition-colors capitalize whitespace-nowrap"
				>
					{post.categoryName.replace(/-/g, " ")}
				</Link>
				<span>/</span>
				<span className="text-foreground truncate">{post.title}</span>
			</nav>

			{/* Post Header */}
			<header className="space-y-3 md:space-y-4 pb-6 md:pb-8 border-b border-border">
				<div className="flex flex-wrap items-center gap-2 md:gap-3">
					<span className="px-2 md:px-3 py-1 text-xs md:text-sm rounded-full bg-primary/10 text-primary border border-primary/30 capitalize font-medium">
						{post.categoryName.replace(/-/g, " ")}
					</span>
					{post.date && (
						<span className="text-xs md:text-sm text-muted-foreground">
							{new Date(post.date).toLocaleDateString('en-US', {
								year: 'numeric',
								month: 'long',
								day: 'numeric',
							})}
						</span>
					)}
				</div>
				<h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground capitalize leading-tight">
					{post.title}
				</h1>
				{post.description && (
					<p className="text-lg md:text-xl text-muted-foreground">{post.description}</p>
				)}
			</header>

			{/* Post Content with Theme Selector */}
			<article className="pb-8 md:pb-12">
				<div className="flex justify-end mb-4">
					<CodeThemeSelector />
				</div>
				<MarkdownContent content={post.content} />
			</article>

			{/* Back Button */}
			<div className="pt-6 md:pt-8 border-t border-border">
				<Link
					href={`/blog/${post.categoryName.toLowerCase()}`}
					className="inline-flex items-center text-sm md:text-base text-primary hover:text-accent transition-colors font-medium"
				>
					<svg
						className="w-4 h-4 md:w-5 md:h-5 mr-2"
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
					>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth={2}
							d="M10 19l-7-7m0 0l7-7m-7 7h18"
						/>
					</svg>
					Back to {post.categoryName.replace(/-/g, " ")}
				</Link>
			</div>
		</div>
	);
}
