import { Router, Request, Response } from "express";
import AttendeeService from "../services/attendee-service";
import RecordService from "../services/record-service";
import validationMiddleware from "../middlewares/validation-middleware";

const attendeeRouter = () => {
	const router = Router();

	router.post("/:attendeeName", async (req: any, res: Response) => {
		const { attendeeName } = req.params;
		const recordId = Number(req.query.recordId);

		const record = await RecordService.getRecordById(recordId, req.userId);

		if (!record) {
			res.status(404).send("Record not found");
			return;
		}

		try {
			let attendee = await AttendeeService.getAttendeeByName(
				attendeeName,
				req.userId
			);

			if (!attendee) {
				attendee = await AttendeeService.createAttendee(
					attendeeName,
					req.userId
				);
			}

			await AttendeeService.addAttendeeToRecord(attendee.id, record.id);
			res.status(200).send("Attendee added successfully");
		} catch (err: any) {
			console.error(err);
			res.status(500).send(err.message);
		}
	});

	router.get("/", async (req: any, res: Response) => {
		try {
			const attendees = await AttendeeService.getFriendNames(req.userId);
			res.status(200).send(attendees);
		} catch (err: any) {
			console.error(err);
			res.status(500).send(err.message);
		}
	});

	router.delete("/:attendeeName", async (req: any, res: Response) => {
		const { attendeeName } = req.params;
		const recordId = Number(req.query.recordId);
		try {
			const record = await RecordService.getRecordById(
				recordId,
				req.userId
			);
			if (!record) {
				res.status(404).send("Record not found");
				return;
			}

			const attendee = (
				await AttendeeService.getAttendeesByRecordId(recordId)
			).find((attendee) => attendee.name === attendeeName);

			if (!attendee) {
				res.status(404).send("Attendee not found");
				return;
			}

			// 삭제 후에 다른 record와 관계가 있는 경우
			if (
				(await AttendeeService.getAttendedRecords(attendee.id)).length >
				1
			) {
				await AttendeeService.deleteAttendeeInRecord(
					attendee.id,
					record.id
				);
			} else {
				await AttendeeService.deleteAttendee(attendee.id);
			}

			res.status(200).send("Attendee deleted successfully");
		} catch (err: any) {
			console.error(err);
			res.status(500).send(err.message);
		}
	});

	return router;
};

export default attendeeRouter;
