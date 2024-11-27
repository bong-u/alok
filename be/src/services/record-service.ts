import { PrismaClient } from "@prisma/client";
import {
	DailyRecord,
	MonthlyRecord,
	RecordsGroupedByPeriod,
} from "../interfaces/record-interfaces";

const prisma = new PrismaClient();

class RecordService {
	static async getRecordById(
		recordId: number,
		userId: number
	): Promise<DailyRecord | null> {
		return (await prisma.record.findFirst({
			where: {
				id: recordId,
				userId,
			},
		})) as DailyRecord | null;
	}

	static async getRecordsByMonth(
		year: number,
		month: number,
		userId: number
	): Promise<RecordsGroupedByPeriod> {
		const formattedMonth = month < 10 ? `0${month}` : `${month}`; // 1자리 월을 2자리로 변환

		const records = (await prisma.record.findMany({
			where: {
				date: {
					startsWith: `${year}-${formattedMonth}`,
				},
				userId,
			},
		})) as DailyRecord[];

		return records.reduce(
			(
				acc: RecordsGroupedByPeriod,
				{ date, recordType, amount }: DailyRecord
			) => {
				if (!acc[date]) {
					acc[date] = [];
				}
				acc[date].push({ recordType, amount });
				return acc;
			},
			{} as RecordsGroupedByPeriod
		);
	}

	static async getRecordsByYear(
		year: number,
		userId: number
	): Promise<RecordsGroupedByPeriod> {
		const records = (await prisma.$queryRaw<
			MonthlyRecord[]
		>`SELECT strftime('%m', date) as month, record_type as recordType, SUM(amount) as amount
                FROM Record
                WHERE strftime('%Y', date) = ${year.toString()}
                AND user_id = ${userId}
                GROUP BY strftime('%m', date), record_type
        `) as MonthlyRecord[];

		return records.reduce(
			(
				acc: RecordsGroupedByPeriod,
				{ month, recordType, amount }: MonthlyRecord
			) => {
				const monthKey = `${year}-${month}`;
				if (!acc[monthKey]) {
					acc[monthKey] = [];
				}
				acc[monthKey].push({ recordType, amount });
				return acc;
			},
			{} as RecordsGroupedByPeriod
		);
	}

	static async getRecordByDateAndType(
		date: string,
		recordType: string,
		userId: number
	): Promise<DailyRecord | null> {
		return (await prisma.record.findUnique({
			where: {
				date_recordType_userId: {
					date,
					recordType,
					userId,
				},
			},
		})) as DailyRecord | null;
	}

	static async createRecord(
		record: DailyRecord,
		userId: number
	): Promise<void> {
		await prisma.record.create({
			data: {
				date: record.date,
				recordType: record.recordType,
				amount: record.amount,
				user: {
					connect: {
						id: userId,
					},
				},
			},
		});
	}

	static async deleteRecordByDateAndType(
		date: string,
		recordType: string,
		userId: number
	): Promise<void> {
		await prisma.record.delete({
			where: {
				date_recordType_userId: {
					date,
					recordType,
					userId,
				},
			},
		});
	}
}

export default RecordService;
