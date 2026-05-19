export default function BlogPostLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return <div className="mx-auto w-full max-w-5xl">{children}</div>;
}
