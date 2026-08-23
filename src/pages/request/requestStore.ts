import { create } from "zustand";

export type HttpMethod =
  "GET" | "POST" | "PUT" | "PATCH" | "DELETE" | "HEAD" | "OPTIONS";

export interface RequestData {
  id: string;
  name: string;
  method: HttpMethod;
  url: string;
}

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

  requests: Record<string, RequestData>;
  createRequest: () => string;
  updateRequest: (
    id: string,
    updates: Partial<Omit<RequestData, "id">>,
  ) => void;
  getRequest: (id: string) => RequestData | undefined;
  deleteRequest: (id: string) => void;
}

export const useRequestStore = create<RequestState>((set, get) => ({
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

  requests: {},
  createRequest: () => {
    const id = crypto.randomUUID();
    const request: RequestData = {
      id,
      name: "Untitled Request",
      method: "GET",
      url: "",
    };
    set((state) => ({
      requests: { ...state.requests, [id]: request },
      openTabs: [...state.openTabs, { id, title: request.name }],
      activeTabId: id,
    }));
    return id;
  },
  updateRequest: (id, updates) =>
    set((state) => {
      const existing = state.requests[id];
      if (!existing) return state;
      return {
        requests: {
          ...state.requests,
          [id]: { ...existing, ...updates },
        },
      };
    }),
  getRequest: (id) => get().requests[id],
  deleteRequest: (id) =>
    set((state) => {
      const { [id]: _, ...rest } = state.requests;
      return { requests: rest };
    }),
}));
