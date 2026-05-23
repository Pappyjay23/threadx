export type ErrorResponse = {
	message: string;
	success: boolean;
}

export interface AuthResponse {
	user: {
		_id: string;
		firstName: string;
		lastName?: string;
		email: string;
		picture?: string;
		authProvider: "email" | "google";
		createdAt: string;
		updatedAt: string;
	};
	accessToken: string;
}

export interface CurrentUserResponse {
	_id: string;
	firstName: string;
	lastName?: string;
	email: string;
	picture?: string;
	authProvider: "email" | "google";
	createdAt: string;
	updatedAt: string;
}
