import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

interface Attendee {
	id: number;
	name: string;
	partnerUserId: number;
}

class AttendeeService {
	static async createAttendee(
		name: string,
		partnerUserId: number
	): Promise<Attendee> {
		return await prisma.attendee.create({
			data: {
				name,
				user: {
					connect: {
						id: partnerUserId,
					},
				},
			},
		});
	}

	static async getAttendeeByName(
		name: string,
		partnerUserId: number
	): Promise<any> {
		return await prisma.attendee.findFirst({
			where: {
				name,
				partnerUserId,
			},
		});
	}

	static async getAttendeeNames(partnerUserId: number): Promise<string[]> {
		const attendees = await prisma.attendee.findMany({
			where: {
				partnerUserId,
			},
		});
		return attendees.map((attendee) => attendee.name);
	}

	static async addAttendeeToRecord(
		attendeeId: number,
		recordId: number
	): Promise<any> {
		await prisma.recordAttendee.create({
			data: {
				attendeeId,
				recordId,
			},
		});
	}
}

export default AttendeeService;
