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

	getMessagesByConversationId: async (id: string, cursor?: string) => {
		const response = await axiosInstance.get(`/messages/conversations/${id}`, {
			params: cursor ? { cursor } : {},
		});
		return response.data.data;
	},

	sendMessage: async (
		id: string,
		message: {
			text?: string;
			image?: string;
			conversationId?: string;
			replyTo?: string;
		},
	) => {
		const response = await axiosInstance.post(`/messages/${id}`, message);
		return response.data.data;
	},

	deleteMessage: async (messageId: string) => {
		await axiosInstance.delete(`/messages/${messageId}`);
	},

	markAsRead: async (userId: string) => {
		await axiosInstance.post(`/messages/${userId}/read`);
	},
	togglePinChat: async (userId: string) => {
		const response = await axiosInstance.patch(`/messages/${userId}/pin`);
		return response.data.data;
	},

	createGroup: async (groupData: {
		name: string;
		participants: string[];
		groupAvatar?: string;
	}) => {
		const response = await axiosInstance.post("/messages/groups", groupData);
		return response.data.data;
	},

	addMembers: async (groupId: string, participants: string[]) => {
		const response = await axiosInstance.post(
			`/messages/groups/${groupId}/members`,
			{ participants },
		);
		return response.data.data;
	},

	removeMember: async (groupId: string, userId: string) => {
		const response = await axiosInstance.post(
			`/messages/groups/${groupId}/remove`,
			{ userId },
		);
		return response.data.data;
	},

	leaveGroup: async (groupId: string) => {
		const response = await axiosInstance.post(
			`/messages/groups/${groupId}/leave`,
		);
		return response.data.data;
	},

	deleteGroup: async (groupId: string) => {
		await axiosInstance.delete(`/messages/groups/${groupId}`);
	},

	deleteDirectChat: async (chatId: string) => {
		await axiosInstance.delete(`/messages/chats/${chatId}`);
	},
};
