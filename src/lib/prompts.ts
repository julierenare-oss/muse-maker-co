import { skillsRequest } from './skills';
import type { ChatModality } from './chatStore';

export interface SavedPrompt {
  id: string;
  title: string;
  prompt: string;
  modality: ChatModality;
  tags: string[];
  is_favorite: boolean;
  created_at: string;
  updated_at: string;
}
export type PromptInput = Pick<SavedPrompt, 'title' | 'prompt' | 'modality' | 'tags' | 'is_favorite'>;
export const listPrompts = () => skillsRequest<SavedPrompt[]>({ action: 'promptList' });
export const savePrompt = (input: PromptInput, id?: string) => skillsRequest({ action: 'promptSave', ...input, id });
export const deletePrompt = (id: string) => skillsRequest({ action: 'promptDelete', id });