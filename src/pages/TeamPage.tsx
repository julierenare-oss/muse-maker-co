import { useState } from "react";
import {
  Mail,
  Send,
  Shield,
  Users,
  Settings2,
  Trash2,
  X,
  CalendarIcon,
  DollarSign,
  Clock,
  Cpu,
  Check,
  TrendingUp,
  MessageSquare,
} from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";

type Role = "owner" | "member";
type Modality = "text" | "image" | "video";

interface ModelMeta {
  id: string;
  label: string;
  modality: Modality;
}

const AVAILABLE_MODELS: ModelMeta[] = [
  { id: "MaaS_Cl_Opus", label: "Claude Opus", modality: "text" },
  { id: "MaaS_image_1", label: "Image Gen v1", modality: "image" },
  { id: "MaaS-MJ", label: "Midjourney Video", modality: "video" },
];

const MODALITY_LABEL: Record<Modality, string> = {
  text: "Текст",
  image: "Изображения",
  video: "Видео",
};

interface MemberLimits {
  validFrom?: string; // ISO
  validUntil?: string;
  modalities: Record<Modality, boolean>;
  allowedModels: string[];
  budget: {
    dailyUsd?: number;
    monthlyUsd?: number;
  };
  tokens: {
    dailyTokens?: number;
    monthlyTokens?: number;
  };
  /** mock usage for current month, in USD */
  usedMonthUsd?: number;
}

interface TeamMember {
  id: string;
  username: string;
  email: string;
  role: Role;
  addedAt: string;
  limits: MemberLimits;
}

interface Invitation {
  id: string;
  email: string;
  role: Role;
  sentAt: string;
  expiresAt: string;
}

const defaultLimits = (): MemberLimits => ({
  modalities: { text: true, image: true, video: true },
  allowedModels: AVAILABLE_MODELS.map((m) => m.id),
  budget: {},
  tokens: {},
});

const initialMembers: TeamMember[] = [
  {
    id: "1",
    username: "j.rybakova",
    email: "j.rybakova@cdnvideo.ru",
    role: "member",
    addedAt: "18.05.2026, 15:36:21",
    limits: {
      modalities: { text: true, image: true, video: false },
      allowedModels: ["MaaS_Cl_Opus", "MaaS_image_1"],
      budget: { dailyUsd: 20, monthlyUsd: 300 },
      tokens: { monthlyTokens: 500_000 },
      validUntil: "2026-12-31",
      usedMonthUsd: 87.4,
    },
  },
  {
    id: "2",
    username: "test-mock-owner",
    email: "test-mock-owner@cdnvideo.com",
    role: "owner",
    addedAt: "06.05.2026, 22:42:35",
    limits: defaultLimits(),
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

interface BudgetRequest {
  id: string;
  memberId: string;
  memberName: string;
  memberEmail: string;
  period: "day" | "month";
  currentUsd?: number;
  requestedUsd: number;
  reason: string;
  createdAt: string;
  status: "pending" | "approved" | "rejected";
}

const initialRequests: BudgetRequest[] = [
  {
    id: "r1",
    memberId: "1",
    memberName: "j.rybakova",
    memberEmail: "j.rybakova@cdnvideo.ru",
    period: "month",
    currentUsd: 300,
    requestedUsd: 500,
    reason: "Заканчивается бюджет на генерацию баннеров к запуску нового продукта — нужно ещё ~$200 до конца месяца.",
    createdAt: "14.07.2026, 11:24",
    status: "pending",
  },
  {
    id: "r2",
    memberId: "1",
    memberName: "j.rybakova",
    memberEmail: "j.rybakova@cdnvideo.ru",
    period: "day",
    currentUsd: 20,
    requestedUsd: 50,
    reason: "Готовим большой батч раскадровок сегодня к вечеру.",
    createdAt: "13.07.2026, 09:12",
    status: "pending",
  },
];


const fmtUsd = (n?: number) =>
  n == null ? "∞" : new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);

const fmtTokens = (n?: number) =>
  n == null ? null : new Intl.NumberFormat("ru-RU").format(n);

const TeamPage = () => {
  const [members, setMembers] = useState<TeamMember[]>(initialMembers);
  const [invitations, setInvitations] = useState<Invitation[]>(initialInvitations);
  const [requests, setRequests] = useState<BudgetRequest[]>(initialRequests);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<Role>("member");
  const [editing, setEditing] = useState<TeamMember | null>(null);

  const sendInvite = () => {
    if (!inviteEmail.includes("@")) return;
    const now = new Date();
    const exp = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
    const fmt = (d: Date) =>
      d.toLocaleString("ru-RU", { dateStyle: "short", timeStyle: "medium" });
    setInvitations((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        email: inviteEmail,
        role: inviteRole,
        sentAt: fmt(now),
        expiresAt: fmt(exp),
      },
    ]);
    toast({ title: "Приглашение отправлено", description: inviteEmail });
    setInviteEmail("");
    setInviteRole("member");
  };

  const cancelInvitation = (id: string) =>
    setInvitations((p) => p.filter((i) => i.id !== id));

  const removeMember = (id: string) =>
    setMembers((p) => p.filter((m) => m.id !== id));

  const saveMember = (updated: TeamMember) => {
    setMembers((p) => p.map((m) => (m.id === updated.id ? updated : m)));
    toast({ title: "Настройки сохранены", description: updated.username });
    setEditing(null);
  };

  const approveRequest = (id: string) => {
    const req = requests.find((r) => r.id === id);
    if (!req) return;
    setMembers((prev) =>
      prev.map((m) => {
        if (m.id !== req.memberId) return m;
        const budget = { ...m.limits.budget };
        if (req.period === "day") budget.dailyUsd = req.requestedUsd;
        else budget.monthlyUsd = req.requestedUsd;
        return { ...m, limits: { ...m.limits, budget } };
      }),
    );
    setRequests((p) => p.map((r) => (r.id === id ? { ...r, status: "approved" } : r)));
    toast({
      title: "Запрос одобрен",
      description: `${req.memberName}: новый лимит $${req.requestedUsd}/${req.period === "day" ? "день" : "мес"}`,
    });
  };

  const rejectRequest = (id: string) => {
    const req = requests.find((r) => r.id === id);
    setRequests((p) => p.map((r) => (r.id === id ? { ...r, status: "rejected" } : r)));
    if (req) toast({ title: "Запрос отклонён", description: req.memberName });
  };

  const pendingRequests = requests.filter((r) => r.status === "pending");

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Команда</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Приглашайте участников и управляйте доступом, бюджетом и моделями
        </p>
      </div>

      {/* Invite */}
      <section className="bg-card border border-border rounded-xl p-6">
        <h2 className="text-base font-medium text-foreground">Пригласить участника</h2>
        <p className="text-xs text-muted-foreground mt-1">
          Отправить приглашение по электронной почте и назначить роль
        </p>
        <div className="grid grid-cols-1 md:grid-cols-[1fr_180px_auto] gap-3 mt-5">
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Электронная почта</Label>
            <Input
              placeholder="user@cdnvideo.ru"
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
            <Button
              variant="glow"
              onClick={sendInvite}
              disabled={!inviteEmail.includes("@")}
              className="w-full"
            >
              <Send className="h-4 w-4 mr-1" />
              Отправить
            </Button>
          </div>
        </div>
      </section>

      {/* Members */}
      <section className="bg-card border border-border rounded-xl p-6">
        <h2 className="text-base font-medium text-foreground mb-4">Участники</h2>
        <div className="space-y-3">
          {members.map((m) => (
            <MemberRow
              key={m.id}
              member={m}
              onEdit={() => setEditing(m)}
              onRemove={() => removeMember(m.id)}
            />
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
              <div
                key={inv.id}
                className="border border-border/70 rounded-lg p-4 flex items-center gap-4"
              >
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <Mail className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-foreground truncate">
                      {inv.email}
                    </p>
                    <Badge variant="outline" className="text-amber-400 border-amber-400/40">
                      Ожидание
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Роль: {inv.role === "owner" ? "Владелец" : "Участник"} · Отправлено{" "}
                    {inv.sentAt}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Действует до {inv.expiresAt}
                  </p>
                </div>
                <Button variant="ghost" size="icon" onClick={() => cancelInvitation(inv.id)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </section>

      <EditMemberDialog member={editing} onClose={() => setEditing(null)} onSave={saveMember} />
    </div>
  );
};

/* ---------- Member row ---------- */

const MemberRow = ({
  member,
  onEdit,
  onRemove,
}: {
  member: TeamMember;
  onEdit: () => void;
  onRemove: () => void;
}) => {
  const { limits } = member;
  const chips: { icon: React.ReactNode; label: string }[] = [];

  if (limits.budget.dailyUsd != null)
    chips.push({ icon: <DollarSign className="h-3 w-3" />, label: `${fmtUsd(limits.budget.dailyUsd)}/день` });
  if (limits.budget.monthlyUsd != null)
    chips.push({ icon: <DollarSign className="h-3 w-3" />, label: `${fmtUsd(limits.budget.monthlyUsd)}/мес` });
  if (limits.tokens.monthlyTokens != null)
    chips.push({ icon: <Cpu className="h-3 w-3" />, label: `${fmtTokens(limits.tokens.monthlyTokens)} ток/мес` });

  const enabledMods = (Object.keys(limits.modalities) as Modality[]).filter(
    (k) => limits.modalities[k],
  );
  if (enabledMods.length < 3)
    chips.push({
      icon: <Cpu className="h-3 w-3" />,
      label: enabledMods.map((m) => MODALITY_LABEL[m]).join(" + ") || "Нет модальностей",
    });

  if (limits.validUntil)
    chips.push({ icon: <Clock className="h-3 w-3" />, label: `до ${limits.validUntil}` });

  return (
    <div className="border border-border/70 rounded-lg p-4 flex items-start gap-4 group hover:bg-muted/20 transition-colors">
      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
        {member.role === "owner" ? (
          <Shield className="h-5 w-5 text-primary" />
        ) : (
          <Users className="h-5 w-5 text-primary" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="text-sm font-medium text-foreground truncate">{member.username}</p>
          <Badge variant={member.role === "owner" ? "default" : "secondary"}>
            {member.role === "owner" ? "Владелец" : "Участник"}
          </Badge>
        </div>
        <p className="text-xs text-muted-foreground mt-0.5 truncate">{member.email}</p>
        <p className="text-xs text-muted-foreground mt-0.5">Добавлен {member.addedAt}</p>
        {chips.length > 0 ? (
          <div className="flex flex-wrap gap-1.5 mt-2">
            {chips.map((c, i) => (
              <span
                key={i}
                className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-md bg-muted/50 border border-border/60 text-foreground"
              >
                {c.icon}
                {c.label}
              </span>
            ))}
          </div>
        ) : member.role !== "owner" ? (
          <p className="text-[11px] text-muted-foreground mt-2 italic">Без ограничений</p>
        ) : null}
      </div>
      <div className="flex items-center gap-1 shrink-0">
        <Button variant="ghost" size="sm" onClick={onEdit}>
          <Settings2 className="h-4 w-4 mr-1" />
          Настроить
        </Button>
        {member.role !== "owner" && (
          <Button
            variant="ghost"
            size="icon"
            className="text-destructive opacity-0 group-hover:opacity-100"
            onClick={onRemove}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
};

/* ---------- Edit dialog ---------- */

interface EditDialogProps {
  member: TeamMember | null;
  onClose: () => void;
  onSave: (m: TeamMember) => void;
}

const EditMemberDialog = ({ member, onClose, onSave }: EditDialogProps) => {
  const [draft, setDraft] = useState<TeamMember | null>(null);
  const [advanced, setAdvanced] = useState(false);
  const [timeLimited, setTimeLimited] = useState(false);

  if (member && (!draft || draft.id !== member.id)) {
    setDraft(member);
    setAdvanced(
      !!(member.limits.tokens.dailyTokens || member.limits.tokens.monthlyTokens),
    );
    setTimeLimited(!!(member.limits.validFrom || member.limits.validUntil));
  }
  if (!member || !draft) return null;

  const L = draft.limits;
  const patch = (p: Partial<MemberLimits>) =>
    setDraft({ ...draft, limits: { ...L, ...p } });

  const toggleModality = (m: Modality, on: boolean) => {
    const modalities = { ...L.modalities, [m]: on };
    // also drop disallowed model ids
    const allowedModels = L.allowedModels.filter((id) => {
      const meta = AVAILABLE_MODELS.find((x) => x.id === id);
      return meta ? modalities[meta.modality] : false;
    });
    // when turning on, add all models of that modality by default
    if (on) {
      AVAILABLE_MODELS.filter((x) => x.modality === m).forEach((x) => {
        if (!allowedModels.includes(x.id)) allowedModels.push(x.id);
      });
    }
    patch({ modalities, allowedModels });
  };

  const toggleModel = (id: string, checked: boolean) => {
    patch({
      allowedModels: checked
        ? [...L.allowedModels, id]
        : L.allowedModels.filter((m) => m !== id),
    });
  };

  const monthUsed = L.usedMonthUsd ?? 0;
  const monthMax = L.budget.monthlyUsd;
  const monthPct = monthMax ? Math.min(100, (monthUsed / monthMax) * 100) : 0;

  return (
    <Dialog open={!!member} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
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
            <Select
              value={draft.role}
              onValueChange={(v) => setDraft({ ...draft, role: v as Role })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="member">Участник</SelectItem>
                <SelectItem value="owner">Владелец</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Time window */}
          <div className="space-y-2 border border-border rounded-lg p-3">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-sm text-foreground flex items-center gap-1.5">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  Ограничить срок действия
                </Label>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  Доступ только в выбранный период
                </p>
              </div>
              <Switch
                checked={timeLimited}
                onCheckedChange={(v) => {
                  setTimeLimited(v);
                  if (!v) patch({ validFrom: undefined, validUntil: undefined });
                }}
              />
            </div>
            {timeLimited && (
              <div className="grid grid-cols-2 gap-2 pt-2">
                <DateField
                  label="С"
                  value={L.validFrom}
                  onChange={(v) => patch({ validFrom: v })}
                />
                <DateField
                  label="По"
                  value={L.validUntil}
                  onChange={(v) => patch({ validUntil: v })}
                />
              </div>
            )}
          </div>

          {/* Modalities + models */}
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Разрешённые модальности и модели</Label>
            <div className="space-y-2">
              {(Object.keys(MODALITY_LABEL) as Modality[]).map((mod) => {
                const enabled = L.modalities[mod];
                const models = AVAILABLE_MODELS.filter((m) => m.modality === mod);
                return (
                  <div key={mod} className="border border-border rounded-lg p-3">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm text-foreground">{MODALITY_LABEL[mod]}</Label>
                      <Switch
                        checked={enabled}
                        onCheckedChange={(v) => toggleModality(mod, v)}
                      />
                    </div>
                    {enabled && models.length > 0 && (
                      <div className="space-y-1.5 mt-3 pl-1">
                        {models.map((mdl) => {
                          const checked = L.allowedModels.includes(mdl.id);
                          return (
                            <label
                              key={mdl.id}
                              className="flex items-center gap-2.5 cursor-pointer text-sm text-foreground"
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
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Budget */}
          <div className="space-y-2 border border-primary/30 bg-primary/5 rounded-lg p-3">
            <Label className="text-sm text-foreground flex items-center gap-1.5">
              <DollarSign className="h-4 w-4 text-primary" />
              Бюджет (USD)
            </Label>
            <p className="text-[11px] text-muted-foreground">
              Считается по тарифу из прайс-листа. Пусто = без лимита.
            </p>
            <div className="grid grid-cols-2 gap-2 pt-1">
              <UsdField
                label="В день"
                value={L.budget.dailyUsd}
                onChange={(v) => patch({ budget: { ...L.budget, dailyUsd: v } })}
              />
              <UsdField
                label="В месяц"
                value={L.budget.monthlyUsd}
                onChange={(v) => patch({ budget: { ...L.budget, monthlyUsd: v } })}
              />
            </div>
            {monthMax ? (
              <div className="pt-2 space-y-1">
                <div className="flex justify-between text-[11px] text-muted-foreground">
                  <span>Использовано в этом месяце</span>
                  <span className="text-foreground">
                    {fmtUsd(monthUsed)} из {fmtUsd(monthMax)}
                  </span>
                </div>
                <Progress value={monthPct} className="h-1.5" />
              </div>
            ) : null}
          </div>

          {/* Advanced: tokens */}
          <Collapsible open={advanced} onOpenChange={setAdvanced}>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm" className="w-full justify-start text-xs">
                {advanced ? "−" : "+"} Дополнительно: лимит токенов (только текст)
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="pt-2">
              <div className="border border-border rounded-lg p-3 grid grid-cols-2 gap-2">
                <TokenField
                  label="Токенов в день"
                  value={L.tokens.dailyTokens}
                  onChange={(v) => patch({ tokens: { ...L.tokens, dailyTokens: v } })}
                />
                <TokenField
                  label="Токенов в месяц"
                  value={L.tokens.monthlyTokens}
                  onChange={(v) => patch({ tokens: { ...L.tokens, monthlyTokens: v } })}
                />
              </div>
            </CollapsibleContent>
          </Collapsible>
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

/* ---------- Small fields ---------- */

const UsdField = ({
  label,
  value,
  onChange,
}: {
  label: string;
  value?: number;
  onChange: (v?: number) => void;
}) => (
  <div className="space-y-1">
    <Label className="text-[11px] text-muted-foreground">{label}, $</Label>
    <Input
      type="number"
      min={0}
      placeholder="∞"
      value={value ?? ""}
      onChange={(e) => {
        const v = e.target.value;
        onChange(v === "" ? undefined : Math.max(0, Number(v)));
      }}
    />
  </div>
);

const TokenField = ({
  label,
  value,
  onChange,
}: {
  label: string;
  value?: number;
  onChange: (v?: number) => void;
}) => (
  <div className="space-y-1">
    <Label className="text-[11px] text-muted-foreground">{label}</Label>
    <Input
      type="number"
      min={0}
      step={1000}
      placeholder="∞"
      value={value ?? ""}
      onChange={(e) => {
        const v = e.target.value;
        onChange(v === "" ? undefined : Math.max(0, Number(v)));
      }}
    />
  </div>
);

const DateField = ({
  label,
  value,
  onChange,
}: {
  label: string;
  value?: string;
  onChange: (v?: string) => void;
}) => {
  const date = value ? new Date(value) : undefined;
  return (
    <div className="space-y-1">
      <Label className="text-[11px] text-muted-foreground">{label}</Label>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "w-full justify-start text-left font-normal",
              !date && "text-muted-foreground",
            )}
          >
            <CalendarIcon className="h-4 w-4 mr-2" />
            {date ? format(date, "dd.MM.yyyy") : "не задано"}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={date}
            onSelect={(d) => onChange(d ? d.toISOString().slice(0, 10) : undefined)}
            initialFocus
            className={cn("p-3 pointer-events-auto")}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default TeamPage;
