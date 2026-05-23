import { axiosInstance } from "@/config/axios";
import type { AuthResponse } from "@/types/auth";

export const authApi = {
	login: async (data: { email: string; password: string }) => {
		const response = await axiosInstance.post("/auth/login", data);
		return response.data.data as AuthResponse;
	},
	signup: async (data: {
		firstName: string;
		lastName?: string;
		email: string;
		password: string;
	}) => {
		const response = await axiosInstance.post("/auth/signup", data);
		return response.data.data as AuthResponse;
	},
	googleLogin: async (accessToken: string) => {
		const response = await axiosInstance.post("/auth/google", { accessToken });
		return response.data.data as AuthResponse;
	},

	logout: async () => {
		await axiosInstance.post("/auth/logout", undefined);
	},
	refresh: async () => {
		const response = await axiosInstance.post("/auth/refresh", undefined);
		return response.data.data as { accessToken: string };
	},
	forgotPassword: async (email: string) => {
		const response = await axiosInstance.post("/auth/forgot-password", {
			email,
			origin:
				typeof window !== "undefined" ? window.location.origin : undefined,
		});
		return response.data;
	},
	resetPassword: async (
		token: string,
		newPassword: string,
		confirmPassword: string,
	) => {
		const response = await axiosInstance.post("/auth/reset-password", {
			token,
			newPassword,
			confirmPassword,
		});
		return response.data;
	},
};
