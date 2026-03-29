import { useAuthStore } from "./auth";

const API_BASE = "https://kafkatestdomen.site/api/v1";
const PROJECT_ID = "1";

function getHeaders(): Record<string, string> {
  const token = useAuthStore.getState().token;
  return {
    accept: "application/json",
    "X-Project-ID": PROJECT_ID,
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export async function login(username: string, password: string): Promise<string> {
  const body = new URLSearchParams({
    grant_type: "password",
    username,
    password,
    scope: "",
    client_id: "string",
    client_secret: "string",
  });

  const res = await fetch(`${API_BASE}/token`, {
    method: "POST",
    headers: {
      accept: "application/json",
      "Content-Type": "application/x-www-form-urlencoded",
      "X-Project-ID": PROJECT_ID,
    },
    body,
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(err || "Login failed");
  }

  const json = await res.json();
  return json.access_token;
}

export async function uploadFile(file: File): Promise<{ key: string; url: string; filename: string; content_type: string }> {
  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch(`${API_BASE}/upload`, {
    method: "POST",
    headers: {
      "X-Project-ID": PROJECT_ID,
      ...(useAuthStore.getState().token ? { Authorization: `Bearer ${useAuthStore.getState().token}` } : {}),
    },
    body: formData,
  });

  if (!res.ok) throw new Error("Upload failed");
  const json = await res.json();
  return json.data;
}

export async function fetchModels(): Promise<string[]> {
  const res = await fetch(`${API_BASE}/models`, { headers: getHeaders() });
  const json = await res.json();
  return json.data;
}

export async function fetchConversations(): Promise<{ uuid: string; title: string }[]> {
  const res = await fetch(`${API_BASE}/conversations`, { headers: getHeaders() });
  const json = await res.json();
  return json.data;
}

export async function fetchConversationMessages(
  conversationId: string
): Promise<{ role: string; content: string; attachments?: string[] }[]> {
  const res = await fetch(`${API_BASE}/conversations/${conversationId}`, {
    headers: getHeaders(),
  });
  const json = await res.json();
  return (json.data || []).map((msg: any) => ({
    role: msg.role,
    content: msg.content,
    ...(msg.attachments?.length ? {
      attachments: msg.attachments.map((a: any) => typeof a === 'string' ? a : a?.url).filter(Boolean)
    } : {}),
  }));
}

function parseSSELine(line: string): { token: string | null; done: boolean } {
  const trimmed = line.trim();
  if (!trimmed.startsWith("data:")) return { token: null, done: false };

  const raw = trimmed.slice(5).trim();
  if (raw === "[DONE]") return { token: null, done: true };

  try {
    const parsed = JSON.parse(raw);
    if (typeof parsed === "string") return { token: parsed, done: false };
    if (parsed && typeof parsed.text === "string") return { token: parsed.text, done: false };
    if (parsed && typeof parsed.content === "string") return { token: parsed.content, done: false };
  } catch {
    // plain text
  }

  const cleaned = raw.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "");
  return { token: cleaned, done: false };
}

export interface ChatParams {
  temperature: number;
  max_tokens: number;
  top_p: number;
}

export async function getUserProfile(): Promise<{ occupation: string; bio: string }> {
  const res = await fetch(`${API_BASE}/user_profile`, { headers: getHeaders() });
  if (!res.ok) throw new Error("Failed to fetch profile");
  const json = await res.json();
  return json.data;
}

export async function updateUserProfile(occupation: string, bio: string): Promise<void> {
  const res = await fetch(`${API_BASE}/user_profile`, {
    method: "POST",
    headers: { ...getHeaders(), "Content-Type": "application/json" },
    body: JSON.stringify({ occupation, bio }),
  });
  if (!res.ok) throw new Error("Failed to update profile");
}

export async function sendMessage(
  message: string,
  model: string,
  conversationId: string,
  onToken: (token: string) => void,
  onDone: () => void,
  signal?: AbortSignal,
  attachments?: string[],
  params?: ChatParams
) {
  const res = await fetch(`${API_BASE}/conversations`, {
    method: "POST",
    headers: { ...getHeaders(), "Content-Type": "application/json" },
    body: JSON.stringify({
      conversation_id: conversationId,
      content: message,
      model,
      attachments: attachments || [],
      temperature: params?.temperature ?? 1,
      max_tokens: params?.max_tokens ?? 4096,
      top_p: params?.top_p ?? 1,
    }),
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
