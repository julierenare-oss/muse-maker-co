import { useState } from "react";
import { Copy, Check, User, Bot, Paperclip } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { cn } from "@/lib/utils";
import { CodeBlock, InlineCode } from "./CodeBlock";
import type { ChatMessage } from "@/lib/chatStore";

interface ChatBubbleProps {
  message: ChatMessage;
  isLast: boolean;
  isGenerating: boolean;
}

const isImageUrl = (url: string) => /\.(jpg|jpeg|png|gif|webp|bmp|svg)/i.test(url.split("?")[0]);
const isVideoUrl = (url: string) => /\.(mp4|webm|mov|avi)/i.test(url.split("?")[0]);

const AttachmentRenderer = ({ urls }: { urls: string[] }) => (
  <div className="flex flex-wrap gap-2 mt-2">
    {urls.map((url, i) => {
      if (isVideoUrl(url)) {
        return (
          <video
            key={i}
            src={url}
            controls
            className="max-w-[320px] rounded-lg border border-border"
          />
        );
      }
      if (isImageUrl(url)) {
        return (
          <a key={i} href={url} target="_blank" rel="noopener noreferrer"
            className="block rounded-lg overflow-hidden border border-border hover:opacity-80 transition-opacity">
            <img src={url} alt={`Attachment ${i + 1}`} className="max-w-[240px] max-h-[200px] object-cover" />
          </a>
        );
      }
      return (
        <a key={i} href={url} target="_blank" rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-secondary rounded-lg text-xs text-muted-foreground hover:text-foreground border border-border">
          <Paperclip className="h-3 w-3" />
          Attachment {i + 1}
        </a>
      );
    })}
  </div>
);

const ChatBubble = ({ message, isLast, isGenerating }: ChatBubbleProps) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const attachments = message.attachments?.filter(
    (u): u is string => typeof u === "string" && u.length > 0
  );

  return (
    <div
      className={cn(
        "flex gap-3 group/msg",
        message.role === "user" ? "justify-end" : "justify-start"
      )}
    >
      {message.role === "assistant" && (
        <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center shrink-0 mt-1">
          <Bot className="h-4 w-4 text-primary" />
        </div>
      )}

      <div className="relative max-w-[75%]">
        <div
          className={cn(
            "rounded-xl px-4 py-3 text-sm",
            message.role === "user"
              ? "bg-primary text-primary-foreground whitespace-pre-wrap"
              : "bg-secondary text-foreground border border-border prose prose-sm prose-invert max-w-none prose-p:my-1 prose-pre:!bg-transparent prose-pre:!border-0 prose-pre:!p-0 prose-code:text-primary prose-headings:text-foreground prose-strong:text-foreground prose-a:text-primary"
          )}
        >
          {message.role === "assistant" ? (
            <>
              {message.content && (
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    code({ className, children, ...props }) {
                      const isBlock = /language-/.test(className || "") || String(children).includes("\n");
                      if (isBlock) {
                        return <CodeBlock className={className}>{children}</CodeBlock>;
                      }
                      return <InlineCode>{children}</InlineCode>;
                    },
                    pre({ children }) {
                      return <>{children}</>;
                    },
                  }}
                >
                  {message.content}
                </ReactMarkdown>
              )}
              {attachments && attachments.length > 0 && (
                <AttachmentRenderer urls={attachments} />
              )}
              {isLast && isGenerating && (
                <span className="inline-block w-2 h-4 ml-1 bg-primary/60 animate-pulse rounded-sm" />
              )}
            </>
          ) : (
            <>
              {attachments && attachments.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-2">
                  {attachments.map((url, ai) => {
                    const isImg = isImageUrl(url);
                    return (
                      <a key={ai} href={url} target="_blank" rel="noopener noreferrer"
                        className="block rounded-lg overflow-hidden border border-primary-foreground/20 hover:opacity-80 transition-opacity">
                        {isImg ? (
                          <img src={url} alt={`Attachment ${ai + 1}`} className="max-w-[160px] max-h-[120px] object-cover" />
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary-foreground/20 text-xs">
                            <Paperclip className="h-3 w-3" />
                            Attachment {ai + 1}
                          </span>
                        )}
                      </a>
                    );
                  })}
                </div>
              )}
              {message.content}
            </>
          )}
        </div>

        {/* Copy button on hover */}
        <button
          onClick={handleCopy}
          className={cn(
            "absolute -bottom-3 opacity-0 group-hover/msg:opacity-100 transition-opacity",
            "flex items-center gap-1 px-2 py-0.5 rounded-md bg-muted border border-border text-xs text-muted-foreground hover:text-foreground",
            message.role === "user" ? "right-2" : "left-2"
          )}
        >
          {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>

      {message.role === "user" && (
        <div className="w-8 h-8 rounded-lg bg-accent/20 flex items-center justify-center shrink-0 mt-1">
          <User className="h-4 w-4 text-accent" />
        </div>
      )}
    </div>
  );
};

export default ChatBubble;
