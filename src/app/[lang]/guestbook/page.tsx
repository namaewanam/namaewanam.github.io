import type { Metadata } from 'next';
import GuestbookTerminal from '@/components/guestbook/GuestbookTerminal';
import { SITE_NAME, SITE_URL } from '@/lib/site';

export function generateStaticParams() {
	return [{ lang: 'en' }, { lang: 'vi' }];
}

export async function generateMetadata({
	params,
}: {
	params: Promise<{ lang: string }>;
}): Promise<Metadata> {
	const { lang } = await params;
	const isVi = lang === 'vi';
	return {
		metadataBase: new URL(SITE_URL),
		title: `${isVi ? 'Sổ lưu bút CLI' : 'CLI Guestbook'} · ${SITE_NAME}`,
		description: isVi
			? 'Sổ lưu bút giao diện terminal tương tác. Hãy để lại lời nhắn, gửi góp ý hoặc chỉ đơn giản là gửi lời chào.'
			: 'Interactive terminal guestbook. Leave a message, drop feedback, or say hi.',
		openGraph: {
			title: `${isVi ? 'Sổ lưu bút CLI' : 'CLI Guestbook'} · ${SITE_NAME}`,
			description: isVi
				? 'Sổ lưu bút giao diện terminal tương tác. Hãy để lại lời nhắn, gửi góp ý hoặc chỉ đơn giản là gửi lời chào.'
				: 'Interactive terminal guestbook. Leave a message, drop feedback, or say hi.',
			type: 'website',
			url: `/${lang}/guestbook`,
		},
	};
}

export default async function GuestbookPage({
	params,
}: Readonly<{
	params: Promise<{ lang: string }>;
}>) {
	const { lang } = await params;
	const isVi = lang === 'vi';

	return (
		<div className="mx-auto w-full max-w-3xl space-y-8">
			{/* Header */}
			<div className="space-y-2">
				<p className="font-mono text-xs uppercase tracking-widest text-primary">
					{isVi ? 'tương tác // sổ lưu bút' : 'interactive // guestbook'}
				</p>
				<h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
					{isVi ? 'Sổ lưu bút' : 'Guestbook'}
				</h1>
				<p className="text-sm leading-relaxed text-muted-foreground">
					{isVi
						? 'Để lại chữ ký, chia sẻ điều bạn đang thực hiện hoặc gửi phản hồi qua terminal bên dưới.'
						: "Leave a signature, share what you're working on, or leave feedback via the terminal."}
				</p>
			</div>

			{/* Terminal & Cards */}
			<GuestbookTerminal />
		</div>
	);
}
