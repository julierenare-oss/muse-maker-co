import { create } from "zustand";

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  attachments?: string[];
}

export type ChatModality = "text" | "image" | "video";

interface ChatStore {
  modality: ChatModality;
  conversationId: string;
  messages: ChatMessage[];
  loadConversation: (id: string, msgs: ChatMessage[], modality?: ChatModality) => void;
  newConversation: () => void;
  setMessages: (msgs: ChatMessage[] | ((prev: ChatMessage[]) => ChatMessage[])) => void;
  setConversationId: (id: string) => void;
  setModality: (m: ChatModality) => void;
}

export const useChatStore = create<ChatStore>((set) => ({
  modality: "text",
  conversationId: crypto.randomUUID(),
  messages: [],
  loadConversation: (id, msgs, modality) =>
    set({ conversationId: id, messages: msgs, ...(modality ? { modality } : {}) }),
  newConversation: () => set({ conversationId: crypto.randomUUID(), messages: [] }),
  setMessages: (msgs) =>
    set((state) => ({
      messages: typeof msgs === "function" ? msgs(state.messages) : msgs,
    })),
  setConversationId: (id) => set({ conversationId: id }),
  setModality: (m) => set({ modality: m }),
}));
