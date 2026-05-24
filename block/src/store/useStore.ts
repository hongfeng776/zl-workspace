import { create } from 'zustand';
import { User, Room, GameState } from '../../shared/types';

interface AppState {
  user: User | null;
  currentRoom: Room | null;
  setUser: (user: User | null) => void;
  setCurrentRoom: (room: Room | null) => void;
  clearState: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  user: null,
  currentRoom: null,
  setUser: (user) => set({ user }),
  setCurrentRoom: (room) => set({ currentRoom: room }),
  clearState: () => set({ user: null, currentRoom: null }),
}));

export const useUserStore = () => useAppStore((state) => state.user);
export const useCurrentRoomStore = () => useAppStore((state) => state.currentRoom);
