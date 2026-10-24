import { dirname } from 'path';
import { fileURLToPath } from 'url';
import { FlatCompat } from '@eslint/eslintrc';
import typescriptEslintPlugin from '@typescript-eslint/eslint-plugin';
import sonarjs from 'eslint-plugin-sonarjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
	baseDirectory: __dirname,
});

const eslintConfig = [
	{
		ignores: ['.next/**', 'out/**', 'node_modules/**', '.agents/**'],
	},
	sonarjs.configs.recommended,
	...compat.extends('next/core-web-vitals'),
	{
		rules: {
			// Calibrate Sonar rules for Next.js static blog codebase
			'sonarjs/cognitive-complexity': ['warn', 100],
			'sonarjs/no-nested-conditional': 'warn',
			'sonarjs/no-nested-template-literals': 'warn',
			'sonarjs/no-nested-functions': 'off',
			// Node build scripts and git CLI operations run in trusted dev/CI environments
			'sonarjs/no-os-command-from-path': 'off',
			// UI uses Math.random() for harmless animations / random article picker
			'sonarjs/pseudo-random': 'off',
			// Project uses exactOptionalPropertyTypes: true in tsconfig, so ?: T | undefined is required
			'sonarjs/no-redundant-optional': 'off',
			'sonarjs/super-linear-regex': 'warn',
		},
	},
	{
		files: ['**/*.{ts,tsx}'],
		plugins: {
			'@typescript-eslint': typescriptEslintPlugin,
		},
		rules: {
			'no-unused-vars': 'off',
			'@typescript-eslint/no-unused-vars': [
				'warn',
				{
					argsIgnorePattern: '^_',
					varsIgnorePattern: '^_',
				},
			],
			'react/no-unescaped-entities': 'warn',
		},
	},
	{
		files: ['**/*.{js,jsx,mjs,cjs}'],
		rules: {
			'no-unused-vars': [
				'warn',
				{
					argsIgnorePattern: '^_',
					varsIgnorePattern: '^_',
				},
			],
			'react/no-unescaped-entities': 'warn',
		},
	},
];

export default eslintConfig;
