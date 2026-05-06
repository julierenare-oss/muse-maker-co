import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  MessageSquare,
  Image,
  Video,
  Loader2,
  MoreVertical,
  Trash2,
  FolderPlus,
  Folder,
  FolderOpen,
  ChevronRight,
  ChevronDown,
  FolderInput,
  FolderMinus,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  fetchConversations,
  fetchConversationMessages,
  deleteConversation,
  type ConversationItem,
} from "@/lib/api";
import { useChatStore, type ChatModality } from "@/lib/chatStore";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  type Project,
  getProjects,
  createProject,
  deleteProject,
  getAssignments,
  assignConversation,
} from "@/lib/projects";

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

  const [projects, setProjects] = useState<Project[]>([]);
  const [assignments, setAssignments] = useState<Record<string, string>>({});
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [createOpen, setCreateOpen] = useState(false);
  const [newName, setNewName] = useState("");

  const navigate = useNavigate();
  const { loadConversation, setModality } = useChatStore();

  useEffect(() => {
    fetchConversations()
      .then((items) => setConversations((items ?? []).filter((c: any) => c && c.uuid)))
      .catch(console.error)
      .finally(() => setLoading(false));
    setProjects(getProjects());
    setAssignments(getAssignments());
  }, []);

  const grouped = useMemo(() => {
    const byProject: Record<string, ConversationItem[]> = {};
    const unassigned: ConversationItem[] = [];
    for (const c of conversations) {
      const pid = assignments[c.uuid];
      if (pid && projects.some((p) => p.id === pid)) {
        (byProject[pid] ||= []).push(c);
      } else {
        unassigned.push(c);
      }
    }
    return { byProject, unassigned };
  }, [conversations, assignments, projects]);

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
      assignConversation(conv.uuid, null);
      setAssignments(getAssignments());
      toast.success("Диалог удалён");
    } catch (err) {
      console.error(err);
      toast.error("Не удалось удалить диалог");
    } finally {
      setDeletingId(null);
    }
  };

  const handleCreateProject = () => {
    const name = newName.trim();
    if (!name) return;
    const p = createProject(name);
    setProjects(getProjects());
    setExpanded((s) => ({ ...s, [p.id]: true }));
    setNewName("");
    setCreateOpen(false);
    toast.success("Проект создан");
  };

  const handleDeleteProject = (id: string) => {
    deleteProject(id);
    setProjects(getProjects());
    setAssignments(getAssignments());
    toast.success("Проект удалён");
  };

  const handleAssign = (conv: ConversationItem, projectId: string | null) => {
    assignConversation(conv.uuid, projectId);
    setAssignments(getAssignments());
  };

  const toggle = (id: string) => setExpanded((s) => ({ ...s, [id]: !s[id] }));

  const renderConversation = (conv: ConversationItem) => {
    const Icon = typeIcons[conv.type] || MessageSquare;
    const label = typeLabels[conv.type] || "Text";
    const currentPid = assignments[conv.uuid];
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
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>
                <FolderInput className="h-4 w-4 mr-2" />
                Переместить в проект
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent>
                {projects.length === 0 && (
                  <DropdownMenuItem disabled>Нет проектов</DropdownMenuItem>
                )}
                {projects.map((p) => (
                  <DropdownMenuItem
                    key={p.id}
                    onClick={() => handleAssign(conv, p.id)}
                    disabled={currentPid === p.id}
                  >
                    <Folder className="h-4 w-4 mr-2" />
                    {p.name}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuSubContent>
            </DropdownMenuSub>
            {currentPid && (
              <DropdownMenuItem onClick={() => handleAssign(conv, null)}>
                <FolderMinus className="h-4 w-4 mr-2" />
                Убрать из проекта
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
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
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-foreground">History</h1>
          <p className="text-sm text-muted-foreground">
            Your past conversations, grouped by project
          </p>
        </div>
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger asChild>
            <Button variant="glass" size="sm">
              <FolderPlus className="h-4 w-4" />
              Новый проект
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Создать проект</DialogTitle>
            </DialogHeader>
            <Input
              placeholder="Название проекта"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleCreateProject()}
              autoFocus
            />
            <DialogFooter>
              <Button variant="ghost" onClick={() => setCreateOpen(false)}>
                Отмена
              </Button>
              <Button onClick={handleCreateProject} disabled={!newName.trim()}>
                Создать
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : conversations.length === 0 && projects.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground text-sm">
          No conversations yet. Start a new chat!
        </div>
      ) : (
        <div className="space-y-6">
          {projects.length > 0 && (
            <div className="space-y-3">
              {projects.map((p) => {
                const items = grouped.byProject[p.id] || [];
                const open = expanded[p.id] ?? true;
                return (
                  <div key={p.id} className="space-y-2">
                    <div className="flex items-center gap-2 group">
                      <button
                        onClick={() => toggle(p.id)}
                        className="flex items-center gap-2 text-sm font-medium text-foreground hover:text-primary transition-colors"
                      >
                        {open ? (
                          <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        )}
                        {open ? (
                          <FolderOpen className="h-4 w-4 text-primary" />
                        ) : (
                          <Folder className="h-4 w-4 text-primary" />
                        )}
                        <span>{p.name}</span>
                        <span className="text-xs text-muted-foreground">({items.length})</span>
                      </button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button className="p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity hover:bg-secondary text-muted-foreground hover:text-foreground">
                            <MoreVertical className="h-3.5 w-3.5" />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start">
                          <DropdownMenuItem
                            onClick={() => handleDeleteProject(p.id)}
                            className="text-destructive focus:text-destructive"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Удалить проект
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    {open && (
                      <div className="space-y-3 pl-6">
                        {items.length === 0 ? (
                          <p className="text-xs text-muted-foreground py-2">
                            Пока нет диалогов. Перенесите сюда из списка ниже.
                          </p>
                        ) : (
                          items.map(renderConversation)
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {grouped.unassigned.length > 0 && (
            <div className="space-y-3">
              {projects.length > 0 && (
                <h2 className="text-sm font-medium text-muted-foreground">Без проекта</h2>
              )}
              {grouped.unassigned.map(renderConversation)}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default HistoryPage;
