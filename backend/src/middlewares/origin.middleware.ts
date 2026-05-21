import type { Request, Response, NextFunction } from "express";
import { sendErrorResponse } from "../utils/response.utils.js";

export const originValidator = (allowedOrigins: string[]) => {
	return (req: Request, res: Response, next: NextFunction) => {
		// GET/HEAD are non-mutating so CSRF isn't a concern
		if (req.method === "GET" || req.method === "HEAD") {
			return next();
		}

		// In development, sameSite: strict already blocks CSRF
		if (process.env.NODE_ENV !== "production") {
			return next();
		}

		const origin = req.headers.origin;
		const referer = req.headers.referer;
		let source: string | null = origin ?? null;
		if (!source && referer) {
			try {
				source = new URL(referer).origin;
			} catch {
				// Malformed referer, treat as no source
				source = null;
			}
		}

		if (!source || !allowedOrigins.includes(source)) {
			return sendErrorResponse(res, 403, "Origin not allowed");
		}

		next();
	};
};
