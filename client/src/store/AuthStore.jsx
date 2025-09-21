import { create } from "zustand";
import api from "../utils/axios";

export const useAuthStore = create((set, get) => ({
  user: null,
  role: null,
  id: null,
  email: null,
  name: null,
  profilePicture: null,
  isAuthenticated: false,
  loading: true, // important for initial state

  setAuth: (user) =>
    set({
      user,
      role: user?.role || null,
      id: user?.id || null,
      email: user?.email || null,
      name: user?.name || null,
      profilePicture: user?.profilePicture || null,
      isAuthenticated: !!user,
      loading: false,
    }),

  clearAuth: () =>
    set({
      user: null,
      role: null,
      id: null,
      email: null,
      name: null,
      profilePicture: null,
      isAuthenticated: false,
      loading: false,
    }),

  fetchMe: async () => {
    try {
      set({ loading: true });
      const res = await api.get("/auth/me", { withCredentials: true });

      const userData = res.data;
      set({
        user: userData,
        role: userData.role,
        id: userData.id,
        email: userData.email,
        name: userData.name,
        profilePicture: userData.profilePicture,
        isAuthenticated: true,
        loading: false,
      });

      return userData;
    } catch (err) {
      set({
        user: null,
        role: null,
        id: null,
        email: null,
        name: null,
        profilePicture: null,
        isAuthenticated: false,
        loading: false,
      });
      throw err;
    }
  },

  logout: async () => {
    try {
      await api.post("/auth/logout", {}, { withCredentials: true });
      get().clearAuth();
    } catch (err) {
      // Clear auth anyway
      get().clearAuth();
    }
  },
}));
