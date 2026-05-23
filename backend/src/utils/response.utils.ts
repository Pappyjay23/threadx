import type { Response } from "express";

export const sendSuccessResponse = <T>(
	res: Response,
	status: number,
	message: string,
	data?: T,
) => {
	res.status(status).json({
		success: true,
		message,
		data,
	});
};

export const sendErrorResponse = (
	res: Response,
	status: number,
	message: string,
	error?: unknown,
) => {
	res.status(status).json({
		success: false,
		message,
		error,
	});
};

const parseUrl = (value?: string) => {
	if (!value) {
		return null;
	}

	try {
		return new URL(value);
	} catch {
		return null;
	}
};

const getConfiguredClientOrigin = () => {
	const configured = parseUrl(process.env.CLIENT_URL);

	if (!configured || !["http:", "https:"].includes(configured.protocol)) {
		return null;
	}

	return `${configured.protocol}//${configured.host}`;
};

export const getPasswordResetBaseUrl = (origin?: string) => {
	const configuredOrigin = getConfiguredClientOrigin();
	const incomingOrigin = parseUrl(origin);

	if (
		incomingOrigin &&
		["http:", "https:"].includes(incomingOrigin.protocol) &&
		configuredOrigin
	) {
		const configuredHost = new URL(configuredOrigin).host.toLowerCase();
		const incomingHost = incomingOrigin.host.toLowerCase();

		if (incomingHost === configuredHost) {
			return `${incomingOrigin.protocol}//${incomingOrigin.host}`;
		}
	}

	if (
		incomingOrigin &&
		["http:", "https:"].includes(incomingOrigin.protocol) &&
		!configuredOrigin
	) {
		return `${incomingOrigin.protocol}//${incomingOrigin.host}`;
	}

	return configuredOrigin || "http://localhost:5173";
};
