import React, { useState, useEffect, useCallback } from "react";
import { useParams, useLocation } from "react-router-dom";
import MyCalendar from "../components/MyCalendar";
import { getRecordElements } from "../components/RecordElement";
import { RecordsByPeriod } from "../types";
import api from "../api";

const UserCalendarPage: React.FC = () => {
	const userId = useParams<{ userId: string }>().userId;
	const { username } = useLocation().state as { username: string };
	const [records, setRecords] = useState<RecordsByPeriod>({});
	const [activeDate] = useState<Date>(new Date());

	const fetchRecordsByMonth = useCallback(
		async (activeStartDate: Date) => {
			const year = activeStartDate.getFullYear();
			const month = activeStartDate.getMonth() + 1;

			try {
				const response = await api.get<RecordsByPeriod>(
					`/records/${year}/${month}/user/${userId}`
				);
				setRecords(response.data);
			} catch (error: any) {
				sessionStorage.setItem("error", error);
				window.location.href = "/error";
			}
		},
		[userId]
	);

	useEffect(() => {
		fetchRecordsByMonth(activeDate);
	}, [activeDate, fetchRecordsByMonth]);

	const getTileContent = ({ date }: { date: Date }) => {
		// 날짜 비교를 위해 Date -> String 형식으로 변환
		const stringDate = date.toLocaleDateString("en-CA");
		const formattedDate = stringDate;

		if (formattedDate in records) {
			return getRecordElements(formattedDate, records[formattedDate]);
		}

		return null;
	};
	return (
		<div className="calendar">
			<h1 className="has-text-centered has-text-weight-bold my-3">
				{username}의 이번 달 기록
			</h1>

			<MyCalendar
				tileContent={getTileContent}
				activeStartDate={activeDate}
				showNavigation={false}
				tileDisabled={() => true}
			/>
		</div>
	);
};

export default UserCalendarPage;
