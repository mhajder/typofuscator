<script lang="ts">
	import { encryptText, defaultSettings } from '$lib/typofuscator';
	import type { TypofuscatorSettings } from '$lib/typofuscator';
	import SettingsPanel from '$lib/SettingsPanel.svelte';
	import ThemeToggle from '$lib/ThemeToggle.svelte';

	let inputText = '';
	let outputText = '';
	let settings: TypofuscatorSettings = { ...defaultSettings };
	let settingsOpen = false;
	let copySuccess = false;

	const SETTINGS_KEY = 'typofuscator-settings';

	// Load settings from localStorage if available
	function loadSettingsFromStorage(): TypofuscatorSettings {
		try {
			const raw = localStorage.getItem(SETTINGS_KEY);
			if (raw) {
				const parsed = JSON.parse(raw);
				return { ...defaultSettings, ...parsed };
			}
		} catch {
			// Ignore localStorage errors
		}
		return { ...defaultSettings };
	}

	settings = loadSettingsFromStorage();

	// Save settings to localStorage whenever they change
	$: {
		try {
			localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
		} catch {
			// Ignore localStorage errors
		}
	}

	function resetSettingsToDefaults() {
		settings = { ...defaultSettings };
		localStorage.removeItem(SETTINGS_KEY);
	}

	// Reactive statement to update output whenever input or settings change
	$: outputText = inputText ? encryptText(inputText, settings) : '';

	const exampleText =
		'Algorithm that scrambles letters within words while keeping them readable to humans. People can read it, maybe with difficulty but they can read it. AI gets confused, translator also gets confused, so we can filter out peoples that are using translators.';

	function loadExample() {
		inputText = exampleText;
	}

	function clearAll() {
		inputText = '';
	}

	function regenerateOutput() {
		if (inputText) {
			// Force new randomization by using a new random seed temporarily
			const originalSeed = settings.seed;
			const tempSettings = {
				...settings,
				seed: originalSeed !== undefined ? undefined : Math.random() * 1000000
			};
			outputText = encryptText(inputText, tempSettings);
		}
	}

	async function copyToClipboard() {
		if (outputText) {
			try {
				await navigator.clipboard.writeText(outputText);
				copySuccess = true;
				setTimeout(() => (copySuccess = false), 2000);
			} catch (err) {
				console.error('Failed to copy to clipboard:', err);
			}
		}
	}

	function exportSettings() {
		const settingsJson = JSON.stringify(settings, null, 2);
		const blob = new Blob([settingsJson], { type: 'application/json' });
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = 'typofuscator-settings.json';
		a.click();
		URL.revokeObjectURL(url);
	}

	function importSettings(event: Event) {
		const input = event.target as HTMLInputElement;
		const file = input.files?.[0];
		if (file) {
			const reader = new FileReader();
			reader.onload = (e) => {
				try {
					const importedSettings = JSON.parse(e.target?.result as string);
					settings = { ...defaultSettings, ...importedSettings };
					localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
				} catch {
					alert('Invalid settings file');
				}
			};
			reader.readAsText(file);
		}
	}
</script>

<svelte:head>
	<title>Typofuscator - Text Obfuscation Tool</title>
	<meta
		name="description"
		content="Scramble text while keeping it readable to humans but confusing to translators"
	/>
</svelte:head>

<main
	class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 py-8 px-4"
>
	<div class="max-w-4xl mx-auto">
		<!-- Header -->
		<div class="mb-8">
			<div class="flex items-center justify-center mb-4 gap-4">
				<h1 class="text-4xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
					🔤 Typofuscator
				</h1>
				<ThemeToggle />
			</div>
			<div class="text-center">
				<p class="text-gray-600 dark:text-gray-300 text-lg">
					Scramble text while keeping it human-readable
				</p>
				<p class="text-sm text-gray-500 dark:text-gray-400 mt-2">
					Confuses translators, trolls and spies by scrambling letters within words
				</p>
			</div>
		</div>

		<!-- Main Content -->
		<div
			class="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-6 border border-gray-200 dark:border-gray-700"
		>
			<div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
				<!-- Input Section -->
				<div class="space-y-4">
					<div class="flex items-center justify-between">
						<label for="input" class="block text-sm font-semibold text-gray-700 dark:text-gray-300">
							Original Text
						</label>
						<div class="flex gap-2">
							<button
								on:click={loadExample}
								class="text-xs bg-blue-100 hover:bg-blue-200 dark:bg-blue-900 dark:hover:bg-blue-800 text-blue-700 dark:text-blue-200 px-3 py-1 rounded-md transition-colors"
							>
								Load Example
							</button>
							<button
								on:click={clearAll}
								class="text-xs bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 px-3 py-1 rounded-md transition-colors"
							>
								Clear
							</button>
						</div>
					</div>
					<textarea
						id="input"
						bind:value={inputText}
						placeholder="Enter your text here..."
						class="w-full h-64 p-4 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent resize-none text-sm leading-relaxed bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
					></textarea>
					<div class="text-xs text-gray-500 dark:text-gray-400">
						Characters: {inputText.length}
					</div>
				</div>

				<!-- Output Section -->
				<div class="space-y-4">
					<div class="flex items-center justify-between">
						<label
							for="output"
							class="block text-sm font-semibold text-gray-700 dark:text-gray-300"
						>
							Obfuscated Text
						</label>
						<div class="flex gap-2">
							<button
								on:click={copyToClipboard}
								disabled={!outputText}
								class="text-xs hover:bg-green-200 dark:hover:bg-green-800 disabled:bg-gray-100 dark:disabled:bg-gray-700 disabled:text-gray-400 dark:disabled:text-gray-500 px-3 py-1 rounded-md transition-colors"
								class:bg-green-100={!copySuccess}
								class:dark:bg-green-900={!copySuccess}
								class:text-green-700={!copySuccess}
								class:dark:text-green-200={!copySuccess}
								class:bg-green-600={copySuccess}
								class:text-white={copySuccess}
							>
								{copySuccess ? '✓ Copied!' : 'Copy to Clipboard'}
							</button>
						</div>
					</div>
					<textarea
						id="output"
						value={outputText}
						readonly
						placeholder="Obfuscated text will appear here..."
						class="w-full h-64 p-4 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-900 resize-none text-sm leading-relaxed text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
					></textarea>
					<div class="flex justify-between items-center text-xs text-gray-500 dark:text-gray-400">
						<span>Characters: {outputText.length}</span>
						{#if settings.seed !== undefined}
							<span
								class="bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200 px-2 py-1 rounded"
								>Seed: {settings.seed}</span
							>
						{/if}
					</div>
				</div>
			</div>
		</div>

		<!-- Quick Actions -->
		<div
			class="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 mb-6 border border-gray-200 dark:border-gray-700"
		>
			<div class="flex items-center justify-between flex-wrap gap-3">
				<div class="flex items-center gap-3 flex-wrap">
					<button
						on:click={regenerateOutput}
						disabled={!inputText}
						class="px-4 py-2 bg-purple-100 hover:bg-purple-200 dark:bg-purple-900 dark:hover:bg-purple-800 disabled:bg-gray-100 dark:disabled:bg-gray-700 disabled:text-gray-400 dark:disabled:text-gray-500 text-purple-700 dark:text-purple-200 rounded-lg transition-colors font-medium flex items-center gap-2"
					>
						🎲 Regenerate
					</button>
				</div>
			</div>
		</div>

		<!-- Advanced Settings Panel -->
		<div class="mb-6">
			<SettingsPanel
				bind:settings
				bind:isOpen={settingsOpen}
				onExportSettings={exportSettings}
				onImportSettings={importSettings}
				resetToDefaults={resetSettingsToDefaults}
			/>
		</div>

		<!-- Footer -->
		<div class="text-center mt-8 text-sm text-gray-500 dark:text-gray-400">
			<p>
				<a
					href="https://svelte.dev"
					target="_blank"
					rel="noopener noreferrer"
					class="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 underline"
					>Built with Svelte</a
				>
				•
				<a
					href="https://github.com/mhajder/typofuscator"
					target="_blank"
					rel="noopener noreferrer"
					class="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 underline"
					>Open source text obfuscation tool</a
				>
			</p>
		</div>
	</div>
</main>
