import { PrismaClient } from "@prisma/client";
import { UserResponse } from "../types/user-types";
import {
	UserNotFoundError,
	UserAuthenticationFailedError,
	UserAlreadyExistsError,
	RecaptchaScoreTooLowError,
	RecaptchaTokenInvalidError,
} from "../exceptions";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();
const SALT_ROUNDS = parseInt(process.env.SALT_ROUNDS || "10");

class UserService {
	static async authenticateByUsername(
		username: string,
		password: string
	): Promise<number> {
		// without soft deleted user
		const user = await prisma.user.findUnique({
			where: { username, isDeleted: false },
		});
		if (!user || !bcrypt.compareSync(password, user.password)) {
			throw new UserAuthenticationFailedError();
		}
		return user.id;
	}

	static async authenticateById(
		userId: number,
		password: string
	): Promise<void> {
		const user = await prisma.user.findUnique({
			where: { id: userId, isDeleted: false },
		});
		if (!user || !bcrypt.compareSync(password, user.password)) {
			throw new UserAuthenticationFailedError();
		}
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
		const existingUser = await prisma.user.findUnique({
			where: { username: username, isDeleted: false },
		});
		if (existingUser) {
			throw new UserAlreadyExistsError();
		}

		const hashedPassword = bcrypt.hashSync(password, SALT_ROUNDS);
		return await prisma.user
			.create({
				data: {
					username,
					password: hashedPassword,
				},
			})
			.then((user) => user.id);
	}

	static async getAllUsers(): Promise<UserResponse[]> {
		return await prisma.user.findMany({
			select: { id: true, username: true },
			where: { isDeleted: false },
		});
	}

	static async getUserById(userId: number): Promise<UserResponse> {
		const user = await prisma.user.findUnique({
			where: { id: userId, isDeleted: false },
		});
		if (!user) throw new UserNotFoundError();
		return user;
	}

	static async changePassword(userId: number, newPassword: string) {
		const hashedPassword = bcrypt.hashSync(newPassword, SALT_ROUNDS);
		await prisma.user.update({
			where: { id: userId, isDeleted: false },
			data: {
				password: hashedPassword,
				updatedAt: new Date().toISOString(),
			},
		});
		return true;
	}

	static async deleteUser(userId: number): Promise<void> {
		await prisma.user.update({
			where: { id: userId },
			data: { isDeleted: true },
		});
	}
}

export default UserService;
