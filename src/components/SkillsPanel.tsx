import { useState } from "react";
import { Sparkles, Plus, Loader2, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useSkills } from "@/hooks/use-skills";
import { skillSelected } from "@/lib/skills";
import SkillImportDialog from "./SkillImportDialog";

export default function SkillsPanel({ spaceId, spaceName }: { spaceId?: string; spaceName?: string }) {
  const { data, isLoading, error, busy, mutate, refresh } = useSkills();
  const [importOpen, setImportOpen] = useState(false);
  const [membersOpen, setMembersOpen] = useState(false);
  const space = data?.spaces.find(s => s.id === spaceId);
  const available = data?.skills.filter(s => s.enabled && (s.scope === "global" || s.space_id === spaceId)) || [];
  const ready = !spaceId || !!space;
  const act = (body: Record<string, unknown>) => { void mutate(body).catch(() => {}); };
  return <section className="space-y-3 py-3">
    <div className="flex items-center justify-between gap-2">
      <h3 className="flex items-center gap-2 text-sm font-semibold"><Sparkles className="h-4 w-4 text-primary" />Skills</h3>
      <div className="flex gap-1">
        {space?.owner_id === data?.userId && <Button variant="ghost" size="icon" className="h-7 w-7" title="Участники пространства" onClick={() => setMembersOpen(true)}><Users /></Button>}
        {ready && !!data?.userId && <Button variant="ghost" size="icon" className="h-7 w-7" title="Загрузить скилл" onClick={() => setImportOpen(true)}><Plus /></Button>}
      </div>
    </div>
    {isLoading && <Loader2 className="h-4 w-4 animate-spin text-primary" />}
    {error && <div className="text-xs text-destructive">{error.message}<Button variant="link" size="sm" onClick={() => refresh()}>Повторить</Button></div>}
    {!ready && data?.userId && <Button variant="outline" size="sm" className="w-full whitespace-normal h-auto py-2" disabled={busy} onClick={() => act({ action: "registerSpace", id: spaceId, name: spaceName })}>Подключить Skills к пространству</Button>}
    {available.map(skill => {
      const global = !!spaceId && data?.selections.some(s => s.skill_id === skill.id && s.context_id === "__global__" && s.enabled);
      return <div key={skill.id} className="flex items-center justify-between gap-3 border-b border-border pb-2">
        <div className="min-w-0"><p className="text-xs font-medium break-words">{skill.name}</p>
          <p className="text-[11px] text-muted-foreground">{global ? "Включён для всех пространств" : skill.source === "service" ? "От сервиса" : "Пользовательский"}</p></div>
        <Switch aria-label={`Использовать ${skill.name}`} checked={data ? skillSelected(data, skill, spaceId) : false} disabled={busy || !ready || !data?.userId || global}
          onCheckedChange={enabled => act({ action: "select", skillId: skill.id, contextId: spaceId || "__global__", enabled })} />
      </div>;
    })}
    {!isLoading && !error && !available.length && <p className="text-xs text-muted-foreground">Нет доступных скиллов</p>}
    {data && <SkillImportDialog open={importOpen} onOpenChange={setImportOpen} spaces={data.spaces} spaceId={spaceId} onImported={refresh} />}
    <Dialog open={membersOpen} onOpenChange={setMembersOpen}><DialogContent>
      <DialogHeader><DialogTitle>Участники · {spaceName}</DialogTitle></DialogHeader>
      <div className="space-y-3"><p className="text-sm text-muted-foreground">Владелец: {space?.owner_id}</p>
        {data?.accountMembers.filter(m => m.user_id !== space?.owner_id).map(m => <label key={m.user_id} className="flex items-center justify-between gap-3 text-sm">
          <span className="break-all">{m.label}</span><Checkbox aria-label={`Участник ${m.label}`} disabled={busy}
            checked={data.members.some(member => member.space_id === spaceId && member.user_id === m.user_id)}
            onCheckedChange={enabled => act({ action: "member", spaceId, userId: m.user_id, enabled: enabled === true })} />
        </label>)}
        {data?.accountMembers.length === 1 && <p className="text-sm text-muted-foreground">Другие участники ещё не входили в NEXAGEN.</p>}
      </div>
    </DialogContent></Dialog>
  </section>;
}