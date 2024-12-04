import { PrismaClient } from "@prisma/client";
import {
	DailyRecord,
	MonthlyRecord,
	RecordsGroupedByPeriod,
} from "../interfaces/record-interfaces";
import { RecordNotFoundError } from "../exceptions";

const prisma = new PrismaClient();

class RecordService {
	static async getRecordsByMonth(
		year: number,
		month: number,
		userId: number
	): Promise<RecordsGroupedByPeriod> {
		const formattedMonth = month < 10 ? `0${month}` : `${month}`; // 1자리 월을 2자리로 변환
		const yearMonthPrefix = `${year}-${formattedMonth}`; // "YYYY-MM" 형식 생성

		// Prisma 쿼리
		const records = await prisma.record.findMany({
			where: {
				userId, // 사용자 ID 필터링
				date: {
					date: {
						startsWith: yearMonthPrefix, // "YYYY-MM"으로 시작하는 날짜 필터링
					},
				},
			},
			include: {
				date: true, // 관련 `Date` 모델의 데이터 포함
			},
		});

		// 결과를 월별로 그룹화
		const groupedRecords = records.reduce((acc, record) => {
			const dateKey = record.date.date; // `date.date`는 "YYYY-MM-DD" 형식
			if (!acc[dateKey]) {
				acc[dateKey] = [];
			}
			acc[dateKey].push({
				recordType: record.recordType,
				amount: record.amount,
			} as DailyRecord);
			return acc;
		}, {} as RecordsGroupedByPeriod);

		return groupedRecords;
	}

	static async getRecordsByYear(
		year: number,
		userId: number
	): Promise<RecordsGroupedByPeriod> {
		// 연도와 사용자 ID를 기준으로 날짜 정보를 포함하여 데이터 조회
		const records = (await prisma.$queryRaw<MonthlyRecord[]>`
        SELECT
            strftime('%m', d.date) as month,
            r.record_type as recordType,
            SUM(r.amount) as amount
        FROM Record r
        JOIN Date d ON r.date_id = d.id
        WHERE strftime('%Y', d.date) = ${year.toString()}
        AND r.user_id = ${userId}
        GROUP BY strftime('%m', d.date), r.record_type
    `) as MonthlyRecord[];

		// 월별로 그룹화하여 반환
		return records.reduce(
			(
				acc: RecordsGroupedByPeriod,
				{ month, recordType, amount }: MonthlyRecord
			) => {
				const monthKey = `${year}-${month}`; // "YYYY-MM" 형식
				if (!acc[monthKey]) {
					acc[monthKey] = [];
				}
				acc[monthKey].push({ recordType, amount });
				return acc;
			},
			{} as RecordsGroupedByPeriod
		);
	}

	static async isRecordExist(
		date: string,
		recordType: string,
		userId: number
	): Promise<boolean> {
		try {
			await RecordService.getRecordIdByDateAndType(
				date,
				recordType,
				userId
			);
			return true;
		} catch (error: any) {
			if (error instanceof RecordNotFoundError) {
				return false;
			}
			throw error;
		}
	}

	static async getRecordIdByDateAndType(
		date: string,
		recordType: string,
		userId: number
	): Promise<number> {
		const dateRow = await prisma.date.findUnique({
			where: { date },
			select: { id: true },
		});

		if (!dateRow?.id) throw new RecordNotFoundError();

		const record = await prisma.record.findFirst({
			where: {
				dateId: dateRow.id,
				recordType,
				userId,
			},
			select: { id: true },
		});

		if (!record?.id) throw new RecordNotFoundError();

		return record!.id;
	}

	static async createRecord(
		record: DailyRecord,
		dateId: number,
		userId: number
	): Promise<void> {
		await prisma.record.create({
			data: {
				recordType: record.recordType,
				amount: record.amount,
				date: {
					connect: {
						id: dateId,
					},
				},
				user: {
					connect: {
						id: userId,
					},
				},
			},
		});
	}

	static async deleteRecordById(recordId: number): Promise<void> {
		await prisma.record.delete({
			where: {
				id: recordId,
			},
		});
	}
}

export default RecordService;
