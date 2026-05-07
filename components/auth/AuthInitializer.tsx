"use client";

import { useAuthStore } from "@/stores/useAuthStore";
import { useEffect } from "react";

export default function AuthInitializer() {
    const setUser = useAuthStore((state) => state.setUser);
    const clearUser = useAuthStore((state) => state.clearUser);

    useEffect(() => {
        const restoreUser = async () => {
            try {
                const res = await fetch("/api/auth/me", {
                    method: "GET",
                    credentials: "include",
                });

                if (!res.ok) {
                    clearUser();
                    return;
                }

                const data = await res.json();
                setUser(data.user);
            } catch {
                clearUser();
            }
        };

        restoreUser();
    }, [setUser, clearUser])

    return null;
}