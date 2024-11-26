import React, { useState, useEffect, useCallback } from "react";
import { useParams, useLocation } from "react-router-dom";
import MyCalendar from "../components/MyCalendar";
import RecordIcon from "../components/RecordIcon";
import { RecordType, RecordsByPeriod } from "../types";
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
	return (
		<div className="calendar">
			<h1 className="has-text-centered has-text-weight-bold my-3">
				{username}의 이번 달 기록
			</h1>

			<MyCalendar
				records={records}
				tileContent={getTileContent}
				onClickDay={() => { }}
				activeStartDate={activeDate}
				onActiveStartDateChange={() => { }}
				showNavigation={false}
				tileDisabled={() => true}
			/>
		</div>
	);
};

export default UserCalendarPage;
