import { create } from 'zustand';
import { persist, PersistStorage, StorageValue } from 'zustand/middleware';

interface AppState {
  count: number;
  increment: () => void;
  decrement: () => void;
}

const customLocalStorage: PersistStorage<AppState> = {
  getItem: (name: string): StorageValue<AppState> | Promise<StorageValue<AppState> | null> | null => {
    const item = localStorage.getItem(name);
    if (item) {
      return JSON.parse(item);
    }
    return null;
  },
  setItem: (name: string, value: StorageValue<AppState>): void | Promise<void> => {
    localStorage.setItem(name, JSON.stringify(value));
  },
  removeItem: (name: string): void | Promise<void> => {
    localStorage.removeItem(name);
  },
};

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      count: 0,
      increment: () => set((state) => ({ count: state.count + 1 })),
      decrement: () => set((state) => ({ count: state.count - 1 })),
    }),
    {
      name: 'app-storage', // unique name
      storage: customLocalStorage,
    }
  )
);
