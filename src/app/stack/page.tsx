import type { Metadata } from 'next';
import StackGroup from '@/components/stack/StackGroup';
import { STACK_GROUPS } from '@/lib/site';

export const metadata: Metadata = {
	title: 'Stack · nam',
	description:
		'A practical view of the tools I reach for, feel comfortable with, and am exploring now',
};

export default function StackPage() {
	return (
		<div className="mx-auto w-full max-w-3xl space-y-8">
			<div className="space-y-2">
				<p className="font-mono text-xs uppercase tracking-widest text-primary">stack</p>
				<h1 className="text-2xl font-bold text-foreground">Tools, but with opinions attached</h1>
				<p className="max-w-xl text-sm leading-relaxed text-muted-foreground">
					Not a giant badge wall. Just the tools I default to, the ones I can rely on, and the areas
					I am actively pushing deeper into.
				</p>
			</div>

			<div className="space-y-4">
				{STACK_GROUPS.map((group) => (
					<StackGroup
						key={group.title}
						title={group.title}
						description={group.description}
						items={group.items}
					/>
				))}
			</div>
		</div>
	);
}
