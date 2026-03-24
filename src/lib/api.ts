const API_BASE = "https://kafkatestdomen.site/api/v1";
const API_TOKEN = "Admin123";

const headers = {
  accept: "application/json",
  "X-Token": API_TOKEN,
};

export async function fetchModels(): Promise<string[]> {
  const res = await fetch(`${API_BASE}/models`, { headers });
  const json = await res.json();
  return json.data;
}

export async function fetchConversations(): Promise<
  { uuid: string; title: string }[]
> {
  const res = await fetch(`${API_BASE}/conversations`, { headers });
  const json = await res.json();
  return json.data;
}

export async function fetchConversationMessages(
  conversationId: string
): Promise<{ role: string; content: string }[]> {
  const res = await fetch(`${API_BASE}/conversations/${conversationId}`, {
    headers,
  });
  const json = await res.json();
  return json.data;
}

function parseSSELine(line: string): { token: string | null; done: boolean } {
  const trimmed = line.trim();
  if (!trimmed.startsWith("data:")) return { token: null, done: false };

  const raw = trimmed.slice(5).trim();

  if (raw === "[DONE]") return { token: null, done: true };

  // Try parsing as JSON first (in case server sends JSON payloads)
  try {
    const parsed = JSON.parse(raw);
    if (typeof parsed === "string") return { token: parsed, done: false };
    if (parsed && typeof parsed.text === "string") return { token: parsed.text, done: false };
    if (parsed && typeof parsed.content === "string") return { token: parsed.content, done: false };
  } catch {
    // Not JSON — treat as plain text token
  }

  // Clean any control characters and return raw text
  const cleaned = raw.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "");
  return { token: cleaned, done: false };
}

export async function sendMessage(
  message: string,
  model: string,
  conversationId: string,
  onToken: (token: string) => void,
  onDone: () => void,
  signal?: AbortSignal
) {
  const res = await fetch(`${API_BASE}/conversations`, {
    method: "POST",
    headers: { ...headers, "Content-Type": "application/json" },
    body: JSON.stringify({ message, model, conversation_id: conversationId }),
    signal,
  });

  const reader = res.body?.getReader();
  if (!reader) return;

  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() || "";

    for (const line of lines) {
      const { token, done: streamDone } = parseSSELine(line);
      if (streamDone) {
        onDone();
        return;
      }
      if (token) {
        onToken(token);
      }
    }
  }
  onDone();
}
