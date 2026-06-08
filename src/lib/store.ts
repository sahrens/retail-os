import { create } from 'zustand';

interface User {
  id: string;
  email: string;
  name: string | null;
  role: 'admin' | 'member';
}

interface Store {
  user: User | null;
  setUser: (user: User | null) => void;
  loading: boolean;
  setLoading: (loading: boolean) => void;
}

export const useStore = create<Store>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
  loading: true,
  setLoading: (loading) => set({ loading }),
}));
