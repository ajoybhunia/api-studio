import { create } from "zustand";
import { invoke } from "@tauri-apps/api/core";
import type { SendRequestArgs, SendResponse } from "@/types/tauri";
import { useSettingsStore } from "@/stores/settingsStore";
import { toAppError } from "@/lib/errors";
import type { AppError } from "@/lib/errors";

export interface ResponseRecord {
  response?: SendResponse;
  error?: AppError;
  isLoading: boolean;
}

interface ResponseState {
  responses: Record<string, ResponseRecord>;
  sendRequest: (
    requestId: string,
    args: Omit<SendRequestArgs, "timeout_seconds">,
  ) => Promise<void>;
  getResponse: (requestId: string) => ResponseRecord | undefined;
  clearResponse: (requestId: string) => void;
}

export const useResponseStore = create<ResponseState>((set, get) => ({
  responses: {},

  sendRequest: async (requestId, args) => {
    const timeout = useSettingsStore.getState().timeout;

    set((state) => ({
      responses: {
        ...state.responses,
        [requestId]: { isLoading: true },
      },
    }));

    try {
      const response = await invoke<SendResponse>("send_request", {
        args: { ...args, timeout_seconds: timeout },
      });
      set((state) => ({
        responses: {
          ...state.responses,
          [requestId]: { response, isLoading: false },
        },
      }));
    } catch (error) {
      const err = toAppError(error);
      set((state) => ({
        responses: {
          ...state.responses,
          [requestId]: { error: err, isLoading: false },
        },
      }));
    }
  },

  getResponse: (requestId) => get().responses[requestId],

  clearResponse: (requestId) =>
    set((state) => {
      const { [requestId]: _, ...rest } = state.responses;
      return { responses: rest };
    }),
}));
