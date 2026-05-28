import { axiosInstance } from "@/config/axios";

export const messageApi = {
	getContacts: async (page = 1, search = "") => {
		const response = await axiosInstance.get("/messages/contacts", {
			params: { page, search },
		});
		return response.data.data;
	},

	getChatPartners: async (search = "") => {
		const response = await axiosInstance.get("/messages/chats", {
			params: { search },
		});
		return response.data.data;
	},

	getMessagesByUserId: async (id: string, cursor?: string) => {
		const response = await axiosInstance.get(`/messages/${id}`, {
			params: cursor ? { cursor } : {},
		});
		return response.data.data;
	},

	sendMessage: async (
		id: string,
		message: { text?: string; image?: string },
	) => {
		const response = await axiosInstance.post(`/messages/send/${id}`, message);
		return response.data.data;
	},

	deleteMessage: async (messageId: string) => {
		await axiosInstance.delete(`/messages/${messageId}`);
	},

	markAsRead: async (userId: string) => {
		await axiosInstance.post(`/messages/${userId}/read`);
	},
};
