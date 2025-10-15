'use client';

import { useState, useRef, useEffect, FC } from 'react';
import { ChevronDown } from 'lucide-react';

interface SelectOption {
	value: string;
	label: string;
}

interface CustomSelectProps {
	options: SelectOption[];
	value: string;
	onChange: (value: string) => void;
}

const CustomSelect: FC<CustomSelectProps> = ({ options, value, onChange }) => {
	const [isOpen, setIsOpen] = useState(false);
	const selectRef = useRef<HTMLDivElement>(null);

	const selectedOption = options.find((option) => option.value === value);

	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
				setIsOpen(false);
			}
		};

		if (isOpen) {
			document.addEventListener('mousedown', handleClickOutside);
		}

		return () => {
			document.removeEventListener('mousedown', handleClickOutside);
		};
	}, [isOpen]);

	const handleOptionClick = (newValue: string) => {
		onChange(newValue);
		setIsOpen(false);
	};

	return (
		<div className="relative w-full sm:w-48" ref={selectRef}>
			<button
				type="button"
				onClick={() => setIsOpen(!isOpen)}
				className="w-full flex items-center justify-between bg-background border border-border rounded-md px-2 md:px-3 py-1.5 md:py-2 text-left focus:outline-none focus:ring-2 focus:ring-primary text-xs md:text-sm"
			>
				<span className="truncate">{selectedOption?.label || 'Select...'}</span>
				<ChevronDown
					className={`h-3 w-3 md:h-4 md:w-4 text-muted-foreground transition-transform duration-200 flex-shrink-0 ml-2 ${isOpen ? 'rotate-180' : ''
						}`}
				/>
			</button>

			{isOpen && (
				<ul
					className="absolute z-10 mt-1 w-full bg-background border border-border rounded-md shadow-lg
                     max-h-48 md:max-h-60 overflow-y-auto
                     focus:outline-none"
				>
					{options.map((option) => (
						<li
							key={option.value}
							onClick={() => handleOptionClick(option.value)}
							className="px-2 md:px-3 py-2 text-xs md:text-sm cursor-pointer hover:bg-muted"
						>
							{option.label}
						</li>
					))}
				</ul>
			)}
		</div>
	);
};

export default CustomSelect;
