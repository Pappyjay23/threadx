import { axiosInstance } from "@/config/axios";
import type { CurrentUserResponse } from "@/types/auth";

export const userApi = {
	getCurrentUser: async () => {
		const response = await axiosInstance.get("/user");
		return response.data.data as CurrentUserResponse;
	},
};
