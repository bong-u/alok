import React, { useState, useEffect } from "react";
import { PieChart, Pie, Tooltip, ResponsiveContainer } from "recharts";
import { AttendeeNameWithCount } from "../types";
import api from "../api";

const MyStatsPage: React.FC = () => {
	const [attendeeNameWithCount, setAttendeeNameWithCount] = useState<
		AttendeeNameWithCount[]
	>([]);

	useEffect(() => {
		const fetchAttendeeNameWithCount = async () => {
			try {
				const response = await api.get("/attendees/stats/soju/count");
				console.log(response.data);
				setAttendeeNameWithCount(response.data);
			} catch (error: any) {
				sessionStorage.setItem("error", error);
				window.location.href = "/error";
			}
		};

		fetchAttendeeNameWithCount();
	}, []);

	return (
		<div className="container box wide">
			<h2 className="subtitle has-text-centered">자주 참여한 인물</h2>
			<div
				className="is-flex is-justify-content-center"
				style={{ height: "250px" }}
			>
				<ResponsiveContainer width="100%" height="100%">
					<PieChart>
						<Pie
							data={attendeeNameWithCount}
							dataKey="count"
							cx="50%"
							cy="50%"
							outerRadius={80}
							fill="#116D6E"
							label={({ name, value }) => `${name}(${value})`}
						/>
						<Tooltip />
					</PieChart>
				</ResponsiveContainer>
			</div>
		</div>
	);
};

export default MyStatsPage;
