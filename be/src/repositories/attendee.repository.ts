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

	static async getFriends(
		partnerUserId: number
	): Promise<AttendeeDTO[]> {
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

	static async deleteAttendeeById(attendeeId: number): Promise<void> {
		await prisma.attendee.delete({
			where: {
				id: attendeeId,
			},
		});
	}
}

export default AttendeeRepository;
