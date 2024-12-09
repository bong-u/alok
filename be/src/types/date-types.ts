interface Record {
	id: number;
}

interface DateAttendee {
	dateId: number;
	attendeeId: number;
}

export interface DateAndRecords {
	id: number;
	records: Record[];
}

export interface DateAndAttendees {
	id: number;
	dateAttendees: DateAttendee[];
}
