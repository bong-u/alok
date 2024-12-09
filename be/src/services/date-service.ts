import { PrismaClient } from "@prisma/client";
import { DateNotFoundError } from "../exceptions";
import { DateAndRecords, DateAndAttendees } from "../types/date-types";

const prisma = new PrismaClient();

class DateService {
	static async createDate(date: string) {
		return await prisma.date.create({
			data: {
				date,
			},
		});
	}

	static async getDateAndRecords(date: string, userId: number): Promise<any> {
		const dateObj = await prisma.date.findUnique({
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

		if (!dateObj) throw new DateNotFoundError();
		return dateObj;
	}

	static async getDateAndAttendees(
		date: string,
		userId: number
	): Promise<any> {
		const dateObj = await prisma.date.findUnique({
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

		if (!dateObj) throw new DateNotFoundError();
		return dateObj;
	}

	static async getDateId(date: string): Promise<number> {
		const dateObj = await prisma.date.findUnique({
			where: {
				date,
			},
		});

		if (!dateObj) throw new DateNotFoundError();

		return dateObj.id;
	}

	static async deleteDateById(dateId: number) {
		return await prisma.date.delete({
			where: {
				id: dateId,
			},
		});
	}
}

export default DateService;
