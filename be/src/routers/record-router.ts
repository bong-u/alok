import { Router, Response } from "express";
import {
	DailyRecord,
	recordSchema,
	getRecordsSchema,
	deleteRecordRequestSchema,
} from "../interfaces/record-interfaces";
import RecordService from "../services/record-service";
import UserService from "../services/user-service";
import DateService from "../services/date-service";
import validationMiddleware from "../middlewares/validation-middleware";
import {
	UserNotFoundError,
	RecordNotFoundError,
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
				await UserService.getUserById(userId);

				const records = await RecordService.getRecordsByMonth(
					year,
					month,
					userId
				);

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
			const { date, recordType } = req.body;
			const userId = Number(req.userId);
			let dateId: number = 0;
			try {
				await UserService.getUserById(req.userId);

				if (
					await RecordService.isRecordExist(date, recordType, userId)
				) {
					res.status(409).send("Record already exists");
					return;
				}

				try {
					dateId = await DateService.getDateId(date);
				} catch (err: any) {
					if (err instanceof DateNotFoundError) {
						dateId = (await DateService.createDate(date)).id;
					}
				}

				const record = req.body as DailyRecord;
				await RecordService.createRecord(record, dateId, req.userId);
				res.status(201).send("Record created successfully");
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

	router.delete(
		"/:date/:recordType",
		validationMiddleware(deleteRecordRequestSchema, "params"),
		async (req: any, res: Response) => {
			const { date, recordType } = req.params;
			const userId = Number(req.userId);
			try {
				const recordId = await RecordService.getRecordIdByDateAndType(
					date,
					recordType,
					userId
				);

				RecordService.deleteRecordById(recordId);
				res.status(200).send("Record deleted successfully");
			} catch (err: any) {
				if (err instanceof RecordNotFoundError) {
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
