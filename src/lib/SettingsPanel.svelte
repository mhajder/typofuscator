<script lang="ts">
	import type { TypofuscatorSettings, ScrambleIntensity, ScrambleAlgorithm } from './typofuscator';
	import { defaultSettings } from './typofuscator';

	export let settings: TypofuscatorSettings = { ...defaultSettings };
	export let isOpen = false;
	export let onExportSettings: () => void;
	export let onImportSettings: (_event: Event) => void;
	export let resetToDefaults: (() => void) | undefined;

	let excludeWordsText = settings.excludeWords.join(', ');

	// Handle exclude words text changes
	$: {
		settings.excludeWords = excludeWordsText
			.split(',')
			.map((word) => word.trim())
			.filter((word) => word.length > 0);
	}

	function generateRandomSeed() {
		settings.seed = Math.floor(Math.random() * 1000000);
	}

	function clearSeed() {
		settings.seed = undefined;
	}

	const intensityOptions: { value: ScrambleIntensity; label: string; description: string }[] = [
		{ value: 'light', label: 'Light', description: '1-2 swaps per word' },
		{ value: 'medium', label: 'Medium', description: '2-5 swaps per word' },
		{ value: 'heavy', label: 'Heavy', description: '3-8 swaps per word' }
	];

	const algorithmOptions: { value: ScrambleAlgorithm; label: string; description: string }[] = [
		{ value: 'swap', label: 'Swap', description: 'Random character swapping' },
		{ value: 'shuffle', label: 'Shuffle', description: 'Complete middle shuffling' },
		{ value: 'reverse', label: 'Reverse', description: 'Reverse middle characters' }
	];
</script>

<div class="settings-panel" class:open={isOpen}>
	<div
		class="settings-header"
		on:click={() => (isOpen = !isOpen)}
		on:keydown={(e) => (e.key === 'Enter' || e.key === ' ' ? (isOpen = !isOpen) : null)}
		role="button"
		tabindex="0"
	>
		<h3 class="text-lg font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-2">
			⚙️ Advanced Settings
		</h3>
		<span class="toggle-icon" class:rotated={isOpen}>▼</span>
	</div>

	{#if isOpen}
		<div class="settings-content">
			<!-- Letter Preservation -->
			<div class="setting-group">
				<h4 class="setting-group-title">Letter Preservation</h4>
				<div class="setting-row">
					<label class="checkbox-label">
						<input type="checkbox" bind:checked={settings.preserveFirstLetter} />
						<span class="checkmark"></span>
						Preserve first letter
					</label>
					<span class="setting-description">Keep the first letter of each word unchanged</span>
				</div>
				<div class="setting-row">
					<label class="checkbox-label">
						<input type="checkbox" bind:checked={settings.preserveLastLetter} />
						<span class="checkmark"></span>
						Preserve last letter
					</label>
					<span class="setting-description">Keep the last letter of each word unchanged</span>
				</div>
			</div>

			<!-- Word Length Control -->
			<div class="setting-group">
				<h4 class="setting-group-title">Word Length Control</h4>
				<div class="setting-row">
					<label for="minWordLength" class="input-label">Minimum word length:</label>
					<input
						id="minWordLength"
						type="number"
						min="1"
						max="10"
						bind:value={settings.minWordLength}
						class="number-input"
					/>
					<span class="setting-description">Only scramble words with this many letters or more</span
					>
				</div>
			</div>

			<!-- Scrambling Intensity -->
			<div class="setting-group">
				<h4 class="setting-group-title">Scrambling Intensity</h4>
				<div class="setting-row">
					<span class="input-label">Intensity preset:</span>
					<div class="radio-group">
						{#each intensityOptions as option (option.value)}
							<label class="radio-label">
								<input type="radio" bind:group={settings.scrambleIntensity} value={option.value} />
								<span class="radio-button"></span>
								<div class="radio-content">
									<span class="radio-title">{option.label}</span>
									<span class="radio-description">{option.description}</span>
								</div>
							</label>
						{/each}
					</div>
				</div>

				<div class="setting-row">
					<label for="minSwaps" class="input-label">Custom min swaps:</label>
					<input
						id="minSwaps"
						type="number"
						min="0"
						max="20"
						bind:value={settings.minSwaps}
						class="number-input"
						disabled={settings.scrambleIntensity !== 'medium'}
					/>
					<label for="maxSwaps" class="input-label">max swaps:</label>
					<input
						id="maxSwaps"
						type="number"
						min="0"
						max="20"
						bind:value={settings.maxSwaps}
						class="number-input"
						disabled={settings.scrambleIntensity !== 'medium'}
					/>
				</div>
			</div>

			<!-- Algorithm Selection -->
			<div class="setting-group">
				<h4 class="setting-group-title">Scrambling Algorithm</h4>
				<div class="setting-row">
					<div class="radio-group">
						{#each algorithmOptions as option (option.value)}
							<label class="radio-label">
								<input type="radio" bind:group={settings.customAlgorithm} value={option.value} />
								<span class="radio-button"></span>
								<div class="radio-content">
									<span class="radio-title">{option.label}</span>
									<span class="radio-description">{option.description}</span>
								</div>
							</label>
						{/each}
					</div>
				</div>
			</div>

			<!-- Duplicate Detection -->
			<div class="setting-group">
				<h4 class="setting-group-title">Duplicate Detection</h4>
				<div class="setting-row">
					<label class="checkbox-label">
						<input type="checkbox" bind:checked={settings.avoidDuplicates} />
						<span class="checkmark"></span>
						Avoid duplicate results
					</label>
					<span class="setting-description">Try again if scrambled word matches original</span>
				</div>
				{#if settings.avoidDuplicates}
					<div class="setting-row">
						<label for="maxRetries" class="input-label">Max retries:</label>
						<input
							id="maxRetries"
							type="number"
							min="1"
							max="10"
							bind:value={settings.maxRetries}
							class="number-input"
						/>
					</div>
				{/if}
			</div>

			<!-- Character Set Control -->
			<div class="setting-group">
				<h4 class="setting-group-title">Character Set Control</h4>
				<div class="setting-row">
					<label class="checkbox-label">
						<input type="checkbox" bind:checked={settings.includeNumbers} />
						<span class="checkmark"></span>
						Include numbers
					</label>
					<span class="setting-description">Scramble words containing numbers (e.g., "abc123")</span
					>
				</div>
				<div class="setting-row">
					<label class="checkbox-label">
						<input type="checkbox" bind:checked={settings.preserveCase} />
						<span class="checkmark"></span>
						Preserve case
					</label>
					<span class="setting-description">Maintain original capitalization pattern</span>
				</div>
			</div>

			<!-- Exclude Words -->
			<div class="setting-group">
				<h4 class="setting-group-title">Exclude Words</h4>
				<div class="setting-row">
					<label for="excludeWords" class="input-label">Words to never scramble:</label>
					<textarea
						id="excludeWords"
						bind:value={excludeWordsText}
						placeholder="word1, word2, word3..."
						class="text-input"
						rows="2"
					></textarea>
					<span class="setting-description">Comma-separated list of words to leave unchanged</span>
				</div>
			</div>

			<!-- Seed Control -->
			<div class="setting-group">
				<h4 class="setting-group-title">Reproducible Results</h4>
				<div class="setting-row">
					<label for="seed" class="input-label">Seed:</label>
					<input
						id="seed"
						type="number"
						bind:value={settings.seed}
						placeholder="Random"
						class="number-input flex-1"
					/>
					<button on:click={generateRandomSeed} class="btn-small">Generate</button>
					<button on:click={clearSeed} class="btn-small">Clear</button>
				</div>
				<span class="setting-description">Use same seed for identical results</span>
			</div>

			<!-- Import/Export Settings -->
			<div class="setting-group">
				<h4 class="setting-group-title">Import/Export Settings</h4>
				<div class="setting-row">
					<button on:click={onExportSettings} class="export-btn"> 📤 Export Settings </button>
					<label class="import-btn">
						📥 Import Settings
						<input type="file" accept=".json" on:change={onImportSettings} class="hidden" />
					</label>
				</div>
				<span class="setting-description">Save or load your custom settings configuration</span>
			</div>

			<!-- Reset Button -->
			<div class="setting-group">
				<button
					on:click={resetToDefaults
						? resetToDefaults
						: () => {
								settings = { ...defaultSettings };
								excludeWordsText = '';
							}}
					class="reset-btn"
				>
					🔄 Reset to Defaults
				</button>
			</div>
		</div>
	{/if}
</div>

<style>
	.settings-panel {
		background: white;
		border: 1px solid #e5e7eb;
		border-radius: 12px;
		overflow: hidden;
		transition: all 0.3s ease;
	}

	:global(.dark) .settings-panel {
		background: #1f2937;
		border-color: #374151;
	}

	.settings-header {
		padding: 1rem;
		display: flex;
		align-items: center;
		justify-content: space-between;
		background: #f9fafb;
		border-bottom: 1px solid #e5e7eb;
		cursor: pointer;
		transition: background-color 0.2s;
	}

	:global(.dark) .settings-header {
		background: #111827;
		border-bottom-color: #374151;
	}

	.settings-header:hover {
		background: #f3f4f6;
	}

	:global(.dark) .settings-header:hover {
		background: #1f2937;
	}

	.settings-header h3 {
		color: #1f2937;
	}

	:global(.dark) .settings-header h3 {
		color: #f9fafb;
	}

	.toggle-icon {
		display: inline-block;
		transition: transform 0.3s ease;
		font-size: 0.875rem;
		color: #6b7280;
		padding: 0.25rem;
	}

	.toggle-icon.rotated {
		transform: rotate(180deg);
	}

	.settings-content {
		padding: 1.5rem;
		max-height: 70vh;
		overflow-y: auto;
	}

	:global(.dark) .settings-content::-webkit-scrollbar {
		width: 8px;
	}

	:global(.dark) .settings-content::-webkit-scrollbar-track {
		background: #374151;
	}

	:global(.dark) .settings-content::-webkit-scrollbar-thumb {
		background: #6b7280;
		border-radius: 4px;
	}

	:global(.dark) .settings-content::-webkit-scrollbar-thumb:hover {
		background: #9ca3af;
	}

	.setting-group {
		margin-bottom: 1.5rem;
		padding-bottom: 1.5rem;
		border-bottom: 1px solid #f3f4f6;
	}

	.setting-group:last-child {
		border-bottom: none;
		margin-bottom: 0;
		padding-bottom: 0;
	}

	.setting-group-title {
		font-size: 0.875rem;
		font-weight: 600;
		color: #374151;
		margin-bottom: 0.75rem;
		text-transform: uppercase;
		letter-spacing: 0.025em;
	}

	:global(.dark) .setting-group-title {
		color: #d1d5db;
	}

	.setting-row {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		margin-bottom: 0.75rem;
		flex-wrap: wrap;
	}

	.setting-row:last-child {
		margin-bottom: 0;
	}

	.checkbox-label {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		cursor: pointer;
		min-width: fit-content;
		color: #374151;
	}

	:global(.dark) .checkbox-label {
		color: #d1d5db;
	}

	.checkbox-label input[type='checkbox'] {
		display: none;
	}

	.checkmark {
		width: 1.25rem;
		height: 1.25rem;
		border: 2px solid #d1d5db;
		border-radius: 4px;
		display: flex;
		align-items: center;
		justify-content: center;
		transition: all 0.2s;
	}

	:global(.dark) .checkmark {
		border-color: #4b5563;
	}

	.checkbox-label input[type='checkbox']:checked + .checkmark {
		background: #3b82f6;
		border-color: #3b82f6;
	}

	.checkbox-label input[type='checkbox']:checked + .checkmark::after {
		content: '✓';
		color: white;
		font-size: 0.875rem;
		font-weight: bold;
	}

	.input-label {
		font-size: 0.875rem;
		color: #374151;
		font-weight: 500;
		min-width: fit-content;
	}

	:global(.dark) .input-label {
		color: #d1d5db;
	}

	.number-input {
		padding: 0.5rem;
		border: 1px solid #d1d5db;
		border-radius: 6px;
		font-size: 0.875rem;
		width: 80px;
		text-align: center;
		background: white;
		color: #111827;
	}

	:global(.dark) .number-input {
		background: #374151;
		border-color: #4b5563;
		color: #f9fafb;
	}

	.number-input:disabled {
		background: #f9fafb;
		color: #9ca3af;
	}

	:global(.dark) .number-input:disabled {
		background: #1f2937;
		color: #6b7280;
	}

	.text-input {
		padding: 0.5rem;
		border: 1px solid #d1d5db;
		border-radius: 6px;
		font-size: 0.875rem;
		flex: 1;
		min-width: 200px;
		resize: vertical;
		background: white;
		color: #111827;
	}

	:global(.dark) .text-input {
		background: #374151;
		border-color: #4b5563;
		color: #f9fafb;
	}

	.radio-group {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		width: 100%;
	}

	.radio-label {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		cursor: pointer;
		padding: 0.5rem;
		border-radius: 6px;
		transition: background-color 0.2s;
	}

	.radio-label:hover {
		background: #f9fafb;
	}

	:global(.dark) .radio-label:hover {
		background: #374151;
	}

	.radio-label input[type='radio'] {
		display: none;
	}

	.radio-button {
		width: 1.25rem;
		height: 1.25rem;
		border: 2px solid #d1d5db;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		transition: all 0.2s;
		flex-shrink: 0;
	}

	:global(.dark) .radio-button {
		border-color: #4b5563;
	}

	.radio-label input[type='radio']:checked + .radio-button {
		border-color: #3b82f6;
	}

	.radio-label input[type='radio']:checked + .radio-button::after {
		content: '';
		width: 0.5rem;
		height: 0.5rem;
		background: #3b82f6;
		border-radius: 50%;
	}

	.radio-content {
		display: flex;
		flex-direction: column;
		gap: 0.125rem;
	}

	.radio-title {
		font-size: 0.875rem;
		font-weight: 500;
		color: #374151;
	}

	:global(.dark) .radio-title {
		color: #d1d5db;
	}

	.radio-description {
		font-size: 0.75rem;
		color: #6b7280;
	}

	:global(.dark) .radio-description {
		color: #9ca3af;
	}

	.setting-description {
		font-size: 0.75rem;
		color: #6b7280;
		flex: 1;
		min-width: 200px;
	}

	:global(.dark) .setting-description {
		color: #9ca3af;
	}

	.btn-small {
		padding: 0.375rem 0.75rem;
		background: #f3f4f6;
		border: 1px solid #d5d5db;
		border-radius: 6px;
		font-size: 0.75rem;
		cursor: pointer;
		transition: all 0.2s;
		color: #374151;
	}

	:global(.dark) .btn-small {
		background: #374151;
		border-color: #4b5563;
		color: #d1d5db;
	}

	.btn-small:hover {
		background: #e5e7eb;
	}

	:global(.dark) .btn-small:hover {
		background: #4b5563;
	}

	.reset-btn {
		padding: 0.75rem 1.5rem;
		background: #ef4444;
		color: white;
		border: none;
		border-radius: 8px;
		font-size: 0.875rem;
		font-weight: 500;
		cursor: pointer;
		transition: background-color 0.2s;
		width: 100%;
	}

	:global(.dark) .reset-btn {
		background: #dc2626;
	}

	.reset-btn:hover {
		background: #dc2626;
	}

	:global(.dark) .reset-btn:hover {
		background: #b91c1c;
	}

	.export-btn,
	.import-btn {
		padding: 0.75rem 1.5rem;
		background: #f3f4f6;
		color: #374151;
		border: 1px solid #d1d5db;
		border-radius: 8px;
		font-size: 0.875rem;
		font-weight: 500;
		cursor: pointer;
		transition: all 0.2s;
		flex: 1;
		text-align: center;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: 0.5rem;
	}

	:global(.dark) .export-btn,
	:global(.dark) .import-btn {
		background: #374151;
		color: #d1d5db;
		border-color: #4b5563;
	}

	.export-btn:hover,
	.import-btn:hover {
		background: #e5e7eb;
	}

	:global(.dark) .export-btn:hover,
	:global(.dark) .import-btn:hover {
		background: #4b5563;
	}

	.hidden {
		display: none;
	}

	.flex-1 {
		flex: 1;
	}
</style>
