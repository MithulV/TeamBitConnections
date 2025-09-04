import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useAuthStore = create(
  persist(
    (set) => ({
      token: null,
      email: null,
      role: null,
      id: null,

      setAuth: (token, email, role, id) =>
        set({
          token,
          email,
          role,
          id,
        }),

      clearAuth: () =>
        set({
          token: null,
          email: null,
          role: null,
          id: null,
        }),
    }),
    {
      name: "auth-storage", // name of the item in localStorage
    }
  )
);
