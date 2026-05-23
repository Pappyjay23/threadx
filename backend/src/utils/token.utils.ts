import crypto from "crypto";
import jwt from "jsonwebtoken";
import type { StringValue } from "ms";
import ms from "ms";
import { ENV } from "../config/env.config.js";

export const hashToken = (token: string): string => {
	return crypto.createHash("sha256").update(token).digest("hex");
};

export const generateAccessToken = (userId: string, email: string) => {
	return jwt.sign({ id: userId, email }, ENV.JWT_ACCESS_SECRET as string, {
		expiresIn: (ENV.JWT_ACCESS_TOKEN_EXPIRES_IN || "15m") as StringValue,
	});
};

export const generateRefreshToken = (userId: string) => {
	return jwt.sign({ id: userId }, ENV.JWT_REFRESH_SECRET as string, {
		expiresIn: (ENV.JWT_REFRESH_TOKEN_EXPIRES_IN || "7d") as StringValue,
	});
};

export const generatePasswordResetToken = (): string => {
	return crypto.randomBytes(32).toString("hex");
};

const parseExpiryMs = (expiresIn: string, fallbackMs: number): number => {
	const result = ms(expiresIn as StringValue);
	return typeof result === "number" ? result : fallbackMs;
};

export const getRefreshTokenExpiryMs = () =>
	parseExpiryMs(
		ENV.JWT_REFRESH_TOKEN_EXPIRES_IN || "7d",
		7 * 24 * 60 * 60 * 1000,
	);

export const getRefreshTokenExpiry = () =>
	new Date(Date.now() + getRefreshTokenExpiryMs());

export const getPasswordResetTokenExpiryMs = () =>
	parseExpiryMs("1h", 60 * 60 * 1000); // 1 hour

export const getPasswordResetTokenExpiry = () =>
	new Date(Date.now() + getPasswordResetTokenExpiryMs());
