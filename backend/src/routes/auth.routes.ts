import express from "express";
import { apiAj, authAj } from "../config/arcjet.config.js";
import {
	googleAuth,
	login,
	logout,
	refresh,
	signup,
	forgotPassword,
	resetPassword,
	uploadProfileSignature,
	updateProfile,
} from "../controllers/auth.controller.js";
import { arcjetProtection } from "../middlewares/arcjet.middleware.js";
import { protectAuth } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/signup", arcjetProtection(authAj), signup);
router.post("/login", arcjetProtection(authAj), login);
router.post("/google", arcjetProtection(authAj), googleAuth);
router.post("/forgot-password", arcjetProtection(authAj), forgotPassword);
router.post("/reset-password", arcjetProtection(authAj), resetPassword);
router.post("/refresh", arcjetProtection(apiAj), refresh);

router.use(protectAuth);
router.post("/logout", logout);

router.use(arcjetProtection(apiAj));
router.get("/upload-profile-signature", uploadProfileSignature);
router.patch("/update-profile", updateProfile);

export default router;
