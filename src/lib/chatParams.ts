import { create } from "zustand";

interface ChatParamsStore {
  temperature: number;
  maxTokens: number;
  topP: number;
  setTemperature: (v: number) => void;
  setMaxTokens: (v: number) => void;
  setTopP: (v: number) => void;
}

export const useChatParams = create<ChatParamsStore>((set) => ({
  temperature: 1,
  maxTokens: 4096,
  topP: 1,
  setTemperature: (v) => set({ temperature: v }),
  setMaxTokens: (v) => set({ maxTokens: v }),
  setTopP: (v) => set({ topP: v }),
}));
