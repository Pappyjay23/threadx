import type { CookieOptions, Response } from "express";
import jwt from "jsonwebtoken";
import z from "zod";
import { OAuth2Client } from "google-auth-library";
import { ENV } from "../config/env.config.js";
import type { AuthRequest } from "../middlewares/auth.middleware.js";
import RefreshToken from "../models/refreshToken.model.js";
import User from "../models/user.model.js";
import {
	googleAuthSchema,
	loginSchema,
	signupSchema,
} from "../schemas/auth.schema.js";
import {
	sendErrorResponse,
	sendSuccessResponse,
} from "../utils/response.utils.js";
import {
	generateAccessToken,
	generateRefreshToken,
	getRefreshTokenExpiry,
	getRefreshTokenExpiryMs,
	hashToken,
} from "../utils/token.utils.js";

const googleClient = new OAuth2Client(ENV.GOOGLE_CLIENT_ID);

const getBaseCookieOptions = (): CookieOptions => {
	const isProduction = ENV.NODE_ENV === "production";

	return {
		httpOnly: true,
		secure: isProduction,
		sameSite: isProduction ? "none" : "strict",
	};
};

const getRefreshCookieOptions = (): CookieOptions => ({
	...getBaseCookieOptions(),
	maxAge: getRefreshTokenExpiryMs(),
});

const clearOptions = (options: CookieOptions) => {
	const { maxAge, ...rest } = options;
	return rest;
};

const createRefreshTokenSession = async (
	res: Response,
	userId: string,
	email: string,
) => {
	const accessToken = generateAccessToken(userId, email);
	const refreshToken = generateRefreshToken(userId);
	const expiresAt = getRefreshTokenExpiry();

	await RefreshToken.create({
		userId,
		tokenHash: hashToken(refreshToken),
		expiresAt,
	});

	res.cookie("refreshToken", refreshToken, getRefreshCookieOptions());

	return accessToken;
};

export const signup = async (req: AuthRequest, res: Response) => {
	try {
		const validatedData = signupSchema.parse(req.body);
		const existingUser = await User.findOne({ email: validatedData.email });

		if (existingUser) {
			return sendErrorResponse(res, 409, "Email already in use");
		}

		const user = await User.create({
			firstName: validatedData.firstName,
			lastName: validatedData.lastName,
			email: validatedData.email,
			password: validatedData.password,
			authProvider: "email",
		});

		const accessToken = await createRefreshTokenSession(
			res,
			user._id.toString(),
			user.email,
		);

		sendSuccessResponse(res, 201, "User created successfully", {
			user: user.toJSON(),
			accessToken,
		});
	} catch (error: any) {
		if (error instanceof z.ZodError) {
			const errors = error.issues.map((issue) => ({
				message: issue.message,
			}));
			return sendErrorResponse(res, 400, "Validation failed", errors);
		}

		sendErrorResponse(res, 500, error.message || "Error creating user");
	}
};

export const login = async (req: AuthRequest, res: Response) => {
	try {
		const validatedData = loginSchema.parse(req.body);
		const user = await User.findOne({ email: validatedData.email });

		if (!user) {
			return sendErrorResponse(res, 401, "Invalid email or password");
		}

		const isPasswordValid = await User.comparePassword(
			validatedData.password,
			user.password || "",
		);

		if (!isPasswordValid) {
			return sendErrorResponse(res, 401, "Invalid email or password");
		}

		const accessToken = await createRefreshTokenSession(
			res,
			user._id.toString(),
			user.email,
		);

		sendSuccessResponse(res, 200, "Login successful", {
			user: user.toJSON(),
			accessToken,
		});
	} catch (error: any) {
		if (error instanceof z.ZodError) {
			const errors = error.issues.map((issue) => ({
				message: issue.message,
			}));
			return sendErrorResponse(res, 400, "Validation failed", errors);
		}

		sendErrorResponse(res, 500, error.message || "Error logging in");
	}
};
export const googleAuth = async (req: AuthRequest, res: Response) => {
	try {
		console.log("Google auth request received"); // Debug log

		const validatedData = googleAuthSchema.parse(req.body);
		console.log("Token validated"); // Debug log

		const googleResponse = await fetch(
			`https://www.googleapis.com/oauth2/v2/userinfo?access_token=${validatedData.accessToken}`,
		);

		if (!googleResponse.ok) {
			throw new Error("Failed to verify Google token");
		}

		const profile = await googleResponse.json();
		console.log("Google profile:", profile); // Debug log
		console.log("Google profile verified:", profile.email); // Debug log

		let user = await User.findOne({ email: profile.email });

		if (!user) {
			console.log("Creating new user for:", profile.email); // Debug log
			const newUserData: {
				firstName: string;
				email: string;
				picture?: string;
				authProvider: "google";
				lastName?: string;
			} = {
				firstName: profile.given_name || profile.name?.split(" ")[0] || "User",
				email: profile.email,
				authProvider: "google",
			};

			if (profile.picture) {
				newUserData.picture = profile.picture;
			}

			if (profile.family_name) {
				newUserData.lastName = profile.family_name;
			}

			user = await User.create(newUserData);
		} else {
			console.log("Updating existing user:", profile.email); // Debug log
			await User.updateOne(
				{ _id: user._id },
				{
					$set: {
						firstName: profile.given_name || user.firstName,
						picture: profile.picture,
						...(profile.family_name ? { lastName: profile.family_name } : {}),
						authProvider: "google",
					},
				},
			);
			user = await User.findById(user._id);
		}

		if (!user) {
			console.error("User not found after creation/update"); // Debug log
			return sendErrorResponse(res, 500, "Error authenticating with Google");
		}

		const accessToken = await createRefreshTokenSession(
			res,
			user._id.toString(),
			user.email,
		);

		console.log("Google auth successful for:", profile.email); // Debug log

		sendSuccessResponse(res, 200, "Google login successful", {
			user: user.toJSON(),
			accessToken,
		});
	} catch (error: any) {
		console.error("Google auth error:", error.message); // Debug log

		if (error instanceof z.ZodError) {
			const errors = error.issues.map((issue) => ({
				message: issue.message,
			}));
			return sendErrorResponse(res, 400, "Validation failed", errors);
		}

		if (error instanceof Error && error.message.includes("Google")) {
			return sendErrorResponse(res, 401, error.message);
		}

		sendErrorResponse(
			res,
			500,
			error.message || "Error authenticating with Google",
		);
	}
};

export const logout = async (req: AuthRequest, res: Response) => {
	try {
		const refreshToken = req.cookies.refreshToken;

		if (refreshToken) {
			await RefreshToken.deleteOne({ tokenHash: hashToken(refreshToken) });
		}

		res.clearCookie("refreshToken", clearOptions(getRefreshCookieOptions()));

		sendSuccessResponse(res, 200, "Logged out successfully");
	} catch (error) {
		sendErrorResponse(res, 500, "Error logging out");
	}
};

export const refresh = async (req: AuthRequest, res: Response) => {
	const clearRefreshCookie = () => {
		res.clearCookie("refreshToken", clearOptions(getRefreshCookieOptions()));
	};

	try {
		const refreshToken = req.cookies.refreshToken;

		if (!refreshToken) {
			return sendErrorResponse(res, 401, "Refresh token not provided");
		}

		const storedToken = await RefreshToken.findOne({
			tokenHash: hashToken(refreshToken),
		});

		if (!storedToken) {
			clearRefreshCookie();
			return sendErrorResponse(res, 401, "Unauthorized");
		}

		if (storedToken.expiresAt.getTime() <= Date.now()) {
			await RefreshToken.deleteOne({ tokenHash: hashToken(refreshToken) });
			clearRefreshCookie();
			return sendErrorResponse(res, 401, "Refresh token expired");
		}

		const decoded = jwt.verify(
			refreshToken,
			ENV.JWT_REFRESH_SECRET as string,
		) as { id: string };

		const user = await User.findById(decoded.id);

		if (!user) {
			return sendErrorResponse(res, 401, "User not found");
		}

		await RefreshToken.deleteOne({ tokenHash: hashToken(refreshToken) });

		const newAccessToken = generateAccessToken(user._id.toString(), user.email);
		const newRefreshToken = generateRefreshToken(user._id.toString());
		const expiresAt = getRefreshTokenExpiry();

		await RefreshToken.create({
			userId: user._id,
			tokenHash: hashToken(newRefreshToken),
			expiresAt,
		});

		res.cookie("refreshToken", newRefreshToken, getRefreshCookieOptions());

		sendSuccessResponse(res, 200, "Token refreshed successfully", {
			accessToken: newAccessToken,
		});
	} catch (error) {
		if (
			error instanceof jwt.TokenExpiredError ||
			error instanceof jwt.JsonWebTokenError
		) {
			clearRefreshCookie();
			const message =
				error instanceof jwt.TokenExpiredError
					? "Refresh token expired"
					: "Invalid refresh token";
			return sendErrorResponse(res, 401, message);
		}

		sendErrorResponse(res, 500, "Error refreshing token");
	}
};
