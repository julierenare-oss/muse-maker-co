import { create } from "zustand";

interface ChatParamsStore {
  // Text params
  temperature: number;
  maxTokens: number;
  setTemperature: (v: number) => void;
  setMaxTokens: (v: number) => void;
  // Image params
  imageN: number;
  imageSize: string;
  imageQuality: string;
  setImageN: (v: number) => void;
  setImageSize: (v: string) => void;
  setImageQuality: (v: string) => void;
  // Video params
  videoSize: string;
  videoSeconds: string;
  setVideoSize: (v: string) => void;
  setVideoSeconds: (v: string) => void;
}

export const useChatParams = create<ChatParamsStore>((set) => ({
  temperature: 1,
  maxTokens: 4096,
  setTemperature: (v) => set({ temperature: v }),
  setMaxTokens: (v) => set({ maxTokens: v }),
  imageN: 1,
  imageSize: "1024x1024",
  imageQuality: "medium",
  setImageN: (v) => set({ imageN: v }),
  setImageSize: (v) => set({ imageSize: v }),
  setImageQuality: (v) => set({ imageQuality: v }),
  videoSize: "1280x720",
  videoSeconds: "5",
  setVideoSize: (v) => set({ videoSize: v }),
  setVideoSeconds: (v) => set({ videoSeconds: v }),
}));
