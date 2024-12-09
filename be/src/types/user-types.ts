interface UserBase {
	username: string;
}

export interface UserResponse extends UserBase {
	id: number;
}

export interface TokenResponse {
	accessToken: string;
	refreshToken: string;
}
