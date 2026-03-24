import { useState, useRef } from "react";
import { Send, Square, Paperclip, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import ModalitySelector, { type Modality } from "@/components/ModalitySelector";
import ModalityParams from "@/components/ModalityParams";

const MAX_CHARS = 2000;

const GenerationPage = () => {
  const [modality, setModality] = useState<Modality>("text");
  const [prompt, setPrompt] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSend = () => {
    if (!prompt.trim()) return;
    setIsGenerating(true);
    // TODO: connect to backend
    setTimeout(() => setIsGenerating(false), 3000);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles((prev) => [...prev, ...Array.from(e.target.files!)]);
    }
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="flex h-full">
      {/* Main content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="border-b border-primary/20 px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-foreground">New Request</h1>
            <p className="text-sm text-muted-foreground">Select modality and describe what you need</p>
          </div>
          <ModalitySelector value={modality} onChange={setModality} />
        </header>

        {/* Chat area - empty state */}
        <div className="flex-1 flex items-center justify-center p-8">
          {modality === "video" ? (
            <div className="text-center max-w-md animate-slide-up">
              <div className="w-20 h-20 mx-auto mb-5 rounded-2xl bg-accent/10 border border-accent/30 flex items-center justify-center">
                <span className="text-3xl">🎬</span>
              </div>
              <h2 className="text-2xl font-bold gradient-text mb-3">Coming Soon</h2>
              <p className="text-sm text-muted-foreground">
                Video generation is currently in development. Stay tuned — this feature will be available soon!
              </p>
            </div>
          ) : (
            <div className="text-center max-w-md animate-slide-up">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-primary/10 flex items-center justify-center">
                <span className="text-2xl">✦</span>
              </div>
              <h2 className="text-lg font-semibold text-foreground mb-2">
                What would you like to generate?
              </h2>
              <p className="text-sm text-muted-foreground">
                Choose a modality above, set your parameters, and describe your request in detail below.
              </p>
            </div>
          )}
        </div>

        {/* Input area */}
        <div className={cn("border-t border-primary/20 p-4", modality === "video" && "opacity-40 pointer-events-none")}>
          {/* File chips */}
          {files.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
              {files.map((file, i) => (
                <span
                  key={i}
                  className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-secondary text-sm text-secondary-foreground"
                >
                  {file.name}
                  <button onClick={() => removeFile(i)} className="hover:text-destructive">
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
          )}

          <div className="flex gap-3 items-end">
            <div className="flex-1 relative">
              <Textarea
                placeholder={
                  modality === "text"
                    ? "Describe what text you'd like to generate..."
                    : modality === "image"
                    ? "Describe the image you want to create..."
                    : modality === "video"
                    ? "Describe your video concept in detail..."
                    : "Enter the text you'd like converted to speech..."
                }
                value={prompt}
                onChange={(e) => setPrompt(e.target.value.slice(0, MAX_CHARS))}
                className="min-h-[100px] max-h-[300px] resize-none bg-secondary border-border pr-16"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
              />
              <span className="absolute bottom-2 right-2 text-xs text-muted-foreground">
                {prompt.length}/{MAX_CHARS}
              </span>
            </div>

            <div className="flex flex-col gap-2">
              <input
                ref={fileInputRef}
                type="file"
                multiple
                className="hidden"
                onChange={handleFileChange}
                accept={
                  modality === "text"
                    ? ".pdf,.xlsx,.xls,.doc,.docx"
                    : undefined
                }
              />
              <Button
                variant="outline"
                size="icon"
                onClick={() => fileInputRef.current?.click()}
                title="Attach files"
              >
                <Paperclip className="h-4 w-4" />
              </Button>
              {isGenerating ? (
                <Button
                  variant="destructive"
                  size="icon"
                  onClick={() => setIsGenerating(false)}
                  title="Stop generation"
                >
                  <Square className="h-4 w-4" />
                </Button>
              ) : (
                <Button
                  variant="glow"
                  size="icon"
                  onClick={handleSend}
                  disabled={!prompt.trim()}
                  title="Send"
                >
                  <Send className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Parameters sidebar */}
      <aside className="w-72 border-l border-primary/20 p-4 overflow-y-auto hidden lg:block">
        <ModalityParams modality={modality} />
      </aside>
    </div>
  );
};

export default GenerationPage;
