import Joi from "joi";

export const recordTypeValues = ["soju", "beer"] as const;
type RecordType = (typeof recordTypeValues)[number];

export interface BaseRecord {
	recordType: RecordType;
	amount: number;
}

export interface DailyRecord extends BaseRecord {
	id: number;
	date: string;
}

export interface MonthlyRecord extends BaseRecord {
	month: string;
}

export interface RecordsGroupedByPeriod {
	[period: string]: BaseRecord[];
}

export const getRecordsSchema = Joi.object({
	year: Joi.number().required(),
	month: Joi.number(),
	userId: Joi.number()
});

export const deleteRecordRequestSchema = Joi.object({
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
