import { create } from "zustand";

export type HttpMethod =
  "GET" | "POST" | "PUT" | "PATCH" | "DELETE" | "HEAD" | "OPTIONS";

export type EditorTab = "params" | "body" | "auth" | "headers";

export interface KeyValueRow {
  id: string;
  key: string;
  value: string;
  enabled: boolean;
}

export interface AuthConfig {
  type: "none" | "bearer" | "basic";
  token: string;
  username: string;
  password: string;
}

export interface BodyConfig {
  type: "none" | "raw" | "json";
  content: string;
}

export interface RequestData {
  id: string;
  name: string;
  method: HttpMethod;
  url: string;
  headers: KeyValueRow[];
  queryParams: KeyValueRow[];
  auth: AuthConfig;
  body: BodyConfig;
  activeEditorTab: EditorTab;
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

export function buildRequestName(method: string, url: string): string {
  if (!url.trim()) return `${method} Untitled`;
  try {
    const parsed = new URL(url);
    const path = parsed.pathname === "/" ? "/" : parsed.pathname;
    return `${method} ${path}`;
  } catch {
    const path = url.split("?")[0];
    return `${method} ${path || "Untitled"}`;
  }
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
      name: "GET Untitled",
      method: "GET",
      url: "",
      headers: [],
      queryParams: [],
      auth: { type: "none", token: "", username: "", password: "" },
      body: { type: "none", content: "" },
      activeEditorTab: "params",
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

      const next = { ...existing, ...updates };

      if (updates.url !== undefined || updates.method !== undefined) {
        next.name = buildRequestName(next.method, next.url);
      }

      const openTabs = state.openTabs.map((t) =>
        t.id === id ? { ...t, title: next.name } : t,
      );

      return {
        requests: {
          ...state.requests,
          [id]: next,
        },
        openTabs,
      };
    }),
  getRequest: (id) => get().requests[id],
  deleteRequest: (id) =>
    set((state) => {
      const { [id]: _, ...rest } = state.requests;
      return { requests: rest };
    }),
}));
