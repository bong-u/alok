import { PrismaClient } from "@prisma/client";
import {
	RecordDTO,
	MonthlyRecord,
	RecordsGroupedByPeriod,
} from "../types/record.types";
import { RecordNotFoundError, RecordAlreadyExistsError } from "../exceptions";
import RecordRepository from "../repositories/record.repository";
import UserService from "../services/user.service";
import DateService from "../services/date.service";
import DateRepository from "../repositories/date.repository";

const prisma = new PrismaClient();

class RecordService {
	static async getRecordsGroupedByDay(
		year: number,
		month: number,
		userId: number
	): Promise<RecordsGroupedByPeriod> {
		const records = await RecordRepository.getRecordsByMonth(
			year,
			month,
			userId
		);
		// 결과를 날짜별로 그룹화하여 반환
		const groupedRecords = records.reduce((acc, record) => {
			const dateKey = record.date.date; // `date.date`는 "YYYY-MM-DD" 형식
			if (!acc[dateKey]) {
				acc[dateKey] = [];
			}
			acc[dateKey].push({
				recordType: record.recordType,
				amount: record.amount,
			} as RecordDTO);
			return acc;
		}, {} as RecordsGroupedByPeriod);

		return groupedRecords;
	}

	static async getRecordsGroupedByMonth(
		year: number,
		userId: number
	): Promise<RecordsGroupedByPeriod> {
		const records = await RecordRepository.getRecordsByYear(year, userId);

		// 결과를 월별로 그룹화하여 반환
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
		dateId: number,
		recordType: string,
		userId: number
	): Promise<boolean> {
		const recordId = await RecordRepository.getRecordIdByDateAndType(
			dateId,
			recordType,
			userId
		);
		return recordId ? true : false;
	}

	static async getOtherUserRecordsGroupedByDay(
		year: number,
		month: number,
		userId: number
	): Promise<RecordsGroupedByPeriod> {
		const [, records] = await Promise.all([
			UserService.getUserById(userId),
			RecordService.getRecordsGroupedByDay(year, month, userId),
		]);

		return records;
	}

	static async createRecord(
		recordType: string,
		amount: number,
		date: string,
		userId: number
	): Promise<void> {
		// 트랜잭션 사용
		await prisma.$transaction(async (tx) => {
			// dateId를 조회, 없으면 생성
			const dateId =
				(await DateRepository.getDateId(date, tx)) ??
				(await DateRepository.createDate(date, tx)).id;

			const existingRecord =
				await RecordRepository.getRecordIdByDateAndType(
					dateId,
					recordType,
					userId
				);

			// 이미 기록이 있는 경우
			if (existingRecord) throw new RecordAlreadyExistsError();

			await RecordRepository.createRecord(
				dateId,
				recordType,
				amount,
				userId,
				tx
			);
		});
	}

	static async deleteRecordById(recordId: number): Promise<void> {
		await prisma.record.delete({
			where: {
				id: recordId,
			},
		});
	}

	static async deleteRecord(
		date: string,
		recordType: string,
		userId: number
	): Promise<void> {
		const dateObj = await DateService.getDateAndRecords(date, userId);
		const recordId = await RecordRepository.getRecordIdByDateAndType(
			dateObj.id,
			recordType,
			userId
		);

		if (!recordId) throw new RecordNotFoundError();

		// 해당 date의 마지막 record인 경우 date 삭제 -> record 삭제 (cascade)
		if (dateObj.records.length === 1) {
			await DateService.deleteDateById(dateObj.id);
		}
		// record만 삭제
		else {
			await RecordRepository.deleteRecordById(recordId);
		}
	}
}

export default RecordService;
