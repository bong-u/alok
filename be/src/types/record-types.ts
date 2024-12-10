export const recordTypeValues = ["soju", "beer"] as const;
type RecordType = (typeof recordTypeValues)[number];

interface BaseRecord {
	recordType: RecordType;
	amount: number;
}

export interface RecordWithDate {
	id: number;
	amount: number;
	recordType: string;
	date: {
		date: string;
	};
}

export interface RecordDTO extends BaseRecord {
	id: number;
}

export interface MonthlyRecord extends BaseRecord {
	month: string;
}

export interface RecordsGroupedByPeriod {
	[period: string]: BaseRecord[];
}
