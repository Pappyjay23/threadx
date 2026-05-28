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
	contactsPage: number;
	contactsHasMore: boolean;
	isLoadingMoreContacts: boolean;
	activeChatId?: string;
	setActiveChatId: (id?: string) => void;
	messages: Message[];
	lastReadAt: string | null;
	messagesHasMore: boolean;
	isLoadingMoreMessages: boolean;
	isContactsLoading: boolean;
	isChatsLoading: boolean;
	isMessagesLoading: boolean;
	isSoundEnabled: boolean;
	toggleSound: () => void;
	selectedUser: Contact | null;
	setSelectedUser: (selectedUser: Contact | null) => void;
	getContacts: (page?: number, search?: string) => Promise<void>;
	loadMoreContacts: (search?: string) => Promise<void>;
	getChatPartners: (search?: string) => Promise<void>;
	getMessagesByUserId: (id: string) => Promise<void>;
	loadMoreMessages: (id: string) => Promise<void>;
	sendMessage: (
		messageData: { text?: string; image?: string },
		imageFile?: File | null,
		imagePreview?: string | null,
	) => Promise<void>;
	deleteMessage: (messageId: string) => Promise<void>;
	markAsRead: (userId: string) => Promise<void>;
	subscribeToMessages: () => void;
	unsubscribeFromMessages: () => void;
	subscribeToUpdates: () => void;
	unsubscribeFromUpdates: () => void;
	initGlobalSubscriptions: () => void;
};

const useChatStore = create<ChatState>((set, get) => ({
	chats: [],
	setChats: (chats) => set({ chats }),
	contacts: [],
	contactsPage: 1,
	contactsHasMore: false,
	isLoadingMoreContacts: false,
	messages: [],
	lastReadAt: null,
	messagesHasMore: false,
	isLoadingMoreMessages: false,
	selectedUser: null,
	isContactsLoading: false,
	isChatsLoading: false,
	isMessagesLoading: false,
	isSoundEnabled: localStorage.getItem("isSoundEnabled") === "true",
	toggleSound: () => {
		const next = !get().isSoundEnabled;
		localStorage.setItem("isSoundEnabled", String(next));
		set({ isSoundEnabled: next });
	},
	activeChatId: undefined,
	setActiveChatId: (id) => set({ activeChatId: id }),
	setSelectedUser: (selectedUser) => set({ selectedUser }),

	getContacts: async (page = 1, search = "") => {
		set({ isContactsLoading: true });
		try {
			const { contacts, pagination } = await messageApi.getContacts(
				page,
				search,
			);
			set({
				contacts,
				contactsPage: page,
				contactsHasMore: pagination.hasMore,
			});
		} catch (error) {
			toast.error(
				(error as ErrorResponse)?.message ?? "Failed to fetch contacts",
			);
		} finally {
			set({ isContactsLoading: false });
		}
	},

	loadMoreContacts: async (search = "") => {
		const { contactsPage, contactsHasMore, isLoadingMoreContacts } = get();
		if (!contactsHasMore || isLoadingMoreContacts) return;

		set({ isLoadingMoreContacts: true });
		try {
			const nextPage = contactsPage + 1;
			const { contacts, pagination } = await messageApi.getContacts(
				nextPage,
				search,
			);
			set((state) => ({
				contacts: [...state.contacts, ...contacts],
				contactsPage: nextPage,
				contactsHasMore: pagination.hasMore,
			}));
		} catch (error) {
			toast.error(
				(error as ErrorResponse)?.message ?? "Failed to load more contacts",
			);
		} finally {
			set({ isLoadingMoreContacts: false });
		}
	},

	getChatPartners: async (search = "") => {
		set({ isChatsLoading: true });
		try {
			const chats = await messageApi.getChatPartners(search);
			set({ chats });
		} catch (error) {
			toast.error((error as ErrorResponse)?.message ?? "Failed to fetch chats");
		} finally {
			set({ isChatsLoading: false });
		}
	},

	getMessagesByUserId: async (id) => {
		set({ isMessagesLoading: true });
		try {
			const { messages, hasMore, lastReadAt } = await messageApi.getMessagesByUserId(id);
			set({ messages, messagesHasMore: hasMore, lastReadAt });
		} catch (error) {
			toast.error(
				(error as ErrorResponse)?.message ?? "Failed to fetch messages",
			);
		} finally {
			set({ isMessagesLoading: false });
		}
	},

	loadMoreMessages: async (id) => {
		const { messages, messagesHasMore, isLoadingMoreMessages } = get();
		if (!messagesHasMore || isLoadingMoreMessages) return;

		set({ isLoadingMoreMessages: true });
		try {
			const oldestId = messages[0]?._id;
			const { messages: older, hasMore } = await messageApi.getMessagesByUserId(
				id,
				oldestId,
			);
			set((state) => ({
				messages: [...older, ...state.messages],
				messagesHasMore: hasMore,
			}));
		} catch (error) {
			toast.error(
				(error as ErrorResponse)?.message ?? "Failed to load more messages",
			);
		} finally {
			set({ isLoadingMoreMessages: false });
		}
	},

	sendMessage: async (messageData, imageFile, imagePreview) => {
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
				formData.append("timestamp", String(timestamp));
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

			if (imagePreview) URL.revokeObjectURL(imagePreview);

			set((state) => ({
				messages: state.messages.map((m) =>
					m._id === tempId ? sentMessage : m,
				),
			}));
		} catch (error) {
			set((state) => ({
				messages: state.messages.filter((m) => m._id !== tempId),
			}));
			toast.error(
				(error as ErrorResponse)?.message ?? "Failed to send message",
			);
		}
	},

	deleteMessage: async (messageId) => {
		const snapshot = get().messages;

		// Optimistically remove immediately
		set((state) => ({
			messages: state.messages.filter((m) => m._id !== messageId),
		}));

		try {
			await messageApi.deleteMessage(messageId);
		} catch (error) {
			// Rollback on failure
			set({ messages: snapshot });
			toast.error(
				(error as ErrorResponse)?.message ?? "Failed to delete message",
			);
		}
	},

	markAsRead: async (userId) => {
		try {
			await messageApi.markAsRead(userId);
			set((state) => ({
				chats: state.chats.map((chat) =>
					chat.id === userId ? { ...chat, unread: 0 } : chat,
				),
			}));
		} catch (error) {
			console.error("Failed to mark as read", error);
		}
	},

	subscribeToMessages: () => {
		const { selectedUser, isSoundEnabled } = get();
		if (!selectedUser) return;

		const socket = useAuthStore.getState().socket;
		if (!socket) {
			console.warn("Cannot subscribe to messages: Socket not available");
			return;
		}

		socket.on("newMessage", (message) => {
			// This ensures that the message is received by the correct user
			const isMessageSentFromSelectedUser =
				message.senderId === selectedUser.id;
			if (!isMessageSentFromSelectedUser) return;

			set((state) => ({
				messages: [
					...state.messages.filter((m) => m._id !== message._id),
					message,
				],
			}));
			if (isSoundEnabled) {
				const notificationSound = new Audio("/sounds/notification.mp3");

				notificationSound.currentTime = 0; //This is for a better UX.
				notificationSound
					.play()
					.catch((error) => console.log("Audio play failed", error));
			}
		});
	},

	unsubscribeFromMessages: () => {
		const socket = useAuthStore.getState().socket;
		if (socket) {
			socket.off("newMessage");
		}
	},

	initGlobalSubscriptions: () => {
		const socket = useAuthStore.getState().socket;
		if (!socket) return;

		// Remove any existing listeners first to prevent duplicates
		socket.off("typing:update");
		socket.off("unreadUpdate");
		socket.off("messagesRead");

		socket.on(
			"typing:update",
			({ senderId, isTyping }: { senderId: string; isTyping: boolean }) => {
				set((state) => ({
					chats: state.chats.map((chat) =>
						chat.id === senderId ? { ...chat, typing: isTyping } : chat,
					),
				}));
			},
		);

		socket.on(
			"unreadUpdate",
			({ senderId, count }: { senderId: string; count: number }) => {
				set((state) => ({
					chats: state.chats.map((chat) =>
						chat.id === senderId ? { ...chat, unread: count } : chat,
					),
				}));
			},
		);

		socket.on("messagesRead", () => {
			// Optional: handle "seen" status
		});
	},

	subscribeToUpdates: () => {
		const socket = useAuthStore.getState().socket;
		if (!socket) return;

		socket.on("typing:update", ({ senderId, isTyping }) => {
			set((state) => ({
				chats: state.chats.map((chat) =>
					chat.id === senderId ? { ...chat, typing: isTyping } : chat,
				),
			}));
		});

		socket.on("unreadUpdate", ({ senderId, count }) => {
			set((state) => ({
				chats: state.chats.map((chat) =>
					chat.id === senderId ? { ...chat, unread: count } : chat,
				),
			}));
		});

		socket.on("messagesRead", () => {
			// Optional: handle "seen" status if implemented in UI
		});
	},

	unsubscribeFromUpdates: () => {
		const socket = useAuthStore.getState().socket;
		if (socket) {
			socket.off("typing:update");
			socket.off("unreadUpdate");
			socket.off("messagesRead");
		}
	},
}));

export default useChatStore;
