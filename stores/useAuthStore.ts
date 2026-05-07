import { create } from "zustand";

type AuthUser = {
    id: string,
    name: string,
    email: string,
    department: string,
    position: string,
    status: "online" | "offline" | "AFK",
    createdAt: string,
    companyId: string,
}

type AuthStore = {
    user: AuthUser | null;
    setUser: (user: AuthUser | null) => void;
    clearUser: () => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
    user: null,
    setUser: (user) => set({ user }),
    clearUser: () => set({ user: null })
}))