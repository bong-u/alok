import { DateNotFoundError } from "../exceptions";
import { DateAndRecords, DateAndAttendees } from "../types/date-types";
import DateRepository from "../repositories/date-repository";

class DateService {
	static async createDate(date: string) {
		return await DateRepository.createDate(date);
	}

	static async getDateAndRecords(
		date: string,
		userId: number
	): Promise<DateAndRecords> {
		const dateObj = await DateRepository.getDateAndRecords(date, userId);

		if (!dateObj) throw new DateNotFoundError();
		return dateObj;
	}

	static async getDateAndAttendees(
		date: string,
		userId: number
	): Promise<DateAndAttendees> {
		const dateObj = await DateRepository.getDateAndAttendees(date, userId);

		if (!dateObj) throw new DateNotFoundError();
		return dateObj;
	}

	static async getDateId(date: string): Promise<number> {
		const dateObj = await DateRepository.getDateId(date);

		if (!dateObj) throw new DateNotFoundError();
		return dateObj.id;
	}

	static async deleteDateById(dateId: number) {
		return await DateRepository.deleteDateById(dateId);
	}
}

export default DateService;
