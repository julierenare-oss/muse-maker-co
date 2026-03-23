import type { Modality } from "./ModalitySelector";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface ModalityParamsProps {
  modality: Modality;
}

const ModalityParams = ({ modality }: ModalityParamsProps) => {
  if (modality === "text") {
    return (
      <div className="space-y-4 p-4 bg-secondary/50 rounded-lg border border-border">
        <h3 className="text-sm font-medium text-foreground">Text Parameters</h3>
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
