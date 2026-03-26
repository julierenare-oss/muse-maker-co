import { create } from "zustand";

interface AuthStore {
  token: string | null;
  setToken: (token: string | null) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  token: localStorage.getItem("nexagen_token"),
  setToken: (token) => {
    if (token) {
      localStorage.setItem("nexagen_token", token);
    } else {
      localStorage.removeItem("nexagen_token");
    }
    set({ token });
  },
  logout: () => {
    localStorage.removeItem("nexagen_token");
    set({ token: null });
  },
}));
