import { describe, it, expect } from 'vitest';
import { canReadSkill, appliesToContext } from '../../supabase/functions/skills/policy';

const skill = { source: 'user', owner_id: 'author', visibility: 'private', space_id: 'space-a', scope: 'space', enabled: true };
describe('Skills ownership and spaces', () => {
  it('allows service skills to all users', () => {
    expect(canReadSkill({ ...skill, source: 'service' }, 'other', [])).toBe(true);
  });
  it('keeps private skills available only to their author', () => {
    expect(canReadSkill(skill, 'author', [])).toBe(true);
    expect(canReadSkill(skill, 'other', ['space-a'])).toBe(false);
  });
  it('shares only with participants of the selected space', () => {
    expect(canReadSkill({ ...skill, visibility: 'project' }, 'other', ['space-a'])).toBe(true);
    expect(canReadSkill({ ...skill, visibility: 'project' }, 'other', ['space-b'])).toBe(false);
  });
  it('applies global skills to every space and standalone chats', () => {
    expect(appliesToContext({ ...skill, scope: 'global' }, 'space-b')).toBe(true);
    expect(appliesToContext({ ...skill, scope: 'global' }, null)).toBe(true);
  });
  it('restricts space skills to their selected space', () => {
    expect(appliesToContext(skill, 'space-a')).toBe(true);
    expect(appliesToContext(skill, 'space-b')).toBe(false);
    expect(appliesToContext(skill, null)).toBe(false);
  });
  it('does not apply disabled skills', () => {
    expect(appliesToContext({ ...skill, scope: 'global', enabled: false }, 'space-a')).toBe(false);
  });
});