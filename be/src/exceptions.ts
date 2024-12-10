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

export class RecordNotFoundError extends Error {
	constructor() {
		super("Record not found");
	}
}

export class RecordAlreadyExistsError extends Error {
	constructor() {
		super("Record already exists");
	}
}

export class DateNotFoundError extends Error {
	constructor() {
		super("Date not found");
	}
}

export class AttendeeNotFoundError extends Error {
	constructor() {
		super("Attendee not found");
	}
}

export class AttendeeExceedsMaxError extends Error {
	constructor() {
		super("5명 이상의 참여자를 추가할 수 없습니다.");
	}
}

export class AttendeeAlreadyExistsError extends Error {
	constructor() {
		super("이미 참여자로 추가되어 있습니다.");
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
