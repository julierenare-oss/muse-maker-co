import { useState, useRef, useEffect, useCallback } from "react";
import { Send, Square, Paperclip, X, User, Bot } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import ModalitySelector, { type Modality } from "@/components/ModalitySelector";
import ModalityParams from "@/components/ModalityParams";
import { fetchModels, sendMessage } from "@/lib/api";

const MAX_CHARS = 2000;

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

const GenerationPage = () => {
  const [modality, setModality] = useState<Modality>("text");
  const [prompt, setPrompt] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [conversationId, setConversationId] = useState<string>(crypto.randomUUID());
  const [models, setModels] = useState<string[]>([]);
  const [selectedModel, setSelectedModel] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchModels().then((m) => {
      setModels(m);
      if (m.length > 0) setSelectedModel(m[0]);
    });
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = useCallback(() => {
    if (!prompt.trim() || isGenerating || modality !== "text") return;

    const userMessage: ChatMessage = { role: "user", content: prompt.trim() };
    setMessages((prev) => [...prev, userMessage]);
    setPrompt("");
    setIsGenerating(true);

    const assistantMessage: ChatMessage = { role: "assistant", content: "" };
    setMessages((prev) => [...prev, assistantMessage]);

    const controller = new AbortController();
    abortRef.current = controller;

    let accumulated = "";

    sendMessage(
      userMessage.content,
      selectedModel,
      conversationId,
      (token) => {
        accumulated += (accumulated ? " " : "") + token;
        const current = accumulated;
        setMessages((prev) => {
          const updated = [...prev];
          updated[updated.length - 1] = { role: "assistant", content: current };
          return updated;
        });
      },
      () => {
        setIsGenerating(false);
        abortRef.current = null;
      },
      controller.signal
    ).catch(() => {
      setIsGenerating(false);
      abortRef.current = null;
    });
  }, [prompt, isGenerating, modality, selectedModel, conversationId]);

  const handleStop = () => {
    abortRef.current?.abort();
    setIsGenerating(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles((prev) => [...prev, ...Array.from(e.target.files!)]);
    }
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  // Called from history to load a conversation
  const loadConversation = (id: string, msgs: ChatMessage[]) => {
    setConversationId(id);
    setMessages(msgs);
  };

  // Expose for sidebar/history usage
  (window as any).__loadConversation = loadConversation;
  (window as any).__newConversation = () => {
    setConversationId(crypto.randomUUID());
    setMessages([]);
  };

  return (
    <div className="flex h-full">
      {/* Main content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="border-b border-primary/20 px-6 py-4 flex items-center justify-between gap-4">
          <div className="min-w-0">
            <h1 className="text-xl font-semibold text-foreground">New Request</h1>
            <p className="text-sm text-muted-foreground">Select modality and describe what you need</p>
          </div>
            <ModalitySelector value={modality} onChange={setModality} />
        </header>

        {/* Chat area */}
        <div className="flex-1 overflow-hidden">
          {modality === "video" ? (
            <div className="h-full flex items-center justify-center p-8">
              <div className="text-center max-w-md animate-slide-up">
                <div className="w-20 h-20 mx-auto mb-5 rounded-2xl bg-accent/10 border border-accent/30 flex items-center justify-center">
                  <span className="text-3xl">🎬</span>
                </div>
                <h2 className="text-2xl font-bold gradient-text mb-3">Coming Soon</h2>
                <p className="text-sm text-muted-foreground">
                  Video generation is currently in development. Stay tuned — this feature will be available soon!
                </p>
              </div>
            </div>
          ) : modality === "text" && messages.length > 0 ? (
            <ScrollArea className="h-full">
              <div className="max-w-3xl mx-auto p-6 space-y-4">
                {messages.map((msg, i) => (
                  <div
                    key={i}
                    className={cn(
                      "flex gap-3",
                      msg.role === "user" ? "justify-end" : "justify-start"
                    )}
                  >
                    {msg.role === "assistant" && (
                      <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center shrink-0 mt-1">
                        <Bot className="h-4 w-4 text-primary" />
                      </div>
                    )}
                    <div
                      className={cn(
                        "max-w-[75%] rounded-xl px-4 py-3 text-sm whitespace-pre-wrap",
                        msg.role === "user"
                          ? "bg-primary text-primary-foreground"
                          : "bg-secondary text-foreground border border-border"
                      )}
                    >
                      {msg.content}
                      {msg.role === "assistant" && i === messages.length - 1 && isGenerating && (
                        <span className="inline-block w-2 h-4 ml-1 bg-primary/60 animate-pulse rounded-sm" />
                      )}
                    </div>
                    {msg.role === "user" && (
                      <div className="w-8 h-8 rounded-lg bg-accent/20 flex items-center justify-center shrink-0 mt-1">
                        <User className="h-4 w-4 text-accent" />
                      </div>
                    )}
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>
          ) : (
            <div className="h-full flex items-center justify-center p-8">
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
                accept={modality === "text" ? ".pdf,.xlsx,.xls,.doc,.docx" : undefined}
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
                  onClick={handleStop}
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
        <ModalityParams modality={modality} selectedModel={selectedModel} onModelChange={setSelectedModel} />
      </aside>
    </div>
  );
};

export default GenerationPage;
