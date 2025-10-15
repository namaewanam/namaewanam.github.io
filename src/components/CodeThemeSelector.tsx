'use client';

import { useCodeTheme, availableThemes } from '@/contexts/CodeThemeContext';
import CustomSelect from './CustomSelect';

export default function CodeThemeSelector() {
	const { themeFile, setThemeFile } = useCodeTheme();

	const themeOptions = availableThemes.map(theme => ({
		value: theme.file,
		label: theme.name,
	}));

	return (
		<div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 text-xs md:text-sm">
			<label htmlFor="theme-selector" className="text-muted-foreground whitespace-nowrap">
				Code Theme:
			</label>
			<CustomSelect
				options={themeOptions}
				value={themeFile}
				onChange={setThemeFile}
			/>
		</div>
	);
}
