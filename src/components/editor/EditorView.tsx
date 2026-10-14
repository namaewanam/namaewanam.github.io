'use client';

import { useState, useEffect, useRef } from 'react';
import { PostMetadata, slugify, buildPostPath, serializePost } from '@/lib/editor-utils';
import { GitHubUser, verifyGitHubToken, fetchDocsTree, commitFile } from '@/lib/github';
import TokenManager from './TokenManager';
import PostForm from './PostForm';
import MarkdownToolbar from './MarkdownToolbar';
import MarkdownPreview from './MarkdownPreview';
import {
	Send,
	Save,
	Eye,
	Edit3,
	FileCode,
	ExternalLink,
	CheckCircle2,
	AlertTriangle,
	Loader2,
} from 'lucide-react';

const DRAFT_STORAGE_KEY = 'blog_editor_draft_v1';

const INITIAL_METADATA: PostMetadata = {
	title: '',
	date: new Date().toISOString().split('T')[0] ?? '',
	category: 'Backend',
	tags: [],
	description: '',
	lang: 'en',
};

interface EditorViewProps {
	initialCategories?: string[];
}

export default function EditorView({ initialCategories = [] }: Readonly<EditorViewProps>) {
	const [token, setToken] = useState<string | null>(null);
	const [user, setUser] = useState<GitHubUser | null>(null);
	const [docsTree, setDocsTree] = useState<string[]>([]);

	const [isNew, setIsNew] = useState(true);
	const [metadata, setMetadata] = useState<PostMetadata>(INITIAL_METADATA);
	const [slug, setSlug] = useState('');
	const [content, setContent] = useState('');
	const [currentSha, setCurrentSha] = useState<string | undefined>(undefined);
	const [currentPath, setCurrentPath] = useState('');

	const [activeTab, setActiveTab] = useState<'write' | 'preview' | 'raw'>('write');
	const [lastSaved, setLastSaved] = useState<string | null>(null);
	const [hasUnsavedDraft, setHasUnsavedDraft] = useState(false);

	// Publishing state
	const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);
	const [commitMessage, setCommitMessage] = useState('');
	const [isPublishing, setIsPublishing] = useState(false);
	const [publishSuccess, setPublishSuccess] = useState<{
		commitSha: string;
		commitUrl: string;
	} | null>(null);
	const [publishError, setPublishError] = useState<string | null>(null);

	const textareaRef = useRef<HTMLTextAreaElement | null>(null);

	// Initial token load & verification
	useEffect(() => {
		const storedToken = localStorage.getItem('blog_editor_gh_token');
		if (storedToken) {
			setToken(storedToken);
			verifyGitHubToken(storedToken)
				.then(({ user }) => {
					setUser(user);
					return fetchDocsTree(storedToken);
				})
				.then((tree) => {
					setDocsTree(tree);
				})
				.catch((err) => {
					console.warn('Initial token validation failed:', err);
					setToken(null);
					localStorage.removeItem('blog_editor_gh_token');
				});
		}

		// Check for existing draft
		const savedDraft = localStorage.getItem(DRAFT_STORAGE_KEY);
		if (savedDraft) {
			try {
				const parsed = JSON.parse(savedDraft);
				if (parsed.content || parsed.metadata?.title) {
					setHasUnsavedDraft(true);
				}
			} catch {
				// ignore
			}
		}
	}, []);

	// Refresh tree when token changes
	useEffect(() => {
		if (token) {
			fetchDocsTree(token)
				.then(setDocsTree)
				.catch((err) => console.error('Failed to load docs tree:', err));
		} else {
			setDocsTree([]);
		}
	}, [token]);

	// Auto-save draft every 3 seconds if dirty
	useEffect(() => {
		if (!content && !metadata.title) return;

		const timer = setTimeout(() => {
			const draft = {
				isNew,
				metadata,
				slug,
				content,
				currentSha,
				currentPath,
				savedAt: new Date().toLocaleTimeString(),
			};
			localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(draft));
			setLastSaved(draft.savedAt);
		}, 3000);

		return () => clearTimeout(timer);
	}, [content, metadata, slug, isNew, currentSha, currentPath]);

	const restoreDraft = () => {
		const savedDraft = localStorage.getItem(DRAFT_STORAGE_KEY);
		if (!savedDraft) return;
		try {
			const parsed = JSON.parse(savedDraft);
			if (parsed.metadata) setMetadata(parsed.metadata);
			if (parsed.slug) setSlug(parsed.slug);
			if (parsed.content) setContent(parsed.content);
			if (parsed.isNew !== undefined) setIsNew(parsed.isNew);
			if (parsed.currentSha) setCurrentSha(parsed.currentSha);
			if (parsed.currentPath) setCurrentPath(parsed.currentPath);
			setHasUnsavedDraft(false);
		} catch (err) {
			console.error('Failed to parse draft:', err);
		}
	};

	const discardDraft = () => {
		localStorage.removeItem(DRAFT_STORAGE_KEY);
		setHasUnsavedDraft(false);
	};

	const handleFileLoad = (loaded: {
		metadata: PostMetadata;
		content: string;
		sha: string;
		path: string;
	}) => {
		setMetadata(loaded.metadata);
		setContent(loaded.content);
		setCurrentSha(loaded.sha);
		setCurrentPath(loaded.path);
		const parts = loaded.path.replace(/^docs\//, '').split('/');
		const fileName = parts[parts.length - 1] || '';
		setSlug(fileName.replace(/\.(en|vi)\.md$/, '').replace(/\.md$/, ''));
	};

	const targetPath = isNew
		? buildPostPath(metadata.category, slug || slugify(metadata.title), metadata.lang)
		: currentPath;

	const fullSerializedDoc = serializePost(metadata, content);

	const handleOpenPublish = () => {
		const action = isNew ? 'create' : 'update';
		setCommitMessage(`content: ${action} ${targetPath} via web editor`);
		setPublishSuccess(null);
		setPublishError(null);
		setIsPublishModalOpen(true);
	};

	const handlePublish = async () => {
		if (!token) {
			setPublishError('Token is missing. Please connect your token first.');
			return;
		}

		if (!metadata.title.trim()) {
			setPublishError('Post title is required.');
			return;
		}

		setIsPublishing(true);
		setPublishError(null);

		try {
			const res = await commitFile(
				token,
				targetPath,
				fullSerializedDoc,
				commitMessage.trim() || `content: update ${targetPath} via web editor`,
				currentSha
			);

			setPublishSuccess(res);
			localStorage.removeItem(DRAFT_STORAGE_KEY);
			setLastSaved(null);

			// Refresh docs tree
			const updatedTree = await fetchDocsTree(token);
			setDocsTree(updatedTree);
			setIsNew(false);
			setCurrentPath(targetPath);
		} catch (err) {
			setPublishError(err instanceof Error ? err.message : 'Publish failed.');
		} finally {
			setIsPublishing(false);
		}
	};

	const treeCategories = docsTree
		.map((p) => p.replace(/^docs\//, '').split('/')[0])
		.filter((c): c is string => typeof c === 'string' && c.length > 0 && !c.endsWith('.md'));

	const categories = Array.from(new Set([...initialCategories, ...treeCategories])).sort();

	return (
		<div className="space-y-6">
			{/* Token Manager */}
			<TokenManager
				token={token}
				user={user}
				onTokenChange={(newToken, newUser) => {
					setToken(newToken);
					setUser(newUser);
				}}
			/>

			{/* Draft Recovery Alert */}
			{hasUnsavedDraft && (
				<div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-600 dark:text-amber-400 sm:text-sm">
					<div className="flex items-center gap-2">
						<AlertTriangle className="h-4 w-4 shrink-0" />
						<span>You have an unsaved draft from a previous session.</span>
					</div>
					<div className="flex gap-2">
						<button
							type="button"
							onClick={restoreDraft}
							className="rounded bg-amber-500 px-2.5 py-1 text-xs font-semibold text-white shadow-sm hover:bg-amber-600"
						>
							Restore Draft
						</button>
						<button
							type="button"
							onClick={discardDraft}
							className="rounded border border-amber-500/30 px-2.5 py-1 text-xs hover:bg-amber-500/20"
						>
							Discard
						</button>
					</div>
				</div>
			)}

			{/* Post Metadata Form */}
			<PostForm
				token={token}
				metadata={metadata}
				slug={slug}
				onMetadataChange={setMetadata}
				onSlugChange={setSlug}
				onFileLoad={handleFileLoad}
				docsTree={docsTree}
				categories={categories}
				currentPath={currentPath}
				isNew={isNew}
				setIsNew={(val) => {
					setIsNew(val);
					if (val) {
						setCurrentSha(undefined);
						setCurrentPath('');
					}
				}}
			/>

			{/* Editor / Preview Tabs */}
			<div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
				<div className="flex flex-wrap items-center justify-between border-b border-border bg-muted/30 px-3 py-2">
					<div className="flex items-center gap-1 rounded-lg bg-muted/60 p-1">
						<button
							type="button"
							onClick={() => setActiveTab('write')}
							className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1 text-xs font-medium transition ${
								activeTab === 'write'
									? 'bg-background text-foreground shadow-sm'
									: 'text-muted-foreground hover:text-foreground'
							}`}
						>
							<Edit3 className="h-3.5 w-3.5" />
							<span>Write</span>
						</button>
						<button
							type="button"
							onClick={() => setActiveTab('preview')}
							className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1 text-xs font-medium transition ${
								activeTab === 'preview'
									? 'bg-background text-foreground shadow-sm'
									: 'text-muted-foreground hover:text-foreground'
							}`}
						>
							<Eye className="h-3.5 w-3.5" />
							<span>Preview</span>
						</button>
						<button
							type="button"
							onClick={() => setActiveTab('raw')}
							className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1 text-xs font-medium transition ${
								activeTab === 'raw'
									? 'bg-background text-foreground shadow-sm'
									: 'text-muted-foreground hover:text-foreground'
							}`}
						>
							<FileCode className="h-3.5 w-3.5" />
							<span>Raw Doc</span>
						</button>
					</div>

					{/* Draft indicator */}
					<div className="flex items-center gap-2 text-xs text-muted-foreground">
						{lastSaved && (
							<span className="hidden items-center gap-1 sm:inline-flex">
								<Save className="h-3 w-3 text-muted-foreground" />
								<span>Saved {lastSaved}</span>
							</span>
						)}

						<button
							type="button"
							onClick={handleOpenPublish}
							disabled={!token || !metadata.title.trim()}
							className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground shadow-sm transition hover:bg-primary/90 disabled:opacity-50"
						>
							<Send className="h-3.5 w-3.5" />
							<span>Publish</span>
						</button>
					</div>
				</div>

				{/* Tab content */}
				<div>
					{activeTab === 'write' && (
						<div>
							<MarkdownToolbar textareaRef={textareaRef} content={content} onChange={setContent} />
							<textarea
								ref={textareaRef}
								value={content}
								onChange={(e) => setContent(e.target.value)}
								placeholder="Write your markdown post here... (Touch formatting buttons above for quick syntax)"
								rows={18}
								className="w-full resize-y bg-background p-4 font-mono text-xs leading-relaxed text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-0 sm:text-sm"
							/>
						</div>
					)}

					{activeTab === 'preview' && (
						<div className="p-4 sm:p-6">
							<div className="mb-4 border-b border-border pb-4">
								<h1 className="text-2xl font-bold text-foreground">
									{metadata.title || 'Untitled Post'}
								</h1>
								{metadata.description && (
									<p className="mt-1 text-sm text-muted-foreground">{metadata.description}</p>
								)}
								<div className="mt-2 flex flex-wrap gap-2 text-xs text-muted-foreground">
									<span>Date: {metadata.date}</span>
									<span>•</span>
									<span>Category: {metadata.category}</span>
									<span>•</span>
									<span>Lang: {metadata.lang}</span>
								</div>
							</div>
							<MarkdownPreview markdown={content} />
						</div>
					)}

					{activeTab === 'raw' && (
						<div className="bg-muted/20 p-4">
							<pre className="max-h-[500px] overflow-auto whitespace-pre-wrap rounded-md border border-border bg-card p-4 font-mono text-xs text-foreground">
								{fullSerializedDoc}
							</pre>
						</div>
					)}
				</div>
			</div>

			{/* Publish Modal */}
			{isPublishModalOpen && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 p-4 backdrop-blur-sm">
					<div className="w-full max-w-lg space-y-4 rounded-xl border border-border bg-card p-6 shadow-xl">
						<div className="flex items-center justify-between border-b border-border pb-3">
							<h3 className="text-base font-semibold text-foreground">Publish to GitHub</h3>
							<button
								type="button"
								onClick={() => setIsPublishModalOpen(false)}
								className="text-sm text-muted-foreground hover:text-foreground"
							>
								✕
							</button>
						</div>

						{publishSuccess ? (
							<div className="space-y-4 py-2 text-center">
								<div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500">
									<CheckCircle2 className="h-6 w-6" />
								</div>
								<div>
									<h4 className="font-medium text-foreground">Successfully Committed!</h4>
									<p className="mt-1 text-xs text-muted-foreground">
										GitHub Actions has been triggered and is now building your site update.
									</p>
								</div>
								<div className="break-all rounded-md bg-muted p-2.5 text-left font-mono text-xs">
									<div>File: {targetPath}</div>
									<div>SHA: {publishSuccess.commitSha.substring(0, 7)}</div>
								</div>
								<div className="flex justify-center gap-3">
									<a
										href={publishSuccess.commitUrl}
										target="_blank"
										rel="noopener noreferrer"
										className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90"
									>
										<span>View Commit on GitHub</span>
										<ExternalLink className="h-3.5 w-3.5" />
									</a>
									<button
										type="button"
										onClick={() => setIsPublishModalOpen(false)}
										className="rounded-md border border-border px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground"
									>
										Close
									</button>
								</div>
							</div>
						) : (
							<div className="space-y-3">
								<div className="space-y-1 rounded-md bg-muted/60 p-3 text-xs">
									<div className="flex justify-between">
										<span className="text-muted-foreground">Target File:</span>
										<span className="max-w-[260px] truncate font-mono font-medium text-foreground">
											{targetPath}
										</span>
									</div>
									<div className="flex justify-between">
										<span className="text-muted-foreground">Action:</span>
										<span className="font-medium text-foreground">
											{isNew ? 'Create New File' : 'Update Existing File'}
										</span>
									</div>
									<div className="flex justify-between">
										<span className="text-muted-foreground">Branch:</span>
										<span className="font-mono text-foreground">main</span>
									</div>
								</div>

								<div>
									<label
										htmlFor="commit-msg"
										className="mb-1 block text-xs font-medium text-foreground"
									>
										Commit Message
									</label>
									<input
										id="commit-msg"
										type="text"
										value={commitMessage}
										onChange={(e) => setCommitMessage(e.target.value)}
										className="w-full rounded-md border border-border bg-background px-3 py-2 font-mono text-xs text-foreground focus:border-primary focus:outline-none sm:text-sm"
									/>
								</div>

								{publishError && (
									<div className="bg-destructive/10 text-destructive rounded-md p-2.5 text-xs">
										{publishError}
									</div>
								)}

								<div className="flex justify-end gap-2 pt-2">
									<button
										type="button"
										onClick={() => setIsPublishModalOpen(false)}
										disabled={isPublishing}
										className="rounded-md border border-border px-3 py-2 text-xs font-medium text-muted-foreground hover:text-foreground disabled:opacity-50"
									>
										Cancel
									</button>
									<button
										type="button"
										onClick={handlePublish}
										disabled={isPublishing}
										className="inline-flex items-center gap-1.5 rounded-md bg-primary px-4 py-2 text-xs font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
									>
										{isPublishing ? (
											<>
												<Loader2 className="h-4 w-4 animate-spin" />
												<span>Committing...</span>
											</>
										) : (
											<>
												<Send className="h-3.5 w-3.5" />
												<span>Commit & Push</span>
											</>
										)}
									</button>
								</div>
							</div>
						)}
					</div>
				</div>
			)}
		</div>
	);
}
