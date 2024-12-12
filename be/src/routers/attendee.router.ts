import { Request, Router, Response } from "express";
import AttendeeService from "../services/attendee.service";
import {
	DateNotFoundError,
	AttendeeNotFoundError,
	AttendeeExceedsMaxError,
	AttendeeAlreadyExistsError,
} from "../exceptions";
import validationMiddleware from "../middlewares/validation.middleware";
import {
	createAttendeeSchema,
	getAttendeeSchema,
	deleteAttendeeSchema,
} from "../schemas/attendee.schemas";
import { recordTypeSchema } from "../schemas/record.schemas";

const attendeeRouter = () => {
	const router = Router();

	router.post(
		"/:date/:attendeeName",
		validationMiddleware(createAttendeeSchema, "params"),
		async (req: Request, res: Response) => {
			const date = String(req.params.date);
			const attendeeName = String(req.params.attendeeName);
			const userId = Number(req.userId);

			try {
				await AttendeeService.createAttendee(
					date,
					attendeeName,
					userId
				);
				return res.status(200).send("Attendee added successfully");
			} catch (err: unknown) {
				if (err instanceof AttendeeExceedsMaxError)
					return res.status(403).send(err.message);
				if (err instanceof DateNotFoundError)
					return res.status(404).send(err.message);
				if (err instanceof AttendeeAlreadyExistsError)
					return res.status(409).send(err.message);

				console.error(err);
				return res.status(500).send((err as Error).message);
			}
		}
	);

	router.get("/", async (req: Request, res: Response) => {
		const userId = Number(req.userId);
		try {
			const attendees = await AttendeeService.getFriends(userId);
			return res.status(200).send(attendees);
		} catch (err: unknown) {
			console.error(err);
			return res.status(500).send((err as Error).message);
		}
	});

	router.get(
		"/:date",
		validationMiddleware(getAttendeeSchema, "params"),
		async (req: Request, res: Response) => {
			const date = String(req.params.date);
			const userId = Number(req.userId);

			try {
				const attendees = await AttendeeService.getAttendeesByDate(
					date,
					userId
				);
				return res.status(200).send(attendees);
			} catch (err: unknown) {
				if (err instanceof DateNotFoundError)
					return res.status(200).send([]);

				console.error(err);
				return res.status(500).send((err as Error).message);
			}
		}
	);

	router.delete(
		"/:date/:attendeeName",
		validationMiddleware(deleteAttendeeSchema, "params"),
		async (req: Request, res: Response) => {
			const date = String(req.params.date);
			const attendeeName = String(req.params.attendeeName);
			const userId = Number(req.userId);

			try {
				await AttendeeService.deleteAttendee(
					date,
					attendeeName,
					userId
				);
				return res.status(200).send("Attendee removed successfully");
			} catch (err: unknown) {
				if (err instanceof DateNotFoundError)
					return res.status(404).send(err.message);
				if (err instanceof AttendeeNotFoundError)
					return res.status(404).send(err.message);

				console.error(err);
				return res.status(500).send((err as Error).message);
			}
		}
	);

	router.get(
		"/stats/:recordType/count",
		validationMiddleware(recordTypeSchema, "params"),
		async (req: Request, res: Response) => {
			const recordType = String(req.params.recordType);
			const userId = Number(req.userId);

			try {
				const result = await AttendeeService.getAttendeeNameWithCount(
					recordType,
					userId
				);

				return res.status(200).send(result);
			} catch (err: unknown) {
				console.error(err);
				return res.status(500).send((err as Error).message);
			}
		}
	);

	return router;
};

export default attendeeRouter;
