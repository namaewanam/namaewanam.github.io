import type { Metadata } from 'next';
import GuestbookTerminal from '@/components/guestbook/GuestbookTerminal';
import { SITE_NAME, SITE_URL } from '@/lib/site';

export function generateStaticParams() {
	return [{ lang: 'en' }, { lang: 'vi' }];
}

export const metadata: Metadata = {
	metadataBase: new URL(SITE_URL),
	title: `CLI Guestbook · ${SITE_NAME}`,
	description: 'Interactive terminal guestbook. Leave a message, drop feedback, or say hi.',
	openGraph: {
		title: `CLI Guestbook · ${SITE_NAME}`,
		description: 'Interactive terminal guestbook. Leave a message, drop feedback, or say hi.',
		type: 'website',
		url: '/guestbook',
	},
};

export default function GuestbookPage() {
	return (
		<div className="mx-auto w-full max-w-3xl space-y-8">
			{/* Header */}
			<div className="space-y-2">
				<p className="font-mono text-xs uppercase tracking-widest text-primary">
					interactive // guestbook
				</p>
				<h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">Guestbook</h1>
				<p className="text-sm leading-relaxed text-muted-foreground">
					Leave a signature, share what you&apos;re working on, or leave feedback via the terminal.
				</p>
			</div>

			{/* Terminal & Cards */}
			<GuestbookTerminal />
		</div>
	);
}
