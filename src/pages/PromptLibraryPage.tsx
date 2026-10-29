import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Star, Copy, Trash2, Plus, Search, ArrowUpRight, Pencil, Bookmark, Loader2, Tag } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from '@/components/ui/alert-dialog';
import PromptSaveDialog from '@/components/PromptSaveDialog';
import { usePrompts } from '@/hooks/use-prompts';
import { useChatStore } from '@/lib/chatStore';
import type { SavedPrompt } from '@/lib/prompts';

const labels = { text: 'Текст', image: 'Изображение', video: 'Видео' };
export default function PromptLibraryPage() {
  const { prompts, signedIn, isLoading, error, refetch, save, busy } = usePrompts();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [favorites, setFavorites] = useState(false);
  const [modality, setModality] = useState('all');
  const [tag, setTag] = useState('all');
  const [editor, setEditor] = useState<SavedPrompt | 'new' | null>(null);
  const [deleting, setDeleting] = useState<SavedPrompt | null>(null);
  const tags = [...new Set(prompts.flatMap(p => p.tags))].sort();
  const filtered = prompts.filter(p => (!favorites || p.is_favorite) && (modality === 'all' || modality === p.modality) && (tag === 'all' || p.tags.includes(tag)) && `${p.title} ${p.prompt} ${p.tags.join(' ')}`.toLowerCase().includes(search.trim().toLowerCase()));
  const reuse = (p: SavedPrompt) => {
    const chat = useChatStore.getState();
    chat.newConversation(); chat.setModality(p.modality); chat.setDraftPrompt(p.prompt);
    navigate('/app');
  };
  const toggle = async (p: SavedPrompt) => {
    try { await save({ id: p.id, data: { title: p.title, prompt: p.prompt, tags: p.tags, modality: p.modality, is_favorite: !p.is_favorite } }); }
    catch (e) { toast.error(e instanceof Error ? e.message : 'Не удалось изменить избранное'); }
  };
  const remove = async () => {
    if (!deleting) return;
    try { await save({ id: deleting.id, remove: true }); setDeleting(null); toast.success('Промпт удалён'); }
    catch (e) { toast.error(e instanceof Error ? e.message : 'Не удалось удалить промпт'); }
  };
  const copy = async (p: SavedPrompt) => {
    try { await navigator.clipboard.writeText(p.prompt); toast.success('Промпт скопирован'); }
    catch { toast.error('Не удалось скопировать'); }
  };
  return <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto">
    <header className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-5">
      <div className="flex items-center gap-3"><Bookmark className="h-7 w-7 text-primary" /><div><h1 className="text-2xl font-semibold text-foreground">Библиотека</h1><p className="text-sm text-muted-foreground">Мои промпты <span className="text-primary">· {prompts.length}</span></p></div></div>
      <Button variant="glow" onClick={() => setEditor('new')} disabled={!signedIn}><Plus className="h-4 w-4" />Добавить промпт</Button>
    </header>
    <div className="flex flex-col xl:flex-row gap-5">
      <aside className="xl:w-48 shrink-0 space-y-3">
        <Button variant={!favorites ? 'secondary' : 'ghost'} className="w-full justify-start" onClick={() => setFavorites(false)}><Bookmark className="h-4 w-4" />Все промпты <span className="ml-auto text-xs">{prompts.length}</span></Button>
        <Button variant={favorites ? 'secondary' : 'ghost'} className="w-full justify-start" onClick={() => setFavorites(true)}><Star className="h-4 w-4" />Избранное <span className="ml-auto text-xs">{prompts.filter(p => p.is_favorite).length}</span></Button>
        <div className="border-t border-border pt-4 space-y-2"><h2 className="text-xs text-muted-foreground flex items-center gap-2"><Tag className="h-3 w-3" />Теги</h2>
          <Select value={tag} onValueChange={setTag}><SelectTrigger aria-label="Фильтр по тегу"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">Все теги</SelectItem>{tags.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent></Select>
        </div>
      </aside>
      <section className="flex-1 min-w-0 space-y-4">
        <div className="flex flex-col sm:flex-row gap-3"><div className="relative flex-1"><Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" /><Input aria-label="Поиск промптов" placeholder="Поиск по названию, тексту и тегам" className="pl-10" value={search} onChange={e => setSearch(e.target.value)} /></div>
          <Select value={modality} onValueChange={setModality}><SelectTrigger className="sm:w-44" aria-label="Фильтр по типу"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">Все типы</SelectItem><SelectItem value="text">Текст</SelectItem><SelectItem value="image">Изображение</SelectItem><SelectItem value="video">Видео</SelectItem></SelectContent></Select>
        </div>
        {!signedIn ? <div className="py-16 text-center space-y-4"><Bookmark className="h-10 w-10 text-primary mx-auto" /><h2 className="text-lg text-foreground">Войдите в NEXAGEN</h2><p className="text-sm text-muted-foreground">Сохранённые промпты доступны после входа.</p><Button variant="outline" onClick={() => navigate('/')}>Войти</Button></div>
          : isLoading ? <div className="flex justify-center py-16"><Loader2 className="animate-spin h-6 w-6 text-primary" /></div>
          : error ? <div className="py-12 text-center space-y-3"><p className="text-sm text-destructive">{error.message}</p><Button variant="outline" onClick={() => refetch()}>Повторить</Button></div>
          : filtered.length === 0 ? <div className="py-16 text-center space-y-3"><Bookmark className="h-10 w-10 text-muted-foreground mx-auto" /><h2 className="text-lg text-foreground">{prompts.length ? 'Ничего не найдено' : 'Пока нет сохранённых промптов'}</h2>{!prompts.length && <Button variant="outline" onClick={() => setEditor('new')}><Plus className="h-4 w-4" />Добавить промпт</Button>}</div>
          : <><p className="text-xs text-muted-foreground">Найдено: {filtered.length}</p><div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-4">{filtered.map(p => <article key={p.id} className="bg-card border border-border rounded-lg p-4 flex flex-col gap-3 min-w-0">
            <div className="flex justify-between items-start gap-2"><h2 className="font-medium text-foreground break-words min-w-0">{p.title}</h2><Button variant="ghost" size="icon" className={`h-7 w-7 shrink-0 ${p.is_favorite ? 'text-primary' : 'text-muted-foreground'}`} aria-label={p.is_favorite ? 'Убрать из избранного' : 'В избранное'} title={p.is_favorite ? 'Убрать из избранного' : 'В избранное'} disabled={busy} onClick={() => toggle(p)}><Star className="h-4 w-4" fill={p.is_favorite ? 'currentColor' : 'none'} /></Button></div>
            <p className="text-sm text-muted-foreground line-clamp-4 whitespace-pre-wrap break-words flex-1">{p.prompt}</p>
            <div className="flex flex-wrap gap-1.5"><Badge variant="secondary">{labels[p.modality]}</Badge>{p.tags.map(t => <Badge key={t} variant="outline" className="break-all">{t}</Badge>)}</div>
            <div className="text-xs text-muted-foreground">{new Date(p.updated_at).toLocaleDateString('ru-RU')}</div>
            <div className="flex flex-wrap gap-1 items-center border-t border-border pt-3"><Button size="sm" variant="outline" onClick={() => reuse(p)}>Новый запрос<ArrowUpRight className="h-3.5 w-3.5" /></Button><div className="flex ml-auto"><Button size="icon" variant="ghost" title="Копировать" aria-label="Копировать промпт" onClick={() => copy(p)}><Copy className="h-4 w-4" /></Button><Button size="icon" variant="ghost" title="Редактировать" aria-label="Редактировать промпт" onClick={() => setEditor(p)}><Pencil className="h-4 w-4" /></Button><Button size="icon" variant="ghost" className="text-destructive" title="Удалить" aria-label="Удалить промпт" onClick={() => setDeleting(p)}><Trash2 className="h-4 w-4" /></Button></div></div>
          </article>)}</div></>}
      </section>
    </div>
    {editor && <PromptSaveDialog initial={editor === 'new' ? undefined : editor} onClose={() => setEditor(null)} />}
    <AlertDialog open={!!deleting} onOpenChange={open => { if (!open && !busy) setDeleting(null); }}><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Удалить промпт?</AlertDialogTitle><AlertDialogDescription>«{deleting?.title}» будет удалён из вашей библиотеки.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel disabled={busy}>Отмена</AlertDialogCancel><AlertDialogAction disabled={busy} onClick={e => { e.preventDefault(); void remove(); }}>Удалить</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog>
  </div>;
}
