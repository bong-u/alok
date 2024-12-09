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
