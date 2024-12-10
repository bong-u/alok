import { PrismaClient } from "@prisma/client";
import {
	DateDTO,
	DateAndRecords,
	DateAndAttendees,
} from "../types/date.types";

const prisma = new PrismaClient();

class DateRepository {
	static async createDate(date: string): Promise<DateDTO> {
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

	static async getDateId(date: string): Promise<DateDTO | null> {
		return await prisma.date.findUnique({
			where: {
				date,
			},
		});
	}

	static async deleteDateById(dateId: number): Promise<DateDTO> {
		return await prisma.date.delete({
			where: {
				id: dateId,
			},
		});
	}
}

export default DateRepository;
