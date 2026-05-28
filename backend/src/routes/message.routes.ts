import express from "express";
import { apiAj } from "../config/arcjet.config.js";
import {
	deleteMessage,
	getChats,
	getContacts,
	getMessagesByUserId,
	markAsRead,
	sendMessage,
	uploadMessageSignature,
} from "../controllers/message.controller.js";
import { arcjetProtection } from "../middlewares/arcjet.middleware.js";
import { protectAuth } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.use(protectAuth, arcjetProtection(apiAj));

router.get("/contacts", getContacts);
router.get("/chats", getChats);
router.get("/upload-message-signature", uploadMessageSignature);
router.delete("/:messageId", deleteMessage);
router.get("/:id", getMessagesByUserId);
router.post("/send/:id", sendMessage);
router.post("/:id/read", markAsRead);

export default router;
