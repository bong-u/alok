import React, { useState, useEffect } from "react";
import MyCalendar from "../components/MyCalendar";
import RecordIcon from "../components/RecordIcon";
import ManageRecordModal from "../components/ManageRecordModal";
import { RecordType, RecordsByPeriod } from "../types";
import api from "../api";

const enum LastAction {
	PREV = "prev",
	NEXT = "next",
	DRILL_UP = "drillUp",
	DRILL_DOWN = "drillDown",
}

const MyCalendarPage: React.FC = () => {
	const [records, setRecords] = useState<RecordsByPeriod>({});
	const [selectedDate, setSelectedDate] = useState<string | null>(null);
	const [activeDate, setActiveDate] = useState<Date>(new Date());
	const [lastAction, setLastAction] = useState<LastAction | null>(null);
	const [touchStartX, setTouchStartX] = useState<number | null>(null);

	useEffect(() => {
		if (
			lastAction === null ||
			lastAction === LastAction.PREV ||
			LastAction.DRILL_DOWN
		) {
			fetchRecordsByMonth(activeDate);
		} else if (lastAction === LastAction.NEXT || LastAction.DRILL_UP) {
			fetchRecordsByYear(activeDate);
		}
	}, [activeDate, lastAction]);

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

	const getTileContent = ({ date }: { date: Date }) => {
		// 날짜 비교를 위해 Date -> String 형식으로 변환
		const stringDate = date.toLocaleDateString("en-CA");
		const formattedDate =
			lastAction === LastAction.DRILL_UP
				? stringDate.slice(0, 7) // 연도-월 형식으로 변환
				: stringDate;

		if (formattedDate in records) {
			return (
				<div key={formattedDate}>
					{records[formattedDate].map((record, index) => (
						<div key={index}>
							{getRecordElement(record.recordType, record.amount)}
						</div>
					))}
				</div>
			);
		}

		return null;
	};

	const getRecordElement = (recordType: RecordType, amount: number) => {
		const elements = [];

		if (amount === 0 || amount % 0.5 !== 0)
			throw new Error(`${amount} is not a valid amount`);

		// 한병(정수) 처리
		for (let i = 0; i < Math.floor(amount); i++) {
			elements.push(<RecordIcon key={i} recordType={recordType} />);
		}
		// 반병 처리
		if (amount % 1 !== 0) {
			elements.push(
				<RecordIcon key={0.5} recordType={recordType} isHalf />
			);
		}

		return elements;
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
			setActiveDate(
				new Date(activeDate.setMonth(activeDate.getMonth() + 1))
			);
		} else if (deltaX < -50) {
			// 오른쪽 스와이프 -> 이전 달
			setActiveDate(
				new Date(activeDate.setMonth(activeDate.getMonth() - 1))
			);
		}

		setTouchStartX(null);
	};

	const handleActiveStartDateChange = ({
		action,
		activeStartDate,
		value,
		view,
	}: {
		action: string;
		activeStartDate: Date | null;
		value: Date | Date[] | null;
		view: string;
	}) => {
		if (!activeStartDate || !action) return;
		setActiveDate(activeStartDate);
		setLastAction(action as LastAction);
	};

	return (
		<div
			className="calendar box wide"
			onTouchStart={handleTouchStart}
			onTouchEnd={handleTouchEnd}
		>
			<ManageRecordModal
				selectedDate={selectedDate}
				records={records[selectedDate || ""]}
				onClose={() => {
					setSelectedDate(null);
					fetchRecordsByMonth(activeDate);
				}}
			/>
			<MyCalendar
				records={records}
				tileContent={getTileContent}
				onClickDay={handleClickDay}
				activeStartDate={activeDate}
				onActiveStartDateChange={handleActiveStartDateChange}
			/>
		</div>
	);
};

export default MyCalendarPage;
