import { useState } from 'react';
import { Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import PromptSaveDialog from './PromptSaveDialog';
import type { ChatModality } from '@/lib/chatStore';
export default function SavePromptButton({ text, modality }: { text: string; modality: ChatModality }) {
  const [open, setOpen] = useState(false);
  return <><Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-primary" title="Сохранить промпт" aria-label="Сохранить промпт" onClick={() => setOpen(true)}><Star className="h-3.5 w-3.5" /></Button>{open && <PromptSaveDialog onClose={() => setOpen(false)} text={text} modality={modality} />}</>;
}