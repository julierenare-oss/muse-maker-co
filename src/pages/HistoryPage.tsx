import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { MessageSquare, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { fetchConversations, fetchConversationMessages } from "@/lib/api";
import { useChatStore } from "@/lib/chatStore";

interface Conversation {
  uuid: string;
  title: string;
}

const HistoryPage = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const navigate = useNavigate();
  const loadConversation = useChatStore((s) => s.loadConversation);

  useEffect(() => {
    fetchConversations()
      .then(setConversations)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleOpenConversation = async (conv: Conversation) => {
    setLoadingId(conv.uuid);
    try {
      const msgs = await fetchConversationMessages(conv.uuid);
      loadConversation(conv.uuid, msgs as { role: "user" | "assistant"; content: string }[]);
      navigate("/app");
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingId(null);
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
          {conversations.map((conv) => (
            <button
              key={conv.uuid}
              onClick={() => handleOpenConversation(conv)}
              disabled={loadingId === conv.uuid}
              className={cn(
                "w-full text-left bg-card card-glow rounded-xl p-4 transition-colors group animate-slide-up hover:bg-secondary/50",
                loadingId === conv.uuid && "opacity-60"
              )}
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  {loadingId === conv.uuid ? (
                    <Loader2 className="h-5 w-5 text-primary animate-spin" />
                  ) : (
                    <MessageSquare className="h-5 w-5 text-primary" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-foreground truncate">{conv.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {conv.uuid.slice(0, 8)}…
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default HistoryPage;
