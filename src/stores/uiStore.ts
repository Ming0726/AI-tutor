import { create } from "zustand";

type UIState = {
  sidebarOpen: boolean;
  searchQuery: string;
  selectedCategoryId: string | null;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  setSearchQuery: (query: string) => void;
  setSelectedCategoryId: (id: string | null) => void;
};

export const useUIStore = create<UIState>((set) => ({
  sidebarOpen: false,
  searchQuery: "",
  selectedCategoryId: null,
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  setSearchQuery: (query) => set({ searchQuery: query }),
  setSelectedCategoryId: (id) => set({ selectedCategoryId: id }),
}));
