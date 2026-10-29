import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/lib/auth';
import { deletePrompt, listPrompts, savePrompt, type PromptInput } from '@/lib/prompts';

export function usePrompts() {
  const token = useAuthStore(s => s.token);
  const client = useQueryClient();
  const key = ['prompts', token];
  const query = useQuery({ queryKey: key, queryFn: listPrompts, enabled: !!token, retry: false });
  const mutation = useMutation({
    mutationFn: (input: { id?: string; data?: PromptInput; remove?: boolean }) => {
      if (input.remove && input.id) return deletePrompt(input.id);
      if (!input.data) throw new Error('Нет текста промпта');
      return savePrompt(input.data, input.id);
    },
    onSuccess: () => client.invalidateQueries({ queryKey: key }),
  });
  return { ...query, prompts: query.data ?? [], signedIn: !!token, save: mutation.mutateAsync, busy: mutation.isPending };
}