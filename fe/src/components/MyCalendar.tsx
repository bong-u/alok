import React from "react";
import { Calendar } from "react-calendar";
import "react-calendar/dist/Calendar.css";
import "../css/Calendar.css";

interface MyCalendarProps {
	tileContent: (args: { date: Date; view: string }) => React.ReactNode;
	activeStartDate: Date;
	showNavigation?: boolean;
	tileDisabled?: (args: { date: Date }) => boolean;
	onViewChange?: (args: { view: string }) => void;
	onClickDay?: (value: Date) => void;
	onActiveStartDateChange?: (args: {
		activeStartDate: Date | null;
		view: string;
	}) => void;
}

const MyCalendar: React.FC<MyCalendarProps> = ({
	tileContent,
	activeStartDate,
	showNavigation = true,
	tileDisabled = () => false,
	onViewChange = () => {},
	onClickDay = () => {},
	onActiveStartDateChange = () => {},
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
			tileDisabled={tileDisabled}
			onViewChange={onViewChange}
		/>
	);
};

export default MyCalendar;
