export interface DateAttendeeDTO {
	dateId: number;
	attendeeId: number;
}

export interface DateDTO {
	id: number;
	date: string;
}

interface Record {
	id: number;
}

export interface DateAndRecords {
	id: number;
	records: Record[];
}

export interface DateAndAttendees {
	id: number;
	dateAttendees: DateAttendeeDTO[];
}
