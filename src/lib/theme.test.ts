import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { get } from 'svelte/store';
import { theme, getSystemTheme, getStoredTheme, applyTheme } from './theme';

describe('theme store', () => {
	const THEME_KEY = 'typofuscator-theme';

	describe('SSR environment (window is undefined)', () => {
		beforeEach(() => {
			vi.stubGlobal('window', undefined);
		});

		afterEach(() => {
			vi.unstubAllGlobals();
		});

		it('should have initial default value of light without crashing', () => {
			expect(get(theme)).toBe('light');
		});

		it('should update store state when set is called in SSR', () => {
			theme.set('dark');
			expect(get(theme)).toBe('dark');
			theme.set('light');
			expect(get(theme)).toBe('light');
		});

		it('should update store state when toggle is called in SSR', () => {
			theme.set('light');
			theme.toggle();
			expect(get(theme)).toBe('dark');
			theme.toggle();
			expect(get(theme)).toBe('light');
		});

		it('should safely do nothing when init is called in SSR', () => {
			expect(() => theme.init()).not.toThrow();
		});

		it('getSystemTheme should return light in SSR', () => {
			expect(getSystemTheme()).toBe('light');
		});

		it('getStoredTheme should return null in SSR', () => {
			expect(getStoredTheme()).toBeNull();
		});

		it('applyTheme should safely return without error in SSR', () => {
			expect(() => applyTheme('dark')).not.toThrow();
			expect(() => applyTheme('light')).not.toThrow();
		});
	});

	describe('Browser environment (window is defined)', () => {
		let storage: Record<string, string>;
		let classList: Set<string>;
		let mockHtmlElement: {
			classList: {
				add: (_cls: string) => void;
				remove: (_cls: string) => void;
				contains: (_cls: string) => boolean;
			};
		};
		let prefersDark = false;

		beforeEach(() => {
			storage = {};
			classList = new Set<string>();
			prefersDark = false;

			mockHtmlElement = {
				classList: {
					add: (cls: string) => classList.add(cls),
					remove: (cls: string) => classList.delete(cls),
					contains: (cls: string) => classList.has(cls)
				}
			};

			const mockWindow = {
				localStorage: {
					getItem: (key: string) => storage[key] ?? null,
					setItem: (key: string, value: string) => {
						storage[key] = value;
					},
					removeItem: (key: string) => {
						delete storage[key];
					},
					clear: () => {
						storage = {};
					}
				},
				matchMedia: vi.fn().mockImplementation((query: string) => ({
					matches: query.includes('dark') ? prefersDark : !prefersDark,
					media: query
				})),
				document: {
					documentElement: mockHtmlElement
				}
			};

			vi.stubGlobal('window', mockWindow);
		});

		afterEach(() => {
			vi.unstubAllGlobals();
		});

		it('should save to localStorage and add dark class to DOM on set("dark")', () => {
			theme.set('dark');
			expect(get(theme)).toBe('dark');
			expect(storage[THEME_KEY]).toBe('dark');
			expect(classList.has('dark')).toBe(true);
		});

		it('should save to localStorage and remove dark class from DOM on set("light")', () => {
			theme.set('dark');
			expect(classList.has('dark')).toBe(true);

			theme.set('light');
			expect(get(theme)).toBe('light');
			expect(storage[THEME_KEY]).toBe('light');
			expect(classList.has('dark')).toBe(false);
		});

		it('should toggle theme from light to dark and back in browser', () => {
			theme.set('light');
			expect(classList.has('dark')).toBe(false);

			theme.toggle();
			expect(get(theme)).toBe('dark');
			expect(storage[THEME_KEY]).toBe('dark');
			expect(classList.has('dark')).toBe(true);

			theme.toggle();
			expect(get(theme)).toBe('light');
			expect(storage[THEME_KEY]).toBe('light');
			expect(classList.has('dark')).toBe(false);
		});

		it('should initialize theme from stored localStorage preference when present', () => {
			storage[THEME_KEY] = 'dark';
			theme.init();

			expect(get(theme)).toBe('dark');
			expect(classList.has('dark')).toBe(true);

			storage[THEME_KEY] = 'light';
			theme.init();

			expect(get(theme)).toBe('light');
			expect(classList.has('dark')).toBe(false);
		});

		it('should fall back to system theme when no stored preference exists (system prefers dark)', () => {
			prefersDark = true;
			theme.init();

			expect(get(theme)).toBe('dark');
			expect(classList.has('dark')).toBe(true);
		});

		it('should fall back to system theme when no stored preference exists (system prefers light)', () => {
			prefersDark = false;
			theme.init();

			expect(get(theme)).toBe('light');
			expect(classList.has('dark')).toBe(false);
		});
	});
});
