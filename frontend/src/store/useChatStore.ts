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
	selectedChat: Chat | null;
	setSelectedChat: (chat: Chat | null) => void;
	replyingTo: Message | null;
	setReplyingTo: (message: Message | null) => void;
	getContacts: (page?: number, search?: string) => Promise<void>;
	loadMoreContacts: (search?: string) => Promise<void>;
	getChatPartners: (search?: string) => Promise<Chat[] | undefined>;
	getMessages: (id: string) => Promise<void>;
	loadMoreMessages: (id: string) => Promise<void>;
	sendMessage: (
		messageData: { text?: string; image?: string },
		imageFile?: File | null,
		imagePreview?: string | null,
	) => Promise<void>;
	deleteMessage: (messageId: string) => Promise<void>;
	markAsRead: (id: string) => Promise<void>;
	togglePin: (chatId: string) => Promise<void>;
	createGroup: (
		name: string,
		participants: string[],
		avatar?: string,
	) => Promise<void>;
	addMembers: (groupId: string, participants: string[]) => Promise<void>;
	removeMember: (groupId: string, userId: string) => Promise<void>;
	leaveGroup: (groupId: string) => Promise<void>;
	deleteGroup: (groupId: string) => Promise<void>;
	deleteDirectChat: (chatId: string) => Promise<void>;
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
	selectedChat: null,
	replyingTo: null,
	setReplyingTo: (message) => set({ replyingTo: message }),
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
	setSelectedChat: (selectedChat) => set({ selectedChat }),

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
			return chats;
		} catch (error) {
			toast.error((error as ErrorResponse)?.message ?? "Failed to fetch chats");
		} finally {
			set({ isChatsLoading: false });
		}
	},

	getMessages: async (id) => {
		set({ isMessagesLoading: true });
		try {
			// Try conversation ID first
			const { messages, hasMore, lastReadAt } =
				await messageApi.getMessagesByConversationId(id);
			set({ messages, messagesHasMore: hasMore, lastReadAt });
		} catch (error) {
			// Fallback to userId for direct chats selected from contacts
			try {
				const { messages, hasMore, lastReadAt } =
					await messageApi.getMessagesByUserId(id);
				set({ messages, messagesHasMore: hasMore, lastReadAt });
			} catch {
				toast.error(
					(error as ErrorResponse)?.message ?? "Failed to fetch messages",
				);
			}
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
			const { messages: older, hasMore } =
				await messageApi.getMessagesByConversationId(id, oldestId);
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
		const { selectedChat, messages, replyingTo } = get();
		const { user } = useAuthStore.getState();
		if (!selectedChat || !user) return;

		const tempId = `temp-${Date.now()}`;
		const now = new Date().toISOString();

		const optimisticMessage: Message = {
			_id: tempId,
			senderId: user._id,
			conversationId: selectedChat.id,
			replyTo: replyingTo || undefined,
			text: messageData.text,
			image: imagePreview ?? undefined,
			createdAt: now,
			updatedAt: now,
		};

		set({ messages: [...messages, optimisticMessage], replyingTo: null });

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

			const sentMessage = await messageApi.sendMessage(selectedChat.id, {
				...messageData,
				conversationId: selectedChat.id,
				replyTo: replyingTo?._id,
				image: imageUrl ?? undefined,
			});

			// If this was a new conversation (id was a user ID), update to conversation ID
			if (
				sentMessage.conversationId &&
				sentMessage.conversationId !== selectedChat.id
			) {
				set({ activeChatId: sentMessage.conversationId });
			}

			if (imagePreview) URL.revokeObjectURL(imagePreview);

			set((state) => {
				const newActiveChatId =
					sentMessage.conversationId &&
					sentMessage.conversationId !== state.activeChatId
						? sentMessage.conversationId
						: state.activeChatId;

				return {
					messages: state.messages.map((m) =>
						m._id === tempId ? sentMessage : m,
					),
					activeChatId: newActiveChatId,
					selectedChat: state.selectedChat
						? {
								...state.selectedChat,
								id: newActiveChatId || state.selectedChat.id,
							}
						: null,
				};
			});

			// Refresh chat list if this was a new conversation
			if (sentMessage.conversationId !== selectedChat?.id) {
				get().getChatPartners("");
			}
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

		set((state) => ({
			messages: state.messages.filter((m) => m._id !== messageId),
		}));

		try {
			await messageApi.deleteMessage(messageId);
		} catch (error) {
			set({ messages: snapshot });
			toast.error(
				(error as ErrorResponse)?.message ?? "Failed to delete message",
			);
		}
	},

	markAsRead: async (id) => {
		try {
			await messageApi.markAsRead(id);
			set((state) => ({
				chats: state.chats.map((chat) =>
					chat.id === id ? { ...chat, unread: 0 } : chat,
				),
			}));
		} catch (error) {
			console.error("Failed to mark as read", error);
		}
	},

	togglePin: async (chatId) => {
		const { chats } = get();
		const chat = chats.find((c) => c.id === chatId);
		if (!chat) return;

		const wasPinned = chat.isPinned;

		set((state) => ({
			chats: state.chats.map((c) =>
				c.id === chatId ? { ...c, isPinned: !wasPinned } : c,
			),
		}));

		try {
			const { isPinned } = await messageApi.togglePinChat(chatId);
			set((state) => ({
				chats: state.chats.map((c) =>
					c.id === chatId ? { ...c, isPinned } : c,
				),
			}));
		} catch (error) {
			set((state) => ({
				chats: state.chats.map((c) =>
					c.id === chatId ? { ...c, isPinned: wasPinned } : c,
				),
			}));
			toast.error((error as ErrorResponse)?.message ?? "Failed to update pin");
		}
	},

	createGroup: async (name, participants, avatar) => {
		try {
			const newGroup = await messageApi.createGroup({
				name,
				participants,
				groupAvatar: avatar,
			});
			get().getChatPartners();
			return newGroup;
		} catch (error) {
			toast.error(
				(error as ErrorResponse)?.message ?? "Failed to create group",
			);
		}
	},

	addMembers: async (groupId, participants) => {
		try {
			await messageApi.addMembers(groupId, participants);
			const chats = await get().getChatPartners("");
			if (chats && chats.length > 0) {
				const updatedChat = chats.find((c) => c.id === groupId);
				if (updatedChat) {
					set({ selectedChat: updatedChat });
				}
			}
		} catch (error) {
			toast.error((error as ErrorResponse)?.message ?? "Failed to add members");
		}
	},

	removeMember: async (groupId, userId) => {
		const state = get();
		try {
			await messageApi.removeMember(groupId, userId);
			// Update selectedChat immediately
			if (state.selectedChat?.id === groupId && state.selectedChat.members) {
				set({
					selectedChat: {
						...state.selectedChat,
						members: state.selectedChat.members.filter((m) => m.id !== userId),
					},
				});
			}
			// Refresh chat list in background
			get().getChatPartners("");
		} catch (error) {
			toast.error(
				(error as ErrorResponse)?.message ?? "Failed to remove member",
			);
		}
	},

	leaveGroup: async (groupId) => {
		try {
			await messageApi.leaveGroup(groupId);
			set({
				activeChatId: undefined,
				selectedChat: null,
				chats: get().chats.filter((c) => c.id !== groupId),
			});
		} catch (error) {
			toast.error((error as ErrorResponse)?.message ?? "Failed to leave group");
		}
	},

	deleteGroup: async (groupId) => {
		try {
			await messageApi.deleteGroup(groupId);
			set((state) => ({
				chats: state.chats.filter((c) => c.id !== groupId),
				activeChatId:
					state.activeChatId === groupId ? undefined : state.activeChatId,
				selectedChat:
					state.selectedChat?.id === groupId ? null : state.selectedChat,
			}));
		} catch (error) {
			toast.error(
				(error as ErrorResponse)?.message ?? "Failed to delete group",
			);
		}
	},

	deleteDirectChat: async (chatId) => {
		const state = get();
		try {
			await messageApi.deleteDirectChat(chatId);
			set({
				chats: state.chats.filter((c) => c.id !== chatId),
				activeChatId:
					state.activeChatId === chatId ? undefined : state.activeChatId,
				selectedChat:
					state.selectedChat?.id === chatId ? null : state.selectedChat,
			});
		} catch (error) {
			toast.error((error as ErrorResponse)?.message ?? "Failed to delete chat");
		}
	},

	subscribeToMessages: () => {
		// Handled by initGlobalSubscriptions — no separate listener needed
	},

	unsubscribeFromMessages: () => {
		// Handled by initGlobalSubscriptions — no separate listener needed
	},

	initGlobalSubscriptions: () => {
		const socket = useAuthStore.getState().socket;
		if (!socket) return;

		// Remove any existing listeners first to prevent duplicates
		socket.off("typing:update");
		socket.off("unreadUpdate");
		socket.off("messagesRead");
		socket.off("newMessage");

		socket.on(
			"typing:update",
			({
				conversationId,
				isTyping,
				senderName,
			}: {
				conversationId: string;
				isTyping: boolean;
				senderName?: string;
			}) => {
				set((state) => ({
					chats: state.chats.map((chat) =>
						chat.id === conversationId
							? {
									...chat,
									typing: isTyping,
									typingUser: isTyping ? senderName : undefined,
								}
							: chat,
					),
				}));
			},
		);

		socket.on(
			"unreadUpdate",
			({
				conversationId,
				count,
			}: {
				conversationId: string;
				count: number;
			}) => {
				set((state) => ({
					chats: state.chats.map((chat) =>
						chat.id === conversationId ? { ...chat, unread: count } : chat,
					),
				}));
			},
		);

		socket.on("messagesRead", () => {
			// Optional: handle "seen" status
		});

		// Global newMessage handler: updates chat list (not the active conversation's messages)
		socket.on("newMessage", (message: Message) => {
			const state = get();
			const currentUser = useAuthStore.getState().user;
			const senderId =
				typeof message.senderId === "string"
					? message.senderId
					: (message.senderId as { _id: string })._id;

			// Ignore own messages (already handled by optimistic update)
			if (senderId === currentUser?._id) return;

			// Check if this conversation is in our chats list
			const existingChat = state.chats.find(
				(c) => c.id === message.conversationId,
			);

			if (!existingChat) {
				// New conversation — refresh the list
				state.getChatPartners("");
				return;
			}

			// If this is the currently active chat, add message to messages array
			if (
				state.selectedChat?.id === message.conversationId ||
				state.activeChatId === message.conversationId
			) {
				set((s) => ({
					messages: [
						...s.messages.filter((m) => m._id !== message._id),
						message,
					],
				}));

				// Play sound
				if (state.isSoundEnabled) {
					const notificationSound = new Audio("/sounds/notification.mp3");
					notificationSound.currentTime = 0;
					notificationSound.play().catch(() => {});
				}
			}

			// Update chat list with latest message info
			set((s) => ({
				chats: s.chats.map((c) =>
					c.id === message.conversationId
						? {
								...c,
								message: message.image ? "📷 Image" : message.text || "",
								lastUpdated: new Date().toLocaleTimeString([], {
									hour: "2-digit",
									minute: "2-digit",
								}),
								lastUpdatedTimestamp: Date.now(),
								unread: s.selectedChat?.id === c.id ? c.unread : c.unread + 1,
							}
						: c,
				),
			}));
		});
	},

	subscribeToUpdates: () => {
		// Now handled by initGlobalSubscriptions
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
