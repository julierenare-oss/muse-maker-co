import { useState } from "react";
import { Upload, Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { importSkill, type SkillSpace } from "@/lib/skills";
import { toast } from "sonner";

export default function SkillImportDialog({ open, onOpenChange, spaces, spaceId, onImported }: {
  open: boolean; onOpenChange: (open: boolean) => void; spaces: SkillSpace[]; spaceId?: string; onImported: () => Promise<unknown>;
}) {
  const [file, setFile] = useState<File | null>(null);
  const [scope, setScope] = useState(spaceId ? "space" : "global");
  const [visibility, setVisibility] = useState("private");
  const [selectedSpace, setSelectedSpace] = useState(spaceId || "");
  const [busy, setBusy] = useState(false);
  const needsSpace = scope === "space" || visibility === "project";
  const submit = async () => {
    if (!file) return;
    setBusy(true);
    try {
      await importSkill(file, scope, visibility, needsSpace ? selectedSpace : null);
      await onImported(); onOpenChange(false); setFile(null);
      toast.success("Скилл загружен");
    } catch (e) { toast.error(e instanceof Error ? e.message : "Не удалось загрузить скилл"); }
    finally { setBusy(false); }
  };
  return <Dialog open={open} onOpenChange={v => !busy && onOpenChange(v)}>
    <DialogContent className="max-w-lg">
      <DialogHeader><DialogTitle>Загрузить скилл</DialogTitle></DialogHeader>
      <div className="space-y-4">
        <div className="space-y-2"><Label htmlFor="skill-file">SKILL.md или ZIP · до 5 МБ</Label>
          <Input id="skill-file" type="file" accept=".md,.zip" onChange={e => setFile(e.target.files?.[0] || null)} /></div>
        <div className="space-y-2"><Label>Область действия</Label>
          <Select value={scope} onValueChange={setScope}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>
            <SelectItem value="global">Все пространства</SelectItem><SelectItem value="space">Одно пространство</SelectItem>
          </SelectContent></Select></div>
        <div className="space-y-2"><Label>Видимость</Label>
          <Select value={visibility} onValueChange={setVisibility}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>
            <SelectItem value="private">Только я</SelectItem><SelectItem value="project">Участники пространства</SelectItem>
          </SelectContent></Select></div>
        {needsSpace && <div className="space-y-2"><Label>Пространство</Label>
          <Select value={selectedSpace} onValueChange={setSelectedSpace}><SelectTrigger><SelectValue placeholder="Выберите пространство" /></SelectTrigger>
            <SelectContent>{spaces.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}</SelectContent></Select></div>}
      </div>
      <DialogFooter><Button variant="ghost" onClick={() => onOpenChange(false)} disabled={busy}>Отмена</Button>
        <Button onClick={submit} disabled={busy || !file || (needsSpace && !selectedSpace)}>{busy ? <Loader2 className="animate-spin" /> : <Upload />} Загрузить</Button></DialogFooter>
    </DialogContent>
  </Dialog>;
}