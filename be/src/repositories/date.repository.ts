import { Prisma } from "@prisma/client";
import prisma from "../prisma";
import { DateDTO, DateAndRecords, DateAndAttendees } from "../types/date.types";

class DateRepository {
	static async createDate(
		date: string,
		tx?: Prisma.TransactionClient
	): Promise<DateDTO> {
		const client = tx || prisma;
		return await client.date.create({
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

	static async getDateId(
		date: string,
		tx?: Prisma.TransactionClient
	): Promise<number | null> {
		const client = tx || prisma;
		const dateObj = await client.date.findUnique({
			where: {
				date,
			},
		});
		return dateObj ? dateObj.id : null;
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
