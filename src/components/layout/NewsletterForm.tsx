import { BUTTONDOWN_USERNAME } from '@/lib/site';

/**
 * Newsletter subscribe form — integrates with Buttondown.
 * Uses a simple form POST (no JS fetch) so it works with static export.
 */
export default function NewsletterForm() {
	const username = BUTTONDOWN_USERNAME;

	return (
		<div className="flex flex-col gap-2">
			<div className="font-mono text-xs text-muted-foreground">
				newsletter · get notified of new posts
			</div>
			{username ? (
				<form
					action={`https://buttondown.com/api/emails/embed-subscribe/${username}`}
					method="post"
					target="_blank"
					className="flex items-center gap-2"
				>
					<input
						type="email"
						name="email"
						placeholder="your@email.com"
						required
						className="flex-1 rounded border border-border bg-transparent px-3 py-1.5 font-mono text-xs placeholder:text-muted-foreground/50 focus:border-primary focus:outline-none"
					/>
					<button
						type="submit"
						className="rounded bg-primary px-4 py-1.5 font-mono text-xs text-primary-foreground transition-opacity hover:opacity-90"
					>
						subscribe
					</button>
				</form>
			) : (
				<div className="flex cursor-not-allowed items-center gap-2 opacity-50">
					<input
						type="email"
						placeholder="your@email.com"
						disabled
						className="flex-1 rounded border border-border bg-transparent px-3 py-1.5 font-mono text-xs"
					/>
					<button
						disabled
						className="rounded bg-primary px-4 py-1.5 font-mono text-xs text-primary-foreground"
					>
						subscribe
					</button>
				</div>
			)}
		</div>
	);
}
