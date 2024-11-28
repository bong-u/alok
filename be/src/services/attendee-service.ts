import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

interface Attendee {
	id: number;
	name: string;
	partnerUserId: number;
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
	): Promise<Attendee | null> {
		return await prisma.attendee.findFirst({
			where: {
				name,
				partnerUserId,
			},
		});
	}

	static async getFriendNames(partnerUserId: number): Promise<string[]> {
		const attendees = await prisma.attendee.findMany({
			where: {
				partnerUserId,
			},
		});
		return attendees.map((attendee) => attendee.name);
	}

	static async getAttendeesByRecordId(recordId: number): Promise<Attendee[]> {
		const recordAttendees = await prisma.recordAttendee.findMany({
			where: {
				recordId: recordId,
			},
			select: {
				attendee: {
					select: {
						id: true,
						name: true,
						partnerUserId: true,
					},
				},
			},
		});

		return recordAttendees.map((recordAttendee) => recordAttendee.attendee);
	}

	static async getAttendedRecords(attendeeId: number): Promise<Record[]> {
		const recordAttendees = await prisma.recordAttendee.findMany({
			where: {
				attendeeId,
			},
			select: {
				record: {
					select: {
						id: true,
					},
				},
			},
		});

		return recordAttendees.map((recordAttendee) => recordAttendee.record);
	}

	static async addAttendeeToRecord(
		attendeeId: number,
		recordId: number
	): Promise<void> {
		await prisma.recordAttendee.create({
			data: {
				attendeeId,
				recordId,
			},
		});
	}

	static async deleteAttendeeInRecord(
		attendeeId: number,
		recordId: number
	): Promise<void> {
		await prisma.recordAttendee.delete({
			where: {
				recordId_attendeeId: {
					attendeeId,
					recordId,
				},
			},
		});
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
