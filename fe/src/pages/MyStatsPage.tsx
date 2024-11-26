import React, { useState, useEffect } from "react";
import {
	LineChart,
	Line,
	XAxis,
	YAxis,
	CartesianGrid,
	Tooltip,
	Legend,
	ResponsiveContainer,
} from "recharts";
import { RecordsByPeriod, RecordTypeInfo } from "../types";
import api from "../api";

const MyStatsPage: React.FC = () => {
	const [recordsByMonth, setRecordsByMonth] = useState<RecordsByPeriod>({});

	useEffect(() => {
		const fetchRecordsByYear = async (activeStartDate: Date) => {
			const year = activeStartDate.getFullYear();

			try {
				const response = await api.get<RecordsByPeriod>(
					`/records/${year}`
				);
				setRecordsByMonth(response.data);
			} catch (error: any) {
				sessionStorage.setItem("error", error);
				window.location.href = "/error";
			}
		};

		fetchRecordsByYear(new Date());
	}, []);

	// 데이터를 그래프용 형식으로 변환
	const chartData = Object.entries(recordsByMonth).map(([month, records]) => {
		const dataEntry: any = { month };
		records.forEach((record) => {
			dataEntry[record.recordType] = record.amount;
		});
		return dataEntry;
	});

	return (
		<div className="container box wide">
			<h2 className="subtitle has-text-centered">월별 통계</h2>
			<div
				className="is-flex is-justify-content-center"
				style={{ height: "200px" }}
			>
				<ResponsiveContainer width="100%">
					<LineChart
						data={chartData}
						margin={{ top: 5, right: 30, bottom: 5, left: 0 }}
					>
						<CartesianGrid strokeDasharray="3 3" />
						<XAxis
							dataKey="month"
							interval={0}
							tickFormatter={(month) => {
								// ex) "2024-10" -> "10월"
								const [, monthNumber] = month.split("-");
								return `${parseInt(monthNumber, 10)}월`;
							}}
						/>
						<YAxis width={30} />
						<Tooltip />
						<Legend />
						{Object.entries(RecordTypeInfo).map(
							([recordType, { korName, color }]) => (
								<Line
									key={recordType}
									dataKey={recordType}
									stroke={color}
									name={korName}
								/>
							)
						)}
					</LineChart>
				</ResponsiveContainer>
			</div>
		</div>
	);
};

export default MyStatsPage;
