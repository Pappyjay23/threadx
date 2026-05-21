import jwt from "jsonwebtoken";
import type { StringValue } from "ms";
import crypto from "crypto";
import ms from "ms";

export const hashToken = (token: string): string => {
	return crypto.createHash("sha256").update(token).digest("hex");
};

export const generateAccessToken = (userId: string, email: string) => {
	return jwt.sign(
		{ id: userId, email },
		process.env.JWT_ACCESS_SECRET as string,
		{
			expiresIn: (process.env.JWT_ACCESS_TOKEN_EXPIRES_IN ||
				"15m") as StringValue,
		},
	);
};

export const generateRefreshToken = (userId: string) => {
	return jwt.sign({ id: userId }, process.env.JWT_REFRESH_SECRET as string, {
		expiresIn: (process.env.JWT_REFRESH_TOKEN_EXPIRES_IN ||
			"7d") as StringValue,
	});
};

const parseExpiryMs = (expiresIn: string, fallbackMs: number): number => {
	const result = ms(expiresIn as StringValue);
	return typeof result === "number" ? result : fallbackMs;
};

export const getRefreshTokenExpiryMs = () =>
	parseExpiryMs(
		process.env.JWT_REFRESH_TOKEN_EXPIRES_IN || "7d",
		7 * 24 * 60 * 60 * 1000,
	);

export const getRefreshTokenExpiry = () =>
	new Date(Date.now() + getRefreshTokenExpiryMs());
