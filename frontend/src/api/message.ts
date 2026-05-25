import { axiosInstance } from "@/config/axios";

export const messageApi = {
	getContacts: async () => {
		const response = await axiosInstance.get("/messages/contacts");
		return response.data.data;
	},
	getChatPartners: async () => {
		const response = await axiosInstance.get("/messages/chats");
		return response.data.data;
	},
	getMessagesByUserId: async (id: string) => {
		const response = await axiosInstance.get(`/messages/${id}`);
		return response.data.data;
	},
	sendMessage: async (
		id: string,
		message: { text?: string; image?: string },
	) => {
		const response = await axiosInstance.post(`/messages/send/${id}`, message);
		return response.data.data;
	},
};
