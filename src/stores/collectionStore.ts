import { create } from "zustand";

export interface CollectionItem {
  id: string;
  name: string;
  description?: string;
}

interface CollectionState {
  collections: CollectionItem[];
  selectedCollectionId: string | null;
  setCollections: (collections: CollectionItem[]) => void;
  addCollection: (collection: CollectionItem) => void;
  removeCollection: (id: string) => void;
  selectCollection: (id: string | null) => void;
}

export const useCollectionStore = create<CollectionState>((set) => ({
  collections: [],
  selectedCollectionId: null,
  setCollections: (collections) => set({ collections }),
  addCollection: (collection) =>
    set((state) => ({ collections: [...state.collections, collection] })),
  removeCollection: (id) =>
    set((state) => ({
      collections: state.collections.filter((c) => c.id !== id),
      selectedCollectionId:
        state.selectedCollectionId === id ? null : state.selectedCollectionId,
    })),
  selectCollection: (id) => set({ selectedCollectionId: id }),
}));
