import cookie from "cookie";
import jwt, { type JwtPayload } from "jsonwebtoken";
import { ENV } from "../config/env.config.js";
import User from "../models/user.model.js";
import type { NextFunction } from "express";
import type { Socket } from "socket.io";

export interface AuthenticatedSocket extends Socket {
	user?: any;
	userId?: string;
}

export const socketAuthMiddleware = async (
	socket: AuthenticatedSocket,
	next: NextFunction,
) => {
	try {
		const rawCookies = socket.handshake.headers.cookie;

		if (!rawCookies) {
			console.log("Socket connection rejected: No cookies found");
			return next(new Error("Unauthorized - No Cookies Provided"));
		}

		const parsedCookies = cookie.parse(rawCookies);

		const token = parsedCookies.accessToken;
		if (!token) {
			console.log("Socket connection rejected: Token not found");
			return next(new Error("Unauthorized - No Token Provided"));
		}

		const decoded = jwt.verify(
			token,
			ENV.JWT_ACCESS_SECRET as string,
		) as JwtPayload;

		const user = await User.findById(decoded.id).select("-password -__v");
		if (!user) {
			console.log("Socket connection rejected: User not found");
			return next(new Error("User not found"));
		}

		socket.user = user;
		socket.userId = user._id.toString();

		console.log(
			`Socket authenticated for user: ${user.firstName} ${user.lastName} (${user._id})`,
		);
		next();
	} catch (error: unknown) {
		console.log("Error in socket authenticaiton:", error);
		next(new Error("Unauthorized - Authentication failed"));
	}
};
