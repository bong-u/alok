import React, { useState, useEffect, useCallback } from "react";
import MyCalendar from "../components/MyCalendar";
import { getRecordElements } from "../components/RecordElement";
import ManageRecordModal from "../components/ManageRecordModal";
import { RecordsByPeriod, View } from "../types";
import api from "../api";

const MyCalendarPage: React.FC = () => {
	const [records, setRecords] = useState<RecordsByPeriod>({});
	const [selectedDate, setSelectedDate] = useState<string | null>(null);
	const [activeDate, setActiveDate] = useState<Date>(new Date());
	const [touchStartX, setTouchStartX] = useState<number | null>(null);

	const fetchRecords = useCallback(
		async (date: Date, currentView: View = View.MONTH) => {
			if (currentView === View.MONTH) fetchRecordsByMonth(date);
			if (currentView === View.YEAR) fetchRecordsByYear(date);
		},
		[]
	);

	useEffect(() => {
		fetchRecords(new Date());
	}, [fetchRecords]);

	const fetchRecordsByMonth = async (activeStartDate: Date) => {
		const year = activeStartDate.getFullYear();
		const month = activeStartDate.getMonth() + 1;

		try {
			const response = await api.get<RecordsByPeriod>(
				`/records/${year}/${month}`
			);
			setRecords(response.data);
		} catch (error: any) {
			sessionStorage.setItem("error", error);
			window.location.href = "/error";
		}
	};

	const fetchRecordsByYear = async (activeStartDate: Date) => {
		const year = activeStartDate.getFullYear();

		try {
			const response = await api.get<RecordsByPeriod>(`/records/${year}`);
			setRecords(response.data);
		} catch (error: any) {
			sessionStorage.setItem("error", error);
			window.location.href = "/error";
		}
	};

	const getTileContent = ({ date, view }: { date: Date; view: string }) => {
		// 날짜 비교를 위해 Date -> String 형식으로 변환
		const stringDate = date.toLocaleDateString("en-CA");
		const formattedDate =
			view === "year"
				? stringDate.slice(0, 7) // 연도-월 형식으로 변환
				: stringDate;

		if (formattedDate in records) {
			return getRecordElements(
				formattedDate,
				records[formattedDate],
				view as View
			);
		}

		return null;
	};

	const handleClickDay = async (value: Date) => {
		const date = value.toLocaleDateString("en-CA");

		setSelectedDate(date);
	};

	// 터치 시작 시 X 좌표 저장
	const handleTouchStart = (e: React.TouchEvent) => {
		setTouchStartX(e.touches[0].clientX);
	};

	// 터치 종료 시 스와이프 감지
	const handleTouchEnd = (e: React.TouchEvent) => {
		if (touchStartX === null) return;

		const touchEndX = e.changedTouches[0].clientX;
		const deltaX = touchStartX - touchEndX;

		if (deltaX > 50) {
			// 왼쪽 스와이프 -> 다음 달
			handleActiveStartDateChange({
				activeStartDate: new Date(
					activeDate.setMonth(activeDate.getMonth() + 1)
				),
				view: "month",
			});
		} else if (deltaX < -50) {
			// 오른쪽 스와이프 -> 이전 달
			handleActiveStartDateChange({
				activeStartDate: new Date(
					activeDate.setMonth(activeDate.getMonth() - 1)
				),
				view: "month",
			});
		}

		setTouchStartX(null);
	};

	const handleActiveStartDateChange = ({
		activeStartDate,
		view,
	}: {
		activeStartDate: Date | null;
		view: string;
	}) => {
		activeStartDate && setActiveDate(activeStartDate);
		fetchRecords(activeStartDate as Date, view as View);
	};

	return (
		<div
			className="box wide"
			onTouchStart={handleTouchStart}
			onTouchEnd={handleTouchEnd}
		>
			{selectedDate && (
				<ManageRecordModal
					selectedDate={selectedDate}
					records={records[selectedDate || ""]}
					onClose={() => {
						setSelectedDate(null);
						fetchRecordsByMonth(activeDate);
					}}
				/>
			)}
			<MyCalendar
				tileContent={getTileContent}
				onClickDay={handleClickDay}
				activeStartDate={activeDate}
				onActiveStartDateChange={handleActiveStartDateChange}
			/>
		</div>
	);
};

export default MyCalendarPage;
