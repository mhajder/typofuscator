import { Buffer } from 'node:buffer';
import { test, expect } from '@playwright/test';

test.describe('Typofuscator E2E Tests', () => {
	test.beforeEach(async ({ context, page, browserName }) => {
		if (browserName === 'chromium') {
			await context.grantPermissions(['clipboard-read', 'clipboard-write']);
		}
		await page.goto('/');
		await page.locator('main[data-hydrated="true"]').waitFor();
	});

	test('should display page title and header correctly', async ({ page }) => {
		await expect(page).toHaveTitle(/Typofuscator/);
		const heading = page.locator('h1');
		await expect(heading).toContainText('Typofuscator');
	});

	test('should reactively obfuscate text as user types', async ({ page }) => {
		const input = page.locator('#input');
		const output = page.locator('#output');

		await expect(output).toHaveValue('');

		await input.fill('Scramble this readable sentence.');
		await expect(output).not.toHaveValue('');

		const inputValue = await input.inputValue();
		const outputValue = await output.inputValue();

		expect(outputValue.length).toBe(inputValue.length);
		// First and last characters preserved
		expect(outputValue[0]).toBe('S');
		expect(outputValue[outputValue.length - 1]).toBe('.');
	});

	test('should load example text and clear fields with buttons', async ({ page }) => {
		const input = page.locator('#input');
		const output = page.locator('#output');
		const loadExampleBtn = page.getByRole('button', { name: 'Load Example' });
		const clearBtn = page.getByRole('button', { name: 'Clear' });

		await loadExampleBtn.click();
		await expect(input).toHaveValue(/Algorithm that scrambles letters/);
		await expect(output).not.toHaveValue('');

		await clearBtn.click();
		await expect(input).toHaveValue('');
		await expect(output).toHaveValue('');
	});

	test('should regenerate scrambled output with the regenerate button', async ({ page }) => {
		const input = page.locator('#input');
		const output = page.locator('#output');
		const regenBtn = page.getByRole('button', { name: /Regenerate/i });

		// Disabled when input is empty
		await expect(regenBtn).toBeDisabled();

		await input.fill(
			'Supercalifragilisticexpialidocious test sentence for multiple regenerations.'
		);
		await expect(regenBtn).toBeEnabled();

		const firstResult = await output.inputValue();
		await regenBtn.click();
		const secondResult = await output.inputValue();

		expect(secondResult.length).toBe(firstResult.length);
	});

	test('should toggle theme and persist theme state across reload', async ({ page }) => {
		const themeToggle = page.getByRole('button', { name: 'Toggle theme' });
		const html = page.locator('html');

		const initialIsDark = await html.evaluate((el) => el.classList.contains('dark'));

		await themeToggle.click();
		await expect(html).toHaveClass(initialIsDark ? /^(?!.*dark).*$/ : /dark/);

		const toggledIsDark = await html.evaluate((el) => el.classList.contains('dark'));
		expect(toggledIsDark).toBe(!initialIsDark);

		// Reload to test persistence
		await page.reload();
		await page.locator('main[data-hydrated="true"]').waitFor();
		const persistedIsDark = await html.evaluate((el) => el.classList.contains('dark'));
		expect(persistedIsDark).toBe(toggledIsDark);
	});

	test('should toggle settings panel and apply algorithm, intensity, and lookalike configurations', async ({
		page
	}) => {
		const input = page.locator('#input');
		const output = page.locator('#output');
		const settingsHeader = page.locator('.settings-header');

		// Open settings panel
		await settingsHeader.click();
		await expect(page.locator('.settings-content')).toBeVisible();

		// Select intensity preset: Heavy
		await page.locator('label.radio-label', { hasText: 'Heavy' }).click();
		await expect(page.locator('input[value="heavy"]')).toBeChecked();

		// Select reverse algorithm
		await page.locator('label.radio-label', { hasText: 'Reverse' }).click();
		await expect(page.locator('input[value="reverse"]')).toBeChecked();

		// Test reverse scrambling
		await input.fill('testing');
		// 'testing' with reverse: 't' + 'estin'.reverse() ('nitse') + 'g' = 'tnitseg'
		await expect(output).toHaveValue('tnitseg');

		// Enable homoglyphs: All mode + Cyrillic style
		const homoglyphGroup = page.locator('.setting-group', {
			hasText: 'Similar Character Replacement'
		});
		await homoglyphGroup.locator('label.radio-label', { hasText: 'All' }).click();
		await expect(homoglyphGroup.locator('input[value="all"]')).toBeChecked();

		await homoglyphGroup.locator('label.radio-label', { hasText: 'Cyrillic lookalikes' }).click();
		await expect(homoglyphGroup.locator('input[value="cyrillic"]')).toBeChecked();

		const cyrillicResult = await output.inputValue();
		// Should contain non-ASCII characters
		expect(cyrillicResult).toMatch(/[^\p{ASCII}]/u);
	});

	test('should exclude words configured in settings from scrambling', async ({ page }) => {
		const input = page.locator('#input');
		const output = page.locator('#output');
		const settingsHeader = page.locator('.settings-header');

		await settingsHeader.click();
		await expect(page.locator('.settings-content')).toBeVisible();

		const excludeInput = page.locator('#excludeWords');
		await excludeInput.fill('confidential, secret');

		await input.fill('This confidential memo is very secret message.');
		const result = await output.inputValue();

		expect(result).toContain('confidential');
		expect(result).toContain('secret');
	});

	test('should copy output to clipboard when clicking copy button', async ({
		page,
		browserName
	}) => {
		const input = page.locator('#input');
		const output = page.locator('#output');
		const copyBtn = page.getByRole('button', { name: /Copy to Clipboard/i });

		// Initially disabled
		await expect(copyBtn).toBeDisabled();

		await input.fill('Hello Playwright testing world!');
		await expect(copyBtn).toBeEnabled();

		await copyBtn.click();
		await expect(page.getByRole('button', { name: /Copied!/i })).toBeVisible();

		if (browserName === 'chromium') {
			const expectedText = await output.inputValue();
			const clipboardText = await page.evaluate(() => navigator.clipboard.readText());
			expect(clipboardText).toBe(expectedText);
		}
	});

	test('should display and update real-time obfuscation metrics', async ({ page }) => {
		const input = page.locator('#input');
		const metricsPanel = page.locator('#metrics-panel');

		await expect(metricsPanel).toBeVisible();
		await expect(metricsPanel).toContainText('Total Words');

		await input.fill('Scrambling metrics calculation test');
		await expect(metricsPanel).toContainText('Total Words');
		// 4 words in total
		await expect(metricsPanel).toContainText('4');
	});

	test('should support sharing state via URL parameters and load shared state', async ({
		page
	}) => {
		// Test sharing action button
		const input = page.locator('#input');
		const shareBtn = page.getByRole('button', { name: /Share Link/i });

		await expect(shareBtn).toBeDisabled();
		await input.fill('Shareable custom text');
		await expect(shareBtn).toBeEnabled();

		await shareBtn.click();
		await expect(page.getByRole('button', { name: /(?:Link Copied!|Shared!)/i })).toBeVisible();

		// Test loading shared state from URL
		await page.goto('/?text=SharedPayload&algo=reverse');
		await page.locator('main[data-hydrated="true"]').waitFor();

		const sharedInput = page.locator('#input');
		const sharedOutput = page.locator('#output');

		await expect(sharedInput).toHaveValue('SharedPayload');
		// 'SharedPayload' with reverse: 'S' + 'haredPayloa'.split('').reverse().join('') + 'd'
		const expectedReverse = 'S' + 'haredPayloa'.split('').reverse().join('') + 'd';
		await expect(sharedOutput).toHaveValue(expectedReverse);
	});

	test('should support keyboard shortcuts for regeneration and copying', async ({ page }) => {
		const input = page.locator('#input');
		const output = page.locator('#output');

		await input.fill('Keyboard shortcut acceleration');
		await expect(output).not.toHaveValue('');

		// Ctrl+Enter or Meta+Enter to regenerate
		await page.keyboard.press('Control+Enter');
		await expect(output).not.toHaveValue('');

		// Ctrl+Shift+C or Meta+Shift+C to copy
		await page.keyboard.press('Control+Shift+C');
		await expect(page.getByRole('button', { name: /Copied!/i })).toBeVisible();
	});

	test('should support file upload and trigger obfuscated text download', async ({ page }) => {
		const uploadInput = page.locator('input[type="file"][accept*=".txt"]');
		const input = page.locator('#input');
		const output = page.locator('#output');
		const downloadBtn = page.getByRole('button', { name: /Download/i });

		// Initially download is disabled
		await expect(downloadBtn).toBeDisabled();

		// Set file input with a buffer
		await uploadInput.setInputFiles({
			name: 'document.txt',
			mimeType: 'text/plain',
			buffer: Buffer.from('Testing document file upload obfuscation')
		});

		await expect(input).toHaveValue('Testing document file upload obfuscation');
		await expect(output).not.toHaveValue('');
		await expect(page.locator('text=document.txt')).toBeVisible();
		await expect(downloadBtn).toBeEnabled();

		// Trigger download event
		const downloadPromise = page.waitForEvent('download');
		await downloadBtn.click();
		const download = await downloadPromise;
		expect(download.suggestedFilename()).toBe('document-obfuscated.txt');
	});

	test('should keep update toast hidden when no service worker update is waiting', async ({
		page
	}) => {
		const updateToast = page.locator('aside[aria-label="App update notification"]');
		await expect(updateToast).not.toBeVisible();
	});
});
