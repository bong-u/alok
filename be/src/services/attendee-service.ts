import {
	AttendeeNotFoundError,
	AttendeeExceedsMaxError,
	AttendeeAlreadyExistsError,
} from "../exceptions";
import { AttendeeResponse } from "../types/attendee-types";
import AttendeeRepository from "../repositories/attendee-repository";
import DateService from "./date-service";

class AttendeeService {
	static async createAttendee(
		date: string,
		attendeeName: string,
		partnerUserId: number
	): Promise<AttendeeResponse> {
		let attendee = null;
		attendee = await AttendeeRepository.getAttendeeByName(
			attendeeName,
			partnerUserId
		);
		if (!attendee)
			attendee = await AttendeeRepository.createAttendee(
				attendeeName,
				partnerUserId
			);

		const dateObj = await DateService.getDateAndAttendees(
			date,
			partnerUserId
		);
		if (dateObj.dateAttendees.length >= 5)
			throw new AttendeeExceedsMaxError();

		const isAttended = await AttendeeService.isAttended(
			attendee.id,
			dateObj.id
		);
		if (isAttended) throw new AttendeeAlreadyExistsError();

		await AttendeeRepository.connectAttendeeToDate(attendee.id, dateObj.id);

		return attendee;
	}

	static async getFriends(
		partnerUserId: number
	): Promise<AttendeeResponse[]> {
		return await AttendeeRepository.getFriends(partnerUserId);
	}

	static async getAttendeesByDate(
		date: string,
		partnerUserId: number
	): Promise<AttendeeResponse[]> {
		const dateId = await DateService.getDateId(date);

		return await AttendeeRepository.getAttendeesByDateId(
			dateId,
			partnerUserId
		);
	}

	static async deleteAttendee(
		date: string,
		attendeeName: string,
		userId: number
	) {
		const [attendee, dateId] = await Promise.all([
			AttendeeService.getAttendeeByName(attendeeName, userId),
			DateService.getDateId(date),
		]);

		if (!AttendeeService.isAttended(attendee.id, dateId))
			throw new AttendeeNotFoundError();

		await AttendeeRepository.deleteAttendeeById(attendee.id);
	}

	private static async getAttendeeByName(
		name: string,
		partnerUserId: number
	): Promise<AttendeeResponse> {
		const attendee = await AttendeeRepository.getAttendeeByName(
			name,
			partnerUserId
		);

		if (!attendee) throw new AttendeeNotFoundError();
		return attendee;
	}
	private static async isAttended(
		attendeeId: number,
		dateId: number
	): Promise<boolean> {
		const dateAttendee = await AttendeeRepository.getDateAttendee(
			attendeeId,
			dateId
		);
		return !!dateAttendee;
	}
}

export default AttendeeService;
