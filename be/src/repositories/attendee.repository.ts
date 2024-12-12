import { PrismaClient } from "@prisma/client";
import { AttendeeDTO } from "../types/attendee.types";

const prisma = new PrismaClient();

class AttendeeRepository {
	static async createAttendee(
		name: string,
		partnerUserId: number
	): Promise<AttendeeDTO> {
		return await prisma.attendee.create({
			data: {
				name,
				partnerUserId,
			},
			select: {
				id: true,
				name: true,
			},
		});
	}

	static async connectAttendeeToDate(
		attendeeId: number,
		dateId: number
	): Promise<void> {
		await prisma.dateAttendee.create({
			data: {
				dateId,
				attendeeId,
			},
		});
	}

	static async getAttendeeByName(
		name: string,
		partnerUserId: number
	): Promise<AttendeeDTO | null> {
		return await prisma.attendee.findFirst({
			where: {
				name,
				partnerUserId,
			},
			select: {
				id: true,
				name: true,
			},
		});
	}

	static async getFriends(partnerUserId: number): Promise<AttendeeDTO[]> {
		const attendees = await prisma.attendee.findMany({
			where: {
				partnerUserId,
			},
			select: {
				id: true,
				name: true,
			},
		});
		return attendees;
	}

	static async getAttendeesByDateId(
		dateId: number,
		partnerUserId: number
	): Promise<AttendeeDTO[]> {
		return await prisma.attendee.findMany({
			where: {
				partnerUserId,
				dateAttendees: {
					some: {
						dateId,
					},
				},
			},
			select: {
				id: true,
				name: true,
			},
		});
	}

	static async getDateAttendee(attendeeId: number, dateId: number) {
		return await prisma.dateAttendee.findFirst({
			where: {
				attendeeId,
				dateId,
			},
		});
	}

	static async getDateAttendees(attendeeId: number) {
		return await prisma.dateAttendee.findMany({
			where: {
				attendeeId,
			},
		});
	}

	static async deleteDateAttendee(attendeeId: number, dateId: number) {
		await prisma.dateAttendee.deleteMany({
			where: {
				attendeeId,
				dateId,
			},
		});
	}

	static async deleteAttendeeById(attendeeId: number): Promise<void> {
		await prisma.attendee.delete({
			where: {
				id: attendeeId,
			},
		});
	}

	static async getAttendeeNameWithCount(
		record_type: string,
		userId: number,
		limit: number = 10
	) {
		return prisma.$queryRaw`
		WITH relevant_records AS (
			SELECT
				r.date_id,
				r.record_type
			FROM
				record r
			WHERE
				r.user_id = ${userId}
				AND r.record_type = ${record_type}
		)
		SELECT
			a.name AS name,
			COUNT(da.attendee_id)::INT AS count
		FROM
			date_attendee da
		JOIN
			attendee a ON da.attendee_id = a.id AND a.user_id = ${userId}
		LEFT JOIN
			relevant_records rr ON rr.date_id = da.date_id
		GROUP BY
			da.attendee_id, a.name, rr.record_type
		ORDER BY
			count DESC
		LIMIT ${limit}
		`;
	}
}

export default AttendeeRepository;
