import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { MessageSquare, Image, Video, Loader2, MoreVertical, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { fetchConversations, fetchConversationMessages, deleteConversation, type ConversationItem } from "@/lib/api";
import { useChatStore, type ChatModality } from "@/lib/chatStore";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

const typeIcons: Record<string, typeof MessageSquare> = {
  text: MessageSquare,
  image: Image,
  video: Video,
};

const typeLabels: Record<string, string> = {
  text: "Text",
  image: "Image",
  video: "Video",
};

const HistoryPage = () => {
  const [conversations, setConversations] = useState<ConversationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const navigate = useNavigate();
  const { loadConversation, setModality } = useChatStore();

  useEffect(() => {
    fetchConversations()
      .then((items) => setConversations((items ?? []).filter((c: any) => c && c.uuid)))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleOpenConversation = async (conv: ConversationItem) => {
    setLoadingId(conv.uuid);
    try {
      const msgs = await fetchConversationMessages(conv.uuid);
      const modality: ChatModality = conv.type || "text";
      loadConversation(conv.uuid, msgs as any[], modality);
      setModality(modality);
      navigate("/app");
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingId(null);
    }
  };

  const handleDelete = async (e: React.MouseEvent, conv: ConversationItem) => {
    e.stopPropagation();
    setDeletingId(conv.uuid);
    try {
      await deleteConversation(conv.uuid);
      setConversations((prev) => prev.filter((c) => c.uuid !== conv.uuid));
      toast.success("Диалог удалён");
    } catch (err) {
      console.error(err);
      toast.error("Не удалось удалить диалог");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-foreground">History</h1>
        <p className="text-sm text-muted-foreground">Your past conversations, click to continue</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : conversations.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground text-sm">
          No conversations yet. Start a new chat!
        </div>
      ) : (
        <div className="space-y-3">
          {conversations.map((conv) => {
            const Icon = typeIcons[conv.type] || MessageSquare;
            const label = typeLabels[conv.type] || "Text";
            return (
              <div
                key={conv.uuid}
                className={cn(
                  "w-full text-left bg-card card-glow rounded-xl p-4 transition-colors group animate-slide-up hover:bg-secondary/50 flex items-center gap-4",
                  (loadingId === conv.uuid || deletingId === conv.uuid) && "opacity-60"
                )}
              >
                <button
                  onClick={() => handleOpenConversation(conv)}
                  disabled={loadingId === conv.uuid || deletingId === conv.uuid}
                  className="flex items-center gap-4 flex-1 min-w-0"
                >
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    {loadingId === conv.uuid ? (
                      <Loader2 className="h-5 w-5 text-primary animate-spin" />
                    ) : (
                      <Icon className="h-5 w-5 text-primary" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0 text-left">
                    <p className="text-sm text-foreground truncate">{conv.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-secondary text-xs">
                        {label}
                      </span>
                      <span className="ml-2">{conv.uuid ? `${conv.uuid.slice(0, 8)}…` : ""}</span>
                    </p>
                  </div>
                </button>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button
                      onClick={(e) => e.stopPropagation()}
                      className="p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-secondary text-muted-foreground hover:text-foreground shrink-0"
                    >
                      <MoreVertical className="h-4 w-4" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={(e) => handleDelete(e as any, conv)}
                      className="text-destructive focus:text-destructive"
                      disabled={deletingId === conv.uuid}
                    >
                      {deletingId === conv.uuid ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4 mr-2" />
                      )}
                      Удалить
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default HistoryPage;
