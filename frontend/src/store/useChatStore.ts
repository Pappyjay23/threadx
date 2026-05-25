import { messageApi } from "@/api/message";
import type { ErrorResponse } from "@/types/auth";
import type { Chat, Contact, Message } from "@/types/chat";
import { toast } from "sonner";
import { create } from "zustand";
import { useAuthStore } from "./useAuthStore";
import { axiosInstance } from "@/config/axios";

type ChatState = {
	chats: Chat[];
	setChats: (chats: Chat[]) => void;
	contacts: Contact[];
	activeChatId?: string;
	setActiveChatId: (id?: string) => void;
	messages: Message[];
	isContactsLoading: boolean;
	isChatsLoading: boolean;
	isMessagesLoading: boolean;
	isSoundEnabled: boolean;
	toggleSound: () => void;
	selectedUser: Contact | null;
	setSelectedUser: (selectedUser: Contact | null) => void;
	getContacts: () => Promise<void>;
	getChatPartners: () => Promise<void>;
	getMessagesByUserId: (id: string) => Promise<void>;
	sendMessage: (
		messageData: {
			text?: string;
			image?: string;
		},
		imageFile?: File | null,
		imagePreview?: string | null,
	) => Promise<void>;
};

const useChatStore = create<ChatState>((set, get) => ({
	chats: [],
	setChats: (chats: Chat[]) => set({ chats }),
	contacts: [],
	messages: [],
	selectedUser: null,
	isContactsLoading: false,
	isChatsLoading: false,
	isMessagesLoading: false,
	isSoundEnabled: localStorage.getItem("isSoundEnabled") === "true",
	toggleSound: () => {
		localStorage.setItem("isSoundEnabled", String(!get().isSoundEnabled));
		set((state) => ({ isSoundEnabled: !state.isSoundEnabled }));
	},
	activeChatId: undefined,
	setActiveChatId: (id: string | undefined) => set({ activeChatId: id }),
	setSelectedUser: (selectedUser) => {
		set({ selectedUser });
	},
	getContacts: async () => {
		set({ isContactsLoading: true });
		try {
			const contacts = await messageApi.getContacts();
			set({ contacts });
		} catch (error: unknown) {
			console.error("Error fetching contacts:", error);
			const message =
				(error as ErrorResponse)?.message ?? "Failed to fetch contacts";
			toast.error(message);
		} finally {
			set({ isContactsLoading: false });
		}
	},
	getChatPartners: async () => {
		set({ isChatsLoading: true });
		try {
			const chats = await messageApi.getChatPartners();
			set({ chats });
		} catch (error) {
			console.error("Error fetching chat partners:", error);
			const message =
				(error as ErrorResponse)?.message ?? "Failed to fetch chat partners";
			toast.error(message);
		} finally {
			set({ isChatsLoading: false });
		}
	},
	getMessagesByUserId: async (id: string) => {
		set({ isMessagesLoading: true });
		try {
			const messages = await messageApi.getMessagesByUserId(id);
			set({ messages });
		} catch (error) {
			console.error("Error fetching messages:", error);
			const message =
				(error as ErrorResponse)?.message ?? "Failed to fetch messages";
			toast.error(message);
		} finally {
			set({ isMessagesLoading: false });
		}
	},

	sendMessage: async (
		messageData: { text?: string },
		imageFile?: File | null,
		imagePreview?: string | null,
	) => {
		const { selectedUser, messages } = get();
		const { user } = useAuthStore.getState();

		if (!selectedUser || !user) return;

		const tempId = `temp-${Date.now()}`;
		const now = new Date().toISOString();

		const optimisticMessage: Message = {
			_id: tempId,
			senderId: user._id,
			receiverId: selectedUser.id,
			text: messageData.text,
			image: imagePreview ?? undefined,
			createdAt: now,
			updatedAt: now,
		};

		// Optimistically add message immediately
		set({ messages: [...messages, optimisticMessage] });

		try {
			let imageUrl: string | null = null;

			if (imageFile) {
				const { data } = await axiosInstance.get(
					"/messages/upload-message-signature",
				);
				const { timestamp, signature, cloudName, apiKey, folder } = data;

				const formData = new FormData();
				formData.append("file", imageFile);
				formData.append("timestamp", timestamp);
				formData.append("signature", signature);
				formData.append("api_key", apiKey);
				formData.append("folder", folder);

				const cloudinaryRes = await fetch(
					`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
					{ method: "POST", body: formData },
				);

				if (!cloudinaryRes.ok) throw new Error("Failed to upload image");

				const cloudinaryData = await cloudinaryRes.json();
				imageUrl = cloudinaryData.secure_url;

				// Preload before swapping so there's no flicker
				await new Promise((resolve) => {
					const img = new Image();
					img.onload = resolve;
					img.onerror = resolve;
					img.src = imageUrl!;
				});
			}

			const sentMessage = await messageApi.sendMessage(selectedUser.id, {
				...messageData,
				image: imageUrl ?? undefined,
			});

			set((state) => ({
				messages: state.messages.map((m) =>
					m._id === tempId ? sentMessage : m,
				),
			}));
		} catch (error) {
			// Roll back the optimistic message on failure
			set((state) => ({
				messages: state.messages.filter((m) => m._id !== tempId),
			}));
			const message =
				(error as ErrorResponse)?.message ?? "Failed to send message";
			toast.error(message);
		}
	},
}));

export default useChatStore;
