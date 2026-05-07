import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Plus, FolderKanban, BarChart3, LayoutDashboard,
  Settings, Users, Key, ChevronLeft, ChevronRight, LogOut,
  ChevronDown, MessageSquare, Image as ImageIcon, Video, Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useChatStore, type ChatModality } from "@/lib/chatStore";
import { useAuthStore } from "@/lib/auth";
import { fetchConversations, fetchConversationMessages, type ConversationItem } from "@/lib/api";

const navItems = [
  { icon: FolderKanban, label: "Projects", path: "/app/history" },
  { icon: LayoutDashboard, label: "Dashboard", path: "/app/dashboard" },
  { icon: BarChart3, label: "Billing", path: "/app/stats", ownerOnly: true },
  { icon: Users, label: "Team", path: "/app/team", ownerOnly: true },
  { icon: Key, label: "API Keys", path: "/app/api-keys" },
  { icon: Settings, label: "Settings", path: "/app/settings" },
];

const typeIcons = { text: MessageSquare, image: ImageIcon, video: Video } as const;

const AppSidebar = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [recentOpen, setRecentOpen] = useState(false);
  const [recent, setRecent] = useState<ConversationItem[]>([]);
  const [recentLoading, setRecentLoading] = useState(false);
  const [openingId, setOpeningId] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const isOwner = true;
  const newConversation = useChatStore((s) => s.newConversation);
  const loadConversation = useChatStore((s) => s.loadConversation);
  const setModality = useChatStore((s) => s.setModality);
  const logout = useAuthStore((s) => s.logout);

  useEffect(() => {
    if (!recentOpen || recent.length || recentLoading) return;
    setRecentLoading(true);
    fetchConversations()
      .then((items) => setRecent((items ?? []).filter((c: any) => c?.uuid).slice(0, 10)))
      .catch(console.error)
      .finally(() => setRecentLoading(false));
  }, [recentOpen]);

  const handleOpenRecent = async (conv: ConversationItem) => {
    setOpeningId(conv.uuid);
    try {
      const msgs = await fetchConversationMessages(conv.uuid);
      const modality: ChatModality = conv.type || "text";
      loadConversation(conv.uuid, msgs as any[], modality);
      setModality(modality);
      navigate("/app");
    } catch (e) {
      console.error(e);
    } finally {
      setOpeningId(null);
    }
  };

  return (
    <aside
      className={cn(
        "h-screen bg-sidebar border-r border-sidebar-border flex flex-col transition-all duration-300",
        collapsed ? "w-16" : "w-64"
      )}
    >
      {/* Logo */}
      <div className="p-4 flex items-center justify-between border-b border-sidebar-border">
        {!collapsed && (
          <span className="font-mono font-bold text-lg gradient-text">NEXAGEN</span>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCollapsed(!collapsed)}
          className="text-sidebar-foreground hover:text-foreground"
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>

      {/* New Request Button */}
      <div className="p-3">
        <Button
          variant="glow"
          className={cn("w-full", collapsed ? "px-0" : "")}
          onClick={() => {
            newConversation();
            navigate("/app");
          }}
        >
          <Plus className="h-4 w-4" />
          {!collapsed && <span>New Request</span>}
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
        {navItems
          .filter((item) => !item.ownerOnly || isOwner)
          .map((item) => {
            const Icon = item.icon;
            const active = location.pathname === item.path;
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors",
                  active
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                  collapsed && "justify-center"
                )}
                title={collapsed ? item.label : undefined}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {!collapsed && <span>{item.label}</span>}
              </button>
            );
          })}

        {/* Recent dialogs */}
        {!collapsed && (
          <div className="pt-2 mt-2 border-t border-sidebar-border">
            <button
              onClick={() => setRecentOpen((v) => !v)}
              className="w-full flex items-center justify-between px-3 py-2 rounded-md text-sm text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors"
            >
              <span>Недавние диалоги</span>
              <ChevronDown
                className={cn("h-4 w-4 transition-transform", recentOpen && "rotate-180")}
              />
            </button>
            {recentOpen && (
              <div className="mt-1 space-y-0.5">
                {recentLoading && (
                  <div className="px-3 py-2 flex items-center justify-center">
                    <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                  </div>
                )}
                {!recentLoading && recent.length === 0 && (
                  <div className="px-3 py-2 text-xs text-muted-foreground">Пусто</div>
                )}
                {recent.map((c) => {
                  const Icon = typeIcons[c.type] || MessageSquare;
                  return (
                    <button
                      key={c.uuid}
                      onClick={() => handleOpenRecent(c)}
                      disabled={openingId === c.uuid}
                      className="w-full flex items-center gap-2 px-3 py-1.5 rounded-md text-xs text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors text-left"
                      title={c.title}
                    >
                      {openingId === c.uuid ? (
                        <Loader2 className="h-3.5 w-3.5 shrink-0 animate-spin" />
                      ) : (
                        <Icon className="h-3.5 w-3.5 shrink-0 text-primary/70" />
                      )}
                      <span className="truncate">{c.title}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </nav>

      {/* User */}
      <div className="p-3 border-t border-sidebar-border">
        <button
          onClick={() => {
            logout();
            navigate("/");
          }}
          className={cn(
            "w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm text-sidebar-foreground hover:bg-sidebar-accent transition-colors",
            collapsed && "justify-center"
          )}
        >
          <LogOut className="h-4 w-4 shrink-0" />
          {!collapsed && <span>Sign Out</span>}
        </button>
      </div>
    </aside>
  );
};

export default AppSidebar;
