import { useEffect, useState } from "react";
import type { ChatModality } from "@/lib/chatStore";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { fetchModels, type ModelsByModality } from "@/lib/api";
import { useChatParams } from "@/lib/chatParams";

interface ModalityParamsProps {
  modality: ChatModality;
  selectedModel?: string;
  onModelChange?: (model: string) => void;
}

const ModalityParams = ({ modality, selectedModel, onModelChange }: ModalityParamsProps) => {
  const [allModels, setAllModels] = useState<ModelsByModality>({ text: [], image: [], video: [] });
  const params = useChatParams();

  useEffect(() => {
    fetchModels().then(setAllModels).catch(console.error);
  }, []);

  const models = allModels[modality] || [];

  // Auto-select first model when modality changes or models load
  useEffect(() => {
    if (models.length > 0 && (!selectedModel || !models.includes(selectedModel))) {
      onModelChange?.(models[0]);
    }
  }, [models, modality]);

  if (modality === "text") {
    return (
      <div className="space-y-4 p-4 bg-secondary/50 rounded-lg border border-border">
        <h3 className="text-sm font-medium text-foreground">Text Parameters</h3>
        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground">Model</Label>
          <Select value={selectedModel} onValueChange={onModelChange}>
            <SelectTrigger><SelectValue placeholder="Select model" /></SelectTrigger>
            <SelectContent>
              {models.map((m) => (
                <SelectItem key={m} value={m}>{m}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <Label className="text-xs text-muted-foreground">Temperature</Label>
            <span className="text-xs font-mono text-foreground">{params.temperature.toFixed(1)}</span>
          </div>
          <Slider
            value={[params.temperature]}
            onValueChange={([v]) => params.setTemperature(v)}
            min={0} max={2} step={0.1}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Precise (0)</span><span>Creative (2)</span>
          </div>
        </div>
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <Label className="text-xs text-muted-foreground">Max Tokens</Label>
            <span className="text-xs font-mono text-foreground">{params.maxTokens}</span>
          </div>
          <Input
            type="number" min={1} max={32768}
            value={params.maxTokens}
            onChange={(e) => params.setMaxTokens(Math.min(32768, Math.max(1, Number(e.target.value) || 1)))}
            className="h-8 text-sm"
          />
        </div>
      </div>
    );
  }

  if (modality === "image") {
    return (
      <div className="space-y-4 p-4 bg-secondary/50 rounded-lg border border-border">
        <h3 className="text-sm font-medium text-foreground">Image Parameters</h3>
        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground">Model</Label>
          <Select value={selectedModel} onValueChange={onModelChange}>
            <SelectTrigger><SelectValue placeholder="Select model" /></SelectTrigger>
            <SelectContent>
              {models.map((m) => (
                <SelectItem key={m} value={m}>{m}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground">Number of images</Label>
          <Select value={String(params.imageN)} onValueChange={(v) => params.setImageN(Number(v))}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {[1, 2, 3, 4].map((n) => (
                <SelectItem key={n} value={String(n)}>{n}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground">Size</Label>
          <Select value={params.imageSize} onValueChange={params.setImageSize}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="1024x1024">1024×1024</SelectItem>
              <SelectItem value="1792x1024">1792×1024</SelectItem>
              <SelectItem value="1024x1792">1024×1792</SelectItem>
              <SelectItem value="512x512">512×512</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground">Quality</Label>
          <Select value={params.imageQuality} onValueChange={params.setImageQuality}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="low">Low</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="high">High</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    );
  }

  // video
  return (
    <div className="space-y-4 p-4 bg-secondary/50 rounded-lg border border-border">
      <h3 className="text-sm font-medium text-foreground">Video Parameters</h3>
      <div className="space-y-2">
        <Label className="text-xs text-muted-foreground">Model</Label>
        <Select value={selectedModel} onValueChange={onModelChange}>
          <SelectTrigger><SelectValue placeholder="Select model" /></SelectTrigger>
          <SelectContent>
            {models.map((m) => (
              <SelectItem key={m} value={m}>{m}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label className="text-xs text-muted-foreground">Size</Label>
        <Select value={params.videoSize} onValueChange={params.setVideoSize}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="1280x720">1280×720 (HD)</SelectItem>
            <SelectItem value="1920x1080">1920×1080 (Full HD)</SelectItem>
            <SelectItem value="720x1280">720×1280 (Portrait)</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label className="text-xs text-muted-foreground">Duration</Label>
        <Select value={params.videoSeconds} onValueChange={params.setVideoSeconds}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="5">5 seconds</SelectItem>
            <SelectItem value="10">10 seconds</SelectItem>
            <SelectItem value="15">15 seconds</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export default ModalityParams;
