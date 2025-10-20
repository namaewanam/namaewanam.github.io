'use client';

import Link from 'next/link';
import MarkdownContent from '@/components/MarkdownContent';
import CodeThemeSelector from '@/components/CodeThemeSelector';
import { ChevronLeft, ChevronRight } from 'lucide-react';

type Post = {
	slug: string;
	title: string;
	date?: string;
	description?: string;
	categoryName: string;
	subcategory?: string;
	content: string;
	fullPath: string;
};

type AdjacentPosts = {
	previous: Post | null;
	next: Post | null;
};

export default function PostLayout({
	post,
	adjacentPosts,
}: Readonly<{
	post: Post;
	adjacentPosts?: AdjacentPosts;
}>) {
	return (
		<div className="mx-auto max-w-4xl space-y-6 md:space-y-8">
			{/* Breadcrumb */}
			<nav className="flex items-center space-x-2 overflow-x-auto text-xs text-muted-foreground md:text-sm">
				<Link href="/" className="whitespace-nowrap transition-colors hover:text-primary">
					Home
				</Link>
				<span>/</span>
				<Link
					href={`/blog/${post.categoryName.toLowerCase()}`}
					className="whitespace-nowrap capitalize transition-colors hover:text-primary"
				>
					{post.categoryName.replace(/-/g, ' ')}
				</Link>
				{post.subcategory && (
					<>
						<span>/</span>
						<span className="whitespace-nowrap capitalize text-foreground/70">
							{post.subcategory.split('/').join(' / ').replace(/-/g, ' ')}
						</span>
					</>
				)}
				<span>/</span>
				<span className="truncate text-foreground">{post.title}</span>
			</nav>

			{/* Post Header */}
			<header className="space-y-3 border-b border-border pb-6 md:space-y-4 md:pb-8">
				<div className="flex flex-wrap items-center gap-2 md:gap-3">
					<span className="rounded-full border border-primary/30 bg-primary/10 px-2 py-1 text-xs font-medium capitalize text-primary md:px-3 md:text-sm">
						{post.categoryName.replace(/-/g, ' ')}
					</span>
					{post.subcategory && (
						<span className="rounded-full border border-accent/30 bg-accent/10 px-2 py-1 text-xs font-medium capitalize text-accent md:px-3 md:text-sm">
							{post.subcategory.split('/').pop()?.replace(/-/g, ' ')}
						</span>
					)}
					{post.date && (
						<span className="text-xs text-muted-foreground md:text-sm">
							{new Date(post.date).toLocaleDateString('en-US', {
								year: 'numeric',
								month: 'long',
								day: 'numeric',
							})}
						</span>
					)}
				</div>
				<h1 className="text-3xl font-bold capitalize leading-tight text-foreground md:text-4xl lg:text-5xl">
					{post.title}
				</h1>
				{post.description && (
					<p className="text-lg text-muted-foreground md:text-xl">{post.description}</p>
				)}
			</header>

			{/* Post Content with Theme Selector */}
			<article className="pb-8 md:pb-12">
				<div className="mb-4 flex justify-end">
					<CodeThemeSelector />
				</div>
				<MarkdownContent content={post.content} />
			</article>

			{/* Navigation: Previous/Next Posts */}
			{adjacentPosts && (adjacentPosts.previous || adjacentPosts.next) && (
				<nav className="border-b border-t border-border py-6 md:py-8">
					<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
						{/* Previous Post */}
						<div className="flex">
							{adjacentPosts.previous ? (
								<Link
									href={`/blog/${post.categoryName.toLowerCase()}/${adjacentPosts.previous.fullPath}`}
									className="group flex w-full items-start gap-3 rounded-lg border border-border bg-card p-4 transition-all hover:border-primary hover:shadow-md"
								>
									<ChevronLeft className="mt-1 h-5 w-5 flex-shrink-0 text-primary transition-transform group-hover:-translate-x-1" />
									<div className="min-w-0 flex-1">
										<div className="mb-1 text-xs text-muted-foreground md:text-sm">Previous</div>
										<div className="line-clamp-2 text-sm font-semibold text-foreground group-hover:text-primary md:text-base">
											{adjacentPosts.previous.title}
										</div>
									</div>
								</Link>
							) : (
								<div className="w-full" />
							)}
						</div>

						{/* Next Post */}
						<div className="flex justify-end">
							{adjacentPosts.next ? (
								<Link
									href={`/blog/${post.categoryName.toLowerCase()}/${adjacentPosts.next.fullPath}`}
									className="group flex w-full items-start gap-3 rounded-lg border border-border bg-card p-4 text-right transition-all hover:border-primary hover:shadow-md"
								>
									<div className="min-w-0 flex-1">
										<div className="mb-1 text-xs text-muted-foreground md:text-sm">Next</div>
										<div className="line-clamp-2 text-sm font-semibold text-foreground group-hover:text-primary md:text-base">
											{adjacentPosts.next.title}
										</div>
									</div>
									<ChevronRight className="mt-1 h-5 w-5 flex-shrink-0 text-primary transition-transform group-hover:translate-x-1" />
								</Link>
							) : (
								<div className="w-full" />
							)}
						</div>
					</div>
				</nav>
			)}

			{/* Back Button */}
			<div className="border-t border-border pt-6 md:pt-8">
				<Link
					href={`/blog/${post.categoryName.toLowerCase()}`}
					className="inline-flex items-center text-sm font-medium text-primary transition-colors hover:text-accent md:text-base"
				>
					<svg
						className="mr-2 h-4 w-4 md:h-5 md:w-5"
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
					Back to {post.categoryName.replace(/-/g, ' ')}
				</Link>
			</div>
		</div>
	);
}
