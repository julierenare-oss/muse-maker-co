import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeft,
  Folder,
  History as HistoryIcon,
  Loader2,
  MessageSquare,
  Image as ImageIcon,
  Video,
  Plus,
  Search,
  Trash2,
  ArrowRight,
  Paperclip,
  Sparkles,
  MoreVertical,
  Send,
  Square,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import FilesPanel from "@/components/FilesPanel";
import ChatBubble from "@/components/ChatBubble";
import ModalitySelector from "@/components/ModalitySelector";
import {
  sendTextMessage,
  sendImageMessage,
  sendVideoMessage,
  uploadFile,
  fetchModels,
  type ConversationItem,
} from "@/lib/api";
import type { ChatMessage, ChatModality } from "@/lib/chatStore";
import { saveLocalMessages } from "@/lib/localMessages";
import { toast } from "sonner";

const typeIcons: Record<string, typeof MessageSquare> = {
  text: MessageSquare,
  image: ImageIcon,
  video: Video,
};
const typeLabels: Record<string, string> = {
  text: "Текст",
  image: "Изображение",
  video: "Видео",
};

interface Props {
  title: string;
  createdAt?: string;
  isUnassigned: boolean;
  conversations: ConversationItem[];
  loadMessages: (uuid: string) => Promise<ChatMessage[]>;
  onBack: () => void;
  onOpenConversation: (conv: ConversationItem) => void;
  onNewChat: (prompt: string) => void;
  /** Create a conversation inside this project and return it (used by inline composer). */
  onCreateConversation?: (title: string, type: ChatModality) => ConversationItem;
  onDeleteProject?: () => void;
  onDeleteConversation?: (conv: ConversationItem) => void;
  openingId?: string | null;
}

const Panel = ({
  title,
  action,
  className,
  children,
}: {
  title: string;
  action?: React.ReactNode;
  className?: string;
  children: React.ReactNode;
}) => (
  <section className={cn("bg-card border border-border rounded-2xl p-4 flex flex-col gap-3", className)}>
    <div className="flex items-center justify-between gap-2">
      <h3 className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">{title}</h3>
      {action}
    </div>
    {children}
  </section>
);

const ProjectWorkspace = ({
  title,
  createdAt,
  isUnassigned,
  conversations,
  loadMessages,
  onBack,
  onOpenConversation,
  onNewChat,
  onCreateConversation,
  onDeleteProject,
  onDeleteConversation,
  openingId,
}: Props) => {
  const [search, setSearch] = useState("");
  const [activeId, setActiveId] = useState<string | null>(conversations[0]?.uuid ?? null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [allMessages, setAllMessages] = useState<ChatMessage[]>([]);
  const [prompt, setPrompt] = useState("");
  const [modality, setModality] = useState<ChatModality>("text");
  const [isGenerating, setIsGenerating] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [uploadedUrls, setUploadedUrls] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [models, setModels] = useState<Record<string, string[]>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const endRef = useRef<HTMLDivElement>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const q = search.trim().toLowerCase();
  const items = useMemo(
    () =>
      q
        ? conversations.filter(
            (c) =>
              (c.title || "").toLowerCase().includes(q) ||
              (c.uuid || "").toLowerCase().includes(q) ||
              (c.type || "").toLowerCase().includes(q)
          )
        : conversations,
    [conversations, q]
  );

  useEffect(() => {
    fetchModels()
      .then((m) => setModels(m as any))
      .catch(() => setModels({}));
  }, []);

  useEffect(() => {
    if (!conversations.some((c) => c.uuid === activeId)) {
      setActiveId(conversations[0]?.uuid ?? null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversations]);

  useEffect(() => {
    let cancelled = false;
    Promise.all(conversations.map((c) => loadMessages(c.uuid).catch(() => [])))
      .then((all) => !cancelled && setAllMessages(all.flat()));
    return () => {
      cancelled = true;
    };
  }, [conversations, loadMessages, refreshKey]);

  useEffect(() => {
    if (!activeId) {
      setMessages([]);
      return;
    }
    let cancelled = false;
    setPreviewLoading(true);
    loadMessages(activeId)
      .then((m) => !cancelled && setMessages(m))
      .catch(() => !cancelled && setMessages([]))
      .finally(() => !cancelled && setPreviewLoading(false));
    return () => {
      cancelled = true;
    };
  }, [activeId, loadMessages]);

  const activeConv = conversations.find((c) => c.uuid === activeId);

  useEffect(() => {
    if (activeConv?.type) setModality(activeConv.type);
  }, [activeConv?.uuid, activeConv?.type]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const persist = useCallback((uuid: string, msgs: ChatMessage[]) => {
    saveLocalMessages(uuid, msgs);
    setAllMessages((prev) => prev);
    setRefreshKey((k) => k + 1);
  }, []);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const newFiles = Array.from(e.target.files);
    setFiles((prev) => [...prev, ...newFiles]);
    setUploading(true);
    try {
      for (const file of newFiles) {
        const result = await uploadFile(file);
        setUploadedUrls((prev) => [...prev, result.url]);
      }
    } catch {
      toast.error("Не удалось загрузить файл");
    } finally {
      setUploading(false);
    }
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
    setUploadedUrls((prev) => prev.filter((_, i) => i !== index));
  };

  const submitPrompt = () => {
    const text = prompt.trim();
    if (!text || isGenerating) return;

    let convId = activeId;
    if (!convId) {
      if (!onCreateConversation) {
        onNewChat(text);
        return;
      }
      const created = onCreateConversation(text.slice(0, 48), modality);
      convId = created.uuid;
      setActiveId(created.uuid);
    }

    const attachments = [...uploadedUrls];
    const base: ChatMessage[] = [
      ...messages,
      { role: "user", content: text, ...(attachments.length ? { attachments } : {}) },
      { role: "assistant", content: "" },
    ];
    setMessages(base);
    setPrompt("");
    setFiles([]);
    setUploadedUrls([]);
    setIsGenerating(true);
    setStatus(null);

    const controller = new AbortController();
    abortRef.current = controller;
    const model = models[modality]?.[0] || "";

    const finish = (final: ChatMessage) => {
      const next = [...base.slice(0, -1), final];
      setMessages(next);
      persist(convId!, next);
      setIsGenerating(false);
      setStatus(null);
      abortRef.current = null;
    };

    const onError = () =>
      finish({ role: "assistant", content: "❌ Не удалось получить ответ. Попробуйте ещё раз." });

    if (modality === "text") {
      let acc = "";
      sendTextMessage(
        text,
        model,
        convId,
        {
          onToken: (token) => {
            acc += token;
            setMessages([...base.slice(0, -1), { role: "assistant", content: acc }]);
          },
          onDone: (atts) =>
            finish({ role: "assistant", content: acc, ...(atts?.length ? { attachments: atts } : {}) }),
        },
        controller.signal,
        attachments
      ).catch(onError);
    } else if (modality === "image") {
      sendImageMessage(
        text,
        model,
        convId,
        {
          onToken: () => {},
          onStatus: setStatus,
          onDone: (atts) =>
            finish({ role: "assistant", content: "", ...(atts?.length ? { attachments: atts } : {}) }),
        },
        controller.signal
      ).catch(onError);
    } else {
      sendVideoMessage(
        text,
        model,
        convId,
        {
          onToken: () => {},
          onStatus: setStatus,
          onDone: (atts) =>
            finish({ role: "assistant", content: "", ...(atts?.length ? { attachments: atts } : {}) }),
        },
        controller.signal
      ).catch(onError);
    }
  };

  const handleStop = () => {
    abortRef.current?.abort();
    setIsGenerating(false);
    setStatus(null);
    if (activeId) persist(activeId, messages);
  };

  return (
    <div className="p-6 flex flex-col gap-5 h-full">
      {/* Header */}
      <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={onBack}>
            <ArrowLeft className="h-4 w-4" />
            Назад
          </Button>
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center shrink-0">
            {isUnassigned ? (
              <HistoryIcon className="h-5 w-5 text-background" />
            ) : (
              <Folder className="h-5 w-5 text-background" />
            )}
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">{title}</h1>
            <p className="text-sm text-muted-foreground">
              {createdAt ? `Создан ${new Date(createdAt).toLocaleDateString()} • ` : ""}
              {conversations.length} {conversations.length === 1 ? "диалог" : "диалогов"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative w-full sm:w-56">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              placeholder="Поиск по диалогам…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-8 pl-8 text-xs"
            />
          </div>
          <Button
            variant="glow"
            size="sm"
            onClick={() => {
              setActiveId(null);
              setMessages([]);
              setPrompt("");
            }}
          >
            <Plus className="h-4 w-4" />
            Новый диалог
          </Button>
          {!isUnassigned && onDeleteProject && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onDeleteProject}
              className="text-destructive hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      </header>

      {/* Bento grid */}
      <main className="grid grid-cols-1 lg:grid-cols-12 gap-5 flex-1 min-h-0">
        {/* Left: references + dialogs */}
        <div className="lg:col-span-3 flex flex-col gap-5 min-h-0">
          <Panel title="База знаний / референсы" className="max-h-[38%] overflow-hidden">
            <div className="overflow-y-auto pr-1">
              <FilesPanel
                messages={allMessages}
                sourceFilter="user"
                dense
                emptyHint="Референсы появятся, когда вы прикрепите файлы в диалогах проекта."
              />
            </div>
          </Panel>

          <Panel title="Диалоги" className="flex-1 min-h-0">
            <nav className="space-y-1 overflow-y-auto pr-1">
              {items.length === 0 && (
                <p className="text-xs text-muted-foreground py-4 text-center">Ничего не найдено</p>
              )}
              {items.map((c) => {
                const Icon = typeIcons[c.type] || MessageSquare;
                const active = c.uuid === activeId;
                return (
                  <div
                    key={c.uuid}
                    className={cn(
                      "group flex items-center gap-2 rounded-xl border px-2 transition-colors",
                      active
                        ? "bg-primary/10 border-primary/25"
                        : "border-transparent hover:bg-secondary/60"
                    )}
                  >
                    <button
                      onClick={() => setActiveId(c.uuid)}
                      onDoubleClick={() => onOpenConversation(c)}
                      className="flex items-center gap-2 flex-1 min-w-0 py-2.5 text-left"
                    >
                      <Icon className={cn("h-4 w-4 shrink-0", active ? "text-primary" : "text-muted-foreground")} />
                      <span className={cn("text-sm truncate", active ? "text-primary" : "text-muted-foreground")}>
                        {c.title}
                      </span>
                    </button>
                    {onDeleteConversation && (
                      <button
                        onClick={() => onDeleteConversation(c)}
                        className="p-1 rounded opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-opacity"
                        title="Удалить диалог"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                );
              })}
            </nav>
          </Panel>
        </div>

        {/* Center: chat + prompt */}
        <div className="lg:col-span-6 flex flex-col min-h-0">
          <div className="bg-card border border-border rounded-2xl flex-1 flex flex-col overflow-hidden min-h-[420px]">
            <div className="p-4 border-b border-border flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 min-w-0">
                <span className="w-2 h-2 rounded-full bg-primary animate-pulse shrink-0" />
                <span className="text-sm font-medium text-foreground truncate">
                  {activeConv ? activeConv.title : "Новый диалог"}
                </span>
                {activeConv && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-secondary text-muted-foreground shrink-0">
                    {typeLabels[activeConv.type] || "Текст"}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                {!activeConv && <ModalitySelector value={modality} onChange={setModality} />}
                {activeConv && (
                  <Button variant="ghost" size="sm" onClick={() => onOpenConversation(activeConv)}>
                    {openingId === activeConv.uuid ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <ArrowRight className="h-4 w-4" />
                    )}
                    Открыть
                  </Button>
                )}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-5">
              {previewLoading ? (
                <div className="flex items-center justify-center py-10">
                  <Loader2 className="h-5 w-5 animate-spin text-primary" />
                </div>
              ) : messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center gap-2 text-muted-foreground">
                  <Sparkles className="h-6 w-6 text-primary" />
                  <p className="text-sm">Напишите промпт — ответ появится прямо здесь</p>
                </div>
              ) : (
                messages.map((m, i) => (
                  <ChatBubble
                    key={i}
                    message={m}
                    isLast={i === messages.length - 1}
                    isGenerating={isGenerating}
                  />
                ))
              )}
              {isGenerating && status && (
                <div className="flex items-center gap-3">
                  <Loader2 className="h-4 w-4 text-primary animate-spin" />
                  <span className="text-xs text-muted-foreground">{status}</span>
                </div>
              )}
              <div ref={endRef} />
            </div>

            <div className="p-4 border-t border-border bg-background/40">
              {files.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-2">
                  {files.map((file, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-secondary text-xs text-secondary-foreground"
                    >
                      {file.name}
                      {uploading && i >= uploadedUrls.length && <Loader2 className="h-3 w-3 animate-spin" />}
                      <button onClick={() => removeFile(i)} className="hover:text-destructive">
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
              <div className="rounded-xl border border-border bg-card focus-within:border-primary transition-colors p-3">
                <Textarea
                  rows={2}
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value.slice(0, 2000))}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      submitPrompt();
                    }
                  }}
                  placeholder={
                    activeConv
                      ? "Продолжите диалог…"
                      : "Опишите задачу — диалог создастся внутри проекта…"
                  }
                  className="min-h-[52px] resize-none border-0 bg-transparent p-0 text-sm focus-visible:ring-0"
                />
                <div className="flex items-center justify-between mt-2">
                  <div className="flex items-center gap-2">
                    <input
                      ref={fileInputRef}
                      type="file"
                      multiple
                      className="hidden"
                      onChange={handleFileChange}
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploading}
                      title="Прикрепить референсы"
                    >
                      {uploading ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Paperclip className="h-3.5 w-3.5" />
                      )}
                    </Button>
                    <span className="text-[11px] text-muted-foreground">{prompt.length}/2000</span>
                  </div>
                  {isGenerating ? (
                    <Button variant="destructive" size="icon" onClick={handleStop} title="Остановить">
                      <Square className="h-4 w-4" />
                    </Button>
                  ) : (
                    <Button variant="glow" size="icon" onClick={submitPrompt} disabled={!prompt.trim()}>
                      <Send className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right: results */}
        <div className="lg:col-span-3 flex flex-col gap-5 min-h-0">
          <Panel title="Результаты" className="flex-1 min-h-0">
            <div className="overflow-y-auto pr-1">
              <FilesPanel
                messages={allMessages}
                sourceFilter="assistant"
                dense
                emptyHint="Сгенерированные изображения, видео и файлы появятся здесь."
              />
            </div>
          </Panel>

          <div className="bg-accent/10 border border-accent/20 rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <MoreVertical className="h-3.5 w-3.5 text-accent" />
              <span className="text-xs font-semibold text-accent">Активность проекта</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-foreground font-semibold">{allMessages.length} сообщений</span>
              <span className="text-xs text-muted-foreground">
                {conversations.length} {conversations.length === 1 ? "диалог" : "диалогов"}
              </span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ProjectWorkspace;
