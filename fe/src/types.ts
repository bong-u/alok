export type RecordType = "soju" | "beer";

export interface Record {
	recordType: RecordType;
	amount: number;
}

export interface RecordsByPeriod {
	[period: string]: Record[];
}

export interface User {
	id: number;
	username: string;
}

export const RecordTypeInfo: {
	[key in RecordType]: { korName: string; unit: string; color: string };
} = {
	soju: { korName: "소주", unit: "병", color: "green" },
	beer: { korName: "맥주", unit: "잔", color: "brown" },
};

export interface Attendee {
	id: number;
	name: string;
}

export const enum View {
	MONTH = "month",
	YEAR = "year",
}

