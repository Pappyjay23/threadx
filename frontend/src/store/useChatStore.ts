import { create } from "zustand";

export type Contact = {
	id: string;
	name: string;
	email: string;
	image: string;
	username: string;
	isOnline: boolean;
};

export interface Chat extends Contact {
	username: string;
	message: string;
	unread: number;
	typing: boolean;
	isPinned: boolean;
	lastUpdated: string;
}

type ChatState = {
	chats: Chat[];
	contacts: Contact[];
	activeChatId?: string;
	isSoundEnabled: boolean;
	setActiveChatId: (id?: string) => void;
	getActiveChat: () => Chat | undefined;
	toggleSound: () => void;
};

const mockContacts = [
	{
		id: "1",
		name: "Ann Schleifer",
		email: "annschleifer@example.com",
		image:
			"https://images.unsplash.com/photo-1524502397800-2eeaad7c3fe5?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
		username: "annschleifer",
		isOnline: true,
	},
	{
		id: "2",
		name: "Hussein Saddam",
		email: "husseinsaddam@example.com",
		image: "",
		username: "husseinsaddam",
		isOnline: true,
	},
	{
		id: "3",
		name: "Vladimir Basuki",
		email: "vladimirbasuki@example.com",
		image: "",
		username: "vladimirbasuki",
		isOnline: false,
	},
];

const mockChats = [
	{
		id: "1",
		name: "Ann Schleifer",
		email: "annschleifer@example.com",
		username: "annschleifer",
		image:
			"https://images.unsplash.com/photo-1524502397800-2eeaad7c3fe5?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
		message: "Hey! Did you check out that new...",
		unread: 0,
		isOnline: true,
		typing: false,
		isPinned: true,
		lastUpdated: "10:00 AM",
	},
	{
		id: "2",
		name: "Hussein Saddam",
		email: "husseinsaddam@example.com",
		username: "husseinsaddam",
		image: "",
		message: "Typing...",
		unread: 3,
		isOnline: true,
		typing: true,
		isPinned: true,
		lastUpdated: "9:30 AM",
	},
	{
		id: "3",
		name: "Vladimir Basuki",
		email: "vladimirbasuki@example.com",
		username: "vladimirbasuki",
		image: "",
		message: "Nice! I have been wanting to...",
		unread: 0,
		isOnline: false,
		typing: false,
		isPinned: false,
		lastUpdated: "9:00 AM",
	},
];

const useChatStore = create<ChatState>((set, get) => ({
	chats: mockChats,
	contacts: mockContacts,
	isSoundEnabled: localStorage.getItem("isSoundEnabled") === "true",
	toggleSound: () => {
		localStorage.setItem("isSoundEnabled", String(!get().isSoundEnabled));
		set((state) => ({ isSoundEnabled: !state.isSoundEnabled }));
	},
	activeChatId: undefined,
	setActiveChatId: (id: string | undefined) => set({ activeChatId: id }),
	getActiveChat: () => {
		const { chats, activeChatId } = get();

		if (!activeChatId) {
			return undefined;
		}

		chats.find((c) => c.id === activeChatId);
	},
}));

export default useChatStore;
