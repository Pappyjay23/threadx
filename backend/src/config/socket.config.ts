import cors from "cors";
import express from "express";
import http from "http";
import { Server } from "socket.io";
import {
	socketAuthMiddleware,
	type AuthenticatedSocket,
} from "../middlewares/socket.auth.middleware.js";
import { ENV } from "./env.config.js";
import Conversation from "../models/conversation.model.js";

const app = express();
const server = http.createServer(app);

const devOrigins = ["http://localhost:5173", "http://localhost:5001"];

const prodOrigins = [ENV.CLIENT_URL, ENV.SERVER_URL].filter(
	Boolean,
) as string[];

if (ENV.NODE_ENV === "production" && prodOrigins.length === 0) {
	console.error(
		"WARNING: No CORS origins configured for production. Set CLIENT_URL or SERVER_URL.",
	);
}

export const allowedOrigins =
	ENV.NODE_ENV === "production" ? prodOrigins : devOrigins;

export const corsOptions = {
	origin: (
		origin: string | undefined,
		callback: (err: Error | null, allow?: boolean) => void,
	) => {
		if (!origin || allowedOrigins.includes(origin)) {
			callback(null, true);
		} else {
			callback(new Error("Not allowed by CORS"));
		}
	},
	credentials: true,
};

app.use(cors(corsOptions));

const io = new Server(server, {
	cors: corsOptions,
	transports: ["websocket", "polling"],
	pingTimeout: 60000,
	pingInterval: 25000,
});

// Apply authentication middleware to all socket connections
io.use((socket, next) => {
	socketAuthMiddleware(socket as any, next as any).catch(next);
});

const userSocketMap: Record<string, string> = {}; // { userId: socketId }

export const getReceiverSocketId = (userId: string): string | undefined =>
	userSocketMap[userId];

io.on("connection", (socket: AuthenticatedSocket) => {
	console.log(
		`A user connected: ${socket.user.firstName} ${socket.user.lastName} (${socket.user._id})`,
	);

	const userId = socket.userId!;
	if (userId) {
		userSocketMap[userId] = socket.id;
	}

	// Used to send events to all connected clients
	io.emit("getOnlineUsers", Object.keys(userSocketMap));

	socket.on("disconnect", () => {
		console.log(
			`A user disconnected: ${socket.user.firstName} ${socket.user.lastName} (${socket.user._id})`,
		);

		delete userSocketMap[userId];
		io.emit("getOnlineUsers", Object.keys(userSocketMap));
	});

	// Updated typing handlers to use conversationId and broadcast to all participants
	socket.on(
		"typing:start",
		async ({ conversationId }: { conversationId: string }) => {
			if (!conversationId) return;

			try {
				const conversation = await Conversation.findById(conversationId);
				if (!conversation) return;

				const senderName = `${socket.user.firstName}${socket.user.lastName ? ` ${socket.user.lastName}` : ""}`;

				conversation.participants.forEach((participantId) => {
					const participantIdStr = participantId.toString();
					if (participantIdStr !== userId) {
						const socketId = getReceiverSocketId(participantIdStr);
						if (socketId) {
							io.to(socketId).emit("typing:update", {
								conversationId,
								isTyping: true,
								senderId: userId,
								senderName,
							});
						}
					}
				});
			} catch (error) {
				console.error("Error in typing:start:", error);
			}
		},
	);

	socket.on(
		"typing:stop",
		async ({ conversationId }: { conversationId: string }) => {
			if (!conversationId) return;

			try {
				const conversation = await Conversation.findById(conversationId);
				if (!conversation) return;

				const senderName = `${socket.user.firstName}${socket.user.lastName ? ` ${socket.user.lastName}` : ""}`;

				conversation.participants.forEach((participantId) => {
					const participantIdStr = participantId.toString();
					if (participantIdStr !== userId) {
						const socketId = getReceiverSocketId(participantIdStr);
						if (socketId) {
							io.to(socketId).emit("typing:update", {
								conversationId,
								isTyping: false,
								senderId: userId,
								senderName,
							});
						}
					}
				});
			} catch (error) {
				console.error("Error in typing:stop:", error);
			}
		},
	);
});

export { app, io, server };
