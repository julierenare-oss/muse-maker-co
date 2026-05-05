import { useState } from "react";
import {
  Copy,
  Eye,
  EyeOff,
  Key,
  FileText,
  Type,
  Image as ImageIcon,
  Video,
  ExternalLink,
  Check,
  Plus,
  RefreshCw,
  Trash2,
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
  DialogTrigger,
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
import { toast } from "sonner";

type ApiKey = {
  id: string;
  name: string;
  value: string;
  created: string;
  expires: string;
};

type Endpoint = {
  id: string;
  label: string;
  url: string;
};

type Section = {
  id: string;
  title: string;
  description: string;
  icon: typeof Type;
  endpoints: Endpoint[];
};

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
const newKey = (name: string): ApiKey => ({
  id: "key_" + Math.random().toString(36).slice(2, 10),
  name,
  value: generateKeyValue(),
  created: todayISO(),
  expires: inMonthsISO(TTL_MONTHS),
});

const INITIAL_KEYS: ApiKey[] = [
  {
    id: "key_default",
    name: "Default",
    value: "nxg_sk_live_8f3a9b2c1d4e5f6a7b8c9d0e1f2a3b4c",
    created: "2026-03-01",
    expires: "2026-06-01",
  },
  {
    id: "key_prod",
    name: "Production",
    value: "nxg_sk_live_2a4b6c8d0e1f3a5b7c9d1e3f5a7b9c1d",
    created: "2026-04-10",
    expires: "2026-07-10",
  },
];

const SECTIONS: Section[] = [
  {
    id: "text",
    title: "Text models",
    description: "Единый эндпойнт для всех текстовых моделей.",
    icon: Type,
    endpoints: [
      { id: "text-unified", label: "MaaS_text_1", url: "https://api.nexagen.ai/v1/conversations/text" },
    ],
  },
  {
    id: "image",
    title: "Image models",
    description: "Отдельный эндпойнт для каждой модели генерации изображений.",
    icon: ImageIcon,
    endpoints: [
      { id: "img-1", label: "MaaS_image_1", url: "https://api.nexagen.ai/v1/conversations/image/m1" },
      { id: "img-2", label: "MaaS_image_2", url: "https://api.nexagen.ai/v1/conversations/image/m2" },
    ],
  },
  {
    id: "video",
    title: "Video models",
    description: "Отдельные эндпойнты для каждой видеомодели.",
    icon: Video,
    endpoints: [
      { id: "vid-1", label: "MaaS_video_1", url: "https://api.nexagen.ai/v1/conversations/video/v1" },
      { id: "vid-2", label: "MaaS_video_2", url: "https://api.nexagen.ai/v1/conversations/video/v2" },
      { id: "vid-3", label: "MaaS_video_3", url: "https://api.nexagen.ai/v1/conversations/video/v3" },
    ],
  },
];

const maskKey = (key: string) => key.slice(0, 12) + "•".repeat(20);

const isExpiringSoon = (iso: string) => {
  const diff = new Date(iso).getTime() - Date.now();
  return diff > 0 && diff < 14 * 24 * 60 * 60 * 1000;
};
const isExpired = (iso: string) => new Date(iso).getTime() <= Date.now();

const ApiKeysPage = () => {
  const [keys, setKeys] = useState<ApiKey[]>(INITIAL_KEYS);
  const [shown, setShown] = useState<Record<string, boolean>>({});
  const [copied, setCopied] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [newName, setNewName] = useState("");

  const limitReached = keys.length >= MAX_KEYS;

  const isVisible = (id: string) => !!shown[id];
  const toggleOne = (id: string) => setShown((s) => ({ ...s, [id]: !s[id] }));

  const copy = async (value: string, id: string) => {
    await navigator.clipboard.writeText(value);
    setCopied(id);
    toast.success("Скопировано в буфер обмена");
    setTimeout(() => setCopied((c) => (c === id ? null : c)), 1200);
  };

  const handleCreate = () => {
    const name = newName.trim();
    if (!name) {
      toast.error("Введите имя ключа");
      return;
    }
    if (limitReached) {
      toast.error(`Достигнут лимит — максимум ${MAX_KEYS} ключей на аккаунт`);
      return;
    }
    const k = newKey(name);
    setKeys((prev) => [...prev, k]);
    setShown((s) => ({ ...s, [k.id]: true }));
    setNewName("");
    setCreateOpen(false);
    toast.success("Ключ создан");
  };

  const regenerateKey = (keyId: string) => {
    setKeys((prev) =>
      prev.map((k) =>
        k.id === keyId
          ? { ...k, value: generateKeyValue(), created: todayISO(), expires: inMonthsISO(TTL_MONTHS) }
          : k,
      ),
    );
    setShown((s) => ({ ...s, [keyId]: true }));
    toast.success("Ключ перегенерирован");
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
          Ключи аккаунта работают со всеми эндпойнтами всех модальностей.
        </p>
      </div>

      <div className="bg-card border border-border rounded-xl p-4 flex items-start gap-3">
        <FileText className="h-4 w-4 text-primary mt-0.5 shrink-0" />
        <div className="text-xs text-muted-foreground leading-relaxed flex-1">
          REST API · JSON · SSE для streaming. Аутентификация через Bearer-токен. Срок действия ключа — {TTL_MONTHS}{" "}
          месяца. До {MAX_KEYS} ключей на аккаунт. Полная спецификация — в документации.
        </div>
        <Button variant="outline" size="sm" asChild>
          <Link to="/app/docs">
            Документация
            <ExternalLink className="h-3 w-3 ml-1 opacity-60" />
          </Link>
        </Button>
      </div>

      <div className="bg-card border border-border rounded-xl p-4">
        <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground flex-wrap">
          <span className="text-foreground/70">Base URL:</span>
          <code className="bg-secondary rounded px-2 py-1">https://api.nexagen.ai/v1</code>
          <span className="ml-auto text-[11px] uppercase tracking-wide text-muted-foreground">
            Header: <span className="text-primary">Authorization: Bearer &lt;key&gt;</span> ·{" "}
            <span className="text-primary">X-Project-ID: 1</span>
          </span>
        </div>
      </div>

      {/* Keys section */}
      <section className="space-y-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
            <Key className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-foreground">Ключи аккаунта</h2>
            <p className="text-xs text-muted-foreground">
              Один ключ — доступ ко всем эндпойнтам. Лимит: {keys.length} / {MAX_KEYS}.
            </p>
          </div>
          <Dialog open={createOpen} onOpenChange={setCreateOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="ml-auto" disabled={limitReached}>
                <Plus className="h-3.5 w-3.5 mr-1" />
                Новый ключ
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Создать API ключ</DialogTitle>
                <DialogDescription>
                  Имя помогает различать ключи (например, “Production”, “CI”, “Local”).
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

        <div className="space-y-2">
          {keys.length === 0 && (
            <div className="bg-card border border-border rounded-xl p-6 text-sm text-muted-foreground text-center">
              Нет активных ключей. Создайте первый, чтобы начать работу с API.
            </div>
          )}
          {keys.map((k) => {
            const expired = isExpired(k.expires);
            const soon = isExpiringSoon(k.expires);
            return (
              <div key={k.id} className="bg-card border border-border rounded-xl p-4 space-y-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <Key className="h-4 w-4 text-primary shrink-0" />
                  <span className="text-sm font-medium text-foreground">{k.name}</span>
                  {expired && (
                    <span className="text-[10px] uppercase tracking-wide text-destructive border border-destructive/40 rounded px-1.5 py-0.5">
                      Просрочен
                    </span>
                  )}
                  {!expired && soon && (
                    <span className="text-[10px] uppercase tracking-wide text-yellow-500 border border-yellow-500/40 rounded px-1.5 py-0.5">
                      Скоро истечёт
                    </span>
                  )}
                </div>

                <div className="grid gap-2 sm:grid-cols-[1fr_auto_auto_auto_auto] items-center">
                  <code className="text-xs font-mono text-foreground/90 bg-secondary rounded-md px-3 py-2 truncate">
                    {isVisible(k.id) ? k.value : maskKey(k.value)}
                  </code>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => toggleOne(k.id)}
                    title={isVisible(k.id) ? "Скрыть" : "Показать"}
                  >
                    {isVisible(k.id) ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => copy(k.value, k.id + "-key")}
                    title="Копировать"
                  >
                    {copied === k.id + "-key" ? (
                      <Check className="h-4 w-4 text-primary" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
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
                          Ключ будет немедленно отозван. Запросы с этим ключом перестанут работать.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Отмена</AlertDialogCancel>
                        <AlertDialogAction onClick={() => deleteKey(k.id)}>Удалить</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>

                <div className="flex items-center gap-3 flex-wrap text-[11px] text-muted-foreground">
                  <span>
                    Создан: <span className="text-foreground/80">{k.created}</span>
                  </span>
                  <span className="opacity-40">·</span>
                  <span>
                    Истекает:{" "}
                    <span
                      className={
                        expired
                          ? "text-destructive font-medium"
                          : soon
                            ? "text-yellow-500 font-medium"
                            : "text-foreground/80"
                      }
                    >
                      {k.expires}
                    </span>
                  </span>
                </div>
              </div>
            );
          })}
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
              <div>
                <h2 className="text-base font-semibold text-foreground">{section.title}</h2>
                <p className="text-xs text-muted-foreground">{section.description}</p>
              </div>
              <span className="ml-auto text-xs text-muted-foreground">
                {section.endpoints.length} {section.endpoints.length === 1 ? "endpoint" : "endpoints"}
              </span>
            </div>

            <div className="space-y-2">
              {section.endpoints.map((ep) => (
                <div
                  key={ep.id}
                  className="bg-card border border-border rounded-xl p-4 grid gap-2 sm:grid-cols-[140px_1fr_auto] items-center"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-sm font-medium text-foreground truncate">{ep.label}</span>
                  </div>
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
    </div>
  );
};

export default ApiKeysPage;
