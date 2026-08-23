import { create } from "zustand";

export interface OpenTab {
  id: string;
  requestId?: string;
  title: string;
}

interface RequestState {
  openTabs: OpenTab[];
  activeTabId: string | null;
  openTab: (tab: OpenTab) => void;
  closeTab: (tabId: string) => void;
  setActiveTab: (tabId: string) => void;
}

export const useRequestStore = create<RequestState>((set) => ({
  openTabs: [],
  activeTabId: null,
  openTab: (tab) =>
    set((state) => {
      const exists = state.openTabs.some((t) => t.id === tab.id);
      return {
        openTabs: exists ? state.openTabs : [...state.openTabs, tab],
        activeTabId: tab.id,
      };
    }),
  closeTab: (tabId) =>
    set((state) => {
      const openTabs = state.openTabs.filter((t) => t.id !== tabId);
      let activeTabId = state.activeTabId;
      if (activeTabId === tabId) {
        activeTabId = openTabs[openTabs.length - 1]?.id ?? null;
      }
      return { openTabs, activeTabId };
    }),
  setActiveTab: (tabId) => set({ activeTabId: tabId }),
}));
