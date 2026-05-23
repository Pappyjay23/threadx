import axios from "axios";
import { create } from "zustand";
import { toast } from "sonner";
import Cookies from "js-cookie";
import { authApi } from "@/api/auth";
import { userApi } from "@/api/user";
import type { AuthResponse, ErrorResponse } from "@/types/auth";

type User = AuthResponse["user"];

type AuthStore = {
	isAuthenticated: boolean;
	isLoading: boolean;
	user: User | null;
	setIsAuthenticated: (isAuthenticated: boolean) => void;
	setIsLoading: (isLoading: boolean) => void;
	clearAuthState: () => void;
	checkAuth: () => Promise<void>;
	login: (email: string, password: string) => Promise<void>;
	signup: (
		firstName: string,
		lastName: string,
		email: string,
		password: string,
	) => Promise<void>;
	googleLogin: (credential: string) => Promise<void>;
	logout: () => Promise<void>;
};

export const useAuthStore = create<AuthStore>((set) => ({
	isAuthenticated: false,
	isLoading: true,
	user: null,

	setIsAuthenticated: (isAuthenticated) => set({ isAuthenticated }),
	setIsLoading: (isLoading) => set({ isLoading }),

	clearAuthState: () => {
		Cookies.remove("accessToken");
		set({ user: null, isAuthenticated: false });
	},

	checkAuth: async () => {
		const hasToken = Cookies.get("accessToken");

		if (!hasToken) {
			try {
				const { accessToken } = await authApi.refresh();
				Cookies.set("accessToken", accessToken);
			} catch (err) {
				const status = axios.isAxiosError(err)
					? err.response?.status
					: undefined;
				if (status === 401 || status === 403) {
					Cookies.remove("accessToken");
					set({ user: null, isAuthenticated: false });
				}
				set({ isLoading: false });
				return;
			}
		}

		try {
			const currentUser = await userApi.getCurrentUser();
			set({ user: currentUser, isAuthenticated: true });
		} catch (err) {
			const status = axios.isAxiosError(err) ? err.response?.status : undefined;
			if (status === 401 || status === 403) {
				Cookies.remove("accessToken");
				set({ user: null, isAuthenticated: false });
			}
		} finally {
			set({ isLoading: false });
		}
	},

	login: async (email, password) => {
		try {
			const response: AuthResponse = await authApi.login({ email, password });
			Cookies.set("accessToken", response.accessToken);
			set({ user: response.user, isAuthenticated: true });
			toast.success("Login successful");
		} catch (error: unknown) {
			console.error("Error logging in:", error);
			const message = (error as ErrorResponse)?.message ?? "Login failed";
			toast.error(message);
			throw error;
		}
	},

	signup: async (firstName, lastName, email, password) => {
		try {
			const response: AuthResponse = await authApi.signup({
				firstName,
				lastName,
				email,
				password,
			});
			Cookies.set("accessToken", response.accessToken);
			set({ user: response.user, isAuthenticated: true });
			toast.success("Account created successfully");
		} catch (error: unknown) {
			const message = (error as ErrorResponse)?.message ?? "Signup failed";
			toast.error(message);
			throw error;
		}
	},

	googleLogin: async (accessToken) => {
		try {
			const response: AuthResponse = await authApi.googleLogin(accessToken);
			Cookies.set("accessToken", response.accessToken);
			set({ user: response.user, isAuthenticated: true });
			toast.success("Login successful");
		} catch (error: unknown) {
			const message =
				(error as ErrorResponse)?.message ?? "Google login failed";
			toast.error(message);
			throw error;
		}
	},

	logout: async () => {
		try {
			await authApi.logout();
		} catch (error) {
			console.error("Logout error:", error);
		} finally {
			Cookies.remove("accessToken");
			set({ user: null, isAuthenticated: false });
		}
	},
}));
