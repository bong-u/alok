import { Request, Router, Response } from "express";
import {
	recordSchema,
	getRecordsSchema,
	deleteRecordRequestSchema,
} from "../schemas/record.schemas";
import RecordService from "../services/record.service";
import UserService from "../services/user.service";
import validationMiddleware from "../middlewares/validation.middleware";
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
		async (req: Request, res: Response) => {
			const year: number = Number(req.params.year);

			try {
				const records = await RecordService.getRecordsGroupedByMonth(
					year,
					req.userId
				);
				return res.json(records);
			} catch (err: unknown) {
				console.error(err);
				return res.status(500).send((err as Error).message);
			}
		}
	);

	router.get(
		"/:year/:month",
		validationMiddleware(getRecordsSchema, "params"),
		async (req: Request, res: Response) => {
			const year = Number(req.params.year);
			const month = Number(req.params.month);

			try {
				const records = await RecordService.getRecordsGroupedByDay(
					year,
					month,
					req.userId
				);
				return res.json(records);
			} catch (err: unknown) {
				console.error(err);
				return res.status(500).send((err as Error).message);
			}
		}
	);

	router.get(
		"/:year/:month/user/:userId",
		validationMiddleware(getRecordsSchema, "params"),
		async (req: Request, res: Response) => {
			const year = Number(req.params.year);
			const month = Number(req.params.month);
			const userId = Number(req.params.userId);

			try {
				const records =
					await RecordService.getOtherUserRecordsGroupedByDay(
						year,
						month,
						userId
					);

				return res.json(records);
			} catch (err: unknown) {
				if (err instanceof UserNotFoundError)
					return res.status(404).send(err.message);

				console.error(err);
				return res.status(500).send((err as Error).message);
			}
		}
	);

	router.post(
		"/",
		validationMiddleware(recordSchema),
		async (req: Request, res: Response) => {
			const { date, recordType, amount } = req.body;
			const userId = Number(req.userId);
			try {
				await UserService.getUserById(userId);
				await RecordService.createRecord(
					recordType,
					amount,
					date,
					userId
				);
				return res.status(201).send("Record created successfully");
			} catch (err: unknown) {
				if (err instanceof UserNotFoundError)
					return res.status(404).send(err.message);
				if (err instanceof RecordAlreadyExistsError)
					return res.status(409).send(err.message);
				console.error(err);
				return res.status(500).send((err as Error).message);
			}
		}
	);

	router.delete(
		"/:date/:recordType",
		validationMiddleware(deleteRecordRequestSchema, "params"),
		async (req: Request, res: Response) => {
			const date = String(req.params.date);
			const recordType = String(req.params.recordType);
			const userId = Number(req.userId);
			try {
				await RecordService.deleteRecord(date, recordType, userId);
				return res.status(200).send("Record deleted successfully");
			} catch (err: unknown) {
				if (
					err instanceof DateNotFoundError ||
					err instanceof RecordNotFoundError
				)
					return res.status(404).send(err.message);

				console.error(err);
				return res.status(500).send((err as Error).message);
			}
		}
	);
	return router;
};

export default recordRouter;
