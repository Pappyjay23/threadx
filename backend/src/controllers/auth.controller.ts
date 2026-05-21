import type { Request, Response } from "express";

export const signup = (req: Request, res: Response) => {
	res.json({
		success: true,
		message: "Signup successful",
	});
};

export const login = (req: Request, res: Response) => {
    res.json({
        success: true,
        message: "Login successful",
    });
};

export const logout = (req: Request, res: Response) => {
    res.json({
        success: true,
        message: "Logout successful",
    });
};

export const refresh = (req: Request, res: Response) => {
    res.json({
        success: true,
        message: "Refresh successful",
    });
};