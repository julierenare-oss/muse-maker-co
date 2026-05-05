import { useState } from "react";
import { Copy, Eye, EyeOff, Key, FileText, Type, Image as ImageIcon, Video, ExternalLink, Check, Plus, RefreshCw, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
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
  value: string;
  created: string; // ISO date
  expires: string; // ISO date
};

type Endpoint = {
  id: string;
  label: string;
  url: string;
  keys: ApiKey[];
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
const newKey = (): ApiKey => ({
  id: "key_" + Math.random().toString(36).slice(2, 10),
  value: generateKeyValue(),
  created: todayISO(),
  expires: inMonthsISO(TTL_MONTHS),
});

const INITIAL_SECTIONS: Section[] = [
  {
    id: "text",
    title: "Text models",
    description: "Единый эндпойнт для всех текстовых моделей.",
    icon: Type,
    endpoints: [
      {
        id: "text-unified",
        label: "MaaS_text_1",
        url: "https://api.nexagen.ai/v1/conversations/text",
        keys: [
          {
            id: "key_text_1",
            value: "nxg_sk_live_8f3a9b2c1d4e5f6a7b8c9d0e1f2a3b4c",
            created: "2026-03-01",
            expires: "2026-06-01",
          },
        ],
      },
    ],
  },
  {
    id: "image",
    title: "Image models",
    description: "Отдельный эндпойнт для каждой модели генерации изображений.",
    icon: ImageIcon,
    endpoints: [
      {
        id: "img-mj",
        label: "MaaS_image_1",
        url: "https://api.nexagen.ai/v1/conversations/image/m1",
        keys: [
          {
            id: "key_img1_1",
            value: "nxg_sk_live_2a4b6c8d0e1f3a5b7c9d1e3f5a7b9c1d",
            created: "2026-03-04",
            expires: "2026-06-04",
          },
          {
            id: "key_img1_2",
            value: "nxg_sk_live_a1b2c3d4e5f60718293a4b5c6d7e8f90",
            created: "2026-04-10",
            expires: "2026-07-10",
          },
        ],
      },
      {
        id: "img-gpt",
        label: "MaaS_image_2",
        url: "https://api.nexagen.ai/v1/conversations/image/m2",
        keys: [
          {
            id: "key_img2_1",
            value: "nxg_sk_live_9z8y7x6w5v4u3t2s1r0q9p8o7n6m5l4k",
            created: "2026-03-12",
            expires: "2026-06-12",
          },
        ],
      },
    ],
  },
  {
    id: "video",
    title: "Video models",
    description: "Отдельные эндпойнты для каждой видеомодели.",
    icon: Video,
    endpoints: [
      {
        id: "vid-sora",
        label: "MaaS_video_1",
        url: "https://api.nexagen.ai/v1/conversations/video/v1",
        keys: [
          {
            id: "key_vid1_1",
            value: "nxg_sk_live_3c5d7e9f1a3b5c7d9e1f3a5b7c9d1e3f",
            created: "2026-03-15",
            expires: "2026-06-15",
          },
        ],
      },
      {
        id: "vid-veo",
        label: "MaaS_video_2",
        url: "https://api.nexagen.ai/v1/conversations/video/v2",
        keys: [
          {
            id: "key_vid2_1",
            value: "nxg_sk_live_4d6e8f0a2b4c6d8e0f2a4b6c8d0e2f4a",
            created: "2026-03-18",
            expires: "2026-06-18",
          },
        ],
      },
      {
        id: "vid-runway",
        label: "MaaS_video_3",
        url: "https://api.nexagen.ai/v1/conversations/video/v3",
        keys: [
          {
            id: "key_vid3_1",
            value: "nxg_sk_live_5e7f9a1b3c5d7e9f1a3b5c7d9e1f3a5b",
            created: "2026-03-20",
            expires: "2026-06-20",
          },
        ],
      },
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
  const [sections, setSections] = useState<Section[]>(INITIAL_SECTIONS);
  const [shown, setShown] = useState<Record<string, boolean>>({});
  const [copied, setCopied] = useState<string | null>(null);

  const isVisible = (id: string) => !!shown[id];
  const toggleOne = (id: string) => setShown((s) => ({ ...s, [id]: !s[id] }));

  const copy = async (value: string, id: string) => {
    await navigator.clipboard.writeText(value);
    setCopied(id);
    toast.success("Скопировано в буфер обмена");
    setTimeout(() => setCopied((c) => (c === id ? null : c)), 1200);
  };

  const updateEndpoint = (sectionId: string, endpointId: string, updater: (ep: Endpoint) => Endpoint) => {
    setSections((prev) =>
      prev.map((s) =>
        s.id !== sectionId
          ? s
          : { ...s, endpoints: s.endpoints.map((e) => (e.id !== endpointId ? e : updater(e))) }
      )
    );
  };

  const addKey = (sectionId: string, endpointId: string) => {
    const k = newKey();
    updateEndpoint(sectionId, endpointId, (ep) => ({ ...ep, keys: [...ep.keys, k] }));
    setShown((s) => ({ ...s, [k.id]: true }));
    toast.success("Новый ключ создан");
  };

  const regenerateKey = (sectionId: string, endpointId: string, keyId: string) => {
    const fresh = newKey();
    updateEndpoint(sectionId, endpointId, (ep) => ({
      ...ep,
      keys: ep.keys.map((k) => (k.id === keyId ? { ...fresh, id: keyId } : k)),
    }));
    setShown((s) => ({ ...s, [keyId]: true }));
    toast.success("Ключ перегенерирован");
  };

  const deleteKey = (sectionId: string, endpointId: string, keyId: string) => {
    updateEndpoint(sectionId, endpointId, (ep) => ({ ...ep, keys: ep.keys.filter((k) => k.id !== keyId) }));
    toast.success("Ключ удалён");
  };

  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto">
      <div>
        <h1 className="text-xl font-semibold text-foreground">API Keys</h1>
        <p className="text-sm text-muted-foreground">
          Ключи к эндпойнтам. Текст, изображения, видео.
        </p>
      </div>

      <div className="bg-card border border-border rounded-xl p-4 flex items-start gap-3">
        <FileText className="h-4 w-4 text-primary mt-0.5 shrink-0" />
        <div className="text-xs text-muted-foreground leading-relaxed flex-1">
          REST API · JSON · SSE для streaming. Аутентификация через Bearer-токен.
          Срок действия ключа — {TTL_MONTHS} месяца с момента создания. Полная спецификация — в документации.
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
            Header: <span className="text-primary">Authorization: Bearer &lt;key&gt;</span> · <span className="text-primary">X-Project-ID: 1</span>
          </span>
        </div>
      </div>

      {sections.map((section) => {
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
                  className="bg-card border border-border rounded-xl p-4 space-y-4"
                >
                  <div className="flex items-center justify-between gap-3 flex-wrap">
                    <div className="flex items-center gap-2 min-w-0">
                      <Key className="h-4 w-4 text-primary shrink-0" />
                      <span className="text-sm font-medium text-foreground truncate">{ep.label}</span>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => addKey(section.id, ep.id)}
                    >
                      <Plus className="h-3.5 w-3.5 mr-1" />
                      Новый ключ
                    </Button>
                  </div>

                  <div className="grid gap-2 sm:grid-cols-[100px_1fr_auto] items-center">
                    <span className="text-[11px] uppercase tracking-wide text-muted-foreground">Endpoint</span>
                    <code className="text-xs font-mono text-foreground/90 bg-secondary rounded-md px-3 py-2 truncate">
                      {ep.url}
                    </code>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => copy(ep.url, ep.id + "-url")}
                      title="Копировать URL"
                    >
                      {copied === ep.id + "-url" ? <Check className="h-4 w-4 text-primary" /> : <Copy className="h-4 w-4" />}
                    </Button>
                  </div>

                  <div className="space-y-2">
                    {ep.keys.length === 0 && (
                      <div className="text-xs text-muted-foreground italic px-1">
                        Нет активных ключей. Создайте новый.
                      </div>
                    )}
                    {ep.keys.map((k) => {
                      const expired = isExpired(k.expires);
                      const soon = isExpiringSoon(k.expires);
                      return (
                        <div key={k.id} className="border border-border rounded-lg p-3 space-y-2 bg-background/40">
                          <div className="grid gap-2 sm:grid-cols-[1fr_auto_auto_auto] items-center">
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
                              {copied === k.id + "-key" ? <Check className="h-4 w-4 text-primary" /> : <Copy className="h-4 w-4" />}
                            </Button>
                            <div className="flex items-center gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => regenerateKey(section.id, ep.id, k.id)}
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
                                    <AlertDialogTitle>Удалить ключ?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Ключ будет немедленно отозван. Запросы с этим ключом перестанут работать.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Отмена</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => deleteKey(section.id, ep.id, k.id)}>
                                      Удалить
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          </div>
                          <div className="flex items-center gap-3 flex-wrap text-[11px] text-muted-foreground">
                            <span>Создан: <span className="text-foreground/80">{k.created}</span></span>
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
                        </div>
                      );
                    })}
                  </div>
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
