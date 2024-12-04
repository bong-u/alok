import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

class DateService {
	static async createDate(date: string) {
		return await prisma.date.create({
			data: {
				date,
			},
		});
	}
	static async getDateId(date: string): Promise<number | null> {
		const dateObj = await prisma.date.findUnique({
			where: {
				date,
			},
		});

		if (!dateObj) {
			return null;
		}

		return dateObj.id;
	}
}

export default DateService;
