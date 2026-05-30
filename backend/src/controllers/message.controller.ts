import type { Response } from "express";
import mongoose from "mongoose";
import cloudinary from "../config/cloudinary.config.js";
import { ENV } from "../config/env.config.js";
import type { AuthRequest } from "../middlewares/auth.middleware.js";
import Conversation from "../models/conversation.model.js";
import type { IConversation } from "../models/conversation.model.js";
import Message from "../models/message.model.js";
import User from "../models/user.model.js";
import type { IUser } from "../models/user.model.js";
import {
	sendErrorResponse,
	sendSuccessResponse,
} from "../utils/response.utils.js";
import { getReceiverSocketId, io } from "../config/socket.config.js";
import { reconcileUnreadCount } from "../utils/conversation.utils.js";

const CONTACTS_PAGE_LIMIT = 20;
const MESSAGES_PAGE_LIMIT = 30;

export const getContacts = async (req: AuthRequest, res: Response) => {
	try {
		const loggedInUserId = req.user?.id;
		if (!loggedInUserId) return sendErrorResponse(res, 401, "Unauthorized");

		const page = Math.max(1, parseInt(req.query.page as string) || 1);
		const limit = CONTACTS_PAGE_LIMIT;
		const search = (req.query.search as string)?.trim() ?? "";

		const searchFilter = search
			? {
					$or: [
						{ firstName: { $regex: search, $options: "i" } },
						{ lastName: { $regex: search, $options: "i" } },
						{ email: { $regex: search, $options: "i" } },
					],
				}
			: {};

		const filter = {
			_id: { $ne: loggedInUserId },
			...searchFilter,
		};

		const [users, total] = await Promise.all([
			User.find(filter)
				.select("-password -__v")
				.skip((page - 1) * limit)
				.limit(limit),
			User.countDocuments(filter),
		]);

		const contacts = users.map((user) => ({
			id: user._id.toString(),
			name: `${user.firstName}${user.lastName ? ` ${user.lastName}` : ""}`,
			email: user.email,
			image: user.picture ?? "",
			username: user.email.split("@")[0],
			dateJoined: new Date(user.createdAt).toLocaleDateString("en-US", {
				month: "long",
				day: "numeric",
				year: "numeric",
			}),
		}));

		sendSuccessResponse(res, 200, "Contacts fetched successfully", {
			contacts,
			pagination: {
				page,
				limit,
				total,
				hasMore: page * limit < total,
			},
		});
	} catch (error) {
		console.log("Error in getContacts:", error);
		sendErrorResponse(res, 500, "Error fetching contacts");
	}
};

export const getChats = async (req: AuthRequest, res: Response) => {
	try {
		const loggedInUserId = req.user?.id;
		if (!loggedInUserId) return sendErrorResponse(res, 401, "Unauthorized");

		const search = (req.query.search as string)?.trim() ?? "";
		const userObjectId = new mongoose.Types.ObjectId(loggedInUserId);

		const currentUser =
			await User.findById(loggedInUserId).select("pinnedChats");
		const pinnedChatIds = new Set(
			currentUser?.pinnedChats?.map((id) => id.toString()) || [],
		);

		// Find conversations where user is a participant (handle both legacy and new)
		const conversations = await Conversation.find({
			$and: [
				{
					participants: userObjectId,
					$or: [
						{ type: "group" },
						{ type: "direct" },
						{ type: { $exists: false } },
					],
				},
				{
					$or: [
						{ [`hidden.${loggedInUserId}`]: { $exists: false } },
						{ [`hidden.${loggedInUserId}`]: false },
					],
				},
			],
		})
			.sort({ lastMessageAt: -1 })
			.populate("participants", "-password -__v");

		const chats = await Promise.all(
			conversations.map(async (conv) => {
				const isDirectChat = conv.type === "direct" || !conv.type;

				let lastMessage;
				if (isDirectChat) {
					// Direct chat: include both new and legacy messages
					lastMessage = await Message.findOne({
						$or: [
							{ conversationId: conv._id },
							{
								$or: [
									{
										senderId: userObjectId,
										receiverId: { $in: conv.participants },
									},
									{
										senderId: { $in: conv.participants },
										receiverId: userObjectId,
									},
								],
							},
						],
					}).sort({ createdAt: -1 });
				} else {
					// Group chat: ONLY messages with this conversationId
					lastMessage = await Message.findOne({
						conversationId: conv._id,
					}).sort({ createdAt: -1 });
				}

				let partner = null;
				let chatName = conv.name || "Untitled Group";
				let chatImage = conv.groupAvatar || "";
				let email = "";
				let username = "";
				let dateJoined = "";

				if (conv.type === "direct" || !conv.type) {
					// Treat missing type as direct chat (legacy)
					partner = (conv.participants as unknown as IUser[]).find(
						(p) => p._id.toString() !== loggedInUserId,
					);
					if (partner) {
						chatName =
							partner.firstName +
							(partner.lastName ? ` ${partner.lastName}` : "");
						chatImage = partner.picture || "";
						email = partner.email || "";
						username = partner.email?.split("@")[0] || "";
						dateJoined = new Date(partner.createdAt).toLocaleDateString(
							"en-US",
							{
								month: "long",
								day: "numeric",
								year: "numeric",
							},
						);
					} else {
						chatName = "Deleted User";
					}
				}

				if (search && !chatName.toLowerCase().includes(search.toLowerCase())) {
					return null;
				}

				// Build members list for groups
				let members: { id: string; name: string; image: string }[] = [];
				if (conv.type === "group") {
					members = (conv.participants as unknown as IUser[]).map((p) => ({
						id: p._id.toString(),
						name: `${p.firstName}${p.lastName ? ` ${p.lastName}` : ""}`,
						image: p.picture || "",
					}));
				}

				return {
					id: conv._id.toString(),
					partnerId: partner?._id?.toString(),
					type: conv.type || "direct",
					name: chatName,
					image: chatImage,
					email,
					username,
					dateJoined,
					admin: conv.admin?.toString(),
					members,
					message: lastMessage
						? lastMessage.image
							? "📷 Image"
							: lastMessage.text
						: "No messages yet",
					unread: conv.unreadCount?.get(loggedInUserId) || 0,
					typing: false,
					isPinned: pinnedChatIds.has(conv._id.toString()),
					lastUpdated: conv.lastMessageAt
						? new Date(conv.lastMessageAt).toLocaleTimeString([], {
								hour: "2-digit",
								minute: "2-digit",
							})
						: "",
					lastUpdatedTimestamp: conv.lastMessageAt
						? new Date(conv.lastMessageAt).getTime()
						: 0,
				};
			}),
		);

		const filteredChats = chats
			.filter((c): c is NonNullable<typeof c> => c !== null)
			.sort((a, b) => {
				if (a.isPinned && !b.isPinned) return -1;
				if (!a.isPinned && b.isPinned) return 1;
				return b.lastUpdatedTimestamp - a.lastUpdatedTimestamp;
			});

		sendSuccessResponse(res, 200, "Chats fetched successfully", filteredChats);
	} catch (error) {
		console.log("Error in getChats:", error);
		sendErrorResponse(res, 500, "Error fetching chats");
	}
};

export const getMessagesByConversationId = async (
	req: AuthRequest,
	res: Response,
) => {
	try {
		const rawConversationId = req.params.id;
		const conversationId =
			typeof rawConversationId === "string"
				? rawConversationId
				: rawConversationId?.[0];
		const loggedInUserId = req.user?.id;

		if (!loggedInUserId) return sendErrorResponse(res, 401, "Unauthorized");
		if (!conversationId)
			return sendErrorResponse(res, 400, "Conversation id not provided");

		const conversation = await Conversation.findById(conversationId);
		if (!conversation)
			return sendErrorResponse(res, 404, "Conversation not found");
		if (
			!conversation.participants.some((p) => p.toString() === loggedInUserId)
		) {
			return sendErrorResponse(res, 403, "Forbidden — not a participant");
		}

		const cursor = req.query.cursor as string | undefined;
		const limit = MESSAGES_PAGE_LIMIT;

		const isDirect = conversation.type === "direct" || !conversation.type;

		let filter: Record<string, unknown>;

		if (isDirect) {
			// For direct chats: include both new messages (conversationId) and legacy messages (senderId/receiverId)
			const otherParticipant = conversation.participants.find(
				(p) => p.toString() !== loggedInUserId,
			);

			filter = {
				$or: [
					{ conversationId: new mongoose.Types.ObjectId(conversationId) },
					...(otherParticipant
						? [
								{
									$or: [
										{
											senderId: new mongoose.Types.ObjectId(loggedInUserId),
											receiverId: new mongoose.Types.ObjectId(
												otherParticipant.toString(),
											),
										},
										{
											senderId: new mongoose.Types.ObjectId(
												otherParticipant.toString(),
											),
											receiverId: new mongoose.Types.ObjectId(loggedInUserId),
										},
									],
								},
							]
						: []),
				],
			};
		} else {
			// For groups: ONLY fetch messages with matching conversationId
			filter = { conversationId: new mongoose.Types.ObjectId(conversationId) };
		}

		if (cursor) {
			filter._id = { $lt: new mongoose.Types.ObjectId(cursor) };
		}

		const messages = await Message.find(filter)
			.select("-__v")
			.populate({
				path: "senderId",
				select: "firstName lastName picture",
			})
			.populate({
				path: "replyTo",
				populate: {
					path: "senderId",
					select: "firstName lastName",
				},
			})
			.sort({ _id: -1 })
			.limit(limit + 1);

		const hasMore = messages.length > limit;
		if (hasMore) messages.pop();

		messages.reverse();

		const lastReadAt = conversation.lastReadAt?.get(loggedInUserId) || null;

		sendSuccessResponse(res, 200, "Messages fetched successfully", {
			messages,
			hasMore,
			lastReadAt,
		});
	} catch (error) {
		console.log("Error in getMessagesByConversationId:", error);
		sendErrorResponse(res, 500, "Error fetching messages");
	}
};

export const getMessagesByUserId = async (req: AuthRequest, res: Response) => {
	try {
		const rawUserToChatId = req.params.id;
		const userToChatId =
			typeof rawUserToChatId === "string"
				? rawUserToChatId
				: rawUserToChatId?.[0];
		const loggedInUserId = req.user?.id;

		if (!loggedInUserId) return sendErrorResponse(res, 401, "Unauthorized");
		if (!userToChatId)
			return sendErrorResponse(res, 400, "Chat id not provided");

		// Find direct conversation (handle both legacy and new)
		const participants = [loggedInUserId as string, userToChatId as string]
			.sort()
			.map((id) => new mongoose.Types.ObjectId(id));

		const conversation = await Conversation.findOne({
			participants,
			$or: [{ type: "direct" }, { type: { $exists: false } }],
		});

		if (!conversation) {
			// Fall back to old message query for legacy messages without a conversation
			const cursor = req.query.cursor as string | undefined;
			const limit = MESSAGES_PAGE_LIMIT;

			const filter: Record<string, unknown> = {
				$or: [
					{
						senderId: new mongoose.Types.ObjectId(loggedInUserId),
						receiverId: new mongoose.Types.ObjectId(userToChatId),
					},
					{
						senderId: new mongoose.Types.ObjectId(userToChatId),
						receiverId: new mongoose.Types.ObjectId(loggedInUserId),
					},
				],
			};

			if (cursor) {
				filter._id = { $lt: new mongoose.Types.ObjectId(cursor) };
			}

			const messages = await Message.find(filter)
				.select("-__v")
				.sort({ _id: -1 })
				.limit(limit + 1);

			const hasMore = messages.length > limit;
			if (hasMore) messages.pop();
			messages.reverse();

			return sendSuccessResponse(res, 200, "Messages fetched successfully", {
				messages,
				hasMore,
				lastReadAt: null,
			});
		}

		// Delegate to conversation-based fetching
		req.params.id = conversation._id.toString();
		return getMessagesByConversationId(req, res);
	} catch (error) {
		console.log("Error in getMessagesByUserId:", error);
		sendErrorResponse(res, 500, "Error fetching messages");
	}
};

export const uploadMessageSignature = (req: AuthRequest, res: Response) => {
	const timestamp = Math.round(Date.now() / 1000);
	const folder = "threadx/messages";
	const signature = cloudinary.utils.api_sign_request(
		{ timestamp, folder },
		ENV.CLOUDINARY_API_SECRET!,
	);
	res.json({
		timestamp,
		signature,
		cloudName: ENV.CLOUDINARY_CLOUD_NAME,
		apiKey: ENV.CLOUDINARY_API_KEY,
		folder,
	});
};

export const sendMessage = async (req: AuthRequest, res: Response) => {
	try {
		const loggedInUserId = req.user?.id;
		if (!loggedInUserId) return sendErrorResponse(res, 401, "Unauthorized");

		const partnerId = req.params.id;
		const { text, image, conversationId, replyTo } = req.body;

		if (!text && !image)
			return res.status(400).json({ message: "Text or image is required." });

		let conversation;

		if (conversationId) {
			// Try to find existing conversation
			conversation = await Conversation.findById(conversationId);

			if (conversation) {
				// Existing conversation found — verify participation
				if (
					!conversation.participants.some(
						(p) => p.toString() === loggedInUserId,
					)
				) {
					return sendErrorResponse(res, 403, "Forbidden — not a participant");
				}
			}
		}

		// If no conversation found yet (new direct chat or invalid conversationId), use partnerId
		if (!conversation && partnerId) {
			if (loggedInUserId === partnerId)
				return res
					.status(400)
					.json({ message: "You cannot send a message to yourself." });

			const receiverExists = await User.exists({ _id: partnerId });
			if (!receiverExists)
				return res.status(404).json({ message: "Receiver not found." });

			const participants = [loggedInUserId as string, partnerId as string]
				.sort()
				.map((id) => new mongoose.Types.ObjectId(id));

			conversation = await Conversation.findOneAndUpdate(
				{ participants, type: "direct" },
				{ $set: { lastMessageAt: new Date() } },
				{ upsert: true, returnDocument: "after" },
			);
		}

		if (!conversation) {
			return sendErrorResponse(
				res,
				400,
				"Conversation ID or Partner ID is required",
			);
		}

		const message = await Message.create({
			senderId: loggedInUserId,
			receiverId:
				conversation.type === "direct"
					? conversation.participants.find(
							(p) => p.toString() !== loggedInUserId,
						) || null
					: null,
			conversationId: conversation._id,
			replyTo: replyTo || null,
			text: text || "",
			image: image || "",
		});

		const unreadUpdates: Record<string, number> = {};
		conversation.participants.forEach((p) => {
			const pId = p.toString();
			if (pId !== loggedInUserId) {
				unreadUpdates[`unreadCount.${pId}`] = 1;
			}
		});

		await Conversation.findByIdAndUpdate(conversation._id, {
			$set: { lastMessageAt: new Date() },
			$inc: unreadUpdates,
			$unset: Object.fromEntries(
				conversation.participants.map((p) => [`hidden.${p.toString()}`, ""]),
			),
		});

		const populatedMessage = await Message.findById((message as any)._id)
			.populate("senderId", "firstName lastName picture")
			.populate({
				path: "replyTo",
				populate: { path: "senderId", select: "firstName lastName" },
			});

		if (!populatedMessage) throw new Error("Failed to fetch populated message");

		conversation.participants.forEach((p) => {
			const pId = p.toString();
			if (pId !== loggedInUserId) {
				const socketId = getReceiverSocketId(pId);
				if (socketId) {
					io.to(socketId).emit("newMessage", populatedMessage);
				}
			}
		});

		sendSuccessResponse(
			res,
			201,
			"Message sent successfully",
			populatedMessage,
		);
	} catch (error) {
		console.log("Error in sendMessage:", error);
		sendErrorResponse(res, 500, "Error sending message");
	}
};

export const markAsRead = async (req: AuthRequest, res: Response) => {
	try {
		const loggedInUserId = req.user?.id;
		const conversationId = req.params.id;

		if (!loggedInUserId) return sendErrorResponse(res, 401, "Unauthorized");
		if (!conversationId)
			return sendErrorResponse(res, 400, "Conversation id not provided");

		await Conversation.findByIdAndUpdate(
			conversationId,
			{
				$set: {
					[`lastReadAt.${loggedInUserId}`]: new Date(),
					[`unreadCount.${loggedInUserId}`]: 0,
				},
			},
			{ returnDocument: "after" },
		);

		sendSuccessResponse(res, 200, "Messages marked as read");
	} catch (error) {
		console.log("Error in markAsRead:", error);
		sendErrorResponse(res, 500, "Error marking messages as read");
	}
};

export const createGroup = async (req: AuthRequest, res: Response) => {
	try {
		const loggedInUserId = req.user?.id;
		const { name, participants, groupAvatar } = req.body;

		if (!loggedInUserId) return sendErrorResponse(res, 401, "Unauthorized");
		if (
			!name ||
			!participants ||
			!Array.isArray(participants) ||
			participants.length === 0
		) {
			return sendErrorResponse(
				res,
				400,
				"Group name and at least one participant are required",
			);
		}

		// Ensure all participant IDs are valid
		const allParticipants = [...new Set([loggedInUserId, ...participants])];

		const conversation = await Conversation.create({
			type: "group",
			name,
			groupAvatar: groupAvatar || "",
			participants: allParticipants,
			admin: loggedInUserId,
			lastMessageAt: new Date(),
		});

		sendSuccessResponse(res, 201, "Group created successfully", conversation);
	} catch (error) {
		console.log("Error in createGroup:", error);
		sendErrorResponse(res, 500, "Error creating group");
	}
};

export const updateGroup = async (req: AuthRequest, res: Response) => {
	try {
		const loggedInUserId = req.user?.id;
		const { id } = req.params;
		const { name, groupAvatar } = req.body;

		const group = await Conversation.findById(id);
		if (!group || group.type !== "group")
			return sendErrorResponse(res, 404, "Group not found");
		if (group.admin?.toString() !== loggedInUserId)
			return sendErrorResponse(res, 403, "Only admin can update group");

		group.name = name || group.name;
		group.groupAvatar = groupAvatar || group.groupAvatar;
		await group.save();

		sendSuccessResponse(res, 200, "Group updated successfully", group);
	} catch (error) {
		console.log("Error in updateGroup:", error);
		sendErrorResponse(res, 500, "Error updating group");
	}
};

export const addMembers = async (req: AuthRequest, res: Response) => {
	try {
		const loggedInUserId = req.user?.id;
		const { id } = req.params;
		const { participants } = req.body;

		const group = await Conversation.findById(id);
		if (!group || group.type !== "group")
			return sendErrorResponse(res, 404, "Group not found");
		if (group.admin?.toString() !== loggedInUserId)
			return sendErrorResponse(res, 403, "Only admin can add members");

		group.participants = [
			...new Set([
				...group.participants.map((p) => p.toString()),
				...participants,
			]),
		].map((p) => new mongoose.Types.ObjectId(p));
		await group.save();

		sendSuccessResponse(res, 200, "Members added successfully", group);
	} catch (error) {
		console.log("Error in addMembers:", error);
		sendErrorResponse(res, 500, "Error adding members");
	}
};

export const removeMember = async (req: AuthRequest, res: Response) => {
	try {
		const loggedInUserId = req.user?.id;
		const { id } = req.params;
		const { userId } = req.body;

		const group = await Conversation.findById(id);
		if (!group || group.type !== "group")
			return sendErrorResponse(res, 404, "Group not found");
		if (group.admin?.toString() !== loggedInUserId)
			return sendErrorResponse(res, 403, "Only admin can remove members");
		if (userId === group.admin?.toString())
			return sendErrorResponse(res, 400, "Cannot remove admin");

		group.participants = group.participants.filter(
			(p) => p.toString() !== userId,
		);
		await group.save();

		sendSuccessResponse(res, 200, "Member removed successfully", group);
	} catch (error) {
		console.log("Error in removeMember:", error);
		sendErrorResponse(res, 500, "Error removing member");
	}
};

export const leaveGroup = async (req: AuthRequest, res: Response) => {
	try {
		const loggedInUserId = req.user?.id;
		const { id } = req.params;

		const group = await Conversation.findById(id);
		if (!group || group.type !== "group")
			return sendErrorResponse(res, 404, "Group not found");
		if (group.admin?.toString() === loggedInUserId)
			return sendErrorResponse(
				res,
				400,
				"Admin cannot leave. Delete the group instead.",
			);

		group.participants = group.participants.filter(
			(p) => p.toString() !== loggedInUserId,
		);
		await group.save();

		sendSuccessResponse(res, 200, "Left group successfully");
	} catch (error) {
		console.log("Error in leaveGroup:", error);
		sendErrorResponse(res, 500, "Error leaving group");
	}
};

export const deleteGroup = async (req: AuthRequest, res: Response) => {
	try {
		const loggedInUserId = req.user?.id;
		const rawId = req.params.id;
		const id = typeof rawId === "string" ? rawId : rawId?.[0];

		if (!loggedInUserId) return sendErrorResponse(res, 401, "Unauthorized");
		if (!id) return sendErrorResponse(res, 400, "Group id not provided");

		const group = await Conversation.findById(id);
		if (!group || group.type !== "group")
			return sendErrorResponse(res, 404, "Group not found");
		if (group.admin?.toString() !== loggedInUserId)
			return sendErrorResponse(res, 403, "Only admin can delete the group");

		// Delete group avatar from Cloudinary if it exists
		if (group.groupAvatar) {
			const urlParts = group.groupAvatar.split("/");
			const publicId = urlParts.slice(-3).join("/").split(".")[0];
			if (publicId) {
				await cloudinary.uploader.destroy(publicId);
			}
		}

		// Delete all messages with images in this conversation from Cloudinary
		const messagesWithImages = await Message.find({
			conversationId: id,
			image: { $exists: true, $ne: "" },
		});

		for (const message of messagesWithImages) {
			if (message.image) {
				const urlParts = message.image.split("/");
				const publicId = urlParts.slice(-3).join("/").split(".")[0];
				if (publicId) {
					await cloudinary.uploader.destroy(publicId);
				}
			}
		}

		const conversationObjectId = new mongoose.Types.ObjectId(id);

		// Delete all messages in this conversation
		await Message.deleteMany({ conversationId: conversationObjectId });

		// Delete the conversation itself
		await Conversation.findByIdAndDelete(id);

		sendSuccessResponse(res, 200, "Group deleted successfully");
	} catch (error) {
		console.log("Error in deleteGroup:", error);
		sendErrorResponse(res, 500, "Error deleting group");
	}
};

export const deleteDirectChat = async (req: AuthRequest, res: Response) => {
	try {
		const loggedInUserId = req.user?.id;
		const rawConversationId = req.params.id;
		const conversationId =
			typeof rawConversationId === "string"
				? rawConversationId
				: rawConversationId?.[0];

		if (!loggedInUserId) return sendErrorResponse(res, 401, "Unauthorized");
		if (!conversationId)
			return sendErrorResponse(res, 400, "Conversation id not provided");

		const conversation = await Conversation.findById(conversationId);
		if (!conversation)
			return sendErrorResponse(res, 404, "Conversation not found");
		if (conversation.type === "group") {
			return sendErrorResponse(
				res,
				400,
				"Use delete group endpoint for group chats",
			);
		}
		if (
			!conversation.participants.some((p) => p.toString() === loggedInUserId)
		) {
			return sendErrorResponse(res, 403, "Forbidden — not a participant");
		}

		// Soft delete: mark as hidden for this user
		conversation.hidden.set(loggedInUserId, true);
		conversation.unreadCount.set(loggedInUserId, 0);
		await conversation.save();

		// Remove from pinned chats
		await User.findByIdAndUpdate(loggedInUserId, {
			$pull: { pinnedChats: new mongoose.Types.ObjectId(conversationId) },
		});

		sendSuccessResponse(res, 200, "Chat deleted successfully");
	} catch (error) {
		console.log("Error in deleteDirectChat:", error);
		sendErrorResponse(res, 500, "Error deleting chat");
	}
};

export const uploadGroupAvatarSignature = (req: AuthRequest, res: Response) => {
	const timestamp = Math.round(Date.now() / 1000);
	const folder = "threadx/group-avatars";
	const signature = cloudinary.utils.api_sign_request(
		{ timestamp, folder },
		ENV.CLOUDINARY_API_SECRET!,
	);
	res.json({
		timestamp,
		signature,
		cloudName: ENV.CLOUDINARY_CLOUD_NAME,
		apiKey: ENV.CLOUDINARY_API_KEY,
		folder,
	});
};

export const deleteMessage = async (req: AuthRequest, res: Response) => {
	try {
		const loggedInUserId = req.user?.id;
		if (!loggedInUserId) return sendErrorResponse(res, 401, "Unauthorized");

		const { messageId } = req.params;

		const message = await Message.findById(messageId);
		if (!message) return sendErrorResponse(res, 404, "Message not found");

		if (message.senderId.toString() !== loggedInUserId) {
			return sendErrorResponse(
				res,
				403,
				"Forbidden — you can only delete your own messages",
			);
		}

		// If message has an image, delete it from Cloudinary first
		if (message.image) {
			const urlParts = message.image.split("/");
			const publicId = urlParts.slice(-3).join("/").split(".")[0];
			await cloudinary.uploader.destroy(publicId!);
		}

		const conversationId = message.conversationId.toString();
		const participants =
			(await Conversation.findById(conversationId))?.participants.map((p) =>
				p.toString(),
			) || [];

		await Message.findByIdAndDelete(messageId);

		// Reconcile unread counts for ALL participants in the conversation
		if (participants.length > 0) {
			await Promise.all(
				participants.map((pId) => reconcileUnreadCount(conversationId, pId)),
			);
		}

		sendSuccessResponse(res, 200, "Message deleted successfully", null);
	} catch (error) {
		console.log("Error in deleteMessage:", error);
		sendErrorResponse(res, 500, "Error deleting message");
	}
};

export const pinChat = async (req: AuthRequest, res: Response) => {
	try {
		const loggedInUserId = req.user?.id;
		const rawConversationId = req.params.id;
		const conversationId =
			typeof rawConversationId === "string"
				? rawConversationId
				: rawConversationId?.[0];

		if (!loggedInUserId) return sendErrorResponse(res, 401, "Unauthorized");
		if (!conversationId)
			return sendErrorResponse(res, 400, "Conversation id not provided");

		const user = await User.findById(loggedInUserId);
		if (!user) return sendErrorResponse(res, 404, "User not found");

		const conversationObjectId = new mongoose.Types.ObjectId(conversationId);
		const isPinned = user.pinnedChats.some(
			(id) => id.toString() === conversationId,
		);

		let updatedUser;
		if (isPinned) {
			updatedUser = await User.findByIdAndUpdate(
				loggedInUserId,
				{ $pull: { pinnedChats: conversationObjectId } },
				{ returnDocument: "after" },
			);
		} else {
			updatedUser = await User.findByIdAndUpdate(
				loggedInUserId,
				{ $addToSet: { pinnedChats: conversationObjectId } },
				{ returnDocument: "after" },
			);
		}

		sendSuccessResponse(res, 200, isPinned ? "Chat unpinned" : "Chat pinned", {
			pinnedChats: updatedUser?.pinnedChats || [],
			isPinned: !isPinned,
		});
	} catch (error) {
		console.log("Error in pinChat:", error);
		sendErrorResponse(res, 500, "Error pinning chat");
	}
};
