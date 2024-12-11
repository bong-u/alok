import React from "react";
import { Calendar } from "react-calendar";
import "react-calendar/dist/Calendar.css";
import "../css/Calendar.css";
import { RecordsByPeriod } from "../types";

interface MyCalendarProps {
	records: RecordsByPeriod;
	tileContent: (args: { date: Date; view: string }) => React.ReactNode;
	onClickDay: (value: Date) => void;
	activeStartDate: Date;
	onActiveStartDateChange: (args: {
		action: string;
		activeStartDate: Date | null;
		value: any;
		view: string;
	}) => void;
	showNavigation?: boolean;
	tileDisabled?: (args: { date: Date }) => boolean;
}

const MyCalendar: React.FC<MyCalendarProps> = ({
	records,
	tileContent,
	onClickDay,
	activeStartDate,
	onActiveStartDateChange,
	showNavigation = true,
	tileDisabled = () => false,
}) => {
	return (
		<Calendar
			locale="ko-KR"
			calendarType="gregory"
			formatDay={(locale, date) => date.getDate().toString()}
			minDetail="year"
			showNeighboringMonth={false}
			tileContent={tileContent}
			onClickDay={onClickDay}
			activeStartDate={activeStartDate}
			onActiveStartDateChange={onActiveStartDateChange}
			showNavigation={showNavigation}
			prevLabel="◀"
			nextLabel="▶"
		/>
	);
};

export default MyCalendar;
