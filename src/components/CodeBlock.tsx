import { useState } from "react";
import { Check, Copy } from "lucide-react";

interface CodeBlockProps {
  className?: string;
  children?: React.ReactNode;
}

export const CodeBlock = ({ className, children }: CodeBlockProps) => {
  const [copied, setCopied] = useState(false);
  const match = /language-(\w+)/.exec(className || "");
  const lang = match ? match[1] : "";
  const code = String(children).replace(/\n$/, "");

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative group/code my-3 rounded-lg overflow-hidden border border-border bg-background">
      <div className="flex items-center justify-between px-3 py-1.5 bg-muted/50 border-b border-border text-xs text-muted-foreground">
        <span className="font-mono">{lang || "code"}</span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1 hover:text-foreground transition-colors"
        >
          {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <pre className="!m-0 !border-0 !bg-transparent p-3 overflow-x-auto">
        <code className={`${className || ""} text-xs font-mono`}>{children}</code>
      </pre>
    </div>
  );
};

export const InlineCode = ({ children }: { children?: React.ReactNode }) => (
  <code className="px-1.5 py-0.5 rounded bg-muted text-primary text-xs font-mono">{children}</code>
);
