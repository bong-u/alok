import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import { randomBytes } from "crypto";
import { RecordDTO } from "../types/record.types";
import { DateDTO, DateAttendeeDTO } from "../types/date.types";
import { AttendeeDTO } from "../types/attendee.types";

const prisma = new PrismaClient();
const SALT_ROUNDS = parseInt(process.env.SALT_ROUNDS || "10");

const generateRandomString = (): string => {
	return randomBytes(5).toString("hex");
};

export interface UserResult {
	id: number;
	username: string;
	hashedPassword: string;
	plainPassword: string;
}

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

	async createDate(date: string): Promise<DateDTO> {
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
	): Promise<RecordDTO> {
		return (await prisma.record.create({
			data: {
				dateId,
				recordType,
				amount,
				userId,
			},
		})) as RecordDTO;
	},

	async createAttendee(
		attendeeName: string,
		userId: number
	): Promise<AttendeeDTO> {
		return await prisma.attendee.create({
			data: {
				name: attendeeName,
				partnerUserId: userId,
			},
		});
	},

	async connectAttendeeToDate(
		attendeeId: number,
		dateId: number
	): Promise<DateAttendeeDTO> {
		return await prisma.dateAttendee.create({
			data: {
				dateId,
				attendeeId,
			},
		});
	},
};

export default TestUtil;
