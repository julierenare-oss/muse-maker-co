import { useState } from "react";
import { Copy, Eye, EyeOff, Key, FileText, Type, Image as ImageIcon, Video, ExternalLink, Check } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

type Endpoint = {
  id: string;
  label: string;
  url: string;
  apiKey: string;
  created: string;
};

type Section = {
  id: string;
  title: string;
  description: string;
  icon: typeof Type;
  endpoints: Endpoint[];
};

const SECTIONS: Section[] = [
  {
    id: "text",
    title: "Text models",
    description: "Единый эндпойнт для всех текстовых моделей (Claude, GPT, Llama и др.).",
    icon: Type,
    endpoints: [
      {
        id: "text-unified",
        label: "Unified Text Endpoint",
        url: "https://api.nexagen.ai/v1/conversations/text",
        apiKey: "nxg_text_sk_8f3a9b2c1d4e5f6a7b8c9d0e1f2a3b4c",
        created: "2026-03-01",
      },
    ],
  },
  {
    id: "image",
    title: "Image models",
    description: "Отдельный эндпойнт и ключ для каждой провайдерской модели генерации изображений.",
    icon: ImageIcon,
    endpoints: [
      {
        id: "img-mj",
        label: "MaaS-MJ (Midjourney)",
        url: "https://api.nexagen.ai/v1/conversations/image/midjourney",
        apiKey: "nxg_img_mj_sk_2a4b6c8d0e1f3a5b7c9d1e3f5a7b9c1d",
        created: "2026-03-04",
      },
      {
        id: "img-gpt",
        label: "MaaS_image_1 (ChatGPT Image)",
        url: "https://api.nexagen.ai/v1/conversations/image/gpt-image",
        apiKey: "nxg_img_gpt_sk_9z8y7x6w5v4u3t2s1r0q9p8o7n6m5l4k",
        created: "2026-03-12",
      },
    ],
  },
  {
    id: "video",
    title: "Video models",
    description: "Отдельные эндпойнты и ключи для каждой видеомодели.",
    icon: Video,
    endpoints: [
      {
        id: "vid-sora",
        label: "MaaS_video_sora",
        url: "https://api.nexagen.ai/v1/conversations/video/sora",
        apiKey: "nxg_vid_sora_sk_3c5d7e9f1a3b5c7d9e1f3a5b7c9d1e3f",
        created: "2026-03-15",
      },
      {
        id: "vid-veo",
        label: "MaaS_video_veo",
        url: "https://api.nexagen.ai/v1/conversations/video/veo",
        apiKey: "nxg_vid_veo_sk_4d6e8f0a2b4c6d8e0f2a4b6c8d0e2f4a",
        created: "2026-03-18",
      },
      {
        id: "vid-runway",
        label: "MaaS_video_runway",
        url: "https://api.nexagen.ai/v1/conversations/video/runway",
        apiKey: "nxg_vid_rw_sk_5e7f9a1b3c5d7e9f1a3b5c7d9e1f3a5b",
        created: "2026-03-20",
      },
    ],
  },
];

const UNIFIED_API_KEY = "nxg_sk_live_8f3a9b2c1d4e5f6a7b8c9d0e1f2a3b4c";
const UNIFIED_KEY_CREATED = "2026-03-01";

const maskKey = (key: string) => key.slice(0, 12) + "•".repeat(20);

const ApiKeysPage = () => {
  const [showAll, setShowAll] = useState(false);
  const [shown, setShown] = useState<Record<string, boolean>>({});
  const [copied, setCopied] = useState<string | null>(null);

  const isVisible = (id: string) => showAll || !!shown[id];
  const toggleOne = (id: string) => setShown((s) => ({ ...s, [id]: !s[id] }));

  const copy = async (value: string, id: string) => {
    await navigator.clipboard.writeText(value);
    setCopied(id);
    toast.success("Скопировано в буфер обмена");
    setTimeout(() => setCopied((c) => (c === id ? null : c)), 1200);
  };

  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-xl font-semibold text-foreground">API Keys</h1>
          <p className="text-sm text-muted-foreground">
            Эндпойнты и ключи для прямой интеграции с MaaS API.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link to="/app/docs">
              <FileText className="h-4 w-4 mr-1" />
              Документация
              <ExternalLink className="h-3 w-3 ml-1 opacity-60" />
            </Link>
          </Button>
          <Button variant="glass" size="sm" onClick={() => setShowAll((v) => !v)}>
            {showAll ? <EyeOff className="h-4 w-4 mr-1" /> : <Eye className="h-4 w-4 mr-1" />}
            {showAll ? "Скрыть все ключи" : "Показать все ключи"}
          </Button>
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl p-4 space-y-3">
        <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground flex-wrap">
          <span className="text-foreground/70">Base URL:</span>
          <code className="bg-secondary rounded px-2 py-1">https://api.nexagen.ai/v1</code>
          <span className="ml-auto text-[11px] uppercase tracking-wide text-muted-foreground">
            Header: <span className="text-primary">Authorization: Bearer &lt;key&gt;</span> · <span className="text-primary">X-Project-ID: 1</span>
          </span>
        </div>

        <div className="border-t border-border pt-3">
          <div className="flex items-center justify-between gap-3 flex-wrap mb-2">
            <div className="flex items-center gap-2">
              <Key className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-foreground">Unified API Key</span>
              <span className="text-[11px] text-muted-foreground">— используется для всех эндпойнтов</span>
            </div>
            <span className="text-[11px] text-muted-foreground">Создан: {UNIFIED_KEY_CREATED}</span>
          </div>
          <div className="grid gap-2 sm:grid-cols-[100px_1fr_auto_auto] items-center">
            <span className="text-[11px] uppercase tracking-wide text-muted-foreground">API Key</span>
            <code className="text-xs font-mono text-foreground/90 bg-secondary rounded-md px-3 py-2 truncate">
              {isVisible("unified") ? UNIFIED_API_KEY : maskKey(UNIFIED_API_KEY)}
            </code>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => toggleOne("unified")}
              title={isVisible("unified") ? "Скрыть ключ" : "Показать ключ"}
            >
              {isVisible("unified") ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => copy(UNIFIED_API_KEY, "unified-key")}
              title="Копировать ключ"
            >
              {copied === "unified-key" ? <Check className="h-4 w-4 text-primary" /> : <Copy className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </div>

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
                  className="bg-card border border-border rounded-xl p-4 space-y-3"
                >
                  <div className="flex items-center justify-between gap-3 flex-wrap">
                    <div className="flex items-center gap-2 min-w-0">
                      <Key className="h-4 w-4 text-primary shrink-0" />
                      <span className="text-sm font-medium text-foreground truncate">{ep.label}</span>
                    </div>
                    <span className="text-[11px] text-muted-foreground">
                      Создан: {ep.created}
                    </span>
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
