import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import { randomBytes } from "crypto";

const prisma = new PrismaClient();
const SALT_ROUNDS = parseInt(process.env.SALT_ROUNDS || "10");

interface DateResult {
	id: number;
	date: string;
}

interface RecordResult {
	id: number;
	dateId: number;
	recordType: string;
	amount: number;
	userId: number;
}

interface UserResult {
	id: number;
	username: string;
	hashedPassword: string;
	plainPassword: string;
}

interface AttendeeResult {
	id: number;
	name: string;
	partnerUserId: number;
}

interface AttendeeDateResult {
	attendeeId: number;
	dateId: number;
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
				createdAt: new Date().toISOString(),
				updatedAt: new Date().toISOString(),
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

	async createDate(date: string): Promise<DateResult> {
		return await prisma.date.create({
			data: {
				date,
			},
		});
	},

	async createRecord(
		dateId: number,
		recordType: string,
		amount: number,
		userId: number
	): Promise<RecordResult> {
		return await prisma.record.create({
			data: {
				dateId,
				recordType,
				amount,
				userId,
			},
		});
	},

	async createAttendee(
		attendeeName: string,
		userId: number
	): Promise<AttendeeResult> {
		return (await prisma.attendee.create({
			data: {
				name: attendeeName,
				partnerUserId: userId,
			},
		})) as AttendeeResult;
	},

	async connectAttendeeToDate(
		attendeeId: number,
		dateId: number
	): Promise<AttendeeDateResult> {
		return await prisma.dateAttendee.create({
			data: {
				dateId,
				attendeeId,
			},
		});
	},
};

export default TestUtil;
