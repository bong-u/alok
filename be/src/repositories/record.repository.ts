import { Prisma, PrismaClient } from "@prisma/client";
import { RecordWithDate, MonthlyRecord } from "../types/record.types";

const prisma = new PrismaClient();

class RecordRepository {
	static async getRecordsByMonth(
		year: number,
		month: number,
		userId: number
	): Promise<RecordWithDate[]> {
		const formattedMonth = month < 10 ? `0${month}` : `${month}`; // 1자리 월을 2자리로 변환
		const yearMonthPrefix = `${year}-${formattedMonth}`; // "YYYY-MM" 형식 생성

		return await prisma.record.findMany({
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
	}

	static async getRecordsByYear(
		year: number,
		userId: number
	): Promise<MonthlyRecord[]> {
		// 연도와 사용자 ID를 기준으로 날짜 정보를 포함하여 데이터 조회
		return await prisma.$queryRaw<MonthlyRecord[]>`
                        SELECT
                                TO_CHAR(d.date::DATE, 'MM') AS month, -- 월 추출
                                r.record_type AS "recordType",
                                SUM(r.amount) AS amount
                        FROM record r
                        JOIN date d ON r.date_id = d.id
                        WHERE TO_CHAR(d.date::DATE, 'YYYY') = ${year.toString()} -- 연도 필터링
                          AND r.user_id = ${userId}                             -- 사용자 ID 필터링
                        GROUP BY TO_CHAR(d.date::DATE, 'MM'), r.record_type;
                `;
	}

	static async getRecordIdByDateAndType(
		dateId: number,
		recordType: string,
		userId: number,
		tx?: Prisma.TransactionClient
	): Promise<number | null> {
		const client = tx || prisma;

		const record = await client.record.findFirst({
			where: {
				dateId,
				recordType,
				userId,
			},
			select: { id: true },
		});
		return record ? record.id : null;
	}

	static async createRecord(
		dateId: number,
		recordType: string,
		amount: number,
		userId: number,
		tx?: Prisma.TransactionClient
	): Promise<void> {
		const client = tx || prisma;
		await client.record.create({
			data: {
				recordType: recordType,
				amount: amount,
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

export default RecordRepository;
