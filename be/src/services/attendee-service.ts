import { PrismaClient } from "@prisma/client";
import { AttendeeNotFoundError } from "../exceptions";

const prisma = new PrismaClient();

interface Attendee {
	id: number;
	name: string;
	partnerUserId: number;
}

interface AttendeeResponse {
	id: number;
	name: string;
}

interface Record {
	id: number;
}

class AttendeeService {
	static async createAttendee(
		name: string,
		partnerUserId: number
	): Promise<Attendee> {
		return await prisma.attendee.create({
			data: {
				name,
				partnerUserId,
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
	): Promise<Attendee> {
		const attendee = await prisma.attendee.findFirst({
			where: {
				name,
				partnerUserId,
			},
		});

		if (!attendee) throw new AttendeeNotFoundError();

		return attendee;
	}

	static async getFriends(
		partnerUserId: number
	): Promise<AttendeeResponse[]> {
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
	): Promise<AttendeeResponse[]> {
		const attendees = await prisma.attendee.findMany({
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

		return attendees;
	}

	static async isAttended(
		attendeeId: number,
		dateId: number
	): Promise<boolean> {
		const dateAttendee = await prisma.dateAttendee.findFirst({
			where: {
				attendeeId,
				dateId,
			},
		});

		return !!dateAttendee;
	}

	static async getAttendedRecords(attendeeId: number): Promise<Record[]> {
		const records = await prisma.record.findMany({
			where: {
				userId: attendeeId,
			},
			include: {
				date: true,
			},
		});

		return records;
	}

	static async deleteAttendee(attendeeId: number): Promise<void> {
		await prisma.attendee.delete({
			where: {
				id: attendeeId,
			},
		});
	}
}

export default AttendeeService;
