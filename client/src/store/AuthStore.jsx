import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useAuthStore = create(
  persist(
    (set) => ({
      token: null,
      email: null,
      role: null,
      id: null,
      name: null,
      firstName: null,
      lastName: null,
      profilePicture: null,

      setAuth: (
        token,
        email,
        role,
        id,
        name = null,
        firstName = null,
        lastName = null,
        profilePicture = null
      ) =>
        set({
          token,
          email,
          role,
          id,
          name,
          firstName,
          lastName,
          profilePicture,
        }),

      clearAuth: () =>
        set({
          token: null,
          email: null,
          role: null,
          id: null,
          name: null,
          firstName: null,
          lastName: null,
          profilePicture: null,
        }),
    }),
    {
      name: "auth-storage", // name of the item in localStorage
    }
  )
);
