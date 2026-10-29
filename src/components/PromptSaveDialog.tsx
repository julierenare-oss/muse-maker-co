import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { usePrompts } from '@/hooks/use-prompts';
import type { ChatModality } from '@/lib/chatStore';
import type { SavedPrompt } from '@/lib/prompts';

interface Props { onClose: () => void; initial?: SavedPrompt; text?: string; modality?: ChatModality }
export default function PromptSaveDialog({ onClose, initial, text = '', modality = 'text' }: Props) {
  const { save, busy, signedIn } = usePrompts();
  const [title, setTitle] = useState(initial?.title ?? text.slice(0, 60));
  const [prompt, setPrompt] = useState(initial?.prompt ?? text);
  const [type, setType] = useState<ChatModality>(initial?.modality ?? modality);
  const [tags, setTags] = useState(initial?.tags.join(', ') ?? '');
  const [favorite, setFavorite] = useState(initial?.is_favorite ?? true);
  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      await save({ id: initial?.id, data: { title, prompt, modality: type, tags: tags.split(',').map(t => t.trim()).filter(Boolean), is_favorite: favorite } });
      toast.success('Промпт сохранён'); onClose();
    } catch (e) { toast.error(e instanceof Error ? e.message : 'Не удалось сохранить промпт'); }
  };
  return <Dialog open onOpenChange={open => { if (!open && !busy) onClose(); }}><DialogContent className="max-w-xl"><DialogHeader><DialogTitle>{initial ? 'Редактировать промпт' : 'Сохранить промпт'}</DialogTitle></DialogHeader>
    <form onSubmit={submit} className="space-y-4">
      <div className="space-y-2"><Label htmlFor="prompt-title">Название</Label><Input id="prompt-title" value={title} onChange={e => setTitle(e.target.value)} maxLength={100} required /></div>
      <div className="space-y-2"><Label htmlFor="saved-prompt-text">Промпт</Label><Textarea id="saved-prompt-text" value={prompt} onChange={e => setPrompt(e.target.value)} maxLength={2000} required className="min-h-40" /><p className="text-xs text-muted-foreground text-right">{prompt.length}/2000</p></div>
      <div className="space-y-2"><Label>Тип запроса</Label><Select value={type} onValueChange={v => setType(v as ChatModality)}><SelectTrigger aria-label="Тип запроса"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="text">Текст</SelectItem><SelectItem value="image">Изображение</SelectItem><SelectItem value="video">Видео</SelectItem></SelectContent></Select></div>
      <div className="space-y-2"><Label htmlFor="prompt-tags">Теги</Label><Input id="prompt-tags" placeholder="Работа, дизайн" value={tags} onChange={e => setTags(e.target.value)} /></div>
      <div className="flex items-center gap-3"><Switch id="prompt-favorite" checked={favorite} onCheckedChange={setFavorite} /><Label htmlFor="prompt-favorite">Избранное</Label></div>
      {!signedIn && <p className="text-sm text-muted-foreground">Войдите в NEXAGEN, чтобы сохранить промпт.</p>}
      <div className="flex justify-end gap-2"><Button type="button" variant="outline" onClick={onClose} disabled={busy}>Отмена</Button><Button variant="glow" disabled={busy || !signedIn || !title.trim() || !prompt.trim()}>{busy ? 'Сохранение…' : 'Сохранить'}</Button></div>
    </form>
  </DialogContent></Dialog>;
}