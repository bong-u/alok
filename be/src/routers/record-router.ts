import { Router, Request, Response } from "express";
import {
	DailyRecord,
	recordSchema,
	getRecordsSchema,
	deleteRecordRequestSchema,
} from "../interfaces/record-interfaces";
import RecordService from "../services/record-service";
import UserService from "../services/user-service";
import validationMiddleware from "../middlewares/validation-middleware";

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
			const { year, month } = req.params;

			const records = await RecordService.getRecordsByMonth(
				Number(year),
				Number(month),
				req.userId
			);
			res.json(records);
		}
	);

	router.get(
		"/:year/:month/user/:userId",
		validationMiddleware(getRecordsSchema, "params"),
		async (req: any, res: Response) => {
			const { year, month, userId } = req.params;

			const user = await UserService.getUserById(Number(userId));

			if (!user) {
				res.status(404).send("User not found");
				return;
			}

			const records = await RecordService.getRecordsByMonth(
				Number(year),
				Number(month),
				Number(userId)
			);

			res.json(records);
		}
	);

	router.post(
		"/",
		validationMiddleware(recordSchema),
		async (req: any, res: Response) => {
			const user = await UserService.getUserById(req.userId);
			if (!user) {
				res.status(404).send("User not found");
				return;
			}

			// Date와 DrinkType이 같은 기록이 이미 존재하는지 확인
			const existing_record = await RecordService.getRecordByDateAndType(
				req.body.date,
				req.body.recordType,
				req.userId
			);
			if (existing_record) {
				res.status(409).send("Record already exists");
				return;
			}

			try {
				const record = req.body as DailyRecord;
				await RecordService.createRecord(record, req.userId);
				res.status(201).send("Record created successfully");
			} catch (err: any) {
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

			// date와 drinkType 해당하는 기록이 존재하는지 확인
			const record = await RecordService.getRecordByDateAndType(
				date,
				recordType,
				req.userId
			);

			if (!record) {
				res.status(404).send("Record not found");
				return;
			}

			try {
				RecordService.deleteRecordByDateAndType(
					date,
					recordType,
					req.userId
				);
				res.status(200).send("Record deleted successfully");
			} catch (err: any) {
				console.error(err);
				res.status(500).send(err.message);
			}
		}
	);
	return router;
};

export default recordRouter;
