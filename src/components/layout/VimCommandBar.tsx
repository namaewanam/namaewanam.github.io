'use client';

import { useEffect, useRef, useState } from 'react';

interface VimCommandBarProps {
	isOpen: boolean;
	onClose: () => void;
	onExecute: (cmd: string) => void;
}

export default function VimCommandBar({ isOpen, onClose, onExecute }: VimCommandBarProps) {
	const [command, setCommand] = useState('');
	const inputRef = useRef<HTMLInputElement>(null);

	useEffect(() => {
		if (isOpen) {
			setCommand('');
			setTimeout(() => {
				inputRef.current?.focus();
			}, 10);
		}
	}, [isOpen]);

	if (!isOpen) return null;

	const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
		if (e.key === 'Escape') {
			e.preventDefault();
			onClose();
		} else if (e.key === 'Enter') {
			e.preventDefault();
			const trimmed = command.trim();
			onClose();
			if (trimmed) {
				onExecute(trimmed);
			}
		}
	};

	return (
		<div className="animate-in slide-in-from-bottom-2 fixed inset-x-0 bottom-0 z-[100] border-t border-border bg-card/95 p-2.5 font-mono text-sm shadow-2xl backdrop-blur-md">
			<div className="mx-auto flex max-w-3xl items-center gap-2">
				<span className="font-bold text-primary">:</span>
				<input
					ref={inputRef}
					type="text"
					value={command}
					onChange={(e) => setCommand(e.target.value)}
					onKeyDown={handleKeyDown}
					onBlur={() => onClose()}
					placeholder="w (save), q (quit), e blog, theme dark, random, help..."
					className="flex-1 bg-transparent font-mono text-xs text-foreground outline-none placeholder:text-muted-foreground/40 sm:text-sm"
					autoCapitalize="off"
					autoComplete="off"
					spellCheck="false"
				/>
				<span className="hidden font-mono text-[10px] text-muted-foreground/60 sm:inline-block">
					&lt;Esc&gt; to cancel
				</span>
			</div>
		</div>
	);
}
