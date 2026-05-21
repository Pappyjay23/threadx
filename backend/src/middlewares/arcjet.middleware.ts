import { isSpoofedBot } from "@arcjet/inspect";
import type { AuthRequest } from "./auth.middleware.js";
import type { NextFunction, Response } from "express";

export const arcjetProtection = (ajInstance: any) => {
	return async (req: AuthRequest, res: Response, next: NextFunction) => {
		try {
			const decision = await ajInstance.protect(req, {
				fingerprint: req.user?.id || req.ip,
			});

			if (decision.isDenied()) {
				if (decision.reason.isRateLimit()) {
					return res
						.status(429)
						.json({ message: "Too many requests. Please try again later." });
				} else if (decision.reason.isBot()) {
					return res.status(403).json({ message: "No bots allowed" });
				} else {
					return res
						.status(403)
						.json({ message: "Access denied by security policy." });
				}
			}

			if (decision.results.some(isSpoofedBot)) {
				return res.status(403).json({
					error: "Spoofed bot detected",
					message: "Malicious bot activity detected.",
				});
			}

			next();
		} catch (error) {
			console.log("Arcjet Middleware Error:", error);
			next();
		}
	};
};
