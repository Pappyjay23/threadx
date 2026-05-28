import axios from "axios";
import Cookies from "js-cookie";

export const BASE_URL = import.meta.env.VITE_THREADX_API_URL;

export const axiosInstance = axios.create({
	baseURL: `${BASE_URL}/api`,
	headers: {
		"Content-Type": "application/json",
	},
	withCredentials: true,
});

const isDefinitivelyInvalidRefresh = (err: unknown) => {
	if (!axios.isAxiosError(err)) return false;
	const status = err.response?.status;
	return status === 401 || status === 403;
};

const normalizeError = (error: unknown) => {
	if (axios.isAxiosError(error)) {
		return (
			error.response?.data ?? {
				statusCode: 0,
				message: error.message ?? "Something went wrong",
				error: "ERR_NETWORK",
			}
		);
	}
	return {
		statusCode: 0,
		message: "Something went wrong",
		error: "ERR_UNKNOWN",
	};
};

axiosInstance.interceptors.request.use((config) => {
	const token = Cookies.get("accessToken");
	if (token) {
		config.headers.Authorization = `Bearer ${token}`;
	}
	return config;
});

let refreshPromise: Promise<string> | null = null;

axiosInstance.interceptors.response.use(
	(response) => response,
	async (error) => {
		const originalRequest = error.config;
		const originalUrl: string | undefined = originalRequest?.url;
		const isAuthRoute =
			originalUrl === "/auth/login" ||
			originalUrl === "/auth/signup" ||
			originalUrl === "/auth/refresh" ||
			originalUrl === "/auth/forgot-password" ||
			originalUrl === "/auth/reset-password";

		if (
			error.response?.status === 401 &&
			originalRequest &&
			!originalRequest._retry &&
			originalUrl !== "/auth/refresh" &&
			!isAuthRoute
		) {
			originalRequest._retry = true;
			try {
				if (!refreshPromise) {
					refreshPromise = axiosInstance
						.post("/auth/refresh", undefined)
						.then((res) => {
							const newToken = res.data.data.accessToken as string;
							Cookies.set("accessToken", newToken);
							return newToken;
						})
						.finally(() => {
							refreshPromise = null;
						});
				}

				const newToken = await refreshPromise;
				originalRequest.headers.Authorization = `Bearer ${newToken}`;
				return axiosInstance(originalRequest);
			} catch (refreshError) {
				// Only log out if refresh is definitively invalid (expired/invalid cookie).
				// For transient failures (network/5xx), keep the current auth state and let the caller decide.
				if (isDefinitivelyInvalidRefresh(refreshError)) {
					window.dispatchEvent(new Event("auth:logout"));
				}
				return Promise.reject(normalizeError(refreshError));
			}
		}
		return Promise.reject(normalizeError(error));
	},
);
