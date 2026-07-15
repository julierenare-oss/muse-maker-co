import { useMemo, useState } from "react";
import {
  FileText,
  Image as ImageIcon,
  Film,
  Music,
  File as FileIcon,
  Download,
  Upload,
  Sparkles,
  ExternalLink,
  Search,
  LayoutGrid,
  List as ListIcon,
  ArrowDownAZ,
  Clock,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { ChatMessage } from "@/lib/chatStore";

export type FileKind = "image" | "video" | "audio" | "document" | "other";

interface FileItem {
  url: string;
  name: string;
  ext: string;
  kind: FileKind;
  source: "user" | "assistant";
}

const IMG = ["png", "jpg", "jpeg", "webp", "gif", "svg", "bmp", "avif"];
const VID = ["mp4", "mov", "webm", "mkv", "avi", "m4v"];
const AUD = ["mp3", "wav", "ogg", "m4a", "flac", "aac"];
const DOC = ["pdf", "doc", "docx", "txt", "md", "csv", "xls", "xlsx", "ppt", "pptx", "json", "html"];

const kindOf = (ext: string): FileKind => {
  const e = ext.toLowerCase();
  if (IMG.includes(e)) return "image";
  if (VID.includes(e)) return "video";
  if (AUD.includes(e)) return "audio";
  if (DOC.includes(e)) return "document";
  return "other";
};

const parseUrl = (url: string): { name: string; ext: string } => {
  try {
    const u = new URL(url, "http://x");
    const path = u.pathname.split("/").pop() || url;
    const dot = path.lastIndexOf(".");
    return {
      name: decodeURIComponent(path),
      ext: dot >= 0 ? path.slice(dot + 1).split("?")[0] : "",
    };
  } catch {
    const path = url.split("/").pop() || url;
    const dot = path.lastIndexOf(".");
    return { name: path, ext: dot >= 0 ? path.slice(dot + 1) : "" };
  }
};

export const extractFiles = (messages: ChatMessage[]): FileItem[] => {
  const seen = new Set<string>();
  const out: FileItem[] = [];
  for (const m of messages) {
    if (!m.attachments?.length) continue;
    for (const url of m.attachments) {
      if (!url || seen.has(url)) continue;
      seen.add(url);
      const { name, ext } = parseUrl(url);
      out.push({ url, name, ext, kind: kindOf(ext), source: m.role });
    }
  }
  return out;
};

const KIND_META: Record<FileKind, { label: string; color: string; bg: string; Icon: typeof FileIcon }> = {
  image: { label: "Images", color: "text-emerald-400", bg: "bg-emerald-500/15 border-emerald-500/30", Icon: ImageIcon },
  video: { label: "Videos", color: "text-fuchsia-400", bg: "bg-fuchsia-500/15 border-fuchsia-500/30", Icon: Film },
  audio: { label: "Audio", color: "text-amber-400", bg: "bg-amber-500/15 border-amber-500/30", Icon: Music },
  document: { label: "Docs", color: "text-sky-400", bg: "bg-sky-500/15 border-sky-500/30", Icon: FileText },
  other: { label: "Other", color: "text-muted-foreground", bg: "bg-secondary border-border", Icon: FileIcon },
};

const ORDER: FileKind[] = ["image", "video", "audio", "document", "other"];

interface Props {
  messages: ChatMessage[];
  emptyHint?: string;
  dense?: boolean;
  sourceFilter?: "user" | "assistant";
}

const FilesPanel = ({ messages, emptyHint, dense, sourceFilter }: Props) => {
  const allFiles = useMemo(() => extractFiles(messages), [messages]);
  const files = useMemo(
    () => (sourceFilter ? allFiles.filter((f) => f.source === sourceFilter) : allFiles),
    [allFiles, sourceFilter]
  );
  const [filter, setFilter] = useState<FileKind | "all">("all");
  const [sourceChip, setSourceChip] = useState<"all" | "user" | "assistant">("all");
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<"recent" | "name" | "type">("recent");
  const [view, setView] = useState<"grid" | "list">("grid");


  const counts = useMemo(() => {
    const c: Record<string, number> = { all: files.length };
    for (const k of ORDER) c[k] = 0;
    for (const f of files) c[f.kind] += 1;
    return c;
  }, [files]);

  const visible = useMemo(() => {
    let list = filter === "all" ? files : files.filter((f) => f.kind === filter);
    if (!sourceFilter && sourceChip !== "all") {
      list = list.filter((f) => f.source === sourceChip);
    }
    const q = query.trim().toLowerCase();
    if (q) list = list.filter((f) => f.name.toLowerCase().includes(q) || f.ext.toLowerCase().includes(q));
    if (sort === "name") list = [...list].sort((a, b) => a.name.localeCompare(b.name));
    else if (sort === "type") list = [...list].sort((a, b) => a.kind.localeCompare(b.kind) || a.name.localeCompare(b.name));
    // "recent" keeps chronological order from messages (newest last → reverse)
    else list = [...list].reverse();
    return list;
  }, [files, filter, sourceChip, sourceFilter, query, sort]);

  if (files.length === 0) {
    return (
      <div className="text-center py-10 px-4 text-xs text-muted-foreground">
        {emptyHint || "Файлы появятся здесь, когда вы прикрепите вложения или получите результат генерации."}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[180px] max-w-xs">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Поиск по имени…"
            className="h-8 pl-7 text-xs"
          />
        </div>

        {!sourceFilter && (
          <div className="inline-flex rounded-md border border-border bg-secondary/40 p-0.5">
            {(["all", "user", "assistant"] as const).map((s) => (
              <button
                key={s}
                onClick={() => setSourceChip(s)}
                className={cn(
                  "px-2 py-1 text-[11px] rounded transition-colors",
                  sourceChip === s ? "bg-primary/20 text-foreground" : "text-muted-foreground hover:text-foreground"
                )}
                title={s === "user" ? "Загруженные" : s === "assistant" ? "Сгенерированные" : "Все источники"}
              >
                {s === "all" ? "Все" : s === "user" ? "Загр." : "Сген."}
              </button>
            ))}
          </div>
        )}

        <div className="inline-flex rounded-md border border-border bg-secondary/40 p-0.5">
          {([
            ["recent", Clock, "Свежие"],
            ["name", ArrowDownAZ, "По имени"],
            ["type", FileIcon, "По типу"],
          ] as const).map(([key, Icon, label]) => (
            <button
              key={key}
              onClick={() => setSort(key)}
              title={label}
              className={cn(
                "px-2 py-1 rounded transition-colors",
                sort === key ? "bg-primary/20 text-foreground" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon className="h-3.5 w-3.5" />
            </button>
          ))}
        </div>

        <div className="inline-flex rounded-md border border-border bg-secondary/40 p-0.5">
          <button
            onClick={() => setView("grid")}
            title="Сетка"
            className={cn("px-2 py-1 rounded", view === "grid" ? "bg-primary/20 text-foreground" : "text-muted-foreground hover:text-foreground")}
          >
            <LayoutGrid className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => setView("list")}
            title="Список"
            className={cn("px-2 py-1 rounded", view === "list" ? "bg-primary/20 text-foreground" : "text-muted-foreground hover:text-foreground")}
          >
            <ListIcon className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5">
        <Chip active={filter === "all"} onClick={() => setFilter("all")} label="Все" count={counts.all} />
        {ORDER.filter((k) => counts[k] > 0).map((k) => (
          <Chip
            key={k}
            active={filter === k}
            onClick={() => setFilter(k)}
            label={KIND_META[k].label}
            count={counts[k]}
            color={KIND_META[k].color}
          />
        ))}
      </div>

      {visible.length === 0 ? (
        <div className="text-center py-8 text-xs text-muted-foreground">Ничего не найдено</div>
      ) : view === "list" ? (
        <div className="divide-y divide-border rounded-lg border border-border overflow-hidden bg-secondary/30">
          {visible.map((f) => (
            <FileRow key={f.url} file={f} />
          ))}
        </div>
      ) : (
        <div
          className={cn(
            "gap-2",
            dense
              ? "columns-2 [&>*]:mb-2 [&>*]:break-inside-avoid"
              : "columns-2 sm:columns-3 md:columns-4 [&>*]:mb-2 [&>*]:break-inside-avoid"
          )}
        >
          {visible.map((f) => (
            <FileCard key={f.url} file={f} />
          ))}
        </div>
      )}
    </div>
  );
};

const Chip = ({
  active,
  onClick,
  label,
  count,
  color,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  count: number;
  color?: string;
}) => (
  <button
    onClick={onClick}
    className={cn(
      "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs border transition-colors",
      active
        ? "bg-primary/20 border-primary/50 text-foreground"
        : "bg-secondary/60 border-border text-muted-foreground hover:text-foreground"
    )}
  >
    <span className={cn(!active && color)}>{label}</span>
    <span className="text-[10px] opacity-70">{count}</span>
  </button>
);

const FileCard = ({ file }: { file: FileItem }) => {
  const meta = KIND_META[file.kind];
  const SourceIcon = file.source === "user" ? Upload : Sparkles;
  const sourceTitle = file.source === "user" ? "Загружено" : "Сгенерировано";

  return (
    <div className="group relative rounded-lg overflow-hidden border border-border bg-secondary/40 hover:border-primary/40 transition-colors">
      <div className="relative">
        {file.kind === "image" ? (
          <img src={file.url} alt={file.name} loading="lazy" className="w-full block" />
        ) : file.kind === "video" ? (
          <video src={file.url} className="w-full block" muted preload="metadata" />
        ) : (
          <div className="flex items-center justify-center aspect-square bg-card">
            <meta.Icon className={cn("h-8 w-8", meta.color)} />
          </div>
        )}

        <span
          className={cn(
            "absolute top-1.5 left-1.5 inline-flex items-center gap-1 px-1.5 py-0.5 rounded border text-[10px] font-medium uppercase tracking-wide backdrop-blur-sm",
            meta.bg,
            meta.color
          )}
        >
          {file.ext || meta.label}
        </span>

        <span
          title={sourceTitle}
          className="absolute top-1.5 right-1.5 inline-flex items-center justify-center h-5 w-5 rounded-full bg-background/70 backdrop-blur-sm border border-border text-foreground"
        >
          <SourceIcon className="h-3 w-3" />
        </span>

        <div className="absolute inset-x-0 bottom-0 p-1.5 flex items-center justify-between gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-t from-background/90 to-transparent">
          <a
            href={file.url}
            target="_blank"
            rel="noreferrer"
            className="p-1 rounded bg-background/80 hover:bg-background text-foreground"
            title="Открыть"
          >
            <ExternalLink className="h-3 w-3" />
          </a>
          <a
            href={file.url}
            download={file.name}
            className="p-1 rounded bg-background/80 hover:bg-background text-foreground"
            title="Скачать"
          >
            <Download className="h-3 w-3" />
          </a>
        </div>
      </div>
      <div className="px-2 py-1.5 text-[11px] text-muted-foreground truncate" title={file.name}>
        {file.name}
      </div>
    </div>
  );
};

export default FilesPanel;
