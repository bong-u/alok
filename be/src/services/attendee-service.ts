import { PrismaClient } from "@prisma/client";
import { AttendeeNotFoundError } from "../exceptions";
import { AttendeeResponse } from "../interfaces/attendee-interfaces";

const prisma = new PrismaClient();

class AttendeeService {
	static async createAttendee(
		name: string,
		partnerUserId: number
	): Promise<AttendeeResponse> {
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
	): Promise<AttendeeResponse> {
		const attendee = await prisma.attendee.findFirst({
			where: {
				name,
				partnerUserId,
			},
			select: {
				id: true,
				name: true,
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

	static async deleteAttendee(attendeeId: number): Promise<void> {
		await prisma.attendee.delete({
			where: {
				id: attendeeId,
			},
		});
	}
}

export default AttendeeService;
