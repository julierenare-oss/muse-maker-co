import { useState } from "react";
import { Sparkles, Upload, Search, Trash2, Loader2, Lock, Users, Globe, Folder } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useSkills } from "@/hooks/use-skills";
import { type Skill } from "@/lib/skills";
import SkillImportDialog from "@/components/SkillImportDialog";
import SkillsPanel from "@/components/SkillsPanel";

export default function SkillsPage() {
  const { data, isLoading, error, busy, mutate, refresh } = useSkills();
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState("all");
  const [importOpen, setImportOpen] = useState(false);
  const [detail, setDetail] = useState<Skill | null>(null);
  const [deleting, setDeleting] = useState<Skill | null>(null);
  const skills = data?.skills.filter(s =>
    `${s.name} ${s.description}`.toLowerCase().includes(search.toLowerCase()) &&
    (tab === "all" || (tab === "service" && s.source === "service") || (tab === "mine" && s.owner_id === data.userId) || (tab === "shared" && s.source !== "service" && s.owner_id !== data.userId))) || [];
  return <div className="p-6 space-y-6">
    <header className="flex flex-wrap items-center justify-between gap-4">
      <div><h1 className="text-xl font-semibold flex items-center gap-2"><Sparkles className="text-primary" />Skills</h1><p className="text-sm text-muted-foreground mt-1">Сервисные, личные и общие скиллы</p></div>
      <Button variant="glow" onClick={() => setImportOpen(true)} disabled={!data?.userId}><Upload />Загрузить скилл</Button>
    </header>
    <div className="flex flex-col xl:flex-row gap-6">
      <div className="flex-1 min-w-0 space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Tabs value={tab} onValueChange={setTab}><TabsList className="flex-wrap h-auto"><TabsTrigger value="all">Все</TabsTrigger><TabsTrigger value="service">От сервиса</TabsTrigger><TabsTrigger value="mine">Мои</TabsTrigger><TabsTrigger value="shared">Общие</TabsTrigger></TabsList></Tabs>
          <div className="relative"><Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" /><Input aria-label="Поиск скиллов" placeholder="Поиск скиллов" value={search} onChange={e => setSearch(e.target.value)} className="pl-9" /></div>
        </div>
        {isLoading && <Loader2 className="animate-spin text-primary" />}
        {error && <div className="text-destructive text-sm">{error.message}<Button variant="link" onClick={() => refresh()}>Повторить</Button></div>}
        <div className="grid sm:grid-cols-2 gap-4">{skills.map(skill => <article key={skill.id} className="border border-border bg-card rounded-lg p-4 flex flex-col gap-3">
          <div className="flex items-start justify-between gap-3"><Sparkles className={skill.source === "service" ? "text-primary h-5 w-5" : "text-accent h-5 w-5"} /><span className="text-xs text-muted-foreground">{skill.source === "service" ? "NEXAGEN" : skill.owner_id === data?.userId ? "Мой скилл" : "Общий"}</span></div>
          <h2 className="font-semibold break-words">{skill.name}</h2><p className="text-sm text-muted-foreground break-words flex-1">{skill.description}</p>
          <div className="flex flex-wrap gap-3 text-xs text-muted-foreground"><span className="flex gap-1 items-center">{skill.scope === "global" ? <Globe className="h-3 w-3" /> : <Folder className="h-3 w-3" />}{skill.scope === "global" ? "Все пространства" : data?.spaces.find(s => s.id === skill.space_id)?.name || "Пространство"}</span><span className="flex gap-1 items-center">{skill.visibility === "private" ? <Lock className="h-3 w-3" /> : <Users className="h-3 w-3" />}{skill.visibility === "private" ? "Личный" : "Для участников"}</span></div>
          <div className="flex items-center justify-between border-t border-border pt-3 gap-2"><Button size="sm" variant="ghost" onClick={() => setDetail(skill)}>Инструкции</Button>
            {skill.owner_id === data?.userId && <div className="flex items-center gap-2"><Switch aria-label={`Включить ${skill.name}`} checked={skill.enabled} disabled={busy} onCheckedChange={enabled => { void mutate({ action: "toggle", skillId: skill.id, enabled }).catch(() => {}); }} /><Button variant="ghost" size="icon" title={`Удалить ${skill.name}`} className="h-8 w-8 text-destructive" onClick={() => setDeleting(skill)}><Trash2 /></Button></div>}
          </div>
        </article>)}</div>
        {!isLoading && !error && !skills.length && <p className="text-sm text-muted-foreground py-10 text-center">Ничего не найдено</p>}
      </div>
      <aside className="xl:w-72 shrink-0 border-t xl:border-t-0 xl:border-l border-border xl:pl-5"><SkillsPanel /></aside>
    </div>
    {data && <SkillImportDialog open={importOpen} onOpenChange={setImportOpen} spaces={data.spaces} onImported={refresh} />}
    <Dialog open={!!detail} onOpenChange={open => !open && setDetail(null)}><DialogContent className="max-w-2xl"><DialogHeader><DialogTitle>{detail?.name}</DialogTitle></DialogHeader><pre className="whitespace-pre-wrap break-words text-sm max-h-[60vh] overflow-y-auto font-mono">{detail?.instructions}</pre></DialogContent></Dialog>
    <Dialog open={!!deleting} onOpenChange={open => !open && setDeleting(null)}><DialogContent><DialogHeader><DialogTitle>Удалить «{deleting?.name}»?</DialogTitle></DialogHeader><DialogFooter><Button variant="ghost" onClick={() => setDeleting(null)}>Отмена</Button><Button variant="destructive" disabled={busy} onClick={async () => { if (!deleting) return; try { await mutate({ action: "delete", skillId: deleting.id }); setDeleting(null); } catch { /* shown by hook */ } }}>Удалить</Button></DialogFooter></DialogContent></Dialog>
  </div>;
}