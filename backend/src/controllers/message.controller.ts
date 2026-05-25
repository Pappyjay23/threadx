import type { Response } from "express";
import mongoose from "mongoose";
import cloudinary from "../config/cloudinary.config.js";
import { ENV } from "../config/env.config.js";
import type { AuthRequest } from "../middlewares/auth.middleware.js";
import Message from "../models/message.model.js";
import User from "../models/user.model.js";
import {
	sendErrorResponse,
	sendSuccessResponse,
} from "../utils/response.utils.js";

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
			isOnline: false,
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

		const conversations = await Message.aggregate([
			{
				$match: {
					$or: [{ senderId: userObjectId }, { receiverId: userObjectId }],
				},
			},
			{ $sort: { createdAt: -1 } },
			{
				$group: {
					_id: {
						$cond: [
							{ $eq: ["$senderId", userObjectId] },
							"$receiverId",
							"$senderId",
						],
					},
					lastMessage: { $first: "$text" },
					lastImage: { $first: "$image" },
					lastUpdated: { $first: "$createdAt" },
				},
			},
		]);

		const partnerIds = conversations.map((c) => c._id);

		// Apply search filter at the user lookup stage
		const userFilter: Record<string, unknown> = { _id: { $in: partnerIds } };
		if (search) {
			userFilter.$or = [
				{ firstName: { $regex: search, $options: "i" } },
				{ lastName: { $regex: search, $options: "i" } },
				{ email: { $regex: search, $options: "i" } },
			];
		}

		const users = await User.find(userFilter).select("-password -__v");
		const userMap = new Map(users.map((u) => [u._id.toString(), u]));

		const chats = conversations
			.filter((c) => userMap.has(c._id.toString())) // drop partners filtered out by search
			.map(({ _id, lastMessage, lastImage, lastUpdated }) => {
				const user = userMap.get(_id.toString());
				return {
					id: _id.toString(),
					name: user
						? `${user.firstName}${user.lastName ? ` ${user.lastName}` : ""}`
						: "Unknown",
					email: user?.email ?? "",
					image: user?.picture ?? "",
					username: user?.email?.split("@")[0] ?? "",
					dateJoined: user
						? new Date(user.createdAt).toLocaleDateString("en-US", {
								month: "long",
								day: "numeric",
								year: "numeric",
							})
						: "",
					isOnline: false,
					message: lastMessage ?? (lastImage ? "📷 Image" : ""),
					unread: 0,
					typing: false,
					isPinned: false,
					lastUpdated: new Date(lastUpdated).toLocaleTimeString([], {
						hour: "2-digit",
						minute: "2-digit",
					}),
				};
			});

		sendSuccessResponse(res, 200, "Chats fetched successfully", chats);
	} catch (error) {
		console.log("Error in getChats:", error);
		sendErrorResponse(res, 500, "Error fetching chats");
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

		// If cursor provided, only fetch messages older than that _id
		if (cursor) {
			filter._id = { $lt: new mongoose.Types.ObjectId(cursor) };
		}

		const messages = await Message.find(filter)
			.select("-__v")
			.sort({ _id: -1 }) // newest first so $lt cursor works correctly
			.limit(limit + 1); // fetch one extra to determine hasMore

		const hasMore = messages.length > limit;
		if (hasMore) messages.pop(); // remove the extra

		// Reverse so they render oldest → newest in the UI
		messages.reverse();

		sendSuccessResponse(res, 200, "Messages fetched successfully", {
			messages,
			hasMore,
		});
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
		const rawUserToChatId = req.params.id;
		const userToChatId =
			typeof rawUserToChatId === "string"
				? rawUserToChatId
				: rawUserToChatId?.[0];
		const loggedInUserId = req.user?.id;

		if (!loggedInUserId) return sendErrorResponse(res, 401, "Unauthorized");
		if (!userToChatId)
			return sendErrorResponse(res, 400, "Chat id not provided");

		const { text, image } = req.body;

		if (!text && !image)
			return res.status(400).json({ message: "Text or image is required." });
		if (loggedInUserId === userToChatId)
			return res
				.status(400)
				.json({ message: "You cannot send a message to yourself." });

		const receiverExists = await User.exists({ _id: userToChatId });
		if (!receiverExists)
			return res.status(404).json({ message: "Receiver not found." });

		const message = await Message.create({
			senderId: loggedInUserId,
			receiverId: userToChatId,
			text,
			image,
		});

		sendSuccessResponse(res, 201, "Message sent successfully", message);
	} catch (error) {
		console.log("Error in sendMessage:", error);
		sendErrorResponse(res, 500, "Error sending message");
	}
};
