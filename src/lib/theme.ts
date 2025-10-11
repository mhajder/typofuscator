import { writable } from 'svelte/store';

export type Theme = 'light' | 'dark';

function getSystemTheme(): Theme {
	if (typeof window === 'undefined') return 'light';
	return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function getStoredTheme(): Theme | null {
	if (typeof window === 'undefined') return null;
	return window.localStorage.getItem('typofuscator-theme') as Theme | null;
}

function createThemeStore() {
	const THEME_KEY = 'typofuscator-theme';

	// Don't initialize yet - wait for init() to be called
	const { subscribe, set, update } = writable<Theme>('light');

	return {
		subscribe,
		set: (theme: Theme) => {
			if (typeof window !== 'undefined') {
				window.localStorage.setItem(THEME_KEY, theme);
				applyTheme(theme);
			}
			set(theme);
		},
		toggle: () => {
			update((current) => {
				const newTheme = current === 'light' ? 'dark' : 'light';
				if (typeof window !== 'undefined') {
					window.localStorage.setItem(THEME_KEY, newTheme);
					applyTheme(newTheme);
				}
				return newTheme;
			});
		},
		init: () => {
			if (typeof window !== 'undefined') {
				// Get the current theme from storage or system
				const storedTheme = getStoredTheme();
				const initialTheme = storedTheme || getSystemTheme();

				// Apply it to the DOM
				applyTheme(initialTheme);

				// Update the store
				set(initialTheme);
			}
		}
	};
}

function applyTheme(theme: Theme) {
	if (typeof window === 'undefined') return;

	const html = window.document.documentElement;

	if (theme === 'dark') {
		html.classList.add('dark');
	} else {
		html.classList.remove('dark');
	}
}

export const theme = createThemeStore();
