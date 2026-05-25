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

export const getContacts = async (req: AuthRequest, res: Response) => {
	try {
		const loggedInUserId = req.user?.id;

		if (!loggedInUserId) {
			return sendErrorResponse(res, 401, "Unauthorized");
		}

		const users = await User.find({ _id: { $ne: loggedInUserId } }).select(
			"-password -__v",
		);

		const contacts = users.map((user) => ({
			id: user._id.toString(),
			name: `${user.firstName}${user.lastName ? ` ${user.lastName}` : ""}`,
			email: user.email,
			image: user.picture ?? "",
			username: user.email.split("@")[0],
			isOnline: false, // socket.io will override this on the frontend
			dateJoined: user
				? new Date(user.createdAt).toLocaleDateString("en-US", {
						month: "long",
						day: "numeric",
						year: "numeric",
					})
				: "",
		}));

		sendSuccessResponse(res, 200, "Contacts fetched successfully", contacts);
	} catch (error) {
		console.log("Error in getAllContacts:", error);
		sendErrorResponse(res, 500, "Error fetching contacts");
	}
};

export const getChats = async (req: AuthRequest, res: Response) => {
	try {
		const loggedInUserId = req.user?.id;
		if (!loggedInUserId) return sendErrorResponse(res, 401, "Unauthorized");

		const userObjectId = new mongoose.Types.ObjectId(loggedInUserId);

		// Single aggregation: get partner IDs + last message in one shot
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
		const users = await User.find({ _id: { $in: partnerIds } }).select(
			"-password -__v",
		);
		const userMap = new Map(users.map((u) => [u._id.toString(), u]));

		const chats = conversations.map(
			({ _id, lastMessage, lastImage, lastUpdated }) => {
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
			},
		);

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

		if (!loggedInUserId) {
			return sendErrorResponse(res, 401, "Unauthorized");
		}

		if (!userToChatId) {
			return sendErrorResponse(res, 400, "Chat id not provided");
		}

		const messages = await Message.find({
			$or: [
				{ senderId: loggedInUserId, receiverId: userToChatId },
				{ senderId: userToChatId, receiverId: loggedInUserId },
			],
		}).select("-__v");

		sendSuccessResponse(res, 200, "Messages fetched successfully", messages);
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

		if (!loggedInUserId) {
			return sendErrorResponse(res, 401, "Unauthorized");
		}

		if (!userToChatId) {
			return sendErrorResponse(res, 400, "Chat id not provided");
		}

		const { text, image } = req.body;

		if (!text && !image) {
			return res.status(400).json({ message: "Text or image is required." });
		}

		if (loggedInUserId === userToChatId) {
			return res
				.status(400)
				.json({ message: "You cannot send a message to yourself." });
		}

		const receiverExists = await User.exists({ _id: userToChatId });
		if (!receiverExists) {
			return res.status(404).json({ message: "Receiver not found." });
		}

		const message = await Message.create({
			senderId: loggedInUserId,
			receiverId: userToChatId,
			text,
			image,
		});

		// TODO: Send notification using socket.io

		sendSuccessResponse(res, 201, "Message sent successfully", message);
	} catch (error) {
		console.log("Error in sendMessage:", error);
		sendErrorResponse(res, 500, "Error sending message");
	}
};
