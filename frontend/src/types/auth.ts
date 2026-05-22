export interface AuthResponse {
	user: {
		_id: string;
		firstName: string;
		lastName: string;
		email: string;
	};
	accessToken: string;
}

export interface CurrentUserResponse {
	_id: string;
	firstName: string;
	lastName: string;
	email: string;
}