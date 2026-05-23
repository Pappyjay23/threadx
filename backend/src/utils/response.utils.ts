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
