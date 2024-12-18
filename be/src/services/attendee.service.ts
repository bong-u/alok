import {
	AttendeeNotFoundError,
	AttendeeExceedsMaxError,
	AttendeeAlreadyExistsError,
} from "../exceptions";
import { AttendeeDTO, AttendeeNameWithCount } from "../types/attendee.types";
import AttendeeRepository from "../repositories/attendee.repository";
import DateService from "../services/date.service";

class AttendeeService {
	static async createAttendee(
		date: string,
		attendeeName: string,
		partnerUserId: number
	): Promise<AttendeeDTO> {
		// 참여자를 조회 ,없으면 생성
		const attendee =
			(await AttendeeRepository.getAttendeeByName(
				attendeeName,
				partnerUserId
			)) ??
			(await AttendeeRepository.createAttendee(
				attendeeName,
				partnerUserId
			));

		const dateObj = await DateService.getDateAndAttendees(
			date,
			partnerUserId
		);
		// 해당 date의 참여자가 10명 이상이면 예외 발생
		if (dateObj.dateAttendees.length >= 10)
			throw new AttendeeExceedsMaxError();

		const isAttended = await AttendeeService.isAttended(
			attendee.id,
			dateObj.id
		);
		// 이미 참여한 참여자인 경우 예외 발생
		if (isAttended) throw new AttendeeAlreadyExistsError();

		// 참여자와 날짜를 연결
		await AttendeeRepository.connectAttendeeToDate(attendee.id, dateObj.id);

		return attendee;
	}

	static async getFriends(partnerUserId: number): Promise<AttendeeDTO[]> {
		return await AttendeeRepository.getFriends(partnerUserId);
	}

	static async getAttendeesByDate(
		date: string,
		partnerUserId: number
	): Promise<AttendeeDTO[]> {
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
	): Promise<void> {
		// 참여자와 날짜를 조회
		const [attendee, dateId] = await Promise.all([
			AttendeeService.getAttendeeByName(attendeeName, userId),
			DateService.getDateId(date),
		]);

		const dateAttendees = await AttendeeRepository.getDateAttendees(
			attendee.id
		);

		const isAttended = dateAttendees.some(
			(item) => item.dateId === dateId && item.attendeeId === attendee.id
		);
		// 참여자가 해당 날짜에 참여하지 않았다면 예외 발생
		if (!isAttended) {
			throw new AttendeeNotFoundError();
		}

		// 참여자가 다른 기록에 참여하지 않았다면 Attendee 삭제
		if (dateAttendees.length === 1) {
			await AttendeeRepository.deleteAttendeeById(attendee.id);
		}
		// 참여자가 다른 기록에 참여하고 있다면 참여 기록만 삭제
		else {
			await AttendeeRepository.deleteDateAttendee(attendee.id, dateId);
		}
	}

	static async getAttendeeByName(
		name: string,
		partnerUserId: number
	): Promise<AttendeeDTO> {
		const attendee = await AttendeeRepository.getAttendeeByName(
			name,
			partnerUserId
		);

		if (!attendee) throw new AttendeeNotFoundError();
		return attendee;
	}

	static async getAttendeeNameWithCount(
		recordType: string,
		userId: number
	): Promise<AttendeeNameWithCount[]> {
		return (await AttendeeRepository.getAttendeeNameWithCount(
			recordType,
			userId
		)) as AttendeeNameWithCount[];
	}

	static async isAttended(
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
