import { dirname } from 'path';
import { fileURLToPath } from 'url';
import { FlatCompat } from '@eslint/eslintrc';
import typescriptEslintPlugin from '@typescript-eslint/eslint-plugin';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
	baseDirectory: __dirname,
});

const eslintConfig = [
	{
		ignores: ['.next/**', 'out/**', 'node_modules/**'],
	},
	...compat.extends('next/core-web-vitals'),
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
