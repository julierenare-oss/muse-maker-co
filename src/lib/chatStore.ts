import { create } from "zustand";

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  attachments?: string[];
}

interface ChatStore {
  conversationId: string;
  messages: ChatMessage[];
  loadConversation: (id: string, msgs: ChatMessage[]) => void;
  newConversation: () => void;
  setMessages: (msgs: ChatMessage[] | ((prev: ChatMessage[]) => ChatMessage[])) => void;
  setConversationId: (id: string) => void;
}

export const useChatStore = create<ChatStore>((set) => ({
  conversationId: crypto.randomUUID(),
  messages: [],
  loadConversation: (id, msgs) => set({ conversationId: id, messages: msgs }),
  newConversation: () => set({ conversationId: crypto.randomUUID(), messages: [] }),
  setMessages: (msgs) =>
    set((state) => ({
      messages: typeof msgs === "function" ? msgs(state.messages) : msgs,
    })),
  setConversationId: (id) => set({ conversationId: id }),
}));
