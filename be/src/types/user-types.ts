export interface UserDTO {
	username: string;
	id: number;
}

export interface UserDTOWithPassword extends UserDTO {
	password: string;
}

export interface TokenResponse {
	accessToken: string;
	refreshToken: string;
}
