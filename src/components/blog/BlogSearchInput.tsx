'use client';

import { ForwardedRef, forwardRef } from 'react';

interface BlogSearchInputProps {
	query: string;
	activeTag: string;
	onQueryChange: (value: string) => void;
	onClear: () => void;
	isVi?: boolean;
}

function BlogSearchInput(
	{ query, activeTag, onQueryChange, onClear, isVi = false }: Readonly<BlogSearchInputProps>,
	ref: ForwardedRef<HTMLInputElement>
) {
	return (
		<div className="space-y-2">
			<div className="relative">
				<span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 select-none font-mono text-xs text-muted-foreground">
					/
				</span>
				<label htmlFor="blog-search" className="sr-only">
					{isVi ? 'Tìm kiếm bài viết' : 'Search blog articles'}
				</label>
				<input
					ref={ref}
					id="blog-search"
					type="text"
					aria-label={
						isVi
							? 'Tìm kiếm bài viết theo tiêu đề, thẻ hoặc nội dung'
							: 'Search articles by title, tags, or content'
					}
					value={query}
					onChange={(e) => onQueryChange(e.target.value)}
					placeholder={
						isVi
							? 'tìm kiếm tiêu đề, thẻ, chủ đề, nội dung...'
							: 'search title, tags, topics, content...'
					}
					autoComplete="off"
					className="w-full rounded border border-border bg-card py-2 pl-6 pr-14 font-mono text-sm text-foreground transition-colors placeholder:text-muted-foreground/60 focus:border-primary focus:outline-none"
				/>
				{(query || activeTag) && (
					<button
						onClick={onClear}
						className="absolute right-3 top-1/2 -translate-y-1/2 rounded border border-border px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground transition-colors hover:text-foreground"
						type="button"
					>
						{isVi ? 'xóa' : 'clear'}
					</button>
				)}
			</div>
			<p className="font-mono text-[10px] text-muted-foreground/70">
				{isVi ? '/ để tìm kiếm · hỗ trợ tìm kiếm toàn văn' : '/ to search · full-text enabled'}
			</p>
		</div>
	);
}

export default forwardRef(BlogSearchInput);
