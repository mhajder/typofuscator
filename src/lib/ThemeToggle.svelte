<script lang="ts">
	import { theme } from './theme';
	import type { Theme } from './theme';

	function toggleTheme() {
		theme.toggle();
	}

	function getThemeIcon(themeValue: Theme): string {
		return themeValue === 'light' ? '☀️' : '🌙';
	}

	function getThemeLabel(themeValue: Theme): string {
		return themeValue === 'light' ? 'Light' : 'Dark';
	}
</script>

<button
	onclick={toggleTheme}
	class="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer transition-all hover:opacity-80 hover:-translate-y-0.5 text-sm font-medium text-gray-900 dark:text-gray-100"
	title="Toggle theme (Current: {getThemeLabel($theme)})"
	aria-label="Toggle theme"
>
	<span class="text-xl">{getThemeIcon($theme)}</span>
	<span>{getThemeLabel($theme)}</span>
</button>
