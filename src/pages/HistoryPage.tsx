import { Download, Copy, Type, Image, Video, AudioLines } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface HistoryItem {
  id: string;
  prompt: string;
  modality: "text" | "image" | "video" | "audio";
  model: string;
  date: string;
}

const mockHistory: HistoryItem[] = [
  { id: "1", prompt: "Write a product description for AI camera with 48MP sensor and night mode", modality: "text", model: "GPT-5", date: "2026-03-23 14:32" },
  { id: "2", prompt: "Minimalist tech brand logo, blue and white, clean geometric shapes", modality: "image", model: "DALL-E 4", date: "2026-03-22 10:15" },
  { id: "3", prompt: "15-second product explainer video showing the app interface on a smartphone", modality: "video", model: "Sora", date: "2026-03-21 16:45" },
  { id: "4", prompt: "Professional voiceover for advertisement: Welcome to the future of productivity", modality: "audio", model: "TTS-HD", date: "2026-03-20 09:00" },
  { id: "5", prompt: "Market analysis report covering trends in AI adoption across European enterprises", modality: "text", model: "GPT-5", date: "2026-03-19 11:30" },
];

const modalityIcon = { text: Type, image: Image, video: Video, audio: AudioLines };

const HistoryPage = () => {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-foreground">History</h1>
        <p className="text-sm text-muted-foreground">Your past generation requests, newest first</p>
      </div>

      <div className="space-y-3">
        {mockHistory.map((item) => {
          const Icon = modalityIcon[item.modality];
          return (
            <div
              key={item.id}
              className="bg-card border border-border rounded-xl p-4 hover:border-primary/30 transition-colors group animate-slide-up"
            >
              <div className="flex items-start gap-4">
                <div className={cn(
                  "w-10 h-10 rounded-lg flex items-center justify-center shrink-0 mt-0.5",
                  item.modality === "text" && "bg-blue-500/10 text-blue-400",
                  item.modality === "image" && "bg-emerald-500/10 text-emerald-400",
                  item.modality === "video" && "bg-purple-500/10 text-purple-400",
                  item.modality === "audio" && "bg-amber-500/10 text-amber-400",
                )}>
                  <Icon className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-foreground mb-1">{item.prompt}</p>
                  <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                    <span>{item.model}</span>
                    <span>·</span>
                    <span>{item.date}</span>
                  </div>
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                  <Button variant="outline" size="sm" title="Copy result">
                    <Copy className="h-3 w-3 mr-1" />
                    Copy
                  </Button>
                  <Button variant="outline" size="sm" title="Download result">
                    <Download className="h-3 w-3 mr-1" />
                    Download
                  </Button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default HistoryPage;
