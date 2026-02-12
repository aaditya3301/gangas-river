import { create } from 'zustand';

type Role = 'citizen' | 'official' | 'researcher';

interface LandingState {
  currentRole: Role;
  setRole: (role: Role) => void;
}

export const useLandingStore = create<LandingState>((set) => ({
  currentRole: 'citizen',
  setRole: (role) => set({ currentRole: role }),
}));
