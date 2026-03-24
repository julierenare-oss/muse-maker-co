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
      const trimmed = line.trim();
      if (!trimmed.startsWith("data:")) continue;
      const data = trimmed.slice(5).trim();
      if (data === "[DONE]") {
        onDone();
        return;
      }
      onToken(data);
    }
  }
  onDone();
}
