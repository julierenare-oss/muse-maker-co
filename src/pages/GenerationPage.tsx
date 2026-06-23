import { useState, useRef, useEffect, useCallback } from "react";
import { Send, Square, Paperclip, X, Loader2 } from "lucide-react";
import ChatBubble from "@/components/ChatBubble";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import ModalitySelector from "@/components/ModalitySelector";
import ModalityParams from "@/components/ModalityParams";
import FilesPanel from "@/components/FilesPanel";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { sendTextMessage, sendImageMessage, sendVideoMessage, uploadFile } from "@/lib/api";
import { useChatStore, type ChatModality } from "@/lib/chatStore";
import { useChatParams } from "@/lib/chatParams";

const MAX_CHARS = 2000;

const GenerationPage = () => {
  const { modality, messages, conversationId, setMessages, setModality, newConversation } = useChatStore();
  const [prompt, setPrompt] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [uploadedUrls, setUploadedUrls] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStatus, setGenerationStatus] = useState<string | null>(null);
  const [selectedModel, setSelectedModel] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const params = useChatParams();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleModalityChange = (m: ChatModality) => {
    if (m !== modality) {
      setModality(m);
      newConversation();
      setSelectedModel("");
    }
  };

  const handleSend = useCallback(() => {
    if (!prompt.trim() || isGenerating) return;

    const currentAttachments = [...uploadedUrls];
    const userMessage = {
      role: "user" as const,
      content: prompt.trim(),
      ...(currentAttachments.length > 0 ? { attachments: currentAttachments } : {}),
    };
    setMessages((prev) => [...prev, userMessage]);
    setPrompt("");
    setIsGenerating(true);
    setGenerationStatus(null);
    setUploadedUrls([]);
    setFiles([]);

    setMessages((prev) => [...prev, { role: "assistant" as const, content: "" }]);

    const controller = new AbortController();
    abortRef.current = controller;

    const onError = () => {
      setIsGenerating(false);
      setGenerationStatus(null);
      abortRef.current = null;
      setMessages((prev) => {
        const updated = [...prev];
        updated[updated.length - 1] = {
          role: "assistant",
          content: "❌ Something went wrong. Please try again.",
        };
        return updated;
      });
    };

    if (modality === "text") {
      let accumulated = "";
      sendTextMessage(
        userMessage.content,
        selectedModel,
        conversationId,
        {
          onToken: (token) => {
            accumulated += token;
            const current = accumulated;
            setMessages((prev) => {
              const updated = [...prev];
              updated[updated.length - 1] = { role: "assistant", content: current };
              return updated;
            });
          },
          onDone: (attachments) => {
            setIsGenerating(false);
            abortRef.current = null;
            if (attachments) {
              setMessages((prev) => {
                const updated = [...prev];
                const last = updated[updated.length - 1];
                updated[updated.length - 1] = { ...last, attachments };
                return updated;
              });
            }
          },
        },
        controller.signal,
        currentAttachments,
        { temperature: params.temperature, max_tokens: params.maxTokens }
      ).catch(onError);
    } else if (modality === "image") {
      sendImageMessage(
        userMessage.content,
        selectedModel,
        conversationId,
        {
          onToken: () => {},
          onDone: (attachments) => {
            setIsGenerating(false);
            setGenerationStatus(null);
            abortRef.current = null;
            setMessages((prev) => {
              const updated = [...prev];
              updated[updated.length - 1] = {
                role: "assistant",
                content: "",
                ...(attachments ? { attachments } : {}),
              };
              return updated;
            });
          },
          onStatus: (status) => setGenerationStatus(status),
        },
        controller.signal,
        { n: params.imageN, size: params.imageSize, quality: params.imageQuality }
      ).catch(onError);
    } else if (modality === "video") {
      sendVideoMessage(
        userMessage.content,
        selectedModel,
        conversationId,
        {
          onToken: () => {},
          onDone: (attachments) => {
            setIsGenerating(false);
            setGenerationStatus(null);
            abortRef.current = null;
            setMessages((prev) => {
              const updated = [...prev];
              updated[updated.length - 1] = {
                role: "assistant",
                content: "",
                ...(attachments ? { attachments } : {}),
              };
              return updated;
            });
          },
          onStatus: (status) => setGenerationStatus(status),
        },
        controller.signal,
        { size: params.videoSize, seconds: params.videoSeconds }
      ).catch(onError);
    }
  }, [prompt, isGenerating, modality, selectedModel, conversationId, setMessages, uploadedUrls, params]);

  const handleStop = () => {
    abortRef.current?.abort();
    setIsGenerating(false);
    setGenerationStatus(null);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const newFiles = Array.from(e.target.files);
    setFiles((prev) => [...prev, ...newFiles]);
    setUploading(true);

    try {
      for (const file of newFiles) {
        const result = await uploadFile(file);
        setUploadedUrls((prev) => [...prev, result.url]);
      }
    } catch (err) {
      console.error("Upload failed:", err);
    } finally {
      setUploading(false);
    }
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
    setUploadedUrls((prev) => prev.filter((_, i) => i !== index));
  };

  const hasMessages = messages.length > 0;

  return (
    <div className="flex h-full">
      <div className="flex-1 flex flex-col">
        <header className="border-b border-primary/20 px-6 py-4 flex items-center justify-between gap-4">
          <div className="min-w-0">
            <h1 className="text-xl font-semibold text-foreground">New Request</h1>
            <p className="text-sm text-muted-foreground">Select modality and describe what you need</p>
          </div>
          <ModalitySelector value={modality} onChange={handleModalityChange} />
        </header>

        <div className="flex-1 overflow-hidden">
          {hasMessages ? (
            <ScrollArea className="h-full">
              <div className="max-w-3xl mx-auto p-6 space-y-4">
                {messages.map((msg, i) => (
                  <ChatBubble
                    key={i}
                    message={msg}
                    isLast={i === messages.length - 1}
                    isGenerating={isGenerating}
                  />
                ))}
                {/* Generation status indicator for image/video */}
                {isGenerating && generationStatus && (
                  <div className="flex items-center gap-3 justify-start">
                    <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center shrink-0">
                      <Loader2 className="h-4 w-4 text-primary animate-spin" />
                    </div>
                    <div className="rounded-xl px-4 py-3 text-sm bg-secondary text-muted-foreground border border-border">
                      {generationStatus}
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>
          ) : (
            <div className="h-full flex items-center justify-center p-8">
              <div className="text-center max-w-md animate-slide-up">
                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-primary/10 flex items-center justify-center">
                  <span className="text-2xl">
                    {modality === "text" ? "✦" : modality === "image" ? "🎨" : "🎬"}
                  </span>
                </div>
                <h2 className="text-lg font-semibold text-foreground mb-2">
                  {modality === "text"
                    ? "What would you like to generate?"
                    : modality === "image"
                    ? "Describe the image you want"
                    : "Describe the video you want"}
                </h2>
                <p className="text-sm text-muted-foreground">
                  Set your parameters on the right and describe your request below.
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="border-t border-primary/20 p-4">
          {files.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
              {files.map((file, i) => (
                <span
                  key={i}
                  className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-secondary text-sm text-secondary-foreground"
                >
                  {file.name}
                  {uploading && i >= uploadedUrls.length && (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  )}
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
                    : "Describe your video concept in detail..."
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
              {modality === "text" && (
                <>
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    className="hidden"
                    onChange={handleFileChange}
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => fileInputRef.current?.click()}
                    title="Attach files"
                    disabled={uploading}
                  >
                    {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Paperclip className="h-4 w-4" />}
                  </Button>
                </>
              )}
              {isGenerating ? (
                <Button variant="destructive" size="icon" onClick={handleStop} title="Stop generation">
                  <Square className="h-4 w-4" />
                </Button>
              ) : (
                <Button variant="glow" size="icon" onClick={handleSend} disabled={!prompt.trim()} title="Send">
                  <Send className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      <aside className="w-72 border-l border-primary/20 overflow-hidden hidden lg:flex flex-col">
        <Tabs defaultValue="params" className="flex-1 flex flex-col">
          <TabsList className="m-3 grid grid-cols-2">
            <TabsTrigger value="params">Параметры</TabsTrigger>
            <TabsTrigger value="files">
              Файлы
              {(() => {
                const n = messages.reduce((a, m) => a + (m.attachments?.length || 0), 0);
                return n > 0 ? <span className="ml-1.5 text-[10px] opacity-70">{n}</span> : null;
              })()}
            </TabsTrigger>
          </TabsList>
          <TabsContent value="params" className="flex-1 overflow-y-auto px-4 pb-4 mt-0">
            <ModalityParams modality={modality} selectedModel={selectedModel} onModelChange={setSelectedModel} />
          </TabsContent>
          <TabsContent value="files" className="flex-1 overflow-y-auto px-3 pb-4 mt-0">
            <FilesPanel messages={messages} dense />
          </TabsContent>
        </Tabs>
      </aside>
    </div>
  );
};

export default GenerationPage;
