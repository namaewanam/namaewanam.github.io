'use client';

import { useState } from 'react';
import { PostMetadata, slugify, buildPostPath, parsePost } from '@/lib/editor-utils';
import { fetchFileContent } from '@/lib/github';
import { PlusCircle, FileText, Search, Loader2 } from 'lucide-react';

interface PostFormProps {
	token: string | null;
	metadata: PostMetadata;
	slug: string;
	onMetadataChange: (meta: PostMetadata) => void;
	onSlugChange: (slug: string) => void;
	onFileLoad: (loaded: {
		metadata: PostMetadata;
		content: string;
		sha: string;
		path: string;
	}) => void;
	docsTree: string[];
	categories: string[];
	currentPath: string;
	isNew: boolean;
	setIsNew: (isNew: boolean) => void;
}

export default function PostForm({
	token,
	metadata,
	slug,
	onMetadataChange,
	onSlugChange,
	onFileLoad,
	docsTree,
	categories,
	currentPath,
	isNew,
	setIsNew,
}: Readonly<PostFormProps>) {
	const [searchFilter, setSearchFilter] = useState('');
	const [isLoadingFile, setIsLoadingFile] = useState(false);
	const [isCustomCategory, setIsCustomCategory] = useState(
		!categories.includes(metadata.category) && metadata.category !== ''
	);

	const handleTitleChange = (val: string) => {
		onMetadataChange({ ...metadata, title: val });
		if (isNew) {
			onSlugChange(slugify(val));
		}
	};

	const handleCategoryChange = (val: string) => {
		if (val === '__custom__') {
			setIsCustomCategory(true);
			onMetadataChange({ ...metadata, category: '' });
		} else {
			setIsCustomCategory(false);
			onMetadataChange({ ...metadata, category: val });
		}
	};

	const handleSelectExistingFile = async (filePath: string) => {
		if (!token) return;
		setIsLoadingFile(true);
		try {
			const { content, sha } = await fetchFileContent(token, filePath);
			const { metadata: parsedMeta, markdownBody } = parsePost(content);

			// Extract category and slug from path
			const parts = filePath.replace(/^docs\//, '').split('/');
			const category = parts[0] || 'Backend';
			const fileName = parts[parts.length - 1] || '';
			const cleanSlug = fileName.replace(/\.(en|vi)\.md$/, '').replace(/\.md$/, '');
			const lang = fileName.endsWith('.vi.md') ? 'vi' : 'en';

			parsedMeta.category = parsedMeta.category || category;
			parsedMeta.lang = lang;

			onSlugChange(cleanSlug);
			onFileLoad({
				metadata: parsedMeta,
				content: markdownBody,
				sha,
				path: filePath,
			});
			setIsNew(false);
		} catch (err) {
			alert(err instanceof Error ? err.message : 'Failed to load file');
		} finally {
			setIsLoadingFile(false);
		}
	};

	const filteredTree = docsTree.filter((p) =>
		p.toLowerCase().includes(searchFilter.toLowerCase().trim())
	);

	const targetPath = isNew ? buildPostPath(metadata.category, slug, metadata.lang) : currentPath;

	return (
		<div className="space-y-4 rounded-xl border border-border bg-card p-4 shadow-sm sm:p-5">
			{/* Mode Switcher */}
			<div className="flex border-b border-border pb-3">
				<div className="grid w-full grid-cols-2 gap-2 rounded-lg bg-muted/60 p-1">
					<button
						type="button"
						onClick={() => setIsNew(true)}
						className={`inline-flex items-center justify-center gap-1.5 rounded-md py-1.5 text-xs font-medium transition sm:text-sm ${
							isNew
								? 'bg-background text-foreground shadow-sm'
								: 'text-muted-foreground hover:text-foreground'
						}`}
					>
						<PlusCircle className="h-4 w-4" />
						<span>New Post</span>
					</button>
					<button
						type="button"
						onClick={() => setIsNew(false)}
						className={`inline-flex items-center justify-center gap-1.5 rounded-md py-1.5 text-xs font-medium transition sm:text-sm ${
							!isNew
								? 'bg-background text-foreground shadow-sm'
								: 'text-muted-foreground hover:text-foreground'
						}`}
					>
						<FileText className="h-4 w-4" />
						<span>Edit Existing ({docsTree.length})</span>
					</button>
				</div>
			</div>

			{/* Existing File Selector */}
			{!isNew && (
				<div className="space-y-2 rounded-lg border border-border/80 bg-background/50 p-3">
					<div className="flex items-center gap-2">
						<Search className="h-4 w-4 text-muted-foreground" />
						<input
							type="text"
							value={searchFilter}
							onChange={(e) => setSearchFilter(e.target.value)}
							placeholder="Search existing posts in docs/..."
							className="w-full bg-transparent text-xs text-foreground placeholder:text-muted-foreground focus:outline-none sm:text-sm"
						/>
					</div>

					<div className="max-h-40 divide-y divide-border/40 overflow-y-auto font-mono text-xs">
						{isLoadingFile ? (
							<div className="flex items-center justify-center gap-2 py-4 text-muted-foreground">
								<Loader2 className="h-4 w-4 animate-spin" />
								<span>Loading post content...</span>
							</div>
						) : filteredTree.length > 0 ? (
							filteredTree.map((path) => (
								<button
									key={path}
									type="button"
									onClick={() => handleSelectExistingFile(path)}
									className={`w-full truncate rounded px-2 py-1.5 text-left transition ${
										currentPath === path
											? 'bg-primary/10 font-semibold text-primary'
											: 'text-muted-foreground hover:bg-muted/60 hover:text-foreground'
									}`}
								>
									{path}
								</button>
							))
						) : (
							<div className="py-2 text-center text-muted-foreground">
								No matching markdown files found.
							</div>
						)}
					</div>
				</div>
			)}

			{/* Post Metadata Inputs */}
			<div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
				{/* Title */}
				<div className="sm:col-span-2">
					<label htmlFor="post-title" className="mb-1 block text-xs font-medium text-foreground">
						Post Title
					</label>
					<input
						id="post-title"
						type="text"
						value={metadata.title}
						onChange={(e) => handleTitleChange(e.target.value)}
						placeholder="e.g. Understanding Distributed Locks in Go"
						required
						className="w-full rounded-md border border-border bg-background px-3 py-1.5 text-xs text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none sm:text-sm"
					/>
				</div>

				{/* Category */}
				<div>
					<label htmlFor="post-category" className="mb-1 block text-xs font-medium text-foreground">
						Category
					</label>
					{isCustomCategory ? (
						<div className="flex gap-2">
							<input
								id="post-category"
								type="text"
								value={metadata.category}
								onChange={(e) => onMetadataChange({ ...metadata, category: e.target.value })}
								placeholder="Category name"
								className="w-full rounded-md border border-border bg-background px-3 py-1.5 text-xs text-foreground focus:border-primary focus:outline-none sm:text-sm"
							/>
							<button
								type="button"
								onClick={() => setIsCustomCategory(false)}
								className="rounded border border-border px-2 text-xs text-muted-foreground hover:text-foreground"
							>
								List
							</button>
						</div>
					) : (
						<select
							id="post-category"
							value={categories.includes(metadata.category) ? metadata.category : '__custom__'}
							onChange={(e) => handleCategoryChange(e.target.value)}
							className="w-full rounded-md border border-border bg-background px-3 py-1.5 text-xs text-foreground focus:border-primary focus:outline-none sm:text-sm"
						>
							{categories.map((cat) => (
								<option key={cat} value={cat}>
									{cat}
								</option>
							))}
							<option value="__custom__">+ Custom category...</option>
						</select>
					)}
				</div>

				{/* Language */}
				<div>
					<label htmlFor="post-lang" className="mb-1 block text-xs font-medium text-foreground">
						Language
					</label>
					<div className="grid grid-cols-2 gap-2">
						<button
							type="button"
							onClick={() => onMetadataChange({ ...metadata, lang: 'en' })}
							className={`rounded-md border py-1.5 text-xs font-medium transition ${
								metadata.lang === 'en'
									? 'border-primary bg-primary/10 text-primary'
									: 'border-border text-muted-foreground hover:text-foreground'
							}`}
						>
							English (.en.md)
						</button>
						<button
							type="button"
							onClick={() => onMetadataChange({ ...metadata, lang: 'vi' })}
							className={`rounded-md border py-1.5 text-xs font-medium transition ${
								metadata.lang === 'vi'
									? 'border-primary bg-primary/10 text-primary'
									: 'border-border text-muted-foreground hover:text-foreground'
							}`}
						>
							Tiếng Việt (.vi.md)
						</button>
					</div>
				</div>

				{/* Slug */}
				<div>
					<label htmlFor="post-slug" className="mb-1 block text-xs font-medium text-foreground">
						Slug / Filename
					</label>
					<input
						id="post-slug"
						type="text"
						value={slug}
						onChange={(e) => onSlugChange(slugify(e.target.value))}
						placeholder="slug-name"
						className="w-full rounded-md border border-border bg-background px-3 py-1.5 font-mono text-xs text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none sm:text-sm"
					/>
				</div>

				{/* Date */}
				<div>
					<label htmlFor="post-date" className="mb-1 block text-xs font-medium text-foreground">
						Date
					</label>
					<input
						id="post-date"
						type="date"
						value={metadata.date}
						onChange={(e) => onMetadataChange({ ...metadata, date: e.target.value })}
						className="w-full rounded-md border border-border bg-background px-3 py-1.5 text-xs text-foreground focus:border-primary focus:outline-none sm:text-sm"
					/>
				</div>

				{/* Tags */}
				<div className="sm:col-span-2">
					<label htmlFor="post-tags" className="mb-1 block text-xs font-medium text-foreground">
						Tags (comma-separated)
					</label>
					<input
						id="post-tags"
						type="text"
						value={metadata.tags.join(', ')}
						onChange={(e) =>
							onMetadataChange({
								...metadata,
								tags: e.target.value
									.split(',')
									.map((t) => t.trim())
									.filter(Boolean),
							})
						}
						placeholder="backend, redis, distributed-systems"
						className="w-full rounded-md border border-border bg-background px-3 py-1.5 text-xs text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none sm:text-sm"
					/>
				</div>

				{/* Description */}
				<div className="sm:col-span-2">
					<label htmlFor="post-desc" className="mb-1 block text-xs font-medium text-foreground">
						Description / Summary
					</label>
					<input
						id="post-desc"
						type="text"
						value={metadata.description}
						onChange={(e) => onMetadataChange({ ...metadata, description: e.target.value })}
						placeholder="Brief summary shown on post cards and SEO"
						className="w-full rounded-md border border-border bg-background px-3 py-1.5 text-xs text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none sm:text-sm"
					/>
				</div>
			</div>

			{/* Target File Path Preview */}
			<div className="flex items-center justify-between rounded-md bg-muted/50 px-3 py-2 text-[11px] sm:text-xs">
				<span className="text-muted-foreground">Target path:</span>
				<span className="max-w-[280px] truncate font-mono font-medium text-foreground sm:max-w-md">
					{targetPath}
				</span>
			</div>
		</div>
	);
}
