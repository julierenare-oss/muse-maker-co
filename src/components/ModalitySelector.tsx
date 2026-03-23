import { Type, Image, Video, AudioLines } from "lucide-react";
import { cn } from "@/lib/utils";

export type Modality = "text" | "image" | "video" | "audio";

interface ModalitySelectorProps {
  value: Modality;
  onChange: (m: Modality) => void;
}

const modalities: { id: Modality; label: string; icon: typeof Type }[] = [
  { id: "text", label: "Text", icon: Type },
  { id: "image", label: "Image", icon: Image },
  { id: "video", label: "Video", icon: Video },
  { id: "audio", label: "Audio", icon: AudioLines },
];

const ModalitySelector = ({ value, onChange }: ModalitySelectorProps) => {
  return (
    <div className="flex gap-1 p-1 bg-secondary rounded-lg">
      {modalities.map((m) => {
        const Icon = m.icon;
        const active = value === m.id;
        return (
          <button
            key={m.id}
            onClick={() => onChange(m.id)}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all",
              active
                ? "bg-primary text-primary-foreground shadow-md"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Icon className="h-4 w-4" />
            {m.label}
          </button>
        );
      })}
    </div>
  );
};

export default ModalitySelector;
