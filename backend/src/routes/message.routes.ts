import express from "express";
import { apiAj } from "../config/arcjet.config.js";
import {
	deleteMessage,
	getChats,
	getContacts,
	getMessagesByUserId,
	getMessagesByConversationId,
	markAsRead,
	pinChat,
	sendMessage,
	uploadMessageSignature,
	createGroup,
	updateGroup,
	addMembers,
	removeMember,
	leaveGroup,
	deleteGroup,
	uploadGroupAvatarSignature,
	deleteDirectChat,
} from "../controllers/message.controller.js";
import { arcjetProtection } from "../middlewares/arcjet.middleware.js";
import { protectAuth } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.use(protectAuth, arcjetProtection(apiAj));

// Static and specific routes first
router.get("/contacts", getContacts);
router.get("/chats", getChats);
router.get("/upload-message-signature", uploadMessageSignature);
router.get("/upload-group-avatar-signature", uploadGroupAvatarSignature);

// Conversation-specific routes (must be before /:id)
router.get("/conversations/:id", getMessagesByConversationId);
router.delete("/chats/:id", deleteDirectChat);

// Group routes (must be before /:id)
router.post("/groups", createGroup);
router.patch("/groups/:id", updateGroup);
router.delete("/groups/:id", deleteGroup);
router.post("/groups/:id/members", addMembers);
router.post("/groups/:id/remove", removeMember);
router.post("/groups/:id/leave", leaveGroup);

// Message routes
router.delete("/:messageId", deleteMessage);
router.get("/:id", getMessagesByUserId);
router.post("/:id", sendMessage);
router.post("/:id/read", markAsRead);
router.patch("/:id/pin", pinChat);

export default router;
