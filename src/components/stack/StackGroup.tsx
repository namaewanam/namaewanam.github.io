export default function StackGroup({
	title,
	description,
	items,
}: Readonly<{
	title: string;
	description: string;
	items: readonly string[];
}>) {
	return (
		<section className="space-y-4 rounded border border-border bg-card/40 p-4 sm:p-5">
			<div className="space-y-1.5">
				<p className="font-mono text-[10px] uppercase tracking-widest text-primary">{title}</p>
				<p className="max-w-xl text-sm leading-relaxed text-muted-foreground">{description}</p>
			</div>
			<div className="grid gap-2 sm:grid-cols-2">
				{items.map((item, index) => (
					<div
						key={item}
						className="rounded border border-border/70 bg-background/40 px-3 py-2 font-mono text-[11px] text-foreground/85"
					>
						<span className="mr-2 text-muted-foreground/60">
							{String(index + 1).padStart(2, '0')}.
						</span>
						{item}
					</div>
				))}
			</div>
		</section>
	);
}
