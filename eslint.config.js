import js from '@eslint/js';
import ts from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import svelte from 'eslint-plugin-svelte';
import prettier from 'eslint-config-prettier';
import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default [
	js.configs.recommended,
	{
		files: ['**/*.ts'],
		plugins: {
			'@typescript-eslint': ts
		},
		languageOptions: {
			parser: tsParser,
			parserOptions: {
				sourceType: 'module',
				ecmaVersion: 2020,
				project: './tsconfig.json',
				tsconfigRootDir: __dirname
			},
			globals: {
				window: 'readonly',
				document: 'readonly',
				localStorage: 'readonly'
			}
		},
		rules: {
			...ts.configs.recommended.rules,
			'no-unused-vars': ['error', { argsIgnorePattern: '^_' }]
		}
	},
	{
		files: ['**/*.js'],
		languageOptions: {
			sourceType: 'module',
			ecmaVersion: 2020,
			globals: {
				console: 'readonly',
				process: 'readonly',
				__dirname: 'readonly',
				__filename: 'readonly'
			}
		}
	},
	...svelte.configs['flat/recommended'],
	{
		files: ['**/*.svelte'],
		languageOptions: {
			parserOptions: {
				parser: tsParser
			},
			globals: {
				navigator: 'readonly',
				window: 'readonly',
				document: 'readonly',
				setTimeout: 'readonly',
				console: 'readonly',
				Blob: 'readonly',
				URL: 'readonly',
				Event: 'readonly',
				HTMLInputElement: 'readonly',
				FileReader: 'readonly',
				alert: 'readonly',
				localStorage: 'readonly'
			}
		},
		rules: {
			'no-unused-vars': ['error', { argsIgnorePattern: '^_' }]
		}
	},
	prettier,
	{
		ignores: ['build/', '.svelte-kit/', 'dist/']
	}
];
