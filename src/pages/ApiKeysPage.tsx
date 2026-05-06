import { useState } from "react";
import {
  Copy,
  Key,
  Type,
  Image as ImageIcon,
  Video,
  ExternalLink,
  Check,
  Plus,
  RefreshCw,
  Trash2,
  AlertTriangle,
} from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";

type ApiKey = {
  id: string;
  name: string;
  masked: string; // stored masked: first 4 + ... + last 4
  created: string;
  expires: string;
};

type Endpoint = { id: string; label: string; url: string };
type Section = { id: string; title: string; icon: typeof Type; endpoints: Endpoint[] };

const KEY_PREFIX = "nxg_sk_live_";
const TTL_MONTHS = 3;
const MAX_KEYS = 10;

const todayISO = () => new Date().toISOString().slice(0, 10);
const inMonthsISO = (months: number) => {
  const d = new Date();
  d.setMonth(d.getMonth() + months);
  return d.toISOString().slice(0, 10);
};
const generateKeyValue = () => {
  const chars = "abcdef0123456789";
  let s = "";
  for (let i = 0; i < 32; i++) s += chars[Math.floor(Math.random() * chars.length)];
  return KEY_PREFIX + s;
};
const maskValue = (value: string) =>
  value.length <= 8 ? value : `${value.slice(0, 4)}${"•".repeat(20)}${value.slice(-4)}`;

const INITIAL_KEYS: ApiKey[] = [
  {
    id: "key_default",
    name: "Default",
    masked: maskValue("nxg_sk_live_8f3a9b2c1d4e5f6a7b8c9d0e1f2a3b4c"),
    created: "2026-03-01",
    expires: "2026-06-01",
  },
  {
    id: "key_prod",
    name: "Production",
    masked: maskValue("nxg_sk_live_2a4b6c8d0e1f3a5b7c9d1e3f5a7b9c1d"),
    created: "2026-04-10",
    expires: "2026-07-10",
  },
];

const SECTIONS: Section[] = [
  {
    id: "text",
    title: "Text models",
    icon: Type,
    endpoints: [
      { id: "text-unified", label: "MaaS_text_1", url: "https://api.nexagen.ai/v1/conversations/text" },
    ],
  },
  {
    id: "image",
    title: "Image models",
    icon: ImageIcon,
    endpoints: [
      { id: "img-1", label: "MaaS_image_1", url: "https://api.nexagen.ai/v1/conversations/image/m1" },
      { id: "img-2", label: "MaaS_image_2", url: "https://api.nexagen.ai/v1/conversations/image/m2" },
    ],
  },
  {
    id: "video",
    title: "Video models",
    icon: Video,
    endpoints: [
      { id: "vid-1", label: "MaaS_video_1", url: "https://api.nexagen.ai/v1/conversations/video/v1" },
      { id: "vid-2", label: "MaaS_video_2", url: "https://api.nexagen.ai/v1/conversations/video/v2" },
      { id: "vid-3", label: "MaaS_video_3", url: "https://api.nexagen.ai/v1/conversations/video/v3" },
    ],
  },
];

const isExpiringSoon = (iso: string) => {
  const diff = new Date(iso).getTime() - Date.now();
  return diff > 0 && diff < 14 * 24 * 60 * 60 * 1000;
};
const isExpired = (iso: string) => new Date(iso).getTime() <= Date.now();

const ApiKeysPage = () => {
  const [keys, setKeys] = useState<ApiKey[]>(INITIAL_KEYS);
  const [copied, setCopied] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [newName, setNewName] = useState("");
  // One-time reveal after creation/regeneration
  const [reveal, setReveal] = useState<{ name: string; value: string } | null>(null);

  const limitReached = keys.length >= MAX_KEYS;

  const copy = async (value: string, id: string) => {
    await navigator.clipboard.writeText(value);
    setCopied(id);
    toast.success("Скопировано");
    setTimeout(() => setCopied((c) => (c === id ? null : c)), 1200);
  };

  const handleCreate = () => {
    const name = newName.trim();
    if (!name) return toast.error("Введите имя ключа");
    if (limitReached) return toast.error(`Максимум ${MAX_KEYS} ключей на аккаунт`);
    const value = generateKeyValue();
    const k: ApiKey = {
      id: "key_" + Math.random().toString(36).slice(2, 10),
      name,
      masked: maskValue(value),
      created: todayISO(),
      expires: inMonthsISO(TTL_MONTHS),
    };
    setKeys((prev) => [...prev, k]);
    setNewName("");
    setCreateOpen(false);
    setReveal({ name, value });
  };

  const regenerateKey = (keyId: string) => {
    const target = keys.find((k) => k.id === keyId);
    if (!target) return;
    const value = generateKeyValue();
    setKeys((prev) =>
      prev.map((k) =>
        k.id === keyId
          ? { ...k, masked: maskValue(value), created: todayISO(), expires: inMonthsISO(TTL_MONTHS) }
          : k,
      ),
    );
    setReveal({ name: target.name, value });
  };

  const deleteKey = (keyId: string) => {
    setKeys((prev) => prev.filter((k) => k.id !== keyId));
    toast.success("Ключ удалён");
  };

  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto">
      <div>
        <h1 className="text-xl font-semibold text-foreground">API Keys</h1>
        <p className="text-sm text-muted-foreground">
          Один ключ — доступ ко всем эндпойнтам всех модальностей.
        </p>
      </div>

      {/* Docs / quickstart */}
      <div className="bg-card border border-border rounded-xl p-4 space-y-3">
        <div className="flex items-start gap-3">
          <div className="text-xs text-muted-foreground leading-relaxed flex-1 space-y-1">
            <div>
              <span className="text-foreground/80">Auth:</span>{" "}
              <code className="bg-secondary rounded px-1.5 py-0.5 font-mono">
                Authorization: Bearer &lt;key&gt;
              </code>{" "}
              ·{" "}
              <code className="bg-secondary rounded px-1.5 py-0.5 font-mono">X-Project-ID: 1</code>
            </div>
            <div>
              <span className="text-foreground/80">Base URL:</span>{" "}
              <code className="bg-secondary rounded px-1.5 py-0.5 font-mono">
                https://api.nexagen.ai/v1
              </code>
            </div>
            <div>
              REST · JSON · SSE для streaming. TTL ключа — {TTL_MONTHS} мес. Лимит — {MAX_KEYS}{" "}
              ключей на аккаунт.
            </div>
          </div>
          <Button variant="outline" size="sm" asChild>
            <Link to="/app/docs">
              Документация
              <ExternalLink className="h-3 w-3 ml-1 opacity-60" />
            </Link>
          </Button>
        </div>
      </div>

      {/* Keys table */}
      <section className="space-y-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
            <Key className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-foreground">Ключи аккаунта</h2>
            <p className="text-xs text-muted-foreground">
              Лимит: {keys.length} / {MAX_KEYS}.
            </p>
          </div>
          <Dialog open={createOpen} onOpenChange={setCreateOpen}>
            <Button
              size="sm"
              className="ml-auto"
              disabled={limitReached}
              onClick={() => setCreateOpen(true)}
            >
              <Plus className="h-3.5 w-3.5 mr-1" />
              Новый ключ
            </Button>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Создать API ключ</DialogTitle>
                <DialogDescription>
                  Имя поможет различать ключи (например, «Production», «CI», «Local»).
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-2">
                <Label htmlFor="key-name">Имя ключа</Label>
                <Input
                  id="key-name"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Production"
                  maxLength={40}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleCreate();
                  }}
                />
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setCreateOpen(false)}>
                  Отмена
                </Button>
                <Button onClick={handleCreate}>Создать</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[200px]">Имя</TableHead>
                <TableHead>Ключ</TableHead>
                <TableHead className="w-[120px]">Создан</TableHead>
                <TableHead className="w-[160px]">Истекает</TableHead>
                <TableHead className="w-[120px] text-right">Действия</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {keys.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-sm text-muted-foreground py-8">
                    Нет активных ключей. Создайте первый, чтобы начать работу с API.
                  </TableCell>
                </TableRow>
              )}
              {keys.map((k) => {
                const expired = isExpired(k.expires);
                const soon = isExpiringSoon(k.expires);
                return (
                  <TableRow key={k.id}>
                    <TableCell className="font-medium text-foreground">{k.name}</TableCell>
                    <TableCell>
                      <code className="text-xs font-mono text-foreground/90 bg-secondary rounded px-2 py-1">
                        {k.masked}
                      </code>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">{k.created}</TableCell>
                    <TableCell>
                      <span
                        className={
                          "text-xs " +
                          (expired
                            ? "text-destructive font-medium"
                            : soon
                              ? "text-yellow-500 font-medium"
                              : "text-muted-foreground")
                        }
                      >
                        {k.expires}
                        {expired && " · просрочен"}
                        {!expired && soon && " · скоро"}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => regenerateKey(k.id)}
                          title="Перегенерировать"
                        >
                          <RefreshCw className="h-4 w-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              title="Удалить"
                              className="text-destructive hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Удалить ключ «{k.name}»?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Ключ будет немедленно отозван. Запросы перестанут работать.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Отмена</AlertDialogCancel>
                              <AlertDialogAction onClick={() => deleteKey(k.id)}>
                                Удалить
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </section>

      {/* Endpoints sections */}
      {SECTIONS.map((section) => {
        const Icon = section.icon;
        return (
          <section key={section.id} className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                <Icon className="h-5 w-5 text-primary" />
              </div>
              <h2 className="text-base font-semibold text-foreground">{section.title}</h2>
              <span className="ml-auto text-xs text-muted-foreground">
                {section.endpoints.length}{" "}
                {section.endpoints.length === 1 ? "endpoint" : "endpoints"}
              </span>
            </div>

            <div className="space-y-2">
              {section.endpoints.map((ep) => (
                <div
                  key={ep.id}
                  className="bg-card border border-border rounded-xl p-3 grid gap-2 sm:grid-cols-[140px_1fr_auto] items-center"
                >
                  <span className="text-sm font-medium text-foreground truncate">{ep.label}</span>
                  <code className="text-xs font-mono text-foreground/90 bg-secondary rounded-md px-3 py-2 truncate">
                    {ep.url}
                  </code>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => copy(ep.url, ep.id + "-url")}
                    title="Копировать URL"
                  >
                    {copied === ep.id + "-url" ? (
                      <Check className="h-4 w-4 text-primary" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              ))}
            </div>
          </section>
        );
      })}

      {/* One-time reveal dialog */}
      <Dialog open={!!reveal} onOpenChange={(o) => !o && setReveal(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Сохраните ключ</DialogTitle>
            <DialogDescription>
              Это единственный раз, когда вы видите ключ полностью. После закрытия окна он будет
              храниться только в зашифрованном виде.
            </DialogDescription>
          </DialogHeader>
          {reveal && (
            <div className="space-y-3">
              <div className="text-xs text-muted-foreground">
                Имя: <span className="text-foreground/90 font-medium">{reveal.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <code className="text-xs font-mono text-foreground/90 bg-secondary rounded-md px-3 py-2 flex-1 break-all">
                  {reveal.value}
                </code>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copy(reveal.value, "reveal-" + reveal.value)}
                >
                  {copied === "reveal-" + reveal.value ? (
                    <>
                      <Check className="h-4 w-4 mr-1 text-primary" /> Скопировано
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4 mr-1" /> Копировать
                    </>
                  )}
                </Button>
              </div>
              <div className="flex items-start gap-2 text-xs text-yellow-500/90 bg-yellow-500/10 border border-yellow-500/20 rounded px-3 py-2">
                <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
                <span>
                  Не передавайте ключ публично и не храните его в клиентском коде. При утечке
                  немедленно перегенерируйте.
                </span>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setReveal(null)}>Готово</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ApiKeysPage;
