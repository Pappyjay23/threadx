import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { sendErrorResponse } from "../utils/response.utils.js";
import { ENV } from "../config/env.config.js";

export interface AuthRequest extends Request {
	user?: {
		id: string;
		email: string;
	};
}

export const protectAuth = (
	req: AuthRequest,
	res: Response,
	next: NextFunction,
) => {
	try {
		const authHeader = req.headers.authorization;

		const token = authHeader?.startsWith("Bearer ")
			? (authHeader.split(" ")[1] ?? null)
			: null;

		if (!token) {
			return sendErrorResponse(res, 401, "No token provided");
		}

		const decoded = jwt.verify(
			token,
			ENV.JWT_ACCESS_SECRET as string,
		) as { id: string; email: string };

		req.user = {
			id: decoded.id,
			email: decoded.email,
		};

		next();
	} catch (error) {
		if (error instanceof jwt.TokenExpiredError) {
			return sendErrorResponse(res, 401, "Token expired");
		}

		if (error instanceof jwt.JsonWebTokenError) {
			return sendErrorResponse(res, 401, "Invalid token");
		}

		sendErrorResponse(res, 500, "Error verifying token");
	}
};
