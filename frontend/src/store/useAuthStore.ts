import axios from "axios";
import { create } from "zustand";
import { toast } from "sonner";
import Cookies from "js-cookie";
import { authApi } from "@/api/auth";
import { userApi } from "@/api/user";
import type { AuthResponse, ErrorResponse } from "@/types/auth";
import { axiosInstance, BASE_URL } from "@/config/axios";
import { io, type Socket } from "socket.io-client";
import useChatStore from "./useChatStore";

type User = AuthResponse["user"];

type AuthStore = {
	isAuthenticated: boolean;
	isLoading: boolean;
	user: User | null;
	socket: Socket | null;
	onlineUsers: string[];
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
	updateProfile: (profilePic: string) => Promise<void>;
	connectSocket: () => void;
	disconnectSocket: () => void;
};

export const useAuthStore = create<AuthStore>((set, get) => ({
	isAuthenticated: false,
	isLoading: true,
	user: null,
	socket: null,
	onlineUsers: [],

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
			get().connectSocket();
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

			get().connectSocket();
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

			get().connectSocket();
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

			get().connectSocket();
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

			get().disconnectSocket();
		} catch (error) {
			console.error("Logout error:", error);
		} finally {
			Cookies.remove("accessToken");
			set({ user: null, isAuthenticated: false });
		}
	},

	updateProfile: async (profilePic) => {
		try {
			const response = await axiosInstance.patch("/auth/update-profile", {
				profilePic,
			});
			set({ user: response.data.user });
			toast.success("Profile updated successfully!");
		} catch (error: unknown) {
			console.log("Error in updateProfile:", error);
			const message =
				(error as ErrorResponse)?.message ?? "Error updating profile";
			toast.error(message);
		}
	},

	connectSocket: () => {
		const { user } = get();
		if (!user || get().socket?.connected) return;

		const socket = io(BASE_URL, {
			withCredentials: true,
		});

		socket.on("connect", () => {
			console.log("Socket connected successfully with ID:", socket.id);
			useChatStore.getState().initGlobalSubscriptions();
		});

		// Handle Reconnection Auth Errors with Socket
		socket.on("connect_error", async (err) => {
			if (
				err.message === "Unauthorized - Authentication failed" ||
				err.message === "Unauthorized - No Token Provided"
			) {
				console.log(
					"Socket auth failed, attempting to refresh token via axios...",
				);

				socket.disconnect();

				try {
					await axiosInstance.get("/auth/refresh");

					socket.connect();
				} catch {
					const { logout } = get();

					console.log("Session expired, redirecting to login.");
					logout();
				}
			} else {
				console.error("Socket connection error:", err.message);
			}
		});

		set({ socket });

		// Listen for online users
		socket.on("getOnlineUsers", (userIds) => {
			set({ onlineUsers: userIds });
		});
	},

	disconnectSocket: () => {
		const { socket } = get();
		if (socket?.connected) {
			socket.disconnect();
			set({ socket: null });
		}
	},
}));
