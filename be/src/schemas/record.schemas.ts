import Joi from "joi";

const recordTypeValues = ["soju", "beer"] as const;

export const recordTypeSchema = Joi.object({
	recordType: Joi.string()
		.valid(...recordTypeValues)
		.required(),
});

export const getRecordsSchema = Joi.object({
	year: Joi.number().required(),
	month: Joi.number(),
	userId: Joi.number(),
});

export const updateOrDeleteRecordSchema = Joi.object({
	date: Joi.string().isoDate().required(),
	recordType: Joi.string()
		.valid(...recordTypeValues)
		.required(),
});

export const recordSchema = Joi.object({
	date: Joi.string().isoDate().required(),
	recordType: Joi.string()
		.valid(...recordTypeValues)
		.required(),
	amount: Joi.number()
		.valid(0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5)
		.required(),
});
