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
  FolderInput,
  FolderMinus,
  ArrowLeft,
  History as HistoryIcon,
  Plus,
  Search,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import FilesPanel from "@/components/FilesPanel";
import {
  MOCK_PROJECTS,
  MOCK_CONVERSATIONS,
  MOCK_MESSAGES_BY_CONV,
  isMockId,
} from "@/lib/mockProjects";

const loadMessagesForConv = async (uuid: string) => {
  if (isMockId(uuid)) return MOCK_MESSAGES_BY_CONV[uuid] || [];
  return fetchConversationMessages(uuid);
};

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

const UNASSIGNED = "__unassigned__";

const formatDate = (iso: string) => {
  try {
    return new Date(iso).toLocaleDateString();
  } catch {
    return "";
  }
};

const ProjectFiles = ({
  conversations,
  sourceFilter,
  emptyHint,
}: {
  conversations: ConversationItem[];
  sourceFilter?: "user" | "assistant";
  emptyHint?: string;
}) => {
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    Promise.all(conversations.map((c) => loadMessagesForConv(c.uuid).catch(() => [])))
      .then((all) => {
        if (cancelled) return;
        setMessages(all.flat());
      })
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [conversations]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-10">
        <Loader2 className="h-5 w-5 animate-spin text-primary" />
      </div>
    );
  }
  return (
    <FilesPanel
      messages={messages as any}
      sourceFilter={sourceFilter}
      emptyHint={emptyHint || "В диалогах этого проекта пока нет вложений или результатов."}
    />
  );
};


const HistoryPage = () => {
  const [conversations, setConversations] = useState<ConversationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [projects, setProjects] = useState<Project[]>([]);
  const [assignments, setAssignments] = useState<Record<string, string>>({});
  const [createOpen, setCreateOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [activeView, setActiveView] = useState<string | null>(null); // projectId | UNASSIGNED | null

  const navigate = useNavigate();
  const { loadConversation, setModality, newConversation } = useChatStore();

  const handleNewInProject = (projectId: string) => {
    newConversation();
    const newId = useChatStore.getState().conversationId;
    assignConversation(newId, projectId);
    setAssignments(getAssignments());
    navigate("/app");
  };

  useEffect(() => {
    fetchConversations()
      .then((items) => {
        const real = (items ?? []).filter((c: any) => c && c.uuid);
        // Merge mock conversations for demo/preview
        const mockConvs = MOCK_CONVERSATIONS.map(({ uuid, title, type }) => ({ uuid, title, type }));
        setConversations([...real, ...mockConvs]);
      })
      .catch((e) => {
        console.error(e);
        // On failure still show mocks
        const mockConvs = MOCK_CONVERSATIONS.map(({ uuid, title, type }) => ({ uuid, title, type }));
        setConversations(mockConvs);
      })
      .finally(() => setLoading(false));

    // Seed mock projects & their assignments (once)
    const existing = getProjects();
    const existingIds = new Set(existing.map((p) => p.id));
    const merged = [...existing];
    for (const p of MOCK_PROJECTS) {
      if (!existingIds.has(p.id)) merged.push(p);
    }
    setProjects(merged);

    const a = getAssignments();
    for (const c of MOCK_CONVERSATIONS) {
      a[c.uuid] = c.projectId;
    }
    setAssignments(a);
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
      const msgs = await loadMessagesForConv(conv.uuid);
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
      if (!isMockId(conv.uuid)) await deleteConversation(conv.uuid);
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
    createProject(name);
    setProjects(getProjects());
    setNewName("");
    setCreateOpen(false);
    toast.success("Проект создан");
  };

  const handleDeleteProject = (id: string) => {
    deleteProject(id);
    setProjects(getProjects());
    setAssignments(getAssignments());
    if (activeView === id) setActiveView(null);
    toast.success("Проект удалён");
  };

  const handleAssign = (conv: ConversationItem, projectId: string | null) => {
    assignConversation(conv.uuid, projectId);
    setAssignments(getAssignments());
  };

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

  // Drill-down view
  if (activeView) {
    const isUnassigned = activeView === UNASSIGNED;
    const project = projects.find((p) => p.id === activeView);
    const items = isUnassigned ? grouped.unassigned : grouped.byProject[activeView] || [];
    const title = isUnassigned ? "История" : project?.name || "Проект";

    return (
      <div className="p-6 space-y-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => setActiveView(null)}>
              <ArrowLeft className="h-4 w-4" />
              Назад
            </Button>
            <div>
              <h1 className="text-xl font-semibold text-foreground">{title}</h1>
              <p className="text-sm text-muted-foreground">
                {items.length} {items.length === 1 ? "диалог" : "диалогов"}
              </p>
            </div>
          </div>
          {!isUnassigned && project && (
            <div className="flex items-center gap-2">
              <Button variant="glow" size="sm" onClick={() => handleNewInProject(project.id)}>
                <Plus className="h-4 w-4" />
                Новый диалог
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDeleteProject(project.id)}
                className="text-destructive hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
                Удалить проект
              </Button>
            </div>
          )}
        </div>

        {items.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground text-sm">
            Пока нет диалогов
          </div>
        ) : (
          <Tabs defaultValue="conversations">
            <TabsList>
              <TabsTrigger value="conversations">Диалоги</TabsTrigger>
              <TabsTrigger value="gallery">Галерея</TabsTrigger>
              <TabsTrigger value="refs">Референсы</TabsTrigger>
            </TabsList>
            <TabsContent value="conversations" className="mt-4">
              <div className="space-y-3">{items.map(renderConversation)}</div>
            </TabsContent>
            <TabsContent value="gallery" className="mt-4">
              <ProjectFiles conversations={items} sourceFilter="assistant" emptyHint="В этом проекте пока нет сгенерированных результатов." />
            </TabsContent>
            <TabsContent value="refs" className="mt-4">
              <ProjectFiles conversations={items} sourceFilter="user" emptyHint="В этом проекте пока нет загруженных референсов." />
            </TabsContent>
          </Tabs>

        )}
      </div>
    );
  }

  // Grid view
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-foreground">Projects</h1>
          <p className="text-sm text-muted-foreground">
            Группируйте диалоги по проектам
          </p>
        </div>
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger asChild>
            <Button variant="glow" size="sm">
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
      ) : projects.length === 0 && grouped.unassigned.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground text-sm">
          Пока ничего нет. Создайте проект или начните новый диалог.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {projects.map((p) => {
            const count = (grouped.byProject[p.id] || []).length;
            return (
              <div
                key={p.id}
                className="group relative bg-card card-glow rounded-xl p-5 hover:bg-secondary/40 transition-colors cursor-pointer animate-slide-up"
                onClick={() => setActiveView(p.id)}
              >
                <div className="flex items-start justify-between gap-2 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Folder className="h-5 w-5 text-primary" />
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button
                        onClick={(e) => e.stopPropagation()}
                        className="p-1.5 rounded opacity-0 group-hover:opacity-100 transition-opacity hover:bg-secondary text-muted-foreground hover:text-foreground"
                      >
                        <MoreVertical className="h-4 w-4" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
                      <DropdownMenuItem
                        onClick={() => handleDeleteProject(p.id)}
                        className="text-destructive focus:text-destructive"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Удалить
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <h3 className="text-sm font-medium text-foreground truncate">{p.name}</h3>
                <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
                  <span>{formatDate(p.createdAt)}</span>
                  <span>
                    {count} {count === 1 ? "диалог" : "диалогов"}
                  </span>
                </div>
              </div>
            );
          })}

          {grouped.unassigned.length > 0 && (
            <div
              className="group relative bg-card card-glow rounded-xl p-5 hover:bg-secondary/40 transition-colors cursor-pointer animate-slide-up border-dashed"
              onClick={() => setActiveView(UNASSIGNED)}
            >
              <div className="flex items-start justify-between gap-2 mb-4">
                <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center">
                  <HistoryIcon className="h-5 w-5 text-muted-foreground" />
                </div>
              </div>
              <h3 className="text-sm font-medium text-foreground truncate">История</h3>
              <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
                <span>Без проекта</span>
                <span>
                  {grouped.unassigned.length}{" "}
                  {grouped.unassigned.length === 1 ? "диалог" : "диалогов"}
                </span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default HistoryPage;
