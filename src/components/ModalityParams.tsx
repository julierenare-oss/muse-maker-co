import { useEffect, useState } from "react";
import type { Modality } from "./ModalitySelector";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { fetchModels } from "@/lib/api";
import { useChatParams } from "@/lib/chatParams";

interface ModalityParamsProps {
  modality: Modality;
  selectedModel?: string;
  onModelChange?: (model: string) => void;
}

const modelsByModality: Record<Exclude<Modality, "text">, { value: string; label: string }[]> = {
  image: [
    { value: "dall-e-4", label: "DALL·E 4" },
    { value: "midjourney-v7", label: "Midjourney V7" },
    { value: "stable-diffusion-xl", label: "Stable Diffusion XL" },
    { value: "flux-pro", label: "Flux Pro" },
    { value: "gemini-image", label: "Gemini Image" },
  ],
  video: [
    { value: "sora", label: "Sora" },
    { value: "runway-gen4", label: "Runway Gen-4" },
    { value: "kling-v2", label: "Kling V2" },
    { value: "pika-2", label: "Pika 2.0" },
  ],
  audio: [
    { value: "tts-hd", label: "TTS-HD (OpenAI)" },
    { value: "elevenlabs", label: "ElevenLabs" },
    { value: "bark", label: "Bark" },
    { value: "google-tts", label: "Google TTS" },
  ],
};

const StaticModelSelector = ({ modality }: { modality: Exclude<Modality, "text"> }) => {
  const models = modelsByModality[modality];
  return (
    <div className="space-y-2">
      <Label className="text-xs text-muted-foreground">Model</Label>
      <Select defaultValue={models[0].value}>
        <SelectTrigger><SelectValue /></SelectTrigger>
        <SelectContent>
          {models.map((m) => (
            <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

const ModalityParams = ({ modality, selectedModel, onModelChange }: ModalityParamsProps) => {
  const [apiModels, setApiModels] = useState<string[]>([]);
  const { temperature, maxTokens, topP, setTemperature, setMaxTokens, setTopP } = useChatParams();

  useEffect(() => {
    if (modality === "text") {
      fetchModels().then(setApiModels).catch(console.error);
    }
  }, [modality]);

  if (modality === "text") {
    return (
      <div className="space-y-4 p-4 bg-secondary/50 rounded-lg border border-border">
        <h3 className="text-sm font-medium text-foreground">Text Parameters</h3>
        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground">Model</Label>
          <Select value={selectedModel} onValueChange={onModelChange}>
            <SelectTrigger><SelectValue placeholder="Select model" /></SelectTrigger>
            <SelectContent>
              {apiModels.map((m) => (
                <SelectItem key={m} value={m}>{m}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <Label className="text-xs text-muted-foreground">Temperature</Label>
            <span className="text-xs font-mono text-foreground">{temperature.toFixed(1)}</span>
          </div>
          <Slider
            value={[temperature]}
            onValueChange={([v]) => setTemperature(v)}
            min={0}
            max={2}
            step={0.1}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Precise (0)</span><span>Creative (2)</span>
          </div>
        </div>
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <Label className="text-xs text-muted-foreground">Max Tokens</Label>
            <span className="text-xs font-mono text-foreground">{maxTokens}</span>
          </div>
          <Input
            type="number"
            min={1}
            max={32768}
            value={maxTokens}
            onChange={(e) => setMaxTokens(Math.min(32768, Math.max(1, Number(e.target.value) || 1)))}
            className="h-8 text-sm"
          />
        </div>
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <Label className="text-xs text-muted-foreground">Top P</Label>
            <span className="text-xs font-mono text-foreground">{topP.toFixed(2)}</span>
          </div>
          <Slider
            value={[topP]}
            onValueChange={([v]) => setTopP(v)}
            min={0}
            max={1}
            step={0.01}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Focused (0)</span><span>Diverse (1)</span>
          </div>
        </div>
      </div>
    );
  }

  if (modality === "image") {
    return (
      <div className="space-y-4 p-4 bg-secondary/50 rounded-lg border border-border">
        <h3 className="text-sm font-medium text-foreground">Image Parameters</h3>
        <StaticModelSelector modality="image" />
        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground">Style</Label>
          <Select defaultValue="natural">
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="natural">Natural</SelectItem>
              <SelectItem value="artistic">Artistic</SelectItem>
              <SelectItem value="photorealistic">Photorealistic</SelectItem>
              <SelectItem value="anime">Anime</SelectItem>
              <SelectItem value="3d">3D Render</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground">Aspect Ratio</Label>
          <Select defaultValue="1:1">
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="1:1">1:1 Square</SelectItem>
              <SelectItem value="16:9">16:9 Landscape</SelectItem>
              <SelectItem value="9:16">9:16 Portrait</SelectItem>
              <SelectItem value="4:3">4:3 Standard</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    );
  }

  if (modality === "video") {
    return (
      <div className="space-y-4 p-4 bg-secondary/50 rounded-lg border border-border">
        <h3 className="text-sm font-medium text-foreground">Video Parameters</h3>
        <StaticModelSelector modality="video" />
        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground">Duration</Label>
          <Select defaultValue="5">
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="5">5 seconds</SelectItem>
              <SelectItem value="10">10 seconds</SelectItem>
              <SelectItem value="15">15 seconds</SelectItem>
              <SelectItem value="30">30 seconds</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground">Aspect Ratio</Label>
          <Select defaultValue="16:9">
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="16:9">16:9 Landscape</SelectItem>
              <SelectItem value="9:16">9:16 Portrait</SelectItem>
              <SelectItem value="1:1">1:1 Square</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    );
  }

  // audio
  return (
    <div className="space-y-4 p-4 bg-secondary/50 rounded-lg border border-border">
      <h3 className="text-sm font-medium text-foreground">Audio Parameters</h3>
      <StaticModelSelector modality="audio" />
      <div className="space-y-2">
        <Label className="text-xs text-muted-foreground">Voice</Label>
        <Select defaultValue="female">
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="female">Female</SelectItem>
            <SelectItem value="male">Male</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label className="text-xs text-muted-foreground">Speed</Label>
        <Slider defaultValue={[1]} min={0.5} max={2} step={0.1} className="w-full" />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>0.5x</span><span>2x</span>
        </div>
      </div>
    </div>
  );
};

export default ModalityParams;
