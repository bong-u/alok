export class UserNotFoundError extends Error {
	constructor() {
		super("User not found");
	}
}
export class UserAuthenticationFailedError extends Error {
	constructor() {
		super("Authentication failed");
	}
}

export class UserAlreadyExistsError extends Error {
	constructor() {
		super("User already exists");
	}
}

export class RecaptchaScoreTooLowError extends Error {
	constructor() {
		super("Recaptcha score too low");
	}
}

export class RecaptchaTokenInvalidError extends Error {
	constructor() {
		super("Recaptcha token invalid");
	}
}

export class InvalidTokenError extends Error {
	constructor() {
		super("Invalid token");
	}
}

export class TokenBlacklistedError extends Error {
	constructor() {
		super("Token is blacklisted");
	}
}
