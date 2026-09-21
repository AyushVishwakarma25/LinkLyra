import { describe, it, expect } from 'vitest';
import {
  normalizeUsername,
  validateUsername,
  suggestAvailableUsername,
  RESERVED_USERNAMES,
} from '../src/lib/username';

describe('username normalization and validation', () => {
  describe('normalizeUsername', () => {
    it('handles standard latin names with lowercase conversion and space removal', () => {
      expect(normalizeUsername('John Doe')).toBe('john_doe');
      expect(normalizeUsername('Alice   Bob')).toBe('alice_bob');
      expect(normalizeUsername('cool-creator')).toBe('cool_creator');
    });

    it('transliterates non-Latin scripts (Cyrillic, Hindi, accents)', () => {
      // Cyrillic
      expect(normalizeUsername('Александр')).toBe('aleksandr');
      // Accents / diacritics
      expect(normalizeUsername('Hélène')).toBe('helene');
      expect(normalizeUsername('Renée_Noël')).toBe('renee_noel');
      // Hindi Devanagari
      const hindiNormalized = normalizeUsername('राहुल');
      expect(hindiNormalized).toBeTruthy();
      expect(/^[a-z0-9_]+$/.test(hindiNormalized)).toBe(true);
    });

    it('removes disallowed characters and trims leading/trailing underscores', () => {
      expect(normalizeUsername('__hello@@world__')).toBe('hello_world');
      expect(normalizeUsername('!@#$%^&*()_+')).toBe('');
    });

    it('enforces maximum length of 30 characters', () => {
      const veryLong = 'a_very_extremely_long_username_that_exceeds_thirty_chars';
      const normalized = normalizeUsername(veryLong);
      expect(normalized.length).toBeLessThanOrEqual(30);
      expect(normalized).toBe(veryLong.slice(0, 30).replace(/_+$/, ''));
    });

    it('uses fallback UID if result is empty or less than 3 chars', () => {
      expect(normalizeUsername('', 'abcdef123456')).toBe('user_abcdef');
      expect(normalizeUsername('!@#', 'xyz987')).toBe('user_xyz987');
      expect(normalizeUsername('ab', '12345678')).toBe('user_123456');
    });
  });

  describe('validateUsername', () => {
    it('accepts valid usernames between 3 and 30 characters', () => {
      expect(validateUsername('john_doe').valid).toBe(true);
      expect(validateUsername('abc').valid).toBe(true);
      expect(validateUsername('creator123').valid).toBe(true);
      expect(validateUsername('a'.repeat(30)).valid).toBe(true);
    });

    it('rejects usernames under 3 characters or over 30 characters', () => {
      expect(validateUsername('ab').valid).toBe(false);
      expect(validateUsername('ab').reason).toContain('at least 3 characters');
      expect(validateUsername('a'.repeat(31)).valid).toBe(false);
      expect(validateUsername('a'.repeat(31)).reason).toContain('cannot exceed 30');
    });

    it('rejects special characters, spaces, and uppercase letters', () => {
      expect(validateUsername('John_Doe').valid).toBe(false);
      expect(validateUsername('user-name').valid).toBe(false);
      expect(validateUsername('user name').valid).toBe(false);
      expect(validateUsername('user@domain').valid).toBe(false);
    });

    it('rejects reserved system usernames', () => {
      for (const reserved of ['admin', 'api', 'app', 'login', 'signup', 'dashboard', 'settings', 'linklyra']) {
        expect(RESERVED_USERNAMES.has(reserved)).toBe(true);
        const result = validateUsername(reserved);
        expect(result.valid).toBe(false);
        expect(result.reason).toContain('reserved');
      }
    });
  });

  describe('suggestAvailableUsername', () => {
    it('returns clean candidate directly if available and not reserved', async () => {
      const isAvail = async () => true;
      const suggestion = await suggestAvailableUsername('john_doe', isAvail);
      expect(suggestion).toBe('john_doe');
    });

    it('appends numeric suffix if base name is taken', async () => {
      const taken = new Set(['john_doe', 'john_doe_1', 'john_doe_2']);
      const isAvail = async (candidate: string) => !taken.has(candidate);

      const suggestion = await suggestAvailableUsername('john_doe', isAvail);
      expect(suggestion).toBe('john_doe_3');
    });

    it('appends numeric suffix if base name is reserved', async () => {
      const taken = new Set<string>();
      const isAvail = async (candidate: string) => !taken.has(candidate);

      const suggestion = await suggestAvailableUsername('admin', isAvail);
      expect(suggestion).toBe('admin_1');
    });

    it('respects 30 character limit when adding suffixes', async () => {
      const longBase = 'a'.repeat(30);
      const isAvail = async (candidate: string) => candidate.endsWith('_1');

      const suggestion = await suggestAvailableUsername(longBase, isAvail);
      expect(suggestion.length).toBeLessThanOrEqual(30);
      expect(suggestion.endsWith('_1')).toBe(true);
    });
  });
});
