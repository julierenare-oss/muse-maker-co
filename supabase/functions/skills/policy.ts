export function canReadSkill(skill: { source: string; owner_id: string | null; visibility: string; space_id: string | null }, userId: string, memberSpaces: string[]) {
  return skill.source === 'service' || skill.owner_id === userId || (skill.visibility === 'project' && !!skill.space_id && memberSpaces.includes(skill.space_id));
}
export function appliesToContext(skill: { scope: string; space_id: string | null; enabled: boolean }, spaceId: string | null) {
  return skill.enabled && (skill.scope === 'global' || skill.space_id === spaceId);
}