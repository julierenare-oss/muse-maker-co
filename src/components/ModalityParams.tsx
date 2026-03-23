import type { Modality } from "./ModalitySelector";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface ModalityParamsProps {
  modality: Modality;
}

const modelsByModality: Record<Modality, { value: string; label: string }[]> = {
  text: [
    { value: "gpt-5", label: "GPT-5" },
    { value: "gpt-5-mini", label: "GPT-5 Mini" },
    { value: "gemini-2.5-pro", label: "Gemini 2.5 Pro" },
    { value: "gemini-2.5-flash", label: "Gemini 2.5 Flash" },
    { value: "claude-4-sonnet", label: "Claude 4 Sonnet" },
    { value: "deepseek-v3", label: "DeepSeek V3" },
    { value: "llama-4", label: "Llama 4" },
  ],
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

const ModelSelector = ({ modality }: { modality: Modality }) => {
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

const ModalityParams = ({ modality }: ModalityParamsProps) => {
  if (modality === "text") {
    return (
      <div className="space-y-4 p-4 bg-secondary/50 rounded-lg border border-border">
        <h3 className="text-sm font-medium text-foreground">Text Parameters</h3>
        <ModelSelector modality={modality} />
        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground">Temperature</Label>
          <Slider defaultValue={[0.7]} max={2} step={0.1} className="w-full" />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Precise (0)</span><span>Creative (2)</span>
          </div>
        </div>
        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground">Max Tokens</Label>
          <Select defaultValue="4096">
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="1024">1,024</SelectItem>
              <SelectItem value="2048">2,048</SelectItem>
              <SelectItem value="4096">4,096</SelectItem>
              <SelectItem value="8192">8,192</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    );
  }

  if (modality === "image") {
    return (
      <div className="space-y-4 p-4 bg-secondary/50 rounded-lg border border-border">
        <h3 className="text-sm font-medium text-foreground">Image Parameters</h3>
        <ModelSelector modality={modality} />
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
        <ModelSelector modality={modality} />
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
      <ModelSelector modality={modality} />
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
