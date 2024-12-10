import { PrismaClient } from "@prisma/client";
import { UserDTO, UserDTOWithPassword } from "../types/user-types";

const prisma = new PrismaClient();

class UserRepository {
	static async getUserByUsername(
		username: string
	): Promise<UserDTOWithPassword | null> {
		return await prisma.user.findUnique({
			where: { username, isDeleted: false },
		});
	}

	static async getUserById(userId: number): Promise<UserDTOWithPassword | null> {
		return await prisma.user.findUnique({
			where: { id: userId, isDeleted: false },
		});
	}

	static async createUser(
		username: string,
		password: string
	): Promise<UserDTO> {
		return await prisma.user.create({
			data: {
				username,
				password,
			},
		});
	}

	static async getAllUsers(): Promise<UserDTO[]> {
		return await prisma.user.findMany({
			select: { id: true, username: true },
			where: { isDeleted: false },
		});
	}

	static async changePassword(
		userId: number,
		newPassword: string
	): Promise<void> {
		await prisma.user.update({
			where: { id: userId, isDeleted: false },
			data: {
				password: newPassword,
				updatedAt: new Date().toISOString(),
			},
		});
	}

	static async deleteUser(userId: number): Promise<void> {
		await prisma.user.update({
			where: { id: userId },
			data: { isDeleted: true },
		});
	}
}

export default UserRepository;
