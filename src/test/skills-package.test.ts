import { describe, it, expect, vi } from 'vitest';
import * as fflate from 'fflate';
import * as yaml from 'yaml';

vi.mock('npm:fflate@0.8.3', () => fflate);
vi.mock('npm:yaml@2.9.1', () => yaml);

import { parseSkillPackage } from '../../supabase/functions/skills/package';

const content = new TextEncoder().encode('---\nname: Reviewer\ndescription: Reviews code\n---\nCheck security and edge cases.');
describe('Immutable skill import', () => {
  it('reads name and description from SKILL.md rather than client metadata', () => {
    expect(parseSkillPackage('SKILL.md', content)).toEqual({ name: 'Reviewer', description: 'Reviews code', instructions: 'Check security and edge cases.' });
  });
  it('extracts only SKILL.md from a package containing scripts', () => {
    const zip = fflate.zipSync({ 'review/SKILL.md': content, 'review/run.sh': new TextEncoder().encode('exit 1') });
    expect(parseSkillPackage('review.zip', zip).instructions).toBe('Check security and edge cases.');
  });
  it('rejects archives with multiple skills', () => {
    expect(() => parseSkillPackage('review.zip', fflate.zipSync({ 'a/SKILL.md': content, 'b/SKILL.md': content }))).toThrow('ZIP должен содержать один SKILL.md');
  });
  it('rejects files without required metadata', () => {
    expect(() => parseSkillPackage('SKILL.md', new TextEncoder().encode('Instructions only'))).toThrow();
  });
  it('rejects path traversal packages', () => {
    expect(() => parseSkillPackage('review.zip', fflate.zipSync({ '../SKILL.md': content }))).toThrow();
  });
});