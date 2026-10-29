export function validatePrompt(input: Record<string, unknown>) {
  if (typeof input.title !== 'string' || !input.title.trim() || input.title.length > 100) throw new Error('Название: от 1 до 100 символов');
  if (typeof input.prompt !== 'string' || !input.prompt.trim() || input.prompt.length > 2000) throw new Error('Промпт: от 1 до 2000 символов');
  if (!['text', 'image', 'video'].includes(String(input.modality))) throw new Error('Некорректный тип запроса');
  if (typeof input.is_favorite !== 'boolean') throw new Error('Некорректное избранное');
  if (!Array.isArray(input.tags) || input.tags.length > 10 || input.tags.some(t => typeof t !== 'string' || !t.trim() || t.length > 40)) throw new Error('До 10 тегов, каждый до 40 символов');
  return { title: input.title.trim(), prompt: input.prompt.trim(), modality: String(input.modality), tags: [...new Set(input.tags.map(t => String(t).trim()))], is_favorite: input.is_favorite };
}

export function promptOwnerScope(accountId: string, userId: string) {
  if (!userId) throw new Error('Войдите в аккаунт NEXAGEN');
  return { account_id: accountId, owner_id: userId };
}