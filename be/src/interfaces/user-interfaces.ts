import Joi from "joi";

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

export const loginSchema = Joi.object({
	username: Joi.string().required(),
	password: Joi.string().required(),
});

export const refreshTokenSchema = Joi.object({
	refresh_token: Joi.string().required(),
});

export const terminateTokenSchema = Joi.object({
	access_token: Joi.string().required(),
	refresh_token: Joi.string().required(),
});

const passwordSchema = Joi.string()
	.pattern(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*?&]+$/) // 영문자와 숫자 포함
	.min(8)
	.max(20)
	.required()
	.messages({
		"string.pattern.base":
			"비밀번호는 영문자와 숫자를 포함하며, 영문자, 특수문자, 숫자만 입력할 수 있습니다.",
		"string.empty": "비밀번호를 입력해주세요.",
		"string.min": "비밀번호는 최소 8글자 이상이어야 합니다.",
		"string.max": "비밀번호는 최대 20글자 이내로 입력해주세요.",
	});

export const passwordChangeSchema = Joi.object({
	old_password: Joi.string().required(),
	new_password: passwordSchema,
});

export const signupSchema = Joi.object({
	username: Joi.string()
		.pattern(/^[a-zA-Z0-9]+$/) // 영문자와 숫자만 허용
		.min(4)
		.max(20)
		.required()
		.messages({
			"string.pattern.base":
				"계정 이름은 영문자와 숫자만 입력할 수 있습니다.",
			"string.empty": "계정 이름을 입력해주세요.",
			"string.min": "계정 이름은 최소 4글자 이상이어야 합니다.",
			"string.max": "계정 이름은 최대 20글자 이내로 입력해주세요.",
		}),
	password: passwordSchema,
	recaptchaToken: Joi.string().required(),
});
