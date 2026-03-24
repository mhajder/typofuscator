export type ScrambleIntensity = 'light' | 'medium' | 'heavy';
export type ScrambleAlgorithm = 'swap' | 'shuffle' | 'reverse';
export type SimilarCharMode = 'off' | 'some' | 'all';
export type SimilarCharStyle = 'mixed' | 'cyrillic' | 'latin' | 'greek';

export interface TypofuscatorSettings {
	// First/Last letter control
	preserveFirstLetter: boolean;
	preserveLastLetter: boolean;

	// Word length control
	minWordLength: number;

	// Scrambling intensity
	minSwaps: number;
	maxSwaps: number;
	scrambleIntensity: ScrambleIntensity;

	// Duplicate detection & re-scrambling
	avoidDuplicates: boolean;
	maxRetries: number;

	// Character set control
	includeNumbers: boolean;
	includeMixedCase: boolean;
	preserveCase: boolean;

	// Advanced options
	seed?: number;
	excludeWords: string[];
	customAlgorithm: ScrambleAlgorithm;
	similarCharMode: SimilarCharMode;
	similarCharStyle: SimilarCharStyle;
	similarCharRate: number;
}

export const defaultSettings: TypofuscatorSettings = {
	preserveFirstLetter: true,
	preserveLastLetter: true,
	minWordLength: 3,
	minSwaps: 2,
	maxSwaps: 5,
	scrambleIntensity: 'medium',
	avoidDuplicates: false,
	maxRetries: 3,
	includeNumbers: true,
	includeMixedCase: true,
	preserveCase: true,
	excludeWords: [],
	customAlgorithm: 'swap',
	similarCharMode: 'off',
	similarCharStyle: 'mixed',
	similarCharRate: 35
};

const cyrillicLookalikes: Record<string, string[]> = {
	a: ['а'],
	A: ['А'],
	b: ['Ь'],
	B: ['В'],
	c: ['с'],
	C: ['С'],
	e: ['е'],
	E: ['Е'],
	h: ['һ'],
	H: ['Н'],
	i: ['і'],
	I: ['І'],
	k: ['к'],
	K: ['К'],
	m: ['м'],
	M: ['М'],
	n: ['п'],
	N: ['П'],
	o: ['о'],
	O: ['О'],
	p: ['р'],
	P: ['Р'],
	t: ['т'],
	T: ['Т'],
	x: ['х'],
	X: ['Х'],
	y: ['у'],
	Y: ['У']
};

const latinLookalikes: Record<string, string[]> = {
	a: ['ɑ'],
	A: ['Ɑ'],
	b: ['Ƅ'],
	B: ['Ƀ'],
	e: ['ɛ'],
	E: ['Ɛ'],
	g: ['ɡ'],
	G: ['Ɠ'],
	i: ['ɩ'],
	I: ['Ɩ'],
	o: ['ɵ'],
	O: ['Ɵ'],
	p: ['ρ'],
	P: ['Ƥ'],
	u: ['ʋ'],
	U: ['Ʉ']
};

const greekLookalikes: Record<string, string[]> = {
	a: ['α'],
	A: ['Α'],
	b: ['β'],
	B: ['Β'],
	e: ['ε'],
	E: ['Ε'],
	h: ['η'],
	H: ['Η'],
	i: ['ι'],
	I: ['Ι'],
	k: ['κ'],
	K: ['Κ'],
	m: ['μ'],
	M: ['Μ'],
	n: ['ν'],
	N: ['Ν'],
	o: ['ο'],
	O: ['Ο'],
	p: ['ρ'],
	P: ['Ρ'],
	t: ['τ'],
	T: ['Τ'],
	x: ['χ'],
	X: ['Χ'],
	y: ['υ'],
	Y: ['Υ']
};

// Seeded random number generator for reproducible results
class SeededRandom {
	private seed: number;

	constructor(seed?: number) {
		this.seed = seed ?? Math.random() * 2147483647;
	}

	next(): number {
		this.seed = (this.seed * 16807) % 2147483647;
		return (this.seed - 1) / 2147483646;
	}
}

/**
 * Scrambles text according to the provided settings while maintaining
 * human readability by introducing controlled chaos within words.
 */
export function encryptText(text: string, settings: Partial<TypofuscatorSettings> = {}): string {
	const config = normalizeSettings({ ...defaultSettings, ...settings });
	const rng = new SeededRandom(config.seed);

	// Create regex pattern based on settings - use word boundary approach
	const tokens = text.match(/(\w+|\W+)/g) || [];

	const scrambledTokens: string[] = [];

	for (const token of tokens) {
		// Check if token is a word (letters and optionally numbers)
		const isWord = config.includeNumbers ? /^\w+$/.test(token) : /^[a-zA-Z]+$/.test(token);

		if (isWord) {
			const word = token;
			const wordLen = word.length;

			// Check if word should be excluded
			if (config.excludeWords.includes(word.toLowerCase())) {
				scrambledTokens.push(word);
				continue;
			}

			let transformedWord = word;

			// Skip scrambling for words below minimum length.
			if (wordLen >= config.minWordLength) {
				transformedWord = scrambleWord(word, config, rng);

				// Handle duplicate detection with retries
				if (config.avoidDuplicates && transformedWord === word) {
					let retries = 0;
					while (transformedWord === word && retries < config.maxRetries) {
						transformedWord = scrambleWord(word, config, rng);
						retries++;
					}
				}
			}

			transformedWord = replaceWithSimilarCharacters(transformedWord, config, rng);
			scrambledTokens.push(transformedWord);
		} else {
			// Separators, punctuation, and whitespace are added without changes
			scrambledTokens.push(token);
		}
	}

	return scrambledTokens.join('');
}

function scrambleWord(word: string, config: TypofuscatorSettings, rng: SeededRandom): string {
	const wordLen = word.length;

	// Handle special cases for very short words first
	if (wordLen === 1) {
		return word; // Cannot scramble single letters
	}

	if (wordLen === 2) {
		// For 2-letter words, we can only scramble if we don't preserve both first and last
		if (!config.preserveFirstLetter && !config.preserveLastLetter) {
			// Swap both letters with 50% probability
			const shouldSwap = rng.next() > 0.5;
			return shouldSwap ? word[1] + word[0] : word;
		} else {
			// If preserving first or last (or both), can't meaningfully scramble
			return word;
		}
	}

	// Determine which parts to preserve for longer words
	const preserveFirst = config.preserveFirstLetter && wordLen > 1;
	const preserveLast = config.preserveLastLetter && wordLen > 1;

	let startIdx = preserveFirst ? 1 : 0;
	let endIdx = preserveLast ? wordLen - 1 : wordLen;

	// Extract parts
	const firstPart = preserveFirst ? word[0] : '';
	const lastPart = preserveLast ? word[wordLen - 1] : '';
	const middle = word.slice(startIdx, endIdx).split('');

	// If middle section is too small to scramble normally, return as is
	if (middle.length < 2) {
		return word;
	}

	// Apply scrambling algorithm
	let scrambledMiddle: string[];

	switch (config.customAlgorithm) {
		case 'shuffle':
			scrambledMiddle = shuffleArray([...middle], rng);
			break;
		case 'reverse':
			scrambledMiddle = [...middle].reverse();
			break;
		case 'swap':
		default:
			scrambledMiddle = performSwaps([...middle], config, rng);
			break;
	}

	// Combine parts
	const result = firstPart + scrambledMiddle.join('') + lastPart;

	// Preserve case if needed
	if (config.preserveCase) {
		return preserveOriginalCase(result, word);
	}

	return result;
}

function performSwaps(middle: string[], config: TypofuscatorSettings, rng: SeededRandom): string[] {
	// For very short middle sections (2 characters), use simple shuffle for more variety
	if (middle.length === 2) {
		// 50% chance to swap for more randomness
		if (rng.next() > 0.5) {
			return [middle[1], middle[0]];
		}
		return [...middle];
	}

	// For longer sections, use the swap approach but with better randomness
	const maxPossibleSwaps = Math.floor(middle.length / 2);

	// Determine number of swaps based on intensity
	let numSwaps: number;

	switch (config.scrambleIntensity) {
		case 'light':
			numSwaps = Math.min(Math.floor(rng.next() * 2) + 1, maxPossibleSwaps); // 1-2 swaps
			break;
		case 'heavy':
			numSwaps = Math.min(Math.floor(rng.next() * 6) + 3, maxPossibleSwaps); // 3-8 swaps
			break;
		case 'medium':
		default:
			numSwaps = Math.min(
				Math.floor(rng.next() * (config.maxSwaps - config.minSwaps + 1)) + config.minSwaps,
				maxPossibleSwaps
			);
			break;
	}

	// Ensure at least 1 swap happens if possible
	if (numSwaps === 0 && maxPossibleSwaps >= 1) {
		numSwaps = 1;
	}

	// Use a different approach: sometimes use shuffle for more variety
	if (middle.length <= 4 && rng.next() > 0.6) {
		// 40% chance to fully shuffle short words for more variety
		return shuffleArray([...middle], rng);
	}

	// Perform swaps with better randomness
	const result = [...middle];
	for (let i = 0; i < numSwaps; i++) {
		const idx1 = Math.floor(rng.next() * result.length);
		let idx2 = Math.floor(rng.next() * result.length);

		// Ensure we don't swap with the same index
		while (idx2 === idx1 && result.length > 1) {
			idx2 = Math.floor(rng.next() * result.length);
		}

		[result[idx1], result[idx2]] = [result[idx2], result[idx1]];
	}

	return result;
}

function shuffleArray<T>(array: T[], rng: SeededRandom): T[] {
	const result = [...array];
	for (let i = result.length - 1; i > 0; i--) {
		const j = Math.floor(rng.next() * (i + 1));
		[result[i], result[j]] = [result[j], result[i]];
	}
	return result;
}

function preserveOriginalCase(scrambled: string, original: string): string {
	return scrambled
		.split('')
		.map((char, i) => {
			if (i < original.length) {
				const originalChar = original[i];
				if (originalChar === originalChar.toUpperCase()) {
					return char.toUpperCase();
				} else {
					return char.toLowerCase();
				}
			}
			return char;
		})
		.join('');
}

function replaceWithSimilarCharacters(
	word: string,
	config: TypofuscatorSettings,
	rng: SeededRandom
): string {
	if (config.similarCharMode === 'off') {
		return word;
	}

	const rate = Math.max(0, Math.min(100, config.similarCharRate));
	const shouldReplace = (): boolean => {
		if (config.similarCharMode === 'all') {
			return true;
		}
		if (config.similarCharMode === 'some') {
			return rng.next() < rate / 100;
		}
		return false;
	};

	return word
		.split('')
		.map((char) => {
			const variants = getSimilarCharacterVariants(char, config.similarCharStyle);
			if (variants.length === 0 || !shouldReplace()) {
				return char;
			}

			const idx = Math.floor(rng.next() * variants.length);
			return variants[idx] ?? char;
		})
		.join('');
}

function getSimilarCharacterVariants(char: string, style: SimilarCharStyle): string[] {
	if (style === 'mixed') {
		const combined = [
			...getSimilarCharacterVariants(char, 'cyrillic'),
			...getSimilarCharacterVariants(char, 'latin'),
			...getSimilarCharacterVariants(char, 'greek')
		];
		return Array.from(new Set(combined));
	}

	if (style === 'cyrillic') {
		return cyrillicLookalikes[char] ?? [];
	}

	if (style === 'latin') {
		return latinLookalikes[char] ?? [];
	}

	if (style === 'greek') {
		return greekLookalikes[char] ?? [];
	}

	return [];
}

function normalizeSettings(settings: TypofuscatorSettings): TypofuscatorSettings {
	const allowedStyles: SimilarCharStyle[] = ['mixed', 'cyrillic', 'latin', 'greek'];
	const style = allowedStyles.includes(settings.similarCharStyle)
		? settings.similarCharStyle
		: defaultSettings.similarCharStyle;

	const allowedModes: SimilarCharMode[] = ['off', 'some', 'all'];
	const mode = allowedModes.includes(settings.similarCharMode)
		? settings.similarCharMode
		: defaultSettings.similarCharMode;

	return {
		...settings,
		similarCharStyle: style,
		similarCharMode: mode,
		similarCharRate: Math.max(0, Math.min(100, settings.similarCharRate))
	};
}

// Legacy function for backward compatibility
export function encryptTextLegacy(text: string): string {
	return encryptText(text, defaultSettings);
}
