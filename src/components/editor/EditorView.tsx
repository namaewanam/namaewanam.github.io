'use client';

import { useState, useEffect, useRef } from 'react';
import { PostMetadata, slugify, buildPostPath, serializePost } from '@/lib/editor-utils';
import { GitHubUser, verifyGitHubToken, fetchDocsTree, commitFile, deleteFile } from '@/lib/github';
import TokenManager from './TokenManager';
import PostForm from './PostForm';
import MarkdownToolbar from './MarkdownToolbar';
import MarkdownPreview from './MarkdownPreview';
import { Locale, translations, TranslationKey } from '@/lib/i18n/translations';
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
	Trash2,
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
	lang?: Locale;
}

export default function EditorView({
	initialCategories = [],
	lang = 'en',
}: Readonly<EditorViewProps>) {
	const t = (key: TranslationKey) => translations[lang]?.[key] ?? translations.en[key] ?? key;

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

	// Deletion state
	const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
	const [deleteCommitMessage, setDeleteCommitMessage] = useState('');
	const [isDeleting, setIsDeleting] = useState(false);
	const [deleteSuccess, setDeleteSuccess] = useState<{
		commitSha: string;
		commitUrl: string;
	} | null>(null);
	const [deleteError, setDeleteError] = useState<string | null>(null);

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
			try {
				localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(draft));
				setLastSaved(draft.savedAt);
			} catch (err) {
				console.warn('Unable to persist draft to localStorage:', err);
			}
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

	const handleOpenDelete = () => {
		setDeleteCommitMessage(`content: delete ${currentPath} via web editor`);
		setDeleteError(null);
		setDeleteSuccess(null);
		setIsDeleteModalOpen(true);
	};

	const handleDelete = async () => {
		if (!token || !currentPath || !currentSha) return;

		setIsDeleting(true);
		setDeleteError(null);

		try {
			const res = await deleteFile(
				token,
				currentPath,
				deleteCommitMessage.trim() || `content: delete ${currentPath} via web editor`,
				currentSha
			);

			setDeleteSuccess(res);
			localStorage.removeItem(DRAFT_STORAGE_KEY);
			setLastSaved(null);

			// Refresh docs tree
			const updatedTree = await fetchDocsTree(token);
			setDocsTree(updatedTree);
		} catch (err) {
			setDeleteError(err instanceof Error ? err.message : 'Delete failed.');
		} finally {
			setIsDeleting(false);
		}
	};

	const treeCategories = docsTree
		.map((p) => p.replace(/^docs\//, '').split('/')[0])
		.filter((c): c is string => typeof c === 'string' && c.length > 0 && !c.endsWith('.md'));

	const categories = Array.from(new Set([...initialCategories, ...treeCategories])).sort();

	const resetToNewPost = () => {
		setIsNew(true);
		setMetadata({
			title: '',
			date: new Date().toISOString().split('T')[0] ?? '',
			category: categories[0] || 'Backend',
			tags: [],
			description: '',
			lang: lang || 'en',
		});
		setSlug('');
		setContent('');
		setCurrentSha(undefined);
		setCurrentPath('');
		setLastSaved(null);
		localStorage.removeItem(DRAFT_STORAGE_KEY);
		setHasUnsavedDraft(false);
	};

	const handleCloseDeleteModal = () => {
		setIsDeleteModalOpen(false);
		if (deleteSuccess) {
			resetToNewPost();
			setDeleteSuccess(null);
		}
	};

	return (
		<div className="space-y-6">
			{/* Token Manager */}
			<TokenManager
				token={token}
				user={user}
				t={t}
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
						<span>{t('editor.draftAlert')}</span>
					</div>
					<div className="flex gap-2">
						<button
							type="button"
							onClick={restoreDraft}
							className="rounded bg-amber-500 px-2.5 py-1 text-xs font-semibold text-white shadow-sm hover:bg-amber-600"
						>
							{t('editor.restoreDraft')}
						</button>
						<button
							type="button"
							onClick={discardDraft}
							className="rounded border border-amber-500/30 px-2.5 py-1 text-xs hover:bg-amber-500/20"
						>
							{t('editor.discard')}
						</button>
					</div>
				</div>
			)}

			{/* Post Metadata Form */}
			<PostForm
				token={token}
				metadata={metadata}
				slug={slug}
				t={t}
				onMetadataChange={setMetadata}
				onSlugChange={setSlug}
				onFileLoad={handleFileLoad}
				docsTree={docsTree}
				categories={categories}
				currentPath={currentPath}
				isNew={isNew}
				setIsNew={(val) => {
					if (val) {
						resetToNewPost();
					} else {
						setIsNew(false);
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
							<span>{t('editor.tabWrite')}</span>
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
							<span>{t('editor.tabPreview')}</span>
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
							<span>{t('editor.tabRaw')}</span>
						</button>
					</div>

					{/* Draft indicator */}
					<div className="flex items-center gap-2 text-xs text-muted-foreground">
						{lastSaved && (
							<span className="hidden items-center gap-1 sm:inline-flex">
								<Save className="h-3 w-3 text-muted-foreground" />
								<span>
									{t('editor.savedAt')} {lastSaved}
								</span>
							</span>
						)}

						{!isNew && currentSha && currentPath && (
							<button
								type="button"
								onClick={handleOpenDelete}
								disabled={!token}
								className="border-destructive/40 bg-destructive/10 text-destructive hover:bg-destructive/20 inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-xs font-medium transition disabled:opacity-50"
							>
								<Trash2 className="h-3.5 w-3.5" />
								<span>{t('editor.delete')}</span>
							</button>
						)}

						<button
							type="button"
							onClick={handleOpenPublish}
							disabled={!token || !metadata.title.trim()}
							className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground shadow-sm transition hover:bg-primary/90 disabled:opacity-50"
						>
							<Send className="h-3.5 w-3.5" />
							<span>{t('editor.publish')}</span>
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
								placeholder={t('editor.writePlaceholder')}
								rows={18}
								className="w-full resize-y bg-background p-4 font-mono text-xs leading-relaxed text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-0 sm:text-sm"
							/>
						</div>
					)}

					{activeTab === 'preview' && (
						<div className="p-4 sm:p-6">
							<div className="mb-4 border-b border-border pb-4">
								<h1 className="text-2xl font-bold text-foreground">
									{metadata.title || t('editor.untitled')}
								</h1>
								{metadata.description && (
									<p className="mt-1 text-sm text-muted-foreground">{metadata.description}</p>
								)}
								<div className="mt-2 flex flex-wrap gap-2 text-xs text-muted-foreground">
									<span>
										{t('editor.date')}: {metadata.date}
									</span>
									<span>•</span>
									<span>
										{t('editor.category')}: {metadata.category}
									</span>
									<span>•</span>
									<span>
										{t('editor.language')}: {metadata.lang}
									</span>
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
							<h3 className="text-base font-semibold text-foreground">
								{t('editor.publishTitle')}
							</h3>
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
									<h4 className="font-medium text-foreground">{t('editor.successTitle')}</h4>
									<p className="mt-1 text-xs text-muted-foreground">{t('editor.successDesc')}</p>
								</div>
								<div className="break-all rounded-md bg-muted p-2.5 text-left font-mono text-xs">
									<div>
										{t('editor.targetFile')} {targetPath}
									</div>
									<div>SHA: {publishSuccess.commitSha.substring(0, 7)}</div>
								</div>
								<div className="flex justify-center gap-3">
									<a
										href={publishSuccess.commitUrl}
										target="_blank"
										rel="noopener noreferrer"
										className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90"
									>
										<span>{t('editor.viewCommit')}</span>
										<ExternalLink className="h-3.5 w-3.5" />
									</a>
									<button
										type="button"
										onClick={() => setIsPublishModalOpen(false)}
										className="rounded-md border border-border px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground"
									>
										{t('editor.close')}
									</button>
								</div>
							</div>
						) : (
							<div className="space-y-3">
								<div className="space-y-1 rounded-md bg-muted/60 p-3 text-xs">
									<div className="flex justify-between">
										<span className="text-muted-foreground">{t('editor.targetFile')}</span>
										<span className="max-w-[260px] truncate font-mono font-medium text-foreground">
											{targetPath}
										</span>
									</div>
									<div className="flex justify-between">
										<span className="text-muted-foreground">{t('editor.action')}</span>
										<span className="font-medium text-foreground">
											{isNew ? t('editor.actionCreate') : t('editor.actionUpdate')}
										</span>
									</div>
									<div className="flex justify-between">
										<span className="text-muted-foreground">{t('editor.branch')}</span>
										<span className="font-mono text-foreground">main</span>
									</div>
								</div>

								<div>
									<label
										htmlFor="commit-msg"
										className="mb-1 block text-xs font-medium text-foreground"
									>
										{t('editor.commitMessage')}
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
										{t('editor.cancel')}
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
												<span>{t('editor.committing')}</span>
											</>
										) : (
											<>
												<Send className="h-3.5 w-3.5" />
												<span>{t('editor.commitPush')}</span>
											</>
										)}
									</button>
								</div>
							</div>
						)}
					</div>
				</div>
			)}

			{/* Delete Modal */}
			{isDeleteModalOpen && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 p-4 backdrop-blur-sm">
					<div className="w-full max-w-lg space-y-4 rounded-xl border border-border bg-card p-6 shadow-xl">
						<div className="flex items-center justify-between border-b border-border pb-3">
							<h3 className="text-base font-semibold text-foreground">{t('editor.deleteTitle')}</h3>
							<button
								type="button"
								onClick={handleCloseDeleteModal}
								className="text-sm text-muted-foreground hover:text-foreground"
							>
								✕
							</button>
						</div>

						{deleteSuccess ? (
							<div className="space-y-4 py-2 text-center">
								<div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500">
									<CheckCircle2 className="h-6 w-6" />
								</div>
								<div>
									<h4 className="font-medium text-foreground">{t('editor.deleteSuccessTitle')}</h4>
									<p className="mt-1 text-xs text-muted-foreground">
										{t('editor.deleteSuccessDesc')}
									</p>
								</div>
								<div className="break-all rounded-md bg-muted p-2.5 text-left font-mono text-xs">
									<div>
										{t('editor.targetFile')} {currentPath}
									</div>
									<div>SHA: {deleteSuccess.commitSha.substring(0, 7)}</div>
								</div>
								<div className="flex justify-center gap-3">
									<a
										href={deleteSuccess.commitUrl}
										target="_blank"
										rel="noopener noreferrer"
										className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90"
									>
										<span>{t('editor.viewCommit')}</span>
										<ExternalLink className="h-3.5 w-3.5" />
									</a>
									<button
										type="button"
										onClick={handleCloseDeleteModal}
										className="rounded-md border border-border px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground"
									>
										{t('editor.close')}
									</button>
								</div>
							</div>
						) : (
							<div className="space-y-3">
								<div className="border-destructive/30 bg-destructive/10 text-destructive flex items-start gap-2.5 rounded-lg border p-3 text-xs">
									<AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
									<span>{t('editor.deleteWarning')}</span>
								</div>

								<div className="space-y-1 rounded-md bg-muted/60 p-3 text-xs">
									<div className="flex justify-between">
										<span className="text-muted-foreground">{t('editor.targetFile')}</span>
										<span className="max-w-[260px] truncate font-mono font-medium text-foreground">
											{currentPath}
										</span>
									</div>
									<div className="flex justify-between">
										<span className="text-muted-foreground">{t('editor.branch')}</span>
										<span className="font-mono text-foreground">main</span>
									</div>
								</div>

								<div>
									<label
										htmlFor="delete-commit-msg"
										className="mb-1 block text-xs font-medium text-foreground"
									>
										{t('editor.commitMessage')}
									</label>
									<input
										id="delete-commit-msg"
										type="text"
										value={deleteCommitMessage}
										onChange={(e) => setDeleteCommitMessage(e.target.value)}
										className="focus:border-destructive w-full rounded-md border border-border bg-background px-3 py-2 font-mono text-xs text-foreground focus:outline-none sm:text-sm"
									/>
								</div>

								{deleteError && (
									<div className="bg-destructive/10 text-destructive rounded-md p-2.5 text-xs">
										{deleteError}
									</div>
								)}

								<div className="flex justify-end gap-2 pt-2">
									<button
										type="button"
										onClick={handleCloseDeleteModal}
										disabled={isDeleting}
										className="rounded-md border border-border px-3 py-2 text-xs font-medium text-muted-foreground hover:text-foreground disabled:opacity-50"
									>
										{t('editor.cancel')}
									</button>
									<button
										type="button"
										onClick={handleDelete}
										disabled={isDeleting}
										className="bg-destructive text-destructive-foreground hover:bg-destructive/90 inline-flex items-center gap-1.5 rounded-md px-4 py-2 text-xs font-medium disabled:opacity-50"
									>
										{isDeleting ? (
											<>
												<Loader2 className="h-4 w-4 animate-spin" />
												<span>{t('editor.deleting')}</span>
											</>
										) : (
											<>
												<Trash2 className="h-3.5 w-3.5" />
												<span>{t('editor.deleteBtn')}</span>
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
