// Local persistence of conversation messages (prompts, answers, attachments).
// Keeps chats "alive" across reloads even when the backend has no history yet.

import type { ChatMessage } from "./chatStore";

const KEY = "nexagen.messages.v1";
const META_KEY = "nexagen.localConversations.v1";

export interface LocalConversation {
  uuid: string;
  title: string;
  type: "text" | "image" | "video";
  createdAt: string;
}

type Store = Record<string, ChatMessage[]>;

function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function write<T>(key: string, value: T) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* quota — ignore */
  }
}

export function getLocalMessages(uuid: string): ChatMessage[] {
  return read<Store>(KEY, {})[uuid] || [];
}

export function saveLocalMessages(uuid: string, messages: ChatMessage[]) {
  if (!uuid) return;
  const store = read<Store>(KEY, {});
  store[uuid] = messages;
  write(KEY, store);
}

export function clearLocalMessages(uuid: string) {
  const store = read<Store>(KEY, {});
  delete store[uuid];
  write(KEY, store);
}

export function getLocalConversations(): LocalConversation[] {
  return read<LocalConversation[]>(META_KEY, []);
}

export function upsertLocalConversation(conv: LocalConversation) {
  const list = getLocalConversations().filter((c) => c.uuid !== conv.uuid);
  list.unshift(conv);
  write(META_KEY, list);
}

export function removeLocalConversation(uuid: string) {
  write(META_KEY, getLocalConversations().filter((c) => c.uuid !== uuid));
  clearLocalMessages(uuid);
}

/** Merge remote/mock messages with anything stored locally for this conversation. */
export function mergeWithLocal(uuid: string, remote: ChatMessage[]): ChatMessage[] {
  const local = getLocalMessages(uuid);
  if (local.length >= remote.length) return local.length ? local : remote;
  return remote;
}
