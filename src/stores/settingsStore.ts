import { create } from "zustand";

interface SettingsState {
  timeout: number;
  setTimeout: (seconds: number) => void;
}

export const useSettingsStore = create<SettingsState>((set) => ({
  timeout: 30,
  setTimeout: (seconds) => set({ timeout: seconds }),
}));
