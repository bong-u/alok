import Joi from "joi";

export const createAttendeeSchema = Joi.object({
	date: Joi.date().required(),
	attendeeName: Joi.string().min(1).max(50).required(),
});

export const deleteAttendeeSchema = createAttendeeSchema;

export const getAttendeeSchema = Joi.object({
	date: Joi.date().required(),
});

export const recordIdSchema = Joi.object({
	recordId: Joi.number().required(),
});
