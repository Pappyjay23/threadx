import { create } from "zustand";

type AuthStore = {
	isAuthenticated: boolean;
	isLoading: boolean;
	setIsAuthenticated: (isAuthenticated: boolean) => void;
	setIsLoading: (isLoading: boolean) => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
	isAuthenticated: false,
	isLoading: false,
	setIsAuthenticated: (isAuthenticated: boolean) =>
		set(() => ({ isAuthenticated })),
	setIsLoading: (isLoading: boolean) => set(() => ({ isLoading })),
}));
