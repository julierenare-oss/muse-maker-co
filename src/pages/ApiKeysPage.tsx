import { useState } from "react";
import { Plus, Copy, Eye, EyeOff, Trash2, Key, Construction } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface ApiKey {
  id: string;
  name: string;
  key: string;
  created: string;
  lastUsed: string;
}

const mockKeys: ApiKey[] = [
  { id: "1", name: "Production", key: "nxg_prod_sk_1a2b3c4d5e6f7g8h9i0j", created: "2026-03-01", lastUsed: "2026-03-23" },
  { id: "2", name: "Development", key: "nxg_dev_sk_9z8y7x6w5v4u3t2s1r0q", created: "2026-03-10", lastUsed: "2026-03-22" },
];

const ApiKeysPage = () => {
  const [showKey, setShowKey] = useState<Record<string, boolean>>({});

  const toggleShow = (id: string) => setShowKey((prev) => ({ ...prev, [id]: !prev[id] }));

  const maskKey = (key: string) => key.slice(0, 12) + "••••••••••••";

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-foreground">API Keys</h1>
          <p className="text-sm text-muted-foreground">Manage API keys for direct integration</p>
        </div>
        <Button variant="glow">
          <Plus className="h-4 w-4 mr-1" />
          Create Key
        </Button>
      </div>

      <div className="bg-card border border-border rounded-xl p-5">
        <p className="text-sm text-muted-foreground mb-4">
          Use these keys to access the API directly without the web interface. See the{" "}
          <span className="text-primary cursor-pointer hover:underline">documentation</span> for integration details.
        </p>
        <div className="text-xs font-mono text-muted-foreground bg-secondary rounded-lg p-3">
          Base URL: https://api.nexagen.ai/v1
        </div>
      </div>

      <div className="space-y-3">
        {mockKeys.map((apiKey) => (
          <div
            key={apiKey.id}
            className="bg-card border border-border rounded-xl p-4 group"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <Key className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground">{apiKey.name}</p>
                <div className="flex items-center gap-2 mt-1">
                  <code className="text-xs font-mono text-muted-foreground">
                    {showKey[apiKey.id] ? apiKey.key : maskKey(apiKey.key)}
                  </code>
                  <button onClick={() => toggleShow(apiKey.id)} className="text-muted-foreground hover:text-foreground">
                    {showKey[apiKey.id] ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                  </button>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Created {apiKey.created} · Last used {apiKey.lastUsed}
                </p>
              </div>
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button variant="ghost" size="icon"><Copy className="h-4 w-4" /></Button>
                <Button variant="ghost" size="icon" className="text-destructive"><Trash2 className="h-4 w-4" /></Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ApiKeysPage;
