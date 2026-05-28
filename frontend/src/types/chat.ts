export type ActiveTab = "chats" | "contacts" | "profile";

export type Contact = {
	id: string;
	name: string;
	email: string;
	image: string;
	username: string;
	dateJoined: string;
};

export interface Chat extends Contact {
	message: string;
	unread: number;
	typing: boolean;
	isPinned: boolean;
	lastUpdated: string;
}

export type Message = {
  _id: string;
  senderId: string;
  receiverId: string;
  text?: string;
  image?: string;
  createdAt: string;
  updatedAt: string;
};