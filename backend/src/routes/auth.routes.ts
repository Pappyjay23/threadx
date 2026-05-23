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
} from "../controllers/auth.controller.js";
import { arcjetProtection } from "../middlewares/arcjet.middleware.js";
import { protectAuth } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/signup", arcjetProtection(authAj), signup);
router.post("/login", arcjetProtection(authAj), login);
router.post("/google", arcjetProtection(authAj), googleAuth);
router.post("/forgot-password", arcjetProtection(authAj), forgotPassword);
router.post("/reset-password", arcjetProtection(authAj), resetPassword);

router.use(protectAuth);
router.post("/logout", logout);

router.use(arcjetProtection(apiAj));
router.post("/refresh", refresh);

export default router;
