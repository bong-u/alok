import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import { randomBytes } from "crypto";
import { DailyRecord } from "../interfaces/record-interfaces";

const prisma = new PrismaClient();
const SALT_ROUNDS = parseInt(process.env.SALT_ROUNDS || "10");

interface UserResult {
	id: number;
	username: string;
	hashedPassword: string;
	plainPassword: string;
}

const generateRandomString = (): string => {
	return randomBytes(5).toString("hex");
};

export const TestUtil = {
	async createUser(isDeleted: boolean = false): Promise<UserResult> {
		const username = generateRandomString();
		const plainPassword = generateRandomString();
		const hashedPassword = await bcrypt.hashSync(
			plainPassword,
			SALT_ROUNDS
		);
		const user = await prisma.user.create({
			data: {
				username,
				password: hashedPassword,
				isDeleted,
				createdAt: new Date(),
				updatedAt: new Date(),
			},
		});
		return {
			id: user.id,
			username: user.username,
			hashedPassword,
			plainPassword,
		} as UserResult;
	},
	async comparePassword(
		password: string,
		hashedPassword: string
	): Promise<boolean> {
		return bcrypt.compare(password, hashedPassword);
	},

	async createRecord(
		date: string,
		recordType: string,
		amount: number,
		userId: number
	): Promise<DailyRecord> {
		return (await prisma.record.create({
			data: {
				date,
				recordType,
				amount,
				userId,
			},
		})) as DailyRecord;
	},
};

export default TestUtil;
