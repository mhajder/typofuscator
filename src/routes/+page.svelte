<script lang="ts">
	import { onMount } from 'svelte';
	import { SvelteURL } from 'svelte/reactivity';
	import { encryptTextWithMetrics, defaultSettings, computeDiffSegments } from '#lib/typofuscator';
	import type {
		TypofuscatorSettings,
		ObfuscationMetrics,
		ScrambleIntensity,
		ScrambleAlgorithm,
		SimilarCharMode,
		SimilarCharStyle,
		ZeroWidthMode,
		QwertyTypoMode,
		DiffSegment
	} from '#lib/typofuscator';
	import SettingsPanel from '#lib/SettingsPanel.svelte';
	import ThemeToggle from '#lib/ThemeToggle.svelte';

	const SETTINGS_KEY = 'typofuscator-settings';

	// Load settings from localStorage if available
	function loadSettingsFromStorage(): TypofuscatorSettings {
		if (typeof window === 'undefined') return { ...defaultSettings };
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

	let inputText = $state('');
	let manualOutput = $state<{ text: string; metrics: ObfuscationMetrics } | null>(null);
	let settings: TypofuscatorSettings = $state(loadSettingsFromStorage());
	let settingsOpen = $state(false);
	let copySuccess = $state(false);
	let shareSuccess = $state(false);
	let showDiff = $state(false);
	let canShare = $state(false);
	let mounted = $state(false);

	function loadStateFromUrl() {
		if (typeof window === 'undefined') return;
		const search = window.location.search;
		const hash = window.location.hash.replace(/^#\??/, '');
		const params = new URLSearchParams(search || hash);

		const textParam = params.get('text');
		if (textParam !== null) {
			inputText = textParam;
		}

		const intensityParam = params.get('intensity') as ScrambleIntensity | null;
		if (intensityParam && ['light', 'medium', 'heavy'].includes(intensityParam)) {
			settings.scrambleIntensity = intensityParam;
		}

		const algoParam = params.get('algo') as ScrambleAlgorithm | null;
		if (algoParam && ['swap', 'shuffle', 'reverse'].includes(algoParam)) {
			settings.customAlgorithm = algoParam;
		}

		const homoglyphsParam = params.get('homoglyphs') as SimilarCharMode | null;
		if (homoglyphsParam && ['off', 'some', 'all'].includes(homoglyphsParam)) {
			settings.similarCharMode = homoglyphsParam;
		}

		const styleParam = params.get('style') as SimilarCharStyle | null;
		if (styleParam && ['mixed', 'cyrillic', 'latin', 'greek'].includes(styleParam)) {
			settings.similarCharStyle = styleParam;
		}

		const zeroWidthParam = params.get('zeroWidth') as ZeroWidthMode | null;
		if (zeroWidthParam && ['off', 'subtle', 'aggressive'].includes(zeroWidthParam)) {
			settings.zeroWidthMode = zeroWidthParam;
		}

		const qwertyParam = params.get('qwerty') as QwertyTypoMode | null;
		if (qwertyParam && ['off', 'some', 'all'].includes(qwertyParam)) {
			settings.qwertyTypoMode = qwertyParam;
		}

		const qwertyRateParam = params.get('qwertyRate');
		if (qwertyRateParam) {
			const parsed = parseInt(qwertyRateParam, 10);
			if (!isNaN(parsed) && parsed >= 0 && parsed <= 100) {
				settings.qwertyTypoRate = parsed;
			}
		}

		const minWordParam = params.get('minWord');
		if (minWordParam) {
			const parsed = parseInt(minWordParam, 10);
			if (!isNaN(parsed) && parsed >= 1 && parsed <= 10) {
				settings.minWordLength = parsed;
			}
		}

		const excludeParam = params.get('exclude');
		if (excludeParam) {
			settings.excludeWords = excludeParam
				.split(',')
				.map((w) => w.trim())
				.filter((w) => w.length > 0);
		}

		const seedParam = params.get('seed');
		if (seedParam) {
			const parsed = parseInt(seedParam, 10);
			if (!isNaN(parsed)) {
				settings.seed = parsed;
			}
		}
	}

	onMount(() => {
		loadStateFromUrl();
		canShare = typeof navigator !== 'undefined' && typeof navigator.share === 'function';
		mounted = true;
	});

	// Save settings to localStorage whenever they change
	$effect(() => {
		try {
			localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
		} catch {
			// Ignore localStorage errors
		}
	});

	function resetSettingsToDefaults() {
		settings = { ...defaultSettings };
		if (typeof window !== 'undefined') {
			localStorage.removeItem(SETTINGS_KEY);
		}
	}

	let activeResult = $derived(
		manualOutput !== null
			? manualOutput
			: inputText
				? encryptTextWithMetrics(inputText, settings)
				: {
						text: '',
						metrics: {
							inputChars: 0,
							outputChars: 0,
							inputWords: 0,
							scrambledWords: 0,
							scrambledLetters: 0,
							homoglyphsSubstituted: 0,
							zeroWidthInjected: 0,
							qwertyTyposSubstituted: 0
						}
					}
	);

	let outputText = $derived(activeResult.text);
	let metrics = $derived(activeResult.metrics);
	let diffSegments: DiffSegment[] = $derived(
		showDiff && inputText && outputText ? computeDiffSegments(inputText, outputText) : []
	);

	const exampleText =
		'Algorithm that scrambles letters within words while keeping them readable to humans. People can read it, maybe with difficulty but they can read it. AI gets confused, translator also gets confused, so we can filter out peoples that are using translators.';

	function loadExample() {
		manualOutput = null;
		inputText = exampleText;
	}

	function clearAll() {
		manualOutput = null;
		inputText = '';
	}

	function onInputChange() {
		manualOutput = null;
	}

	function regenerateOutput() {
		if (inputText) {
			const tempSettings = {
				...settings,
				seed: settings.seed !== undefined ? Math.floor(Math.random() * 1000000) : undefined
			};
			manualOutput = encryptTextWithMetrics(inputText, tempSettings);
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

	function getShareUrl(): string {
		if (typeof window === 'undefined') return '';
		const url = new SvelteURL(window.location.href);
		url.search = '';
		url.hash = '';

		if (inputText) {
			url.searchParams.set('text', inputText);
		}
		if (settings.scrambleIntensity !== defaultSettings.scrambleIntensity) {
			url.searchParams.set('intensity', settings.scrambleIntensity);
		}
		if (settings.customAlgorithm !== defaultSettings.customAlgorithm) {
			url.searchParams.set('algo', settings.customAlgorithm);
		}
		if (settings.similarCharMode !== defaultSettings.similarCharMode) {
			url.searchParams.set('homoglyphs', settings.similarCharMode);
		}
		if (settings.similarCharStyle !== defaultSettings.similarCharStyle) {
			url.searchParams.set('style', settings.similarCharStyle);
		}
		if (settings.zeroWidthMode !== defaultSettings.zeroWidthMode) {
			url.searchParams.set('zeroWidth', settings.zeroWidthMode);
		}
		if (settings.qwertyTypoMode !== defaultSettings.qwertyTypoMode) {
			url.searchParams.set('qwerty', settings.qwertyTypoMode);
		}
		if (settings.qwertyTypoRate !== defaultSettings.qwertyTypoRate) {
			url.searchParams.set('qwertyRate', String(settings.qwertyTypoRate));
		}
		if (settings.minWordLength !== defaultSettings.minWordLength) {
			url.searchParams.set('minWord', String(settings.minWordLength));
		}
		if (settings.excludeWords.length > 0) {
			url.searchParams.set('exclude', settings.excludeWords.join(','));
		}
		if (settings.seed !== undefined) {
			url.searchParams.set('seed', String(settings.seed));
		}
		return url.toString();
	}

	async function copyShareLink() {
		const shareUrl = getShareUrl();
		if (!shareUrl) return;

		if (typeof window !== 'undefined' && window.history) {
			window.history.replaceState({}, '', shareUrl);
		}

		if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
			try {
				await navigator.share({
					title: 'Typofuscator',
					text: inputText
						? `Obfuscated text: "${outputText.slice(0, 100)}${outputText.length > 100 ? '...' : ''}"`
						: 'Typofuscator - Text Obfuscation Tool',
					url: shareUrl
				});
				shareSuccess = true;
				setTimeout(() => (shareSuccess = false), 2000);
				return;
			} catch (err: unknown) {
				if (err instanceof Error && err.name === 'AbortError') {
					return;
				}
			}
		}

		try {
			await navigator.clipboard.writeText(shareUrl);
			shareSuccess = true;
			setTimeout(() => (shareSuccess = false), 2000);
		} catch (err) {
			console.error('Failed to copy share link:', err);
		}
	}

	function handleKeydown(event: KeyboardEvent) {
		const isModifier = event.ctrlKey || event.metaKey;

		// Ctrl+Enter or Cmd+Enter: Regenerate scramble
		if (isModifier && event.key === 'Enter') {
			if (inputText) {
				event.preventDefault();
				regenerateOutput();
			}
			return;
		}

		// Ctrl+Shift+C or Cmd+Shift+C: Copy obfuscated text to clipboard
		if (isModifier && event.shiftKey && (event.key === 'c' || event.key === 'C')) {
			if (outputText) {
				event.preventDefault();
				copyToClipboard();
			}
			return;
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
					if (typeof window !== 'undefined') {
						localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
					}
				} catch {
					alert('Invalid settings file');
				}
			};
			reader.readAsText(file);
		}
	}
</script>

<svelte:window onkeydown={handleKeydown} />

<svelte:head>
	<title>Typofuscator - Text Obfuscation Tool</title>
	<meta
		name="description"
		content="Scramble text while keeping it readable to humans but confusing to translators"
	/>
</svelte:head>

<main
	data-hydrated={mounted}
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
								onclick={loadExample}
								class="text-xs bg-blue-100 hover:bg-blue-200 dark:bg-blue-900 dark:hover:bg-blue-800 text-blue-700 dark:text-blue-200 px-3 py-1 rounded-md transition-colors"
							>
								Load Example
							</button>
							<button
								onclick={clearAll}
								class="text-xs bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 px-3 py-1 rounded-md transition-colors"
							>
								Clear
							</button>
						</div>
					</div>
					<textarea
						id="input"
						bind:value={inputText}
						oninput={onInputChange}
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
								type="button"
								onclick={() => (showDiff = !showDiff)}
								disabled={!outputText}
								class="text-xs hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-50 px-2.5 py-1 rounded-md transition-colors inline-flex items-center gap-1 font-medium"
								class:bg-indigo-100={showDiff}
								class:dark:bg-indigo-900={showDiff}
								class:text-indigo-700={showDiff}
								class:dark:text-indigo-200={showDiff}
								class:bg-gray-100={!showDiff}
								class:dark:bg-gray-800={!showDiff}
								class:text-gray-700={!showDiff}
								class:dark:text-gray-300={!showDiff}
								title="Toggle visual diff highlighting changes"
							>
								{showDiff ? '📝 Raw Text' : '👁️ Highlight Changes'}
							</button>
							<button
								onclick={copyToClipboard}
								disabled={!outputText}
								class="text-xs hover:bg-green-200 dark:hover:bg-green-800 disabled:bg-gray-100 dark:disabled:bg-gray-700 disabled:text-gray-400 dark:disabled:text-gray-500 px-3 py-1 rounded-md transition-colors inline-flex items-center gap-1"
								class:bg-green-100={!copySuccess}
								class:dark:bg-green-900={!copySuccess}
								class:text-green-700={!copySuccess}
								class:dark:text-green-200={!copySuccess}
								class:bg-green-600={copySuccess}
								class:text-white={copySuccess}
							>
								{copySuccess ? '✓ Copied!' : 'Copy to Clipboard'}
								<kbd
									class="hidden md:inline-block px-1 py-0.2 bg-black/10 dark:bg-white/10 rounded font-mono text-[9px]"
									>⌘⇧C</kbd
								>
							</button>
						</div>
					</div>
					{#if showDiff}
						<div
							id="diff-output"
							class="w-full h-64 p-4 border border-indigo-300 dark:border-indigo-700 rounded-lg bg-gray-50 dark:bg-gray-900 overflow-y-auto text-sm leading-relaxed text-gray-900 dark:text-gray-100 whitespace-pre-wrap font-mono"
						>
							{#each diffSegments as seg, i (i)}
								{#if seg.type === 'zero-width'}
									<span
										class="inline-block bg-purple-100 dark:bg-purple-900/60 text-purple-700 dark:text-purple-300 font-mono text-[10px] px-1 py-0.5 rounded mx-0.5 font-bold"
										title="Zero-Width Character">{seg.text}</span
									>
								{:else if seg.type === 'homoglyph'}
									<mark
										class="bg-amber-200 dark:bg-amber-900/60 text-amber-900 dark:text-amber-200 rounded px-0.5 font-medium"
										title="Homoglyph">{seg.text}</mark
									>
								{:else if seg.type === 'typo'}
									<mark
										class="bg-rose-200 dark:bg-rose-900/60 text-rose-900 dark:text-rose-200 rounded px-0.5 font-medium"
										title="Keyboard Typo">{seg.text}</mark
									>
								{:else if seg.type === 'scrambled'}
									<mark
										class="bg-indigo-200 dark:bg-indigo-900/60 text-indigo-900 dark:text-indigo-200 rounded px-0.5 font-medium"
										title="Scrambled Letter">{seg.text}</mark
									>
								{:else}
									<span>{seg.text}</span>
								{/if}
							{/each}
						</div>
					{:else}
						<textarea
							id="output"
							value={outputText}
							readonly
							placeholder="Obfuscated text will appear here..."
							class="w-full h-64 p-4 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-900 resize-none text-sm leading-relaxed text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
						></textarea>
					{/if}
					{#if showDiff}
						<div
							class="flex flex-wrap gap-3 text-[11px] text-gray-500 dark:text-gray-400 items-center pt-1"
						>
							<span class="font-semibold">Legend:</span>
							<span class="inline-flex items-center gap-1"
								><span class="w-2.5 h-2.5 bg-indigo-200 dark:bg-indigo-900/60 rounded"></span> Scrambled</span
							>
							<span class="inline-flex items-center gap-1"
								><span class="w-2.5 h-2.5 bg-amber-200 dark:bg-amber-900/60 rounded"></span> Homoglyph</span
							>
							<span class="inline-flex items-center gap-1"
								><span class="w-2.5 h-2.5 bg-rose-200 dark:bg-rose-900/60 rounded"></span> Typo</span
							>
							<span class="inline-flex items-center gap-1"
								><span class="w-2.5 h-2.5 bg-purple-200 dark:bg-purple-900/60 rounded"></span> Zero-Width</span
							>
						</div>
					{/if}
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

			<!-- Real-time Obfuscation Metrics Banner -->
			<div
				id="metrics-panel"
				class="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700 grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 text-center"
			>
				<div
					class="bg-gray-50 dark:bg-gray-900/60 p-2.5 rounded-lg border border-gray-100 dark:border-gray-800"
				>
					<span class="block text-xs text-gray-500 dark:text-gray-400">Total Words</span>
					<span class="text-base font-bold text-gray-800 dark:text-gray-200"
						>{metrics.inputWords}</span
					>
				</div>
				<div
					class="bg-gray-50 dark:bg-gray-900/60 p-2.5 rounded-lg border border-gray-100 dark:border-gray-800"
				>
					<span class="block text-xs text-gray-500 dark:text-gray-400">Characters</span>
					<span class="text-base font-bold text-gray-800 dark:text-gray-200"
						>{metrics.inputChars} → {metrics.outputChars}</span
					>
				</div>
				<div
					class="bg-gray-50 dark:bg-gray-900/60 p-2.5 rounded-lg border border-gray-100 dark:border-gray-800"
				>
					<span class="block text-xs text-gray-500 dark:text-gray-400">Words Scrambled</span>
					<span class="text-base font-bold text-indigo-600 dark:text-indigo-400">
						{metrics.scrambledWords}
						<span class="text-xs font-normal text-gray-500 dark:text-gray-400">
							({metrics.inputWords > 0
								? Math.round((metrics.scrambledWords / metrics.inputWords) * 100)
								: 0}%)
						</span>
					</span>
				</div>
				<div
					class="bg-gray-50 dark:bg-gray-900/60 p-2.5 rounded-lg border border-gray-100 dark:border-gray-800"
				>
					<span class="block text-xs text-gray-500 dark:text-gray-400">Letters Scrambled</span>
					<span class="text-base font-bold text-indigo-600 dark:text-indigo-400"
						>{metrics.scrambledLetters}</span
					>
				</div>
				<div
					class="bg-gray-50 dark:bg-gray-900/60 p-2.5 rounded-lg border border-gray-100 dark:border-gray-800"
				>
					<span class="block text-xs text-gray-500 dark:text-gray-400">Homoglyphs</span>
					<span class="text-base font-bold text-amber-600 dark:text-amber-400"
						>{metrics.homoglyphsSubstituted}</span
					>
				</div>
				<div
					class="bg-gray-50 dark:bg-gray-900/60 p-2.5 rounded-lg border border-gray-100 dark:border-gray-800"
				>
					<span class="block text-xs text-gray-500 dark:text-gray-400">Zero-Width</span>
					<span class="text-base font-bold text-purple-600 dark:text-purple-400"
						>{metrics.zeroWidthInjected}</span
					>
				</div>
				<div
					class="bg-gray-50 dark:bg-gray-900/60 p-2.5 rounded-lg border border-gray-100 dark:border-gray-800"
				>
					<span class="block text-xs text-gray-500 dark:text-gray-400">Typos</span>
					<span class="text-base font-bold text-rose-600 dark:text-rose-400"
						>{metrics.qwertyTyposSubstituted}</span
					>
				</div>
				<div
					class="bg-gray-50 dark:bg-gray-900/60 p-2.5 rounded-lg border border-gray-100 dark:border-gray-800"
				>
					<span class="block text-xs text-gray-500 dark:text-gray-400">Obfuscation Rate</span>
					<span class="text-base font-bold text-emerald-600 dark:text-emerald-400">
						{metrics.inputChars > 0
							? Math.min(
									100,
									Math.round(
										((metrics.scrambledLetters +
											metrics.homoglyphsSubstituted +
											metrics.zeroWidthInjected +
											metrics.qwertyTyposSubstituted) /
											metrics.inputChars) *
											100
									)
								)
							: 0}%
					</span>
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
						onclick={regenerateOutput}
						disabled={!inputText}
						class="px-4 py-2 bg-purple-100 hover:bg-purple-200 dark:bg-purple-900 dark:hover:bg-purple-800 disabled:bg-gray-100 dark:disabled:bg-gray-700 disabled:text-gray-400 dark:disabled:text-gray-500 text-purple-700 dark:text-purple-200 rounded-lg transition-colors font-medium flex items-center gap-2"
					>
						🎲 Regenerate
						<kbd
							class="hidden sm:inline-block ml-1 px-1.5 py-0.5 text-[10px] bg-purple-200 dark:bg-purple-800 text-purple-800 dark:text-purple-200 rounded font-mono"
							>⌘↵</kbd
						>
					</button>

					<button
						onclick={copyShareLink}
						disabled={!inputText}
						class="px-4 py-2 bg-indigo-100 hover:bg-indigo-200 dark:bg-indigo-900 dark:hover:bg-indigo-800 disabled:bg-gray-100 dark:disabled:bg-gray-700 disabled:text-gray-400 dark:disabled:text-gray-500 text-indigo-700 dark:text-indigo-200 rounded-lg transition-colors font-medium flex items-center gap-2"
						class:bg-indigo-600={shareSuccess}
						class:text-white={shareSuccess}
					>
						{#if shareSuccess}
							{canShare ? '✓ Shared!' : '✓ Link Copied!'}
						{:else}
							{canShare ? '📤 Share Link' : '🔗 Copy Share Link'}
						{/if}
					</button>
				</div>

				<div class="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-2 flex-wrap">
					<span>Shortcuts:</span>
					<span class="inline-flex items-center gap-1">
						<kbd
							class="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded border border-gray-300 dark:border-gray-600 font-mono text-[10px]"
							>Ctrl+Enter</kbd
						>
						scramble
					</span>
					<span>•</span>
					<span class="inline-flex items-center gap-1">
						<kbd
							class="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded border border-gray-300 dark:border-gray-600 font-mono text-[10px]"
							>Ctrl+Shift+C</kbd
						>
						copy
					</span>
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
