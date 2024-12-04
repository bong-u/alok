import Joi from "joi";

export const createAttendeeNameSchema = Joi.object({
	attendeeName: Joi.string().min(1).max(50).required(),
});

export const recordIdSchema = Joi.object({
	recordId: Joi.number().required(),
});

export interface AttendeeResponse {
	id: number;
	name: string;
}

