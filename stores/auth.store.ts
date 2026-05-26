import { create } from "zustand";
import { User } from "@/types/user.type";

interface AuthState {
  access_token: string | null;
  user: User | null;
  hydrated: boolean;
  hasSession: boolean;
  setAuth: (token: string, user: User) => void;
  clearAuth: () => void;
  setHydrated: () => void;
  updateUser: (partial: Partial<User>) => void;
}

const getInitialSession = () => {
  if (typeof window === "undefined") return false;
  return localStorage.getItem("daoduck_has_session") === "true";
};

export const useAuthStore = create<AuthState>((set) => ({
  access_token: null,
  user: null,
  hydrated: false,
  hasSession: getInitialSession(),

  setAuth: (token: string, user: User) => {
    localStorage.setItem("daoduck_has_session", "true");
    set({
      access_token: token,
      user,
      hasSession: true,
    });
  },

  clearAuth: () => {
    localStorage.removeItem("daoduck_has_session");
    set({
      access_token: null,
      user: null,
      hasSession: false,
    });
  },

  setHydrated: () => set({ hydrated: true }),

  updateUser: (partial: Partial<User>) =>
    set((state) => ({
      user: state.user ? { ...state.user, ...partial } : null,
    })),
}));
