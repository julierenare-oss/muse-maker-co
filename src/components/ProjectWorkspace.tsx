import { useEffect, useMemo, useState } from "react";
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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import FilesPanel from "@/components/FilesPanel";
import ChatBubble from "@/components/ChatBubble";
import type { ConversationItem } from "@/lib/api";
import type { ChatMessage } from "@/lib/chatStore";

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
  onDeleteProject,
  onDeleteConversation,
  openingId,
}: Props) => {
  const [search, setSearch] = useState("");
  const [activeId, setActiveId] = useState<string | null>(conversations[0]?.uuid ?? null);
  const [preview, setPreview] = useState<ChatMessage[]>([]);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [allMessages, setAllMessages] = useState<ChatMessage[]>([]);
  const [prompt, setPrompt] = useState("");

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
  }, [conversations, loadMessages]);

  useEffect(() => {
    if (!activeId) {
      setPreview([]);
      return;
    }
    let cancelled = false;
    setPreviewLoading(true);
    loadMessages(activeId)
      .then((m) => !cancelled && setPreview(m))
      .catch(() => !cancelled && setPreview([]))
      .finally(() => !cancelled && setPreviewLoading(false));
    return () => {
      cancelled = true;
    };
  }, [activeId, loadMessages]);

  const activeConv = conversations.find((c) => c.uuid === activeId);

  const submitPrompt = () => {
    if (!prompt.trim()) return;
    onNewChat(prompt.trim());
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
          <Button variant="glow" size="sm" onClick={() => onNewChat("")}>
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

            <div className="flex-1 overflow-y-auto p-5 space-y-5">
              {previewLoading ? (
                <div className="flex items-center justify-center py-10">
                  <Loader2 className="h-5 w-5 animate-spin text-primary" />
                </div>
              ) : preview.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center gap-2 text-muted-foreground">
                  <Sparkles className="h-6 w-6 text-primary" />
                  <p className="text-sm">Начните новый диалог в этом проекте</p>
                </div>
              ) : (
                preview.map((m, i) => (
                  <ChatBubble key={i} message={m} isLast={false} isGenerating={false} />
                ))
              )}
            </div>

            <div className="p-4 border-t border-border bg-background/40">
              <div className="rounded-xl border border-border bg-card focus-within:border-primary transition-colors p-3">
                <Textarea
                  rows={2}
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      submitPrompt();
                    }
                  }}
                  placeholder="Опишите задачу — диалог создастся внутри проекта…"
                  className="min-h-[52px] resize-none border-0 bg-transparent p-0 text-sm focus-visible:ring-0"
                />
                <div className="flex items-center justify-between mt-2">
                  <span className="inline-flex items-center gap-1.5 text-[11px] text-muted-foreground">
                    <Paperclip className="h-3.5 w-3.5" />
                    Файлы прикрепляются в диалоге
                  </span>
                  <Button variant="glow" size="icon" onClick={submitPrompt} disabled={!prompt.trim()}>
                    <ArrowRight className="h-4 w-4" />
                  </Button>
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
              <span className="text-foreground font-semibold">
                {allMessages.length} сообщений
              </span>
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
