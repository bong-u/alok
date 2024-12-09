import { Router, Response } from "express";
import { DailyRecord } from "../types/record-types";
import {
	recordSchema,
	getRecordsSchema,
	deleteRecordRequestSchema,
} from "../schemas/record-schemas";
import RecordService from "../services/record-service";
import UserService from "../services/user-service";
import DateService from "../services/date-service";
import validationMiddleware from "../middlewares/validation-middleware";
import {
	UserNotFoundError,
	RecordNotFoundError,
	RecordAlreadyExistsError,
	DateNotFoundError,
} from "../exceptions";

const recordRouter = () => {
	const router = Router();

	router.get(
		"/:year",
		validationMiddleware(getRecordsSchema, "params"),
		async (req: any, res: Response) => {
			const year: number = Number(req.params.year);

			const records = await RecordService.getRecordsByYear(
				year,
				req.userId
			);
			res.json(records);
		}
	);

	router.get(
		"/:year/:month",
		validationMiddleware(getRecordsSchema, "params"),
		async (req: any, res: Response) => {
			const year = Number(req.params.year);
			const month = Number(req.params.month);

			try {
				const records = await RecordService.getRecordsByMonth(
					year,
					month,
					req.userId
				);
				res.json(records);
			} catch (err: any) {
				console.error(err);
				res.status(500).send(err.message);
			}
		}
	);

	router.get(
		"/:year/:month/user/:userId",
		validationMiddleware(getRecordsSchema, "params"),
		async (req: any, res: Response) => {
			const year = Number(req.params.year);
			const month = Number(req.params.month);
			const userId = Number(req.params.userId);

			try {
				const [_, records] = await Promise.all([
					UserService.getUserById(userId),
					RecordService.getRecordsByMonth(year, month, userId),
				]);

				res.json(records);
			} catch (err: any) {
				if (err instanceof UserNotFoundError) {
					res.status(404).send(err.message);
					return;
				}
				console.error(err);
				res.status(500).send(err.message);
			}
		}
	);

	router.post(
		"/",
		validationMiddleware(recordSchema),
		async (req: any, res: Response) => {
			const { date, recordType, amount } = req.body;
			const userId = Number(req.userId);
			// let dateId: number;
			try {
				await UserService.getUserById(userId);

				// date가 존재하지 않으면 생성
				// try {
				// 	dateId = await DateService.getDateId(date);
				// } catch (err: any) {
				// 	if (err instanceof DateNotFoundError) {
				// 		dateId = (await DateService.createDate(date)).id;
				// 	} else {
				// 		throw err;
				// 	}
				// }

				// Record가 이미 존재하는지 확인
				// if (
				// 	await RecordService.isRecordExist(
				// 		dateId,
				// 		recordType,
				// 		userId
				// 	)
				// ) {
				// 	res.status(409).send("Record already exists");
				// 	return;
				// }

				await RecordService.createRecord(
					{ recordType, amount } as DailyRecord,
					date,
					req.userId
				);
				res.status(201).send("Record created successfully");
			} catch (err: any) {
				if (err instanceof UserNotFoundError) {
					res.status(404).send(err.message);
					return;
				}
				if (err instanceof RecordAlreadyExistsError) {
					res.status(409).send(err.message);
					return;
				}
				console.error(err);
				res.status(500).send(err.message);
			}
		}
	);

	router.delete(
		"/:date/:recordType",
		validationMiddleware(deleteRecordRequestSchema, "params"),
		async (req: any, res: Response) => {
			const { date, recordType } = req.params;
			const userId = Number(req.userId);
			try {
				const dateObj = await DateService.getDateAndRecords(
					date,
					userId
				);

				const recordId = await RecordService.getRecordIdByDateAndType(
					dateObj.id,
					recordType,
					userId
				);

				// 해당 date의 마지막 record인 경우 date 삭제 -> record 삭제 (cascade)
				if (dateObj.records.length === 1) {
					await DateService.deleteDateById(dateObj.id);
				}
				// record만 삭제
				else {
					await RecordService.deleteRecordById(recordId);
				}
				res.status(200).send("Record deleted successfully");
			} catch (err: any) {
				if (
					err instanceof DateNotFoundError ||
					err instanceof RecordNotFoundError
				) {
					res.status(404).send(err.message);
					return;
				}
				console.error(err);
				res.status(500).send(err.message);
			}
		}
	);
	return router;
};

export default recordRouter;
