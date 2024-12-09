import { Request, Router, Response } from "express";
import AttendeeService from "../services/attendee-service";
import DateService from "../services/date-service";
import { DateNotFoundError, AttendeeNotFoundError } from "../exceptions";
import validationMiddleware from "../middlewares/validation-middleware";
import {
	createAttendeeSchema,
	getAttendeeSchema,
	deleteAttendeeSchema,
} from "../schemas/attendee-schemas";

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
				let attendee;
				try {
					attendee = await AttendeeService.getAttendeeByName(
						attendeeName,
						userId
					);
				} catch (err: unknown) {
					if (err instanceof AttendeeNotFoundError) {
						attendee = await AttendeeService.createAttendee(
							attendeeName,
							userId
						);
					} else {
						throw err;
					}
				}
				const dateObj = await DateService.getDateAndAttendees(
					date,
					userId
				);

				if (dateObj.dateAttendees.length >= 5) {
					res.status(403).send(
						"5명 이상의 참여자를 추가할 수 없습니다."
					);
					return;
				}
				if (
					await AttendeeService.isAttended(attendee!.id, dateObj.id)
				) {
					res.status(409).send("이미 추가된 참여자입니다.");
					return;
				}
				await AttendeeService.connectAttendeeToDate(
					attendee!.id,
					dateObj.id
				);
				res.status(200).send("Attendee added successfully");
			} catch (err: unknown) {
				if (err instanceof DateNotFoundError) {
					res.status(404).send(err.message);
					return;
				}
				console.error(err);
				res.status(500).send((err as Error).message);
			}
		}
	);

	router.get("/", async (req: Request, res: Response) => {
		const userId = Number(req.userId);
		try {
			const attendees = await AttendeeService.getFriends(userId);
			res.status(200).send(attendees);
		} catch (err: unknown) {
			console.error(err);
			res.status(500).send((err as Error).message);
		}
	});

	router.get(
		"/:date",
		validationMiddleware(getAttendeeSchema, "params"),
		async (req: Request, res: Response) => {
			const date = String(req.params.date);
			const userId = Number(req.userId);

			try {
				const dateId = await DateService.getDateId(date);
				const attendees = await AttendeeService.getAttendeesByDateId(
					dateId,
					userId
				);
				res.status(200).send(attendees);
			} catch (err: unknown) {
				if (err instanceof DateNotFoundError) {
					res.status(200).send([]);
					return;
				}
				console.error(err);
				res.status(500).send((err as Error).message);
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
				const [attendee, dateId] = await Promise.all([
					AttendeeService.getAttendeeByName(attendeeName, userId),
					DateService.getDateId(date),
				]);

				// 참여자가 없는 경우
				if (await AttendeeService.isAttended(dateId, attendee.id)) {
					throw new AttendeeNotFoundError();
				}

				await AttendeeService.deleteAttendee(attendee.id);
				res.status(200).send("Attendee removed successfully");
			} catch (err: unknown) {
				if (err instanceof DateNotFoundError) {
					res.status(404).send(err.message);
					return;
				}
				if (err instanceof AttendeeNotFoundError) {
					res.status(404).send(err.message);
					return;
				}
				console.error(err);
				res.status(500).send((err as Error).message);
			}
		}
	);

	return router;
};

export default attendeeRouter;
