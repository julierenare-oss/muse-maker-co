import { useState } from "react";
import { Mail, Send, Shield, Users, Settings2, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { toast } from "@/hooks/use-toast";

type Role = "owner" | "member";

interface TeamMember {
  id: string;
  username: string;
  email: string;
  role: Role;
  addedAt: string;
  tokenLimit: number; // tokens per month, 0 = unlimited
  allowedModels: string[];
}

interface Invitation {
  id: string;
  email: string;
  role: Role;
  sentAt: string;
  expiresAt: string;
}

const AVAILABLE_MODELS = [
  { id: "MaaS_Cl_Opus", label: "Claude Opus (текст)" },
  { id: "MaaS_image_1", label: "Image Gen v1 (картинки)" },
  { id: "MaaS-MJ", label: "Midjourney (видео)" },
];

const initialMembers: TeamMember[] = [
  {
    id: "1",
    username: "j.rybakova",
    email: "j.rybakova@cdnvideo.ru",
    role: "member",
    addedAt: "18.05.2026, 15:36:21",
    tokenLimit: 500_000,
    allowedModels: ["MaaS_Cl_Opus", "MaaS_image_1"],
  },
  {
    id: "2",
    username: "test-mock-owner",
    email: "test-mock-owner@cdnvideo.com",
    role: "owner",
    addedAt: "06.05.2026, 22:42:35",
    tokenLimit: 0,
    allowedModels: AVAILABLE_MODELS.map((m) => m.id),
  },
];

const initialInvitations: Invitation[] = [
  {
    id: "i1",
    email: "komandin-a@bk.ru",
    role: "member",
    sentAt: "15.05.2026, 18:00:41",
    expiresAt: "18.05.2026, 18:00:41",
  },
];

const fmtTokens = (n: number) =>
  n === 0 ? "Без лимита" : new Intl.NumberFormat("ru-RU").format(n) + " токенов / мес";

const TeamPage = () => {
  const [members, setMembers] = useState<TeamMember[]>(initialMembers);
  const [invitations, setInvitations] = useState<Invitation[]>(initialInvitations);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<Role>("member");
  const [editing, setEditing] = useState<TeamMember | null>(null);

  const sendInvite = () => {
    if (!inviteEmail.includes("@")) return;
    const now = new Date();
    const exp = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
    const fmt = (d: Date) =>
      d.toLocaleString("ru-RU", { dateStyle: "short", timeStyle: "medium" }).replace(",", ",");
    setInvitations((prev) => [
      ...prev,
      { id: crypto.randomUUID(), email: inviteEmail, role: inviteRole, sentAt: fmt(now), expiresAt: fmt(exp) },
    ]);
    toast({ title: "Приглашение отправлено", description: inviteEmail });
    setInviteEmail("");
    setInviteRole("member");
  };

  const cancelInvitation = (id: string) => {
    setInvitations((prev) => prev.filter((i) => i.id !== id));
    toast({ title: "Приглашение отменено" });
  };

  const removeMember = (id: string) => {
    setMembers((prev) => prev.filter((m) => m.id !== id));
    toast({ title: "Участник удалён" });
  };

  const saveMember = (updated: TeamMember) => {
    setMembers((prev) => prev.map((m) => (m.id === updated.id ? updated : m)));
    toast({ title: "Настройки сохранены", description: updated.username });
    setEditing(null);
  };

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Команда</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Приглашайте участников и управляйте доступом к вашему рабочему пространству
        </p>
      </div>

      {/* Invite */}
      <section className="bg-card border border-border rounded-xl p-6">
        <h2 className="text-base font-medium text-foreground">Пригласить участника в команду</h2>
        <p className="text-xs text-muted-foreground mt-1">
          Отправить приглашение по электронной почте и назначить роль в проекте
        </p>
        <div className="grid grid-cols-1 md:grid-cols-[1fr_180px_auto] gap-3 mt-5">
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Электронная почта</Label>
            <Input
              placeholder="Например: user@cdnvideo.ru"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Роль</Label>
            <Select value={inviteRole} onValueChange={(v) => setInviteRole(v as Role)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="member">Участник</SelectItem>
                <SelectItem value="owner">Владелец</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-end">
            <Button variant="glow" onClick={sendInvite} disabled={!inviteEmail.includes("@")} className="w-full">
              <Send className="h-4 w-4 mr-1" />
              Отправить приглашение
            </Button>
          </div>
        </div>
      </section>

      {/* Members */}
      <section className="bg-card border border-border rounded-xl p-6">
        <h2 className="text-base font-medium text-foreground mb-4">Участники</h2>
        <div className="space-y-3">
          {members.map((m) => (
            <div
              key={m.id}
              className="border border-border/70 rounded-lg p-4 flex items-center gap-4 group hover:bg-muted/20 transition-colors"
            >
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                {m.role === "owner" ? (
                  <Shield className="h-5 w-5 text-primary" />
                ) : (
                  <Users className="h-5 w-5 text-primary" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium text-foreground truncate">{m.username}</p>
                  <Badge variant={m.role === "owner" ? "default" : "secondary"}>
                    {m.role === "owner" ? "Владелец" : "Участник"}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5 truncate">{m.email}</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Добавлен {m.addedAt} · {fmtTokens(m.tokenLimit)} · Моделей: {m.allowedModels.length}/
                  {AVAILABLE_MODELS.length}
                </p>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setEditing(m)}>
                <Settings2 className="h-4 w-4 mr-1" />
                Настроить
              </Button>
              {m.role !== "owner" && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-destructive opacity-0 group-hover:opacity-100"
                  onClick={() => removeMember(m.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Invitations */}
      <section className="bg-card border border-border rounded-xl p-6">
        <h2 className="text-base font-medium text-foreground mb-4">Приглашения</h2>
        {invitations.length === 0 ? (
          <p className="text-sm text-muted-foreground">Активных приглашений нет</p>
        ) : (
          <div className="space-y-3">
            {invitations.map((inv) => (
              <div key={inv.id} className="border border-border/70 rounded-lg p-4 flex items-center gap-4 group">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <Mail className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-foreground truncate">{inv.email}</p>
                    <Badge variant="outline" className="text-amber-400 border-amber-400/40">
                      Ожидание
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Роль: {inv.role === "owner" ? "Владелец" : "Участник"} · Отправлено {inv.sentAt}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">Действует до {inv.expiresAt}</p>
                </div>
                <Button variant="ghost" size="icon" onClick={() => cancelInvitation(inv.id)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Edit member dialog */}
      <EditMemberDialog member={editing} onClose={() => setEditing(null)} onSave={saveMember} />
    </div>
  );
};

interface EditDialogProps {
  member: TeamMember | null;
  onClose: () => void;
  onSave: (m: TeamMember) => void;
}

const EditMemberDialog = ({ member, onClose, onSave }: EditDialogProps) => {
  const [draft, setDraft] = useState<TeamMember | null>(null);

  // sync when member changes
  if (member && (!draft || draft.id !== member.id)) {
    setDraft(member);
  }
  if (!member || !draft) return null;

  const toggleModel = (id: string, checked: boolean) => {
    setDraft({
      ...draft,
      allowedModels: checked
        ? [...draft.allowedModels, id]
        : draft.allowedModels.filter((m) => m !== id),
    });
  };

  const tokenK = draft.tokenLimit / 1000;

  return (
    <Dialog open={!!member} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Настройки участника</DialogTitle>
          <DialogDescription>
            {draft.username} · {draft.email}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-2">
          {/* Role */}
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Роль</Label>
            <Select value={draft.role} onValueChange={(v) => setDraft({ ...draft, role: v as Role })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="member">Участник</SelectItem>
                <SelectItem value="owner">Владелец</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Token limit */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-xs text-muted-foreground">Лимит токенов в месяц</Label>
              <span className="text-xs text-foreground font-medium">{fmtTokens(draft.tokenLimit)}</span>
            </div>
            <Slider
              value={[tokenK]}
              min={0}
              max={5000}
              step={50}
              onValueChange={([v]) => setDraft({ ...draft, tokenLimit: v * 1000 })}
            />
            <div className="flex justify-between text-[10px] text-muted-foreground">
              <span>0 (без лимита)</span>
              <span>5 000 000</span>
            </div>
          </div>

          {/* Models */}
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Разрешённые модели</Label>
            <div className="space-y-2 border border-border rounded-lg p-3">
              {AVAILABLE_MODELS.map((mdl) => {
                const checked = draft.allowedModels.includes(mdl.id);
                return (
                  <label
                    key={mdl.id}
                    className="flex items-center gap-3 cursor-pointer text-sm text-foreground"
                  >
                    <Checkbox
                      checked={checked}
                      onCheckedChange={(c) => toggleModel(mdl.id, !!c)}
                    />
                    {mdl.label}
                  </label>
                );
              })}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>
            Отмена
          </Button>
          <Button variant="glow" onClick={() => onSave(draft)}>
            Сохранить
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default TeamPage;
