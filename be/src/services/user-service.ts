import { UserDTO, TokenResponse } from "../types/user-types";
import UserRepository from "../repositories/user-repository";
import {
	UserNotFoundError,
	UserAuthenticationFailedError,
	UserAlreadyExistsError,
	RecaptchaScoreTooLowError,
	RecaptchaTokenInvalidError,
} from "../exceptions";
import bcrypt from "bcrypt";
import TokenService from "./token-service";

const SALT_ROUNDS = parseInt(process.env.SALT_ROUNDS || "10");

class UserService {
	static async getUserById(userId: number): Promise<UserDTO> {
		const user = await UserRepository.getUserById(userId);
		if (!user) {
			throw new UserNotFoundError();
		}
		return user;
	}

	static async getAllUsers(): Promise<UserDTO[]> {
		return UserRepository.getAllUsers();
	}

	static async authenticateByUsername(
		username: string,
		password: string
	): Promise<TokenResponse> {
		const user = await UserRepository.getUserByUsername(username);
		if (!user || !bcrypt.compareSync(password, user.password)) {
			throw new UserAuthenticationFailedError();
		}

		return {
			accessToken: TokenService.generateAccessToken(user.id),
			refreshToken: TokenService.generateRefreshToken(user.id),
		} as TokenResponse;
	}

	static async authenticateById(
		userId: number,
		password: string
	): Promise<void> {
		const user = await UserRepository.getUserById(userId);
		if (!user || !bcrypt.compareSync(password, user.password)) {
			throw new UserAuthenticationFailedError();
		}
	}

	static async userSignup(
		username: string,
		password: string,
		recaptchaToken: string
	): Promise<void> {
		await UserService.verifyRecaptcha(recaptchaToken);
		await UserService.createUser(username, password);
	}

	static async verifyRecaptcha(token: string): Promise<void> {
		// 테스트 환경에서는 recaptcha 검증 생략
		if (process.env.NODE_ENV === "test") return;

		const response = await fetch(
			`https://www.google.com/recaptcha/api/siteverify?secret=${process.env.RECAPTCHA_SECRET_KEY}&response=${token}`,
			{
				method: "POST",
			}
		);
		const verificationReuslt = await response.json();

		if (verificationReuslt.score <= 0.5) {
			throw new RecaptchaScoreTooLowError();
		}

		if (!verificationReuslt.success) {
			throw new RecaptchaTokenInvalidError();
		}
	}

	static async createUser(
		username: string,
		password: string
	): Promise<number> {
		const existingUser = await UserRepository.getUserByUsername(username);
		if (existingUser) {
			throw new UserAlreadyExistsError();
		}

		const hashedPassword = bcrypt.hashSync(password, SALT_ROUNDS);
		return (await UserRepository.createUser(username, hashedPassword)).id;
	}

	static async addTokensToBlacklist(
		accessToken: string,
		refreshToken: string
	): Promise<void> {
		TokenService.addToBlacklist(accessToken);
		TokenService.addToBlacklist(refreshToken);
	}

	static async refreshToken(refreshToken: string): Promise<string> {
		const userId = await TokenService.getUserIdFromToken(refreshToken);
		const accessToken = TokenService.generateAccessToken(userId);
		return accessToken;
	}

	static async changePassword(
		userId: number,
		oldPassword: string,
		newPassword: string
	): Promise<void> {
		await UserService.authenticateById(userId, oldPassword);

		const hashedPassword = bcrypt.hashSync(newPassword, SALT_ROUNDS);
		await UserRepository.changePassword(userId, hashedPassword);
	}

	static async deleteUser(
		accessToken: string,
		refreshToken: string,
		userId: number
	): Promise<void> {
		await UserService.addTokensToBlacklist(accessToken, refreshToken);
		await UserService.getUserById(userId);
		await UserRepository.deleteUser(userId);
	}
}

export default UserService;
