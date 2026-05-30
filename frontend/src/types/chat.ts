export type ActiveTab = "chats" | "contacts" | "profile";

export type Contact = {
	id: string;
	name: string;
	email: string;
	image: string;
	username: string;
	dateJoined: string;
};

export interface Chat {
	id: string;
	type: "direct" | "group";
	name: string;
	image: string;
	message: string;
	unread: number;
	typing: boolean;
	typingUser?: string;
	isPinned: boolean;
	lastUpdated: string;
	lastUpdatedTimestamp: number;
	admin?: string;
	partnerId?: string;
	email?: string;
	username?: string;
	dateJoined?: string;
	isOnline?: boolean;
	members?: { id: string; name: string; image: string }[];
}

export interface PopulatedSender {
	_id: string;
	firstName: string;
	lastName: string;
	picture: string;
}

export type Message = {
	_id: string;
	senderId: string | PopulatedSender;
	receiverId?: string;
	conversationId: string;
	replyTo?: Message;
	text?: string;
	image?: string;
	createdAt: string;
	updatedAt: string;
};
