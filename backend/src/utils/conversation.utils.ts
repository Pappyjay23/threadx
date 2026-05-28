import mongoose from "mongoose";
import Message from "../models/message.model.js";
import Conversation from "../models/conversation.model.js";
import type { IConversation } from "../models/conversation.model.js";

/**
 * Reconciles the unread count for a specific user in a conversation.
 * It counts messages from the partner that were created after the user's lastReadAt.
 */
export const reconcileUnreadCount = async (userId: string, partnerId: string) => {
	const participants = [userId, partnerId].sort().map(id => new mongoose.Types.ObjectId(id));
	const conversation = await Conversation.findOne({ participants }) as IConversation | null;

	const lastReadAt = conversation?.lastReadAt?.get(userId) || new Date(0);

	const actualCount = await Message.countDocuments({
		senderId: partnerId,
		receiverId: userId,
		createdAt: { $gt: lastReadAt },
	});

	if (conversation) {
		if (conversation.unreadCount.get(userId) !== actualCount) {
			conversation.unreadCount.set(userId, actualCount);
			await conversation.save();
		}
	} else if (actualCount > 0) {
		// If conversation doesn't exist but has unread messages, create it
		const newConv = new Conversation({
			participants,
			unreadCount: { [userId]: actualCount },
			lastMessageAt: new Date(),
		});
		await newConv.save();
	}

	return actualCount;
};
