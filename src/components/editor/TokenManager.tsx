'use client';

import { useState } from 'react';
import { KeyRound, LogOut, CheckCircle2, AlertCircle, Loader2, ExternalLink } from 'lucide-react';
import { verifyGitHubToken, GitHubUser, DEFAULT_REPO } from '@/lib/github';
import { TranslationKey } from '@/lib/i18n/translations';

interface TokenManagerProps {
	token: string | null;
	user: GitHubUser | null;
	t?: (key: TranslationKey) => string;
	onTokenChange: (token: string | null, user: GitHubUser | null) => void;
}

export default function TokenManager({
	token,
	user,
	t,
	onTokenChange,
}: Readonly<TokenManagerProps>) {
	const tr = (key: TranslationKey, fallback: string) => (t ? t(key) : fallback);
	const [inputToken, setInputToken] = useState('');
	const [isValidating, setIsValidating] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const handleConnect = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!inputToken.trim()) return;

		setIsValidating(true);
		setError(null);

		try {
			const { user: verifiedUser, canPush } = await verifyGitHubToken(inputToken.trim());
			if (!canPush) {
				setError(
					`Token authenticated as @${verifiedUser.login}, but lacks push/write permissions to ${DEFAULT_REPO}.`
				);
				setIsValidating(false);
				return;
			}
			localStorage.setItem('blog_editor_gh_token', inputToken.trim());
			onTokenChange(inputToken.trim(), verifiedUser);
			setInputToken('');
		} catch (err: unknown) {
			const msg = err instanceof Error ? err.message : 'Failed to verify token.';
			setError(msg);
		} finally {
			setIsValidating(false);
		}
	};

	const handleDisconnect = () => {
		if (
			window.confirm(
				tr(
					'editor.disconnectConfirm',
					'Disconnect from GitHub and clear your saved token from this browser?'
				)
			)
		) {
			localStorage.removeItem('blog_editor_gh_token');
			onTokenChange(null, null);
		}
	};

	if (token && user) {
		return (
			<div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border bg-card/60 p-3 text-xs sm:text-sm">
				<div className="flex min-w-0 items-center gap-2.5">
					{user.avatar_url && (
						// eslint-disable-next-line @next/next/no-img-element
						<img
							src={user.avatar_url}
							alt={user.login}
							className="h-6 w-6 rounded-full border border-border"
						/>
					)}
					<div className="flex min-w-0 items-center gap-1.5">
						<CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />
						<span className="truncate text-muted-foreground">
							{tr('editor.connectedAs', 'Connected as')}{' '}
							<strong className="text-foreground">@{user.login}</strong>
						</span>
					</div>
				</div>

				<button
					type="button"
					onClick={handleDisconnect}
					className="hover:border-destructive hover:text-destructive inline-flex items-center gap-1.5 rounded border border-border px-2.5 py-1 text-xs text-muted-foreground transition"
				>
					<LogOut className="h-3.5 w-3.5" />
					<span>{tr('editor.disconnect', 'Disconnect')}</span>
				</button>
			</div>
		);
	}

	return (
		<div className="rounded-xl border border-border bg-card p-4 shadow-sm sm:p-6">
			<div className="mb-4 flex items-center gap-2">
				<div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
					<KeyRound className="h-4 w-4" />
				</div>
				<div>
					<h3 className="text-sm font-semibold text-foreground sm:text-base">
						{tr('editor.connectTitle', 'Connect GitHub Account')}
					</h3>
					<p className="text-xs text-muted-foreground">
						{tr(
							'editor.connectDesc',
							'Authenticate with a Personal Access Token to commit changes directly from this browser.'
						)}
					</p>
				</div>
			</div>

			<form onSubmit={handleConnect} className="space-y-3">
				<div>
					<label htmlFor="gh-token" className="mb-1 block text-xs font-medium text-foreground">
						{tr('editor.patLabel', 'Personal Access Token (Fine-Grained or Classic)')}
					</label>
					<input
						id="gh-token"
						type="password"
						value={inputToken}
						onChange={(e) => setInputToken(e.target.value)}
						placeholder="github_pat_... or ghp_..."
						required
						className="w-full rounded-md border border-border bg-background px-3 py-2 font-mono text-xs text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary sm:text-sm"
					/>
				</div>

				{error && (
					<div className="bg-destructive/10 text-destructive flex items-start gap-2 rounded-md p-2.5 text-xs">
						<AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
						<span>{error}</span>
					</div>
				)}

				<div className="flex flex-wrap items-center justify-between gap-3 pt-1">
					<a
						href="https://github.com/settings/tokens?type=beta"
						target="_blank"
						rel="noopener noreferrer"
						className="inline-flex items-center gap-1 text-xs text-accent hover:underline"
					>
						<span>
							{tr('editor.patCreateLink', 'Create token on GitHub (Contents: Read & Write)')}
						</span>
						<ExternalLink className="h-3 w-3" />
					</a>

					<button
						type="submit"
						disabled={isValidating || !inputToken.trim()}
						className="inline-flex items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 text-xs font-medium text-primary-foreground transition hover:bg-primary/90 disabled:opacity-50 sm:text-sm"
					>
						{isValidating ? (
							<>
								<Loader2 className="h-4 w-4 animate-spin" />
								<span>{tr('editor.verifying', 'Verifying...')}</span>
							</>
						) : (
							<span>{tr('editor.connectBtn', 'Connect Token')}</span>
						)}
					</button>
				</div>
			</form>
		</div>
	);
}
