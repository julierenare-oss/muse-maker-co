import { describe, it, expect } from 'vitest';
import { validatePrompt, promptOwnerScope } from '../../supabase/functions/skills/prompts';

const input = { title: 'Test', prompt: 'Hello', modality: 'text', tags: ['Work'], is_favorite: true };
describe('prompt library rules', () => {
  it('accepts a 2000 character prompt but rejects 2001', () => {
    expect(validatePrompt({ ...input, prompt: 'a'.repeat(2000) }).prompt).toHaveLength(2000);
    expect(() => validatePrompt({ ...input, prompt: 'a'.repeat(2001) })).toThrow();
  });
  it('requires an authenticated owner and filters by the server identity', () => {
    expect(() => promptOwnerScope('external:1', '')).toThrow();
    expect(promptOwnerScope('external:1', 'member-a')).toEqual({ account_id: 'external:1', owner_id: 'member-a' });
    expect(promptOwnerScope('external:1', 'member-b').owner_id).not.toBe('member-a');
  });
  it('preserves favorite status independently of content', () => {
    expect(validatePrompt(input).is_favorite).toBe(true);
    expect(validatePrompt({ ...input, is_favorite: false }).is_favorite).toBe(false);
    expect(() => validatePrompt({ ...input, is_favorite: 'yes' })).toThrow();
  });
  it('retains the selected generation modality', () => {
    for (const modality of ['text', 'image', 'video']) expect(validatePrompt({ ...input, modality }).modality).toBe(modality);
    expect(() => validatePrompt({ ...input, modality: 'invalid' })).toThrow();
  });
  it('keeps tags distinct and validates tag limits', () => {
    expect(validatePrompt({ ...input, tags: ['Work', 'Work'] }).tags).toEqual(['Work']);
    expect(() => validatePrompt({ ...input, tags: Array(11).fill('x') })).toThrow();
  });
});