import { Router, Response } from "express";
import AttendeeService from "../services/attendee-service";
import DateService from "../services/date-service";
import { DateNotFoundError, AttendeeNotFoundError } from "../exceptions";

const attendeeRouter = () => {
	const router = Router();

	router.post("/:date/:attendeeName", async (req: any, res: Response) => {
		const { date, attendeeName } = req.params;
		const userId = Number(req.userId);

		try {
			let attendee;
			try {
				attendee = await AttendeeService.getAttendeeByName(
					attendeeName,
					userId
				);
			} catch (err: any) {
				if (err instanceof AttendeeNotFoundError) {
					attendee = await AttendeeService.createAttendee(
						attendeeName,
						userId
					);
				} else {
					throw err;
				}
			}
			const dateId = await DateService.getDateId(date);

			if (await AttendeeService.isAttended(attendee!.id, dateId)) {
				res.status(409).send("Attendee already added");
				return;
			}
			await AttendeeService.connectAttendeeToDate(attendee!.id, dateId);
			res.status(200).send("Attendee added successfully");
		} catch (err: any) {
			if (err instanceof DateNotFoundError) {
				res.status(404).send(err.message);
				return;
			}
			console.error(err);
			res.status(500).send(err.message);
		}
	});

	router.get("/", async (req: any, res: Response) => {
		const userId = Number(req.userId);
		try {
			const attendees = await AttendeeService.getFriends(userId);
			res.status(200).send(attendees);
		} catch (err: any) {
			console.error(err);
			res.status(500).send(err.message);
		}
	});

	router.get("/:date", async (req: any, res: Response) => {
		const { date } = req.params;
		const userId = Number(req.userId);

		try {
			const dateId = await DateService.getDateId(date);
			const attendees = await AttendeeService.getAttendeesByDateId(
				dateId,
				userId
			);
			res.status(200).send(attendees);
		} catch (err: any) {
			if (err instanceof DateNotFoundError) {
				res.status(404).send(err.message);
				return;
			}
			console.error(err);
			res.status(500).send(err.message)
		}
	});

	router.delete("/:date/:attendeeName", async (req: any, res: Response) => {
		const { date, attendeeName } = req.params;
		const userId = Number(req.userId);

		try {
			const attendee = await AttendeeService.getAttendeeByName(
				attendeeName,
				userId
			);
			const dateId = await DateService.getDateId(date);

			if (await AttendeeService.isAttended(dateId, attendee.id)) {
				throw new AttendeeNotFoundError();
			}

			await AttendeeService.deleteAttendee(attendee.id);
			res.status(200).send("Attendee removed successfully");
		} catch (err: any) {
			if (err instanceof DateNotFoundError) {
				res.status(404).send(err.message);
				return;
			}
			if (err instanceof AttendeeNotFoundError) {
				res.status(404).send(err.message);
				return;
			}
			console.error(err);
			res.status(500).send(err.message);
		}
	});

	return router;
};

export default attendeeRouter;
