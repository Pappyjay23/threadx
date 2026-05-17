import { create } from "zustand";

export const useAuthStore = create(() => ({
	isAuthenticated: false,
	isLoading: false,
}));
