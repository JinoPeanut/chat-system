import { create } from "zustand";

export type AuthUser = {
    id: string,
    name: string,
    email: string,
    department: string,
    position: string,
    status: "online" | "offline" | "AFK",
    createdAt: string,
    companyId: string,
    profilePic: string | null,
    role: "USER" | "ADMIN",
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