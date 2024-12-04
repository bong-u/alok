import { PrismaClient } from "@prisma/client";
import { DateNotFoundError } from "../exceptions";

const prisma = new PrismaClient();

class DateService {
	static async createDate(date: string) {
		return await prisma.date.create({
			data: {
				date,
			},
		});
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
}

export default DateService;
