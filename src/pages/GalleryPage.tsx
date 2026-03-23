import { useState } from "react";
import { Download, Copy, Trash2, RefreshCw, Type, Image, Video, AudioLines } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";

type ResultModality = "all" | "text" | "image" | "video" | "audio";

interface Result {
  id: string;
  modality: "text" | "image" | "video" | "audio";
  preview: string;
  model: string;
  author: string;
  date: string;
  prompt: string;
}

const mockResults: Result[] = [
  { id: "1", modality: "text", preview: "A comprehensive product description for the new AI-powered camera featuring 48MP sensor...", model: "GPT-5", author: "Alice", date: "2026-03-23", prompt: "Write a product description for AI camera" },
  { id: "2", modality: "image", preview: "🖼️ Brand Logo v3", model: "DALL-E 4", author: "Bob", date: "2026-03-22", prompt: "Minimalist tech brand logo" },
  { id: "3", modality: "video", preview: "🎬 Explainer Video 15s", model: "Sora", author: "Alice", date: "2026-03-21", prompt: "Product explainer video" },
  { id: "4", modality: "audio", preview: "🔊 Voiceover Take 2", model: "TTS-HD", author: "Carol", date: "2026-03-20", prompt: "Professional voiceover for ad" },
  { id: "5", modality: "text", preview: "Market analysis report covering trends in AI adoption across European enterprises...", model: "GPT-5", author: "Bob", date: "2026-03-19", prompt: "Market analysis for AI in Europe" },
  { id: "6", modality: "image", preview: "🖼️ Social Media Banner", model: "DALL-E 4", author: "Carol", date: "2026-03-18", prompt: "Social media banner for tech conference" },
];

const modalityIcon = {
  text: Type,
  image: Image,
  video: Video,
  audio: AudioLines,
};

const GalleryPage = () => {
  const [filter, setFilter] = useState<ResultModality>("all");

  const filtered = filter === "all" ? mockResults : mockResults.filter((r) => r.modality === filter);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-foreground">Gallery</h1>
          <p className="text-sm text-muted-foreground">{filtered.length} results</p>
        </div>
        <Select value={filter} onValueChange={(v) => setFilter(v as ResultModality)}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Filter" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="text">Text</SelectItem>
            <SelectItem value="image">Image</SelectItem>
            <SelectItem value="video">Video</SelectItem>
            <SelectItem value="audio">Audio</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map((result) => {
          const Icon = modalityIcon[result.modality];
          return (
            <div
              key={result.id}
              className="bg-card border border-border rounded-xl p-4 hover:border-primary/30 transition-colors group animate-slide-up"
            >
              {/* Header */}
              <div className="flex items-center gap-2 mb-3">
                <div className={cn(
                  "w-8 h-8 rounded-lg flex items-center justify-center",
                  result.modality === "text" && "bg-blue-500/10 text-blue-400",
                  result.modality === "image" && "bg-emerald-500/10 text-emerald-400",
                  result.modality === "video" && "bg-purple-500/10 text-purple-400",
                  result.modality === "audio" && "bg-amber-500/10 text-amber-400",
                )}>
                  <Icon className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-muted-foreground">{result.model} · {result.author}</p>
                  <p className="text-xs text-muted-foreground">{result.date}</p>
                </div>
              </div>

              {/* Preview */}
              <div className="bg-secondary/50 rounded-lg p-3 mb-3 min-h-[80px]">
                <p className="text-sm text-foreground line-clamp-3">{result.preview}</p>
              </div>

              {/* Actions */}
              <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button variant="ghost" size="sm" title="Download"><Download className="h-3 w-3" /></Button>
                {result.modality === "text" && (
                  <Button variant="ghost" size="sm" title="Copy"><Copy className="h-3 w-3" /></Button>
                )}
                <Button variant="ghost" size="sm" title="Create similar"><RefreshCw className="h-3 w-3" /></Button>
                <Button variant="ghost" size="sm" title="Delete" className="ml-auto text-destructive hover:text-destructive">
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default GalleryPage;
