'use client';

import { useEffect, useState } from 'react';
import { Link2, Linkedin } from 'lucide-react';

interface ShareButtonsProps {
	title: string;
	url?: string;
}

/**
 * Share buttons for blog posts — copy link, Twitter/X, LinkedIn.
 */
export default function ShareButtons({ title, url }: Readonly<ShareButtonsProps>) {
	const [copied, setCopied] = useState(false);
	const [shareUrl, setShareUrl] = useState('');

	useEffect(() => {
		setShareUrl(url ?? window.location.href);
	}, [url]);

	const handleCopy = async () => {
		try {
			await navigator.clipboard.writeText(shareUrl);
			setCopied(true);
			setTimeout(() => setCopied(false), 2000);
		} catch {
			// Fallback
			const textarea = document.createElement('textarea');
			textarea.value = shareUrl;
			document.body.appendChild(textarea);
			textarea.select();
			document.execCommand('copy');
			document.body.removeChild(textarea);
			setCopied(true);
			setTimeout(() => setCopied(false), 2000);
		}
	};

	const twitterUrl = `https://x.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(shareUrl)}`;
	const linkedinUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`;

	return (
		<div className="flex items-center gap-2">
			<span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
				share
			</span>
			<button
				type="button"
				onClick={handleCopy}
				className="inline-flex items-center gap-1.5 rounded border border-border px-2 py-1 font-mono text-[11px] text-muted-foreground transition-all hover:border-primary hover:text-foreground"
				aria-label="Copy link"
			>
				<Link2 className="h-3 w-3" />
				{copied ? 'copied!' : 'copy link'}
			</button>
			<a
				href={twitterUrl}
				target="_blank"
				rel="noopener noreferrer"
				className="inline-flex items-center gap-1.5 rounded border border-border px-2 py-1 font-mono text-[11px] text-muted-foreground transition-all hover:border-primary hover:text-foreground"
				aria-label="Post to X"
			>
				<svg className="h-3 w-3" viewBox="0 0 24 24" fill="currentColor">
					<path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
				</svg>
				post
			</a>
			<a
				href={linkedinUrl}
				target="_blank"
				rel="noopener noreferrer"
				className="inline-flex items-center gap-1.5 rounded border border-border px-2 py-1 font-mono text-[11px] text-muted-foreground transition-all hover:border-primary hover:text-foreground"
				aria-label="Share on LinkedIn"
			>
				<Linkedin className="h-3 w-3" />
				share
			</a>
		</div>
	);
}
