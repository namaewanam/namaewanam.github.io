'use client';

import {
	Bold,
	Italic,
	Heading2,
	Heading3,
	Code,
	FileCode,
	List,
	Quote,
	Link as LinkIcon,
} from 'lucide-react';

interface MarkdownToolbarProps {
	textareaRef: React.RefObject<HTMLTextAreaElement | null>;
	content: string;
	onChange: (val: string) => void;
}

export default function MarkdownToolbar({
	textareaRef,
	content,
	onChange,
}: Readonly<MarkdownToolbarProps>) {
	const applyFormat = (prefix: string, suffix: string = '', defaultText: string = '') => {
		const textarea = textareaRef.current;
		if (!textarea) return;

		const start = textarea.selectionStart;
		const end = textarea.selectionEnd;
		const selectedText = content.substring(start, end) || defaultText;

		const replacement = `${prefix}${selectedText}${suffix}`;
		const newContent = content.substring(0, start) + replacement + content.substring(end);

		onChange(newContent);

		setTimeout(() => {
			textarea.focus();
			const newCursorPos = start + prefix.length + selectedText.length;
			textarea.setSelectionRange(start + prefix.length, newCursorPos);
		}, 0);
	};

	const applyLinePrefix = (linePrefix: string) => {
		const textarea = textareaRef.current;
		if (!textarea) return;

		const start = textarea.selectionStart;
		const end = textarea.selectionEnd;

		// Find start of current line
		const lineStart = content.lastIndexOf('\n', start - 1) + 1;
		const lineEnd = content.indexOf('\n', end);
		const effectiveEnd = lineEnd === -1 ? content.length : lineEnd;

		const currentLines = content.substring(lineStart, effectiveEnd);
		const modifiedLines = currentLines
			.split('\n')
			.map((line) => `${linePrefix} ${line}`)
			.join('\n');

		const newContent =
			content.substring(0, lineStart) + modifiedLines + content.substring(effectiveEnd);
		onChange(newContent);

		setTimeout(() => {
			textarea.focus();
			textarea.setSelectionRange(
				lineStart + linePrefix.length + 1,
				lineStart + modifiedLines.length
			);
		}, 0);
	};

	const items = [
		{
			label: 'H2',
			icon: Heading2,
			action: () => applyLinePrefix('##'),
			title: 'Heading 2',
		},
		{
			label: 'H3',
			icon: Heading3,
			action: () => applyLinePrefix('###'),
			title: 'Heading 3',
		},
		{
			label: 'Bold',
			icon: Bold,
			action: () => applyFormat('**', '**', 'bold text'),
			title: 'Bold',
		},
		{
			label: 'Italic',
			icon: Italic,
			action: () => applyFormat('*', '*', 'italic text'),
			title: 'Italic',
		},
		{
			label: 'Inline Code',
			icon: Code,
			action: () => applyFormat('`', '`', 'code'),
			title: 'Inline Code',
		},
		{
			label: 'Code Block',
			icon: FileCode,
			action: () => applyFormat('```ts\n', '\n```', '// code here'),
			title: 'Code Block',
		},
		{
			label: 'Bullet List',
			icon: List,
			action: () => applyLinePrefix('-'),
			title: 'Bullet List',
		},
		{
			label: 'Quote',
			icon: Quote,
			action: () => applyLinePrefix('>'),
			title: 'Quote',
		},
		{
			label: 'Link',
			icon: LinkIcon,
			action: () => applyFormat('[', '](https://example.com)', 'link text'),
			title: 'Insert Link',
		},
	];

	return (
		<div className="scrollbar-thin flex items-center gap-1 overflow-x-auto border-b border-border bg-muted/40 p-1.5">
			{items.map((item) => {
				const Icon = item.icon;
				return (
					<button
						key={item.label}
						type="button"
						onClick={item.action}
						title={item.title}
						className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded border border-transparent text-muted-foreground transition hover:border-border hover:bg-background hover:text-foreground focus:outline-none"
					>
						<Icon className="h-3.5 w-3.5" />
						<span className="sr-only">{item.label}</span>
					</button>
				);
			})}
		</div>
	);
}
