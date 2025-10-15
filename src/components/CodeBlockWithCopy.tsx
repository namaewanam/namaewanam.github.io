'use client';

import { useState } from 'react';
import type { FC, ReactNode } from 'react';
import { Copy, Check } from 'lucide-react';

const extractTextFromChildren = (children: ReactNode): string => {
	if (typeof children === 'string') {
		return children;
	}
	if (Array.isArray(children)) {
		return children.map(extractTextFromChildren).join('');
	}
	if (children && typeof children === 'object' && 'props' in children) {
		return extractTextFromChildren(children.props.children);
	}
	return '';
};

const CodeBlockWithCopy: FC<{ children?: ReactNode }> = ({ children }) => {
	const [isCopied, setIsCopied] = useState(false);
	const codeString = extractTextFromChildren(children);

	const handleCopy = () => {
		if (!codeString) return;
		navigator.clipboard.writeText(codeString).then(() => {
			setIsCopied(true);
			setTimeout(() => setIsCopied(false), 2000);
		});
	};

	return (
		<div className="relative group">
			<button
				onClick={handleCopy}
				className="absolute top-2 right-2 p-2 bg-muted border border-border rounded-md text-muted-foreground
                   opacity-0 group-hover:opacity-100 transition-opacity duration-200
                   hover:bg-accent hover:text-accent-foreground
                   focus:outline-none focus:ring-2 focus:ring-primary"
				aria-label="Copy code to clipboard"
			>
				{isCopied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
			</button>
			{children}
		</div>
	);
};

const PreWithCopyButton = ({ children, ...props }: any) => {
	return (
		<CodeBlockWithCopy>
			<pre {...props}>{children}</pre>
		</CodeBlockWithCopy>
	);
};

export default PreWithCopyButton;

