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

export type ModelsByModality = {
  text: string[];
  image: string[];
  video: string[];
};

export async function fetchModels(): Promise<ModelsByModality> {
  const res = await fetch(`${API_BASE}/models`, { headers: getHeaders() });
  const json = await res.json();
  return json.data as ModelsByModality;
}

export interface ConversationItem {
  uuid: string;
  title: string;
  type: "text" | "image" | "video";
}

export async function fetchConversations(): Promise<ConversationItem[]> {
  const res = await fetch(`${API_BASE}/conversations`, { headers: getHeaders() });
  const json = await res.json();
  return json.data;
}

export async function deleteConversation(conversationId: string): Promise<void> {
  const res = await fetch(`${API_BASE}/conversations/${conversationId}`, {
    method: "DELETE",
    headers: getHeaders(),
  });
  if (!res.ok) throw new Error("Failed to delete conversation");
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

export interface TextChatParams {
  temperature: number;
  max_tokens: number;
}

export interface ImageChatParams {
  n: number;
  size: string;
  quality: string;
}

export interface VideoChatParams {
  size: string;
  seconds: string;
}

// Callback for media generation that can include attachments
export interface SSECallbacks {
  onToken: (token: string) => void;
  onDone: (attachments?: string[]) => void;
  onStatus?: (status: string) => void;
}

export async function sendTextMessage(
  message: string,
  model: string,
  conversationId: string,
  callbacks: SSECallbacks,
  signal?: AbortSignal,
  attachments?: string[],
  params?: TextChatParams
) {
  const res = await fetch(`${API_BASE}/conversations/text`, {
    method: "POST",
    headers: { ...getHeaders(), "Content-Type": "application/json" },
    body: JSON.stringify({
      conversation_id: conversationId,
      content: message,
      model,
      attachments: attachments || [],
      temperature: params?.temperature ?? 1,
      max_tokens: params?.max_tokens ?? 4096,
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
      const trimmed = line.trim();
      if (!trimmed.startsWith("data:")) continue;
      const raw = trimmed.slice(5).trim();
      if (raw === "[DONE]") { callbacks.onDone(); return; }

      try {
        const parsed = JSON.parse(raw);
        if (typeof parsed === "string") { callbacks.onToken(parsed); continue; }
        if (parsed?.done === true) {
          const atts = parsed.attachments?.map((a: any) => typeof a === 'string' ? a : a?.url).filter(Boolean);
          callbacks.onDone(atts?.length ? atts : undefined);
          return;
        }
        if (parsed?.content) { callbacks.onToken(parsed.content); continue; }
        if (parsed?.text) { callbacks.onToken(parsed.text); continue; }
      } catch {
        // plain text token
      }
      const cleaned = raw.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "");
      if (cleaned) callbacks.onToken(cleaned);
    }
  }
  callbacks.onDone();
}

export async function sendImageMessage(
  message: string,
  model: string,
  conversationId: string,
  callbacks: SSECallbacks,
  signal?: AbortSignal,
  params?: ImageChatParams
) {
  const res = await fetch(`${API_BASE}/conversations/image`, {
    method: "POST",
    headers: { ...getHeaders(), "Content-Type": "application/json" },
    body: JSON.stringify({
      conversation_id: conversationId,
      content: message,
      model,
      n: params?.n ?? 1,
      size: params?.size ?? "1024x1024",
      quality: params?.quality ?? "medium",
    }),
    signal,
  });

  await parseMediaSSE(res, callbacks);
}

export async function sendVideoMessage(
  message: string,
  model: string,
  conversationId: string,
  callbacks: SSECallbacks,
  signal?: AbortSignal,
  params?: VideoChatParams
) {
  const res = await fetch(`${API_BASE}/conversations/video`, {
    method: "POST",
    headers: { ...getHeaders(), "Content-Type": "application/json" },
    body: JSON.stringify({
      conversation_id: conversationId,
      content: message,
      model,
      size: params?.size ?? "1280x720",
      seconds: params?.seconds ?? "5",
    }),
    signal,
  });

  await parseMediaSSE(res, callbacks);
}

async function parseMediaSSE(res: Response, callbacks: SSECallbacks) {
  const reader = res.body?.getReader();
  if (!reader) return;

  const decoder = new TextDecoder();
  let buffer = "";
  let lastStatus = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() || "";

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed.startsWith("data:")) continue;
      const raw = trimmed.slice(5).trim();
      if (raw === "[DONE]") { callbacks.onDone(); return; }

      try {
        const parsed = JSON.parse(raw);
        if (parsed.done === true) {
          const atts = parsed.attachments?.map((a: any) => typeof a === 'string' ? a : a?.url).filter(Boolean);
          callbacks.onDone(atts?.length ? atts : undefined);
          return;
        }
        // Status messages like "Generating image..." — deduplicate
        if (parsed.content && parsed.content !== lastStatus) {
          lastStatus = parsed.content;
          callbacks.onStatus?.(parsed.content);
        }
      } catch {
        // ignore
      }
    }
  }
  callbacks.onDone();
}
