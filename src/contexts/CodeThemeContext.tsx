'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface Theme {
	name: string;
	file: string;
}

export const availableThemes: Theme[] = [
	// Dark Themes
	{ name: 'Atom One Dark', file: 'atom-one-dark.css' },
	{ name: 'GitHub Dark', file: 'github-dark.css' },
	{ name: 'Dracula', file: 'dracula.css' },
	{ name: 'Nord', file: 'nord.css' },
	{ name: 'Monokai Sublime', file: 'monokai-sublime.css' },
	{ name: 'Night Owl', file: 'night-owl.css' },
	{ name: 'Solarized Dark', file: 'solarized-dark.css' },
	{ name: 'Darcula (JetBrains)', file: 'darcula.css' },
	{ name: 'Gruvbox Dark', file: 'gruvbox-dark.css' },
	{ name: 'Shades of Purple', file: 'shades-of-purple.css' },
	{ name: 'A11y Dark', file: 'a11y-dark.css' },
	{ name: 'An Old Hope', file: 'an-old-hope.css' },
	{ name: 'Android Studio', file: 'androidstudio.css' },
	{ name: 'Codepen Embed', file: 'codepen-embed.css' },
	{ name: 'VS2015', file: 'vs2015.css' },
	{ name: 'Zenburn', file: 'zenburn.css' },
	{ name: 'Obsidian', file: 'obsidian.css' },
	{ name: 'Ocean', file: 'ocean.css' },

	// Light Themes
	{ name: 'Atom One Light', file: 'atom-one-light.css' },
	{ name: 'GitHub', file: 'github.css' },
	{ name: 'StackOverflow Light', file: 'stackoverflow-light.css' },
	{ name: 'VS (Visual Studio)', file: 'vs.css' },
	{ name: 'Xcode', file: 'xcode.css' },
	{ name: 'Solarized Light', file: 'solarized-light.css' },
	{ name: 'A11y Light', file: 'a11y-light.css' },
	{ name: 'Gruvbox Light', file: 'gruvbox-light.css' },
	{ name: 'Idea (JetBrains)', file: 'idea.css' },
	{ name: 'School Book', file: 'school-book.css' },
	{ name: 'Docco', file: 'docco.css' },
	{ name: 'Default', file: 'default.css' },
];

const DEFAULT_THEME_FILE = 'atom-one-dark.css';

interface CodeThemeContextType {
	themeFile: string;
	setThemeFile: (file: string) => void;
}

const codeThemeScript = `
  (function() {
    const DEFAULT_THEME = '${DEFAULT_THEME_FILE}';
    const savedTheme = localStorage.getItem('code-theme') || DEFAULT_THEME;
    const linkId = 'highlight-js-theme';
    const link = document.createElement('link');
    link.id = linkId;
    link.rel = 'stylesheet';
    link.href = \`https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/\${savedTheme}\`;
    document.head.appendChild(link);
  })();
`;

export function CodeThemeScript() {
	return <script dangerouslySetInnerHTML={{ __html: codeThemeScript }} />;
}

const CodeThemeContext = createContext<CodeThemeContextType | undefined>(undefined);

export const CodeThemeProvider = ({ children }: { children: ReactNode }) => {
	const [themeFile, setThemeFile] = useState<string>(DEFAULT_THEME_FILE);

	useEffect(() => {
		const savedTheme = localStorage.getItem('code-theme') || DEFAULT_THEME_FILE;
		setThemeFile(savedTheme);
	}, []);

	useEffect(() => {
		const linkId = 'highlight-js-theme';
		let linkElement = document.getElementById(linkId) as HTMLLinkElement;
		if (!linkElement) {
			linkElement = document.createElement('link');
			linkElement.id = linkId;
			linkElement.rel = 'stylesheet';
			document.head.appendChild(linkElement);
		}
		linkElement.href = `https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/${themeFile}`;
	}, [themeFile]);

	const handleSetTheme = (newThemeFile: string) => {
		setThemeFile(newThemeFile);
		localStorage.setItem('code-theme', newThemeFile);
	};

	return (
		<CodeThemeContext.Provider value={{ themeFile, setThemeFile: handleSetTheme }}>
			{children}
		</CodeThemeContext.Provider>
	);
};

export const useCodeTheme = () => {
	const context = useContext(CodeThemeContext);
	if (context === undefined) {
		throw new Error('useCodeTheme must be used within a CodeThemeProvider');
	}
	return context;
};
