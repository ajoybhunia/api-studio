import { create } from "zustand";

export interface Environment {
  id: string;
  name: string;
  variables: Record<string, string>;
}

interface EnvironmentState {
  environments: Environment[];
  activeEnvironmentId: string | null;
  setEnvironments: (environments: Environment[]) => void;
  addEnvironment: (environment: Environment) => void;
  removeEnvironment: (id: string) => void;
  setActiveEnvironment: (id: string | null) => void;
}

export const useEnvironmentStore = create<EnvironmentState>((set) => ({
  environments: [],
  activeEnvironmentId: null,
  setEnvironments: (environments) => set({ environments }),
  addEnvironment: (environment) =>
    set((state) => ({ environments: [...state.environments, environment] })),
  removeEnvironment: (id) =>
    set((state) => ({
      environments: state.environments.filter((e) => e.id !== id),
      activeEnvironmentId:
        state.activeEnvironmentId === id ? null : state.activeEnvironmentId,
    })),
  setActiveEnvironment: (id) => set({ activeEnvironmentId: id }),
}));
