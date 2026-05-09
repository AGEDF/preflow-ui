/**
 * Zustand store for UI state (client-side only)
 * Not synced to backend - for local UI interactions
 */

import { create } from 'zustand';
import type { UUID } from '../types';
import type { UIState } from '../types';

interface UIStore extends UIState {
  setSelectedNodeId: (id: UUID | null) => void;
  setSelectedWorkflowId: (id: UUID | null) => void;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  toggleDarkMode: () => void;
  setDarkMode: (dark: boolean) => void;
}

export const useUIStore = create<UIStore>((set) => ({
  selectedNodeId: null,
  selectedWorkflowId: null,
  sidebarOpen: true,
  darkMode: false,

  setSelectedNodeId: (id) => set({ selectedNodeId: id }),

  setSelectedWorkflowId: (id) => set({ selectedWorkflowId: id }),

  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),

  setSidebarOpen: (open) => set({ sidebarOpen: open }),

  toggleDarkMode: () => set((state) => ({ darkMode: !state.darkMode })),

  setDarkMode: (dark) => set({ darkMode: dark }),
}));
