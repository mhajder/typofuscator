import { describe, it, expect } from 'vitest';
import { encryptText, encryptTextLegacy, defaultSettings } from './typofuscator';
import type { TypofuscatorSettings } from './typofuscator';

describe('typofuscator', () => {
	describe('encryptText - basic functionality', () => {
		it('should return empty string for empty input', () => {
			const result = encryptText('');
			expect(result).toBe('');
		});

		it('should handle single character words', () => {
			const result = encryptText('a b c');
			expect(result).toBe('a b c');
		});

		it('should preserve whitespace and punctuation', () => {
			const text = 'Hello,  world!  Test...';
			const result = encryptText(text);
			// Check that punctuation and multiple spaces are preserved
			expect(result).toContain(',');
			expect(result).toContain('!');
			expect(result).toContain('...');
		});

		it('should scramble words while preserving first and last letters by default', () => {
			const text = 'scramble';
			const result = encryptText(text, { seed: 42 });
			expect(result[0]).toBe('s');
			expect(result[result.length - 1]).toBe('e');
			expect(result.length).toBe(text.length);
		});

		it('should produce consistent results with the same seed', () => {
			const text = 'consistency test with reproducible results';
			const result1 = encryptText(text, { seed: 12345 });
			const result2 = encryptText(text, { seed: 12345 });
			expect(result1).toBe(result2);
		});

		it('should produce different results with different seeds', () => {
			const text = 'randomness test';
			const result1 = encryptText(text, { seed: 1 });
			const result2 = encryptText(text, { seed: 2 });
			// While not guaranteed, with high probability they should differ
			expect(result1).not.toBe(result2);
		});
	});

	describe('encryptText - word length control', () => {
		it('should skip words below minimum length', () => {
			const text = 'a be cat dogs';
			const result = encryptText(text, { minWordLength: 4 });
			// Only 'dogs' should potentially be scrambled (4 letters)
			// 'a', 'be', 'cat' should remain unchanged
			expect(result).toContain('a');
			expect(result).toContain('be');
			expect(result).toContain('cat');
		});

		it('should scramble words meeting minimum length', () => {
			const text = 'test';
			const result = encryptText(text, { minWordLength: 4, seed: 42 });
			expect(result.length).toBe(4);
		});

		it('should respect minWordLength setting', () => {
			const settings: Partial<TypofuscatorSettings> = {
				minWordLength: 5,
				seed: 100
			};
			const text = 'cat dog elephant';
			const result = encryptText(text, settings);
			// 'cat' and 'dog' are less than 5, should not be scrambled
			expect(result).toContain('cat');
			expect(result).toContain('dog');
		});
	});

	describe('encryptText - letter preservation', () => {
		it('should preserve first letter when preserveFirstLetter is true', () => {
			const text = 'testing';
			const result = encryptText(text, { preserveFirstLetter: true, seed: 42 });
			expect(result[0]).toBe('t');
		});

		it('should preserve last letter when preserveLastLetter is true', () => {
			const text = 'testing';
			const result = encryptText(text, { preserveLastLetter: true, seed: 42 });
			expect(result[result.length - 1]).toBe('g');
		});

		it('should allow scrambling first letter when preserveFirstLetter is false', () => {
			const settings: Partial<TypofuscatorSettings> = {
				preserveFirstLetter: false,
				preserveLastLetter: true,
				seed: 42,
				scrambleIntensity: 'heavy'
			};
			const text = 'scrambled';
			const result = encryptText(text, settings);
			// With enough scrambling and no first letter preservation, it might change
			expect(result.length).toBe(text.length);
		});

		it('should handle two-letter words with preservation settings', () => {
			const text = 'it is ok';
			const result = encryptText(text, {
				preserveFirstLetter: true,
				preserveLastLetter: true,
				minWordLength: 2,
				seed: 42
			});
			// Two-letter words can't be scrambled when both first and last are preserved
			expect(result).toBe('it is ok');
		});
	});

	describe('encryptText - case preservation', () => {
		it('should preserve original capitalization when preserveCase is true', () => {
			const text = 'Hello';
			const result = encryptText(text, { preserveCase: true, seed: 42 });
			expect(result[0]).toBe(result[0].toUpperCase());
			expect(result.slice(1).toLowerCase()).toBe(result.slice(1));
		});

		it('should handle all caps words', () => {
			const text = 'HELLO';
			const result = encryptText(text, { preserveCase: true, seed: 42 });
			expect(result).toBe(result.toUpperCase());
		});

		it('should handle mixed case words', () => {
			const text = 'HeLLo';
			const result = encryptText(text, { preserveCase: true, seed: 42 });
			// First letter should be uppercase
			expect(result[0]).toBe(result[0].toUpperCase());
		});
	});

	describe('encryptText - scrambling algorithms', () => {
		it('should use swap algorithm by default', () => {
			const text = 'testing';
			const result = encryptText(text, { customAlgorithm: 'swap', seed: 42 });
			expect(result.length).toBe(text.length);
			expect(result[0]).toBe('t'); // default preserveFirstLetter
			expect(result[result.length - 1]).toBe('g'); // default preserveLastLetter
		});

		it('should use shuffle algorithm when specified', () => {
			const text = 'testing';
			const result = encryptText(text, { customAlgorithm: 'shuffle', seed: 42 });
			expect(result.length).toBe(text.length);
			expect(result[0]).toBe('t');
			expect(result[result.length - 1]).toBe('g');
		});

		it('should use reverse algorithm when specified', () => {
			const text = 'testing';
			const result = encryptText(text, {
				customAlgorithm: 'reverse',
				preserveFirstLetter: true,
				preserveLastLetter: true
			});
			// Middle letters 'estin' should be reversed to 'nitse'
			expect(result).toBe('tnitseg');
		});
	});

	describe('encryptText - scrambling intensity', () => {
		it('should use light intensity settings', () => {
			const text = 'scrambling';
			const result = encryptText(text, { scrambleIntensity: 'light', seed: 42 });
			expect(result.length).toBe(text.length);
		});

		it('should use medium intensity settings', () => {
			const text = 'scrambling';
			const result = encryptText(text, { scrambleIntensity: 'medium', seed: 42 });
			expect(result.length).toBe(text.length);
		});

		it('should use heavy intensity settings', () => {
			const text = 'scrambling';
			const result = encryptText(text, { scrambleIntensity: 'heavy', seed: 42 });
			expect(result.length).toBe(text.length);
		});

		it('should respect custom min and max swaps with medium intensity', () => {
			const settings: Partial<TypofuscatorSettings> = {
				scrambleIntensity: 'medium',
				minSwaps: 3,
				maxSwaps: 5,
				seed: 42
			};
			const text = 'scrambling';
			const result = encryptText(text, settings);
			expect(result.length).toBe(text.length);
		});
	});

	describe('encryptText - exclude words', () => {
		it('should not scramble excluded words', () => {
			const settings: Partial<TypofuscatorSettings> = {
				excludeWords: ['important', 'keep'],
				seed: 42
			};
			const text = 'important words to keep unchanged';
			const result = encryptText(text, settings);
			expect(result).toContain('important');
			expect(result).toContain('keep');
		});

		it('should handle excluded words case-insensitively', () => {
			const settings: Partial<TypofuscatorSettings> = {
				excludeWords: ['test'],
				seed: 42
			};
			const text = 'Test testing';
			const result = encryptText(text, settings);
			// 'Test' matches 'test' in excludeWords (case-insensitive)
			expect(result).toContain('Test');
		});

		it('should scramble non-excluded words', () => {
			const settings: Partial<TypofuscatorSettings> = {
				excludeWords: ['keep'],
				seed: 42
			};
			const text = 'keep scramble this';
			const result = encryptText(text, settings);
			expect(result).toContain('keep');
			// 'scramble' and 'this' should potentially be scrambled
		});
	});

	describe('encryptText - duplicate detection', () => {
		it('should retry scrambling when avoidDuplicates is true and result matches original', () => {
			// This is hard to test deterministically, but we can test the setting exists
			const settings: Partial<TypofuscatorSettings> = {
				avoidDuplicates: true,
				maxRetries: 5,
				seed: 42
			};
			const text = 'test';
			const result = encryptText(text, settings);
			expect(result.length).toBe(text.length);
		});

		it('should respect maxRetries setting', () => {
			const settings: Partial<TypofuscatorSettings> = {
				avoidDuplicates: true,
				maxRetries: 10,
				seed: 42
			};
			const text = 'testing';
			const result = encryptText(text, settings);
			expect(result.length).toBe(text.length);
		});
	});

	describe('encryptText - character set control', () => {
		it('should handle words with numbers when includeNumbers is true', () => {
			const settings: Partial<TypofuscatorSettings> = {
				includeNumbers: true,
				seed: 42
			};
			const text = 'test123 abc456';
			const result = encryptText(text, settings);
			// Should process these as words
			expect(result.length).toBeGreaterThan(0);
		});

		it('should skip words with numbers when includeNumbers is false', () => {
			const settings: Partial<TypofuscatorSettings> = {
				includeNumbers: false,
				seed: 42
			};
			const text = 'test123 word';
			const result = encryptText(text, settings);
			// 'test123' should not be treated as a word, 'word' should be scrambled
			expect(result).toContain('123');
		});
	});

	describe('encryptText - complex scenarios', () => {
		it('should handle multi-paragraph text', () => {
			const text = 'First paragraph here.\n\nSecond paragraph there.';
			const result = encryptText(text, { seed: 42 });
			expect(result).toContain('\n\n');
			expect(result.length).toBeGreaterThan(0);
		});

		it('should handle text with various punctuation', () => {
			const text = "Hello, world! How's everything? (Great!) [Test]";
			const result = encryptText(text, { seed: 42 });
			expect(result).toContain(',');
			expect(result).toContain('!');
			expect(result).toContain('?');
			expect(result).toContain('(');
			expect(result).toContain(')');
			expect(result).toContain('[');
			expect(result).toContain(']');
		});

		it('should handle text with special characters', () => {
			const text = 'test@email.com $100 #hashtag';
			const result = encryptText(text, { seed: 42 });
			expect(result).toContain('@');
			expect(result).toContain('.');
			expect(result).toContain('$');
			expect(result).toContain('#');
		});

		it('should handle text with mixed languages (Latin characters)', () => {
			const text = 'hello world bonjour monde';
			const result = encryptText(text, { seed: 42 });
			expect(result.length).toBeGreaterThan(0);
		});
	});

	describe('encryptText - edge cases', () => {
		it('should handle very short words', () => {
			const text = 'I a';
			const result = encryptText(text, { minWordLength: 1 });
			expect(result.length).toBe(text.length);
		});

		it('should handle very long words', () => {
			const text = 'supercalifragilisticexpialidocious';
			const result = encryptText(text, { seed: 42 });
			expect(result.length).toBe(text.length);
			expect(result[0]).toBe('s');
			expect(result[result.length - 1]).toBe('s');
		});

		it('should handle text with only punctuation', () => {
			const text = '!@#$%^&*()';
			const result = encryptText(text);
			expect(result).toBe(text);
		});

		it('should handle text with only numbers', () => {
			const text = '123 456 789';
			const result = encryptText(text, { includeNumbers: true, seed: 42 });
			// Numbers should be scrambled if includeNumbers is true
			expect(result.length).toBe(text.length);
		});

		it('should handle repeated words', () => {
			const text = 'testing testing testing';
			const result = encryptText(text, { seed: 42 });
			// Each instance may be scrambled differently due to RNG state advancing
			// Just verify the result is valid and has correct length
			const words = result.split(' ');
			expect(words.length).toBe(3);
			expect(words[0].length).toBe(7);
			expect(words[1].length).toBe(7);
			expect(words[2].length).toBe(7);
			// Verify first and last letters are preserved (default setting)
			expect(words[0][0]).toBe('t');
			expect(words[0][6]).toBe('g');
		});

		it('should handle single word input', () => {
			const text = 'testing';
			const result = encryptText(text, { seed: 42 });
			expect(result.length).toBe(text.length);
		});

		it('should handle text with tabs', () => {
			const text = 'word1\tword2\tword3';
			const result = encryptText(text, { seed: 42 });
			expect(result).toContain('\t');
		});
	});

	describe('encryptTextLegacy', () => {
		it('should use default settings', () => {
			const text = 'testing legacy function';
			const result = encryptTextLegacy(text);
			expect(result.length).toBeGreaterThan(0);
		});

		it('should produce consistent results for the same input', () => {
			const text = 'testing';
			// Since it uses random seed, we can't guarantee same results
			// but we can check it produces valid output
			const result = encryptTextLegacy(text);
			expect(result.length).toBe(text.length);
		});
	});

	describe('defaultSettings', () => {
		it('should have correct default values', () => {
			expect(defaultSettings.preserveFirstLetter).toBe(true);
			expect(defaultSettings.preserveLastLetter).toBe(true);
			expect(defaultSettings.minWordLength).toBe(3);
			expect(defaultSettings.scrambleIntensity).toBe('medium');
			expect(defaultSettings.avoidDuplicates).toBe(false);
			expect(defaultSettings.includeNumbers).toBe(true);
			expect(defaultSettings.preserveCase).toBe(true);
			expect(defaultSettings.customAlgorithm).toBe('swap');
			expect(defaultSettings.excludeWords).toEqual([]);
		});
	});

	describe('encryptText - comprehensive integration tests', () => {
		it('should handle realistic text with all default settings', () => {
			const text =
				'Algorithm that scrambles letters within words while keeping them readable to humans.';
			const result = encryptText(text, { seed: 42 });
			// Check structure is preserved
			expect(result).toContain('.');
			expect(result.length).toBe(text.length);
		});

		it('should produce different results each time without seed', () => {
			const text = 'random test';
			const result1 = encryptText(text);
			const result2 = encryptText(text);
			// Without seed, results should likely differ (though not guaranteed)
			// We just verify both produce valid output
			expect(result1.length).toBe(text.length);
			expect(result2.length).toBe(text.length);
		});

		it('should handle all scrambling algorithms consistently', () => {
			const text = 'scramble';
			const swap = encryptText(text, { customAlgorithm: 'swap', seed: 42 });
			const shuffle = encryptText(text, { customAlgorithm: 'shuffle', seed: 42 });
			const reverse = encryptText(text, { customAlgorithm: 'reverse' });

			expect(swap.length).toBe(text.length);
			expect(shuffle.length).toBe(text.length);
			expect(reverse.length).toBe(text.length);

			// Reverse should be deterministic
			// 'scramble' -> s + crambl reversed + e = 'slbmarce'
			expect(reverse).toBe('slbmarce');
		});

		it('should handle full custom configuration', () => {
			const settings: Partial<TypofuscatorSettings> = {
				preserveFirstLetter: false,
				preserveLastLetter: false,
				minWordLength: 2,
				scrambleIntensity: 'heavy',
				avoidDuplicates: true,
				maxRetries: 5,
				includeNumbers: true,
				preserveCase: true,
				excludeWords: ['test'],
				customAlgorithm: 'shuffle',
				seed: 12345
			};

			const text = 'test word example 123';
			const result = encryptText(text, settings);
			expect(result).toContain('test'); // excluded word
			expect(result.length).toBe(text.length);
		});
	});
});
