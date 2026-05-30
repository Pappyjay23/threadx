import mongoose from "mongoose";
import Message from "../models/message.model.js";
import Conversation from "../models/conversation.model.js";
import type { IConversation } from "../models/conversation.model.js";

/**
 * Reconciles the unread count for a specific user in a conversation.
 * It counts messages in the conversation that were created after the user's lastReadAt
 * and were NOT sent by the user themselves.
 */
export const reconcileUnreadCount = async (
	conversationId: string,
	userId: string,
) => {
	const conversation = await Conversation.findById(conversationId);
	if (!conversation) return 0;

	const lastReadAt = conversation.lastReadAt?.get(userId) || new Date(0);

	const actualCount = await Message.countDocuments({
		conversationId,
		senderId: { $ne: new mongoose.Types.ObjectId(userId) },
		createdAt: { $gt: lastReadAt },
	});

	if (conversation.unreadCount.get(userId) !== actualCount) {
		conversation.unreadCount.set(userId, actualCount);
		await conversation.save();
	}

	return actualCount;
};

/**
 * Legacy wrapper for direct conversations
 */
export const reconcileDirectUnreadCount = async (
	userId: string,
	partnerId: string,
) => {
	const participants = [userId, partnerId]
		.sort()
		.map((id) => new mongoose.Types.ObjectId(id));
	const conversation = await Conversation.findOne({ participants, type: "direct" });
	if (!conversation) return 0;
	return reconcileUnreadCount(conversation._id.toString(), userId);
};
