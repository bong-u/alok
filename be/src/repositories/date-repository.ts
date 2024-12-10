import { PrismaClient } from "@prisma/client";
import {
	DateBase,
	DateAndRecords,
	DateAndAttendees,
} from "../types/date-types";

const prisma = new PrismaClient();

class DateRepository {
	static async createDate(date: string) {
		return await prisma.date.create({
			data: {
				date,
			},
		});
	}

	static async getDateAndRecords(
		date: string,
		userId: number
	): Promise<DateAndRecords | null> {
		return await prisma.date.findUnique({
			where: {
				date,
			},
			include: {
				records: {
					where: {
						userId,
					},
				},
			},
		});
	}

	static async getDateAndAttendees(
		date: string,
		userId: number
	): Promise<DateAndAttendees | null> {
		return await prisma.date.findUnique({
			where: {
				date,
			},
			include: {
				dateAttendees: {
					include: {
						attendee: true,
					},
					where: {
						attendee: {
							partnerUserId: userId,
						},
					},
				},
			},
		});
	}

	static async getDateId(date: string): Promise<DateBase | null> {
		return await prisma.date.findUnique({
			where: {
				date,
			},
		});
	}

	static async deleteDateById(dateId: number) {
		return await prisma.date.delete({
			where: {
				id: dateId,
			},
		});
	}
}

export default DateRepository;
