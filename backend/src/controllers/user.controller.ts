import type { Response } from "express";
import type { AuthRequest } from "../middlewares/auth.middleware.js";
import User from "../models/user.model.js";
import {
    sendErrorResponse,
    sendSuccessResponse,
} from "../utils/response.utils.js";

export const getCurrentUser = async (req: AuthRequest, res: Response) => {
	try {
		const user = await User.findById(req.user?.id);

		if (!user) {
			return sendErrorResponse(res, 404, "Unauthorized: User not found");
		}

		const userWithoutPassword = user.toJSON();

		sendSuccessResponse(
			res,
			200,
			"Current user fetched successfully",
			userWithoutPassword,
		);
	} catch (error) {
		sendErrorResponse(res, 500, "Error fetching current user");
	}
};
